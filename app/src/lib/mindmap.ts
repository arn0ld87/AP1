// Relativer Import statt "@/data/..." — der Alias ist unter vitest.config.ts nicht
// auflösbar (siehe topic-mastery.test.ts), und mindmap.ts wird direkt getestet, nicht gemockt.
import rawMindmap from "../data/notebooklm/mindmap.json";

/**
 * Von NotebookLM aus den Altprüfungen generierte Mindmap (siehe
 * `app/src/data/notebooklm/mindmap.json`), 14 Hauptäste, Tiefe 3. Die
 * Rohdaten kennen nur `name`/`children` — `withIds` ergänzt stabile,
 * pfadbasierte IDs für Auf-/Zuklapp-Zustand und Suchtreffer.
 */
export interface MindmapNode {
  id: string;
  name: string;
  children?: MindmapNode[];
}

interface RawMindmapNode {
  name: string;
  children?: RawMindmapNode[];
}

function withIds(raw: RawMindmapNode, id: string): MindmapNode {
  const children = raw.children?.map((child, i) => withIds(child, `${id}-${i}`));
  return children ? { id, name: raw.name, children } : { id, name: raw.name };
}

export const MINDMAP_ROOT: MindmapNode = withIds(rawMindmap as RawMindmapNode, "root");

/** Alle IDs von Knoten mit Kindern — Basis für "Alles auf-/zuklappen". */
export function collectExpandableIds(node: MindmapNode): string[] {
  if (!node.children?.length) return [];
  const ids = [node.id];
  for (const child of node.children) ids.push(...collectExpandableIds(child));
  return ids;
}

export interface MindmapSearchResult {
  /** Knoten, deren Name selbst auf die Suche passt. */
  matchedIds: Set<string>;
  /** Vorfahren eines Treffers — müssen aufgeklappt werden, damit der Treffer sichtbar wird. */
  expandedIds: Set<string>;
}

/**
 * Case-insensitive Teilstring-Suche über den Baum. Liefert zusätzlich zu den
 * Treffern selbst die Menge der Knoten, die aufgeklappt werden müssen, um
 * jeden Treffer sichtbar zu machen (alle Vorfahren plus — falls der Treffer
 * selbst Kinder mit weiteren Treffern hat — der Treffer-Knoten selbst).
 */
export function searchMindmap(root: MindmapNode, query: string): MindmapSearchResult {
  const q = query.trim().toLowerCase();
  const matchedIds = new Set<string>();
  const expandedIds = new Set<string>();
  if (!q) return { matchedIds, expandedIds };

  function walk(node: MindmapNode, ancestorIds: string[]): boolean {
    const isMatch = node.name.toLowerCase().includes(q);
    let childMatched = false;
    for (const child of node.children ?? []) {
      if (walk(child, [...ancestorIds, node.id])) childMatched = true;
    }
    if (isMatch) matchedIds.add(node.id);
    if (isMatch || childMatched) {
      for (const ancestorId of ancestorIds) expandedIds.add(ancestorId);
      if (childMatched) expandedIds.add(node.id);
    }
    return isMatch || childMatched;
  }

  walk(root, []);
  return { matchedIds, expandedIds };
}
