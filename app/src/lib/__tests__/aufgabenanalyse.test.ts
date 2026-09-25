import { describe, expect, it } from "vitest";

import {
  AUFGABEN,
  berechneKennzahlen,
  filterAufgaben,
  pruefungstermine,
  themen,
  type AufgabeAnalyse,
} from "../aufgabenanalyse";

function aufgabe(overrides: Partial<AufgabeAnalyse>): AufgabeAnalyse {
  return {
    pruefungstermin: "Sommer 2020",
    pruefung: "AP1 (Ganzheitliche Aufgabe I)",
    aufgabe_nr: "1",
    teilaufgabe: "a",
    thema: "Netzwerke",
    unterthema: "Subnetting",
    aufgabentyp: "Rechnen",
    ist_rechenaufgabe: true,
    verwendete_formel: "Subnetzberechnung (binär)",
    punkte: 5,
    typische_fehlerfalle: "Falsche Netzmaske",
    loesung_vorhanden: true,
    ...overrides,
  };
}

const FIXTURE: AufgabeAnalyse[] = [
  aufgabe({ pruefungstermin: "Sommer 2020", thema: "Netzwerke", punkte: 5 }),
  aufgabe({
    pruefungstermin: "Winter 2020/21",
    thema: "Netzwerke",
    unterthema: "IPv4",
    ist_rechenaufgabe: false,
    punkte: 3,
    typische_fehlerfalle: "Gateway vertauscht",
  }),
  aufgabe({
    pruefungstermin: "Sommer 2021",
    thema: "Datenbanken (SQL)",
    unterthema: "3. Normalform",
    verwendete_formel: "Nicht relevant",
    ist_rechenaufgabe: false,
    punkte: 21,
    typische_fehlerfalle: "Transitive Abhängigkeit übersehen",
  }),
];

describe("pruefungstermine", () => {
  it("liefert distinkte Termine chronologisch (Sommer vor Winter desselben Jahres)", () => {
    expect(pruefungstermine(FIXTURE)).toEqual(["Sommer 2020", "Winter 2020/21", "Sommer 2021"]);
  });
});

describe("themen", () => {
  it("liefert distinkte Themen alphabetisch sortiert", () => {
    expect(themen(FIXTURE)).toEqual(["Datenbanken (SQL)", "Netzwerke"]);
  });
});

describe("filterAufgaben", () => {
  it("ohne Filter liefert alle Einträge unverändert", () => {
    expect(filterAufgaben(FIXTURE, {})).toHaveLength(3);
  });

  it("filtert nach Thema", () => {
    const result = filterAufgaben(FIXTURE, { thema: "Netzwerke" });
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.thema === "Netzwerke")).toBe(true);
  });

  it("filtert nach Prüfungstermin", () => {
    const result = filterAufgaben(FIXTURE, { pruefungstermin: "Sommer 2021" });
    expect(result).toHaveLength(1);
    expect(result[0]?.thema).toBe("Datenbanken (SQL)");
  });

  it("filtert nur Rechenaufgaben", () => {
    const result = filterAufgaben(FIXTURE, { nurRechenaufgaben: true });
    expect(result).toHaveLength(1);
    expect(result[0]?.ist_rechenaufgabe).toBe(true);
  });

  it("Freitextsuche findet Treffer in Thema, Unterthema, Formel und Fehlerfalle", () => {
    expect(filterAufgaben(FIXTURE, { suche: "gateway" })).toHaveLength(1);
    expect(filterAufgaben(FIXTURE, { suche: "normalform" })).toHaveLength(1);
    expect(filterAufgaben(FIXTURE, { suche: "transitive" })).toHaveLength(1);
    expect(filterAufgaben(FIXTURE, { suche: "nichts-passt-hier" })).toHaveLength(0);
  });

  it("Freitextsuche ist case-insensitiv", () => {
    expect(filterAufgaben(FIXTURE, { suche: "GATEWAY" })).toHaveLength(1);
  });

  it("kombiniert mehrere Filter (UND-Verknüpfung)", () => {
    const result = filterAufgaben(FIXTURE, { thema: "Netzwerke", nurRechenaufgaben: true });
    expect(result).toHaveLength(1);
    expect(result[0]?.pruefungstermin).toBe("Sommer 2020");
  });
});

describe("berechneKennzahlen", () => {
  it("zählt Aufgaben und berechnet den Rechenaufgaben-Anteil", () => {
    const kennzahlen = berechneKennzahlen(FIXTURE);
    expect(kennzahlen.anzahl).toBe(3);
    expect(kennzahlen.anzahlRechenaufgaben).toBe(1);
    expect(kennzahlen.anteilRechenaufgaben).toBeCloseTo(1 / 3);
  });

  it("ermittelt Top-Themen nach Häufigkeit absteigend", () => {
    const kennzahlen = berechneKennzahlen(FIXTURE);
    expect(kennzahlen.topThemenNachHaeufigkeit[0]).toEqual({ thema: "Netzwerke", anzahl: 2 });
  });

  it("ermittelt Top-Themen nach Punktsumme absteigend, null zählt als 0", () => {
    const kennzahlen = berechneKennzahlen([...FIXTURE, aufgabe({ thema: "UML", punkte: null })]);
    expect(kennzahlen.topThemenNachPunktsumme[0]).toEqual({
      thema: "Datenbanken (SQL)",
      punkte: 21,
    });
    expect(kennzahlen.topThemenNachPunktsumme.find((t) => t.thema === "UML")?.punkte).toBe(0);
  });

  it("liefert Kennzahl 0 bei leerer Liste ohne Division durch 0", () => {
    const kennzahlen = berechneKennzahlen([]);
    expect(kennzahlen.anzahl).toBe(0);
    expect(kennzahlen.anteilRechenaufgaben).toBe(0);
    expect(kennzahlen.topThemenNachHaeufigkeit).toEqual([]);
  });
});

describe("AUFGABEN (Content-Validierung)", () => {
  it("enthält alle 551 Teilaufgaben aus der TSV-Quelle", () => {
    expect(AUFGABEN).toHaveLength(551);
  });

  it("jede Aufgabe hat Thema, Prüfungstermin und einen gültigen Punktetyp", () => {
    for (const a of AUFGABEN) {
      expect(a.thema.length).toBeGreaterThan(0);
      expect(a.pruefungstermin.length).toBeGreaterThan(0);
      expect(a.punkte === null || typeof a.punkte === "number").toBe(true);
    }
  });
});
