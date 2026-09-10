# Datenmengen und Speicherbedarf

## Das musst du verstehen

Jede Speicheraufgabe folgt derselben Kette:
**Wie viele Bildpunkte? → wie viele Bit pro Punkt? → durch 8 = Byte → durch 1024 = KiB → MiB → GiB → TiB.**

Der einzige Grund, warum Prüflinge hier Punkte verlieren, ist die Verwechslung zweier Einheitenfamilien:

| Familie | Faktor | wofür |
|---|---|---|
| KiB, MiB, GiB, TiB (binär) | **1024** | Speicherplatz, Dateigrößen, RAM |
| kB, MB, GB, TB (dezimal) | **1000** | Datenraten, Festplattenaufdrucke, Herstellerangaben |

## Das musst du auswendig wissen

- 1 Byte = 8 bit
- 1 KiB = 1.024 Byte · 1 MiB = 1.024 KiB · 1 GiB = 1.024 MiB · 1 TiB = 1.024 GiB
- 1 Inch = 2,54 cm
- Farbtiefe „8 Bit pro Farbkanal" bei RGB bedeutet **24 Bit pro Pixel**
- Anzahl darstellbarer Farben = 2^Farbtiefe (24 Bit → 16.777.216)
- Auflösung in dpi = Bildpunkte pro Inch

## Formeln

```
Pixelanzahl   = Breite [px] × Höhe [px]
Pixel aus dpi = Länge [cm] / 2,54 × dpi
Speicher [bit]  = Pixelanzahl × Farbtiefe [bit]
Speicher [Byte] = Speicher [bit] / 8
Videodatenrate [bit/s] = Breite × Höhe × Farbtiefe × fps × Kompressionsfaktor
Speicher [bit]  = Datenrate [bit/s] × Zeit [s]
```

Kompression „auf 30 %" bedeutet **× 0,3**. Kompression „um 30 %" bedeutet **× 0,7**. Lies genau.

## Typische Prüfungsaufgabe

Eine Kamera nimmt mit 1920 × 1080 Pixeln bei 24 Bit Farbtiefe und 30 Bildern pro Sekunde auf.
Das Material wird auf 30 % komprimiert.
a) Berechnen Sie die erforderliche Datenübertragungsrate in Mbit/s. Runden Sie auf volle Mbit/s.
b) Vier Kameras nehmen 72 Stunden auf. Berechnen Sie den Speicherbedarf in TiB.

## Lösungsschritte

**a)**
1. Pixel pro Bild: 1920 × 1080 = 2.073.600
2. Bit pro Bild: 2.073.600 × 24 = 49.766.400
3. Bit pro Sekunde: 49.766.400 × 30 = 1.492.992.000
4. Kompression: × 0,3 = 447.897.600 bit/s
5. In Mbit/s (dezimal, also ÷ 1.000.000): 447,8976 → **448 Mbit/s**

**b)**
1. Sekunden: 72 × 3.600 = 259.200
2. Bit gesamt: 448.000.000 × 4 × 259.200 = 4,644864 × 10¹⁴
3. Byte: ÷ 8 = 5,80608 × 10¹³
4. TiB: ÷ 1024⁴ = 52,81 → **53 TiB**

*(Originalaufgabe: Frühjahr 2026, Aufgabe 1ad und 1b.)*

## Häufige Fehler

- Mbit/s mit MB/s verwechselt → Faktor 8 daneben
- In Schritt 5 durch 1024² statt 1.000.000 geteilt (Datenrate ist **dezimal**)
- Kompressionsfaktor vergessen oder falsch herum angewendet
- Bei „TiB" mit 1000er-Schritten gerechnet
- Rundungsvorgabe missachtet („aufrunden" ist nicht „kaufmännisch runden")
- Farbtiefe pro Kanal mit Farbtiefe pro Pixel verwechselt

## Merksatz

> **Pixel × Bit ÷ 8 = Byte. Speicher rechnet 1024, Leitung rechnet 1000.**
