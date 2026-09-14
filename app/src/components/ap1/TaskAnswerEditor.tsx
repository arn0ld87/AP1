import type { KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";
import type {
  AnswerField,
  DiagramResponse,
  FieldEvaluation,
  TableTask,
  Task,
  TaskEvaluation,
} from "@/lib/ap1-tasks";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  evaluation: TaskEvaluation | null;
  disabled?: boolean;
}

function inputClass(evaluation?: FieldEvaluation) {
  return cn(
    "font-mono tabular-nums",
    evaluation?.correct === true && "border-emerald-500/70 bg-emerald-500/10",
    evaluation?.correct === false && "border-destructive/70 bg-destructive/10",
  );
}

function ScalarEditor({
  field,
  id,
  value,
  onChange,
  evaluation,
  disabled,
}: {
  field: {
    label?: string;
    unit?: string | undefined;
    ip?: boolean | undefined;
    placeholder?: string | undefined;
  };
  id: string;
  value: string;
  onChange: (value: string) => void;
  evaluation?: FieldEvaluation | undefined;
  disabled?: boolean | undefined;
}) {
  const label = "label" in field ? field.label : "Antwort";
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <Input
          id={`answer-${id}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          inputMode={field.ip ? "text" : "decimal"}
          placeholder={
            ("placeholder" in field && field.placeholder) ||
            (field.ip ? "z. B. 192.168.10.0" : "Ergebnis")
          }
          className={inputClass(evaluation)}
          aria-invalid={evaluation?.correct === false}
        />
        {field.unit && (
          <span className="whitespace-nowrap text-xs text-muted-foreground">{field.unit}</span>
        )}
      </span>
      {evaluation?.correct === false && (
        <span className="text-xs text-destructive">Soll: {evaluation.expected}</span>
      )}
    </label>
  );
}

function FieldsEditor({ fields, ...props }: Omit<Props, "task"> & { fields: AnswerField[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {fields.map((field) => (
        <ScalarEditor
          key={field.id}
          field={field}
          id={field.id}
          value={props.values[field.id] ?? ""}
          onChange={(value) => props.onChange(field.id, value)}
          evaluation={props.evaluation?.fields[field.id]}
          disabled={props.disabled}
        />
      ))}
    </div>
  );
}

function focusRelativeCell(event: KeyboardEvent<HTMLInputElement>, direction: number) {
  if (
    !event.currentTarget.form ||
    !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
  )
    return;
  if (
    (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
    event.currentTarget.selectionStart !== event.currentTarget.selectionEnd
  )
    return;
  const cells = [
    ...event.currentTarget.form.querySelectorAll<HTMLInputElement>("[data-task-cell]"),
  ];
  const index = cells.indexOf(event.currentTarget);
  const next = cells[index + direction];
  if (!next) return;
  event.preventDefault();
  next.focus();
  next.select();
}

function TableEditor({
  task,
  values,
  onChange,
  evaluation,
  disabled,
}: Omit<Props, "task"> & { task: TableTask }) {
  const columns = task.columns.length;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead className="bg-muted/45 text-left text-xs text-muted-foreground">
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 min-w-44 border-b border-r border-border bg-muted px-3 py-2.5"
            >
              Kostenart / Schritt
            </th>
            {task.columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className="min-w-36 border-b border-border px-3 py-2.5"
              >
                <span className="block text-foreground">{column.label}</span>
                {column.unit && <span className="font-normal">{column.unit}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {task.rows.map((row, rowIndex) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <th
                scope="row"
                className="sticky left-0 z-10 border-r border-border bg-card px-3 py-3 text-left text-xs font-medium text-foreground"
              >
                {row.label}
              </th>
              {row.cells.map((cell, columnIndex) => {
                const result = evaluation?.fields[cell.id];
                return (
                  <td
                    key={cell.id}
                    className={cn(
                      "px-2 py-2 align-top",
                      result?.correct === true && "bg-emerald-500/5",
                      result?.correct === false && "bg-destructive/5",
                    )}
                  >
                    {cell.editable ? (
                      <>
                        <Input
                          data-task-cell
                          value={values[cell.id] ?? ""}
                          onChange={(event) => onChange(cell.id, event.target.value)}
                          onKeyDown={(event) => {
                            const vertical =
                              event.key === "ArrowUp"
                                ? -columns
                                : event.key === "ArrowDown"
                                  ? columns
                                  : event.key === "ArrowLeft"
                                    ? -1
                                    : 1;
                            focusRelativeCell(event, vertical);
                          }}
                          disabled={disabled}
                          inputMode="decimal"
                          aria-label={`${row.label}, ${task.columns[columnIndex]?.label ?? "Wert"}`}
                          aria-invalid={result?.correct === false}
                          className={cn("h-9 min-w-28", inputClass(result))}
                        />
                        {result?.correct === false && (
                          <span className="mt-1 block text-[11px] text-destructive">
                            Soll: {result.expected}
                          </span>
                        )}
                        {evaluation && cell.explanation && (
                          <span className="mt-1 block max-w-48 text-[10px] leading-snug text-muted-foreground">
                            {cell.explanation}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="block py-2 font-mono text-muted-foreground">
                        {cell.value ?? "–"}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiagramResponseEditor({
  response,
  ...props
}: Omit<Props, "task"> & { response: DiagramResponse }) {
  if (response.kind === "multiField") return <FieldsEditor fields={response.fields} {...props} />;
  return (
    <ScalarEditor
      field={{
        label: "Antwort",
        unit: response.kind === "scalar" ? response.unit : undefined,
        ip: response.kind === "scalar" ? response.ip : undefined,
      }}
      id="answer"
      value={props.values["answer"] ?? ""}
      onChange={(value) => props.onChange("answer", value)}
      evaluation={props.evaluation?.fields["answer"]}
      disabled={props.disabled}
    />
  );
}

export function TaskAnswerEditor({ task, ...props }: Props) {
  if (task.kind === "table") return <TableEditor task={task} {...props} />;
  if (task.kind === "multiField") return <FieldsEditor fields={task.fields} {...props} />;
  if (task.kind === "diagram") return <DiagramResponseEditor response={task.response} {...props} />;
  return (
    <ScalarEditor
      field={{
        label: "Antwort",
        unit: task.kind === "scalar" ? task.unit : undefined,
        ip: task.kind === "scalar" ? task.ip : undefined,
      }}
      id="answer"
      value={props.values["answer"] ?? ""}
      onChange={(value) => props.onChange("answer", value)}
      evaluation={props.evaluation?.fields["answer"]}
      disabled={props.disabled}
    />
  );
}
