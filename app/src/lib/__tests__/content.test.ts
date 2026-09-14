import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface Teilaufgabe {
  id?: string | null;
  teil?: string | null;
  frage?: string | null;
  musterloesung?: string | null;
  max_punkte?: number | null;
  visual_type?: string | null;
  visual_alt?: string | null;
  answer_schema?: { kind?: string } | null;
}

interface Aufgabe {
  aufgabe_nr: number;
  teilaufgaben: Teilaufgabe[];
}

interface Pruefung {
  exam_id: string;
  title: string;
  ausgangssituation: string;
  aufgaben: Aufgabe[];
}

const DATA = resolve(process.cwd(), "../data/migration/exam_questions.json");

describe("Probeprüfungs-Daten (Content-Validierung)", () => {
  const exams: Pruefung[] = JSON.parse(readFileSync(DATA, "utf8"));

  it("JSON ist valide und enthält genau die 3 Probeprüfungen", () => {
    expect(exams).toHaveLength(3);
    expect(exams.map((e) => e.exam_id).sort()).toEqual([
      "probepruefung_01",
      "probepruefung_02",
      "probepruefung_03",
    ]);
  });

  it.each(exams.map((e) => [e.exam_id] as const))(
    "%s: exakt 100 Punkte, jede Teilaufgabe vollständig, Schlüssel eindeutig",
    (examId) => {
      const exam = exams.find((e) => e.exam_id === examId)!;
      expect(exam.aufgaben).toHaveLength(4);
      let sum = 0;
      const keys = new Set<string>();
      for (const a of exam.aufgaben) {
        expect(Number.isInteger(a.aufgabe_nr)).toBe(true);
        for (const t of a.teilaufgaben) {
          expect(
            t.frage?.trim().length ?? 0,
            `${examId} A${a.aufgabe_nr}: frage fehlt`,
          ).toBeGreaterThan(0);
          expect(
            t.musterloesung?.trim().length ?? 0,
            `${examId} A${a.aufgabe_nr}: musterloesung fehlt`,
          ).toBeGreaterThan(0);
          expect(t.max_punkte ?? 0, `${examId} A${a.aufgabe_nr}: max_punkte fehlt`).toBeGreaterThan(
            0,
          );
          sum += t.max_punkte!;
          const key = `${a.aufgabe_nr}:${t.teil ?? ""}`;
          expect(keys.has(key), `${examId}: doppelter Schlüssel ${key}`).toBe(false);
          keys.add(key);
        }
      }
      expect(sum, `${examId}: Gesamtpunkte`).toBe(100);
    },
  );

  it("ausgangssituation ist je Prüfung vorhanden", () => {
    for (const e of exams) {
      expect(e.ausgangssituation?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it("enthält die kuratierten visuellen Prüfungsaufgaben samt strukturierten Antworten", () => {
    const visualTasks = exams.flatMap((exam) =>
      exam.aufgaben.flatMap((aufgabe) => aufgabe.teilaufgaben.filter((teil) => teil.visual_type)),
    );
    expect(visualTasks.map((teil) => teil.visual_type).sort()).toEqual([
      "er",
      "er",
      "gantt",
      "netzplan",
    ]);
    expect(visualTasks.every((teil) => (teil.visual_alt?.trim().length ?? 0) > 0)).toBe(true);
    expect(
      visualTasks
        .map((teil) => teil.answer_schema?.kind)
        .filter(Boolean)
        .sort(),
    ).toEqual(["multiField", "table"]);
  });
});
