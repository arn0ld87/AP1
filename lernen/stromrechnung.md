# Strom, Leistung und Energiekosten

## Das musst du verstehen

Vier Formeln decken jede Aufgabe dieser Familie ab. Die einzige echte Hürde ist der **Wirkungsgrad**:
Ein Netzteil zieht mehr aus der Steckdose, als der Rechner verbraucht. Der Rest geht als Wärme verloren.
Deshalb wird beim Weg „vom Verbrauch zur Steckdose" **geteilt**, nicht multipliziert.

## Das musst du auswendig wissen

- Haushalts-/Bürosteckdose: 230 V
- Übliche Absicherung einer Mehrfachsteckdose: 16 A → maximal **3.680 W**
- 80 PLUS: Bronze ≈ 82 %, Gold ≈ 87–90 %, Platinum ≈ 92 %, Titanium ≈ 94 %
- PoE-Klassen: 802.3af = 15,4 W · 802.3at (PoE+) = 30 W · 802.3bt Type 3 = 60 W · Type 4 = 90 W
- 1 kWh = 1.000 W über eine Stunde

## Formeln

```
P [W]      = U [V] × I [A]          →  I = P / U          →  U = P / I
P_zu [W]   = P_ab [W] / η           (η als Dezimalzahl, z. B. 0,88)
E [kWh]    = P [kW] × t [h]
Kosten [€] = E [kWh] × Strompreis [€/kWh]
Amortisation [Perioden] = Mehrpreis / Ersparnis je Periode
```

## Typische Prüfungsaufgabe

**a)** PC-A hat ein Netzteil ohne Zertifikat (Wirkungsgrad 43 %), PC-B eines nach 80 PLUS Gold (76 %).
Beide Rechner benötigen im Betrieb 60 W. Betrieb: 9 Stunden an 20 Arbeitstagen pro Monat, 30 Cent/kWh.
Berechnen Sie die aus dem Netz bezogene Leistung und die Energiekosten pro Monat.

**b)** PC-B kostet 100 EUR mehr. Nach wie vielen Monaten hat sich die Anschaffung amortisiert?

## Lösungsschritte

**a)**
1. Betriebsstunden: 20 × 9 = **180 h/Monat**
2. PC-A: 60 W / 0,43 = **139,53 W**
3. PC-A: 0,13953 kW × 180 h × 0,30 €/kWh = **7,53 €**
4. PC-B: 60 W / 0,76 = **78,94 W**
5. PC-B: 0,07894 kW × 180 h × 0,30 €/kWh = **4,26 €**

**b)**
6. Ersparnis: 7,53 − 4,26 = **3,27 €/Monat**
7. 100 € / 3,27 €/Monat = 30,58 → **nach 31 Monaten**

*(Originalaufgabe: Herbst 2021, Aufgabe 2a und 2b.)*

## Zweite Variante: Nachweis über die Steckdosenlast

Drei PCs à 180 W, ein Drucker 400 W, eine Kaffeemaschine 1.200 W, ein Klimagerät 2.000 W an einer
Mehrfachsteckdose „maximal 16 A".

- zulässig: 16 A × 230 V = **3.680 W**
- angeschlossen: 3 × 180 + 400 + 1.200 + 2.000 = **4.140 W**
- 4.140 W > 3.680 W → **nicht gleichzeitig betreibbar**

*(Originalaufgabe: Herbst 2021, Aufgabe 2d.)*

## Dritte Variante: mit Auslastung

Ein PC läuft an 200 Arbeitstagen je 9 Stunden. Das 750-W-Netzteil hat 90 % Wirkungsgrad
und ist im Schnitt zu 50 % ausgelastet. Strompreis 0,40 €/kWh.

200 × 9 h × (0,750 kW / 0,9) × 0,5 × 0,40 €/kWh = **300,00 €**

*(Originalaufgabe: Frühjahr 2024, Aufgabe 3f.)*

## Häufige Fehler

- Watt nicht in Kilowatt umgerechnet → Ergebnis um Faktor 1.000 daneben
- Wirkungsgrad multipliziert statt dividiert
- Auslastung vergessen
- Cent und Euro vermischt (30 Cent/kWh = 0,30 €/kWh)
- Bei der Amortisation abgerundet statt aufgerundet

## Merksatz

> **Netzteil rein = Verbrauch geteilt durch Wirkungsgrad. kW mal Stunden mal Preis.**
