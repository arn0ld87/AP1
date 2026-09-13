import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createSingleFlightGuard,
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

  it("aufeinanderfolgende Abgaben liefern denselben deterministischen Wert (State-unabhängig)", async () => {
    const persist = vi.fn(async () => {});
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

describe("persistAttemptFinish (Supabase-{ error }-Feld)", () => {
  // Supabase-js wirft bei Schreibfehlern nicht, sondern liefert { error }.
  // Der Helfer muss genau dieses Feld in eine Exception überführen.
  const fakeDb = (result: { error: { message: string } | null }) => {
    const eq = vi.fn(async () => result);
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    return { db: { from } as unknown as SupabaseClient, eq, update };
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
});

describe("createSingleFlightGuard (Regression: Timer-Ablauf + manueller Submit 'gleichzeitig' durften nicht beide bewerten/persistieren)", () => {
  it("manueller Submit und Timer feuern quasi gleichzeitig — genau ein Durchlauf, keine doppelte Bewertung", async () => {
    let laufend = 0;
    let maxGleichzeitig = 0;
    let durchlaeufe = 0;
    const guard = createSingleFlightGuard();
    const abschlussFlow = async () => {
      laufend++;
      maxGleichzeitig = Math.max(maxGleichzeitig, laufend);
      durchlaeufe++;
      await new Promise((r) => setTimeout(r, 5)); // simuliert Bewertung + Persistenz
      laufend--;
    };

    // Kein await zwischen den beiden Aufrufen: bildet echtes "gleichzeitig"
    // ab (Timer-Callback und Klick-Handler laufen im selben Tick los).
    const manuellerSubmit = guard.run(abschlussFlow);
    const timeoutSubmit = guard.run(abschlussFlow);
    await Promise.all([manuellerSubmit, timeoutSubmit]);

    expect(durchlaeufe).toBe(1); // nicht 2 — der zweite Aufruf war ein No-op
    expect(maxGleichzeitig).toBe(1); // zu keinem Zeitpunkt liefen beide parallel
    expect(guard.isRunning()).toBe(false); // Guard nach Abschluss wieder frei
  });

  it("nacheinander abgeschickt (kein Überlapp) läuft der Flow bei jedem Aufruf erneut", async () => {
    let durchlaeufe = 0;
    const guard = createSingleFlightGuard();
    const abschlussFlow = async () => {
      durchlaeufe++;
    };
    await guard.run(abschlussFlow);
    await guard.run(abschlussFlow);
    expect(durchlaeufe).toBe(2);
  });

  it("Fehler im Flow geben den Guard wieder frei (kein Deadlock nach fehlgeschlagener Abgabe)", async () => {
    let durchlaeufe = 0;
    const guard = createSingleFlightGuard();
    await expect(
      guard.run(async () => {
        durchlaeufe++;
        throw new Error("Persistenz fehlgeschlagen");
      }),
    ).rejects.toThrow("Persistenz fehlgeschlagen");
    expect(guard.isRunning()).toBe(false);
    await guard.run(async () => {
      durchlaeufe++;
    });
    expect(durchlaeufe).toBe(2);
  });
});

describe("upsertSelfGrade (RPC submit_self_grade — Regression: exam_attempts.gesamtpunkte blieb nach SelfGrade auf dem Abgabe-Wert stehen)", () => {
  const fakeRpcDb = (result: { data: number | null; error: { message: string } | null }) => {
    const rpc = vi.fn(async () => result);
    return { db: { rpc } as unknown as SupabaseClient, rpc };
  };

  it("zurückgegebenes { error } wird zu Exception", async () => {
    const { db } = fakeRpcDb({ data: null, error: { message: "insufficient_privilege" } });
    await expect(
      upsertSelfGrade(db, { attemptId: "att-1", questionId: "q1", antworttext: "x", punkte: 3 }),
    ).rejects.toThrow("insufficient_privilege");
  });

  it("ruft die RPC mit den korrekten p_*-Parametern auf und liefert die neue Gesamtsumme zurück", async () => {
    const { db, rpc } = fakeRpcDb({ data: 42, error: null });
    await expect(
      upsertSelfGrade(db, { attemptId: "att-1", questionId: "q1", antworttext: "x", punkte: 3 }),
    ).resolves.toBe(42);
    expect(rpc).toHaveBeenCalledWith("submit_self_grade", {
      p_attempt_id: "att-1",
      p_question_id: "q1",
      p_antworttext: "x",
      p_punkte: 3,
    });
  });
});
