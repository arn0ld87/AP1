# Lösungshinweise Probeprüfung 02

**Bewertungsschlüssel:** 100–92 = 1 · unter 92–81 = 2 · unter 81–67 = 3 · **unter 67–50 = 4** · unter 50–30 = 5 · unter 30–0 = 6

---

## 1. Aufgabe (26 Punkte)

**a) 3 Punkte** (je Anbieter 1 Punkt)
```
TecPoint GmbH : 1.250,00 × 0,97 = 1.212,50 + 18,00 = 1.230,50 EUR
ByteDirekt AG : 1.190,00 ×  1   = 1.190,00 + 12,00 = 1.202,00 EUR
NordCom KG    : 1.320,00 × 0,95 = 1.254,00 +  0,00 = 1.254,00 EUR
```

**b) 10 Punkte** (Bewertung 4 P, Rechnung 4 P, Summen und Entscheidung 2 P)

| Kriterium | Gew. | TecPoint | | ByteDirekt | | NordCom | |
|---|---:|---:|---:|---:|---:|---:|---:|
| | | Pkt | ×Gew | Pkt | ×Gew | Pkt | ×Gew |
| Bezugspreis | 10 | 2 | 20 | 3 | 30 | 1 | 10 |
| Lieferzeit | 6 | 1 | 6 | 3 | 18 | 2 | 12 |
| Qualität | 8 | 2 | 16 | 1 | 8 | 3 | 24 |
| Service / Erfahrung | 4 | 1 | 4 | 2 | 8 | 3 | 12 |
| **Summe** | | | **46** | | **64** | | **58** |

**Entscheidung: ByteDirekt AG** mit dem höchsten Nutzwert von 64 Punkten.
Ausschlaggebend sind der günstigste Bezugspreis und die kürzeste Lieferzeit,
die zusammen die schwächere Qualitätsbewertung überkompensieren.

*(Abweichende Punktvergaben sind zu akzeptieren, wenn sie in sich schlüssig sind und die
Rangfolge nachvollziehbar aus den Angebotsdaten abgeleitet wurde.)*

**c) 7 Punkte**
```
Notebooks:   24 × 1.202,00 EUR = 28.848,00 EUR / 48 Monate =   601,00 EUR/Monat  (2 P)
Docking:     24 ×   180,00 EUR =  4.320,00 EUR / 36 Monate =   120,00 EUR/Monat  (2 P)
Software:    24 ×    22,00 EUR                             =   528,00 EUR/Monat  (1 P)
Wartung:      2.880,00 EUR / 12 Monate                     =   240,00 EUR/Monat  (1 P)
------------------------------------------------------------------------------
Laufende Kosten pro Monat                                  = 1.489,00 EUR        (1 P)
```

**d) 2 Punkte**
Der Kaufvertrag ist mit der **Lieferung am 3. Juni** zustande gekommen (1 P).
Die Bestellung war der Antrag (erste Willenserklärung). Da keine Auftragsbestätigung erfolgte,
gilt die Lieferung als Annahme durch schlüssiges Handeln (zweite Willenserklärung) — zwei
übereinstimmende Willenserklärungen (1 P).

**e) 4 Punkte** (je Störung 1 P, je Maßnahme 1 P)
- **Lieferverzug** → Liefertermin vertraglich fixieren, Vertragsstrafe vereinbaren, Lieferanten sorgfältig auswählen, frühzeitig mahnen
- **Mangelhafte Lieferung** → Ware unverzüglich prüfen, Qualitätsanforderungen im Vertrag festhalten, Referenzen einholen
- weitere zulässig: Annahmeverzug, Zahlungsverzug, Nichtlieferung

---

## 2. Aufgabe (24 Punkte)

**a) 4 Punkte**
```
Anzahl Platten n = 3 + 5 = 8                                     (1 P)
Maßgeblich ist die kleinste Plattenkapazität: k = 4 TB           (2 P)
RAID 5: (8 − 1) × 4 TB = 28 TB                                   (1 P)
```
Von den 6-TB-Platten bleiben je 2 TB ungenutzt.

**b) 4 Punkte**
```
RAID 6: (8 − 2) × 4 TB = 24 TB                                   (2 P)
JBOD:   3 × 6 TB + 5 × 4 TB = 18 TB + 20 TB = 38 TB              (2 P)
```

**c) 6 Punkte** (je Level 2 Punkte)
- **RAID 1 — Mirroring:** Die Daten werden vollständig auf eine zweite Platte gespiegelt.
  Nutzbar ist die Kapazität einer Platte. Es darf **eine** Platte ausfallen.
- **RAID 5 — Striping mit verteilter Parität:** Die Daten werden in Blöcke zerlegt und zusammen mit
  Paritätsinformationen über alle Platten verteilt. Nutzbar sind (n − 1) Platten.
  Es darf **eine** Platte ausfallen.
- **RAID 10 — Spiegelung plus Striping:** Jeweils zwei Platten werden gespiegelt, die Spiegelpaare
  zusätzlich gestriped. Nutzbar ist die Hälfte der Kapazität. Es darf **je Spiegelpaar eine** Platte ausfallen.

**d) 2 Punkte**
Die Aussage ist falsch. RAID schützt vor dem **Ausfall von Hardware**, nicht vor Datenverlust durch
versehentliches Löschen, fehlerhafte Änderungen, Schadsoftware oder Diebstahl — solche Vorgänge werden
sofort auf alle Platten übernommen. RAID erhöht die Verfügbarkeit, ein Backup bleibt zwingend nötig.

**e) 3 Punkte** (je 1 Punkt)
deutlich kürzere Zugriffszeiten und höhere Datenrate · keine beweglichen Teile, dadurch
unempfindlicher gegen Erschütterungen · geringerer Energieverbrauch · geräuschlos ·
geringeres Gewicht und kompaktere Bauform

**f) 5 Punkte**
```
Prozessor       1 × 125 W = 125 W
Grafikkarte     1 × 220 W = 220 W
Mainboard/RAM   1 ×  60 W =  60 W
SSD             2 ×   8 W =  16 W
Gehäuselüfter   3 ×   4 W =  12 W
------------------------------------
Summe                     = 433 W                                (2 P)
Puffer 15 %:  433 W × 1,15 = 497,95 W                            (2 P)
Nächste verfügbare Stufe: 500-W-Netzteil                         (1 P)
```

---

## 3. Aufgabe (25 Punkte)

**a) 6 Punkte** (je 1 Punkt)
- Subnetzmaske: **255.255.255.224**
- Netzadresse: **10.42.16.192**
- Broadcast-Adresse: **10.42.16.223**
- erste nutzbare Hostadresse: **10.42.16.193**
- letzte nutzbare Hostadresse: **10.42.16.222**
- Anzahl nutzbarer Adressen: **30** (2⁵ − 2)

Blockgröße 256 − 224 = 32, die .200 liegt im Block 192–223.

**b) 2 Punkte**
**8 Subnetze.** Von /24 auf /27 werden 3 Bits geliehen: 2³ = 8.

**ca) 1 Punkt** — **128 Bit**

**cb) 2 Punkte**
`2001:0db8:4f1a:0027:0000:0000:0000:08a2`

**cc) 2 Punkte**
Präfixlänge **/64** (1 P) · Interface-Identifier **0000:0000:0000:08a2** bzw. verkürzt `::8a2` (1 P)

**d) 2 Punkte**
Es handelt sich um eine **Link-Local-Adresse** (Unicast) aus dem Bereich `fe80::/10` (1 P).
Sie wird von jedem IPv6-fähigen Interface automatisch selbst erzeugt (SLAAC) und ist nur im
lokalen Netzsegment gültig, sie wird nicht geroutet (1 P).

**e) 3 Punkte**
**Dual-Stack:** Auf denselben Geräten und Netzen werden IPv4- und IPv6-Adressen gleichzeitig
betrieben, jedes Gerät kann über beide Protokolle kommunizieren.
Alternativ **Tunneling:** IPv6-Pakete werden in IPv4-Pakete gekapselt und über das bestehende
IPv4-Netz transportiert (oder umgekehrt).

**f) 4 Punkte** (je Gerät 1 P kritischer Wert, 1 P Problem)
- **Kasse 2:** kritischer Wert ist die **Antwortzeit von 512 ms**. Sie ist um ein Vielfaches zu hoch.
  Folge: spürbare Verzögerungen in Anwendungen, Timeouts bei Datenbankzugriffen, abbrechende Sitzungen.
- **Kasse 3:** kritischer Wert ist der **Paketverlust von 75 %**. Die Verbindung ist instabil.
  Folge: abbrechende Verbindungen, unvollständige Übertragungen, wiederholte Sendeversuche und dadurch
  weiter sinkender Durchsatz. Ursache oft defektes Kabel, Duplex-Problem oder überlasteter Port.

**g) 3 Punkte**
ARP ermittelt zu einer bekannten **IP-Adresse** die zugehörige **MAC-Adresse** im lokalen Netz (2 P).
Beispiel: Der Rechner will 10.42.16.193 erreichen, kennt aber nur dessen IP. Er sendet einen
ARP-Broadcast „Wer hat 10.42.16.193?". Das Zielgerät antwortet mit seiner MAC-Adresse, die
anschließend im ARP-Cache hinterlegt wird (1 P).

---

## 4. Aufgabe (25 Punkte)

**a) 6 Punkte**
```
   KUNDE                                    AUFTRAG
   ---------------------                    ---------------------
   KundenID (PK)                            AuftragID (PK)
   Name                     1        n      Auftragsdatum
   Vorname          -------< erteilt >----- Betrag
   Anschrift                                Status
                                            KundenID (FK)
```
Bewertung: Entitäten mit Attributen 2 P · beide Primärschlüssel gekennzeichnet 2 P ·
Beziehung mit korrekter Kardinalität **1 : n** 2 P.
Die Fremdschlüsselkennung darf entfallen.

**ba) 3 Punkte**
```sql
SELECT * FROM Auftrag
WHERE Betrag > 500
ORDER BY Betrag DESC;
```

**bb) 3 Punkte**
```sql
SELECT Status, COUNT(*) AS Anzahl
FROM Auftrag
GROUP BY Status;
```

**bc) 3 Punkte**
```sql
SELECT SUM(Betrag) AS Gesamtbetrag
FROM Auftrag
WHERE Status = 'offen';
```

**c) 7 Punkte** (je Position 1,5 P, Endbetrag 2,5 P)

| Position | Menge | Einzelpreis | Zwischensumme | Mengenrabatt | Betrag |
|---|---:|---:|---:|---|---:|
| 1 | 4 | 35,00 | 140,00 | nein (Menge < 10) | **140,00** |
| 2 | 12 | 18,50 | 222,00 | ja, × 0,90 | **199,80** |
| 3 | 10 | 24,00 | 240,00 | ja, × 0,90 (Menge = 10) | **216,00** |

```
Summe:            140,00 + 199,80 + 216,00 = 555,80 EUR
555,80 > 500  →   Gesamtrabatt: 555,80 × 0,95
Endbetrag:        528,01 EUR
```

Häufiger Fehler: Position 3 mit Menge **genau 10** — die Bedingung lautet `>= 10`,
der Rabatt greift also.

**d) 3 Punkte**
Redundanz bedeutet, dass dieselbe Information **mehrfach** in der Datenbank gespeichert ist (1 P).
Problem: **Inkonsistenz** — wird eine Angabe nur an einer Stelle geändert, widersprechen sich die
Datensätze, Auswertungen werden falsch (1 P). Zusätzlich steigen Speicherbedarf und Pflegeaufwand (1 P).
Abhilfe: Normalisierung, Auslagerung in eigene Tabellen mit Fremdschlüsselbeziehung.
