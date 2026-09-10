import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { FORMEL_KAPITEL } from "@/lib/ap1-formelsammlung";
import { renderMarkdown } from "@/lib/markdown";

export const Route = createFileRoute("/_authenticated/formelsammlung")({
  head: () => ({
    meta: [
      { title: "Formelsammlung – AP1 Trainer" },
      {
        name: "description",
        content:
          "Alle Formeln, die in den analysierten AP1-Prüfungen tatsächlich gebraucht wurden — mit Quellenangabe.",
      },
      { property: "og:title", content: "Formelsammlung – AP1 Trainer" },
    ],
  }),
  component: FormelsammlungPage,
});

function FormelsammlungPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FORMEL_KAPITEL;
    return FORMEL_KAPITEL.filter(
      (k) => k.title.toLowerCase().includes(q) || k.body_markdown.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Formelsammlung</h1>
        <p className="text-sm text-muted-foreground">
          {FORMEL_KAPITEL.length} Abschnitte — nur Formeln mit Beleg aus den Altprüfungen.
        </p>
      </header>

      <div className="sticky top-0 z-10 -mx-4 space-y-4 bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen in Titel und Volltext…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-8">
        <main className="min-w-0 flex-1 space-y-8">
          {filtered.map((k) => (
            <section key={k.id} id={k.id} className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{k.title}</h2>
              <div
                className="rounded-xl border border-border bg-card p-4 md:p-5 [&_pre]:bg-muted/60 [&_table]:text-xs"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(k.body_markdown) }}
              />
            </section>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Kein Abschnitt gefunden.
            </p>
          )}
        </main>

        <nav
          aria-label="Inhaltsverzeichnis"
          className="sticky top-28 hidden h-fit w-56 shrink-0 space-y-1 border-l border-border pl-4 lg:block"
        >
          {filtered.map((k) => (
            <a
              key={k.id}
              href={`#${k.id}`}
              className="block truncate text-xs text-muted-foreground hover:text-foreground"
            >
              {k.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
