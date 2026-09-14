import type { KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";
import type { ExamAnswerSchema } from "@/lib/exam-content";

interface Props {
  schema: Exclude<ExamAnswerSchema, { kind: "text" }>;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  disabled?: boolean;
}

function focusRelativeCell(event: KeyboardEvent<HTMLInputElement>, direction: number) {
  if (
    !event.currentTarget.form ||
    !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
  )
    return;
  const cells = [
    ...event.currentTarget.form.querySelectorAll<HTMLInputElement>("[data-exam-cell]"),
  ];
  const index = cells.indexOf(event.currentTarget);
  const next = cells[index + direction];
  if (!next) return;
  event.preventDefault();
  next.focus();
  next.select();
}

export function ExamAnswerEditor({ schema, values, onChange, disabled }: Props) {
  if (schema.kind === "multiField") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {schema.fields.map((field) => (
          <label key={field.id} className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
            <span className="flex items-center gap-2">
              <Input
                value={values[field.id] ?? ""}
                onChange={(event) => onChange(field.id, event.target.value)}
                disabled={disabled}
                placeholder={field.placeholder ?? "Wert"}
                className="font-mono tabular-nums"
              />
              {field.unit && (
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {field.unit}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    );
  }

  const editableColumns = Math.max(1, schema.columns.length);
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead className="bg-muted/45 text-left text-xs text-muted-foreground">
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 min-w-40 border-b border-r border-border bg-muted px-3 py-2.5"
            >
              Vorgang
            </th>
            {schema.columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className="min-w-28 border-b border-border px-3 py-2.5"
              >
                <span className="block text-foreground">{column.label}</span>
                {column.unit && <span className="font-normal">{column.unit}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schema.rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <th
                scope="row"
                className="sticky left-0 z-10 border-r border-border bg-card px-3 py-2 text-left text-xs font-medium text-foreground"
              >
                {row.label}
              </th>
              {row.cells.map((cell) => (
                <td key={cell.id} className="px-2 py-2">
                  {cell.editable ? (
                    <Input
                      data-exam-cell
                      value={values[cell.id] ?? ""}
                      onChange={(event) => onChange(cell.id, event.target.value)}
                      onKeyDown={(event) => {
                        const direction =
                          event.key === "ArrowUp"
                            ? -editableColumns
                            : event.key === "ArrowDown"
                              ? editableColumns
                              : event.key === "ArrowLeft"
                                ? -1
                                : 1;
                        focusRelativeCell(event, direction);
                      }}
                      disabled={disabled}
                      inputMode="decimal"
                      aria-label={`${row.label}, Eingabewert`}
                      className="h-9 min-w-24 font-mono tabular-nums"
                    />
                  ) : (
                    <span className="block py-2 font-mono text-muted-foreground">
                      {cell.value ?? "–"}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
