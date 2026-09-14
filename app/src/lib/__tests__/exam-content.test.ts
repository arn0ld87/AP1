import { describe, expect, it } from "vitest";

import {
  isExamAnswerFilled,
  parseExamAnswerSchema,
  parseExamVisual,
  parseStoredAnswer,
  serializeExamAnswer,
} from "../exam-content";

describe("exam-content", () => {
  it("akzeptiert eine typisierte Gantt-Visualisierung und verwirft unvollständige Daten", () => {
    const visual = parseExamVisual({
      visual_type: "gantt",
      visual_alt: "Projektplan",
      visual_path: null,
      visual_data: { duration: 4, tasks: [{ id: "A", name: "Analyse", start: 0, end: 4 }] },
    });
    expect(visual).toMatchObject({ type: "gantt", alt: "Projektplan" });
    expect(
      parseExamVisual({
        visual_type: "gantt",
        visual_alt: null,
        visual_path: null,
        visual_data: {},
      }),
    ).toBeUndefined();
  });

  it("akzeptiert nur sichere lokale Illustrationspfade", () => {
    expect(
      parseExamVisual({
        visual_type: "illustration",
        visual_alt: "Rack",
        visual_path: "/visuals/server-room.webp",
        visual_data: null,
      }),
    ).toMatchObject({ src: "/visuals/server-room.webp" });
    expect(
      parseExamVisual({
        visual_type: "illustration",
        visual_alt: "extern",
        visual_path: "https://example.org/x.png",
        visual_data: null,
      }),
    ).toBeUndefined();
  });

  it("parst strukturierte Antwortschemata und serialisiert Antworten stabil", () => {
    const schema = parseExamAnswerSchema({
      kind: "multiField",
      fields: [
        { id: "faz", label: "FAZ", unit: "Tage" },
        { id: "fez", label: "FEZ" },
      ],
    });
    expect(schema?.kind).toBe("multiField");
    const encoded = serializeExamAnswer({ fez: "6", faz: "2" });
    expect(encoded).toBe('{"faz":"2","fez":"6"}');
    expect(parseStoredAnswer(encoded)).toEqual({ faz: "2", fez: "6" });
    expect(parseStoredAnswer("Freitext")).toEqual({ answer: "Freitext" });
    expect(isExamAnswerFilled(encoded, schema)).toBe(true);
    expect(isExamAnswerFilled("{}", schema)).toBe(false);
    expect(isExamAnswerFilled("Freitext", { kind: "text" })).toBe(true);
  });
});
