import { describe, expect, it } from "vitest";

import { collectExpandableIds, searchMindmap, type MindmapNode } from "../mindmap";

const tree: MindmapNode = {
  id: "root",
  name: "IHK AP1 FISI",
  children: [
    {
      id: "root-0",
      name: "Netzwerk",
      children: [
        {
          id: "root-0-0",
          name: "Kernbegriffe",
          children: [
            { id: "root-0-0-0", name: "Subnetzmaske" },
            { id: "root-0-0-1", name: "Routingtabelle" },
          ],
        },
      ],
    },
    {
      id: "root-1",
      name: "Hardware",
      children: [
        { id: "root-1-0", name: "Kernbegriffe", children: [{ id: "root-1-0-0", name: "Switch" }] },
      ],
    },
  ],
};

describe("searchMindmap", () => {
  it("leere Suche liefert leere Ergebnismengen", () => {
    const result = searchMindmap(tree, "");
    expect(result.matchedIds.size).toBe(0);
    expect(result.expandedIds.size).toBe(0);
  });

  it("findet einen tief verschachtelten Treffer", () => {
    const result = searchMindmap(tree, "subnetzmaske");
    expect(result.matchedIds.has("root-0-0-0")).toBe(true);
  });

  it("klappt den Pfad zum Treffer auf, nicht aber Geschwisterzweige", () => {
    const result = searchMindmap(tree, "subnetzmaske");
    expect(result.expandedIds.has("root")).toBe(true);
    expect(result.expandedIds.has("root-0")).toBe(true);
    expect(result.expandedIds.has("root-0-0")).toBe(true);
    expect(result.expandedIds.has("root-1")).toBe(false);
  });

  it("Suche ist case-insensitiv und matcht Teilstrings", () => {
    const result = searchMindmap(tree, "ROUTING");
    expect(result.matchedIds.has("root-0-0-1")).toBe(true);
  });

  it("ein Treffer auf einem Blatt ohne Kinder erfordert kein eigenes Aufklappen", () => {
    const result = searchMindmap(tree, "switch");
    expect(result.matchedIds.has("root-1-0-0")).toBe(true);
    expect(result.expandedIds.has("root-1-0-0")).toBe(false);
  });

  it("kein Treffer liefert leere Mengen", () => {
    const result = searchMindmap(tree, "nichts-davon");
    expect(result.matchedIds.size).toBe(0);
    expect(result.expandedIds.size).toBe(0);
  });
});

describe("collectExpandableIds", () => {
  it("enthält nur Knoten mit Kindern", () => {
    const ids = collectExpandableIds(tree);
    expect(ids).toContain("root");
    expect(ids).toContain("root-0-0");
    expect(ids).not.toContain("root-0-0-0");
  });

  it("ein Baum ohne Kinder liefert eine leere Liste", () => {
    expect(collectExpandableIds({ id: "x", name: "Blatt" })).toEqual([]);
  });
});
