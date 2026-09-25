import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lightbulb, RotateCw, X } from "lucide-react";

import { AiGeneratedNotice } from "@/components/ai-generated-notice";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { QUIZ_QUESTIONS, gradeQuestion, shuffleQuestions, type QuizQuestion } from "@/lib/quiz";

export const Route = createFileRoute("/_authenticated/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz – AP1 Trainer" },
      {
        name: "description",
        content: "Multiple-Choice-Quiz aus den Altprüfungen, generiert mit NotebookLM.",
      },
      { property: "og:title", content: "Quiz – AP1 Trainer" },
    ],
  }),
  component: QuizPage,
});

const BEST_SCORE_KEY = "ap1-quiz-best";

/** Bestwert ist nur ein netter Bonus — schlägt localStorage fehl, bleibt der Rest der Seite nutzbar. */
function loadBestScore(): number | null {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function saveBestScore(score: number) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // kein Persistieren möglich — Sitzung bleibt trotzdem bedienbar.
  }
}

function QuizPage() {
  const [order, setOrder] = useState<QuizQuestion[]>(() => shuffleQuestions(QUIZ_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(() => loadBestScore());

  const finished = index >= order.length;

  function grade(indexes: number[], question: QuizQuestion) {
    setChecked(true);
    if (gradeQuestion(question, indexes).correct) setScore((s) => s + 1);
  }

  function selectSingle(question: QuizQuestion, i: number) {
    if (checked) return;
    setSelected([i]);
    grade([i], question);
  }

  function toggleMulti(i: number) {
    if (checked) return;
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  function check(question: QuizQuestion) {
    if (checked || !selected.length) return;
    grade(selected, question);
  }

  function next() {
    const nextIndex = index + 1;
    if (nextIndex >= order.length && (best === null || score > best)) {
      setBest(score);
      saveBestScore(score);
    }
    setIndex(nextIndex);
    setSelected([]);
    setChecked(false);
    setShowHint(false);
  }

  function restart() {
    setOrder(shuffleQuestions(QUIZ_QUESTIONS));
    setIndex(0);
    setSelected([]);
    setChecked(false);
    setShowHint(false);
    setScore(0);
  }

  if (finished) {
    const pct = Math.round((100 * score) / order.length);
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 pt-4 md:pt-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quiz</h1>
          <AiGeneratedNotice />
        </header>
        <section className="space-y-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Ergebnis</p>
          <p className="text-4xl font-semibold tabular-nums text-foreground">
            {score} / {order.length}
          </p>
          <Progress value={pct} className="mx-auto max-w-sm" />
          {best !== null && (
            <p className="text-xs text-muted-foreground">
              Bestwert: {best} / {order.length}
            </p>
          )}
          <Button type="button" onClick={restart}>
            <RotateCw className="mr-2 size-4" /> Nochmal
          </Button>
        </section>
      </div>
    );
  }

  const question = order[index]!;
  const result = checked ? gradeQuestion(question, selected) : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pt-4 md:pt-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quiz</h1>
          <span className="text-sm text-muted-foreground">
            Frage {index + 1} / {order.length}
          </span>
        </div>
        <Progress value={(100 * index) / order.length} />
        <AiGeneratedNotice />
      </header>

      <article className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
            {question.type === "multiple_select" ? "Mehrfachauswahl" : "Einfachauswahl"}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>
            <Lightbulb className="mr-1.5 size-4" /> Hinweis
          </Button>
        </div>

        <p className="text-base leading-relaxed text-foreground">{question.question}</p>

        {showHint && (
          <p className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
            {question.hint}
          </p>
        )}

        <div
          role={question.type === "multiple_choice" ? "radiogroup" : undefined}
          aria-label={question.type === "multiple_choice" ? "Antwortoptionen" : undefined}
          className="space-y-2"
        >
          {question.answerOptions.map((option, i) => (
            <OptionRow
              key={i}
              type={question.type === "multiple_choice" ? "radio" : "checkbox"}
              name={question.type === "multiple_choice" ? `quiz-q-${index}` : undefined}
              text={option.text}
              checked={selected.includes(i)}
              disabled={checked}
              onSelect={() =>
                question.type === "multiple_choice" ? selectSingle(question, i) : toggleMulti(i)
              }
              showResult={checked}
              isCorrect={option.isCorrect}
              rationale={checked ? option.rationale : undefined}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {question.type === "multiple_select" && !checked && (
            <Button type="button" onClick={() => check(question)} disabled={!selected.length}>
              Prüfen
            </Button>
          )}
          {checked && (
            <>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  result?.correct ? "text-status-good" : "text-status-bad",
                )}
              >
                {result?.correct ? <Check className="size-4" /> : <X className="size-4" />}
                {result?.correct ? "Richtig" : "Nicht ganz richtig"}
              </span>
              <Button type="button" onClick={next}>
                {index + 1 === order.length ? "Ergebnis anzeigen" : "Nächste Frage"}
              </Button>
            </>
          )}
        </div>
      </article>
    </div>
  );
}

/** Eine Antwortoption als echtes Radio/Checkbox-Input — nach dem Prüfen gesperrt und markiert. */
function OptionRow({
  type,
  name,
  text,
  checked,
  disabled,
  onSelect,
  showResult,
  isCorrect,
  rationale,
}: {
  type: "radio" | "checkbox";
  name: string | undefined;
  text: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
  showResult: boolean;
  isCorrect: boolean;
  rationale: string | undefined;
}) {
  const state = !showResult ? "neutral" : isCorrect ? "correct" : checked ? "incorrect" : "neutral";

  return (
    <label
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
        disabled ? "cursor-default" : "cursor-pointer hover:border-primary/40",
        state === "correct" && "border-status-good/60 bg-status-good/10",
        state === "incorrect" && "border-status-bad/60 bg-status-bad/10",
        state === "neutral" && "border-border bg-background/40",
      )}
    >
      <span className="flex items-center gap-2.5">
        <input
          type={type}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onSelect}
          className="size-4 shrink-0 accent-primary"
        />
        <span className="flex-1 text-card-foreground">{text}</span>
        {showResult && isCorrect && (
          <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-status-good">
            <Check className="size-3.5" /> richtig
          </span>
        )}
        {showResult && !isCorrect && checked && (
          <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-status-bad">
            <X className="size-3.5" /> falsch
          </span>
        )}
      </span>
      {showResult && rationale && (
        <p className="pl-7 text-xs leading-relaxed text-muted-foreground">{rationale}</p>
      )}
    </label>
  );
}
