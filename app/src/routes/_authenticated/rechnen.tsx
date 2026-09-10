import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Lightbulb, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GEN, checkAnswer, formatAnswer, pick, type Task } from "@/lib/ap1-generators";
import { CALC_TOPICS, T, mastery } from "@/lib/ap1-topics";
import { fetchTopicMastery, recordTopicResult, type MasteryRow } from "@/lib/topic-mastery";

export const Route = createFileRoute("/_authenticated/rechnen")({
  head: () => ({
    meta: [
      { title: "Rechnen üben – AP1 Trainer" },
      {
        name: "description",
        content:
          "Zufällige Rechenaufgaben zu Subnetting, Datenmengen, Strom, Kalkulation, Netzplan und RAID für die IHK AP1.",
      },
      { property: "og:title", content: "Rechnen üben – AP1 Trainer" },
      {
        property: "og:description",
        content:
          "Zufällige Rechenaufgaben zu Subnetting, Datenmengen, Strom, Kalkulation, Netzplan und RAID für die IHK AP1.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RechnenPage,
});

type Result = { correct: boolean; given: string } | null;

function RechnenPage() {
  const [selected, setSelected] = useState<string[]>(CALC_TOPICS.map((t) => t.id));
  const [task, setTask] = useState<Task | null>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [rows, setRows] = useState<Record<string, MasteryRow>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopicMastery()
      .then((data) => setRows(Object.fromEntries(data.map((r) => [r.topic_id, r]))))
      .catch(() => undefined);
  }, []);

  const newTask = useCallback(() => {
    const pool = selected.length ? selected : CALC_TOPICS.map((t) => t.id);
    const topicId = pick(pool);
    const gen = GEN[topicId];
    if (!gen) return;
    setTask(gen());
    setValue("");
    setResult(null);
    setShowSolution(false);
    setSaveError(null);
  }, [selected]);

  useEffect(() => {
    if (!task) newTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = async () => {
    if (!task || result) return;
    const correct = checkAnswer(task, value);
    setResult({ correct, given: value.trim() });
    if (!correct) setShowSolution(true);
    try {
      await recordTopicResult(task.topic, correct);
      setRows((prev) => {
        const existing = prev[task.topic];
        const richtig = (existing?.richtig ?? 0) + (correct ? 1 : 0);
        const falsch = (existing?.falsch ?? 0) + (correct ? 0 : 1);
        return { ...prev, [task.topic]: { topic_id: task.topic, richtig, falsch } };
      });
    } catch {
      setSaveError("Fortschritt konnte nicht gespeichert werden.");
    }
  };

  const topicName = task ? (T[task.topic]?.name ?? task.topic) : "";
  const stats = useMemo(() => {
    const all = Object.values(rows);
    const right = all.reduce((a, r) => a + r.richtig, 0);
    const wrong = all.reduce((a, r) => a + r.falsch, 0);
    return { right, wrong, total: right + wrong };
  }, [rows]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Rechnen üben</h1>
        <p className="text-sm text-muted-foreground">
          {stats.total > 0
            ? `${stats.right} richtig · ${stats.wrong} falsch · ${stats.total} Aufgaben insgesamt`
            : "Wähle deine Themen und starte mit einer Aufgabe."}
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        {CALC_TOPICS.map((t) => {
          const row = rows[t.id];
          const m = mastery(row?.richtig ?? 0, row?.falsch ?? 0);
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              title={t.hint}
              aria-pressed={active}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-primary/60 bg-primary/15 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {t.name}
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                {m.n > 0 ? `${m.pct}%` : "–"}
              </span>
            </button>
          );
        })}
      </section>

      {task && (
        <article className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {topicName}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {task.pts} {task.pts === 1 ? "Punkt" : "Punkte"}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{task.lead}</p>

          <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {task.given.map(([k, v], i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono tabular-nums text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          <p
            className="text-base leading-relaxed text-card-foreground [&_b]:font-semibold"
            dangerouslySetInnerHTML={{ __html: task.q }}
          />

          <form
            className="flex flex-wrap items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!!result}
              inputMode={task.ip ? "text" : "decimal"}
              placeholder={task.ip ? "z. B. 192.168.10.0" : "Ergebnis"}
              aria-label="Antwort"
              className="max-w-56 font-mono tabular-nums"
            />
            {task.unit && <span className="text-sm text-muted-foreground">{task.unit}</span>}
            <Button type="submit" disabled={!!result || !value.trim()}>
              Prüfen
            </Button>
            <Button type="button" variant="outline" onClick={newTask}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Neue Aufgabe
            </Button>
          </form>

          {result && (
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg border p-3 text-sm",
                result.correct
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-destructive/40 bg-destructive/10 text-destructive-foreground",
              )}
            >
              {result.correct ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>
                {result.correct
                  ? "Richtig."
                  : `Leider falsch. Richtig wäre: ${formatAnswer(task)}${task.unit ? " " + task.unit : ""}.`}
              </span>
            </div>
          )}

          {result?.correct && !showSolution && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowSolution(true)}>
              Lösungsweg anzeigen
            </Button>
          )}

          {showSolution && (
            <div className="space-y-4 rounded-lg border border-border bg-background/40 p-4">
              <h2 className="text-sm font-semibold text-foreground">Lösungsweg</h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {task.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-xs text-primary">{i + 1}.</span>
                    <span
                      className="[&_b]:font-semibold [&_b]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: s }}
                    />
                  </li>
                ))}
              </ol>
              <p className="flex gap-2 rounded-md border border-border p-3 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span
                  className="[&_b]:font-semibold [&_b]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: task.trap }}
                />
              </p>
            </div>
          )}

          {saveError && <p className="text-sm text-muted-foreground">{saveError}</p>}
        </article>
      )}
    </div>
  );
}
