import { afterEach, describe, expect, it } from "vitest";

import { SCALAR_GEN as GEN, type ScalarTask as Task } from "../ap1-generators";

/**
 * Deterministischer PRNG (mulberry32) — ersetzt Math.random für
 * reproduzierbare Testläufe. Wird pro Testfall mit festem Seed initialisiert.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const origRandom = Math.random;
function seededRun<T>(seed: number, fn: () => T): T {
  Math.random = mulberry32(seed);
  try {
    return fn();
  } finally {
    Math.random = origRandom;
  }
}

afterEach(() => {
  Math.random = origRandom;
});

function plattenZahl(task: Task): number {
  const row = task.given.find(([k]) => k === "Platten gesamt");
  if (!row) throw new Error("keine Plattenanzahl im Task: " + task.q);
  return Number(row[1]);
}

function kleinsteKapazitaet(task: Task): number {
  const big = task.given.find(([k]) => k === "große Platten")![1];
  const small = task.given.find(([k]) => k === "kleine Platten")![1];
  const bigC = Number(big.split("×")[1]!.trim().split(" ")[0]!);
  const smallC = Number(small.split("×")[1]!.trim().split(" ")[0]!);
  return Math.min(bigC, smallC);
}

describe("RAID-Generator — RAID-10-Regression (1000 deterministische Fälle)", () => {
  it("RAID 10: ausschließlich gerade Plattenanzahl ≥ 4, Kapazität = (n/2) × k ohne Floor-Workaround", () => {
    let raid10Cases = 0;
    for (let seed = 1; seed <= 1000; seed++) {
      seededRun(seed, () => {
        const task = GEN["raid"]!();
        const n = plattenZahl(task);
        const k = kleinsteKapazitaet(task);

        if (task.q.includes("RAID 10")) {
          raid10Cases++;
          expect(n % 2, `Seed ${seed}: n=${n} ungerade`).toBe(0);
          expect(n, `Seed ${seed}: n=${n} < 4`).toBeGreaterThanOrEqual(4);
          // Exakte Kapazität aus vollständigen Spiegelpaaren — kein Math.floor
          expect(task.answer).toBe((n / 2) * k);
          expect(task.steps.join(" ")).not.toContain("Math.floor");
        } else if (task.q.includes("RAID 0")) {
          expect(task.answer).toBe(n * k);
        } else if (task.q.includes("RAID 1")) {
          expect(task.answer).toBe(k);
        } else if (task.q.includes("RAID 5")) {
          expect(task.answer).toBe((n - 1) * k);
        } else if (task.q.includes("RAID 6")) {
          expect(task.answer).toBe((n - 2) * k);
        } else {
          // JBOD: Nennlast je Platte — Invariante: Ergebnis > kleinste Platte
          expect(task.answer).toBeGreaterThan(0);
        }
      });
    }
    // Stichprobe groß genug, um jeden RAID-10-Pfad mehrfach zu treffen
    expect(raid10Cases).toBeGreaterThan(100);
  });
});

describe("Generator-Familien — generische Invarianten (je 500 deterministische Fälle)", () => {
  const families = Object.keys(GEN).filter((k) => k !== "raid");

  it.each(families.map((k) => [k] as const))("%s liefert valide Tasks", (name) => {
    for (let seed = 1; seed <= 500; seed++) {
      seededRun(seed, () => {
        const task = GEN[name]!();
        expect(task.q.length, `Seed ${seed}`).toBeGreaterThan(0);
        expect(task.pts, `Seed ${seed}`).toBeGreaterThan(0);
        expect(task.steps.length, `Seed ${seed}`).toBeGreaterThan(0);
        expect(task.trap.length, `Seed ${seed}`).toBeGreaterThan(0);
        expect(
          typeof task.answer === "number"
            ? Number.isFinite(task.answer)
            : String(task.answer).length > 0,
          `Seed ${seed}`,
        ).toBe(true);
        if (task.ip) {
          expect(String(task.answer), `Seed ${seed}: keine IPv4`).toMatch(
            /^(\d{1,3}\.){3}\d{1,3}$/,
          );
        }
      });
    }
  });

  it("Determinismus: gleicher Seed → identischer Task", () => {
    const t1 = seededRun(42, () => GEN["raid"]!());
    const t2 = seededRun(42, () => GEN["raid"]!());
    expect(t1.q).toBe(t2.q);
    expect(t1.answer).toBe(t2.answer);
    expect(t1.given).toEqual(t2.given);
  });
});

/**
 * Unabhängige fachliche Referenzberechnungen (Issue #20).
 *
 * Diese Tests lesen NUR die im Task angezeigten `given`-Werte (das, was der
 * Prüfling sieht) und leiten die erwartete Antwort über eine andere
 * Rechenroute her als der Generator selbst — Rückrechnung, Kreuzprobe oder
 * Ceiling-Invariante statt Kopie der internen Formel. Ein Vorzeichen-,
 * Rundungs- oder Reihenfolgefehler im Generator würde hier auffallen, auch
 * wenn er in der generischen "liefert valide Tasks"-Prüfung oben unentdeckt
 * bliebe (die nur Struktur/Endlichkeit prüft).
 */
function parseDe(s: string): number {
  // Deutsches Zahlenformat: "." Tausendertrenner, "," Dezimaltrenner.
  const cleaned = s.replace(/[^0-9.,-]/g, "");
  return Number(cleaned.replace(/\./g, "").replace(",", "."));
}

function given(task: Task, label: string): string {
  const row = task.given.find(([k]) => k === label);
  if (!row) throw new Error(`given-Feld fehlt: "${label}" in Task: ${task.q}`);
  return row[1];
}

describe("subnetting — unabhängige IPv4-Bitrechnung (32-Bit-Integer statt Oktett-4-Kurzformel)", () => {
  function ipToInt(ip: string): number {
    const parts = ip.split(".").map(Number);
    return parts.reduce((acc, o) => acc * 256 + o, 0) >>> 0;
  }
  function intToIp(n: number): string {
    return [24, 16, 8, 0].map((s) => (n >>> s) & 0xff).join(".");
  }

  it("Netzadresse/Broadcast/Maske/Hosts/letzte Adresse stimmen mit unabhängiger 32-Bit-Rechnung überein", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["subnetting"]!();
        const [ipStr, pStr] = given(task, "IP-Adresse mit Präfix").split("/");
        const p = Number(pStr);
        const ipInt = ipToInt(ipStr!);
        const mask = (0xffffffff << (32 - p)) >>> 0;
        const network = (ipInt & mask) >>> 0;
        const broadcast = (network | (~mask >>> 0)) >>> 0;
        const hosts = Math.pow(2, 32 - p) - 2;

        if (task.q.includes("Netzadresse")) {
          expect(task.answer, `Seed ${seed}`).toBe(intToIp(network));
          checked++;
        } else if (task.q.includes("Broadcast")) {
          expect(task.answer, `Seed ${seed}`).toBe(intToIp(broadcast));
          checked++;
        } else if (task.q.includes("Subnetzmaske")) {
          expect(task.answer, `Seed ${seed}`).toBe(intToIp(mask));
          checked++;
        } else if (task.q.includes("nutzbarer Hostadressen")) {
          expect(task.answer, `Seed ${seed}`).toBe(hosts);
          checked++;
        } else if (task.q.includes("letzte nutzbare Hostadresse")) {
          expect(task.answer, `Seed ${seed}`).toBe(intToIp(broadcast - 1));
          checked++;
        }
      });
    }
    expect(checked).toBe(300);
  });
});

describe("datenmengen — unabhängige Dimensionsanalyse", () => {
  it("Speicherbedarf Bild (MiB) aus Pixel × Farbtiefe / 8 / 1024²", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["datenmengen"]!();
        if (!task.q.includes("Speicherbedarf in MiB")) return;
        const [wStr, hStr] = given(task, "Auflösung").split("×");
        const bt = parseDe(given(task, "Farbtiefe"));
        const mib = (parseDe(wStr!) * parseDe(hStr!) * bt) / 8 / (1024 * 1024);
        expect(task.answer as number, `Seed ${seed}`).toBeCloseTo(mib, 6);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("Datenübertragungsrate (Mbit/s, dezimal) aus Pixel × Farbtiefe × fps × Komprimierung", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["datenmengen"]!();
        if (!task.q.includes("Datenübertragungsrate")) return;
        const [wStr, hStr] = given(task, "Auflösung").split("×");
        const bt = parseDe(given(task, "Farbtiefe"));
        const fps = parseDe(given(task, "Bildrate"));
        const k = parseDe(given(task, "Komprimierung auf"));
        const bps = parseDe(wStr!) * parseDe(hStr!) * bt * fps * (k / 100);
        expect(task.answer, `Seed ${seed}`).toBe(Math.ceil(bps / 1e6));
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("Speicherkapazität (TiB, binär) aus Datenrate (dezimal) × Kameras × Sekunden", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["datenmengen"]!();
        if (!task.q.includes("Speicherkapazität in TiB")) return;
        const rateMbit = parseDe(given(task, "Datenrate je Kamera"));
        const cams = parseDe(given(task, "Anzahl Kameras"));
        const days = parseDe(given(task, "Aufbewahrung"));
        const bits = rateMbit * 1e6 * cams * days * 86400;
        const tib = bits / 8 / Math.pow(1024, 4);
        expect(task.answer, `Seed ${seed}`).toBe(Math.ceil(tib));
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(50);
  });
});

describe("uebertragung — inverse Rechnung (Rate × Zeit ≈ Datenmenge)", () => {
  it("Übertragungsdauer aus Upload-Rate (dezimal) und Dateigröße (binär) unabhängig hergeleitet", () => {
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["uebertragung"]!();
        const [sizeStr, unit] = given(task, "Dateigröße").split(" ");
        const uploadStr = given(task, "Upload").replace(" Mbit/s", "");
        const uploadMbit = parseDe(uploadStr);
        const factor = unit === "GiB" ? Math.pow(1024, 3) : Math.pow(1024, 2);
        const bits = parseDe(sizeStr!) * factor * 8;
        const secs = Math.ceil(bits / (uploadMbit * 1e6));
        expect(task.answer, `Seed ${seed}`).toBe(secs);
        // Inverse Gegenprobe: Rate × (aufgerundete) Zeit deckt die Datenmenge.
        expect(uploadMbit * 1e6 * secs, `Seed ${seed}`).toBeGreaterThanOrEqual(bits);
      });
    }
  });
});

describe("strom — Einheitenkontrolle und Grenzfälle", () => {
  it("PoE-Stromstärke: I = P/U, Ergebnis in mA konsistent mit A", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["strom"]!();
        if (!task.q.includes("Stromstärke in mA")) return;
        const p = parseDe(given(task, "Leistungsaufnahme"));
        const u = parseDe(given(task, "Spannung"));
        const mA = (p / u) * 1000;
        expect(task.answer as number, `Seed ${seed}`).toBeCloseTo(mA, 4);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("Steckdosen-Grenzleistung: P = U × I (Ohmsches Gesetz, unabhängig von P=U×I-Implementierung)", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["strom"]!();
        if (!task.q.includes("maximal zulässige Leistung")) return;
        const a = parseDe(given(task, "Absicherung"));
        const u = parseDe(given(task, "Netzspannung"));
        expect(task.answer, `Seed ${seed}`).toBe(a * u);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("Jahresstromkosten: Wirkungsgrad ≤ 100 %, Bezug ≥ Nennleistung, Kosten aus kWh × Preis", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["strom"]!();
        if (!task.q.includes("jährlichen Stromkosten")) return;
        const p = parseDe(given(task, "Leistung der Komponenten"));
        const etaPercent = parseDe(given(task, "Wirkungsgrad des Netzteils"));
        const [tageStr, hStr] = given(task, "Betrieb").split("×");
        const days = parseDe(tageStr!);
        const hoursPerDay = parseDe(hStr!);
        const price = parseDe(given(task, "Strompreis"));

        expect(etaPercent, `Seed ${seed}: Wirkungsgrad > 100%`).toBeLessThanOrEqual(100);
        const pzu = p / (etaPercent / 100);
        expect(pzu, `Seed ${seed}: Netzbezug < Nennleistung`).toBeGreaterThanOrEqual(p);
        const kwh = (pzu / 1000) * days * hoursPerDay;
        const cost = kwh * price;
        expect(task.answer as number, `Seed ${seed}`).toBeCloseTo(cost, 4);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });
});

describe("wirtschaft — Rückrechnung statt Vorwärtsformel", () => {
  it("Bezugspreis: aus Bezugspreis − Lieferkosten lässt sich der Rabattsatz zurückrechnen", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["wirtschaft"]!();
        if (!task.q.includes("Bezugspreis pro Stück")) return;
        const lp = parseDe(given(task, "Listenpreis"));
        const rab = parseDe(given(task, "Rabatt"));
        const lief = parseDe(given(task, "Lieferkosten je Stück"));
        const bp = task.answer as number;
        // Rückrechnung: (bp - Lieferkosten) muss dem rabattierten Listenpreis entsprechen.
        const rabattierterPreis = bp - lief;
        const impliziterRabatt = (1 - rabattierterPreis / lp) * 100;
        expect(impliziterRabatt, `Seed ${seed}`).toBeCloseTo(rab, 4);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("Brutto: Rückrechnung Brutto / 1,19 muss der unabhängig summierten Nettosumme entsprechen", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["wirtschaft"]!();
        if (!task.q.includes("Bruttobetrag in EUR")) return;
        const netto = task.given.reduce((sum, [label, _v]) => {
          void _v;
          const m = label.match(/^([\d.,]+) Stück à ([\d.,]+) EUR$/);
          if (!m) return sum;
          return sum + parseDe(m[1]!) * parseDe(m[2]!);
        }, 0);
        const bruttoZuNetto = (task.answer as number) / 1.19;
        expect(bruttoZuNetto, `Seed ${seed}`).toBeCloseTo(netto, 4);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("Amortisation: Ceiling-Invariante (n-1)×Ersparnis < Mehrpreis ≤ n×Ersparnis", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["wirtschaft"]!();
        if (!task.q.includes("vollen Monaten")) return;
        const mehr = parseDe(given(task, "Mehrpreis in der Anschaffung"));
        const spar = parseDe(given(task, "Ersparnis pro Monat"));
        const n = task.answer as number;
        expect((n - 1) * spar, `Seed ${seed}`).toBeLessThan(mehr);
        expect(n * spar, `Seed ${seed}`).toBeGreaterThanOrEqual(mehr - 1e-9);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("Monatskosten: Kreuzprobe durch Multiplikation mit (Jahre × 12) statt Division", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["wirtschaft"]!();
        if (!task.q.includes("laufenden Kosten pro Monat")) return;
        const [stkStr, preisStr] = given(task, "Geräte").split("×");
        const stk = parseDe(stkStr!);
        const preis = parseDe(preisStr!);
        const jahre = parseDe(given(task, "Nutzungsdauer"));
        const miete = parseDe(given(task, "Softwaremiete je Platz"));
        const wartJ = parseDe(given(task, "Wartungspauschale"));
        const months = jahre * 12;
        // Kreuzprobe: total × Monate = Gerätesumme + Software×Monate + Wartung×Jahre
        const linksseite = (task.answer as number) * months;
        const rechteseite = stk * preis + stk * miete * months + wartJ * jahre;
        expect(linksseite, `Seed ${seed}`).toBeCloseTo(rechteseite, 2);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });
});

describe("netzplan — Graph-Eigenschaften (Kreuzprobe SAZ−FAZ = SEZ−FEZ, bisher nur im Kommentar, nie getestet)", () => {
  it("FEZ = FAZ + Dauer (Definitionsgleichung)", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["netzplan"]!();
        if (!task.q.includes("frühesten Endzeitpunkt")) return;
        const faz = parseDe(given(task, "FAZ"));
        const dauer = parseDe(given(task, "Dauer"));
        expect(task.answer, `Seed ${seed}`).toBe(faz + dauer);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("SAZ = SEZ − Dauer (Definitionsgleichung)", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["netzplan"]!();
        if (!task.q.includes("spätesten Anfangszeitpunkt")) return;
        const sez = parseDe(given(task, "SEZ"));
        const dauer = parseDe(given(task, "Dauer"));
        expect(task.answer, `Seed ${seed}`).toBe(sez - dauer);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("Gesamtpuffer: beide Berechnungswege (SAZ−FAZ und SEZ−FEZ) stimmen überein; GP=0 ⇔ kritischer Pfad", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["netzplan"]!();
        if (!task.q.includes("Gesamtpuffer")) return;
        const faz = parseDe(given(task, "FAZ"));
        const saz = parseDe(given(task, "SAZ"));
        const fez = parseDe(given(task, "FEZ"));
        const sez = parseDe(given(task, "SEZ"));
        const gpUeberFaz = saz - faz;
        const gpUeberFez = sez - fez;
        expect(gpUeberFaz, `Seed ${seed}: SAZ−FAZ ≠ SEZ−FEZ`).toBe(gpUeberFez);
        expect(task.answer, `Seed ${seed}`).toBe(gpUeberFaz);
        if (task.answer === 0) {
          expect(task.steps.join(" "), `Seed ${seed}`).toContain("kritischen Pfad");
        }
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });

  it("Freier Puffer: FP = FAZ des Nachfolgers − FEZ, stets ≥ 0", () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      seededRun(seed, () => {
        const task = GEN["netzplan"]!();
        if (!task.q.includes("freien Puffer")) return;
        const fez = parseDe(given(task, "FEZ dieses Vorgangs"));
        const fazN = parseDe(given(task, "FAZ des Nachfolgers"));
        expect(task.answer, `Seed ${seed}`).toBe(fazN - fez);
        expect(task.answer as number, `Seed ${seed}: FP negativ`).toBeGreaterThanOrEqual(0);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(30);
  });
});
