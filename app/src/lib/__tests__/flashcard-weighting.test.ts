import { describe, expect, it } from "vitest";

import { kartengewicht, pickWeighted } from "../flashcard-weighting";

/** Deterministischer PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("kartengewicht", () => {
  it("neue, ungesehene Karten haben ein reales Gewicht (Regression: Gewicht 0)", () => {
    expect(kartengewicht(0, 0)).toBe(0.5);
  });

  it("häufig falsche Karten wiegen mehr als neue; Gewicht bleibt in (0, 1)", () => {
    expect(kartengewicht(10, 0)).toBeGreaterThan(kartengewicht(0, 0));
    expect(kartengewicht(10, 0)).toBeLessThan(1);
  });

  it("sicher beherrschte Karten wiegen am wenigsten, aber nie 0", () => {
    const w = kartengewicht(0, 50);
    expect(w).toBeGreaterThan(0);
    expect(w).toBeLessThan(kartengewicht(0, 0));
  });

  it("monoton: mehr falsch ⇒ schwerer, mehr richtig ⇒ leichter", () => {
    expect(kartengewicht(5, 0)).toBeGreaterThan(kartengewicht(4, 0));
    expect(kartengewicht(0, 5)).toBeLessThan(kartengewicht(0, 4));
  });
});

describe("pickWeighted — Auswahlchancen", () => {
  const pool = [
    { id: "neu", falsch: 0, richtig: 0 },
    { id: "schwierig", falsch: 9, richtig: 1 },
    { id: "sicher", falsch: 0, richtig: 19 },
  ];

  function draw(seed: number, n: number): Map<string, number> {
    const rng = mulberry32(seed);
    const counts = new Map<string, number>();
    for (let i = 0; i < n; i++) {
      const id = pickWeighted(pool, rng)!;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }

  it("neue Karten verschwinden nicht aus der Auswahl", () => {
    const counts = draw(1234, 2000);
    const neu = counts.get("neu") ?? 0;
    // Gewicht 0,5/13 ≈ 3,8 % Erwartung — deutlich drüber heißt: sichtbar im Pool
    expect(neu).toBeGreaterThan(2000 * 0.02);
  });

  it("häufig falsche Karten werden bevorzugt (höchster Anteil)", () => {
    const counts = draw(1234, 2000);
    expect(counts.get("schwierig")!).toBeGreaterThan(counts.get("neu")!);
    expect(counts.get("schwierig")!).toBeGreaterThan(counts.get("sicher")!);
  });

  it("sichere Karten bleiben trotzdem erreichbar", () => {
    const counts = draw(1234, 2000);
    expect(counts.get("sicher") ?? 0).toBeGreaterThan(2000 * 0.02);
  });

  it("leerer Pool ergibt null", () => {
    expect(pickWeighted([], mulberry32(1))).toBeNull();
  });
});
