# RAID, NAS, SAN und Speichersysteme

## Das musst du verstehen

RAID erhöht **Ausfallsicherheit** oder **Geschwindigkeit** — nicht die Datensicherheit.
Ein RAID ersetzt kein Backup: Wer eine Datei löscht, hat sie auf allen Platten gleichzeitig gelöscht.

## Das musst du auswendig wissen

| Level | Verfahren | Nettokapazität | verkraftet Ausfall von | Zweck |
|---|---|---|---|---|
| RAID 0 | Striping | n × k | **keiner Platte** | Geschwindigkeit |
| RAID 1 | Mirroring | k (bei 2 Platten 50 %) | 1 Platte | Ausfallsicherheit |
| RAID 5 | Striping + verteilte Parität | (n − 1) × k | 1 Platte | guter Kompromiss |
| RAID 6 | Striping + doppelte Parität | (n − 2) × k | 2 Platten | hohe Sicherheit |
| RAID 10 | Spiegelung plus Striping | (n / 2) × k | 1 je Spiegelpaar | schnell und sicher |
| JBOD | einfache Verkettung | Summe aller Platten | keiner | maximale Kapazität |

`n` = Anzahl Platten · `k` = Kapazität der **kleinsten** Platte

**JBOD gegenüber RAID 0:** kein RAID-Controller nötig · Platten dürfen unterschiedlich groß sein ·
volle Kapazität nutzbar · leicht erweiterbar · beim Ausfall einer Platte sind nicht zwingend alle Daten verloren

**NAS vs. SAN**
- NAS: dateibasiert, hängt am normalen LAN, einfach, für Abteilungen und kleine Umgebungen
- SAN: blockbasiert, eigenes Speichernetz, hohe Performance und Skalierbarkeit, zentrale Verwaltung,
  unterbrechungsfreie Erweiterung, für Rechenzentren

## Typische Prüfungsaufgabe

Verfügbar sind 2 Festplatten à 3 TB und 7 Festplatten à 2 TB.
Mit **allen** Platten soll eine fehlertolerante RAID-5-Konfiguration mit größtmöglicher
Nettospeicherkapazität erstellt werden. Berechnen Sie die maximale Nettospeicherkapazität in TB.

## Lösungsschritte

1. Insgesamt n = 2 + 7 = **9 Platten**
2. Bei RAID zählt die **kleinste** gemeinsame Kapazität: k = **2 TB**
   (von den 3-TB-Platten bleiben je 1 TB ungenutzt)
3. RAID 5: (9 − 1) × 2 TB = **16 TB**

Zum Vergleich als JBOD: 2 × 3 TB + 7 × 2 TB = **20 TB**, aber ohne jede Ausfallsicherheit.

*(Originalaufgabe: Herbst 2022, Aufgabe 2ca und 2cb.)*

## Häufige Fehler

- Mit der größten statt der **kleinsten** Platte gerechnet
- Bei RAID 5 „n × k − 1" statt „(n − 1) × k" gerechnet
- RAID 1 als „doppelte Kapazität" beschrieben statt als Halbierung
- Behauptet, RAID ersetze ein Backup
- TB und TiB vermischt: In RAID-Aufgaben stehen meist **TB** (dezimal)

## Merksatz

> **RAID 5 opfert eine Platte, RAID 6 zwei. Immer mit der kleinsten rechnen. RAID ist kein Backup.**
