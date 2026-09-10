import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOPICS } from "@/lib/ap1-topics";
import { fetchTopicMastery, type MasteryRow } from "@/lib/topic-mastery";
import { fetchFlashcardProgress, type FlashcardRow } from "@/lib/flashcard-progress";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/fortschritt")({
  head: () => ({
    meta: [
      { title: "Fortschritt & Fehlerliste – AP1 Trainer" },
      {
        name: "description",
        content: "Trefferraten je Thema und die persönliche Fehlerdatenbank.",
      },
    ],
  }),
  component: FortschrittPage,
});

interface ErrorLogRow {
  id: string;
  quelle: string | null;
  thema: string | null;
  beschreibung: string | null;
  erledigt: boolean | null;
  created_at: string;
}

/** Trefferquote in Balken-Farbe: ≥75 grün, ≥50 gelb, sonst rot (mastery-Semantik). */
function balkenFarbe(pct: number, n: number): string {
  if (n === 0) return "bg-border";
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

function Balken({ richtig, falsch }: { richtig: number; falsch: number }) {
  const n = richtig + falsch;
  const pct = n ? Math.round((100 * richtig) / n) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", balkenFarbe(pct, n))}
          style={{ width: `${n ? pct : 0}%` }}
        />
      </div>
      <span className="w-24 font-mono text-xs text-muted-foreground">
        {n > 0 ? `${richtig}/${n} · ${pct}%` : "–"}
      </span>
    </div>
  );
}

function FortschrittPage() {
  const [topicRows, setTopicRows] = useState<Record<string, MasteryRow>>({});
  const [cardRows, setCardRows] = useState<FlashcardRow[]>([]);
  const [errors, setErrors] = useState<ErrorLogRow[]>([]);
  const [error2, setError2] = useState<string | null>(null);

  useEffect(() => {
    fetchTopicMastery().then((d) =>
      setTopicRows(Object.fromEntries(d.map((r) => [r.topic_id, r]))),
    );
    fetchFlashcardProgress().then(setCardRows);
    supabase
      .from("error_log")
      .select("id, quelle, thema, beschreibung, erledigt, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError2(e.message);
        else setErrors((data ?? []) as ErrorLogRow[]);
      });
  }, []);

  const alsErledigt = async (id: string) => {
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, erledigt: true } : e)));
    await supabase.from("error_log").update({ erledigt: true }).eq("id", id);
  };

  // Thema-Kennzahlen: Rechnen-Themen direkt; Lernblätter aggregiert unter lernblatt:<id>
  const themen = useMemo(() => {
    const calc = TOPICS.filter((t) => t.kind === "calc").map((t) => ({
      label: t.name,
      richtig: topicRows[t.id]?.richtig ?? 0,
      falsch: topicRows[t.id]?.falsch ?? 0,
    }));
    const cardAgg = cardRows.reduce(
      (a, r) => ({ richtig: a.richtig + r.richtig, falsch: a.falsch + r.falsch }),
      { richtig: 0, falsch: 0 },
    );
    const lbIds = new Set(Object.keys(topicRows).filter((k) => k.startsWith("lernblatt:")));
    const lernblaetter = [...lbIds].map((k) => ({
      label: "Lernblatt " + k.slice("lernblatt:".length),
      richtig: topicRows[k]?.richtig ?? 0,
      falsch: topicRows[k]?.falsch ?? 0,
    }));
    return [...calc, { label: "Wissenskarten (alle Themen)", ...cardAgg }, ...lernblaetter];
  }, [topicRows, cardRows]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Fortschritt & Fehlerliste
        </h1>
        <p className="text-sm text-muted-foreground">
          Deine Trefferraten je Thema und jeder Fehler, den die Prüfungen hervorgebracht haben.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Trefferraten
        </h2>
        {themen.map((t) => (
          <div key={t.label} className="flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{t.label}</span>
            <Balken richtig={t.richtig} falsch={t.falsch} />
          </div>
        ))}
        {themen.every((t) => t.richtig + t.falsch === 0) && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Noch nichts geübt — starte mit „Rechnen üben“.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fehlerliste ({errors.filter((e) => !e.erledigt).length} offen)
        </h2>
        {error2 && <p className="text-sm text-destructive">{error2}</p>}
        {errors.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Keine Fehler eingetragen — schreibe eine Probeprüfung.
          </p>
        )}
        <ul className="space-y-2">
          {errors.map((e) => (
            <li
              key={e.id}
              className={cn(
                "flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-opacity",
                e.erledigt && "opacity-50",
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {e.thema}{" "}
                  <span className="ml-1 rounded border border-border px-1 font-mono text-xs text-muted-foreground">
                    {e.quelle}
                  </span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {e.beschreibung}
                </p>
              </div>
              {!e.erledigt && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alsErledigt(e.id)}
                  title="Als erledigt markieren"
                >
                  <Check className="size-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
