/**
 * Gewichtung der Wissenskartenauswahl.
 *
 * Alte Formel `falsch / (richtig + falsch + 1)` setzte neue, noch nie
 * gesehene Karten auf Gewicht 0 — sie verschwanden damit komplett aus
 * der Auswahl. Die korrigierte Laplace-Formel
 * `(falsch + 1) / (richtig + falsch + 2)` gibt jeder Karte ein Gewicht
 * in (0, 1): neue Karten starten bei 0,5, häufig falsche nähern sich 1,
 * sicher beherrschte nähern sich 0, bleiben aber erreichbar.
 */
export function kartengewicht(falsch: number, richtig: number): number {
  return (falsch + 1) / (richtig + falsch + 2);
}

export interface KarteGewichtet {
  id: string;
  falsch: number;
  richtig: number;
}

/**
 * Zufallsauswahl nach kartengewicht. `random` ist injizierbar,
 * damit die Auswahl in Tests deterministisch ist.
 */
export function pickWeighted(
  pool: KarteGewichtet[],
  random: () => number = Math.random,
): string | null {
  if (pool.length === 0) return null;
  const weights = pool.map((c) => kartengewicht(c.falsch, c.richtig));
  const total = weights.reduce((a, w) => a + w, 0);
  let roll = random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return pool[i]!.id;
  }
  return pool[pool.length - 1]!.id;
}
