# Lösungshinweise Probeprüfung 03

**Bewertungsschlüssel:** 100–92 = 1 · unter 92–81 = 2 · unter 81–67 = 3 · **unter 67–50 = 4** · unter 50–30 = 5 · unter 30–0 = 6

---

## 1. Aufgabe (25 Punkte)

**a) 4 Punkte**
Die Betriebsart „max. with heater and IR" benötigt **51 W**. Das erfüllt erst
**IEEE 802.3bt (Type 3)** mit bis zu 60 W (2 P).
```
I = P / U = 51 W / 48 V = 1,0625 A = 1.062,5 mA                  (2 P)
```

**b) 4 Punkte**
```
3840 × 2160                 = 8.294.400 Pixel                     (1 P)
8.294.400 × 24 bit          = 199.065.600 bit je Bild             (1 P)
199.065.600 × 30 fps        = 5.971.968.000 bit/s
× 0,05                      = 298.598.400 bit/s = 298,5984 Mbit/s (1 P)
```
**Ergebnis: 299 Mbit/s** (aufgerundet, 1 P)

**c) 5 Punkte**
```
30 Tage = 30 × 24 × 3.600 = 2.592.000 s                           (1 P)
299.000.000 bit/s × 8 Kameras × 2.592.000 s
      = 6.200.064.000.000.000 bit                                 (2 P)
/ 8                         = 775.008.000.000.000 Byte            (1 P)
/ 1024⁴                     = 704,87 TiB
```
**Ergebnis: 705 TiB** (aufgerundet, 1 P)

**d) 5 Punkte**
```
Tagesmenge einer Kamera:
299.000.000 bit/s × 86.400 s = 25.833.600.000.000 bit             (2 P)
Übertragung bei 1 Gbit/s = 1.000.000.000 bit/s:
25.833.600.000.000 / 1.000.000.000 = 25.833,6 s                   (2 P)
25.833,6 s : 3.600 = 7 h Rest 633,6 s = 10 min Rest 33,6 s
```
**Ergebnis: 7 Stunden 10 Minuten 34 Sekunden** (aufgerundet, 1 P)

**e) 4 Punkte** (je 2 Punkte)
- Es muss zwingend ein eigenes, den Sicherheitsvorgaben entsprechendes Passwort vergeben werden;
  ohne Vergabe ist in der Regel kein Zugang möglich. Das erzwingt eine bewusste Konfiguration.
- Es gibt kein herstellerweit einheitliches Standardpasswort, das aus öffentlichen Listen bekannt
  sein könnte. Damit entfällt ein sehr häufiger Angriffsweg auf Netzwerkkameras.

**f) 1 Punkt**
Die Heizung schützt die Kamera bei niedrigen Außentemperaturen vor Vereisung und Beschlagen der
Optik und hält sie damit auch im Winter betriebsbereit.

**g) 2 Punkte** (je 1 Punkt)
- **Gesamtes PoE-Leistungsbudget** des Switches (8 Kameras × 51 W = 408 W zuzüglich Reserve)
- Unterstützter **PoE-Standard je Port** (hier 802.3bt Type 3)
- ebenfalls zulässig: Anzahl benötigter Ports · Portgeschwindigkeit (mindestens 1 Gbit/s wegen 299 Mbit/s je Kamera)

---

## 2. Aufgabe (25 Punkte)

**a) 9 Punkte** (je Fehler 3 Punkte: Vorgang und Feld 1 P, korrekter Wert 2 P)

Korrekt gerechnet ergibt sich:

| Vorgang | Dauer | FAZ | FEZ | SAZ | SEZ | GP | FP |
|---|--:|--:|--:|--:|--:|--:|--:|
| A | 2 | 0 | 2 | 0 | 2 | 0 | 0 |
| B | 5 | 2 | 7 | 2 | 7 | 0 | 0 |
| C | 3 | 2 | 5 | **4** | 7 | 2 | 2 |
| D | 4 | 7 | 11 | 10 | 14 | **3** | 0 |
| E | 6 | 7 | 13 | 7 | 13 | 0 | 0 |
| F | 2 | 11 | 13 | 14 | 16 | 3 | **3** |
| G | 3 | 13 | 16 | 13 | 16 | 0 | 0 |
| H | 2 | 16 | 18 | 16 | 18 | 0 | 0 |

| Nr. | Vorgang | falsches Feld | eingetragen | korrekt |
|---:|---|---|---:|---:|
| 1 | C | SAZ | 2 | **4** |
| 2 | D | GP | 4 | **3** |
| 3 | F | FP | 0 | **3** |

Begründungen:
1. C: SAZ = SEZ − Dauer = 7 − 3 = **4**. Der Kollege hat den FAZ abgeschrieben.
2. D: GP = SAZ − FAZ = 10 − 7 = **3** (Gegenprobe SEZ − FEZ = 14 − 11 = 3).
3. F: FP = FAZ des Nachfolgers H − FEZ von F = 16 − 13 = **3**.

**b) 2 Punkte**
Projektdauer **18 Tage** (1 P) · kritischer Pfad **A – B – E – G – H** (1 P)

**c) 5 Punkte**
```
Kameras:   18 × 489,00 EUR   =  8.802,00 EUR                      (1 P)
Switches:   4 × 1.290,00 EUR =  5.160,00 EUR                      (1 P)
Server:     1 × 2.450,00 EUR =  2.450,00 EUR
Montage:    3 ×  640,00 EUR  =  1.920,00 EUR                      (1 P)
---------------------------------------------
Nettobetrag                  = 18.332,00 EUR                      (1 P)
Bruttobetrag: 18.332,00 × 1,19 = 21.815,08 EUR                    (1 P)
```

**d) 4 Punkte**
```
Wartung 5 Jahre: 5 × 1.180,00 EUR = 5.900,00 EUR                  (1 P)
Netto gesamt:  18.332,00 + 5.900,00 = 24.232,00 EUR               (2 P)
Brutto gesamt: 24.232,00 × 1,19    = 28.836,08 EUR                (1 P)
```

**e) 3 Punkte** (je 1 Punkt)
gleichbleibende, gut planbare monatliche Kosten · keine hohe Anfangsinvestition, Liquidität bleibt
erhalten · stets aktuelle Technik durch Austausch am Vertragsende · Wartung und Service häufig im
Vertrag enthalten · Leasingraten sind als Betriebsausgaben absetzbar · Bilanzneutralität

**f) 2 Punkte** (je 1 Punkt)
Kauf der Anlage zum Restwert · Verlängerung des bestehenden Leasingvertrags ·
Abschluss eines neuen Leasingvertrags über modernere Technik · Rückgabe der Anlage

---

## 3. Aufgabe (25 Punkte)

**a) 5 Punkte**
```
+---------------------------------------------------------+
|                     LizenzRechner                        |
+---------------------------------------------------------+
| - preisBasis : double                                    |
| - preisPro : double                                      |
| - preisEnterprise : double                               |
| - rabattGrenze : double                                  |
+---------------------------------------------------------+
| + berechneKosten(kunden: List<Kunde>) : double           |
+---------------------------------------------------------+
```
Bewertung: Klassenname 1 P · vier Attribute 2 P · Datentyp `double` durchgängig 1 P ·
Sichtbarkeit `-` bei allen Attributen 1 P.

**b) 10 Punkte** (je Position 1,5 P, Endbetrag 2,5 P)

| Nr. | Typ | Anzahl | Grundpreis | Rechnung | Staffel | Betrag |
|---:|---|---:|---:|---|---|---:|
| 1 | Basis | 3 | 9,50 | 3 × 9,50 = 28,50 | keine (Anzahl < 5) | **28,50** |
| 2 | Pro | 7 | 21,00 | 7 × 21,00 = 147,00 | × 0,95 (5 ≤ Anzahl < 10) | **139,65** |
| 3 | Basis | 12 | 9,50 | 12 × 9,50 = 114,00 | × 0,85 (Anzahl ≥ 10) | **96,90** |
| 4 | Pro | 4 | 21,00 | 4 × 21,00 = 84,00 | keine | **84,00** |
| 5 | Enterprise | 2 | 48,00 | 2 × 48,00 = 96,00 | keine | **96,00** |

```
Zwischensumme: 28,50 + 139,65 + 96,90 + 84,00 + 96,00 = 445,05 EUR
445,05 > 400  →  Abzug von 25,00 EUR
Endbetrag:     420,05 EUR
```

Stolperstellen: Die Staffel wird über `SONST WENN` geprüft — bei Anzahl 12 greift **nur** die
15-Prozent-Stufe, nicht zusätzlich die 5-Prozent-Stufe. Der Schlussrabatt ist ein **fester Abzug**
von 25 EUR, kein Prozentsatz.

**c) 3 Punkte**
Ein **Compiler** übersetzt den gesamten Quelltext vor der Ausführung einmal vollständig in
Maschinencode; das Programm läuft danach eigenständig und schnell, muss aber für jede Zielplattform
neu übersetzt werden.
Ein **Interpreter** übersetzt und führt den Quelltext zur Laufzeit Anweisung für Anweisung aus;
das ist plattformunabhängiger und beim Testen flexibler, aber in der Ausführung langsamer.

**d) 2 Punkte** (je 1 Punkt)
Wiederverwendbarkeit durch Klassen und Vererbung · Kapselung schützt Daten vor unkontrolliertem
Zugriff · bessere Wartbarkeit und Erweiterbarkeit großer Programme · realitätsnähere Modellierung ·
Arbeitsteilung im Team wird einfacher

**e) 5 Punkte**
```
   KUNDE                                     LIZENZ
   ---------------------                     ---------------------
   Kundennummer (PK)                         Lizenznummer (PK)
   Firmenname               1        n       Lizenztyp
   Ansprechpartner  -------< besitzt >------ Gueltigkeitsbeginn
                                             Gueltigkeitsende
                                             Kundennummer (FK)
```
Bewertung: zwei Entitäten mit vollständigen Attributen 2 P · beide Primärschlüssel gekennzeichnet 2 P ·
Kardinalität **1 : n** 1 P.

---

## 4. Aufgabe (25 Punkte)

**a) 2 Punkte** (je 1 Punkt)
Hinweisschild auf die Videoüberwachung gut sichtbar anbringen · öffentlich zugängliche Flächen
möglichst nicht erfassen bzw. unkenntlich machen · zulässige Speicherfristen einhalten und
Aufnahmen danach löschen · Zugriff auf die Aufnahmen auf berechtigte Personen beschränken ·
Verarbeitungsverzeichnis führen

**b) 3 Punkte**
**DSGVO** (Datenschutz-Grundverordnung), ergänzend das **BDSG** (1 P).
Zweck: Sie schützt personenbezogene Daten vor unbefugter Erhebung, Verarbeitung, Veränderung und
Weitergabe (1 P) und gibt den Betroffenen Rechte wie Auskunft, Berichtigung und Löschung (1 P).

**ca) 4 Punkte** (je Schritt 1 Punkt)
1. Der Dienstleister übermittelt seinen **öffentlichen** Schlüssel an den Betriebsleiter.
2. Der Betriebsleiter verschlüsselt die E-Mail mit dem **öffentlichen Schlüssel des Dienstleisters**.
3. Die verschlüsselte E-Mail wird übertragen; sie ist unterwegs nicht lesbar.
4. Der Dienstleister entschlüsselt sie mit seinem **privaten** Schlüssel.

**cb) 1 Punkt** — **Vertraulichkeit**

**cc) 2 Punkte**
Vorteil: Der geheime Schlüssel muss nicht übertragen werden, nur der öffentliche wird verteilt —
kein Problem des sicheren Schlüsselaustauschs (1 P).
Nachteil: Das Verfahren ist rechenintensiver und damit deutlich langsamer als die symmetrische
Verschlüsselung (1 P).

**d) 3 Punkte**
Der Hashwert dient der **Integritätsprüfung** der heruntergeladenen Datei (1 P).
Der Anwender berechnet den Hash der Datei selbst und vergleicht ihn mit dem veröffentlichten Wert (1 P).
Stimmen beide überein, wurde die Datei bei der Übertragung weder beschädigt noch manipuliert (1 P).

**e) 5 Punkte** (je 1 Punkt)
1. Werkseitig gesetzte Zugangsdaten durch individuelle Passwörter ersetzen
2. Das Kameranetz per eigenem **VLAN** vom Büro-LAN trennen
3. Die **Firmware aktuell** halten
4. Den administrativen Zugriff auf festgelegte Management-Arbeitsplätze beschränken
5. **Protokollierung** aktivieren, damit unberechtigte Zugriffsversuche nachvollziehbar sind

**f) 3 Punkte**
Mit Administratorrechten läuft auch **Schadsoftware mit vollen Rechten** (1 P) und kann Systemdateien
verändern, Sicherheitsfunktionen abschalten und sich im Netz ausbreiten (1 P).
Nach dem Prinzip der minimalen Rechtevergabe sollten Anwender nur eingeschränkte Rechte erhalten und
Administratorrechte nur bei Bedarf und zeitlich begrenzt bekommen (1 P).

**g) 2 Punkte** (je 1 Punkt)
unterbrechungsfreie Stromversorgung (USV) · redundante Netzteile · RAID-Verbund ·
Cluster oder zweiter Server als Failover · regelmäßige Datensicherung mit getestetem Wiederanlauf ·
Wartungsvertrag mit garantierter Reaktionszeit · Klimatisierung und Überwachung des Serverraums
