import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlarmClock, ArrowLeft, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  gesamtpunkteVon,
  maxPunkteVon,
  notenstufe,
  persistAttemptFinish,
  submitExamFlow,
  upsertSelfGrade,
  type Frage,
  type PruefungResults,
} from "@/lib/exam-flow";

export const Route = createFileRoute("/_authenticated/probepruefungen")({
  head: () => ({
    meta: [
      { title: "Probeprüfungen – AP1 Trainer" },
      {
        name: "description",
        content: "Probeprüfungen unter Echtzeit-Bedingungen mit KI-Bewertung.",
      },
    ],
  }),
  component: ProbepruefungenPage,
});

const EXAMS = ["probepruefung_01", "probepruefung_02", "probepruefung_03"] as const;
const EXAM_TITLES: Record<string, string> = {
  probepruefung_01: "Probeprüfung 1 · wahrscheinlichste Aufgaben",
  probepruefung_02: "Probeprüfung 2 · realistische Mischung",
  probepruefung_03: "Probeprüfung 3 · über dem Niveau",
};
const PRUEFUNG_DAUER_S = 90 * 60;

interface Attempt {
  id: string;
  exam_id: string | null;
  started_at: string;
  gesamtpunkte: number | null;
}

type Phase = "auswahl" | "modus" | "ergebnis";

/** Inline-Renderer (escaped) für Frage-HTML aus der DB. */
function EscapedHtml({ src, className }: { src: string | null; className?: string }) {
  src = src ?? "";
  const html = useMemo(() => {
    const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc
      .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 font-mono text-xs">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\n/g, "<br>");
  }, [src]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function ProbepruefungenPage() {
  const [phase, setPhase] = useState<Phase>("auswahl");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [fragen, setFragen] = useState<Frage[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<PruefungResults>({});
  const [restS, setRestS] = useState(PRUEFUNG_DAUER_S);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [statusByExam, setStatusByExam] = useState<Record<string, string>>({});

  // Status der Prüfungen laden
  useEffect(() => {
    if (phase !== "auswahl") return;
    supabase
      .from("exam_attempts")
      .select("exam_id, gesamtpunkte, finished_at")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        for (const row of data ?? []) {
          const eid = row.exam_id ?? "";
          map[eid] = row.finished_at
            ? `abgeschlossen · ${row.gesamtpunkte ?? 0} P`
            : "in Bearbeitung";
        }
        setStatusByExam(map);
      });
  }, [phase]);

  // Timer
  const submitRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    if (phase !== "modus") return;
    const t = setInterval(() => {
      setRestS((s) => {
        if (s <= 1) {
          clearInterval(t);
          // Abschluss über die aktuelle submitExam-Instanz — kein stale
          // closure; der Submit-Guard verhindert eine zweite Ausführung.
          void submitRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const start = async (examId: string) => {
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error: e } = await supabase
      .from("exam_attempts")
      .insert({ exam_id: examId, user_id: userData.user.id })
      .select("id, exam_id, started_at, gesamtpunkte")
      .single();
    if (e || !data) {
      setError(e?.message ?? "Attempt konnte nicht angelegt werden.");
      return;
    }
    const { data: fr, error: fe } = await supabase
      .from("exam_questions")
      .select("id, aufgabe_nr, teil, frage, max_punkte, musterloesung, intro, ausgangssituation")
      .eq("exam_id", examId)
      .order("aufgabe_nr")
      .order("teil");
    if (fe || !fr?.length) {
      setError(fe?.message ?? "Keine Fragen geladen.");
      return;
    }
    setAttempt(data);
    setFragen(fr);
    setAnswers({});
    setResults({});
    setRestS(PRUEFUNG_DAUER_S);
    setPhase("modus");
  };

  /** Edge-Function-Aufruf — von React-State entkoppelt, testbar. */
  const callGrade = useCallback(
    async (input: { question_id: string; attempt_id: string; antworttext: string }) => {
      const { data: session } = await supabase.auth.getSession();
      const jwt = session.session?.access_token;
      const res = await fetch(
        (import.meta.env as Record<string, string>)["VITE_SUPABASE_URL"] +
          "/functions/v1/grade-exam-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(jwt ? { Authorization: "Bearer " + jwt } : {}),
          },
          body: JSON.stringify(input),
        },
      );
      if (!res.ok) {
        // 429 (KI-Tageslimit) liefert eine verständliche Fehlermeldung im Body.
        const errBody = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errBody?.error ?? "grade-exam-answer: HTTP " + res.status);
      }
      return (await res.json()) as { punkte: number | null; begruendung?: string };
    },
    [],
  );

  /**
   * Abschlusslogik: bewertet zuerst alles deterministisch (unabhängig von
   * React-State), berechnet die Summe aus dem Ergebniswert und persistiert
   * erst danach. Der Guard stellt sicher, dass Timeout und manueller
   * Abgabe-Button denselben Abschluss nur genau einmal auslösen.
   */
  const submitExam = useCallback(async () => {
    if (!attempt || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const { results: graded } = await submitExamFlow({
        fragen,
        answers,
        attemptId: attempt.id,
        callGrade,
        persist: (gesamtpunkte) => persistAttemptFinish(supabase, attempt.id, gesamtpunkte),
      });
      setResults(graded);
      setPhase("ergebnis");
    } catch (e) {
      // Persist-Fehler (update oder Upsert) sichtbar machen statt still in
      // die Ergebnis-Ansicht zu laufen.
      setError(e instanceof Error ? e.message : "Abgabe konnte nicht gespeichert werden.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [attempt, fragen, answers, callGrade]);

  useEffect(() => {
    submitRef.current = submitExam;
  }, [submitExam]);

  const abgeben = submitExam;

  const aufgaben = useMemo(() => {
    const byNr = new Map<number, Frage[]>();
    for (const f of fragen) {
      const nr = f.aufgabe_nr ?? 0;
      const arr = byNr.get(nr) ?? [];
      arr.push(f);
      byNr.set(nr, arr);
    }
    return [...byNr.entries()].sort((a, b) => a[0] - b[0]);
  }, [fragen]);
  const ausgang = fragen[0]?.ausgangssituation ?? null;

  // ---------- Auswahl ----------
  if (phase === "auswahl") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pt-4 md:pt-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Probeprüfungen</h1>
          <p className="text-sm text-muted-foreground">
            90 Minuten, Bedrock bewertet nach Musterlösung. Ergebnisse landen im Fehlerlog.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </header>
        <section className="space-y-2">
          {EXAMS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => start(id)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
            >
              <div>
                <p className="font-medium text-foreground">{EXAM_TITLES[id]}</p>
                <p className="text-xs text-muted-foreground">
                  {statusByExam[id] ?? "noch nicht begonnen"}
                </p>
              </div>
              <Play className="size-4 text-primary" />
            </button>
          ))}
        </section>
      </div>
    );
  }

  // ---------- Ergebnis ----------
  if (phase === "ergebnis" && attempt) {
    const gesamtpunkte = gesamtpunkteVon(fragen, results);
    const maxP = maxPunkteVon(fragen);
    const n = notenstufe(Math.round((100 * gesamtpunkte) / Math.max(1, maxP)));
    return (
      <div className="mx-auto max-w-3xl space-y-6 pt-4 md:pt-8">
        <Button variant="ghost" onClick={() => setPhase("auswahl")} className="pl-0">
          <ArrowLeft className="mr-1.5 size-4" /> Alle Prüfungen
        </Button>
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {EXAM_TITLES[attempt.exam_id ?? ""] ?? "Probeprüfung"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {gesamtpunkte} / {maxP} Punkte · Note{" "}
            <span className="font-semibold text-foreground">{n}</span>
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </header>
        <section className="space-y-4">
          {fragen.map((f) => (
            <article key={f.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {f.aufgabe_nr}
                  {f.teil} · {f.max_punkte ?? 0} P
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {results[f.id]?.punkte ?? 0} / {f.max_punkte}
                </span>
              </div>
              <EscapedHtml src={f.frage} className="text-sm text-card-foreground" />
              {f.intro && <EscapedHtml src={f.intro} className="text-xs text-muted-foreground" />}
              <p className="text-xs text-muted-foreground">Eigene Antwort:</p>
              <p className="rounded-lg border border-border p-2 text-sm">
                {answers[f.id] || "(leer)"}
              </p>
              <p className="text-xs text-muted-foreground">Musterlösung:</p>
              <EscapedHtml
                src={f.musterloesung}
                className="rounded-lg border border-border p-2 text-xs text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">KI-Begründung:</p>
              <p className="text-sm text-card-foreground">{results[f.id]?.begruendung ?? "–"}</p>
              {results[f.id]?.punkte === null && (
                <SelfGrade
                  frage={f}
                  onSelfGrade={(id, p) => {
                    // Erst persistieren, dann State setzen — schlägt der
                    // Upsert fehl, bleibt die Selbsteinschätzung editierbar.
                    void (async () => {
                      try {
                        await upsertSelfGrade(supabase, {
                          attemptId: attempt.id,
                          questionId: id,
                          antworttext: answers[id] ?? "",
                          punkte: p,
                        });
                        setResults((prev) => ({
                          ...prev,
                          [id]: { punkte: p, begruendung: "Selbst eingeschätzt." },
                        }));
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
                      }
                    })();
                  }}
                />
              )}
            </article>
          ))}
        </section>
      </div>
    );
  }

  // ---------- Prüfungsmodus ----------
  const mm = String(Math.floor(restS / 60)).padStart(2, "0");
  const ss = String(restS % 60).padStart(2, "0");
  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4 md:pt-8">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-border bg-background/95 px-4 py-3 backdrop-blur">
        <span className="flex items-center gap-2 font-mono text-lg font-semibold text-foreground">
          <AlarmClock className="size-5 text-primary" />
          {mm}:{ss}
        </span>
        <Button type="button" onClick={abgeben} disabled={submitting}>
          {submitting ? "Bewertung läuft…" : "Prüfung abgeben"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {ausgang && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ausgangssituation
          </h2>
          <EscapedHtml src={ausgang} className="text-sm text-card-foreground" />
        </section>
      )}

      {aufgaben.map(([nr, teile]) => (
        <section key={nr} className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Aufgabe {nr}</h2>
          {teile[0]?.intro && (
            <EscapedHtml
              src={teile[0].intro}
              className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground"
            />
          )}
          {teile.map((f) => (
            <article key={f.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {nr}
                  {f.teil}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {f.max_punkte ?? 0} P
                </span>
              </div>
              <EscapedHtml src={f.frage} className="text-sm text-card-foreground" />
              <Input
                value={answers[f.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))}
                placeholder="Antwort…"
              />
              {results[f.id] && (
                <div className="space-y-1 rounded-lg border border-border p-2 text-xs">
                  <p className="font-semibold text-foreground">
                    {results[f.id]!.punkte === null
                      ? "KI nicht verfügbar"
                      : `${results[f.id]!.punkte} / ${f.max_punkte ?? 0} P`}
                  </p>
                  <p className="text-muted-foreground">{results[f.id]!.begruendung}</p>
                </div>
              )}
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

/** Fallback: Punkte selbst einschätzen, wenn die KI nicht antwortet. */
function SelfGrade({
  frage,
  onSelfGrade,
}: {
  frage: Frage;
  onSelfGrade: (id: string, punkte: number) => void;
}) {
  const [v, setV] = useState("");
  return (
    <div className="flex items-center gap-2 pt-1">
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={`Punkte selbst einschätzen (0…${frage.max_punkte})`}
        className="h-8 max-w-56 text-xs"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!v}
        onClick={() => {
          // Vor onSelfGrade auf endlichen Wert in [0, max_punkte] begrenzen —
          // derselbe validierte Wert geht in State und Upsert ein.
          const n = Number(v);
          if (!Number.isFinite(n)) return;
          const p = Math.min(frage.max_punkte ?? 0, Math.max(0, Math.round(n)));
          onSelfGrade(frage.id, p);
          setV("");
        }}
      >
        übernehmen
      </Button>
    </div>
  );
}
