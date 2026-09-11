import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, RotateCw, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CARDS } from "@/lib/ap1-cards";
import { TOPICS, mastery } from "@/lib/ap1-topics";
import {
  fetchFlashcardProgress,
  recordCardResult,
  type FlashcardRow,
} from "@/lib/flashcard-progress";
import { pickWeighted } from "@/lib/flashcard-weighting";

export const Route = createFileRoute("/_authenticated/wissenskarten")({
  head: () => ({
    meta: [
      { title: "Wissenskarten – AP1 Trainer" },
      {
        name: "description",
        content: "Lerne mit digitalen Karteikarten die wichtigsten Begriffe für die AP1.",
      },
      { property: "og:title", content: "Wissenskarten – AP1 Trainer" },
      {
        property: "og:description",
        content: "Lerne mit digitalen Karteikarten die wichtigsten Begriffe für die AP1.",
      },
    ],
  }),
  component: WissenskartenPage,
});

const CARD_TOPICS = TOPICS.filter((t) => t.kind === "card");
const T = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
const CARDS_PER_TOPIC = CARDS.reduce<Record<string, number>>((acc, c) => {
  acc[c.topic] = (acc[c.topic] ?? 0) + 1;
  return acc;
}, {});

/** Gewichtung: p ∝ (falsch + 1) / (richtig + falsch + 2) — neue Karten bleiben im Pool. */
function pickWeightedId(pool: { id: string; falsch: number; richtig: number }[]): string {
  return pickWeighted(pool) ?? pool[0]!.id;
}

/** Inhalts-Styling für das Karten-HTML aus ap1-cards.ts. */
const CARD_HTML =
  "[&_b]:font-semibold [&_b]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5";

function WissenskartenPage() {
  const [selected, setSelected] = useState<string[]>(CARD_TOPICS.map((t) => t.id));
  const [rows, setRows] = useState<Record<string, FlashcardRow>>({});
  const [current, setCurrent] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [lastResult, setLastResult] = useState<"right" | "wrong" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [session, setSession] = useState({ seen: 0, right: 0, streak: 0 });

  useEffect(() => {
    fetchFlashcardProgress()
      .then((data) => setRows(Object.fromEntries(data.map((r) => [r.card_id, r]))))
      .catch(() => undefined);
  }, []);

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
    setCurrent(pickWeightedId(pool));
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
      setSession((s) => ({
        seen: s.seen + 1,
        right: s.right + (correct ? 1 : 0),
        streak: correct ? s.streak + 1 : 0,
      }));
      try {
        await recordCardResult(current, correct);
        setRows((prev) => {
          const existing = prev[current];
          const richtig = (existing?.richtig ?? 0) + (correct ? 1 : 0);
          const falsch = (existing?.falsch ?? 0) + (correct ? 0 : 1);
          return { ...prev, [current]: { card_id: current, richtig, falsch } };
        });
      } catch {
        setSaveError("Bewertung konnte nicht gespeichert werden.");
      }
    },
    [current, lastResult],
  );

  const card = current ? CARDS.find((c) => c.id === current) : null;
  const cardRow = current ? rows[current] : undefined;
  const m = mastery(cardRow?.richtig ?? 0, cardRow?.falsch ?? 0);

  // Tastatursteuerung: Leertaste/Enter wendet, 1/2 bewertet, →/N zieht weiter.
  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (lastResult) nextCard();
        else setFlipped((f) => !f);
        return;
      }
      if ((e.key === "ArrowRight" || e.key.toLowerCase() === "n") && lastResult) {
        e.preventDefault();
        nextCard();
        return;
      }
      if (!flipped || lastResult) return;
      if (e.key === "1") {
        e.preventDefault();
        void rate(true);
      } else if (e.key === "2") {
        e.preventDefault();
        void rate(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, flipped, lastResult, nextCard, rate]);

  const stats = useMemo(() => {
    const all = Object.values(rows);
    const right = all.reduce((a, r) => a + r.richtig, 0);
    const wrong = all.reduce((a, r) => a + r.falsch, 0);
    return { right, wrong, total: right + wrong };
  }, [rows]);

  const poolSize = useMemo(() => {
    const activeIds = new Set(selected.length ? selected : CARD_TOPICS.map((t) => t.id));
    return CARDS.filter((c) => activeIds.has(c.topic)).length;
  }, [selected]);

  const sessionQuote = session.seen ? Math.round((100 * session.right) / session.seen) : 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wissenskarten</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total > 0
                ? `${stats.right} richtig · ${stats.wrong} falsch · ${stats.total} Bewertungen insgesamt`
                : "Karte umdrehen und ehrlich bewerten — schwache Karten kommen öfter."}
            </p>
          </div>
          {session.seen > 0 && (
            <div className="flex items-center gap-2">
              <StatChip label="diese Sitzung" value={`${session.right}/${session.seen}`} />
              <StatChip label="Quote" value={`${sessionQuote}%`} />
              {session.streak >= 3 && (
                <span className="flex items-center gap-1.5 rounded-lg border border-status-good/50 bg-status-good/10 px-2.5 py-1.5 text-xs font-medium text-foreground">
                  <Sparkles className="size-3.5 text-status-good" />
                  {session.streak} in Folge
                </span>
              )}
            </div>
          )}
        </div>
        {session.seen > 0 && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-status-good transition-all duration-500"
              style={{ width: `${sessionQuote}%` }}
            />
          </div>
        )}
      </header>

      <section className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {CARD_TOPICS.map((t) => {
            const active = selected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id],
                  )
                }
                title={t.hint}
                aria-pressed={active}
                className={cn(
                  "group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all duration-150",
                  active
                    ? "border-primary/60 bg-primary/15 text-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-[5px] border transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {active && <Check className="size-3" strokeWidth={3} />}
                </span>
                {t.name}
                <span className="font-mono text-[11px] tabular-nums opacity-60">
                  {CARDS_PER_TOPIC[t.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">{poolSize}</span> Karten im Pool ·
          <kbd className="mx-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
            Leertaste
          </kbd>
          umdrehen ·
          <kbd className="mx-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
            1
          </kbd>
          wusste ich ·
          <kbd className="mx-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
            2
          </kbd>
          wusste ich nicht
        </p>
      </section>

      {card && (
        <section className="flip-scene">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-pressed={flipped}
            aria-label={flipped ? "Antwort — zurück zur Frage" : "Frage — Antwort zeigen"}
            className="flip-card w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            data-flipped={flipped}
          >
            <CardFace
              seite="Frage"
              html={card.q}
              topic={T[card.topic]?.name ?? card.topic}
              quote={m.n > 0 ? `${m.pct}%` : "neu"}
              hidden={flipped}
            />
            <CardFace
              seite="Antwort"
              html={card.a}
              topic={T[card.topic]?.name ?? card.topic}
              quote={m.n > 0 ? `${m.pct}%` : "neu"}
              hidden={!flipped}
              back
              result={lastResult}
            />
          </button>
        </section>
      )}

      {card && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => setFlipped((f) => !f)}>
            <RotateCw className="mr-2 size-4" />
            {flipped ? "Frage zeigen" : "Antwort zeigen"}
          </Button>
          {flipped && lastResult === null && (
            <>
              <Button type="button" onClick={() => rate(true)}>
                <ThumbsUp className="mr-2 size-4" /> wusste ich
              </Button>
              <Button type="button" variant="destructive" onClick={() => rate(false)}>
                <ThumbsDown className="mr-2 size-4" /> wusste ich nicht
              </Button>
            </>
          )}
          {lastResult !== null && (
            <Button type="button" onClick={nextCard}>
              Nächste Karte
              <kbd className="ml-2 rounded border border-primary-foreground/30 px-1.5 font-mono text-[10px] leading-4">
                →
              </kbd>
            </Button>
          )}
          {saveError && <p className="self-center text-sm text-destructive">{saveError}</p>}
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

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground">
      {label}{" "}
      <span className="ml-0.5 font-mono font-semibold tabular-nums text-foreground">{value}</span>
    </span>
  );
}

/**
 * Eine Seite der Karteikarte. Beide Seiten liegen übereinander in derselben
 * Grid-Zelle (siehe .flip-card), die abgewandte wird für Screenreader
 * ausgeblendet.
 */
function CardFace({
  seite,
  html,
  topic,
  quote,
  hidden,
  back = false,
  result = null,
}: {
  seite: string;
  html: string;
  topic: string;
  quote: string;
  hidden: boolean;
  back?: boolean;
  result?: "right" | "wrong" | null;
}) {
  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "flip-face flex min-h-64 flex-col gap-5 rounded-2xl border bg-card p-5 shadow-lg transition-colors md:p-7",
        back ? "flip-face-back border-primary/40 bg-card" : "border-border",
        result === "right" && "border-status-good/60",
        result === "wrong" && "border-status-bad/60",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
              back ? "bg-primary/20 text-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {seite}
          </span>
          <span className="text-xs text-muted-foreground">{topic}</span>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                result === "right"
                  ? "bg-status-good/15 text-status-good"
                  : "bg-status-bad/15 text-status-bad",
              )}
            >
              {result === "right" ? <Check className="size-3" /> : <X className="size-3" />}
              {result === "right" ? "gewusst" : "nochmal"}
            </span>
          )}
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{quote}</span>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col justify-center text-base leading-relaxed text-card-foreground md:text-lg",
          back && "md:text-base",
          CARD_HTML,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <p className="text-[11px] text-muted-foreground">
        {back
          ? "Ehrlich bewerten — schwache Karten kommen öfter."
          : "Karte anklicken zum Umdrehen."}
      </p>
    </div>
  );
}
