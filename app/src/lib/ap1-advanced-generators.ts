import { calculateBab, calculateNetworkPlan, calculateStepDown } from "./ap1-structured-generators";
import type {
  DiagramTask,
  ErVisualData,
  GanttVisualData,
  NetzplanVisualData,
  TableTask,
  Task,
} from "./ap1-tasks";

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const de = (value: number, dec = 2) =>
  value.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec });

function ermTask(): DiagramTask {
  const mode = pick(["cardinality", "foreignKey"] as const);
  const data: ErVisualData = {
    entities: [
      {
        id: "kunde",
        name: "KUNDE",
        x: 20,
        y: 60,
        attributes: [{ name: "kunden_id", key: "primary" }, { name: "name" }],
      },
      {
        id: "auftrag",
        name: "AUFTRAG",
        x: 280,
        y: 40,
        attributes: [
          { name: "auftrag_id", key: "primary" },
          { name: "kunden_id", key: "foreign" },
          { name: "datum" },
        ],
      },
      {
        id: "produkt",
        name: "PRODUKT",
        x: 540,
        y: 60,
        attributes: [{ name: "produkt_id", key: "primary" }, { name: "bezeichnung" }],
      },
    ],
    relations: [
      {
        id: "erteilt",
        from: "kunde",
        to: "auftrag",
        label: "erteilt",
        fromCardinality: "1",
        toCardinality: "n",
      },
      {
        id: "enthaelt",
        from: "auftrag",
        to: "produkt",
        label: "enthält",
        fromCardinality: "n",
        toCardinality: "n",
      },
    ],
  };
  if (mode === "cardinality") {
    return {
      kind: "diagram",
      topic: "erm",
      pts: 2,
      lead: "Ein Shop verwaltet Kunden, Aufträge und Produkte in einem ER-Modell.",
      q: "Welche Kardinalität besteht zwischen <b>KUNDE</b> und <b>AUFTRAG</b>?",
      given: [["Leserichtung", "Ein Kunde kann mehrere Aufträge erteilen"]],
      visual: {
        type: "er",
        data,
        alt: "ER-Diagramm mit Kunde, Auftrag und Produkt samt Kardinalitäten",
      },
      response: {
        kind: "text",
        answer: "1:n",
        acceptedAnswers: ["1 zu n", "1:n-Beziehung", "eins zu viele"],
      },
      steps: [
        "Auf der Kundenseite steht <b>1</b>: Jeder Auftrag gehört genau einem Kunden.",
        "Auf der Auftragsseite steht <b>n</b>: Ein Kunde kann mehrere Aufträge besitzen.",
        "Ergebnis: <b>1:n</b>.",
      ],
      trap: "Die Kardinalität immer in der genannten Leserichtung angeben.",
    };
  }
  return {
    kind: "diagram",
    topic: "erm",
    pts: 2,
    lead: "Das ER-Modell soll in ein relationales Schema überführt werden.",
    q: "Welches Attribut in <b>AUFTRAG</b> ist der Fremdschlüssel zur Entität KUNDE?",
    given: [],
    visual: { type: "er", data, alt: "ER-Diagramm mit markierten Primär- und Fremdschlüsseln" },
    response: {
      kind: "text",
      answer: "kunden_id",
      acceptedAnswers: ["KUNDE.kunden_id", "auftrag.kunden_id"],
    },
    steps: [
      "Bei einer 1:n-Beziehung wandert der Schlüssel der 1-Seite auf die n-Seite.",
      "Primärschlüssel von KUNDE ist <code>kunden_id</code>.",
      "In AUFTRAG wird daraus der Fremdschlüssel <b>kunden_id</b>.",
    ],
    trap: "Die n:m-Beziehung AUFTRAG–PRODUKT benötigt dagegen eine eigene Zwischentabelle.",
  };
}

function networkData() {
  const input = [
    { id: "A", name: "Analyse", duration: rnd(2, 4), predecessors: [] },
    { id: "B", name: "Beschaffung", duration: rnd(3, 6), predecessors: ["A"] },
    { id: "C", name: "Konfiguration", duration: rnd(2, 4), predecessors: ["A"] },
    { id: "D", name: "Integration", duration: rnd(2, 4), predecessors: ["B", "C"] },
    { id: "E", name: "Abnahme", duration: 1, predecessors: ["D"] },
  ];
  return calculateNetworkPlan(input);
}

function toNetworkVisual(
  result: ReturnType<typeof networkData>,
  hiddenId?: string,
): NetzplanVisualData {
  const positions: Record<string, [number, number]> = {
    A: [20, 105],
    B: [220, 25],
    C: [220, 190],
    D: [440, 105],
    E: [640, 105],
  };
  return {
    projectDuration: result.projectDuration,
    nodes: result.activities.map((activity) => ({
      ...activity,
      x: positions[activity.id]![0],
      y: positions[activity.id]![1],
      ...(activity.id === hiddenId
        ? { hiddenFields: ["faz", "fez", "saz", "sez", "totalFloat"] as const }
        : {}),
    })),
    edges: result.activities.flatMap((activity) =>
      activity.predecessors.map((from) => ({ from, to: activity.id })),
    ),
  };
}

function netzplanTask(): DiagramTask {
  const result = networkData();
  const target = pick(
    result.activities.filter((activity) => activity.id !== "A" && activity.id !== "E"),
  );
  return {
    kind: "diagram",
    topic: "netzplan",
    pts: 5,
    lead: "Ein Infrastrukturprojekt verläuft über zwei parallele Pfade. Ergänzen Sie den ausgeblendeten Vorgangsknoten.",
    q: `Berechnen Sie für Vorgang <b>${target.id} · ${target.name}</b> alle Zeitwerte und den Gesamtpuffer.`,
    given: [
      ["Dauer", `${target.duration} Tage`],
      ["Projektdauer", `${result.projectDuration} Tage`],
    ],
    visual: {
      type: "netzplan",
      data: toNetworkVisual(result, target.id),
      alt: `Vorgangsknoten-Netzplan mit ausgeblendeten Zeitwerten bei Vorgang ${target.id}`,
    },
    response: {
      kind: "multiField",
      fields: [
        { id: "faz", label: "FAZ", answer: target.faz, unit: "Tage", dec: 0 },
        { id: "fez", label: "FEZ", answer: target.fez, unit: "Tage", dec: 0 },
        { id: "saz", label: "SAZ", answer: target.saz, unit: "Tage", dec: 0 },
        { id: "sez", label: "SEZ", answer: target.sez, unit: "Tage", dec: 0 },
        { id: "gp", label: "GP", answer: target.totalFloat, unit: "Tage", dec: 0 },
      ],
    },
    steps: [
      `Vorwärts: <code>FAZ = max(FEZ der Vorgänger) = ${target.faz}</code>.`,
      `<code>FEZ = FAZ + Dauer = ${target.faz} + ${target.duration} = ${target.fez}</code>.`,
      `Rückwärts: <code>SEZ = min(SAZ der Nachfolger) = ${target.sez}</code>.`,
      `<code>SAZ = SEZ − Dauer = ${target.sez} − ${target.duration} = ${target.saz}</code>.`,
      `<code>GP = SAZ − FAZ = ${target.totalFloat}</code>${target.critical ? " → kritischer Vorgang." : "."}`,
    ],
    trap: "Vorwärts immer das Maximum der Vorgänger, rückwärts immer das Minimum der Nachfolger verwenden.",
  };
}

function ganttTask(): DiagramTask {
  const result = networkData();
  const milestoneAt = result.projectDuration;
  const data: GanttVisualData = {
    duration: milestoneAt,
    tasks: [
      ...result.activities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        start: activity.faz,
        end: activity.fez,
        predecessors: activity.predecessors,
        critical: activity.critical,
      })),
      {
        id: "M",
        name: "Go-live",
        start: milestoneAt,
        end: milestoneAt,
        predecessors: ["E"],
        milestone: true,
        critical: true,
      },
    ],
  };
  return {
    kind: "diagram",
    topic: "gantt",
    pts: 2,
    lead: "Das Gantt-Diagramm zeigt früheste Termine und den abschließenden Meilenstein.",
    q: "An welchem Tag kann der Meilenstein <b>Go-live</b> frühestens erreicht werden?",
    given: [["Zeitachse", "Arbeitstage ab Projektstart"]],
    visual: {
      type: "gantt",
      data,
      alt: "Gantt-Diagramm mit parallelen Vorgängen, kritischen Balken und Go-live-Meilenstein",
    },
    response: { kind: "scalar", answer: milestoneAt, unit: "Tag", dec: 0 },
    steps: [
      "Für jeden Vorgang gilt: Ende = Start + Dauer.",
      "Parallele Vorgänge dürfen sich überlappen; der Nachfolger beginnt erst nach allen Vorgängern.",
      `Der letzte Vorgang endet an Tag <b>${milestoneAt}</b>.`,
    ],
    trap: "Balkenlängen nicht addieren, wenn Vorgänge parallel laufen.",
  };
}

function babTask(): TableTask {
  const rent = rnd(8, 14) * 100;
  const energy = rnd(4, 8) * 100;
  const input = {
    costCenters: [
      { id: "material", name: "Material", allocationBase: 4_000 },
      { id: "fertigung", name: "Fertigung", allocationBase: 5_000 },
      { id: "verwaltung", name: "Verwaltung", allocationBase: 2_500 },
    ],
    overheads: [
      {
        id: "miete",
        name: "Miete",
        amount: rent,
        shares: { material: 0.2, fertigung: 0.5, verwaltung: 0.3 },
      },
      {
        id: "energie",
        name: "Energie",
        amount: energy,
        shares: { material: 0.25, fertigung: 0.5, verwaltung: 0.25 },
      },
    ],
  };
  const result = calculateBab(input);
  const columns = input.costCenters.map((center) => ({
    id: center.id,
    label: center.name,
    unit: "EUR",
  }));
  return {
    kind: "table",
    topic: "bab",
    pts: 8,
    lead: "Die Gemeinkosten sind anhand der vorgegebenen Verteilungsschlüssel auf Kostenstellen umzulegen.",
    q: "Vervollständigen Sie den <b>Betriebsabrechnungsbogen</b>. Tragen Sie Verteilungsbeträge, Summen und Zuschlagssätze ein.",
    given: [
      ["Miete", `${de(rent, 0)} EUR · 20 % / 50 % / 30 %`],
      ["Energie", `${de(energy, 0)} EUR · 25 % / 50 % / 25 %`],
      ["Zuschlagsgrundlagen", "4.000 EUR / 5.000 EUR / 2.500 EUR"],
    ],
    visual: {
      type: "illustration",
      data: { kind: "bab-flow" },
      alt: "Ablauf vom Gemeinkostenblock über Verteilungsschlüssel zu Kostenstellen und Zuschlagssätzen",
    },
    columns,
    rows: [
      ...input.overheads.map((overhead) => ({
        id: overhead.id,
        label: overhead.name,
        cells: columns.map((column) => ({
          id: `${overhead.id}.${column.id}`,
          editable: true,
          answer: result.allocations[overhead.id]?.[column.id] ?? 0,
          dec: 0,
          explanation: `${de(overhead.amount, 0)} × ${de((overhead.shares as Record<string, number>)[column.id]! * 100, 0)} %`,
        })),
      })),
      {
        id: "summe",
        label: "Gemeinkosten gesamt",
        cells: columns.map((column) => ({
          id: `summe.${column.id}`,
          editable: true,
          answer: result.totals[column.id] ?? 0,
          dec: 0,
          explanation: "Summe der Kostenarten dieser Spalte",
        })),
      },
      {
        id: "zuschlag",
        label: "Zuschlagssatz (%)",
        cells: columns.map((column) => ({
          id: `zuschlag.${column.id}`,
          editable: true,
          answer: result.surchargeRates[column.id] ?? 0,
          dec: 2,
          explanation: "Gemeinkosten ÷ Zuschlagsgrundlage × 100",
        })),
      },
    ],
    steps: [
      "Jede Kostenart zeilenweise mit ihrem Verteilungsschlüssel multiplizieren.",
      "Die verteilten Beträge je Kostenstelle spaltenweise summieren.",
      "Zuschlagssatz = Gemeinkosten der Kostenstelle ÷ Zuschlagsgrundlage × 100.",
    ],
    trap: "Prozentanteile einer Kostenart müssen zusammen 100 % ergeben; Zuschlagssätze werden nicht aus der Gesamtsumme berechnet.",
  };
}

function stepDownTask(): TableTask {
  const scale = rnd(1, 3);
  const input = {
    order: ["energie", "reinigung"],
    centers: [
      { id: "energie", name: "Energie", kind: "service" as const, primaryCost: 1_000 * scale },
      { id: "reinigung", name: "Reinigung", kind: "service" as const, primaryCost: 500 * scale },
      { id: "fertigung", name: "Fertigung", kind: "main" as const, primaryCost: 2_000 * scale },
      { id: "verwaltung", name: "Verwaltung", kind: "main" as const, primaryCost: 1_000 * scale },
    ],
    services: {
      energie: { reinigung: 20, fertigung: 60, verwaltung: 20 },
      reinigung: { energie: 10, fertigung: 50, verwaltung: 20 },
    },
  };
  const result = calculateStepDown(input);
  const [energy, cleaning] = result.steps;
  return {
    kind: "table",
    topic: "stufenleiter",
    pts: 8,
    lead: "Zwei Hilfskostenstellen geben Leistungen an nachgelagerte Kostenstellen ab. Energie wird zuerst geschlossen.",
    q: "Führen Sie die <b>innerbetriebliche Leistungsverrechnung</b> im Stufenleiterverfahren durch.",
    given: [
      [
        "Primäre Gemeinkosten",
        `Energie ${de(1_000 * scale, 0)} · Reinigung ${de(500 * scale, 0)} · Fertigung ${de(2_000 * scale, 0)} · Verwaltung ${de(1_000 * scale, 0)} EUR`,
      ],
      ["Energie-Leistung", "20 ME Reinigung · 60 ME Fertigung · 20 ME Verwaltung"],
      ["Reinigungs-Leistung", "10 ME Energie · 50 ME Fertigung · 20 ME Verwaltung"],
    ],
    visual: {
      type: "illustration",
      data: { kind: "step-down" },
      alt: "Stufenförmige Leistungsverrechnung von Energie über Reinigung zu Hauptkostenstellen",
    },
    columns: [
      { id: "basis", label: "zu verrechnende Kosten", unit: "EUR" },
      { id: "satz", label: "Verrechnungssatz", unit: "EUR/ME" },
      { id: "fertigung", label: "an Fertigung", unit: "EUR" },
      { id: "verwaltung", label: "an Verwaltung", unit: "EUR" },
    ],
    rows: [
      {
        id: "energie",
        label: "1. Energie",
        cells: [
          { id: "energie.basis", editable: true, answer: energy!.cost, dec: 0 },
          { id: "energie.satz", editable: true, answer: energy!.rate, dec: 2 },
          {
            id: "energie.fertigung",
            editable: true,
            answer: energy!.allocations["fertigung"] ?? 0,
            dec: 0,
          },
          {
            id: "energie.verwaltung",
            editable: true,
            answer: energy!.allocations["verwaltung"] ?? 0,
            dec: 0,
          },
        ],
      },
      {
        id: "reinigung",
        label: "2. Reinigung",
        cells: [
          { id: "reinigung.basis", editable: true, answer: cleaning!.cost, dec: 0 },
          { id: "reinigung.satz", editable: true, answer: cleaning!.rate, dec: 2 },
          {
            id: "reinigung.fertigung",
            editable: true,
            answer: cleaning!.allocations["fertigung"] ?? 0,
            dec: 0,
          },
          {
            id: "reinigung.verwaltung",
            editable: true,
            answer: cleaning!.allocations["verwaltung"] ?? 0,
            dec: 0,
          },
        ],
      },
      {
        id: "end",
        label: "Endkosten",
        cells: [
          { id: "end.basis", editable: false, value: "–" },
          { id: "end.satz", editable: false, value: "–" },
          {
            id: "end.fertigung",
            editable: true,
            answer: result.finalCosts["fertigung"] ?? 0,
            dec: 0,
          },
          {
            id: "end.verwaltung",
            editable: true,
            answer: result.finalCosts["verwaltung"] ?? 0,
            dec: 0,
          },
        ],
      },
    ],
    steps: [
      `Energie: ${de(energy!.cost, 0)} EUR ÷ ${energy!.quantity} ME = ${de(energy!.rate, 2)} EUR/ME; anschließend vollständig verteilen.`,
      `Reinigung übernimmt zuerst ${de(energy!.allocations["reinigung"] ?? 0, 0)} EUR Sekundärkosten. Bereits geschlossene Energie wird bei ihrer Leistungsmenge nicht mehr berücksichtigt.`,
      `Reinigung: ${de(cleaning!.cost, 0)} EUR ÷ ${cleaning!.quantity} ME = ${de(cleaning!.rate, 2)} EUR/ME.`,
      `Endkosten: Fertigung ${de(result.finalCosts["fertigung"]!, 0)} EUR, Verwaltung ${de(result.finalCosts["verwaltung"]!, 0)} EUR.`,
    ],
    trap: "Leistungen an bereits abgerechnete Hilfskostenstellen werden in späteren Stufen nicht rückverrechnet.",
  };
}

export const ADVANCED_GEN: Record<
  "erm" | "netzplan" | "gantt" | "bab" | "stufenleiter",
  () => Task
> = {
  erm: ermTask,
  netzplan: netzplanTask,
  gantt: ganttTask,
  bab: babTask,
  stufenleiter: stepDownTask,
};
