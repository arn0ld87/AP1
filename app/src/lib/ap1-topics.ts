export type TopicKind = "calc" | "card";

export interface Topic {
  id: string;
  name: string;
  rel: number;
  prio: "A" | "B";
  kind: TopicKind;
  hint: string;
}

export const TOPICS: Topic[] = [
  { id: "subnetting", name: "Subnetting / IPv4", rel: 5, prio: "A", kind: "calc", hint: "Maske, Netz, Broadcast, Hosts" },
  { id: "datenmengen", name: "Datenmengen & Speicher", rel: 5, prio: "A", kind: "calc", hint: "Auflösung, Farbtiefe, TiB" },
  { id: "uebertragung", name: "Übertragungszeit", rel: 5, prio: "A", kind: "calc", hint: "Datenmenge durch Datenrate" },
  { id: "strom", name: "Strom & Energiekosten", rel: 4, prio: "A", kind: "calc", hint: "P=U·I, Wirkungsgrad, kWh" },
  { id: "wirtschaft", name: "Kalkulation", rel: 5, prio: "A", kind: "calc", hint: "Bezugspreis, MwSt, Amortisation" },
  { id: "netzplan", name: "Netzplantechnik", rel: 4, prio: "A", kind: "calc", hint: "FAZ, FEZ, SAZ, SEZ, GP, FP" },
  { id: "raid", name: "RAID-Kapazität", rel: 3, prio: "B", kind: "calc", hint: "RAID 0/1/5/6/10, JBOD" },
  { id: "sicherheit", name: "IT-Sicherheit & Datenschutz", rel: 5, prio: "A", kind: "card", hint: "Schutzziele, DSGVO, Malware" },
  { id: "netzwerk", name: "Netzwerkdiagnose & OSI", rel: 5, prio: "A", kind: "card", hint: "Befehle, Schichten, Fehlersuche" },
  { id: "ipv6", name: "IPv6", rel: 3, prio: "B", kind: "card", hint: "Notation, Präfix, Link-Local" },
  { id: "hardware", name: "Hardware & Schnittstellen", rel: 4, prio: "B", kind: "card", hint: "Anschlüsse, RAM, PoE, SSD" },
  { id: "projekt", name: "Projektmanagement", rel: 4, prio: "B", kind: "card", hint: "Lastenheft, SMART, Phasen" },
  { id: "recht", name: "Wirtschaft & Recht", rel: 4, prio: "B", kind: "card", hint: "Kaufvertrag, Verzug, Leasing" },
  { id: "daten", name: "Datenbanken & Code", rel: 4, prio: "B", kind: "card", hint: "ERM, SQL, Pseudocode" },
];

export const T: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
);

export const CALC_TOPICS = TOPICS.filter((t) => t.kind === "calc");

export type MasteryKey = "none" | "good" | "mid" | "bad";

export interface Mastery {
  n: number;
  rate: number;
  key: MasteryKey;
  label: string;
  pct: number;
}

export function mastery(right: number, wrong: number): Mastery {
  const n = right + wrong;
  if (n < 4) {
    return {
      n,
      rate: n ? right / n : 0,
      key: "none",
      label: "kaum geübt",
      pct: n ? Math.round((100 * right) / n) : 0,
    };
  }
  const r = right / n;
  const pct = Math.round(r * 100);
  const key: MasteryKey = r >= 0.8 ? "good" : r >= 0.55 ? "mid" : "bad";
  const label = r >= 0.8 ? "sicher" : r >= 0.55 ? "wackelig" : "schwach";
  return { n, rate: r, key, label, pct };
}
