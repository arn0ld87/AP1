import { useId } from "react";

import type { NetzplanVisualData, NetzplanVisualNode } from "@/lib/ap1-tasks";

const visible = (
  node: NetzplanVisualNode,
  field: NonNullable<NetzplanVisualNode["hiddenFields"]>[number],
  value: number,
) => (node.hiddenFields?.includes(field) ? "?" : value);

export function NetzplanDiagram({ data, alt }: { data: NetzplanVisualData; alt: string }) {
  const markerId = useId().replace(/:/g, "");
  const width = Math.max(760, ...data.nodes.map((node) => node.x + 190));
  const height = Math.max(310, ...data.nodes.map((node) => node.y + 135));
  const byId = new Map(data.nodes.map((node) => [node.id, node]));

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border bg-background/50 p-3"
      role="img"
      aria-label={alt}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px]" aria-hidden="true">
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" className="fill-muted-foreground" />
          </marker>
        </defs>
        {data.edges.map((edge) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) return null;
          const critical = Boolean(from.critical && to.critical && from.fez === to.faz);
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x + 154}
              y1={from.y + 54}
              x2={to.x - 8}
              y2={to.y + 54}
              className={critical ? "stroke-primary" : "stroke-muted-foreground"}
              strokeWidth={critical ? 3 : 1.75}
              markerEnd={`url(#${markerId})`}
            />
          );
        })}
        {data.nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <rect
              width="154"
              height="108"
              rx="10"
              className={
                node.critical ? "fill-primary/10 stroke-primary" : "fill-card stroke-border"
              }
              strokeWidth={node.critical ? 2.5 : 1.5}
            />
            <path
              d="M0 32 H154 M0 70 H154 M51 32 V70 M103 32 V70 M51 70 V108 M103 70 V108"
              className="stroke-border"
            />
            <text x="12" y="21" className="fill-foreground text-[12px] font-semibold">
              {node.id} · {node.name}
            </text>
            <text x="25" y="55" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              FAZ{" "}
              <tspan className="fill-foreground font-bold">{visible(node, "faz", node.faz)}</tspan>
            </text>
            <text x="77" y="55" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              D{" "}
              <tspan className="fill-foreground font-bold">
                {visible(node, "duration", node.duration)}
              </tspan>
            </text>
            <text x="129" y="55" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              FEZ{" "}
              <tspan className="fill-foreground font-bold">{visible(node, "fez", node.fez)}</tspan>
            </text>
            <text x="25" y="93" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              SAZ{" "}
              <tspan className="fill-foreground font-bold">{visible(node, "saz", node.saz)}</tspan>
            </text>
            <text x="77" y="93" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              GP{" "}
              <tspan className="fill-foreground font-bold">
                {visible(node, "totalFloat", node.totalFloat)}
              </tspan>
            </text>
            <text x="129" y="93" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              SEZ{" "}
              <tspan className="fill-foreground font-bold">{visible(node, "sez", node.sez)}</tspan>
            </text>
          </g>
        ))}
        <text x="10" y={height - 8} className="fill-muted-foreground text-[11px]">
          Projektdauer: {data.projectDuration} Tage · Primär markiert: kritischer Pfad
        </text>
      </svg>
    </div>
  );
}
