import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PLAN_TAGE, type PlanTag } from "@/lib/ap1-tagesplan";
import { renderMarkdown } from "@/lib/markdown";

export const Route = createFileRoute("/_authenticated/tagesplan")({
  head: () => ({
    meta: [
      { title: "Tagesplan – AP1 Trainer" },
      {
        name: "description",
        content: "21 Tage bis zur AP1: Tagesplan mit Checkboxen, gruppiert in drei Wochen.",
      },
      { property: "og:title", content: "Tagesplan – AP1 Trainer" },
    ],
  }),
  component: TagesplanPage,
});

function todayLabel(): string {
  // date_label-Format: "Do 10.09." — Tag+Monat des laufenden Jahres
  const now = new Date();
  const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][now.getDay()];
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${wd} ${dd}.${mm}.`;
}

function useChecked(userId: string | null) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const prefix = `tagesplan-${userId}-`;
    const found: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix) && localStorage.getItem(key) === "1") {
        found.push(key.slice(prefix.length));
      }
    }
    setChecked(new Set(found));
  }, [userId]);

  const toggle = (day: number, index: number) => {
    if (!userId) return;
    const key = `${day}-${index}`;
    const storageKey = `tagesplan-${userId}-${day}-${index}`;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        localStorage.removeItem(storageKey);
      } else {
        next.add(key);
        localStorage.setItem(storageKey, "1");
      }
      return next;
    });
  };

  return { checked, toggle };
}

function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth
        .getUser()
        .then(({ data }) => setUserId(data.user?.id ?? null))
        .catch(() => undefined);
    });
  }, []);
  return userId;
}

function DayCard({
  tag,
  open,
  onToggleOpen,
  checked,
  onCheck,
  isToday,
}: {
  tag: PlanTag;
  open: boolean;
  onToggleOpen: () => void;
  checked: Set<string>;
  onCheck: (day: number, index: number) => void;
  isToday?: boolean;
}) {
  return (
    <article
      id={`tag-${tag.day}`}
      className={cn(
        "scroll-mt-24 rounded-xl border bg-card shadow-sm transition-colors",
        isToday ? "border-primary/60 ring-1 ring-primary/40" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="font-mono text-xs text-muted-foreground">{tag.date_label}</span>
        <span className="flex-1 font-medium text-foreground">
          Tag {tag.day} · {tag.title.replace(/\*\*/g, "")}
        </span>
        {isToday && (
          <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs text-primary">heute</span>
        )}
      </button>

      {open && (
        <div className="border-t border-border p-4 pt-3">
          {tag.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-8 border-b border-border px-1 py-2" />
                    <th className="border-b border-border px-2 py-2 text-left font-semibold text-muted-foreground">
                      Dauer
                    </th>
                    <th className="border-b border-border px-2 py-2 text-left font-semibold text-muted-foreground">
                      Thema
                    </th>
                    <th className="border-b border-border px-2 py-2 text-left font-semibold text-muted-foreground">
                      Ziel
                    </th>
                    <th className="border-b border-border px-2 py-2 text-left font-semibold text-muted-foreground">
                      Lernform
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tag.items.map((item, i) => {
                    return (
                      <tr key={i} className="align-top">
                        <td className="px-1 py-2">
                          <DayCheckbox tag={tag} index={i} checked={checked} onCheck={onCheck} />
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 font-mono text-xs text-muted-foreground">
                          {item.dauer}
                        </td>
                        <td className="px-2 py-2 font-medium text-foreground">{item.thema}</td>
                        <td
                          className="px-2 py-2 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs"
                          dangerouslySetInnerHTML={{ __html: renderInline(item.ziel) }}
                        />
                        <td className="px-2 py-2 text-xs text-muted-foreground">{item.lernform}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : tag.raw_text ? (
            <div
              className="[&_b]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ul]:list-disc [&_ul]:space-y-1"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(tag.raw_text) }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Keine Einträge.</p>
          )}
        </div>
      )}
    </article>
  );
}

/** Inline-Renderer für Tabellenzellen (Bold + inline Code, escaped). */
function renderInline(s: string): string {
  const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 font-mono text-xs">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

function DayCheckbox({
  tag,
  index,
  checked,
  onCheck,
}: {
  tag: PlanTag;
  index: number;
  checked: Set<string>;
  onCheck: (day: number, index: number) => void;
}) {
  const key = `${tag.day}-${index}`;
  const isDone = checked.has(key);
  return (
    <input
      type="checkbox"
      checked={isDone}
      onChange={() => onCheck(tag.day, index)}
      aria-label={`Tag ${tag.day} Punkt ${index + 1} erledigt`}
      className="size-4 accent-[var(--primary)]"
    />
  );
}

function TagesplanPage() {
  const userId = useUserId();
  const today = todayLabel();

  const todayTag = useMemo(() => PLAN_TAGE.find((t) => t.date_label === today), [today]);

  const [openDays, setOpenDays] = useState<Set<number>>(
    () => new Set(todayTag ? [todayTag.day] : [PLAN_TAGE[0]?.day ?? 1]),
  );

  const { checked, toggle } = useChecked(userId);

  useEffect(() => {
    if (todayTag) {
      // sanfter Scroll zum heutigen Tag
      document
        .getElementById(`tag-${todayTag.day}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weeks = useMemo(() => {
    const byWeek = new Map<number, PlanTag[]>();
    for (const t of PLAN_TAGE) {
      const arr = byWeek.get(t.week) ?? [];
      arr.push(t);
      byWeek.set(t.week, arr);
    }
    return [...byWeek.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tagesplan</h1>
        <p className="text-sm text-muted-foreground">
          21 Tage bis zur Prüfung ({PLAN_TAGE[0]!.date_label} –{" "}
          {PLAN_TAGE[PLAN_TAGE.length - 1]!.date_label}). Erledigtes wird lokal im Browser
          gespeichert.
        </p>
      </header>

      {weeks.map(([week, tage]) => (
        <section key={week} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Woche {week}
          </h2>
          <div className="space-y-2">
            {tage.map((t) => {
              const open = openDays.has(t.day);
              return (
                <DayCard
                  key={t.day}
                  tag={t}
                  open={open}
                  onToggleOpen={() =>
                    setOpenDays((prev) => {
                      const next = new Set(prev);
                      if (next.has(t.day)) next.delete(t.day);
                      else next.add(t.day);
                      return next;
                    })
                  }
                  checked={checked}
                  onCheck={toggle}
                  isToday={t.date_label === today}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
