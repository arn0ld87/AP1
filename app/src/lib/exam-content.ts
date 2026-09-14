import { z } from "zod";

import type { TaskVisual } from "./ap1-tasks";

const answerFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  unit: z.string().optional(),
  placeholder: z.string().optional(),
});

const examAnswerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text") }),
  z.object({ kind: z.literal("multiField"), fields: z.array(answerFieldSchema).min(1) }),
  z.object({
    kind: z.literal("table"),
    columns: z
      .array(
        z.object({ id: z.string().min(1), label: z.string().min(1), unit: z.string().optional() }),
      )
      .min(1),
    rows: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          cells: z
            .array(
              z.object({
                id: z.string().min(1),
                editable: z.boolean(),
                value: z.union([z.string(), z.number()]).optional(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),
]);

export type ExamAnswerSchema = z.infer<typeof examAnswerSchema>;

const erDataSchema = z.object({
  entities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      x: z.number(),
      y: z.number(),
      weak: z.boolean().optional(),
      attributes: z.array(
        z.object({ name: z.string(), key: z.enum(["primary", "foreign"]).optional() }),
      ),
    }),
  ),
  relations: z.array(
    z.object({
      id: z.string(),
      from: z.string(),
      to: z.string(),
      label: z.string(),
      fromCardinality: z.enum(["1", "n"]),
      toCardinality: z.enum(["1", "n"]),
      hideCardinalities: z.boolean().optional(),
    }),
  ),
});

const networkDataSchema = z.object({
  projectDuration: z.number(),
  nodes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      duration: z.number(),
      faz: z.number(),
      fez: z.number(),
      saz: z.number(),
      sez: z.number(),
      totalFloat: z.number(),
      freeFloat: z.number(),
      x: z.number(),
      y: z.number(),
      critical: z.boolean().optional(),
      hiddenFields: z
        .array(z.enum(["duration", "faz", "fez", "saz", "sez", "totalFloat", "freeFloat"]))
        .optional(),
    }),
  ),
  edges: z.array(z.object({ from: z.string(), to: z.string() })),
});

const ganttDataSchema = z.object({
  duration: z.number().nonnegative(),
  tasks: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        start: z.number(),
        end: z.number(),
        predecessors: z.array(z.string()).optional(),
        milestone: z.boolean().optional(),
        critical: z.boolean().optional(),
      }),
    )
    .min(1),
});

const illustrationDataSchema = z.object({
  kind: z.enum(["subnetting", "raid", "osi", "network-path", "bab-flow", "step-down"]),
});

export interface ExamVisualRecord {
  visual_type?: string | null;
  visual_data?: unknown;
  visual_path?: string | null;
  visual_alt?: string | null;
}

export function parseExamVisual(record: ExamVisualRecord): TaskVisual | undefined {
  const alt = record.visual_alt?.trim();
  if (!alt) return undefined;
  if (record.visual_type === "er") {
    const parsed = erDataSchema.safeParse(record.visual_data);
    return parsed.success
      ? { type: "er", data: parsed.data as Extract<TaskVisual, { type: "er" }>["data"], alt }
      : undefined;
  }
  if (record.visual_type === "netzplan") {
    const parsed = networkDataSchema.safeParse(record.visual_data);
    return parsed.success
      ? {
          type: "netzplan",
          data: parsed.data as Extract<TaskVisual, { type: "netzplan" }>["data"],
          alt,
        }
      : undefined;
  }
  if (record.visual_type === "gantt") {
    const parsed = ganttDataSchema.safeParse(record.visual_data);
    return parsed.success
      ? {
          type: "gantt",
          data: parsed.data as Extract<TaskVisual, { type: "gantt" }>["data"],
          alt,
        }
      : undefined;
  }
  if (record.visual_type === "illustration") {
    const path = record.visual_path?.trim();
    if (path?.startsWith("/visuals/") && !path.includes(".."))
      return { type: "illustration", src: path, alt };
    const parsed = illustrationDataSchema.safeParse(record.visual_data);
    return parsed.success ? { type: "illustration", data: parsed.data, alt } : undefined;
  }
  return undefined;
}

export function parseExamAnswerSchema(value: unknown): ExamAnswerSchema | undefined {
  const parsed = examAnswerSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function serializeExamAnswer(values: Record<string, string>): string {
  const normalized = Object.fromEntries(
    Object.entries(values)
      .filter(([, value]) => value.trim().length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, value.trim()]),
  );
  return JSON.stringify(normalized);
}

export function parseStoredAnswer(value: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const entries = Object.entries(parsed);
      if (entries.every(([, item]) => typeof item === "string"))
        return Object.fromEntries(entries) as Record<string, string>;
    }
  } catch {
    // Bestehende Freitextantworten sind absichtlich kein JSON.
  }
  return { answer: value };
}

export function isExamAnswerFilled(value: string, schema?: ExamAnswerSchema): boolean {
  if (!schema || schema.kind === "text") return value.trim().length > 0;
  return Object.values(parseStoredAnswer(value)).some((item) => item.trim().length > 0);
}
