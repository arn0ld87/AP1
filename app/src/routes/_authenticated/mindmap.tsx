import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

import { AiGeneratedNotice } from "@/components/ai-generated-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MINDMAP_ROOT, collectExpandableIds, searchMindmap, type MindmapNode } from "@/lib/mindmap";

export const Route = createFileRoute("/_authenticated/mindmap")({
  head: () => ({
    meta: [
      { title: "Mindmap – AP1 Trainer" },
      {
        name: "description",
        content: "Themen-Mindmap aus den Altprüfungen, generiert mit NotebookLM.",
      },
      { property: "og:title", content: "Mindmap – AP1 Trainer" },
    ],
  }),
  component: MindmapPage,
});

const ALL_EXPANDABLE_IDS = collectExpandableIds(MINDMAP_ROOT);
const BRANCHES = MINDMAP_ROOT.children ?? [];

function MindmapPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const search = useMemo(() => searchMindmap(MINDMAP_ROOT, query), [query]);
  const visibleExpanded = query.trim() ? new Set([...expanded, ...search.expandedIds]) : expanded;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mindmap</h1>
        <p className="text-sm text-muted-foreground">
          {BRANCHES.length} Hauptäste zu {MINDMAP_ROOT.name}.
        </p>
        <AiGeneratedNotice />
      </header>

      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen…"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExpanded(new Set(ALL_EXPANDABLE_IDS))}
          >
            Alles aufklappen
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
            Alles zuklappen
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {BRANCHES.map((branch) => (
          <BranchCard
            key={branch.id}
            node={branch}
            expanded={visibleExpanded}
            query={query}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  );
}

function BranchCard({
  node,
  expanded,
  query,
  onToggle,
}: {
  node: MindmapNode;
  expanded: Set<string>;
  query: string;
  onToggle: (id: string) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.id);
  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => hasChildren && onToggle(node.id)}
        aria-expanded={hasChildren ? isOpen : undefined}
        disabled={!hasChildren}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-accent/40 disabled:cursor-default"
      >
        <span className="font-semibold text-foreground">
          <Highlight text={node.name} query={query} />
        </span>
        {hasChildren && (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>
      {hasChildren && isOpen && (
        <div className="border-t border-border px-4 py-3">
          <TreeList
            nodes={node.children!}
            expanded={expanded}
            query={query}
            onToggle={onToggle}
            depth={0}
          />
        </div>
      )}
    </section>
  );
}

function TreeList({
  nodes,
  expanded,
  query,
  onToggle,
  depth,
}: {
  nodes: MindmapNode[];
  expanded: Set<string>;
  query: string;
  onToggle: (id: string) => void;
  depth: number;
}) {
  return (
    <ul className={cn("space-y-1", depth > 0 && "mt-1 border-l border-border pl-4")}>
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          expanded={expanded}
          query={query}
          onToggle={onToggle}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function TreeItem({
  node,
  expanded,
  query,
  onToggle,
  depth,
}: {
  node: MindmapNode;
  expanded: Set<string>;
  query: string;
  onToggle: (id: string) => void;
  depth: number;
}) {
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.id);
  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-1.5 rounded-md py-1 text-left text-sm text-card-foreground hover:text-foreground"
        >
          {isOpen ? (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <Highlight text={node.name} query={query} />
        </button>
      ) : (
        <span className="flex items-center gap-1.5 py-1 pl-5 text-sm text-muted-foreground">
          <Highlight text={node.name} query={query} />
        </span>
      )}
      {hasChildren && isOpen && (
        <TreeList
          nodes={node.children!}
          expanded={expanded}
          query={query}
          onToggle={onToggle}
          depth={depth + 1}
        />
      )}
    </li>
  );
}

/** Hebt den ersten Treffer der Suche im Knotennamen hervor. */
function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary/25 px-0.5 text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
