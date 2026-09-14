import { useId } from "react";

import type { ErVisualData } from "@/lib/ap1-tasks";

export function ErDiagram({ data, alt }: { data: ErVisualData; alt: string }) {
  const markerId = useId().replace(/:/g, "");
  const width = Math.max(720, ...data.entities.map((entity) => entity.x + 210));
  const height = Math.max(300, ...data.entities.map((entity) => entity.y + 150));
  const byId = new Map(data.entities.map((entity) => [entity.id, entity]));

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border bg-background/45 p-3"
      role="img"
      aria-label={alt}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[680px]" aria-hidden="true">
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" className="fill-muted-foreground" />
          </marker>
        </defs>
        {data.relations.map((relation) => {
          const from = byId.get(relation.from);
          const to = byId.get(relation.to);
          if (!from || !to) return null;
          const x1 = from.x + 90;
          const y1 = from.y + 58;
          const x2 = to.x + 90;
          const y2 = to.y + 58;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={relation.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="stroke-muted-foreground"
                strokeWidth="2"
                markerEnd={`url(#${markerId})`}
              />
              <rect
                x={mx - 54}
                y={my - 15}
                width="108"
                height="30"
                rx="8"
                className="fill-muted stroke-border"
              />
              <text
                x={mx}
                y={my + 4}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-medium"
              >
                {relation.label}
              </text>
              <text
                x={x1 + (x2 > x1 ? 16 : -16)}
                y={y1 - 9}
                textAnchor="middle"
                className="fill-primary text-xs font-bold"
              >
                {relation.hideCardinalities ? "?" : relation.fromCardinality}
              </text>
              <text
                x={x2 + (x2 > x1 ? -16 : 16)}
                y={y2 - 9}
                textAnchor="middle"
                className="fill-primary text-xs font-bold"
              >
                {relation.hideCardinalities ? "?" : relation.toCardinality}
              </text>
            </g>
          );
        })}
        {data.entities.map((entity) => (
          <g key={entity.id} transform={`translate(${entity.x} ${entity.y})`}>
            <rect
              width="180"
              height={64 + entity.attributes.length * 20}
              rx="12"
              className="fill-card stroke-border"
              strokeWidth={entity.weak ? 3 : 1.5}
              strokeDasharray={entity.weak ? "6 4" : undefined}
            />
            <rect width="180" height="36" rx="12" className="fill-primary/15" />
            <path d="M0 36 H180" className="stroke-border" />
            <text x="14" y="23" className="fill-foreground text-sm font-semibold">
              {entity.name}
            </text>
            {entity.attributes.map((attribute, index) => (
              <g key={`${entity.id}-${attribute.name}`}>
                <text x="14" y={57 + index * 20} className="fill-muted-foreground text-[11px]">
                  {attribute.key === "primary" ? "PK" : attribute.key === "foreign" ? "FK" : "·"}
                </text>
                <text
                  x="42"
                  y={57 + index * 20}
                  className={
                    attribute.key === "primary"
                      ? "fill-foreground text-[11px] font-semibold underline"
                      : "fill-foreground text-[11px]"
                  }
                >
                  {attribute.name}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
