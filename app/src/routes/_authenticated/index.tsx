import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  BookOpen,
  Calculator,
  Calendar,
  ClipboardCheck,
  FileText,
  Sigma,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_TAGE } from "@/lib/ap1-tagesplan";
import { fetchFlashcardProgress, type FlashcardRow } from "@/lib/flashcard-progress";
import { fetchTopicMastery, type MasteryRow } from "@/lib/topic-mastery";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Startseite – AP1 Trainer" },
      {
        name: "description",
        content:
          "Willkommen beim AP1 Trainer. Bereite dich gezielt auf die IHK-Abschlussprüfung Teil 1 vor.",
      },
      { property: "og:title", content: "Startseite – AP1 Trainer" },
      {
        property: "og:description",
        content:
          "Willkommen beim AP1 Trainer. Bereite dich gezielt auf die IHK-Abschlussprüfung Teil 1 vor.",
      },
    ],
  }),
  component: IndexPage,
});

const MODULE: { title: string; url: string; icon: typeof Calculator }[] = [
  { title: "Rechnen üben", url: "/rechnen", icon: Calculator },
  { title: "Wissenskarten", url: "/wissenskarten", icon: BookOpen },
  { title: "Lernblätter", url: "/lernblaetter", icon: FileText },
  { title: "Formelsammlung", url: "/formelsammlung", icon: Sigma },
  { title: "Probeprüfungen", url: "/probepruefungen", icon: ClipboardCheck },
  { title: "Fortschritt", url: "/fortschritt", icon: BarChart2 },
  { title: "Tagesplan", url: "/tagesplan", icon: Calendar },
];

/** Kalendertage bis zur Prüfung am 30.09.2026, bei 0 geklemmt. */
function tageBisPruefung(): number {
  const now = new Date();
  const heute = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const pruefung = new Date(2026, 8, 30);
  return Math.max(0, Math.round((pruefung.getTime() - heute.getTime()) / 86400000));
}

/** date_label-Format wie tagesplan.tsx: "Do 10.09." */
function todayLabel(): string {
  const now = new Date();
  const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][now.getDay()];
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${wd} ${dd}.${mm}.`;
}

function IndexPage() {
  const tage = tageBisPruefung();
  const today = todayLabel();

  const [topicRows, setTopicRows] = useState<Record<string, MasteryRow>>({});
  const [cardRows, setCardRows] = useState<FlashcardRow[]>([]);
  const [datenError, setDatenError] = useState<string | null>(null);
  const [offeneFehler, setOffeneFehler] = useState<number | null>(null);
  const [fehlerError, setFehlerError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [abgehakteTage, setAbgehakteTage] = useState(0);

  useEffect(() => {
    const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
    fetchTopicMastery()
      .then((d) => setTopicRows(Object.fromEntries(d.map((r) => [r.topic_id, r]))))
      .catch((e) => setDatenError(msg(e)));
    fetchFlashcardProgress()
      .then(setCardRows)
      .catch((e) => setDatenError((prev) => prev ?? msg(e)));
    supabase
      .from("error_log")
      .select("id, erledigt")
      .order("created_at", { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setFehlerError(e.message);
        else setOffeneFehler((data ?? []).filter((r) => !r.erledigt).length);
      });
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null))
      .catch(() => undefined);
  }, []);

  // Abgehakte Tagesplan-Tage: localStorage-Scan wie tagesplan.tsx (Prefix tagesplan-<userId>-)
  useEffect(() => {
    if (!userId) return;
    const prefix = `tagesplan-${userId}-`;
    const tage = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix) && localStorage.getItem(key) === "1") {
        tage.add(key.slice(prefix.length).split("-")[0] ?? "");
      }
    }
    setAbgehakteTage(tage.size);
  }, [userId]);

  // Gesamt-Trefferrate: alle topic_mastery-Zeilen (Rechnen + Lernblätter) + alle Wissenskarten
  const gesamt = useMemo(() => {
    const agg = Object.values(topicRows).reduce(
      (a, r) => ({ richtig: a.richtig + r.richtig, falsch: a.falsch + r.falsch }),
      { richtig: 0, falsch: 0 },
    );
    for (const r of cardRows) {
      agg.richtig += r.richtig;
      agg.falsch += r.falsch;
    }
    return agg;
  }, [topicRows, cardRows]);
  const gesamtN = gesamt.richtig + gesamt.falsch;
  const gesamtPct = gesamtN ? Math.round((100 * gesamt.richtig) / gesamtN) : 0;

  const todayTag = useMemo(() => PLAN_TAGE.find((t) => t.date_label === today), [today]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Willkommen beim AP1 Trainer
        </h1>
        <p className="text-sm text-muted-foreground">
          Dein persönlicher Lernbereich für die IHK-Abschlussprüfung Teil 1 (Fachinformatiker
          Systemintegration).
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Prüfungs-Countdown
        </p>
        <p className="mt-2 text-5xl font-bold tracking-tight text-primary">{tage}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Noch {tage} {tage === 1 ? "Tag" : "Tage"} bis zur AP1 am 30.09.2026
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MODULE.map((m) => (
            <Link
              key={m.url}
              to={m.url}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <m.icon className="size-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{m.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fortschritt
        </h2>
        {datenError && <p className="text-sm text-destructive">{datenError}</p>}
        {gesamtN > 0 ? (
          <Link
            to="/fortschritt"
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">Gesamt-Trefferrate</span>
              <span className="font-mono text-xs text-muted-foreground">
                {gesamt.richtig}/{gesamtN} Aufgaben richtig · {gesamtPct}%
              </span>
            </div>
            <Progress value={gesamtPct} className="mt-3" />
          </Link>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Noch nichts geübt — starte mit „Rechnen üben“.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tagesplan
        </h2>
        <Link
          to="/tagesplan"
          className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          {todayTag ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  Heute: Tag {todayTag.day} von {PLAN_TAGE.length}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {abgehakteTage}/{PLAN_TAGE.length} Tage abgehakt
                </span>
              </div>
              <Progress
                value={Math.round((100 * abgehakteTage) / PLAN_TAGE.length)}
                className="mt-3"
              />
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Der Tagesplan deckt die letzten {PLAN_TAGE.length} Tage vor der Prüfung ab (
              {PLAN_TAGE[0]!.date_label} – {PLAN_TAGE[PLAN_TAGE.length - 1]!.date_label}).
            </span>
          )}
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fehlerliste
        </h2>
        {fehlerError && <p className="text-sm text-destructive">{fehlerError}</p>}
        <Link
          to="/fortschritt"
          className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">Offene Fehler</span>
            <span className="font-mono text-xs text-muted-foreground">
              {offeneFehler === null ? "–" : offeneFehler}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {offeneFehler === 0
              ? "Keine offenen Fehler — weiter so."
              : "Fehler aus den Probeprüfungen nacharbeiten."}
          </p>
        </Link>
      </section>
    </div>
  );
}
