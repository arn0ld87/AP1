import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlarmClock, ArrowLeft, Play } from "lucide-react";

import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

/**
 * Breiten-Shell: Auswahl bleibt als kurze Liste schmal, Prüfungs- und
 * Ergebnisansicht nutzen die volle nutzbare Breite des Content-Bereichs
 * (Seitenabstände kommen aus dem AppLayout), gedeckelt bei 1500px.
 */
const SHELL_NARROW = "mx-auto w-full max-w-3xl space-y-6 pt-4 md:pt-8";
const SHELL_WIDE = "mx-auto w-full max-w-[1500px] space-y-6 pt-4 md:pt-8";
/** Fließtext in Fragen/Lösungen bleibt lesbar, Tabellen und Code nicht. */
const PROSE =
  "text-sm leading-relaxed text-card-foreground [&>blockquote]:max-w-[75ch] [&>ol]:max-w-[75ch] [&>p]:max-w-[75ch] [&>ul]:max-w-[75ch]";

interface Attempt {
  id: string;
  exam_id: string | null;
  started_at: string;
  gesamtpunkte: number | null;
}

type Phase = "auswahl" | "modus" | "ergebnis";

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
        throw new Error("grade-exam-answer: HTTP " + res.status);
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
  const beantwortet = useMemo(
    () => fragen.filter((f) => (answers[f.id] ?? "").trim().length > 0).length,
    [fragen, answers],
  );

  // ---------- Auswahl ----------
  if (phase === "auswahl") {
    return (
      <div className={SHELL_NARROW}>
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
      <div className={SHELL_WIDE}>
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
            <article
              key={f.id}
              className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <TeilBadge nr={f.aufgabe_nr ?? 0} teil={f.teil} />
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {results[f.id]?.punkte ?? 0} / {f.max_punkte ?? 0} P
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="min-w-0 space-y-3">
                  <MarkdownContent src={f.frage} className={PROSE} />
                  {f.intro && (
                    <MarkdownContent
                      src={f.intro}
                      className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground"
                    />
                  )}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Eigene Antwort
                    </p>
                    <p className="whitespace-pre-wrap rounded-lg border border-border bg-background/40 p-3 text-sm leading-relaxed text-card-foreground">
                      {answers[f.id]?.trim() || "(leer)"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Musterlösung
                    </p>
                    <MarkdownContent
                      src={f.musterloesung}
                      className="rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      KI-Begründung
                    </p>
                    <p className="text-sm leading-relaxed text-card-foreground">
                      {results[f.id]?.begruendung ?? "–"}
                    </p>
                  </div>
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
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  }

  // ---------- Prüfungsmodus ----------
  const mm = String(Math.floor(restS / 60)).padStart(2, "0");
  const ss = String(restS % 60).padStart(2, "0");
  const knapp = restS <= 5 * 60;
  return (
    <div className={SHELL_WIDE}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <span
            className={cn(
              "flex items-center gap-2 font-mono text-lg font-semibold tabular-nums",
              knapp ? "text-status-bad" : "text-foreground",
            )}
          >
            <AlarmClock className={cn("size-5", knapp ? "text-status-bad" : "text-primary")} />
            {mm}:{ss}
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="font-mono tabular-nums text-foreground">
              {beantwortet}/{fragen.length}
            </span>{" "}
            beantwortet · {maxPunkteVon(fragen)} P gesamt
          </span>
        </div>
        <Button type="button" onClick={abgeben} disabled={submitting}>
          {submitting ? "Bewertung läuft…" : "Prüfung abgeben"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {ausgang && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ausgangssituation
          </h2>
          <MarkdownContent src={ausgang} className={PROSE} />
        </section>
      )}

      {aufgaben.map(([nr, teile]) => (
        <section key={nr} className="space-y-3">
          <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Aufgabe {nr}</h2>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {teile.reduce((a, f) => a + (f.max_punkte ?? 0), 0)} P
            </span>
          </div>
          {teile[0]?.intro && (
            <MarkdownContent
              src={teile[0].intro}
              className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground"
            />
          )}
          {teile.map((f) => (
            <article
              key={f.id}
              className="space-y-4 rounded-xl border border-border bg-card p-4 transition-colors focus-within:border-primary/40 md:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <TeilBadge nr={nr} teil={f.teil} />
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {f.max_punkte ?? 0} P
                </span>
              </div>

              <div className="grid gap-4 2xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] 2xl:items-start">
                <MarkdownContent src={f.frage} className={cn(PROSE, "min-w-0")} />
                <AnswerField
                  value={answers[f.id] ?? ""}
                  onChange={(v) => setAnswers((prev) => ({ ...prev, [f.id]: v }))}
                  label={`Antwort ${nr}${f.teil ?? ""}`}
                />
              </div>

              {results[f.id] && (
                <div className="space-y-1 rounded-lg border border-border p-3 text-xs">
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

/** Kennzeichnung der Teilaufgabe (1a, 1b, …) — trennt die Unteraufgaben sichtbar. */
function TeilBadge({ nr, teil }: { nr: number; teil: string | null }) {
  return (
    <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
      {nr}
      {teil ?? ""}
    </span>
  );
}

/**
 * Antwortfeld als echter Arbeitsbereich: mehrzeilig, wächst mit dem Inhalt
 * und behält Einrückungen (Rechenwege, Wertetabellen, Pseudocode).
 */
function AnswerField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Höhe an den Inhalt angleichen — vor dem Paint, damit nichts springt.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const zeilen = value ? value.split("\n").length : 0;
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={`answer-${label}`}
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Deine Antwort
        </label>
        {value.trim() && (
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {zeilen} {zeilen === 1 ? "Zeile" : "Zeilen"} · {value.trim().length} Zeichen
          </span>
        )}
      </div>
      <Textarea
        id={`answer-${label}`}
        ref={ref}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        rows={8}
        placeholder="Antwort, Rechenweg, Stichpunkte oder Tabelle …"
        className="min-h-44 resize-none overflow-hidden bg-background/40 font-mono text-sm leading-relaxed"
      />
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
