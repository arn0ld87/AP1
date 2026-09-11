# Lösungshinweise Probeprüfung 01

**Bewertungsschlüssel (wie in den Originalprüfungen):**
100–92 = 1 · unter 92–81 = 2 · unter 81–67 = 3 · **unter 67–50 = 4 (ausreichend)** · unter 50–30 = 5 · unter 30–0 = 6

Andere sach- und fachgerechte Lösungen sind ebenfalls zu werten.

---

## 1. Aufgabe (25 Punkte)

**a) 4 Punkte** (je 1 Punkt, vier Nennungen genügen)
Einmaligkeit · klare Zielvorgabe · zeitliche Begrenzung mit Anfang und Ende ·
begrenzte Ressourcen (personell, finanziell, sachlich) · eigene Projektorganisation ·
Komplexität · Neuartigkeit · fachübergreifende Zusammenarbeit

**b) 12 Punkte** (je vollständig richtiger Vorgang 1,5 Punkte, insgesamt 12)

| Vorgang | Dauer | FAZ | FEZ | SAZ | SEZ | GP | FP |
|---|--:|--:|--:|--:|--:|--:|--:|
| A | 3 | 0 | 3 | 0 | 3 | 0 | 0 |
| B | 4 | 3 | 7 | 3 | 7 | 0 | 0 |
| C | 6 | 7 | 13 | 7 | 13 | 0 | 0 |
| D | 5 | 7 | 12 | 8 | 13 | 1 | 1 |
| E | 4 | 13 | 17 | 13 | 17 | 0 | 0 |
| F | 3 | 17 | 20 | 17 | 20 | 0 | 0 |
| G | 2 | 20 | 22 | 20 | 22 | 0 | 0 |
| H | 2 | 17 | 19 | 20 | 22 | 3 | 3 |
| I | 1 | 22 | 23 | 22 | 23 | 0 | 0 |

Rechenweg: FEZ = FAZ + Dauer · FAZ des Nachfolgers = größter FEZ der Vorgänger ·
SAZ = SEZ − Dauer · SEZ des Vorgängers = kleinster SAZ der Nachfolger.
E beginnt bei max(13; 12) = 13, I beginnt bei max(22; 19) = 22.

**c) 3 Punkte**
Projektdauer **23 Tage** (1 Punkt).
Kritischer Pfad **A – B – C – E – F – G – I** (2 Punkte), erkennbar an GP = 0.

**d) 2 Punkte**
Vorgang D hat einen Gesamtpuffer von nur **1 Tag**. Eine Verzögerung um 2 Tage überschreitet den
Puffer um einen Tag, dadurch verschiebt sich das Projektende um **1 Tag auf 24 Tage**.
D wird damit selbst kritisch.

**e) 4 Punkte** (je 1 Punkt)
Kurzvorstellung des Auftraggebers · Definition des Projektziels · Beschreibung der bestehenden
IT-Infrastruktur · funktionale Anforderungen · Zeitrahmen · Rahmenbedingungen zu IT-Sicherheit und
Datenschutz · Abnahmekriterien · Budgetrahmen

---

## 2. Aufgabe (25 Punkte)

**a) 4 Punkte**
```
2560 × 1440              = 3.686.400 Pixel        (1 P)
3.686.400 × 24 bit       = 88.473.600 bit je Bild (1 P)
88.473.600 × 25 fps      = 2.211.840.000 bit/s    (1 P)
× 0,08                   = 176.947.200 bit/s
                         = 176,9472 Mbit/s
```
**Ergebnis: 177 Mbit/s** (aufgerundet, 1 P)

**b) 5 Punkte**
```
14 Tage = 14 × 24 × 3.600 = 1.209.600 s                       (1 P)
177.000.000 bit/s × 6 Kameras × 1.209.600 s
      = 1.284.595.200.000.000 bit                             (2 P)
/ 8                  = 160.574.400.000.000 Byte               (1 P)
/ 1024 / 1024 / 1024 / 1024 = 146,04 TiB
```
**Ergebnis: 147 TiB** (aufgerundet, 1 P)

**c) 5 Punkte**
```
Bezogene Leistung:  450 W / 0,82 = 548,78 W                  (2 P)
Betriebsstunden:    365 × 24 = 8.760 h                        (1 P)
Energie:            0,54878 kW × 8.760 h = 4.807,32 kWh       (1 P)
Kosten:             4.807,32 kWh × 0,34 EUR = 1.634,49 EUR    (1 P)
```

**d) 4 Punkte**
```
Variante B: 450 W / 0,94 = 478,72 W
            0,47872 kW × 8.760 h = 4.193,62 kWh
            × 0,34 EUR = 1.425,83 EUR/Jahr                    (2 P)
Ersparnis:  1.634,49 − 1.425,83 = 208,66 EUR/Jahr
            = 17,39 EUR/Monat                                 (1 P)
Mehrpreis:  400 − 260 = 140 EUR
            140 / 17,39 = 8,05 Monate → nach 9 Monaten        (1 P)
```

**e) 4 Punkte**
```
Zulässige Last:  16 A × 230 V = 3.680 W                       (2 P)
Angeschlossen:   3 × 220 W + 1.100 W + 2.200 W = 3.960 W      (1 P)
3.960 W > 3.680 W → gleichzeitiger Betrieb nicht möglich       (1 P)
```

**f) 3 Punkte** (je 1 Punkt)
schaltbare Steckdosenleisten gegen Standby-Verbrauch · Energiesparoptionen des Betriebssystems
aktivieren · Geräte mit guter Energieeffizienzklasse beschaffen · Thin Clients statt vollwertiger PCs ·
Monitore mit LED-Hintergrundbeleuchtung · Servervirtualisierung zur Reduzierung der Gerätezahl ·
Abschaltung nicht benötigter Geräte außerhalb der Arbeitszeit

---

## 3. Aufgabe (25 Punkte)

**a) 6 Punkte** (je 1 Punkt)
- Subnetzmaske: **255.255.255.192**
- Netzadresse: **172.20.48.128**
- Broadcast-Adresse: **172.20.48.191**
- erste nutzbare Hostadresse: **172.20.48.129**
- letzte nutzbare Hostadresse: **172.20.48.190**
- Anzahl nutzbarer Adressen: **62** (2⁶ − 2)

Rechenweg: /26 → 6 Hostbits → Blockgröße 256 − 192 = 64.
Blöcke: 0–63, 64–127, **128–191**, 192–255. Die .137 liegt im dritten Block.

**b) 2 Punkte**
**4 Subnetze.** Von /24 auf /26 werden 2 Bits geliehen: 2² = 4.

**c) 5 Punkte** (je richtig gefülltem Feld 0,5 Punkte)

| Nr. | Schichtname | Protokolle | Adressen | Möglicher Fehler |
|---:|---|---|---|---|
| 7 | Anwendung | HTTP, DNS, DHCP, SMTP | – | Serverkonfiguration fehlerhaft |
| 3 | Vermittlung | IPv4, IPv6, ICMP | IP-Adressen | falsche IP-Adresse vergeben |
| 2 | Sicherung | Ethernet | MAC-Adressen | Netzwerkkarte defekt |
| 1 | Bitübertragung | – | – | Medium getrennt, Kabel defekt |

**d) 3 Punkte**
Die Adresse stammt aus dem **APIPA-Bereich 169.254.0.0/16** (1 P). Sie wird vom Betriebssystem
selbst vergeben, wenn kein DHCP-Server erreicht werden konnte und keine statische Adresse gesetzt ist.
Zwei mögliche Ursachen (je 1 P): DHCP-Server ausgefallen oder nicht erreichbar · Netzwerkkabel nicht
gesteckt oder Dose nicht gepatcht · DHCP-Adressbereich erschöpft · Gerät im falschen VLAN

**e) 6 Punkte** (je Zeile 2 Punkte)

| Möglicher Fehler | Mögliche Überprüfung | Fehlerbehebung |
|---|---|---|
| Patchkabel ist defekt | LED an der Netzwerkbuchse prüfen, Kabeltester einsetzen, Kabel testweise tauschen | defektes Netzwerkkabel austauschen |
| Netzwerkdose ist nicht gepatcht | funktionierenden Rechner an der Dose anschließen, Verteilerfeld prüfen | Dose im Patchfeld auflegen lassen oder andere Dose nutzen |
| Namensauflösung funktioniert nicht | `ping` auf eine IP-Adresse gelingt, auf den Namen nicht; `nslookup` ausführen | DNS-Server-Eintrag korrigieren bzw. Störung melden |

**f) 3 Punkte**
Es handelt sich um **private IP-Adressen** (1 P). Sie werden im Internet nicht geroutet (1 P) und
sind daher von außen nicht direkt erreichbar; ein Zugriff nach außen erfolgt nur über NAT am Router (1 P).

---

## 4. Aufgabe (25 Punkte)

**a) 8 Punkte** (je Zeile 1 Punkt Schutzziel + 1 Punkt Begründung)

| Sicherheitsmaßnahme | Schutzziel | Begründung |
|---|---|---|
| Verschlüsselung der Notebook-Festplatten | Vertraulichkeit | Bei Verlust oder Diebstahl können Unberechtigte die Daten nicht lesen. |
| Tägliche Datensicherung der Konstruktionsdaten | Verfügbarkeit | Nach einem Datenverlust kann der Bestand wiederhergestellt werden. |
| Prüfsummenvergleich nach dem Software-Download | Integrität | Eine Veränderung oder Manipulation der Datei würde auffallen. |
| Unterbrechungsfreie Stromversorgung im Serverraum | Verfügbarkeit | Bei Stromausfall bleiben die Systeme erreichbar bzw. lassen sich geordnet herunterfahren. |

**b) 3 Punkte**
Besonders geschützt sind **personenbezogene Daten** (1 P), also alle Daten, die sich auf eine
identifizierte oder identifizierbare natürliche Person beziehen — hier zum Beispiel Mitarbeiter- und
Bewerberdaten (1 P). Rechtliche Grundlage: **DSGVO**, ergänzend das Bundesdatenschutzgesetz (BDSG) (1 P).

**c) 4 Punkte** (je Kriterium 1 P, je Begründung 1 P)
- Ausreichende Länge → der Suchraum wächst stark, ein Brute-Force-Angriff dauert unverhältnismäßig lange.
- Groß- und Kleinbuchstaben, Ziffern und Sonderzeichen → größerer Zeichenvorrat, dadurch deutlich mehr Kombinationen.
- Keine Wörter aus dem Wörterbuch → Wörterbuchangriffe laufen ins Leere.
- Für jeden Dienst ein eigenes Passwort → ein kompromittiertes Passwort gefährdet nicht alle Zugänge.

**da) 3 Punkte** (je 1 Punkt)
unpersönliche Anrede · Druck und Drohung („Konto wird gesperrt") · Rechtschreib- und Grammatikfehler ·
Absenderadresse weicht von der angezeigten Organisation ab · Linkziel stimmt nicht mit dem Anzeigetext
überein · unerwarteter Anhang · Aufforderung zur Eingabe von Zugangsdaten

**db) 2 Punkte** (je 1 Punkt)
Spamfilter und Mail-Gateway einsetzen · regelmäßige Awareness-Schulungen · Anhänge in einer Sandbox
prüfen · SPF/DKIM/DMARC konfigurieren · klaren Meldeweg an die IT einrichten · Zwei-Faktor-Authentifizierung

**ea) 2 Punkte** (je 1 Punkt)
Keine räumliche Trennung: Bei Diebstahl, Brand oder Defekt der Festplatte sind Original und Sicherung
gleichzeitig verloren · zu langer Sicherungszyklus: Es können bis zu fünf Arbeitstage verloren gehen ·
nur ein Sicherungsstand, ältere Versionen sind nicht wiederherstellbar · Verschlüsselungstrojaner
befällt die zweite Partition mit

**eb) 3 Punkte**
Sicherung auf ein **externes Medium** (1 P), das nach dem Sichern getrennt und **an einem anderen Ort**
verwahrt wird (1 P), mit mindestens **täglicher** Sicherung der veränderten Daten nach dem
Generationenprinzip und regelmäßigem Test der Rücksicherung (1 P).
