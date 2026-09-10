/** Aufgaben-Generatoren für den Rechen-Trainer (portiert aus AP1-Trainer.html). */

export interface Task {
  topic: string;
  pts: number;
  lead: string;
  q: string;
  given: [string, string][];
  answer: number | string;
  unit: string;
  ip?: boolean;
  dec?: number;
  steps: string[];
  trap: string;
}

export function rnd(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function de(v: number, dec = 2): string {
  return v.toLocaleString("de-DE", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

export function de0(v: number): string {
  return de(v, 0);
}

const MI = 1048576;
const GI = 1073741824;
const TI = 1099511627776;

function maskOf(p: number): string {
  const m = [0, 0, 0, 0];
  for (let i = 0; i < 32; i++) if (i < p) m[i >> 3]! |= 128 >> (i % 8);
  return m.join(".");
}

export const GEN: Record<string, () => Task> = {
  subnetting(): Task {
    const p = pick([25, 26, 27, 28, 29]);
    const base = pick(["192.168.", "172.20.", "10.42.", "192.168."]);
    const o3 = rnd(0, 60);
    const o4 = rnd(1, 254);
    const ip = base + o3 + "." + o4;
    const bits = 32 - p;
    const block = Math.pow(2, bits);
    const net = Math.floor(o4 / block) * block;
    const bc = net + block - 1;
    const netIp = base + o3 + "." + net;
    const bcIp = base + o3 + "." + bc;
    const hosts = block - 2;
    const q = pick(["net", "bc", "hosts", "mask", "last"] as const);
    const map = {
      net: {
        t: "Geben Sie die <b>Netzadresse</b> an.",
        a: netIp as string | number,
        u: "",
        ip: true,
      },
      bc: {
        t: "Geben Sie die <b>Broadcast-Adresse</b> an.",
        a: bcIp as string | number,
        u: "",
        ip: true,
      },
      hosts: {
        t: "Geben Sie die <b>Anzahl nutzbarer Hostadressen</b> an.",
        a: hosts as string | number,
        u: "Adressen",
        ip: false,
      },
      mask: {
        t: "Geben Sie die <b>Subnetzmaske</b> in Dezimalschreibweise an.",
        a: maskOf(p) as string | number,
        u: "",
        ip: true,
      },
      last: {
        t: "Geben Sie die <b>letzte nutzbare Hostadresse</b> an.",
        a: (base + o3 + "." + (bc - 1)) as string | number,
        u: "",
        ip: true,
      },
    };
    const s = map[q];
    return {
      topic: "subnetting",
      pts: rnd(1, 2),
      lead: "Ein Arbeitsplatzrechner hat die folgende Konfiguration erhalten.",
      q: s.t,
      given: [["IP-Adresse mit Präfix", ip + "/" + p]],
      answer: s.a,
      unit: s.u,
      ip: !!s.ip,
      steps: [
        `Präfix /${p} bedeutet <code>${bits}</code> Hostbits.`,
        `Subnetzmaske: <code>${maskOf(p)}</code>`,
        `Blockgröße: <code>256 − ${maskOf(p).split(".")[3]} = ${block}</code>`,
        `Der Block, in dem .${o4} liegt: <code>${net} – ${bc}</code>`,
        `Netzadresse <code>${netIp}</code>, Broadcast <code>${bcIp}</code>, Hosts <code>2^${bits} − 2 = ${hosts}</code>`,
      ],
      trap: "Anzahl der Hosts ist 2^h <b>minus zwei</b> — Netz- und Broadcastadresse sind nicht vergebbar.",
    };
  },

  datenmengen(): Task {
    const mode = pick(["rate", "speicher", "bild"] as const);
    if (mode === "bild") {
      const w = pick([1920, 2560, 3840, 4096]);
      const h = Math.round((w * 9) / 16);
      const bt = pick([16, 24, 32]);
      const bytes = (w * h * bt) / 8;
      return {
        topic: "datenmengen",
        pts: 3,
        lead: "Ein unkomprimiertes Einzelbild soll gespeichert werden.",
        q: "Berechnen Sie den <b>Speicherbedarf in MiB</b>. Runden Sie auf zwei Stellen.",
        given: [
          ["Auflösung", w + " × " + h + " px"],
          ["Farbtiefe", bt + " bit"],
        ],
        answer: bytes / MI,
        unit: "MiB",
        dec: 2,
        steps: [
          `Pixel: <code>${de0(w)} × ${de0(h)} = ${de0(w * h)}</code>`,
          `Bit: <code>${de0(w * h)} × ${bt} = ${de0(w * h * bt)}</code>`,
          `Byte: <code>÷ 8 = ${de0(bytes)}</code>`,
          `MiB: <code>÷ 1024 ÷ 1024 = ${de(bytes / MI, 2)}</code>`,
        ],
        trap: "Speicher rechnet in 1024er-Schritten — nicht in 1000ern.",
      };
    }
    const w = pick([1280, 1920, 2560, 3840]);
    const h = Math.round((w * 9) / 16);
    const bt = 24;
    const fps = pick([15, 20, 25, 30]);
    const k = pick([5, 8, 10, 20, 30]);
    const bps = w * h * bt * fps * (k / 100);
    if (mode === "rate") {
      return {
        topic: "datenmengen",
        pts: 4,
        lead: "Eine Netzwerkkamera überträgt einen Live-Stream.",
        q: "Berechnen Sie die erforderliche <b>Datenübertragungsrate in Mbit/s</b>. Runden Sie auf volle Mbit/s auf.",
        given: [
          ["Auflösung", w + " × " + h + " px"],
          ["Farbtiefe", bt + " bit"],
          ["Bildrate", fps + " fps"],
          ["Komprimierung auf", k + " %"],
        ],
        answer: Math.ceil(bps / 1e6),
        unit: "Mbit/s",
        dec: 0,
        steps: [
          `Pixel je Bild: <code>${de0(w)} × ${de0(h)} = ${de0(w * h)}</code>`,
          `Bit je Bild: <code>× ${bt} = ${de0(w * h * bt)}</code>`,
          `Bit je Sekunde: <code>× ${fps} = ${de0(w * h * bt * fps)}</code>`,
          `Komprimierung: <code>× ${(k / 100).toString().replace(".", ",")} = ${de0(Math.round(bps))} bit/s</code>`,
          `In Mbit/s: <code>÷ 1.000.000 = ${de(bps / 1e6, 4)} → ${de0(Math.ceil(bps / 1e6))}</code>`,
        ],
        trap: "Datenraten sind dezimal: durch 1.000.000 teilen, nicht durch 1024².",
      };
    }
    const cams = rnd(2, 8);
    const days = pick([1, 3, 7, 14, 30]);
    const rate = Math.ceil(bps / 1e6) * 1e6;
    const secs = days * 86400;
    const tib = (rate * cams * secs) / 8 / TI;
    return {
      topic: "datenmengen",
      pts: 5,
      lead: "Die Aufnahmen mehrerer Kameras sollen vorgehalten werden.",
      q: "Berechnen Sie die notwendige <b>Speicherkapazität in TiB</b>. Runden Sie auf.",
      given: [
        ["Datenrate je Kamera", de0(rate / 1e6) + " Mbit/s"],
        ["Anzahl Kameras", String(cams)],
        ["Aufbewahrung", days + " Tage"],
      ],
      answer: Math.ceil(tib),
      unit: "TiB",
      dec: 0,
      steps: [
        `Sekunden: <code>${days} × 24 × 3.600 = ${de0(secs)}</code>`,
        `Bit gesamt: <code>${de0(rate / 1e6)}.000.000 × ${cams} × ${de0(secs)} = ${(rate * cams * secs).toExponential(4).replace(".", ",")} bit</code>`,
        `Byte: <code>÷ 8</code>`,
        `TiB: <code>÷ 1024⁴ = ${de(tib, 2)} → ${de0(Math.ceil(tib))}</code>`,
      ],
      trap: "Datenrate dezimal umrechnen, Speicher binär. In derselben Aufgabe beides — genau darauf zielt die Prüfung.",
    };
  },

  uebertragung(): Task {
    const gi = Math.random() < 0.5;
    const size = gi ? pick([1, 2, 4, 5]) : pick([100, 250, 500, 750]);
    const bits = gi ? size * GI * 8 : size * MI * 8;
    const rate = pick([25.5, 40, 50.02, 75.78, 100, 250, 1000]);
    const secs = bits / (rate * 1e6);
    const up = Math.ceil(secs);
    return {
      topic: "uebertragung",
      pts: 4,
      lead: "Eine Datei soll über die Internetleitung hochgeladen werden.",
      q: "Berechnen Sie die <b>Übertragungsdauer in Sekunden</b>. Runden Sie auf volle Sekunden auf.",
      given: [
        ["Dateigröße", de0(size) + " " + (gi ? "GiB" : "MiB")],
        ["Download", de(rate * 2, 2).replace(",00", "") + " Mbit/s"],
        ["Upload", String(rate).replace(".", ",") + " Mbit/s"],
      ],
      answer: up,
      unit: "s",
      dec: 0,
      steps: [
        `Maßgeblich ist der <b>Upload</b>: <code>${String(rate).replace(".", ",")} Mbit/s = ${de0(rate * 1e6)} bit/s</code>`,
        `Datenmenge in Bit: <code>${de0(size)} × ${gi ? "1024³" : "1024²"} × 8 = ${de0(bits)}</code>`,
        `Zeit: <code>${de0(bits)} ÷ ${de0(rate * 1e6)} = ${de(secs, 2)} s</code>`,
        `Aufgerundet: <code>${up} s</code>` +
          (up > 60 ? ` = <code>${Math.floor(up / 60)} min ${up % 60} s</code>` : ""),
      ],
      trap: "Beim Hochladen zählt die Upload-Rate. Das ist der häufigste Fehler in dieser Aufgabenfamilie.",
    };
  },

  strom(): Task {
    const mode = pick(["kosten", "poe", "steckdose"] as const);
    if (mode === "poe") {
      const P = pick([13, 24, 32, 45, 51, 57]);
      const U = 48;
      const std =
        P <= 15.4
          ? "IEEE 802.3af"
          : P <= 30
            ? "IEEE 802.3at"
            : P <= 60
              ? "IEEE 802.3bt (Type 3)"
              : "IEEE 802.3bt (Type 4)";
      return {
        topic: "strom",
        pts: 3,
        lead: "Ein Gerät wird über das Netzwerkkabel mit Strom versorgt (PoE).",
        q: "Berechnen Sie die maximale <b>Stromstärke in mA</b>.",
        given: [
          ["Leistungsaufnahme", de(P, 1).replace(",0", "") + " W"],
          ["Spannung", U + " V"],
        ],
        answer: (P / U) * 1000,
        unit: "mA",
        dec: 1,
        steps: [
          `Formel: <code>I = P ÷ U</code>`,
          `<code>${de(P, 1).replace(",0", "")} W ÷ ${U} V = ${de(P / U, 4)} A</code>`,
          `In mA: <code>× 1.000 = ${de((P / U) * 1000, 1)} mA</code>`,
          `Passender Standard: <b>${std}</b>`,
        ],
        trap: "Nach der Stromstärke wird in mA gefragt — das Ergebnis in Ampere ist noch mal 1.000 zu nehmen.",
      };
    }
    if (mode === "steckdose") {
      const A = 16;
      const U = 230;
      const max = A * U;
      const pcs = rnd(2, 4);
      const pcW = pick([180, 200, 220, 250]);
      const dev1 = pick([400, 900, 1100]);
      const dev2 = pick([1800, 2000, 2200, 2400]);
      const sum = pcs * pcW + dev1 + dev2;
      return {
        topic: "strom",
        pts: 3,
        lead: "Mehrere Geräte hängen an einer Mehrfachsteckdose mit der Aufschrift „maximal 16 A“.",
        q: "Berechnen Sie die <b>maximal zulässige Leistung in Watt</b>.",
        given: [
          ["Absicherung", A + " A"],
          ["Netzspannung", U + " V"],
          ["angeschlossen", de0(pcs) + " × " + pcW + " W + " + dev1 + " W + " + dev2 + " W"],
        ],
        answer: max,
        unit: "W",
        dec: 0,
        steps: [
          `Formel: <code>P = U × I</code>`,
          `<code>${A} A × ${U} V = ${de0(max)} W</code> zulässig`,
          `Angeschlossen: <code>${pcs} × ${pcW} + ${dev1} + ${dev2} = ${de0(sum)} W</code>`,
          sum > max
            ? `<b>${de0(sum)} W > ${de0(max)} W</b> → gleichzeitiger Betrieb nicht möglich`
            : `<b>${de0(sum)} W ≤ ${de0(max)} W</b> → gleichzeitiger Betrieb möglich`,
        ],
        trap: "Die Prüfung will den Nachweis: zulässige Last berechnen und der tatsächlichen gegenüberstellen.",
      };
    }
    const P = pick([60, 120, 250, 450, 600]);
    const eta = pick([43, 76, 82, 87, 90, 94]);
    const hd = pick([8, 9, 10, 24]);
    const days = pick([200, 220, 250, 365]);
    const price = pick([0.28, 0.3, 0.34, 0.4]);
    const pzu = P / (eta / 100);
    const kwh = (pzu / 1000) * hd * days;
    const cost = kwh * price;
    return {
      topic: "strom",
      pts: 5,
      lead: "Für einen Rechner sollen die jährlichen Stromkosten ermittelt werden.",
      q: "Berechnen Sie die <b>jährlichen Stromkosten in EUR</b>. Runden Sie auf zwei Stellen.",
      given: [
        ["Leistung der Komponenten", P + " W"],
        ["Wirkungsgrad des Netzteils", eta + " %"],
        ["Betrieb", days + " Tage × " + hd + " h"],
        ["Strompreis", de(price, 2) + " EUR/kWh"],
      ],
      answer: cost,
      unit: "EUR",
      dec: 2,
      steps: [
        `Aus dem Netz bezogen: <code>${P} W ÷ ${de(eta / 100, 2)} = ${de(pzu, 2)} W</code>`,
        `Betriebsstunden: <code>${days} × ${hd} = ${de0(days * hd)} h</code>`,
        `Energie: <code>${de(pzu / 1000, 5)} kW × ${de0(days * hd)} h = ${de(kwh, 2)} kWh</code>`,
        `Kosten: <code>${de(kwh, 2)} kWh × ${de(price, 2)} EUR = ${de(cost, 2)} EUR</code>`,
      ],
      trap: "Der Wirkungsgrad wird <b>geteilt</b>, nicht multipliziert — das Netzteil zieht mehr, als der Rechner braucht.",
    };
  },

  wirtschaft(): Task {
    const mode = pick(["bezug", "brutto", "amort", "monat"] as const);
    if (mode === "bezug") {
      const lp = pick([890, 1190, 1250, 1320, 1480]);
      const rab = pick([0, 3, 5, 8, 10]);
      const lief = pick([0, 9, 12, 18, 25]);
      const bp = lp * (1 - rab / 100) + lief;
      return {
        topic: "wirtschaft",
        pts: 3,
        lead: "Für eine Beschaffung liegt ein Angebot vor.",
        q: "Berechnen Sie den <b>Bezugspreis pro Stück in EUR</b>.",
        given: [
          ["Listenpreis", de(lp, 2) + " EUR"],
          ["Rabatt", rab + " %"],
          ["Lieferkosten je Stück", de(lief, 2) + " EUR"],
        ],
        answer: bp,
        unit: "EUR",
        dec: 2,
        steps: [
          `Rabatt abziehen: <code>${de(lp, 2)} × ${de(1 - rab / 100, 2)} = ${de(lp * (1 - rab / 100), 2)} EUR</code>`,
          `Lieferkosten addieren: <code>+ ${de(lief, 2)} = ${de(bp, 2)} EUR</code>`,
        ],
        trap: "Reihenfolge: erst Rabatt vom Listenpreis, dann Bezugskosten dazu.",
      };
    }
    if (mode === "brutto") {
      const items: [number, number][] = [
        [rnd(8, 40), pick([39, 120, 489, 512])],
        [rnd(1, 6), pick([640, 1290, 2450])],
      ];
      const netto = items.reduce((a, [n, p]) => a + n * p, 0);
      const [i0, i1] = items as [[number, number], [number, number]];
      return {
        topic: "wirtschaft",
        pts: 4,
        lead: "Für ein Angebot ist der Bruttobetrag zu ermitteln.",
        q: "Berechnen Sie den <b>Bruttobetrag in EUR</b> bei 19 % Umsatzsteuer.",
        given: [
          [de0(i0[0]) + " Stück à " + de(i0[1], 2) + " EUR", de(i0[0] * i0[1], 2) + " EUR"],
          [de0(i1[0]) + " Stück à " + de(i1[1], 2) + " EUR", de(i1[0] * i1[1], 2) + " EUR"],
        ],
        answer: netto * 1.19,
        unit: "EUR",
        dec: 2,
        steps: [
          `Nettobetrag: <code>${de(i0[0] * i0[1], 2)} + ${de(i1[0] * i1[1], 2)} = ${de(netto, 2)} EUR</code>`,
          `Brutto: <code>${de(netto, 2)} × 1,19 = ${de(netto * 1.19, 2)} EUR</code>`,
        ],
        trap: "Brutto ist <b>mal</b> 1,19. Vom Brutto zum Netto wird <b>geteilt</b>, nicht 19 % abgezogen.",
      };
    }
    if (mode === "amort") {
      const mehr = pick([100, 140, 180, 240, 320]);
      const spar = +(Math.random() * 22 + 4).toFixed(2);
      const mon = mehr / spar;
      return {
        topic: "wirtschaft",
        pts: 3,
        lead: "Ein teureres, aber sparsameres Gerät steht zur Auswahl.",
        q: "Berechnen Sie, nach wie vielen <b>vollen Monaten</b> sich der Mehrpreis amortisiert hat.",
        given: [
          ["Mehrpreis in der Anschaffung", de(mehr, 2) + " EUR"],
          ["Ersparnis pro Monat", de(spar, 2) + " EUR"],
        ],
        answer: Math.ceil(mon),
        unit: "Monate",
        dec: 0,
        steps: [
          `Formel: <code>Mehrpreis ÷ Ersparnis je Periode</code>`,
          `<code>${de(mehr, 2)} ÷ ${de(spar, 2)} = ${de(mon, 2)} Monate</code>`,
          `Aufgerundet: <b>${Math.ceil(mon)} Monate</b>`,
        ],
        trap: "Immer aufrunden — nach 30,6 Monaten hat sich nichts amortisiert, erst nach 31.",
      };
    }
    const stk = pick([5, 10, 12, 20, 24]);
    const preis = pick([450, 720, 1202, 180]);
    const jahre = pick([3, 4, 5]);
    const miete = pick([22, 35, 50]);
    const wartJ = pick([1200, 2400, 2880]);
    const abschr = (stk * preis) / (jahre * 12);
    const soft = stk * miete;
    const wart = wartJ / 12;
    const total = abschr + soft + wart;
    return {
      topic: "wirtschaft",
      pts: 6,
      lead: "Für eine Arbeitsplatzausstattung sind die laufenden Monatskosten zu ermitteln.",
      q: "Berechnen Sie die <b>laufenden Kosten pro Monat in EUR</b>.",
      given: [
        ["Geräte", de0(stk) + " × " + de(preis, 2) + " EUR"],
        ["Nutzungsdauer", jahre + " Jahre"],
        ["Softwaremiete je Platz", de(miete, 2) + " EUR/Monat"],
        ["Wartungspauschale", de(wartJ, 2) + " EUR/Jahr"],
      ],
      answer: total,
      unit: "EUR",
      dec: 2,
      steps: [
        `Geräte: <code>${de0(stk)} × ${de(preis, 2)} = ${de(stk * preis, 2)} EUR ÷ ${jahre * 12} Monate = ${de(abschr, 2)} EUR</code>`,
        `Software: <code>${de0(stk)} × ${de(miete, 2)} = ${de(soft, 2)} EUR</code>`,
        `Wartung: <code>${de(wartJ, 2)} ÷ 12 = ${de(wart, 2)} EUR</code>`,
        `Summe: <code>${de(total, 2)} EUR pro Monat</code>`,
      ],
      trap: "Die Nutzungsdauer steht in Jahren, gefragt sind Monatskosten — mal zwölf nehmen.",
    };
  },

  netzplan(): Task {
    const mode = pick(["fez", "saz", "gp", "fp"] as const);
    const d = rnd(2, 8);
    const faz = rnd(0, 14);
    const fez = faz + d;
    const gp = pick([0, 0, 1, 2, 3, 4]);
    const saz = faz + gp;
    const sez = saz + d;
    const fazN = fez + pick([0, 0, 1, 2, 3]);
    const map = {
      fez: {
        q: "Berechnen Sie den <b>frühesten Endzeitpunkt (FEZ)</b>.",
        a: fez,
        g: [
          ["FAZ", faz],
          ["Dauer", d],
        ] as [string, number][],
        s: [`Formel: <code>FEZ = FAZ + Dauer</code>`, `<code>${faz} + ${d} = ${fez}</code>`],
      },
      saz: {
        q: "Berechnen Sie den <b>spätesten Anfangszeitpunkt (SAZ)</b>.",
        a: sez - d,
        g: [
          ["SEZ", sez],
          ["Dauer", d],
        ] as [string, number][],
        s: [`Formel: <code>SAZ = SEZ − Dauer</code>`, `<code>${sez} − ${d} = ${sez - d}</code>`],
      },
      gp: {
        q: "Berechnen Sie den <b>Gesamtpuffer (GP)</b>.",
        a: gp,
        g: [
          ["FAZ", faz],
          ["SAZ", saz],
          ["FEZ", fez],
          ["SEZ", sez],
        ] as [string, number][],
        s: [
          `Formel: <code>GP = SAZ − FAZ</code>`,
          `<code>${saz} − ${faz} = ${gp}</code>`,
          `Gegenprobe: <code>SEZ − FEZ = ${sez} − ${fez} = ${gp}</code>`,
          gp === 0
            ? "GP = 0 → der Vorgang liegt auf dem <b>kritischen Pfad</b>."
            : "GP > 0 → der Vorgang ist nicht kritisch.",
        ],
      },
      fp: {
        q: "Berechnen Sie den <b>freien Puffer (FP)</b>.",
        a: fazN - fez,
        g: [
          ["FEZ dieses Vorgangs", fez],
          ["FAZ des Nachfolgers", fazN],
        ] as [string, number][],
        s: [
          `Formel: <code>FP = FAZ des Nachfolgers − FEZ</code>`,
          `<code>${fazN} − ${fez} = ${fazN - fez}</code>`,
        ],
      },
    };
    const m = map[mode];
    return {
      topic: "netzplan",
      pts: 2,
      lead: "Aus einem Netzplan ist ein einzelner Wert zu ergänzen.",
      q: m.q,
      given: m.g.map(([k, v]) => [k, String(v) + " Tage"] as [string, string]),
      answer: m.a,
      unit: "Tage",
      dec: 0,
      steps: m.s,
      trap: "Bei mehreren Vorgängern ist FAZ das <b>Maximum</b>, bei mehreren Nachfolgern SEZ das <b>Minimum</b>.",
    };
  },

  raid(): Task {
    const big = rnd(2, 4);
    const bigC = pick([6, 8, 10]);
    const small = rnd(3, 6);
    const smallC = pick([2, 3, 4]);
    const n = big + small;
    const k = Math.min(bigC, smallC);
    const lvl = pick(["5", "6", "0", "1", "10", "JBOD"] as const);
    const calc: Record<string, number> = {
      "0": n * k,
      "1": k,
      "5": (n - 1) * k,
      "6": (n - 2) * k,
      "10": Math.floor(n / 2) * k,
      JBOD: big * bigC + small * smallC,
    };
    const expl: Record<string, string> = {
      "0": `RAID 0 nutzt alle Platten: <code>${n} × ${k} TB</code>`,
      "1": `RAID 1 spiegelt vollständig, nutzbar ist die Kapazität einer Platte: <code>${k} TB</code>`,
      "5": `RAID 5 opfert eine Platte für die Parität: <code>(${n} − 1) × ${k} TB</code>`,
      "6": `RAID 6 opfert zwei Platten: <code>(${n} − 2) × ${k} TB</code>`,
      "10": `RAID 10 spiegelt paarweise, nutzbar ist die Hälfte: <code>${Math.floor(n / 2)} × ${k} TB</code>`,
      JBOD: `JBOD verkettet einfach alle Platten: <code>${big} × ${bigC} + ${small} × ${smallC} TB</code>`,
    };
    return {
      topic: "raid",
      pts: 3,
      lead: "Aus den vorhandenen Festplatten soll ein Verbund gebildet werden.",
      q: `Berechnen Sie die <b>Nettospeicherkapazität in TB</b> für ${lvl === "JBOD" ? "einen <b>JBOD</b>-Verbund" : "<b>RAID " + lvl + "</b>"}.`,
      given: [
        ["große Platten", big + " × " + bigC + " TB"],
        ["kleine Platten", small + " × " + smallC + " TB"],
        ["Platten gesamt", String(n)],
      ],
      answer: calc[lvl]!,
      unit: "TB",
      dec: 0,
      steps: [
        lvl === "JBOD"
          ? "Bei JBOD zählt jede Platte mit ihrer vollen Kapazität."
          : `Maßgeblich ist die <b>kleinste</b> Plattenkapazität: <code>${k} TB</code>`,
        expl[lvl]!,
        `Ergebnis: <b>${de0(calc[lvl]!)} TB</b>`,
      ],
      trap: "Außer bei JBOD zählt immer die <b>kleinste</b> Platte — der Rest der großen Platten bleibt ungenutzt.",
    };
  },
};

/** Prüft eine Eingabe gegen die Musterantwort. */
export function checkAnswer(task: Task, input: string): boolean {
  const raw = input.trim();
  if (!raw) return false;
  if (task.ip || typeof task.answer === "string") {
    return raw.replace(/\s/g, "") === String(task.answer).replace(/\s/g, "");
  }
  const num = Number(raw.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(num)) return false;
  const dec = task.dec ?? 2;
  const f = Math.pow(10, dec);
  return Math.round(num * f) / f === Math.round((task.answer as number) * f) / f;
}

export function formatAnswer(task: Task): string {
  if (typeof task.answer === "string") return task.answer;
  return de(task.answer, task.dec ?? 2);
}
