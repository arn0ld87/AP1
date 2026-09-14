import { describe, expect, it } from "vitest";

import { evaluateTaskAnswer, parseGermanNumber, type ScalarTask } from "../ap1-tasks";

const scalarBase = {
  topic: "test",
  pts: 1,
  lead: "Testlead",
  q: "Testfrage",
  given: [],
  steps: [],
  trap: "",
};

describe("parseGermanNumber", () => {
  it("liest Tausenderpunkte im deutschen Format (Regression P1-1: 1.685 = 1685)", () => {
    expect(parseGermanNumber("1.685")).toBe(1685);
    expect(parseGermanNumber("1.685.000")).toBe(1685000);
    expect(parseGermanNumber("10.000")).toBe(10000);
    expect(parseGermanNumber("255")).toBe(255);
  });

  it("behandelt das Komma als Dezimaltrenner", () => {
    expect(parseGermanNumber("0,5")).toBe(0.5);
    expect(parseGermanNumber("1,68")).toBe(1.68);
    expect(parseGermanNumber("19,00")).toBe(19);
  });

  it("kombiniert Tausenderpunkte mit Dezimalkomma", () => {
    expect(parseGermanNumber("1.685,5")).toBe(1685.5);
    expect(parseGermanNumber("2.048,25")).toBe(2048.25);
  });

  it("lässt Punkte ohne 3er-Gruppenstruktur Dezimalpunkte", () => {
    expect(parseGermanNumber("1.68")).toBe(1.68);
    expect(parseGermanNumber("0.125")).toBe(0.125);
    expect(parseGermanNumber(".685")).toBe(0.685);
  });

  it("ignoriert Leerzeichen", () => {
    expect(parseGermanNumber(" 1.685 ")).toBe(1685);
    expect(parseGermanNumber("1 685")).toBe(1685);
  });
});

describe("evaluateTaskAnswer (Regression P1-1)", () => {
  it("bewertet die angezeigte Musterlösung (de-DE formatiert) als korrekt", () => {
    const task: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: 1685,
      unit: "EUR",
    };
    // formatExpected zeigt 1685 per toLocaleString("de-DE") als "1.685" an —
    // wer diese Anzeige abtippt, muss als korrekt bewertet werden.
    const angezeigt = (1685).toLocaleString("de-DE");
    expect(angezeigt).toBe("1.685");
    expect(evaluateTaskAnswer(task, angezeigt).correct).toBe(true);
  });

  it("bewertet lokale Eingabe mit Tausenderpunkt und Dezimalkomma als korrekt", () => {
    const task: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: 2048.25,
      unit: "KiB",
      dec: 2,
    };
    expect(evaluateTaskAnswer(task, "2.048,25").correct).toBe(true);
  });
});
