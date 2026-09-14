export type AnswerPrimitive = number | string;

export interface ErEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  weak?: boolean;
  attributes: Array<{
    name: string;
    key?: "primary" | "foreign";
  }>;
}

export interface ErRelation {
  id: string;
  from: string;
  to: string;
  label: string;
  fromCardinality: "1" | "n";
  toCardinality: "1" | "n";
  hideCardinalities?: boolean;
}

export interface ErVisualData {
  entities: ErEntity[];
  relations: ErRelation[];
}

export interface NetzplanVisualNode {
  id: string;
  name: string;
  duration: number;
  faz: number;
  fez: number;
  saz: number;
  sez: number;
  totalFloat: number;
  freeFloat: number;
  x: number;
  y: number;
  critical?: boolean;
  hiddenFields?: Array<"duration" | "faz" | "fez" | "saz" | "sez" | "totalFloat" | "freeFloat">;
}

export interface NetzplanVisualData {
  nodes: NetzplanVisualNode[];
  edges: Array<{ from: string; to: string }>;
  projectDuration: number;
}

export interface GanttVisualData {
  duration: number;
  tasks: Array<{
    id: string;
    name: string;
    start: number;
    end: number;
    predecessors?: string[];
    milestone?: boolean;
    critical?: boolean;
  }>;
}

export type IllustrationKind =
  "subnetting" | "raid" | "osi" | "network-path" | "bab-flow" | "step-down";

export type TaskVisual =
  | { type: "er"; data: ErVisualData; alt: string }
  | { type: "netzplan"; data: NetzplanVisualData; alt: string }
  | { type: "gantt"; data: GanttVisualData; alt: string }
  | { type: "illustration"; data: { kind: IllustrationKind }; alt: string }
  | { type: "illustration"; src: string; alt: string };

export interface TaskBase {
  topic: string;
  pts: number;
  lead: string;
  q: string;
  given: [string, string][];
  steps: string[];
  trap: string;
  visual?: TaskVisual;
}

export interface ScalarTask extends TaskBase {
  kind: "scalar";
  answer: AnswerPrimitive;
  unit: string;
  ip?: boolean;
  dec?: number;
}

export interface TextTask extends TaskBase {
  kind: "text";
  answer: string;
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
}

export interface AnswerField {
  id: string;
  label: string;
  answer: AnswerPrimitive;
  unit?: string;
  dec?: number;
  ip?: boolean;
  placeholder?: string;
}

export interface MultiFieldTask extends TaskBase {
  kind: "multiField";
  fields: AnswerField[];
}

export interface TableColumn {
  id: string;
  label: string;
  unit?: string;
}

export interface TableCell {
  id: string;
  editable: boolean;
  value?: AnswerPrimitive;
  answer?: AnswerPrimitive;
  dec?: number;
  explanation?: string;
}

export interface TableRow {
  id: string;
  label: string;
  cells: TableCell[];
}

export interface TableTask extends TaskBase {
  kind: "table";
  columns: TableColumn[];
  rows: TableRow[];
}

export type DiagramResponse =
  | { kind: "scalar"; answer: AnswerPrimitive; unit?: string; dec?: number; ip?: boolean }
  | { kind: "text"; answer: string; acceptedAnswers?: string[]; caseSensitive?: boolean }
  | { kind: "multiField"; fields: AnswerField[] };

export interface DiagramTask extends TaskBase {
  kind: "diagram";
  visual: TaskVisual;
  response: DiagramResponse;
}

export type Task = ScalarTask | TextTask | TableTask | MultiFieldTask | DiagramTask;
export type TaskSubmission = string | Record<string, string>;

export interface FieldEvaluation {
  given: string;
  expected: string;
  correct: boolean;
}

export interface TaskEvaluation {
  correct: boolean;
  fields: Record<string, FieldEvaluation>;
}

function normalizeText(value: string, caseSensitive = false): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return caseSensitive ? normalized : normalized.toLocaleLowerCase("de-DE");
}

export function parseGermanNumber(value: string): number {
  const raw = value.trim().replace(/\s/g, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  return Number(normalized);
}

function formatExpected(value: AnswerPrimitive, dec?: number): string {
  if (typeof value === "string") return value;
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: dec ?? 0,
    maximumFractionDigits: dec ?? 2,
  });
}

function evaluatePrimitive(
  given: string,
  expected: AnswerPrimitive,
  options: { dec?: number; ip?: boolean; acceptedAnswers?: string[]; caseSensitive?: boolean } = {},
): FieldEvaluation {
  let correct = false;
  if (typeof expected === "number" && !options.ip) {
    const parsed = parseGermanNumber(given);
    const factor = 10 ** (options.dec ?? 2);
    correct =
      Number.isFinite(parsed) && Math.round(parsed * factor) === Math.round(expected * factor);
  } else {
    const candidates = [String(expected), ...(options.acceptedAnswers ?? [])];
    const actual = normalizeText(
      given.replace(/\s/g, options.ip ? "" : " "),
      options.caseSensitive,
    );
    correct = candidates.some(
      (candidate) =>
        normalizeText(candidate.replace(/\s/g, options.ip ? "" : " "), options.caseSensitive) ===
        actual,
    );
  }
  return { given: given.trim(), expected: formatExpected(expected, options.dec), correct };
}

function asMap(submission: TaskSubmission): Record<string, string> {
  return typeof submission === "string" ? { answer: submission } : submission;
}

export function evaluateTaskAnswer(task: Task, submission: TaskSubmission): TaskEvaluation {
  const values = asMap(submission);
  const fields: Record<string, FieldEvaluation> = {};

  if (task.kind === "scalar") {
    fields["answer"] = evaluatePrimitive(values["answer"] ?? "", task.answer, task);
  } else if (task.kind === "text") {
    fields["answer"] = evaluatePrimitive(values["answer"] ?? "", task.answer, task);
  } else if (task.kind === "multiField") {
    for (const field of task.fields) {
      fields[field.id] = evaluatePrimitive(values[field.id] ?? "", field.answer, field);
    }
  } else if (task.kind === "table") {
    for (const row of task.rows) {
      for (const cell of row.cells) {
        if (!cell.editable || cell.answer === undefined) continue;
        fields[cell.id] = evaluatePrimitive(values[cell.id] ?? "", cell.answer, cell);
      }
    }
  } else if (task.response.kind === "multiField") {
    for (const field of task.response.fields) {
      fields[field.id] = evaluatePrimitive(values[field.id] ?? "", field.answer, field);
    }
  } else {
    fields["answer"] = evaluatePrimitive(
      values["answer"] ?? "",
      task.response.answer,
      task.response,
    );
  }

  const checks = Object.values(fields);
  return { correct: checks.length > 0 && checks.every((field) => field.correct), fields };
}

export function formatTaskAnswer(task: Task): string {
  if (task.kind === "scalar" || task.kind === "text") {
    return formatExpected(task.answer, "dec" in task ? task.dec : undefined);
  }
  if (task.kind === "multiField") {
    return task.fields
      .map((field) => `${field.label}: ${formatExpected(field.answer, field.dec)}`)
      .join(" · ");
  }
  if (task.kind === "table") {
    return task.rows
      .flatMap((row) =>
        row.cells
          .filter((cell) => cell.editable && cell.answer !== undefined)
          .map((cell) => formatExpected(cell.answer!, cell.dec)),
      )
      .join(" · ");
  }
  if (task.response.kind === "multiField") {
    return task.response.fields
      .map((field) => `${field.label}: ${formatExpected(field.answer, field.dec)}`)
      .join(" · ");
  }
  return formatExpected(
    task.response.answer,
    task.response.kind === "scalar" ? task.response.dec : undefined,
  );
}

export function isSubmissionComplete(task: Task, submission: TaskSubmission): boolean {
  const values = asMap(submission);
  if (task.kind === "scalar" || task.kind === "text") return Boolean(values["answer"]?.trim());
  if (task.kind === "multiField") return task.fields.every((field) => values[field.id]?.trim());
  if (task.kind === "table") {
    return task.rows.every((row) =>
      row.cells.every(
        (cell) => !cell.editable || cell.answer === undefined || Boolean(values[cell.id]?.trim()),
      ),
    );
  }
  if (task.response.kind === "multiField") {
    return task.response.fields.every((field) => values[field.id]?.trim());
  }
  return Boolean(values["answer"]?.trim());
}
