/**
 * Aufgabenanalyse aus data/notebooklm/aufgabenanalyse.json (Task Material &
 * Aufgabenanalyse) — statischer Content, erzeugt aus notebooklm/aufgabenanalyse.tsv
 * via scripts/migrate/parse_aufgabenanalyse.py. Reine Filter-/Aggregationsfunktionen,
 * damit sie ohne DOM in Vitest testbar sind.
 */
import aufgabenRaw from "../data/notebooklm/aufgabenanalyse.json";

export interface AufgabeAnalyse {
  pruefungstermin: string;
  pruefung: string;
  aufgabe_nr: string;
  teilaufgabe: string;
  thema: string;
  unterthema: string;
  aufgabentyp: string;
  ist_rechenaufgabe: boolean;
  verwendete_formel: string;
  punkte: number | null;
  typische_fehlerfalle: string;
  loesung_vorhanden: boolean;
}

export const AUFGABEN: AufgabeAnalyse[] = aufgabenRaw as AufgabeAnalyse[];

export interface AufgabenFilter {
  thema?: string | undefined;
  pruefungstermin?: string | undefined;
  nurRechenaufgaben?: boolean | undefined;
  suche?: string | undefined;
}

/** Reihenfolge Sommer vor Winter desselben Startjahrs — für Selects/Sortierung. */
function terminSortKey(termin: string): number {
  const jahr = Number(termin.match(/\d{4}/)?.[0] ?? 0);
  const istWinter = termin.toLowerCase().startsWith("winter");
  return jahr * 2 + (istWinter ? 1 : 0);
}

/** Distinkte Prüfungstermine, chronologisch (Sommer vor Winter desselben Jahres). */
export function pruefungstermine(aufgaben: AufgabeAnalyse[]): string[] {
  return [...new Set(aufgaben.map((a) => a.pruefungstermin))].sort(
    (a, b) => terminSortKey(a) - terminSortKey(b),
  );
}

/** Distinkte Themen, alphabetisch. */
export function themen(aufgaben: AufgabeAnalyse[]): string[] {
  return [...new Set(aufgaben.map((a) => a.thema))].sort((a, b) => a.localeCompare(b, "de"));
}

/** Filtert nach Thema, Prüfungstermin, Rechenaufgabe-Flag und Freitext (Thema/Unterthema/Formel/Fehlerfalle). */
export function filterAufgaben(
  aufgaben: AufgabeAnalyse[],
  filter: AufgabenFilter,
): AufgabeAnalyse[] {
  const suche = filter.suche?.trim().toLowerCase();
  return aufgaben.filter((a) => {
    if (filter.thema && a.thema !== filter.thema) return false;
    if (filter.pruefungstermin && a.pruefungstermin !== filter.pruefungstermin) return false;
    if (filter.nurRechenaufgaben && !a.ist_rechenaufgabe) return false;
    if (suche) {
      const haystack =
        `${a.thema} ${a.unterthema} ${a.verwendete_formel} ${a.typische_fehlerfalle}`.toLowerCase();
      if (!haystack.includes(suche)) return false;
    }
    return true;
  });
}

export interface ThemenHaeufigkeit {
  thema: string;
  anzahl: number;
}

export interface ThemenPunktsumme {
  thema: string;
  punkte: number;
}

export interface AufgabenKennzahlen {
  anzahl: number;
  anzahlRechenaufgaben: number;
  anteilRechenaufgaben: number;
  topThemenNachHaeufigkeit: ThemenHaeufigkeit[];
  topThemenNachPunktsumme: ThemenPunktsumme[];
}

/** Kennzahlen für den Seitenkopf: Gesamtzahl, Rechenaufgaben-Anteil, Top-5-Themen je Metrik. */
export function berechneKennzahlen(aufgaben: AufgabeAnalyse[]): AufgabenKennzahlen {
  const anzahl = aufgaben.length;
  const anzahlRechenaufgaben = aufgaben.filter((a) => a.ist_rechenaufgabe).length;

  const haeufigkeitProThema = new Map<string, number>();
  const punkteProThema = new Map<string, number>();
  for (const a of aufgaben) {
    haeufigkeitProThema.set(a.thema, (haeufigkeitProThema.get(a.thema) ?? 0) + 1);
    punkteProThema.set(a.thema, (punkteProThema.get(a.thema) ?? 0) + (a.punkte ?? 0));
  }

  const topThemenNachHaeufigkeit = [...haeufigkeitProThema.entries()]
    .map(([thema, anzahl]) => ({ thema, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl)
    .slice(0, 5);

  const topThemenNachPunktsumme = [...punkteProThema.entries()]
    .map(([thema, punkte]) => ({ thema, punkte }))
    .sort((a, b) => b.punkte - a.punkte)
    .slice(0, 5);

  return {
    anzahl,
    anzahlRechenaufgaben,
    anteilRechenaufgaben: anzahl > 0 ? anzahlRechenaufgaben / anzahl : 0,
    topThemenNachHaeufigkeit,
    topThemenNachPunktsumme,
  };
}
