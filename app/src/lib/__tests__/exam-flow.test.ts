import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  gesamtpunkteVon,
  gradeAllQuestions,
  maxPunkteVon,
  notenstufe,
  persistAttemptFinish,
  submitExamFlow,
  upsertSelfGrade,
  type Frage,
  type GradeFnOutput,
} from "../exam-flow";

const frage = (id: string, max: number): Frage => ({
  id,
  aufgabe_nr: 1,
  teil: "a",
  frage: "F?",
  max_punkte: max,
  musterloesung: "M",
  intro: null,
  ausgangssituation: null,
});

describe("notenstufe (IHK-Schlüssel, keine Bestehenslogik)", () => {
  it.each([
    [100, "1"],
    [92, "1"],
    [91, "2"],
    [81, "2"],
    [80, "3"],
    [67, "3"],
    [66, "4"],
    [50, "4"],
    [49, "5"],
    [30, "5"],
    [29, "6"],
    [0, "6"],
  ])("%i Punkte → Note %s", (p, expected) => {
    expect(notenstufe(p)).toBe(expected);
  });
});

describe("gesamtpunkteVon / maxPunkteVon", () => {
  it("summiert vergebene Punkte; null und fehlend zählen 0", () => {
    const fragen = [frage("a", 10), frage("b", 20), frage("c", 30)];
    expect(
      gesamtpunkteVon(fragen, {
        a: { punkte: 7, begruendung: "" },
        b: { punkte: null, begruendung: "" },
      }),
    ).toBe(7);
    expect(maxPunkteVon(fragen)).toBe(60);
  });

  it("leeres Ergebnis ergibt 0 (Regression: ehemals 0 Punkte gespeichert)", () => {
    const fragen = [frage("a", 10)];
    expect(gesamtpunkteVon(fragen, {})).toBe(0);
  });
});

describe("gradeAllQuestions", () => {
  const fragen = [frage("a", 10), frage("b", 20), frage("c", 30)];

  it("alle Bewertungen erfolgreich — Punktzahl je Frage gesetzt, nicht aus State", async () => {
    const callGrade = vi.fn(async ({ question_id }: { question_id: string }) =>
      question_id === "b"
        ? ({ punkte: 15, begruendung: "ok" } satisfies GradeFnOutput)
        : ({ punkte: 0, begruendung: "ok" } satisfies GradeFnOutput),
    );
    const results = await gradeAllQuestions(fragen, { a: "x", b: "y", c: "z" }, "att-1", callGrade);
    expect(results["a"]!.punkte).toBe(0);
    expect(results["b"]!.punkte).toBe(15);
    expect(results["c"]!.punkte).toBe(0);
    expect(callGrade).toHaveBeenCalledTimes(3);
    // gesamt = Summe aus Ergebniswert, exakt mit Einzelpunkten übereinstimmend
    expect(gesamtpunkteVon(fragen, results)).toBe(15);
  });

  it("einzelner Bewertungsfehler → punkte null für die betroffene Frage, Rest bleibt korrekt", async () => {
    const callGrade = vi.fn(async ({ question_id }: { question_id: string }) => {
      if (question_id === "b") throw new Error("HTTP 500");
      return { punkte: 5, begruendung: "ok" };
    });
    const results = await gradeAllQuestions(fragen, {}, "att-1", callGrade);
    expect(results["a"]!.punkte).toBe(5);
    expect(results["b"]!.punkte).toBeNull();
    expect(results["b"]!.begruendung).toBe("KI-Bewertung nicht verfügbar.");
    expect(results["c"]!.punkte).toBe(5);
    expect(gesamtpunkteVon(fragen, results)).toBe(10);
  });

  it("antworttext wird aus answers übernommen; fehlende Antwort = leerer Text", async () => {
    const callGrade = vi.fn(async () => ({ punkte: 1, begruendung: "" }));
    await gradeAllQuestions([frage("a", 5)], { a: "meine Antwort" }, "att-1", callGrade);
    expect(callGrade).toHaveBeenCalledWith({
      question_id: "a",
      attempt_id: "att-1",
      antworttext: "meine Antwort",
    });
  });
});

describe("submitExamFlow", () => {
  const fragen = [frage("a", 10), frage("b", 20)];

  it("manuelle Abgabe: persistiert Summe exakt aus Einzelpunkten, Reihenfolge grading → persist", async () => {
    const calls: string[] = [];
    const callGrade = vi.fn(async ({ question_id }: { question_id: string }) => {
      calls.push("grade:" + question_id);
      return { punkte: question_id === "a" ? 8 : 17, begruendung: "" };
    });
    const persist = vi.fn(async (gesamtpunkte: number) => {
      calls.push("persist:" + gesamtpunkte);
    });
    const { gesamtpunkte, results } = await submitExamFlow({
      fragen,
      answers: { a: "1", b: "2" },
      attemptId: "att-1",
      callGrade,
      persist,
    });
    expect(gesamtpunkte).toBe(25);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith(25);
    expect(calls).toEqual(["grade:a", "grade:b", "persist:25"]);
    expect(results["b"]!.punkte).toBe(17);
  });

  it("Timeout- und Abgabe-Flow nutzen denselben deterministischen Pfad (State-unabhängig)", async () => {
    const persist = vi.fn(async () => {});
    // Simulation: Timeout löst aus, während ein bereits laufender Submit
    // dieselben Inputs erhält — gleiches Ergebnis, kein Zustandsbezug.
    const run = () =>
      submitExamFlow({
        fragen,
        answers: { a: "x", b: "y" },
        attemptId: "att-1",
        callGrade: async () => ({ punkte: 10, begruendung: "" }),
        persist,
      });
    const r1 = await run();
    const r2 = await run();
    expect(r1.gesamtpunkte).toBe(r2.gesamtpunkte);
    expect(r1.gesamtpunkte).toBe(20);
    expect(persist).toHaveBeenCalledTimes(2);
  });

  it("nicht bewertbare Fragen (KI-Fehler) zählen 0 in der Gesamtsumme", async () => {
    const persist = vi.fn(async () => {});
    const { gesamtpunkte } = await submitExamFlow({
      fragen,
      answers: {},
      attemptId: "att-1",
      callGrade: async ({ question_id }) => {
        if (question_id === "a") throw new Error("Bedrock down");
        return { punkte: 20, begruendung: "" };
      },
      persist,
    });
    expect(gesamtpunkte).toBe(20);
    expect(persist).toHaveBeenCalledWith(20);
  });

  it("Persistenzfehler propagiert (Exam-Update schlägt fehl → Fehler sichtbar)", async () => {
    const persist = vi.fn(async () => {
      throw new Error("DB unreachable");
    });
    await expect(
      submitExamFlow({
        fragen,
        answers: {},
        attemptId: "att-1",
        callGrade: async () => ({ punkte: 5, begruendung: "" }),
        persist,
      }),
    ).rejects.toThrow("DB unreachable");
  });
});

describe("persistAttemptFinish / upsertSelfGrade (Supabase-{ error }-Feld)", () => {
  // Supabase-js wirft bei Schreibfehlern nicht, sondern liefert { error }.
  // Die Helfer müssen genau dieses Feld in eine Exception überführen.
  const fakeDb = (result: { error: { message: string } | null }) => {
    const eq = vi.fn(async () => result);
    const update = vi.fn(() => ({ eq }));
    const upsert = vi.fn(async () => result);
    const from = vi.fn((table: string) => (table === "exam_attempts" ? { update } : { upsert }));
    return { db: { from } as unknown as SupabaseClient, eq, update, upsert };
  };

  it("persistAttemptFinish: zurückgegebenes { error } wird zu Exception", async () => {
    const { db, update } = fakeDb({ error: { message: "row-level security" } });
    await expect(persistAttemptFinish(db, "att-1", 25)).rejects.toThrow("row-level security");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ gesamtpunkte: 25, finished_at: expect.any(String) }),
    );
  });

  it("persistAttemptFinish: error null → resolves, gefiltert auf attempt-id", async () => {
    const { db, eq, update } = fakeDb({ error: null });
    await expect(persistAttemptFinish(db, "att-1", 25)).resolves.toBeUndefined();
    expect(update).toHaveBeenCalledTimes(1);
    expect(eq).toHaveBeenCalledWith("id", "att-1");
  });

  it("upsertSelfGrade: zurückgegebenes { error } wird zu Exception", async () => {
    const { db } = fakeDb({ error: { message: "duplicate key value" } });
    await expect(
      upsertSelfGrade(db, { attemptId: "att-1", questionId: "q1", antworttext: "x", punkte: 3 }),
    ).rejects.toThrow("duplicate key value");
  });

  it("upsertSelfGrade: error null → Upsert mit korrektem Payload und onConflict", async () => {
    const { db, upsert } = fakeDb({ error: null });
    await expect(
      upsertSelfGrade(db, { attemptId: "att-1", questionId: "q1", antworttext: "x", punkte: 3 }),
    ).resolves.toBeUndefined();
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt_id: "att-1",
        question_id: "q1",
        antworttext: "x",
        ki_punkte: 3,
        ki_feedback: "Selbst eingeschätzt.",
      }),
      { onConflict: "attempt_id,question_id" },
    );
  });
});
