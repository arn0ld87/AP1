import { describe, expect, it } from "vitest";

import { gradeQuestion, shuffleQuestions, type QuizQuestion } from "../quiz";

/** Deterministischer PRNG (mulberry32) — dasselbe Muster wie in flashcard-weighting.test.ts. */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const singleChoice: QuizQuestion = {
  type: "multiple_choice",
  question: "Frage?",
  hint: "Hinweis",
  answerOptions: [
    { text: "A", isCorrect: false, rationale: "falsch" },
    { text: "B", isCorrect: true, rationale: "richtig" },
    { text: "C", isCorrect: false, rationale: "falsch" },
    { text: "D", isCorrect: false, rationale: "falsch" },
  ],
};

const multiSelect: QuizQuestion = {
  type: "multiple_select",
  question: "Frage?",
  hint: "Hinweis",
  answerOptions: [
    { text: "A", isCorrect: true, rationale: "richtig" },
    { text: "B", isCorrect: true, rationale: "richtig" },
    { text: "C", isCorrect: false, rationale: "falsch" },
    { text: "D", isCorrect: false, rationale: "falsch" },
  ],
};

describe("gradeQuestion — multiple_choice", () => {
  it("die korrekte Option ist richtig", () => {
    expect(gradeQuestion(singleChoice, [1]).correct).toBe(true);
  });

  it("jede andere Option ist falsch", () => {
    expect(gradeQuestion(singleChoice, [0]).correct).toBe(false);
  });

  it("liefert die korrekten Indizes unabhängig von der Auswahl", () => {
    expect(gradeQuestion(singleChoice, [0]).correctIndexes).toEqual([1]);
  });
});

describe("gradeQuestion — multiple_select", () => {
  it("nur exakt die richtige Menge ist korrekt", () => {
    expect(gradeQuestion(multiSelect, [0, 1]).correct).toBe(true);
  });

  it("Reihenfolge der Auswahl spielt keine Rolle", () => {
    expect(gradeQuestion(multiSelect, [1, 0]).correct).toBe(true);
  });

  it("eine unvollständige Auswahl ist falsch", () => {
    expect(gradeQuestion(multiSelect, [0]).correct).toBe(false);
  });

  it("eine Auswahl mit zusätzlicher falscher Option ist falsch", () => {
    expect(gradeQuestion(multiSelect, [0, 1, 2]).correct).toBe(false);
  });

  it("eine komplett falsche Auswahl ist falsch", () => {
    expect(gradeQuestion(multiSelect, [2, 3]).correct).toBe(false);
  });

  it("keine Auswahl ist falsch", () => {
    expect(gradeQuestion(multiSelect, []).correct).toBe(false);
  });
});

describe("shuffleQuestions", () => {
  const questions = [singleChoice, multiSelect];

  it("verändert weder Anzahl der Fragen noch der Optionen", () => {
    const shuffled = shuffleQuestions(questions, mulberry32(1));
    expect(shuffled).toHaveLength(questions.length);
    for (const [i, q] of shuffled.entries()) {
      expect(q.answerOptions).toHaveLength(questions[i]!.answerOptions.length);
    }
  });

  it("rationale und isCorrect bleiben an ihrer Option verankert", () => {
    const shuffled = shuffleQuestions([multiSelect], mulberry32(7));
    const richtige = shuffled[0]!.answerOptions.filter((o) => o.isCorrect);
    expect(richtige.map((o) => o.text).sort()).toEqual(["A", "B"]);
    for (const option of shuffled[0]!.answerOptions) {
      expect(option.isCorrect ? "richtig" : "falsch").toBe(option.rationale);
    }
  });

  it("mischt tatsächlich (bei genug Fragen ändert sich die Reihenfolge)", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      ...singleChoice,
      question: `Frage ${i}`,
    }));
    const shuffled = shuffleQuestions(many, mulberry32(42));
    expect(shuffled.map((q) => q.question)).not.toEqual(many.map((q) => q.question));
  });

  it("lässt das Original unverändert", () => {
    const before = JSON.stringify(questions);
    shuffleQuestions(questions, mulberry32(3));
    expect(JSON.stringify(questions)).toBe(before);
  });
});
