import { describe, expect, it } from "vitest";

import { ADVANCED_GEN } from "../ap1-advanced-generators";
import {
  calculateBab,
  calculateNetworkPlan,
  calculateStepDown,
} from "../ap1-structured-generators";
import { evaluateTaskAnswer, type MultiFieldTask, type TableTask } from "../ap1-tasks";

describe("calculateNetworkPlan", () => {
  it("berechnet parallele Pfade, Puffer und kritischen Pfad aus einem unabhängigen Beispiel", () => {
    const result = calculateNetworkPlan([
      { id: "A", name: "Analyse", duration: 2, predecessors: [] },
      { id: "B", name: "Beschaffung", duration: 4, predecessors: ["A"] },
      { id: "C", name: "Konfiguration", duration: 3, predecessors: ["A"] },
      { id: "D", name: "Abnahme", duration: 2, predecessors: ["B", "C"] },
    ]);

    expect(result.projectDuration).toBe(8);
    expect(result.criticalPath).toEqual(["A", "B", "D"]);
    expect(result.activities).toMatchObject([
      { id: "A", faz: 0, fez: 2, saz: 0, sez: 2, totalFloat: 0, freeFloat: 0 },
      { id: "B", faz: 2, fez: 6, saz: 2, sez: 6, totalFloat: 0, freeFloat: 0 },
      { id: "C", faz: 2, fez: 5, saz: 3, sez: 6, totalFloat: 1, freeFloat: 1 },
      { id: "D", faz: 6, fez: 8, saz: 6, sez: 8, totalFloat: 0, freeFloat: 0 },
    ]);
  });

  it("weist unbekannte Vorgänger und Zyklen zurück", () => {
    expect(() =>
      calculateNetworkPlan([{ id: "A", name: "A", duration: 1, predecessors: ["X"] }]),
    ).toThrow(/unbekannt/i);
    expect(() =>
      calculateNetworkPlan([
        { id: "A", name: "A", duration: 1, predecessors: ["B"] },
        { id: "B", name: "B", duration: 1, predecessors: ["A"] },
      ]),
    ).toThrow(/zyklus/i);
  });
});

describe("calculateBab", () => {
  it("verteilt Gemeinkosten und berechnet Zuschlagssätze", () => {
    const result = calculateBab({
      costCenters: [
        { id: "fertigung", name: "Fertigung", allocationBase: 3_500 },
        { id: "verwaltung", name: "Verwaltung", allocationBase: 2_000 },
      ],
      overheads: [
        { id: "miete", name: "Miete", amount: 1_000, shares: { fertigung: 0.6, verwaltung: 0.4 } },
        {
          id: "energie",
          name: "Energie",
          amount: 500,
          shares: { fertigung: 0.2, verwaltung: 0.8 },
        },
      ],
    });

    expect(result.allocations).toEqual({
      miete: { fertigung: 600, verwaltung: 400 },
      energie: { fertigung: 100, verwaltung: 400 },
    });
    expect(result.totals).toEqual({ fertigung: 700, verwaltung: 800 });
    expect(result.surchargeRates).toEqual({ fertigung: 20, verwaltung: 40 });
  });
});

describe("calculateStepDown", () => {
  it("verrechnet Hilfskostenstellen in vorgegebener Reihenfolge nur auf offene Stellen", () => {
    const result = calculateStepDown({
      order: ["energie", "reinigung"],
      centers: [
        { id: "energie", name: "Energie", kind: "service", primaryCost: 1_000 },
        { id: "reinigung", name: "Reinigung", kind: "service", primaryCost: 500 },
        { id: "fertigung", name: "Fertigung", kind: "main", primaryCost: 2_000 },
      ],
      services: {
        energie: { reinigung: 20, fertigung: 80 },
        reinigung: { energie: 10, fertigung: 70 },
      },
    });

    expect(result.steps[0]).toMatchObject({ centerId: "energie", rate: 10 });
    expect(result.steps[1]).toMatchObject({ centerId: "reinigung", rate: 10 });
    expect(result.finalCosts).toEqual({ energie: 0, reinigung: 0, fertigung: 3_500 });
  });
});

describe("evaluateTaskAnswer", () => {
  it("akzeptiert Dezimalkomma und bewertet Multi-Field-Antworten feldweise", () => {
    const task: MultiFieldTask = {
      kind: "multiField",
      topic: "netzplan",
      pts: 5,
      lead: "",
      q: "Knoten ergänzen",
      given: [],
      steps: [],
      trap: "",
      fields: [
        { id: "faz", label: "FAZ", answer: 2, dec: 0 },
        { id: "dauer", label: "Dauer", answer: 2.5, unit: "Tage", dec: 1 },
      ],
    };

    const result = evaluateTaskAnswer(task, { faz: "2", dauer: "2,5" });
    expect(result.correct).toBe(true);
    expect(result.fields["dauer"]).toMatchObject({ correct: true, expected: "2,5" });
  });

  it("liefert bei Tabellen eine auswertbare Zellmatrix", () => {
    const task: TableTask = {
      kind: "table",
      topic: "bab",
      pts: 4,
      lead: "",
      q: "BAB ergänzen",
      given: [],
      steps: [],
      trap: "",
      columns: [
        { id: "fertigung", label: "Fertigung", unit: "EUR" },
        { id: "verwaltung", label: "Verwaltung", unit: "EUR" },
      ],
      rows: [
        {
          id: "miete",
          label: "Miete",
          cells: [
            { id: "miete.fertigung", answer: 600, dec: 0, editable: true },
            { id: "miete.verwaltung", answer: 400, dec: 0, editable: true },
          ],
        },
      ],
    };

    const result = evaluateTaskAnswer(task, {
      "miete.fertigung": "600",
      "miete.verwaltung": "450",
    });
    expect(result.correct).toBe(false);
    expect(result.fields["miete.fertigung"]?.correct).toBe(true);
    expect(result.fields["miete.verwaltung"]).toMatchObject({ correct: false, expected: "400" });
  });
});

describe("ADVANCED_GEN", () => {
  it.each(["erm", "netzplan", "gantt", "bab", "stufenleiter"] as const)(
    "%s erzeugt vollständige und auswertbare strukturierte Aufgaben",
    (topic) => {
      const task = ADVANCED_GEN[topic]();
      expect(task.topic).toBe(topic);
      expect(task.q.length).toBeGreaterThan(10);
      expect(task.steps.length).toBeGreaterThan(1);
      expect(task.visual).toBeDefined();

      if (task.kind === "table") {
        const editable = task.rows.flatMap((row) => row.cells).filter((cell) => cell.editable);
        expect(editable.length).toBeGreaterThan(1);
        const correct = Object.fromEntries(editable.map((cell) => [cell.id, String(cell.answer)]));
        expect(evaluateTaskAnswer(task, correct).correct).toBe(true);
      } else if (task.kind === "diagram") {
        if (task.response.kind === "multiField") {
          const correct = Object.fromEntries(
            task.response.fields.map((field) => [field.id, String(field.answer)]),
          );
          expect(evaluateTaskAnswer(task, correct).correct).toBe(true);
        } else {
          expect(evaluateTaskAnswer(task, String(task.response.answer)).correct).toBe(true);
        }
      }
    },
  );

  it("Netzplan-Visual übernimmt sämtliche Werte aus derselben Fachberechnung", () => {
    const task = ADVANCED_GEN.netzplan();
    expect(task.kind).toBe("diagram");
    if (task.kind !== "diagram" || task.visual.type !== "netzplan") return;
    for (const node of task.visual.data.nodes) {
      expect(node.fez).toBe(node.faz + node.duration);
      expect(node.sez).toBe(node.saz + node.duration);
      expect(node.totalFloat).toBe(node.saz - node.faz);
      expect(node.critical).toBe(node.totalFloat === 0);
    }
  });
});
