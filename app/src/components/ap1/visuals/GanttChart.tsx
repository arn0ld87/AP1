import type { GanttVisualData } from "@/lib/ap1-tasks";

export function GanttChart({ data, alt }: { data: GanttVisualData; alt: string }) {
  const width = 760;
  const labelWidth = 150;
  const chartWidth = width - labelWidth - 24;
  const rowHeight = 42;
  const height = 54 + data.tasks.length * rowHeight;
  const scale = chartWidth / Math.max(1, data.duration);

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border bg-background/50 p-3"
      role="img"
      aria-label={alt}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[700px]" aria-hidden="true">
        {Array.from({ length: data.duration + 1 }, (_, day) => (
          <g key={day}>
            <line
              x1={labelWidth + day * scale}
              y1="26"
              x2={labelWidth + day * scale}
              y2={height - 8}
              className="stroke-border"
              strokeDasharray="3 4"
            />
            <text
              x={labelWidth + day * scale}
              y="17"
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {day}
            </text>
          </g>
        ))}
        {data.tasks.map((task, index) => {
          const y = 34 + index * rowHeight;
          const x = labelWidth + task.start * scale;
          const taskWidth = Math.max(task.milestone ? 12 : 22, (task.end - task.start) * scale);
          return (
            <g key={task.id}>
              <text x="4" y={y + 21} className="fill-foreground text-[11px] font-medium">
                {task.id} · {task.name}
              </text>
              <line
                x1={labelWidth}
                y1={y + 32}
                x2={width - 24}
                y2={y + 32}
                className="stroke-border"
              />
              {task.milestone ? (
                <rect
                  x={x - 6}
                  y={y + 7}
                  width="12"
                  height="12"
                  transform={`rotate(45 ${x} ${y + 13})`}
                  className="fill-primary"
                />
              ) : (
                <rect
                  x={x}
                  y={y + 6}
                  width={taskWidth}
                  height="18"
                  rx="5"
                  className={task.critical ? "fill-primary" : "fill-muted-foreground/55"}
                />
              )}
              <text
                x={x + (task.milestone ? 10 : taskWidth + 6)}
                y={y + 20}
                className="fill-muted-foreground text-[10px]"
              >
                {task.start}–{task.end}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
