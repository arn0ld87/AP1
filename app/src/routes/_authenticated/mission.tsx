import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  Flag,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { TaskAnswerEditor } from "@/components/ap1/TaskAnswerEditor";
import { TaskVisual } from "@/components/ap1/visuals";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Json } from "@/integrations/supabase/types";
import { CARDS, type Card } from "@/lib/ap1-cards";
import { GEN, pick, type Task } from "@/lib/ap1-generators";
import {
  buildDailyMission,
  calculateReadiness,
  calculateTopicPriority,
  calculateXp,
  daysUntilExam,
  type AnswerConfidence,
  type DailyMission,
} from "@/lib/ap1-mission";
import { TOPICS, T } from "@/lib/ap1-topics";
import { evaluateTaskAnswer, isSubmissionComplete, type TaskEvaluation } from "@/lib/ap1-tasks";
import {
  fetchMissionSnapshot,
  finishMissionSession,
  recordMissionAttempt,
  saveMissionProgress,
  startMissionSession,
  type MissionSnapshot,
} from "@/lib/mission-persistence";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/mission")({
  head: () => ({
    meta: [
      { title: "AP1 Mission – Adaptives Lernen" },
      {
        name: "description",
        content: "Deine adaptive Tagesmission bis zur AP1 am 30.09.2026.",
      },
    ],
  }),
  component: MissionPage,
});

type MissionQuestion =
  | { id: string; topicId: string; kind: "calc"; task: Task; isBoss: boolean; retry: boolean }
  | { id: string; topicId: string; kind: "card"; card: Card; isBoss: boolean; retry: boolean };

interface SessionStats {
  answered: number;
  correct: number;
  xp: number;
}

interface StoredProgress {
  queue: MissionQuestion[];
  currentIndex: number;
  stats: SessionStats;
}

const CARD_HTML =
  "[&_b]:font-semibold [&_b]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5";

function createQuestion(topicId: string, isBoss = false, retry = false): MissionQuestion | null {
  const topic = T[topicId];
  const generator = GEN[topicId];
  if (topic?.kind !== "card" && generator) {
    return { id: crypto.randomUUID(), topicId, kind: "calc", task: generator(), isBoss, retry };
  }
  const cards = CARDS.filter((card) => card.topic === topicId);
  if (!cards.length) return null;
  return { id: crypto.randomUUID(), topicId, kind: "card", card: pick(cards), isBoss, retry };
}

function createQueue(mission: DailyMission): MissionQuestion[] {
  const queue = mission.items.flatMap((item) =>
    Array.from({ length: item.taskCount }, () => createQuestion(item.topic.id)).filter(
      (question): question is MissionQuestion => question !== null,
    ),
  );
  const bossTopic = mission.items.find((item) => GEN[item.topic.id])?.topic.id;
  const boss = bossTopic ? createQuestion(bossTopic, true) : null;
  return boss ? [...queue, boss] : queue;
}

function parseStoredProgress(value: Json): StoredProgress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, Json | undefined>;
  if (!Array.isArray(candidate["queue"]) || typeof candidate["currentIndex"] !== "number")
    return null;
  const stats = candidate["stats"];
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) return null;
  const typedStats = stats as Record<string, Json | undefined>;
  if (
    typeof typedStats["answered"] !== "number" ||
    typeof typedStats["correct"] !== "number" ||
    typeof typedStats["xp"] !== "number"
  ) {
    return null;
  }
  return {
    queue: candidate["queue"] as unknown as MissionQuestion[],
    currentIndex: candidate["currentIndex"],
    stats: {
      answered: typedStats["answered"],
      correct: typedStats["correct"],
      xp: typedStats["xp"],
    },
  };
}

function MissionPage() {
  const [snapshot, setSnapshot] = useState<MissionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [queue, setQueue] = useState<MissionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<SessionStats>({ answered: 0, correct: 0, xp: 0 });
  const [values, setValues] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<AnswerConfidence | null>(null);
  const [evaluation, setEvaluation] = useState<TaskEvaluation | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [cardAnswer, setCardAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [stored, setStored] = useState(false);
  const [complete, setComplete] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchMissionSnapshot()
      .then(setSnapshot)
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Lerndaten konnten nicht geladen werden.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const masteryByTopic = useMemo(
    () => Object.fromEntries((snapshot?.mastery ?? []).map((row) => [row.topic_id, row])),
    [snapshot],
  );
  const priorities = useMemo(
    () =>
      TOPICS.map((topic) =>
        calculateTopicPriority(
          topic,
          masteryByTopic[topic.id],
          snapshot?.openErrorsByTopic[topic.id] ?? 0,
        ),
      ),
    [masteryByTopic, snapshot],
  );
  const mission = useMemo(() => buildDailyMission(priorities), [priorities]);
  const readiness = useMemo(() => calculateReadiness(TOPICS, masteryByTopic), [masteryByTopic]);
  const current = queue[currentIndex] ?? null;
  const answeredCurrent = stored;

  const persistState = useCallback(
    async (nextQueue: MissionQuestion[], nextIndex: number, nextStats: SessionStats) => {
      if (!sessionId) return;
      const details = {
        queue: nextQueue,
        currentIndex: nextIndex,
        stats: nextStats,
      } as unknown as Json;
      await saveMissionProgress(sessionId, details);
    },
    [sessionId],
  );

  const begin = async () => {
    setError(null);
    const stored = snapshot?.openSession ? parseStoredProgress(snapshot.openSession.details) : null;
    if (snapshot?.openSession && stored?.queue.length) {
      setSessionId(snapshot.openSession.id);
      setStartedAt(new Date(snapshot.openSession.started_at));
      setQueue(stored.queue);
      setCurrentIndex(stored.currentIndex);
      setStats(stored.stats);
      return;
    }
    const nextQueue = createQueue(mission);
    if (!nextQueue.length) {
      setError("Für die heutige Mission konnten keine Aufgaben erzeugt werden.");
      return;
    }
    try {
      setSaving(true);
      const initial = {
        queue: nextQueue,
        currentIndex: 0,
        stats: { answered: 0, correct: 0, xp: 0 },
      } as unknown as Json;
      const id = await startMissionSession(initial);
      setSessionId(id);
      setStartedAt(new Date());
      setQueue(nextQueue);
      setCurrentIndex(0);
      setStats({ answered: 0, correct: 0, xp: 0 });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Mission konnte nicht gestartet werden.");
    } finally {
      setSaving(false);
    }
  };

  const resetQuestion = () => {
    setValues({});
    setConfidence(null);
    setEvaluation(null);
    setCardRevealed(false);
    setCardAnswer("");
    setStored(false);
  };

  const storeAnswer = async (correct: boolean, description: string): Promise<boolean> => {
    if (!current || !sessionId || !confidence || saving || stored) return false;
    const taskKind = current.isBoss ? "boss" : current.kind === "calc" ? "calculation" : "quick";
    const xp = calculateXp(correct, confidence, taskKind);
    const retryQuestion =
      !correct && !current.retry ? createQuestion(current.topicId, false, true) : null;
    const nextQueue = retryQuestion ? [...queue, retryQuestion] : queue;
    const nextStats = {
      answered: stats.answered + 1,
      correct: stats.correct + (correct ? 1 : 0),
      xp: stats.xp + xp,
    };
    setSaving(true);
    setError(null);
    try {
      await recordMissionAttempt({
        sessionId,
        topicId: current.topicId,
        correct,
        confidence,
        xp,
        errorDescription: description,
      });
      setQueue(nextQueue);
      setStats(nextStats);
      await persistState(nextQueue, currentIndex, nextStats);
      setStored(true);
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Antwort konnte nicht gespeichert werden.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitCalculation = async () => {
    if (!current || current.kind !== "calc" || evaluation) return;
    const nextEvaluation = evaluateTaskAnswer(current.task, values);
    setEvaluation(nextEvaluation);
    const saved = await storeAnswer(
      nextEvaluation.correct,
      `${current.task.lead} ${current.task.q}`.replace(/<[^>]+>/g, " "),
    );
    if (!saved) setEvaluation(null);
  };

  const rateCard = async (correct: boolean) => {
    if (!current || current.kind !== "card" || stored) return;
    await storeAnswer(correct, current.card.q.replace(/<[^>]+>/g, " "));
  };

  const next = async () => {
    if (!sessionId || !startedAt) return;
    if (currentIndex + 1 >= queue.length) {
      setSaving(true);
      try {
        await finishMissionSession(sessionId, startedAt, {
          queue,
          currentIndex,
          stats,
        } as unknown as Json);
        setComplete(true);
        setSessionId(null);
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "Session konnte nicht abgeschlossen werden.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    resetQuestion();
    try {
      await persistState(queue, nextIndex, stats);
    } catch {
      setError("Der Wiederaufnahmepunkt konnte nicht gespeichert werden.");
    }
  };

  const abort = async () => {
    if (!sessionId || !startedAt) return;
    setSaving(true);
    try {
      await finishMissionSession(
        sessionId,
        startedAt,
        { queue, currentIndex, stats } as unknown as Json,
        true,
      );
      setSessionId(null);
      setQueue([]);
      resetQuestion();
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="pt-8 text-sm text-muted-foreground">Mission wird zusammengestellt …</p>;
  }

  if (complete) {
    const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;
    return (
      <div className="mx-auto max-w-2xl space-y-6 pt-8">
        <section className="rounded-2xl border border-primary/30 bg-card p-7 text-center shadow-sm">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Mission abgeschlossen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.correct} von {stats.answered} Aufgaben richtig · {accuracy}% · {stats.xp} XP
          </p>
          <Progress value={accuracy} className="mx-auto mt-5 max-w-md" />
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Neue Mission planen
          </Button>
        </section>
      </div>
    );
  }

  if (!sessionId || !current) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 pt-4 md:pt-8">
        <header className="grid gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              AP1 Mission
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Was bringt heute die meisten Prüfungspunkte?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Die Auswahl folgt deinen Fehlern, deiner Sicherheit, fälligen Wiederholungen und der
              tatsächlichen AP1-Relevanz.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-72">
            <Metric label="AP1 in" value={`${daysUntilExam()} Tagen`} />
            <Metric label="Bereitschaft" value={`${readiness.score}%`} />
          </div>
        </header>

        {error && (
          <p className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Deine Mission heute</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4" /> ungefähr {mission.estimatedMinutes} Minuten
              </p>
            </div>
            <Button size="lg" onClick={() => void begin()} disabled={saving}>
              {snapshot?.openSession ? "Mission fortsetzen" : "Mission starten"}
              <ArrowRight />
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {mission.items.map((item, index) => (
              <article
                key={item.topic.id}
                className="rounded-xl border border-border bg-background/35 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-primary">0{index + 1}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    {item.taskCount} Aufgaben
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{item.topic.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                <Progress value={Math.round(item.priority * 100)} className="mt-4" />
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            icon={Target}
            title="Adaptiv"
            text="Schwächen und fällige Wiederholungen zuerst."
          />
          <InfoCard
            icon={BrainCircuit}
            title="Aktive Abfrage"
            text="Rechenweg oder eigene Stichpunkte statt Durchklicken."
          />
          <InfoCard
            icon={RotateCcw}
            title="Fehler-Loop"
            text="Falsche Antworten kommen als neue Variante zurück."
          />
        </section>
      </div>
    );
  }

  const progress = Math.round(((currentIndex + (answeredCurrent ? 1 : 0)) / queue.length) * 100);
  const topic = T[current.topicId];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pt-4 md:pt-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            Aufgabe {currentIndex + 1} von {queue.length}
          </span>
          <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
            <span>{stats.correct} richtig</span>
            <span className="text-primary">{stats.xp} XP</span>
            <button type="button" onClick={() => void abort()} className="hover:text-foreground">
              Session beenden
            </button>
          </div>
        </div>
        <Progress value={progress} />
      </header>

      <article className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
            {topic?.name ?? current.topicId}
          </span>
          {current.isBoss && (
            <span className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Flag className="size-3.5" /> Mini-Boss
            </span>
          )}
        </div>

        {current.kind === "calc" ? (
          <div className="mt-6 space-y-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{current.task.lead}</p>
            {current.task.visual && <TaskVisual visual={current.task.visual} />}
            {current.task.given.length > 0 && (
              <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {current.task.given.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-mono text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p
              className="text-base text-foreground"
              dangerouslySetInnerHTML={{ __html: current.task.q }}
            />
            <TaskAnswerEditor
              task={current.task}
              values={values}
              onChange={(id, value) => setValues((state) => ({ ...state, [id]: value }))}
              evaluation={evaluation}
              disabled={evaluation !== null || saving}
            />
            {!evaluation && (
              <div className="flex flex-wrap items-end justify-between gap-4">
                <ConfidencePicker value={confidence} onChange={setConfidence} />
                <Button
                  onClick={() => void submitCalculation()}
                  disabled={!confidence || !isSubmissionComplete(current.task, values) || saving}
                >
                  Antwort prüfen
                </Button>
              </div>
            )}
            {evaluation && (
              <ResultPanel
                correct={evaluation.correct}
                xp={calculateXp(
                  evaluation.correct,
                  confidence ?? "unsure",
                  current.isBoss ? "boss" : "calculation",
                )}
              />
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {current.card.visual && <TaskVisual visual={current.card.visual} />}
            <p
              className="text-lg leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: current.card.q }}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                Deine Antwort in Stichpunkten
              </span>
              <textarea
                value={cardAnswer}
                onChange={(event) => setCardAnswer(event.target.value)}
                disabled={cardRevealed}
                rows={5}
                className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
              />
            </label>
            {!cardRevealed ? (
              <div className="flex flex-wrap items-end justify-between gap-4">
                <ConfidencePicker value={confidence} onChange={setConfidence} />
                <Button
                  disabled={!confidence || !cardAnswer.trim()}
                  onClick={() => setCardRevealed(true)}
                >
                  Musterlösung vergleichen
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "rounded-lg border border-border bg-background/40 p-4 text-sm text-muted-foreground",
                    CARD_HTML,
                  )}
                  dangerouslySetInnerHTML={{ __html: current.card.a }}
                />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void rateCard(true)} disabled={saving || stored}>
                    <Check /> Gewusst
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void rateCard(false)}
                    disabled={saving || stored}
                  >
                    <X /> Noch nicht
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {stored && (
          <div className="mt-5 flex justify-end">
            <Button onClick={() => void next()} disabled={saving}>
              {currentIndex + 1 >= queue.length ? "Mission abschließen" : "Nächste Aufgabe"}
              <ArrowRight />
            </Button>
          </div>
        )}
      </article>
    </div>
  );
}

function ConfidencePicker({
  value,
  onChange,
}: {
  value: AnswerConfidence | null;
  onChange: (value: AnswerConfidence) => void;
}) {
  const options: { value: AnswerConfidence; label: string }[] = [
    { value: "sure", label: "Sicher" },
    { value: "unsure", label: "Unsicher" },
    { value: "guessed", label: "Geraten" },
  ];
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-muted-foreground">
        Wie sicher bist du?
      </legend>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 rounded-lg border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ResultPanel({ correct, xp }: { correct: boolean; xp: number }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        correct
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-destructive/40 bg-destructive/10 text-destructive-foreground",
      )}
    >
      {correct ? (
        <Sparkles className="mt-0.5 size-4 shrink-0" />
      ) : (
        <RotateCcw className="mt-0.5 size-4 shrink-0" />
      )}
      <span>
        {correct
          ? `Richtig · +${xp} XP`
          : "Noch nicht richtig. Eine neue Variante kommt am Ende der Session."}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Target;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <Icon className="size-5 text-primary" />
      <h2 className="mt-3 text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </article>
  );
}
