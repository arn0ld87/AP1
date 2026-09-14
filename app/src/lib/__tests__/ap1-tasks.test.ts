import { describe, expect, it } from "vitest";

import {
  evaluateTaskAnswer,
  parseGermanNumber,
  type DiagramTask,
  type MultiFieldTask,
  type ScalarTask,
  type TableTask,
  type TextTask,
} from "../ap1-tasks";

const scalarBase = {
  topic: "test",
  pts: 1,
  lead: "Testlead",
  q: "Testfrage",
  given: [],
  steps: [],
  trap: "",
};

describe("parseGermanNumber", () => {
  it("liest Tausenderpunkte im deutschen Format (Regression P1-1: 1.685 = 1685)", () => {
    expect(parseGermanNumber("1.685")).toBe(1685);
    expect(parseGermanNumber("1.685.000")).toBe(1685000);
    expect(parseGermanNumber("10.000")).toBe(10000);
    expect(parseGermanNumber("255")).toBe(255);
  });

  it("behandelt das Komma als Dezimaltrenner", () => {
    expect(parseGermanNumber("0,5")).toBe(0.5);
    expect(parseGermanNumber("1,68")).toBe(1.68);
    expect(parseGermanNumber("19,00")).toBe(19);
  });

  it("kombiniert Tausenderpunkte mit Dezimalkomma", () => {
    expect(parseGermanNumber("1.685,5")).toBe(1685.5);
    expect(parseGermanNumber("2.048,25")).toBe(2048.25);
  });

  it("lässt Punkte ohne 3er-Gruppenstruktur Dezimalpunkte", () => {
    expect(parseGermanNumber("1.68")).toBe(1.68);
    expect(parseGermanNumber("0.125")).toBe(0.125);
    expect(parseGermanNumber(".685")).toBe(0.685);
  });

  it("ignoriert Leerzeichen", () => {
    expect(parseGermanNumber(" 1.685 ")).toBe(1685);
    expect(parseGermanNumber("1 685")).toBe(1685);
  });
});

describe("parseGermanNumber – weitere Grenzfälle", () => {
  it("behandelt '12.34' als Dezimalpunkt, nicht als Tausendertrenner (dokumentiertes Verhalten)", () => {
    // Nach dem Punkt stehen nur 2 Stellen, das Tausenderpunkt-Muster (\.\d{3})+ verlangt
    // aber genau 3-er Gruppen. "12.34" fällt damit durch die Sonderregel und bleibt,
    // wie es dasteht, ein Dezimalpunkt – Ergebnis ist 12.34, NICHT 1234.
    expect(parseGermanNumber("12.34")).toBe(12.34);
  });

  it("liefert bei leerem bzw. reinem Leerzeichen-String 0 statt NaN (Number('') ist 0 in JS)", () => {
    expect(parseGermanNumber("")).toBe(0);
    expect(parseGermanNumber("   ")).toBe(0);
  });

  it("liefert NaN bei Müll-Eingaben", () => {
    expect(parseGermanNumber("abc")).toBeNaN();
    expect(parseGermanNumber("zwölf")).toBeNaN();
    expect(parseGermanNumber("1.685x")).toBeNaN();
  });
});

describe("evaluateTaskAnswer (Regression P1-1)", () => {
  it("bewertet die angezeigte Musterlösung (de-DE formatiert) als korrekt", () => {
    const task: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: 1685,
      unit: "EUR",
    };
    // formatExpected zeigt 1685 per toLocaleString("de-DE") als "1.685" an —
    // wer diese Anzeige abtippt, muss als korrekt bewertet werden.
    const angezeigt = (1685).toLocaleString("de-DE");
    expect(angezeigt).toBe("1.685");
    expect(evaluateTaskAnswer(task, angezeigt).correct).toBe(true);
  });

  it("bewertet lokale Eingabe mit Tausenderpunkt und Dezimalkomma als korrekt", () => {
    const task: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: 2048.25,
      unit: "KiB",
      dec: 2,
    };
    expect(evaluateTaskAnswer(task, "2.048,25").correct).toBe(true);
  });
});

describe("Musterlösung als angezeigter Text (Regression P1-1, weitere Fälle >= 1000)", () => {
  it("multiField: das expected-Feld ist exakt die de-DE-Formatierung, auch bei Werten >= 1000", () => {
    const task: MultiFieldTask = {
      ...scalarBase,
      kind: "multiField",
      fields: [
        { id: "brutto", label: "Bruttolohn", answer: 12345.6, unit: "EUR", dec: 1 },
        { id: "stueckzahl", label: "Stückzahl", answer: 3200, unit: "Stk" },
      ],
    };
    const angezeigtBrutto = (12345.6).toLocaleString("de-DE", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    const angezeigtStueck = (3200).toLocaleString("de-DE");
    expect(angezeigtBrutto).toBe("12.345,6");
    expect(angezeigtStueck).toBe("3.200");

    const result = evaluateTaskAnswer(task, {
      brutto: angezeigtBrutto,
      stueckzahl: angezeigtStueck,
    });
    expect(result.fields["brutto"]).toMatchObject({ correct: true, expected: "12.345,6" });
    expect(result.fields["stueckzahl"]).toMatchObject({ correct: true, expected: "3.200" });
    expect(result.correct).toBe(true);
  });

  it("table: das expected-Feld einer Zelle >= 1000 stimmt mit der abgetippten Anzeige überein", () => {
    const task: TableTask = {
      ...scalarBase,
      kind: "table",
      columns: [{ id: "wert", label: "Wert" }],
      rows: [
        {
          id: "gesamt",
          label: "Gesamt",
          cells: [{ id: "gesamt.wert", editable: true, answer: 15000, dec: 0 }],
        },
      ],
    };
    const result = evaluateTaskAnswer(task, { "gesamt.wert": "15.000" });
    expect(result.fields["gesamt.wert"]).toMatchObject({ correct: true, expected: "15.000" });
  });
});

describe("Rundungstoleranz über dec", () => {
  it("ist bei dec=0 richtig, bei dec=2 aber falsch (grobe vs. feine Toleranz)", () => {
    const strict: ScalarTask = { ...scalarBase, kind: "scalar", answer: 1.2, unit: "", dec: 2 };
    const loose: ScalarTask = { ...strict, dec: 0 };
    expect(evaluateTaskAnswer(loose, "1,15").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(strict, "1,15").fields["answer"]?.correct).toBe(false);
  });

  it("ist bei dec=2 richtig, bei dec=0 aber falsch (Eingabe kreuzt die x,5-Rundungsschwelle)", () => {
    const strict: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: 2.4999,
      unit: "",
      dec: 2,
    };
    const loose: ScalarTask = { ...strict, dec: 0 };
    expect(evaluateTaskAnswer(strict, "2,5001").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(loose, "2,5001").fields["answer"]?.correct).toBe(false);
  });

  it("bewertet Eingaben direkt an der x,5-Rundungsschwelle bei dec=0 korrekt", () => {
    const task: ScalarTask = { ...scalarBase, kind: "scalar", answer: 1.5, unit: "", dec: 0 };
    expect(evaluateTaskAnswer(task, "1,49").fields["answer"]?.correct).toBe(false);
    expect(evaluateTaskAnswer(task, "1,50").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(task, "1,51").fields["answer"]?.correct).toBe(true);
  });
});

describe("IP-Vergleich (ip: true)", () => {
  it("ignoriert Leerzeichen um Punkte und Slash bei IP-Antworten", () => {
    const task: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: "192.168.1.0/24",
      unit: "",
      ip: true,
    };
    expect(evaluateTaskAnswer(task, "192.168.1.0/24").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(task, "192.168.1.0 /24").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(task, "192.168.1.0/ 24").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(task, "192 . 168 . 1 . 0 / 24").fields["answer"]?.correct).toBe(true);
  });

  it("erkennt eine andere Schreibweise (führende Nullen) NICHT als gleichwertig – reiner Textvergleich", () => {
    const task: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: "192.168.1.1",
      unit: "",
      ip: true,
    };
    // ip:true normalisiert nur Whitespace, keine semantische IP-Äquivalenz.
    expect(evaluateTaskAnswer(task, "192.168.001.001").fields["answer"]?.correct).toBe(false);
  });

  it("bewertet eine tatsächlich abweichende IP als falsch", () => {
    const task: ScalarTask = {
      ...scalarBase,
      kind: "scalar",
      answer: "192.168.1.1",
      unit: "",
      ip: true,
    };
    expect(evaluateTaskAnswer(task, "192.168.1.2").fields["answer"]?.correct).toBe(false);
  });
});

describe("acceptedAnswers", () => {
  it("akzeptiert eine hinterlegte Alternativantwort", () => {
    const task: TextTask = {
      ...scalarBase,
      kind: "text",
      answer: "Broadcast-Adresse",
      acceptedAnswers: ["Broadcastadresse", "letzte Adresse im Subnetz"],
    };
    expect(evaluateTaskAnswer(task, "Broadcastadresse").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(task, "letzte Adresse im Subnetz").fields["answer"]?.correct).toBe(
      true,
    );
    expect(evaluateTaskAnswer(task, "Netzadresse").fields["answer"]?.correct).toBe(false);
  });

  it("ignoriert Groß-/Kleinschreibung ohne caseSensitive", () => {
    const task: TextTask = { ...scalarBase, kind: "text", answer: "Vollduplex" };
    expect(evaluateTaskAnswer(task, "VOLLDUPLEX").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(task, "vollduplex").fields["answer"]?.correct).toBe(true);
  });

  it("verlangt exakte Groß-/Kleinschreibung mit caseSensitive: true", () => {
    const task: TextTask = {
      ...scalarBase,
      kind: "text",
      answer: "Vollduplex",
      caseSensitive: true,
    };
    expect(evaluateTaskAnswer(task, "Vollduplex").fields["answer"]?.correct).toBe(true);
    expect(evaluateTaskAnswer(task, "VOLLDUPLEX").fields["answer"]?.correct).toBe(false);
    expect(evaluateTaskAnswer(task, "vollduplex").fields["answer"]?.correct).toBe(false);
  });
});

describe("evaluateTaskAnswer je Task-Art", () => {
  it("scalar: fehlendes Feld und leere Submission werden als falsch bewertet", () => {
    const task: ScalarTask = { ...scalarBase, kind: "scalar", answer: 42, unit: "EUR" };
    expect(evaluateTaskAnswer(task, {}).correct).toBe(false);
    expect(evaluateTaskAnswer(task, "").correct).toBe(false);
    expect(evaluateTaskAnswer(task, "   ").correct).toBe(false);
  });

  it("text: fehlendes Feld und leere Submission werden als falsch bewertet", () => {
    const task: TextTask = { ...scalarBase, kind: "text", answer: "Kollisionsdomäne" };
    expect(evaluateTaskAnswer(task, {}).correct).toBe(false);
    expect(evaluateTaskAnswer(task, "").correct).toBe(false);
  });

  it("multiField: fehlendes Feld und teilweise richtige Antworten ergeben insgesamt correct=false", () => {
    const task: MultiFieldTask = {
      ...scalarBase,
      kind: "multiField",
      fields: [
        { id: "netz", label: "Netzadresse", answer: 192, unit: "" },
        { id: "broadcast", label: "Broadcast", answer: 255, unit: "" },
      ],
    };
    // broadcast fehlt komplett in der Submission
    const missing = evaluateTaskAnswer(task, { netz: "192" });
    expect(missing.fields["netz"]?.correct).toBe(true);
    expect(missing.fields["broadcast"]?.correct).toBe(false);
    expect(missing.correct).toBe(false);

    const partial = evaluateTaskAnswer(task, { netz: "192", broadcast: "254" });
    expect(partial.fields["netz"]?.correct).toBe(true);
    expect(partial.fields["broadcast"]?.correct).toBe(false);
    expect(partial.correct).toBe(false);

    expect(evaluateTaskAnswer(task, {}).correct).toBe(false);
  });

  it("table: teilweise richtige Zellen ergeben insgesamt correct=false, nicht editierbare Zellen zählen nicht mit", () => {
    const task: TableTask = {
      ...scalarBase,
      kind: "table",
      columns: [{ id: "wert", label: "Wert" }],
      rows: [
        { id: "a", label: "A", cells: [{ id: "a.wert", editable: true, answer: 10 }] },
        { id: "b", label: "B", cells: [{ id: "b.wert", editable: true, answer: 20 }] },
        {
          id: "c",
          label: "C (Vorgabe, nicht editierbar)",
          cells: [{ id: "c.wert", editable: false, value: 5 }],
        },
        {
          // Isoliert die editable-Bedingung: Diese Zelle hat sehr wohl ein
          // answer-Feld und wird trotzdem übersprungen, WEIL sie nicht
          // editierbar ist. Ohne sie würde ein Wegfall der editable-Prüfung
          // nicht auffallen — bei Zeile c greift ja schon "kein answer".
          id: "d",
          label: "D (Vorgabe mit hinterlegter Lösung)",
          cells: [{ id: "d.wert", editable: false, answer: 42 }],
        },
      ],
    };
    const result = evaluateTaskAnswer(task, { "a.wert": "10", "b.wert": "19" });
    expect(result.fields["a.wert"]?.correct).toBe(true);
    expect(result.fields["b.wert"]?.correct).toBe(false);
    expect(result.fields["c.wert"]).toBeUndefined();
    expect(result.fields["d.wert"]).toBeUndefined();
    expect(result.correct).toBe(false);

    // Gegenprobe: Sind die editierbaren Zellen alle richtig, ist das Ergebnis
    // richtig — die nicht editierbare Zelle d mit answer=42 darf es nicht
    // kippen, obwohl zu ihr nie etwas eingegeben wurde.
    const alleRichtig = evaluateTaskAnswer(task, { "a.wert": "10", "b.wert": "20" });
    expect(alleRichtig.correct).toBe(true);

    expect(evaluateTaskAnswer(task, {}).correct).toBe(false);
  });

  it("diagram (response.kind: scalar): fehlende/leere Submission falsch, korrekte Eingabe richtig", () => {
    const task: DiagramTask = {
      ...scalarBase,
      kind: "diagram",
      visual: { type: "illustration", data: { kind: "subnetting" }, alt: "Subnetz-Skizze" },
      response: { kind: "scalar", answer: 30, dec: 0 },
    };
    expect(evaluateTaskAnswer(task, "").correct).toBe(false);
    expect(evaluateTaskAnswer(task, {}).correct).toBe(false);
    expect(evaluateTaskAnswer(task, "30").correct).toBe(true);
  });

  it("diagram (response.kind: text): akzeptiert Alternativantworten wie ein Text-Task", () => {
    const task: DiagramTask = {
      ...scalarBase,
      kind: "diagram",
      visual: { type: "illustration", data: { kind: "osi" }, alt: "OSI-Schema" },
      response: {
        kind: "text",
        answer: "Sicherungsschicht",
        acceptedAnswers: ["Data Link Layer"],
      },
    };
    expect(evaluateTaskAnswer(task, "").correct).toBe(false);
    expect(evaluateTaskAnswer(task, "Data Link Layer").correct).toBe(true);
    expect(evaluateTaskAnswer(task, "Transportschicht").correct).toBe(false);
  });

  it("diagram (response.kind: multiField): teilweise richtig ergibt insgesamt correct=false", () => {
    const task: DiagramTask = {
      ...scalarBase,
      kind: "diagram",
      visual: { type: "illustration", data: { kind: "raid" }, alt: "RAID-Schema" },
      response: {
        kind: "multiField",
        fields: [
          { id: "kapazitaet", label: "Kapazität", answer: 2, unit: "TB" },
          { id: "redundanz", label: "Redundanz", answer: 1, unit: "Platte" },
        ],
      },
    };
    const result = evaluateTaskAnswer(task, { kapazitaet: "2", redundanz: "0" });
    expect(result.fields["kapazitaet"]?.correct).toBe(true);
    expect(result.fields["redundanz"]?.correct).toBe(false);
    expect(result.correct).toBe(false);
    expect(evaluateTaskAnswer(task, {}).correct).toBe(false);
  });
});
