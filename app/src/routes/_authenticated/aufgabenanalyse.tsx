import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AUFGABEN,
  berechneKennzahlen,
  filterAufgaben,
  pruefungstermine,
  themen,
} from "@/lib/aufgabenanalyse";

export const Route = createFileRoute("/_authenticated/aufgabenanalyse")({
  head: () => ({
    meta: [
      { title: "Aufgabenanalyse – AP1 Trainer" },
      {
        name: "description",
        content:
          "Filterbare Tabelle aller Altprüfungs-Teilaufgaben: Thema, Typ, Punkte, Formel und typische Fehlerfallen.",
      },
      { property: "og:title", content: "Aufgabenanalyse – AP1 Trainer" },
    ],
  }),
  component: AufgabenanalysePage,
});

const SELECT_CLASS =
  "flex h-9 w-full min-w-[10rem] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function AufgabenanalysePage() {
  const [thema, setThema] = useState("");
  const [pruefungstermin, setPruefungstermin] = useState("");
  const [nurRechenaufgaben, setNurRechenaufgaben] = useState(false);
  const [suche, setSuche] = useState("");

  const alleThemen = useMemo(() => themen(AUFGABEN), []);
  const alleTermine = useMemo(() => pruefungstermine(AUFGABEN), []);
  const kennzahlen = useMemo(() => berechneKennzahlen(AUFGABEN), []);

  const ergebnisse = useMemo(
    () =>
      filterAufgaben(AUFGABEN, {
        thema: thema || undefined,
        pruefungstermin: pruefungstermin || undefined,
        nurRechenaufgaben: nurRechenaufgaben || undefined,
        suche: suche || undefined,
      }),
    [thema, pruefungstermin, nurRechenaufgaben, suche],
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Aufgabenanalyse</h1>
        <p className="text-sm text-muted-foreground">
          Alle {AUFGABEN.length} Teilaufgaben aus den ausgewerteten Altprüfungen — nach Thema,
          Prüfungstermin und Typ filterbar.
        </p>
      </header>

      <KennzahlenLeiste
        anzahl={kennzahlen.anzahl}
        anteilRechenaufgaben={kennzahlen.anteilRechenaufgaben}
        topThemenNachHaeufigkeit={kennzahlen.topThemenNachHaeufigkeit}
        topThemenNachPunktsumme={kennzahlen.topThemenNachPunktsumme}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <select
          value={thema}
          onChange={(e) => setThema(e.target.value)}
          className={SELECT_CLASS}
          aria-label="Nach Thema filtern"
        >
          <option value="">Alle Themen</option>
          {alleThemen.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={pruefungstermin}
          onChange={(e) => setPruefungstermin(e.target.value)}
          className={SELECT_CLASS}
          aria-label="Nach Prüfungstermin filtern"
        >
          <option value="">Alle Prüfungstermine</option>
          {alleTermine.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={nurRechenaufgaben}
            onChange={(e) => setNurRechenaufgaben(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          Nur Rechenaufgaben
        </label>

        <div className="relative min-w-[14rem] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Suchen in Thema, Unterthema, Formel, Fehlerfalle…"
            className="pl-9"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {ergebnisse.length} von {AUFGABEN.length} Teilaufgaben
      </p>

      <Ergebnisliste ergebnisse={ergebnisse} />
    </div>
  );
}

function KennzahlenLeiste({
  anzahl,
  anteilRechenaufgaben,
  topThemenNachHaeufigkeit,
  topThemenNachPunktsumme,
}: {
  anzahl: number;
  anteilRechenaufgaben: number;
  topThemenNachHaeufigkeit: { thema: string; anzahl: number }[];
  topThemenNachPunktsumme: { thema: string; punkte: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KennzahlKarte label="Aufgaben insgesamt" wert={anzahl.toString()} />
      <KennzahlKarte
        label="Anteil Rechenaufgaben"
        wert={`${Math.round(anteilRechenaufgaben * 100)}%`}
      />
      <TopThemenKarte
        label="Top 5 nach Häufigkeit"
        items={topThemenNachHaeufigkeit.map((t) => ({ thema: t.thema, wert: `${t.anzahl}×` }))}
      />
      <TopThemenKarte
        label="Top 5 nach Punktsumme"
        items={topThemenNachPunktsumme.map((t) => ({ thema: t.thema, wert: `${t.punkte} Pkt.` }))}
      />
    </div>
  );
}

function KennzahlKarte({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{wert}</p>
    </div>
  );
}

function TopThemenKarte({
  label,
  items,
}: {
  label: string;
  items: { thema: string; wert: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <ol className="mt-1 space-y-0.5">
        {items.map((item, i) => (
          <li
            key={item.thema}
            className="flex items-center justify-between gap-2 text-xs text-card-foreground"
          >
            <span className="truncate">
              {i + 1}. {item.thema}
            </span>
            <span className="shrink-0 font-mono text-muted-foreground">{item.wert}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Ergebnisliste({ ergebnisse }: { ergebnisse: ReturnType<typeof filterAufgaben> }) {
  if (ergebnisse.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Keine Aufgabe gefunden.
      </p>
    );
  }

  return (
    <>
      {/* Karten: mobil, unter md */}
      <div className="space-y-3 md:hidden">
        {ergebnisse.map((a, i) => (
          <div
            key={`${a.pruefungstermin}-${a.aufgabe_nr}-${a.teilaufgabe}-${i}`}
            className="space-y-2 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {a.pruefungstermin} · Aufgabe {a.aufgabe_nr}
                {a.teilaufgabe}
              </span>
              {a.punkte !== null && (
                <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {a.punkte} Pkt.
                </span>
              )}
            </div>
            <p className="text-sm text-card-foreground">
              {a.thema} <span className="text-muted-foreground">›</span> {a.unterthema}
            </p>
            <p className="text-xs text-muted-foreground">
              {a.aufgabentyp}
              {a.verwendete_formel && a.verwendete_formel !== "Nicht relevant" && (
                <> · {a.verwendete_formel}</>
              )}
            </p>
            {a.typische_fehlerfalle && (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-400">
                <span className="font-semibold">Typische Fehlerfalle: </span>
                {a.typische_fehlerfalle}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Tabelle: ab md */}
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/40">
            <tr>
              {[
                "Termin",
                "Aufgabe",
                "Thema › Unterthema",
                "Typ",
                "Punkte",
                "Formel",
                "Typische Fehlerfalle",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ergebnisse.map((a, i) => (
              <tr
                key={`${a.pruefungstermin}-${a.aufgabe_nr}-${a.teilaufgabe}-${i}`}
                className={cn(
                  "border-b border-border/60 last:border-0",
                  i % 2 === 1 && "bg-muted/15",
                )}
              >
                <td className="whitespace-nowrap px-3 py-2 align-top text-card-foreground">
                  {a.pruefungstermin}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top text-card-foreground">
                  {a.aufgabe_nr}
                  {a.teilaufgabe}
                </td>
                <td className="px-3 py-2 align-top text-card-foreground">
                  {a.thema} <span className="text-muted-foreground">›</span> {a.unterthema}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top text-card-foreground">
                  {a.aufgabentyp}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top text-card-foreground">
                  {a.punkte ?? "–"}
                </td>
                <td className="px-3 py-2 align-top text-card-foreground">{a.verwendete_formel}</td>
                <td className="px-3 py-2 align-top text-amber-400">{a.typische_fehlerfalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
