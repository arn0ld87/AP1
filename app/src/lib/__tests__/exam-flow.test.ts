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

  it("manuelle Abgabe: Reihenfolge grading → persist, Summe stammt vom Server", async () => {
    const calls: string[] = [];
    const callGrade = vi.fn(async ({ question_id }: { question_id: string }) => {
      calls.push("grade:" + question_id);
      return { punkte: question_id === "a" ? 8 : 17, begruendung: "" };
    });
    const persist = vi.fn(async () => {
      calls.push("persist");
      return 25;
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
    // Kein Argument: der Client darf keine Punktzahl mehr vorgeben.
    expect(persist).toHaveBeenCalledWith();
    expect(calls).toEqual(["grade:a", "grade:b", "persist"]);
    expect(results["b"]!.punkte).toBe(17);
  });

  it("Regression P0: die serverseitig berechnete Summe gewinnt gegen jede lokale Rechnung", async () => {
    // Der Server summiert über exam_answers.ki_punkte. Weicht sein Ergebnis von
    // dem ab, was der Client aus den Einzelbewertungen ableiten würde (z. B.
    // weil eine Antwort persistiert wurde, deren Response verloren ging), ist
    // der Serverwert maßgeblich — sonst zeigt die Ergebnisansicht etwas
    // anderes als die Datenbank nach einem Reload.
    const persist = vi.fn(async () => 7);
    const { gesamtpunkte } = await submitExamFlow({
      fragen,
      answers: { a: "1", b: "2" },
      attemptId: "att-1",
      callGrade: async () => ({ punkte: 99, begruendung: "" }),
      persist,
    });
    expect(gesamtpunkte).toBe(7);
  });

  it("aufeinanderfolgende Abgaben liefern denselben deterministischen Wert (State-unabhängig)", async () => {
    const persist = vi.fn(async () => 20);
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
    // Serverseitig bildet `coalesce(sum(ki_punkte), 0)` dieselbe Semantik ab:
    // eine Frage ohne Bewertung hat ki_punkte null und trägt 0 bei.
    const persist = vi.fn(async () => 20);
    const { gesamtpunkte, results } = await submitExamFlow({
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
    expect(results["a"]!.punkte).toBeNull();
    expect(gesamtpunkteVon(fragen, results)).toBe(20);
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

describe("persistAttemptFinish (RPC finish_exam_attempt — Regression P0: gesamtpunkte war client-seitig setzbar)", () => {
  // Supabase-js wirft bei Fehlern nicht, sondern liefert { error }.
  // Der Helfer muss genau dieses Feld in eine Exception überführen.
  const fakeRpcDb = (result: { data: number | null; error: { message: string } | null }) => {
    const rpc = vi.fn(async (_fn: string, _args: Record<string, unknown>) => result);
    return { db: { rpc } as unknown as SupabaseClient, rpc };
  };

  it("zurückgegebenes { error } wird zu Exception", async () => {
    const { db } = fakeRpcDb({ data: null, error: { message: "insufficient_privilege" } });
    await expect(persistAttemptFinish(db, "att-1")).rejects.toThrow("insufficient_privilege");
  });

  it("ruft die RPC mit p_attempt_id auf und liefert die serverseitige Summe zurück", async () => {
    const { db, rpc } = fakeRpcDb({ data: 63, error: null });
    await expect(persistAttemptFinish(db, "att-1")).resolves.toBe(63);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("finish_exam_attempt", { p_attempt_id: "att-1" });
  });

  it("übergibt keinerlei Punktzahl an den Server (kein manipulierbarer Wert im Payload)", async () => {
    const { db, rpc } = fakeRpcDb({ data: 0, error: null });
    await persistAttemptFinish(db, "att-1");
    const payload = rpc.mock.calls[0]![1] as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(["p_attempt_id"]);
    expect(JSON.stringify(payload)).not.toMatch(/punkte|finished/i);
  });

  it("schreibt nicht mehr direkt auf die Tabelle exam_attempts", async () => {
    // Der alte Pfad war db.from('exam_attempts').update(...). Ein `from` am
    // Client-Objekt darf für den Abschluss gar nicht mehr angefasst werden —
    // das UPDATE-Recht existiert seit Migration 20260914140000 nicht mehr.
    const rpc = vi.fn(async () => ({ data: 12, error: null }));
    const from = vi.fn(() => {
      throw new Error("from() darf im Abschluss-Pfad nicht verwendet werden");
    });
    const db = { rpc, from } as unknown as SupabaseClient;
    await expect(persistAttemptFinish(db, "att-1")).resolves.toBe(12);
    expect(from).not.toHaveBeenCalled();
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
