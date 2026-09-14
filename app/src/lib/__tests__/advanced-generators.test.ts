import { afterEach, describe, expect, it } from "vitest";

import { ADVANCED_GEN } from "../ap1-advanced-generators";
import { evaluateTaskAnswer } from "../ap1-tasks";

/**
 * Ergänzt structured-tasks.test.ts (dort: ein fixer Aufruf je Familie, Struktur +
 * Lösbarkeit) um das, was für SCALAR_GEN in generators.test.ts bereits Standard ist,
 * für ADVANCED_GEN aber fehlte:
 *   1. Seed-Determinismus (gleicher Seed → exakt gleiche Aufgabe)
 *   2. Ein-Seed-Sweeps über viele Läufe je Familie, damit Bugs, die nur bei
 *      bestimmten Zufallswerten auftreten, nicht durch einen einzelnen
 *      ungeseedeten Testlauf verdeckt werden
 *   3. Unabhängige fachliche Nachrechnung dort, wo das ohne Spiegelung der
 *      Generator-Logik möglich ist (Definitionsgleichungen bzw. Rückrechnung
 *      aus den angezeigten `given`-Werten statt Aufruf interner Hilfsfunktionen)
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

const FAMILIES = ["erm", "netzplan", "gantt", "bab", "stufenleiter"] as const;

/** Deutsches Zahlenformat: "." Tausendertrenner, "," Dezimaltrenner. */
function parseDe(s: string): number {
  const cleaned = s.replace(/[^0-9.,-]/g, "");
  return Number(cleaned.replace(/\./g, "").replace(",", "."));
}

function given(task: { given: [string, string][] }, label: string): string {
  const row = task.given.find(([k]) => k === label);
  if (!row) throw new Error(`given-Feld fehlt: "${label}"`);
  return row[1];
}

/**
 * Spiegelt exakt die Rundungsregel aus ap1-structured-generators.ts (`round`):
 * kaufmännisch auf `dec` Nachkommastellen. Nötig, weil calculateBab/calculateStepDown
 * nach jedem Zwischenschritt runden — eine unabhängige Neuberechnung ohne dieselbe
 * Rundung an denselben Stellen würde bei .5-Grenzfällen (z. B. 9,625 → 9,63) einen
 * Scheinfehler melden, der keiner ist.
 */
function round(value: number, dec = 2): number {
  return Math.round(value * 10 ** dec) / 10 ** dec;
}

function solvable(task: Parameters<typeof evaluateTaskAnswer>[0]): void {
  if (task.kind === "table") {
    const editable = task.rows.flatMap((row) => row.cells).filter((c) => c.editable);
    const correct = Object.fromEntries(editable.map((c) => [c.id, String(c.answer)]));
    expect(evaluateTaskAnswer(task, correct).correct).toBe(true);
  } else if (task.kind === "diagram") {
    if (task.response.kind === "multiField") {
      const correct = Object.fromEntries(task.response.fields.map((f) => [f.id, String(f.answer)]));
      expect(evaluateTaskAnswer(task, correct).correct).toBe(true);
    } else {
      expect(evaluateTaskAnswer(task, String(task.response.answer)).correct).toBe(true);
    }
  }
}

describe("ADVANCED_GEN — Seed-Determinismus", () => {
  it.each(FAMILIES.map((f) => [f] as const))(
    "%s: gleicher Seed → strukturell identische Aufgabe",
    (family) => {
      for (const seed of [1, 42, 12345]) {
        const t1 = seededRun(seed, () => ADVANCED_GEN[family]());
        const t2 = seededRun(seed, () => ADVANCED_GEN[family]());
        expect(t1, `Seed ${seed}`).toEqual(t2);
      }
    },
  );

  it("unterschiedliche Seeds erzeugen (mit hoher Wahrscheinlichkeit) unterschiedliche Aufgaben — kein konstanter Generator", () => {
    // netzplan und bab enthalten Zufallswerte (rnd) — bei 50 verschiedenen Seeds
    // muss mindestens eine Abweichung von Seed 1 auftreten, sonst ignoriert der
    // Generator Math.random komplett.
    const base = seededRun(1, () => ADVANCED_GEN.bab());
    let differs = false;
    for (let seed = 2; seed <= 50; seed++) {
      const t = seededRun(seed, () => ADVANCED_GEN.bab());
      if (JSON.stringify(t) !== JSON.stringify(base)) {
        differs = true;
        break;
      }
    }
    expect(differs).toBe(true);
  });
});

describe("ADVANCED_GEN — je Familie lösbar über viele Seeds (nicht nur ein Aufruf)", () => {
  it.each(FAMILIES.map((f) => [f] as const))(
    "%s: 200 Seeds, jeweils lösbar mit der hinterlegten Antwort",
    (family) => {
      for (let seed = 1; seed <= 200; seed++) {
        seededRun(seed, () => {
          const task = ADVANCED_GEN[family]();
          solvable(task);
        });
      }
    },
  );
});

describe("erm — Antwort unabhängig aus der Visual-Datenstruktur abgeleitet (nicht hartkodiert)", () => {
  it("Kardinalitäts- und Fremdschlüssel-Frage stimmen mit relations/attributes des ER-Diagramms überein", () => {
    let cardinalityCases = 0;
    let foreignKeyCases = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = ADVANCED_GEN.erm();
        if (task.kind !== "diagram" || task.visual.type !== "er" || task.response.kind !== "text") {
          throw new Error("erm-Task hat unerwartete Struktur");
        }
        const data = task.visual.data;
        if (task.q.includes("Kardinalität")) {
          cardinalityCases++;
          const rel = data.relations.find((r) => r.id === "erteilt")!;
          expect(task.response.answer).toBe(`${rel.fromCardinality}:${rel.toCardinality}`);
        } else {
          foreignKeyCases++;
          const kunde = data.entities.find((e) => e.id === "kunde")!;
          const auftrag = data.entities.find((e) => e.id === "auftrag")!;
          const primaryKey = kunde.attributes.find((a) => a.key === "primary")!.name;
          expect(task.response.answer).toBe(primaryKey);
          // Unabhängige Gegenprobe: dieselbe Spalte muss in AUFTRAG als Fremdschlüssel auftauchen.
          expect(auftrag.attributes.some((a) => a.name === primaryKey && a.key === "foreign")).toBe(
            true,
          );
        }
      });
    }
    expect(cardinalityCases).toBeGreaterThan(50);
    expect(foreignKeyCases).toBeGreaterThan(50);
  });
});

describe("netzplan (ADVANCED_GEN) — Definitionsgleichungen und Konsistenz zwischen Visual und Antwortfeldern", () => {
  it("FEZ=FAZ+Dauer, SAZ=SEZ-Dauer, GP=SAZ-FAZ=SEZ-FEZ, kritisch⇔GP=0 — für jeden Knoten des Netzplans", () => {
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = ADVANCED_GEN.netzplan();
        if (task.kind !== "diagram" || task.visual.type !== "netzplan") {
          throw new Error("kein netzplan-Visual");
        }
        const { nodes, projectDuration } = task.visual.data;
        for (const node of nodes) {
          expect(node.fez, `Seed ${seed} Knoten ${node.id}`).toBe(node.faz + node.duration);
          expect(node.saz, `Seed ${seed} Knoten ${node.id}`).toBe(node.sez - node.duration);
          expect(node.totalFloat, `Seed ${seed} Knoten ${node.id}`).toBe(node.saz - node.faz);
          expect(node.totalFloat, `Seed ${seed} Knoten ${node.id}`).toBe(node.sez - node.fez);
          expect(Boolean(node.critical), `Seed ${seed} Knoten ${node.id}`).toBe(
            node.totalFloat === 0,
          );
        }
        // Kausalität: kein Nachfolger darf früher beginnen als ein Vorgänger endet.
        for (const edge of task.visual.data.edges) {
          const from = nodes.find((n) => n.id === edge.from)!;
          const to = nodes.find((n) => n.id === edge.to)!;
          expect(to.faz, `Seed ${seed} Kante ${edge.from}->${edge.to}`).toBeGreaterThanOrEqual(
            from.fez,
          );
        }
        // E ist im festen Beispielprojekt der einzige Endknoten ohne Nachfolger.
        const endNode = nodes.find((n) => n.id === "E")!;
        expect(projectDuration).toBe(endNode.fez);
      });
    }
  });

  it("multiField-Antwortfelder stimmen mit den Werten des (im Visual als 'versteckt' markierten) Zielknotens überein", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = ADVANCED_GEN.netzplan();
        if (
          task.kind !== "diagram" ||
          task.visual.type !== "netzplan" ||
          task.response.kind !== "multiField"
        ) {
          return;
        }
        const target = task.visual.data.nodes.find((n) => n.hiddenFields);
        if (!target) return;
        const byId = Object.fromEntries(task.response.fields.map((f) => [f.id, f.answer]));
        expect(byId["faz"], `Seed ${seed}`).toBe(target.faz);
        expect(byId["fez"], `Seed ${seed}`).toBe(target.fez);
        expect(byId["saz"], `Seed ${seed}`).toBe(target.saz);
        expect(byId["sez"], `Seed ${seed}`).toBe(target.sez);
        expect(byId["gp"], `Seed ${seed}`).toBe(target.totalFloat);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(250);
  });
});

describe("gantt (ADVANCED_GEN) — Meilenstein unabhängig aus den Balken hergeleitet", () => {
  it("Go-live = spätestes Ende aller Vorgangsbalken; jeder Nachfolger beginnt erst nach allen Vorgängern", () => {
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = ADVANCED_GEN.gantt();
        if (
          task.kind !== "diagram" ||
          task.visual.type !== "gantt" ||
          task.response.kind !== "scalar"
        ) {
          throw new Error("gantt-Task hat unerwartete Struktur");
        }
        const { tasks, duration } = task.visual.data;
        const bars = tasks.filter((t) => !t.milestone);
        const spaeteste = Math.max(...bars.map((t) => t.end));

        expect(task.response.answer, `Seed ${seed}`).toBe(spaeteste);
        expect(duration, `Seed ${seed}`).toBe(spaeteste);

        const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
        for (const t of tasks) {
          for (const predId of t.predecessors ?? []) {
            const pred = byId[predId]!;
            expect(t.start, `Seed ${seed} ${predId}->${t.id}`).toBeGreaterThanOrEqual(pred.end);
          }
        }
      });
    }
  });
});

describe("bab (ADVANCED_GEN) — Zellwerte unabhängig aus den angezeigten Beträgen/Prozentsätzen nachgerechnet", () => {
  it("Verteilungsbeträge, Summenzeile und Zuschlagssätze stimmen mit einer Neuberechnung aus den given-Werten überein", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = ADVANCED_GEN.bab();
        if (task.kind !== "table") throw new Error("bab-Task ist keine Table-Task");

        const [mieteAmountStr, mieteSharesStr] = given(task, "Miete").split(" EUR · ");
        const [energieAmountStr, energieSharesStr] = given(task, "Energie").split(" EUR · ");
        const mieteAmount = parseDe(mieteAmountStr!);
        const energieAmount = parseDe(energieAmountStr!);
        const mieteShares = [...mieteSharesStr!.matchAll(/(\d+)\s*%/g)].map(
          (m) => Number(m[1]) / 100,
        );
        const energieShares = [...energieSharesStr!.matchAll(/(\d+)\s*%/g)].map(
          (m) => Number(m[1]) / 100,
        );
        const bases = [...given(task, "Zuschlagsgrundlagen").matchAll(/([\d.]+)\s*EUR/g)].map((m) =>
          parseDe(m[1]!),
        );

        // Spaltenreihenfolge folgt input.costCenters: material, fertigung, verwaltung.
        const columnIds = task.columns.map((c) => c.id);
        expect(columnIds, `Seed ${seed}`).toEqual(["material", "fertigung", "verwaltung"]);

        const mieteRow = task.rows.find((r) => r.id === "miete")!;
        const energieRow = task.rows.find((r) => r.id === "energie")!;
        const summeRow = task.rows.find((r) => r.id === "summe")!;
        const zuschlagRow = task.rows.find((r) => r.id === "zuschlag")!;

        columnIds.forEach((colId, i) => {
          const erwarteteMiete = round(mieteAmount * mieteShares[i]!);
          const erwarteteEnergie = round(energieAmount * energieShares[i]!);
          const erwarteteSumme = round(erwarteteMiete + erwarteteEnergie);
          const erwarteterZuschlag = round((erwarteteSumme / bases[i]!) * 100);

          expect(
            mieteRow.cells.find((c) => c.id === `miete.${colId}`)!.answer,
            `Seed ${seed} miete.${colId}`,
          ).toBeCloseTo(erwarteteMiete, 6);
          expect(
            energieRow.cells.find((c) => c.id === `energie.${colId}`)!.answer,
            `Seed ${seed} energie.${colId}`,
          ).toBeCloseTo(erwarteteEnergie, 6);
          expect(
            summeRow.cells.find((c) => c.id === `summe.${colId}`)!.answer,
            `Seed ${seed} summe.${colId}`,
          ).toBeCloseTo(erwarteteSumme, 6);
          expect(
            zuschlagRow.cells.find((c) => c.id === `zuschlag.${colId}`)!.answer,
            `Seed ${seed} zuschlag.${colId}`,
          ).toBeCloseTo(erwarteterZuschlag, 6);
        });
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(250);
  });
});

describe("stufenleiter (ADVANCED_GEN) — Stufenleiterverfahren unabhängig aus den given-Werten nachgerechnet", () => {
  it("Verrechnungssätze und Endkosten stimmen mit der Lehrbuch-Formel überein (bereits geschlossene Stelle erhält keine Rückverrechnung)", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = ADVANCED_GEN.stufenleiter();
        if (task.kind !== "table") throw new Error("stufenleiter-Task ist keine Table-Task");

        const primaerStr = given(task, "Primäre Gemeinkosten");
        const m = primaerStr.match(
          /Energie ([\d.,]+) · Reinigung ([\d.,]+) · Fertigung ([\d.,]+) · Verwaltung ([\d.,]+) EUR/,
        )!;
        const energiePrimaer = parseDe(m[1]!);
        const reinigungPrimaer = parseDe(m[2]!);
        const fertigungPrimaer = parseDe(m[3]!);
        const verwaltungPrimaer = parseDe(m[4]!);

        const energieLeistung = [...given(task, "Energie-Leistung").matchAll(/(\d+)\s*ME/g)].map(
          (x) => Number(x[1]),
        ); // [reinigung, fertigung, verwaltung]
        const reinigungLeistung = [
          ...given(task, "Reinigungs-Leistung").matchAll(/(\d+)\s*ME/g),
        ].map((x) => Number(x[1])); // [energie, fertigung, verwaltung]

        // Stufe 1: Energie wird vollständig auf alle Restlichen verteilt (100 ME gesamt).
        // Rundung Schritt für Schritt wie in calculateStepDown: cost→2, rate→6, allocation→2.
        const energieGesamtME = energieLeistung.reduce((a, b) => a + b, 0);
        const energieCost = round(energiePrimaer);
        const energieSatz = round(energieCost / energieGesamtME, 6);
        const energieAnReinigung = round(energieSatz * energieLeistung[0]!);
        const energieAnFertigung = round(energieSatz * energieLeistung[1]!);
        const energieAnVerwaltung = round(energieSatz * energieLeistung[2]!);

        // Stufe 2: Reinigung erhält den Energie-Anteil, verrechnet aber nur noch auf die
        // verbliebenen Hauptkostenstellen — die 10 ME "an Energie" sind nach dem
        // Schließen von Energie nicht mehr rückverrechenbar (Stufenleiter-Prinzip).
        const reinigungGesamtKosten = round(reinigungPrimaer + energieAnReinigung);
        const reinigungGesamtME = reinigungLeistung[1]! + reinigungLeistung[2]!; // fertigung + verwaltung
        const reinigungSatz = round(reinigungGesamtKosten / reinigungGesamtME, 6);
        const reinigungAnFertigung = round(reinigungSatz * reinigungLeistung[1]!);
        const reinigungAnVerwaltung = round(reinigungSatz * reinigungLeistung[2]!);

        const fertigungEnd = round(
          round(fertigungPrimaer + energieAnFertigung) + reinigungAnFertigung,
        );
        const verwaltungEnd = round(
          round(verwaltungPrimaer + energieAnVerwaltung) + reinigungAnVerwaltung,
        );

        const energieRow = task.rows.find((r) => r.id === "energie")!;
        const reinigungRow = task.rows.find((r) => r.id === "reinigung")!;
        const endRow = task.rows.find((r) => r.id === "end")!;

        expect(
          energieRow.cells.find((c) => c.id === "energie.basis")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(energiePrimaer, 6);
        expect(
          energieRow.cells.find((c) => c.id === "energie.satz")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(energieSatz, 6);
        expect(
          energieRow.cells.find((c) => c.id === "energie.fertigung")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(energieAnFertigung, 6);
        expect(
          energieRow.cells.find((c) => c.id === "energie.verwaltung")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(energieAnVerwaltung, 6);

        expect(
          reinigungRow.cells.find((c) => c.id === "reinigung.basis")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(reinigungGesamtKosten, 6);
        expect(
          reinigungRow.cells.find((c) => c.id === "reinigung.satz")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(reinigungSatz, 6);
        expect(
          reinigungRow.cells.find((c) => c.id === "reinigung.fertigung")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(reinigungAnFertigung, 6);
        expect(
          reinigungRow.cells.find((c) => c.id === "reinigung.verwaltung")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(reinigungAnVerwaltung, 6);

        expect(
          endRow.cells.find((c) => c.id === "end.fertigung")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(fertigungEnd, 6);
        expect(
          endRow.cells.find((c) => c.id === "end.verwaltung")!.answer,
          `Seed ${seed}`,
        ).toBeCloseTo(verwaltungEnd, 6);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(250);
  });
});
