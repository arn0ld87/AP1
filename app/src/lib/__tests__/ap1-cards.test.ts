import { describe, expect, it } from "vitest";

import { CARDS } from "../ap1-cards";
import { T } from "../ap1-topics";

describe("Wissenskarten (CARDS)", () => {
  it("jede Karte referenziert einen existierenden Themen-Key", () => {
    const unknown = CARDS.filter((c) => !T[c.topic]);
    expect(unknown.map((c) => ({ id: c.id, topic: c.topic }))).toEqual([]);
  });

  it("alle Karten-IDs sind eindeutig", () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("jede Karte hat nicht-leere Frage und Antwort", () => {
    const empty = CARDS.filter((c) => !c.q.trim() || !c.a.trim());
    expect(empty.map((c) => c.id)).toEqual([]);
  });
});
