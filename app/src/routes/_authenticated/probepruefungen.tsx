import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlarmClock, ArrowLeft, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

interface Frage {
  id: string;
  aufgabe_nr: number | null;
  teil: string | null;
  frage: string | null;
  max_punkte: number | null;
  musterloesung: string | null;
  intro: string | null;
  ausgangssituation: string | null;
}

interface Attempt {
  id: string;
  exam_id: string | null;
  started_at: string;
  gesamtpunkte: number | null;
}

type Phase = "auswahl" | "modus" | "ergebnis";

function note(p: number): { n: string; bestanden: boolean } {
  if (p >= 92) return { n: "1", bestanden: true };
  if (p >= 81) return { n: "2", bestanden: true };
  if (p >= 67) return { n: "3", bestanden: true };
  if (p >= 50) return { n: "4", bestanden: true };
  if (p >= 30) return { n: "5", bestanden: false };
  return { n: "6", bestanden: false };
}

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
  const [results, setResults] = useState<
    Record<string, { punkte: number | null; begruendung: string }>
  >({});
  const [restS, setRestS] = useState(PRUEFUNG_DAUER_S);
  const [busy, setBusy] = useState<string | null>(null);
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
  useEffect(() => {
    if (phase !== "modus") return;
    const t = setInterval(() => {
      setRestS((s) => {
        if (s <= 1) {
          clearInterval(t);
          setPhase("ergebnis");
          void finishExam();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const grade = useCallback(
    async (frage: Frage) => {
      if (!attempt) return;
      setBusy(frage.id);
      const { data: session } = await supabase.auth.getSession();
      const jwt = session.session?.access_token;
      try {
        const res = await fetch(
          (import.meta.env as Record<string, string>)["VITE_SUPABASE_URL"] +
            "/functions/v1/grade-exam-answer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(jwt ? { Authorization: "Bearer " + jwt } : {}),
            },
            body: JSON.stringify({
              question_id: frage.id,
              antworttext: answers[frage.id] ?? "",
              attempt_id: attempt.id,
            }),
          },
        );
        const body = await res.json();
        setResults((prev) => ({
          ...prev,
          [frage.id]: { punkte: body.punkte, begruendung: body.begruendung ?? "" },
        }));
      } catch {
        setResults((prev) => ({
          ...prev,
          [frage.id]: { punkte: null, begruendung: "KI-Bewertung nicht verfügbar." },
        }));
      } finally {
        setBusy(null);
      }
    },
    [attempt, answers],
  );

  const finishExam = useCallback(async () => {
    if (!attempt) return;
    const gesamtpunkte = fragen.reduce((a, f) => a + (results[f.id]?.punkte ?? 0), 0);
    await supabase
      .from("exam_attempts")
      .update({ gesamtpunkte, finished_at: new Date().toISOString() })
      .eq("id", attempt.id);
  }, [attempt, fragen, results]);

  const abgeben = async () => {
    // alle offenen Teilaufgaben bewerten lassen
    for (const f of fragen) {
      if (results[f.id] === undefined) await grade(f);
    }
    await finishExam();
    setPhase("ergebnis");
  };

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
    const gesamtpunkte = fragen.reduce((a, f) => a + (results[f.id]?.punkte ?? 0), 0);
    const maxP = fragen.reduce((a, f) => a + (f.max_punkte ?? 0), 0);
    const { n, bestanden } = note(Math.round((100 * gesamtpunkte) / Math.max(1, maxP)));
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
            <span className="font-semibold text-foreground">
              {n}
            </span>
          </p>
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
                  onSelfGrade={(id, p) =>
                    setResults((prev) => ({
                      ...prev,
                      [id]: { punkte: p, begruendung: "Selbst eingeschätzt." },
                    }))
                  }
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
        <Button type="button" onClick={abgeben} disabled={busy !== null}>
          {busy ? `bewerte ${busy}…` : "Prüfung abgeben"}
        </Button>
      </div>

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
          onSelfGrade(frage.id, Number(v));
          setV("");
        }}
      >
        übernehmen
      </Button>
    </div>
  );
}
