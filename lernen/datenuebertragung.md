# Datenübertragung und Übertragungszeit

## Das musst du verstehen

Es gibt genau eine Formel. Der ganze Aufwand steckt darin, beide Seiten in dieselbe Einheit zu bringen:
Datenmenge in **Bit**, Datenrate in **Bit pro Sekunde**.

## Das musst du auswendig wissen

- Datenraten werden **dezimal** gezählt: 1 Mbit/s = 1.000.000 bit/s
- Dateigrößen werden **binär** gezählt: 1 MiB = 1.048.576 Byte
- „Mbps" = Mbit/s, nicht MB/s
- Beim **Hochladen** zählt die **Upload**-Rate. Bei DSL/VDSL ist sie deutlich kleiner als der Download.
- Übliche Bruttoraten: USB 2.0 = 480 Mbit/s · USB 3.0 = 5 Gbit/s · Fast Ethernet = 100 Mbit/s · Gigabit Ethernet = 1 Gbit/s

## Formeln

```
t [s] = Datenmenge [bit] / Datenrate [bit/s]

Datenmenge [bit] = Größe [MiB] × 1024 × 1024 × 8
Faktor zweier Raten = schnellere Rate / langsamere Rate
```

## Typische Prüfungsaufgabe

Herr Berger sichert eine Datei von 1 GiB über seinen Anschluss. Der Speedtest zeigt:
Download 75,78 Mbit/s, Upload 50,02 Mbit/s.
Berechnen Sie die Übertragungsdauer. Runden Sie auf volle Sekunden auf und geben Sie das Ergebnis in Minuten und Sekunden an.

## Lösungsschritte

1. **Upload** ist die richtige Richtung (er lädt hoch): 50,02 Mbit/s = 50.020.000 bit/s
2. 1 GiB = 1 × 1024 × 1024 × 1024 × 8 = 8.589.934.592 bit
3. 8.589.934.592 / 50.020.000 = 171,73 s
4. Aufrunden: 172 s
5. 172 s = **2 Minuten 52 Sekunden**

*(Originalaufgabe: Frühjahr 2024, Aufgabe 4f.)*

## Häufige Fehler

- Download- statt Upload-Rate genommen (der häufigste Fehler in dieser Aufgabenfamilie)
- MiB nicht in Bit umgerechnet, sondern direkt geteilt
- 1024 statt 1.000.000 beim Umrechnen der Datenrate
- Ergebnis nicht in min : s umgewandelt, obwohl gefordert
- Bei „auf volle Sekunden aufrunden" abgerundet

## Merksatz

> **Bit durch Bit pro Sekunde. Hochladen heißt Upload.**
