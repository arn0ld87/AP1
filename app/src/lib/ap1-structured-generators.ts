export interface NetworkActivityInput {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
}

export interface CalculatedNetworkActivity extends NetworkActivityInput {
  successors: string[];
  faz: number;
  fez: number;
  saz: number;
  sez: number;
  totalFloat: number;
  freeFloat: number;
  critical: boolean;
}

export interface NetworkPlanResult {
  activities: CalculatedNetworkActivity[];
  projectDuration: number;
  criticalPath: string[];
}

export function calculateNetworkPlan(input: NetworkActivityInput[]): NetworkPlanResult {
  if (!input.length) return { activities: [], projectDuration: 0, criticalPath: [] };
  const byId = new Map(input.map((activity) => [activity.id, activity]));
  if (byId.size !== input.length) throw new Error("Vorgangs-IDs müssen eindeutig sein.");
  for (const activity of input) {
    if (!Number.isFinite(activity.duration) || activity.duration < 0) {
      throw new Error(`Ungültige Dauer für Vorgang ${activity.id}.`);
    }
    for (const predecessor of activity.predecessors) {
      if (!byId.has(predecessor)) throw new Error(`Unbekannter Vorgänger ${predecessor}.`);
    }
  }

  const successors = new Map(input.map((activity) => [activity.id, [] as string[]]));
  const indegree = new Map(input.map((activity) => [activity.id, activity.predecessors.length]));
  for (const activity of input) {
    for (const predecessor of activity.predecessors) successors.get(predecessor)!.push(activity.id);
  }
  const queue = input
    .filter((activity) => indegree.get(activity.id) === 0)
    .map((activity) => activity.id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const successor of successors.get(id)!) {
      const next = indegree.get(successor)! - 1;
      indegree.set(successor, next);
      if (next === 0) queue.push(successor);
    }
  }
  if (order.length !== input.length) throw new Error("Der Netzplan enthält einen Zyklus.");

  const calculated = new Map<string, CalculatedNetworkActivity>();
  for (const id of order) {
    const activity = byId.get(id)!;
    const faz = activity.predecessors.length
      ? Math.max(...activity.predecessors.map((predecessor) => calculated.get(predecessor)!.fez))
      : 0;
    calculated.set(id, {
      ...activity,
      successors: successors.get(id)!,
      faz,
      fez: faz + activity.duration,
      saz: 0,
      sez: 0,
      totalFloat: 0,
      freeFloat: 0,
      critical: false,
    });
  }
  const projectDuration = Math.max(...[...calculated.values()].map((activity) => activity.fez));
  for (const id of [...order].reverse()) {
    const activity = calculated.get(id)!;
    activity.sez = activity.successors.length
      ? Math.min(...activity.successors.map((successor) => calculated.get(successor)!.saz))
      : projectDuration;
    activity.saz = activity.sez - activity.duration;
    activity.totalFloat = activity.saz - activity.faz;
    const nextStart = activity.successors.length
      ? Math.min(...activity.successors.map((successor) => calculated.get(successor)!.faz))
      : projectDuration;
    activity.freeFloat = nextStart - activity.fez;
    activity.critical = activity.totalFloat === 0;
  }

  const starts = order.filter((id) => calculated.get(id)!.predecessors.length === 0);
  const findCriticalPath = (id: string, seen: string[] = []): string[] | null => {
    const activity = calculated.get(id)!;
    if (!activity.critical) return null;
    const path = [...seen, id];
    if (!activity.successors.length) return activity.fez === projectDuration ? path : null;
    for (const successor of activity.successors) {
      const next = calculated.get(successor)!;
      if (next.critical && next.faz === activity.fez) {
        const result = findCriticalPath(successor, path);
        if (result) return result;
      }
    }
    return null;
  };
  const criticalPath = starts.map((id) => findCriticalPath(id)).find(Boolean) ?? [];

  return {
    activities: input.map((activity) => calculated.get(activity.id)!),
    projectDuration,
    criticalPath,
  };
}

export interface BabInput {
  costCenters: Array<{ id: string; name: string; allocationBase: number }>;
  overheads: Array<{ id: string; name: string; amount: number; shares: Record<string, number> }>;
}

export interface BabResult {
  allocations: Record<string, Record<string, number>>;
  totals: Record<string, number>;
  surchargeRates: Record<string, number>;
}

const round = (value: number, dec = 2): number => Math.round(value * 10 ** dec) / 10 ** dec;

export function calculateBab(input: BabInput): BabResult {
  const ids = new Set(input.costCenters.map((center) => center.id));
  if (ids.size !== input.costCenters.length)
    throw new Error("Kostenstellen müssen eindeutig sein.");
  const totals = Object.fromEntries(input.costCenters.map((center) => [center.id, 0]));
  const allocations: Record<string, Record<string, number>> = {};
  for (const overhead of input.overheads) {
    const shareSum = Object.values(overhead.shares).reduce((sum, share) => sum + share, 0);
    if (Math.abs(shareSum - 1) > 0.000001)
      throw new Error(`Verteilung ${overhead.id} ergibt nicht 100 %.`);
    allocations[overhead.id] = {};
    for (const [centerId, share] of Object.entries(overhead.shares)) {
      if (!ids.has(centerId)) throw new Error(`Unbekannte Kostenstelle ${centerId}.`);
      const amount = round(overhead.amount * share);
      allocations[overhead.id]![centerId] = amount;
      totals[centerId] = round((totals[centerId] ?? 0) + amount);
    }
  }
  const surchargeRates = Object.fromEntries(
    input.costCenters.map((center) => {
      if (center.allocationBase <= 0) throw new Error(`Ungültige Zuschlagsgrundlage ${center.id}.`);
      return [center.id, round((totals[center.id]! / center.allocationBase) * 100)];
    }),
  );
  return { allocations, totals, surchargeRates };
}

export interface StepDownInput {
  order: string[];
  centers: Array<{ id: string; name: string; kind: "service" | "main"; primaryCost: number }>;
  services: Record<string, Record<string, number>>;
}

export interface StepDownResult {
  steps: Array<{
    centerId: string;
    cost: number;
    quantity: number;
    rate: number;
    allocations: Record<string, number>;
  }>;
  finalCosts: Record<string, number>;
}

export function calculateStepDown(input: StepDownInput): StepDownResult {
  const byId = new Map(input.centers.map((center) => [center.id, center]));
  const serviceIds = new Set(
    input.centers.filter((center) => center.kind === "service").map((center) => center.id),
  );
  if (byId.size !== input.centers.length) throw new Error("Kostenstellen müssen eindeutig sein.");
  if (input.order.length !== serviceIds.size || input.order.some((id) => !serviceIds.has(id))) {
    throw new Error("Verrechnungsreihenfolge muss alle Hilfskostenstellen genau einmal enthalten.");
  }
  const costs = Object.fromEntries(input.centers.map((center) => [center.id, center.primaryCost]));
  const processed = new Set<string>();
  const steps: StepDownResult["steps"] = [];
  for (const centerId of input.order) {
    const service = input.services[centerId] ?? {};
    const recipients = Object.entries(service).filter(
      ([recipient, quantity]) =>
        recipient !== centerId && !processed.has(recipient) && byId.has(recipient) && quantity > 0,
    );
    const quantity = recipients.reduce((sum, [, amount]) => sum + amount, 0);
    if (quantity <= 0) throw new Error(`Keine verrechenbare Leistung für ${centerId}.`);
    const cost = round(costs[centerId]!);
    const rate = round(cost / quantity, 6);
    const allocations: Record<string, number> = {};
    for (const [recipient, amount] of recipients) {
      const allocation = round(rate * amount);
      allocations[recipient] = allocation;
      costs[recipient] = round(costs[recipient]! + allocation);
    }
    costs[centerId] = 0;
    processed.add(centerId);
    steps.push({ centerId, cost, quantity, rate, allocations });
  }
  return { steps, finalCosts: costs };
}
