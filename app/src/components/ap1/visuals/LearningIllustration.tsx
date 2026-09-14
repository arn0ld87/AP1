import type { IllustrationKind } from "@/lib/ap1-tasks";

const BOX = "fill-card stroke-border";
const LINE = "stroke-muted-foreground";

export function LearningIllustration({ kind, alt }: { kind: IllustrationKind; alt: string }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-background/50 p-3"
      role="img"
      aria-label={alt}
    >
      <svg viewBox="0 0 720 230" className="w-full min-w-[520px]" aria-hidden="true">
        {kind === "subnetting" && <Subnetting />}
        {kind === "raid" && <Raid />}
        {kind === "osi" && <Osi />}
        {kind === "network-path" && <NetworkPath />}
        {kind === "bab-flow" && <BabFlow />}
        {kind === "step-down" && <StepDown />}
      </svg>
    </div>
  );
}

function Subnetting() {
  return (
    <g>
      <text x="28" y="38" className="fill-foreground text-lg font-semibold">
        192.168.10.73 /26
      </text>
      <rect x="28" y="70" width="498" height="52" rx="10" className={BOX} />
      <rect
        x="28"
        y="70"
        width="374"
        height="52"
        rx="10"
        className="fill-primary/25 stroke-primary"
      />
      <text x="215" y="102" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        Netzanteil · 26 Bit
      </text>
      <text x="463" y="102" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        Host · 6 Bit
      </text>
      <path d="M28 154 H526" className={LINE} />
      <circle cx="28" cy="154" r="6" className="fill-primary" />
      <circle cx="526" cy="154" r="6" className="fill-primary" />
      <text x="28" y="183" className="fill-muted-foreground text-xs">
        64 · Netz
      </text>
      <text x="526" y="183" textAnchor="end" className="fill-muted-foreground text-xs">
        127 · Broadcast
      </text>
      <text x="277" y="214" textAnchor="middle" className="fill-foreground text-sm">
        nutzbar: 65–126 · 62 Hosts
      </text>
    </g>
  );
}

function Raid() {
  const disks = Array.from({ length: 5 }, (_, i) => i);
  return (
    <g>
      <text x="28" y="34" className="fill-foreground text-lg font-semibold">
        RAID 5 · verteilte Parität
      </text>
      {disks.map((disk) => (
        <g key={disk} transform={`translate(${28 + disk * 132} 58)`}>
          <rect width="112" height="142" rx="12" className={BOX} />
          {[0, 1, 2, 3].map((row) => (
            <rect
              key={row}
              x="12"
              y={12 + row * 30}
              width="88"
              height="22"
              rx="5"
              className={
                (row + disk) % 5 === 0
                  ? "fill-primary/30 stroke-primary"
                  : "fill-muted/80 stroke-border"
              }
            />
          ))}
          <text x="56" y="134" textAnchor="middle" className="fill-muted-foreground text-[10px]">
            Disk {disk + 1}
          </text>
        </g>
      ))}
    </g>
  );
}

function Osi() {
  const layers = [
    "7 Anwendung",
    "6 Darstellung",
    "5 Sitzung",
    "4 Transport",
    "3 Vermittlung",
    "2 Sicherung",
    "1 Bitübertragung",
  ];
  return (
    <g>
      <text x="28" y="32" className="fill-foreground text-lg font-semibold">
        OSI-Diagnose von oben nach unten
      </text>
      {layers.map((layer, index) => (
        <g key={layer}>
          <rect
            x={28 + index * 8}
            y={50 + index * 24}
            width={350 - index * 16}
            height="22"
            rx="6"
            className={index === 4 ? "fill-primary/25 stroke-primary" : BOX}
          />
          <text x="44" y={65 + index * 24} className="fill-foreground text-[10px]">
            {layer}
          </text>
        </g>
      ))}
      <path
        d="M430 62 C560 62 520 158 660 158"
        fill="none"
        className="stroke-primary"
        strokeWidth="3"
      />
      <text x="438" y="91" className="fill-muted-foreground text-xs">
        ping IP → Schicht 3
      </text>
      <text x="520" y="184" className="fill-muted-foreground text-xs">
        nslookup → Schicht 7
      </text>
    </g>
  );
}

function NetworkPath() {
  const nodes = [
    [70, "Client"],
    [280, "Switch"],
    [490, "Server"],
  ] as const;
  return (
    <g>
      <text x="28" y="32" className="fill-foreground text-lg font-semibold">
        Vereinfachter Datenweg
      </text>
      {nodes.map(([x, label]) => (
        <g key={label}>
          <rect x={x} y="82" width="150" height="82" rx="14" className={BOX} />
          <text
            x={x + 75}
            y="128"
            textAnchor="middle"
            className="fill-foreground text-sm font-semibold"
          >
            {label}
          </text>
        </g>
      ))}
      <path d="M220 123 H278 M430 123 H488" className="stroke-primary" strokeWidth="4" />
      <text x="250" y="109" textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Frame
      </text>
      <text x="460" y="109" textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Paket
      </text>
    </g>
  );
}

function BabFlow() {
  return (
    <Flow labels={["Gemeinkosten", "Verteilungsschlüssel", "Kostenstellen", "Zuschlagssätze"]} />
  );
}

function StepDown() {
  return <Flow labels={["Energie", "Reinigung", "Fertigung", "Verwaltung"]} staircase />;
}

function Flow({ labels, staircase = false }: { labels: string[]; staircase?: boolean }) {
  return (
    <g>
      <text x="28" y="34" className="fill-foreground text-lg font-semibold">
        {staircase ? "Stufenleiterverfahren" : "BAB-Ablauf"}
      </text>
      {labels.map((label, index) => {
        const x = 28 + index * 168;
        const y = staircase ? 58 + index * 30 : 92;
        return (
          <g key={label}>
            <rect
              x={x}
              y={y}
              width="140"
              height="58"
              rx="12"
              className={index === labels.length - 1 ? "fill-primary/20 stroke-primary" : BOX}
            />
            <text
              x={x + 70}
              y={y + 34}
              textAnchor="middle"
              className="fill-foreground text-xs font-semibold"
            >
              {label}
            </text>
            {index < labels.length - 1 && (
              <path
                d={`M${x + 140} ${y + 29} L${x + 166} ${staircase ? y + 59 : y + 29}`}
                className="stroke-primary"
                strokeWidth="3"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
