import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CARDS } from "@/lib/ap1-cards";
import { TOPICS, mastery } from "@/lib/ap1-topics";
import {
  fetchFlashcardProgress,
  recordCardResult,
  type FlashcardRow,
} from "@/lib/flashcard-progress";

export const Route = createFileRoute("/_authenticated/wissenskarten")({
  head: () => ({
    meta: [
      { title: "Wissenskarten – AP1 Trainer" },
      {
        name: "description",
        content:
          "Lerne mit digitalen Karteikarten die wichtigsten Begriffe für die AP1.",
      },
      { property: "og:title", content: "Wissenskarten – AP1 Trainer" },
      {
        property: "og:description",
        content:
          "Lerne mit digitalen Karteikarten die wichtigsten Begriffe für die AP1.",
      },
    ],
  }),
  component: WissenskartenPage,
});

const CARD_TOPICS = TOPICS.filter((t) => t.kind === "card");
const T = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

/** Gewichtung laut Brief: p ∝ falsch / (richtig + falsch + 1). */
function pickWeighted(
  pool: { id: string; falsch: number; richtig: number }[],
): string {
  const weights = pool.map((c) => c.falsch / (c.richtig + c.falsch + 1));
  const total = weights.reduce((a, w) => a + w, 0);
  if (total <= 0) {
    return pool[Math.floor(Math.random() * pool.length)].id;
  }
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i].id;
  }
  return pool[pool.length - 1].id;
}

function WissenskartenPage() {
  const [selected, setSelected] = useState<string[]>(
    CARD_TOPICS.map((t) => t.id),
  );
  const [rows, setRows] = useState<Record<string, FlashcardRow>>({});
  const [current, setCurrent] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [lastResult, setLastResult] = useState<"right" | "wrong" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashcardProgress()
      .then((data) =>
        setRows(Object.fromEntries(data.map((r) => [r.card_id, r]))),
      )
      .catch(() => undefined);
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const nextCard = useCallback(() => {
    const activeIds = new Set(selected.length ? selected : CARD_TOPICS.map((t) => t.id));
    const pool = CARDS.filter((c) => activeIds.has(c.topic)).map((c) => ({
      id: c.id,
      richtig: rows[c.id]?.richtig ?? 0,
      falsch: rows[c.id]?.falsch ?? 0,
    }));
    if (!pool.length) {
      setCurrent(null);
      return;
    }
    setCurrent(pickWeighted(pool));
    setFlipped(false);
    setLastResult(null);
    setSaveError(null);
  }, [selected, rows]);

  useEffect(() => {
    if (current === null) nextCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rate = useCallback(
    async (correct: boolean) => {
      if (!current || lastResult) return;
      setLastResult(correct ? "right" : "wrong");
      try {
        const row = await recordCardResult(current, correct);
        setRows((prev) => ({ ...prev, [row.card_id]: row }));
      } catch {
        setSaveError("Bewertung konnte nicht gespeichert werden.");
      }
    },
    [current, lastResult],
  );

  const card = current ? CARDS.find((c) => c.id === current) : null;
  const cardRow = current ? rows[current] : undefined;
  const m = mastery(cardRow?.richtig ?? 0, cardRow?.falsch ?? 0);

  const stats = useMemo(() => {
    const all = Object.values(rows);
    const right = all.reduce((a, r) => a + r.richtig, 0);
    const wrong = all.reduce((a, r) => a + r.falsch, 0);
    return { right, wrong, total: right + wrong };
  }, [rows]);

  const topicName = card ? (T[card.topic]?.name ?? card.topic) : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Wissenskarten
        </h1>
        <p className="text-sm text-muted-foreground">
          {stats.total > 0
            ? `${stats.right} richtig · ${stats.wrong} falsch · ${stats.total} Bewertungen insgesamt`
            : "Karte umdrehen und ehrlich bewerten — schwache Karten kommen öfter."}
        </p>
      </header>

      <section className="flex flex-wrap gap-2">
        {CARD_TOPICS.map((t) => {
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(t.id)
                    ? prev.filter((x) => x !== t.id)
                    : [...prev, t.id],
                )
              }
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
            </button>
          );
        })}
      </section>

      {card && (
        <article className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {T[card.topic]?.name ?? card.topic}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {m.n > 0 ? `${m.pct}% Trefferquote` : "neu"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="w-full rounded-lg border border-border bg-background/40 p-5 text-left transition-colors hover:border-primary/40 [&_b]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_li]:ml-4 [&_ul]:list-disc"
            aria-pressed={flipped}
          >
            <p
              className="text-base leading-relaxed text-card-foreground"
              dangerouslySetInnerHTML={{
                __html: flipped ? card.a : card.q,
              }}
            />
          </button>
        </article>
      )}

      {card && (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFlipped((f) => !f)}
          >
            {flipped ? "Frage zeigen" : "Antwort zeigen"}
          </Button>
          {flipped && lastResult === null && (
            <>
              <Button type="button" onClick={() => rate(true)}>
                <ThumbsUp className="mr-2 size-4" /> wusste ich
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => rate(false)}
              >
                <ThumbsDown className="mr-2 size-4" /> wusste ich nicht
              </Button>
            </>
          )}
          {lastResult !== null && (
            <Button type="button" onClick={nextCard}>
              <ThumbsUp className="mr-2 size-4" /> Nächste Karte
            </Button>
          )}
          {saveError && (
            <p className="self-center text-sm text-destructive">{saveError}</p>
          )}
        </div>
      )}

      {!card && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Kein Thema ausgewählt — wähle oben mindestens ein Thema.
        </p>
      )}
    </div>
  );
}
