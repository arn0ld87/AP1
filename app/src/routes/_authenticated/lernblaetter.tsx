import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LERNBLAETTER, type Lernblatt } from "@/lib/ap1-lernblaetter";
import { renderMarkdown } from "@/lib/markdown";
import { fetchTopicMastery, recordTopicResult, type MasteryRow } from "@/lib/topic-mastery";
import { mastery } from "@/lib/ap1-topics";

export const Route = createFileRoute("/_authenticated/lernblaetter")({
  validateSearch: (search: Record<string, unknown>) => ({
    blatt: typeof search["blatt"] === "string" ? search["blatt"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lernblätter – AP1 Trainer" },
      {
        name: "description",
        content:
          "Neun Lernblätter zu den A- und B-Themen der AP1: verstehen, auswendig wissen, Formeln, Musteraufgabe, Lösungsschritte, häufige Fehler, Merksatz.",
      },
      { property: "og:title", content: "Lernblätter – AP1 Trainer" },
    ],
  }),
  component: LernblaetterPage,
});

type Bewertung = "sicher" | "unsicher" | null;

const ABSCHNITTE: { key: keyof Lernblatt; label: string }[] = [
  { key: "verstehen", label: "Verstehen" },
  { key: "auswendig_wissen", label: "Auswendig wissen" },
  { key: "formeln", label: "Formeln" },
  { key: "musteraufgabe", label: "Musteraufgabe" },
  { key: "loesungsschritte", label: "Lösungsschritte" },
  { key: "haeufige_fehler", label: "Häufige Fehler" },
  { key: "merksatz", label: "Merksatz" },
];

function statusOf(row: MasteryRow | undefined): Bewertung {
  if (!row) return null;
  if (row.richtig > row.falsch) return "sicher";
  if (row.falsch > row.richtig) return "unsicher";
  return null;
}

function LernblaetterPage() {
  const search = Route.useSearch();
  const blatt = search["blatt"];
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Record<string, MasteryRow>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopicMastery()
      .then((data) => setRows(Object.fromEntries(data.map((r) => [r.topic_id, r]))))
      .catch(() => undefined);
  }, []);

  const current = blatt ? LERNBLAETTER.find((l) => l.id === blatt) : undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LERNBLAETTER;
    return LERNBLAETTER.filter(
      (l) => l.title.toLowerCase().includes(q) || l.verstehen.toLowerCase().includes(q),
    );
  }, [query]);

  const bewerten = async (id: string, correct: boolean) => {
    try {
      await recordTopicResult(`lernblatt:${id}`, correct);
      setRows((prev) => {
        const existing = prev[`lernblatt:${id}`];
        const richtig = (existing?.richtig ?? 0) + (correct ? 1 : 0);
        const falsch = (existing?.falsch ?? 0) + (correct ? 0 : 1);
        return { ...prev, [`lernblatt:${id}`]: { topic_id: `lernblatt:${id}`, richtig, falsch } };
      });
    } catch {
      setSaveError("Bewertung konnte nicht gespeichert werden.");
    }
  };

  if (current) {
    return <Detail blatt={current} rows={rows} bewerten={bewerten} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lernblätter</h1>
        <p className="text-sm text-muted-foreground">
          {LERNBLAETTER.length} Blätter zu den A- und B-Themen — Struktur überall gleich.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen in Titel und Verstehen…"
          className="pl-9"
        />
      </div>

      <section className="space-y-2">
        {filtered.map((l) => {
          const row = rows[`lernblatt:${l.id}`];
          const m = mastery(row?.richtig ?? 0, row?.falsch ?? 0);
          const status = row
            ? row.richtig > row.falsch
              ? "sicher"
              : row.falsch > row.richtig
                ? "unsicher"
                : null
            : null;
          return (
            <Link
              key={l.id}
              to="/lernblaetter"
              search={{ blatt: l.id }}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div>
                <p className="font-medium text-foreground">{l.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {l.verstehen.replace(/\*\*/g, "").slice(0, 100)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-md border px-2 py-1 text-xs",
                  status === "sicher" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
                  status === "unsicher" && "border-amber-500/40 bg-amber-500/10 text-amber-400",
                  status === null && "border-border text-muted-foreground",
                )}
              >
                {m.n > 0 ? (status === "sicher" ? "sicher" : "unsicher") : "noch nicht bewertet"}
              </span>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Kein Lernblatt gefunden.
          </p>
        )}
      </section>
    </div>
  );
}

function Detail({
  blatt,
  rows,
  bewerten,
}: {
  blatt: Lernblatt;
  rows: Record<string, MasteryRow>;
  bewerten: (id: string, correct: boolean) => Promise<void>;
}) {
  const row = rows[`lernblatt:${blatt.id}`];
  const status: Bewertung = row
    ? row.richtig > row.falsch
      ? "sicher"
      : row.falsch > row.richtig
        ? "unsicher"
        : null
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4 md:pt-8">
      <Link
        to="/lernblaetter"
        search={{} as never}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Alle Lernblätter
      </Link>

      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{blatt.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Kenntnisstand:</span>
          {(["sicher", "unsicher"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => bewerten(blatt.id, s === "sicher")}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                status === s
                  ? s === "sicher"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
          {status === null && (
            <span className="text-xs text-muted-foreground">noch nicht bewertet</span>
          )}
        </div>
      </header>

      {ABSCHNITTE.map(({ key, label }) => (
        <section key={key} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </h2>
          <div
            className="rounded-xl border border-border bg-card p-4 md:p-5"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(blatt[key]) }}
          />
        </section>
      ))}
    </div>
  );
}
