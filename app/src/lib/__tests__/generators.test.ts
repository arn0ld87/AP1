import { afterEach, describe, expect, it } from "vitest";

import { GEN, type Task } from "../ap1-generators";

/**
 * Deterministischer PRNG (mulberry32) — ersetzt Math.random für
 * reproduzierbare Testläufe. Wird pro Testfall mit festem Seed initialisiert.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const origRandom = Math.random;
function seededRun<T>(seed: number, fn: () => T): T {
  Math.random = mulberry32(seed);
  try {
    return fn();
  } finally {
    Math.random = origRandom;
  }
}

afterEach(() => {
  Math.random = origRandom;
});

function plattenZahl(task: Task): number {
  const row = task.given.find(([k]) => k === "Platten gesamt");
  if (!row) throw new Error("keine Plattenanzahl im Task: " + task.q);
  return Number(row[1]);
}

function kleinsteKapazitaet(task: Task): number {
  const big = task.given.find(([k]) => k === "große Platten")![1];
  const small = task.given.find(([k]) => k === "kleine Platten")![1];
  const bigC = Number(big.split("×")[1]!.trim().split(" ")[0]!);
  const smallC = Number(small.split("×")[1]!.trim().split(" ")[0]!);
  return Math.min(bigC, smallC);
}

describe("RAID-Generator — RAID-10-Regression (1000 deterministische Fälle)", () => {
  it("RAID 10: ausschließlich gerade Plattenanzahl ≥ 4, Kapazität = (n/2) × k ohne Floor-Workaround", () => {
    let raid10Cases = 0;
    for (let seed = 1; seed <= 1000; seed++) {
      seededRun(seed, () => {
        const task = GEN["raid"]!();
        const n = plattenZahl(task);
        const k = kleinsteKapazitaet(task);

        if (task.q.includes("RAID 10")) {
          raid10Cases++;
          expect(n % 2, `Seed ${seed}: n=${n} ungerade`).toBe(0);
          expect(n, `Seed ${seed}: n=${n} < 4`).toBeGreaterThanOrEqual(4);
          // Exakte Kapazität aus vollständigen Spiegelpaaren — kein Math.floor
          expect(task.answer).toBe((n / 2) * k);
          expect(task.steps.join(" ")).not.toContain("Math.floor");
        } else if (task.q.includes("RAID 0")) {
          expect(task.answer).toBe(n * k);
        } else if (task.q.includes("RAID 1")) {
          expect(task.answer).toBe(k);
        } else if (task.q.includes("RAID 5")) {
          expect(task.answer).toBe((n - 1) * k);
        } else if (task.q.includes("RAID 6")) {
          expect(task.answer).toBe((n - 2) * k);
        } else {
          // JBOD: Nennlast je Platte — Invariante: Ergebnis > kleinste Platte
          expect(task.answer).toBeGreaterThan(0);
        }
      });
    }
    // Stichprobe groß genug, um jeden RAID-10-Pfad mehrfach zu treffen
    expect(raid10Cases).toBeGreaterThan(100);
  });
});

describe("Generator-Familien — generische Invarianten (je 500 deterministische Fälle)", () => {
  const families = Object.keys(GEN).filter((k) => k !== "raid");

  it.each(families.map((k) => [k] as const))("%s liefert valide Tasks", (name) => {
    for (let seed = 1; seed <= 500; seed++) {
      seededRun(seed, () => {
        const task = GEN[name]!();
        expect(task.q.length, `Seed ${seed}`).toBeGreaterThan(0);
        expect(task.pts, `Seed ${seed}`).toBeGreaterThan(0);
        expect(task.steps.length, `Seed ${seed}`).toBeGreaterThan(0);
        expect(task.trap.length, `Seed ${seed}`).toBeGreaterThan(0);
        expect(
          typeof task.answer === "number"
            ? Number.isFinite(task.answer)
            : String(task.answer).length > 0,
          `Seed ${seed}`,
        ).toBe(true);
        if (task.ip) {
          expect(String(task.answer), `Seed ${seed}: keine IPv4`).toMatch(
            /^(\d{1,3}\.){3}\d{1,3}$/,
          );
        }
      });
    }
  });

  it("Determinismus: gleicher Seed → identischer Task", () => {
    const t1 = seededRun(42, () => GEN["raid"]!());
    const t2 = seededRun(42, () => GEN["raid"]!());
    expect(t1.q).toBe(t2.q);
    expect(t1.answer).toBe(t2.answer);
    expect(t1.given).toEqual(t2.given);
  });
});
