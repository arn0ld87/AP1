# 01 – Lernplan bis zur AP1 am 30.09.2026

Erstellt: **10.09.2026** · Prüfung: **Mittwoch, 30.09.2026** · **20 Tage / 19 Lerntage**

## Rahmenbedingungen

- Realistisch geplant: **2 h an Werktagen, 3 h am Wochenende** → ca. **42 Stunden** Gesamtbudget.
- Aufteilung laut Zielvorgabe: **60 % A-Themen (≈ 25 h)** · **25 % B-Themen (≈ 10 h)** · **15 % Wiederholung/Probeprüfungen (≈ 7 h)**
- **C-Themen entfallen komplett.** Bei 20 Tagen Restzeit wäre jede Minute darin verschenkt.
- Jeder Tag endet mit 10–15 Minuten **Wiederholung der Fehler des Vortags**. Das ist nicht optional – es ist der Teil, der den Stoff hält.

## Prinzip

> Rechenwege werden **trainiert**, nicht gelesen. Wissensfragen werden **abgefragt**, nicht markiert.

Für jede Übungsaufgabe gilt: erst selbst rechnen, dann Lösung vergleichen, Fehler in `05_FEHLERLISTE.md` eintragen.

---

## Woche 1 – Rechenkern (Tage 1–7)

### Tag 1 · Do 10.09. – Einheiten und Datenmengen I

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 30 min | bit/Byte, Ki/Mi/Gi/Ti vs. k/M/G/T | Umrechnung ohne Nachdenken beherrschen; wissen: **Speicher = 1024er, Datenraten = 1000er** | Lernen (`lernen/datenmengen.md`) |
| 45 min | Speicherbedarf aus Auflösung × Farbtiefe | Formel `Breite × Höhe × Farbtiefe / 8` sicher anwenden | Rechenaufgaben |
| 30 min | **Original: F2024 Aufg. 3da/db/dc** (3.840 Punkte, RGB, Prozent) | Originalniveau kennenlernen | Altprüfung |
| 15 min | Kontrolle + Fehlerliste | – | Rückrechnung |

### Tag 2 · Fr 11.09. – Datenmengen II (dpi, Video)

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 1 | Kurztest ohne Hilfsmittel | Kurztest |
| 40 min | dpi → Pixel (cm ÷ 2,54 × dpi) | Scan-Aufgaben sicher lösen | Lernen + Übung |
| 40 min | **Original: H2022 Aufg. 2a/2ba/2bb** (Karton-Scan, MiB → TiB) | die schwerste belegte Datenmengen-Aufgabe schaffen | Altprüfung |
| 20 min | Video-Bitrate: `B × H × Farbtiefe × fps × Kompression` | Formel sitzt | Rechenaufgaben |

### Tag 3 · Sa 12.09. – Übertragungszeit & Datenrate

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 2 | – | Kurztest |
| 45 min | `t = Datenmenge (bit) / Datenrate (bit/s)`; **Upload ≠ Download!** | die klassische Falle vermeiden | Lernen + Übung |
| 45 min | **Originale: F2022 4e (100 MiB @ 40 Mbit/s) + F2024 4f (1 GiB @ 50,02 Mbit/s)** | beide auf Anhieb richtig | Altprüfung |
| 40 min | **Original: F2026 1ad + 1b** (Kamera-Bitrate → 53 TiB) | Kombination Datenrate + Speicher | Altprüfung |
| 20 min | Fehlerliste + Rückrechnung | – | Kontrolle |

### Tag 4 · So 13.09. – Strom, Leistung, Energiekosten

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 3 | – | Kurztest |
| 40 min | `P = U · I`, `P_zu = P_ab / η`, `E[kWh] = P[kW] · t[h]`, `Kosten = E · Preis` | vier Formeln auswendig | Lernen |
| 45 min | **Original: H2021 Aufg. 2a/2b/2d** (Wirkungsgrad, Amortisation, 16-A-Steckdose) | 14 Punkte sicher | Altprüfung |
| 35 min | **Originale: F2024 3e/3f (Netzteil + 10 % Puffer, Stromkosten) und F2026 1ac (PoE, I = P/U)** | Varianten erkennen | Altprüfung |
| 20 min | Amortisation: `t = Mehrpreis / Ersparnis je Periode` | – | Rechenaufgaben |

### Tag 5 · Mo 14.09. – Subnetting I

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 4 | – | Kurztest |
| 50 min | CIDR /24 bis /30: Maske, Blockgröße, Netz-, Broadcast-, erste/letzte Hostadresse, `2^h − 2` | ohne Tabelle rechnen können | Lernen (`lernen/subnetting.md`) |
| 40 min | **Originale: F2026 2a (/25), F2025 1d (/26), F2022 3fb (/24)** | alle drei richtig | Altprüfung |
| 10 min | Fehlerliste | – | – |

### Tag 6 · Di 15.09. – Subnetting II + Adressarten

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 5 | – | Kurztest |
| 35 min | private Bereiche (10/8, 172.16/12, 192.168/16), **APIPA 169.254.x.x**, Loopback, DHCP-Range beachten | H2024 1da/1db sicher beantworten | Lernen + Altprüfung |
| 35 min | **Original: H2024 Aufg. 1da–1dd** (APIPA, statische Konfiguration, MAC ermitteln) | 15 Punkte | Altprüfung |
| 30 min | eigene Übungsaufgaben: 10 × Netz/Broadcast/Hosts bestimmen | Tempo aufbauen | Drill |

### Tag 7 · Mi 16.09. – Netzplantechnik I

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 6 | – | Kurztest |
| 45 min | Knotenaufbau, Vorwärtsrechnung (FAZ, FEZ), Rückwärtsrechnung (SEZ, SAZ), GP, FP | Reihenfolge sitzt: erst alle FAZ/FEZ vorwärts, dann alle SEZ/SAZ rückwärts | Lernen (`lernen/netzplan.md`) |
| 45 min | **Original: H2021 Aufg. 1c/1d/1e** (14 + 1 + 2 Punkte) | vollständiger Netzplan fehlerfrei | Altprüfung |
| 10 min | Fehlerliste | – | – |

---

## Woche 2 – Punktestarke Wissensblöcke (Tage 8–14)

### Tag 8 · Do 17.09. – Netzplantechnik II

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 7 | – | Kurztest |
| 40 min | **Original: F2025 Aufg. 3aa/3ab** (Netzplan + kritischer Pfad A-B-D-E-I-J) | 10 Punkte | Altprüfung |
| 45 min | **Original: F2026 Aufg. 2e** – die *schwierige* Variante: **Fehler im fertigen Netzplan finden** | Prüfstrategie: jeden Knoten gegen die Formeln gegenrechnen | Altprüfung |
| 15 min | Gantt vs. Netzplan (H2023 4aa) | 4 Punkte geschenkt | Lernen |

### Tag 9 · Fr 18.09. – Wirtschaftliche Kalkulation

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 8 | – | Kurztest |
| 40 min | Kostenvergleich mit Nutzungsdauer/Abschreibung, Rabatt, Wartung; Netto→Brutto (× 1,19); effektiver Stundensatz | Rechenschema aufschreiben können | Lernen (`lernen/wirtschaftsrechnung.md`) |
| 45 min | **Originale: F2024 1b (laufende Kosten CAD), F2025 1ac (Kosten/Monat), H2024 2f (5 Jahre netto/brutto)** | 16 Punkte | Altprüfung |
| 15 min | **Original: H2022 1e** (effektiver Stundensatz) + **H2023 2e** (Minutensatz Hotline) | – | Altprüfung |

### Tag 10 · Sa 19.09. – Nutzwertanalyse + Zwischenstand

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 9 | – | Kurztest |
| 30 min | Nutzwertanalyse: Bewertungsskala, Gewichtung × Punktwert, Spaltensumme, **KO-Kriterium prüfen** | Schema in 5 Minuten aufbauen | Lernen |
| 40 min | **Originale: H2022 3g (Bezugspreis + Angebotsvergleich, 10 P), F2024 1aa/1ab, F2025 1aa/1ab** | 23 Punkte | Altprüfung |
| 60 min | **Probeprüfung 1 (verkürzt, 45 Min):** Schwerpunkt Rechenaufgaben A1–A6 | Standortbestimmung Rechenteil | Probeprüfung |
| 30 min | Auswertung + `04_LERNFORTSCHRITT.md` aktualisieren | – | Korrektur |

### Tag 11 · So 20.09. – IT-Sicherheit & Datenschutz I

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 10 | – | Kurztest |
| 50 min | **Schutzziele Vertraulichkeit / Integrität / Verfügbarkeit** – je 3 Maßnahmen + Begründung; Schutzbedarfskategorien (normal/hoch/sehr hoch) | Zuordnung + Begründung frei formulieren | Lernen (`lernen/it-sicherheit.md`) |
| 40 min | **DSGVO/BDSG**, personenbezogene Daten, Videoüberwachung, weitere Rechtsgrundlagen (StGB, GG Art. 10) | Rechtsgrundlage in einem Satz nennen können | Lernen |
| 40 min | **Originale: H2021 Aufg. 4a–4e (24 P) + F2026 3a** | die punktstärkste Aufgabe der Prüfung sicher | Altprüfung |
| 10 min | Fehlerliste | – | – |

### Tag 12 · Mo 21.09. – IT-Sicherheit II

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 11 | – | Kurztest |
| 45 min | Symmetrisch vs. asymmetrisch (wer verschlüsselt womit?), **Hashwert = Integrität**, digitales Zertifikat, VPN, SSH vs. Telnet, IMAP vs. POP3 | Ablauf asym. Verschlüsselung in 4 Sätzen erklären | Lernen |
| 35 min | Phishing (Anzeichen + Maßnahmen), Malware-Arten (Virus, Trojaner, Wurm, Spyware, Ransomware, Keylogger, Backdoor) + je ein Merkmal | 9 Punkte aus H2024 3c abrufbar | Lernen |
| 30 min | BSI-Grundschutz, Passwortkriterien, Backup (Generationenprinzip, räumliche/zeitliche Trennung) | – | Lernen |
| 10 min | Fehlerliste | – | – |

### Tag 13 · Di 22.09. – Netzwerkdiagnose & OSI

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 12 | – | Kurztest |
| 40 min | **OSI-Tabelle**: Schicht ↔ Protokoll ↔ Adresse ↔ typischer Fehler (Schichten 1, 2, 3, 4, 7) | Tabelle aus dem Kopf | Lernen |
| 35 min | Konsolenbefehle: `ipconfig /all`, `ifconfig`, `ping`, `arp -a`, `nslookup`, `tracert`, `getmac` – **und was sie jeweils beweisen** | zu jedem Fehlerbild den passenden Befehl nennen | Lernen |
| 45 min | **Originale: F2022 Aufg. 3 (komplett), F2024 Aufg. 2 (komplett), F2026 2b (Fehlertabelle 8 P)** | Fehler → Überprüfung → Behebung als Dreischritt | Altprüfung |

### Tag 14 · Mi 23.09. – IPv6 + Hardware/Schnittstellen

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 13 | – | Kurztest |
| 40 min | IPv6: 128 Bit, Kürzungsregeln (und Rückweg!), Präfixlänge, Interface-ID, `fe80::` Link-Local, Dual-Stack/Tunneling | ungekürzte Darstellung fehlerfrei schreiben | Lernen |
| 30 min | **Originale: F2024 2c (5 P), H2022 3b/3c/3f, F2026 2c/2d** | – | Altprüfung |
| 30 min | Schnittstellen: HDMI, DisplayPort, DVI, USB-A/-C, RJ-45, Kaltgerätebuchse; RAM DDR4/DDR5 + Taktkompatibilität; SSD vs. HDD; PoE-Klassen | Bilder zuordnen können | Lernen |
| 10 min | Fehlerliste | – | – |

---

## Woche 3 – B-Themen, Probeprüfungen, Feinschliff (Tage 15–20)

### Tag 15 · Do 24.09. – ERM + SQL-Grundlagen

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 14 | – | Kurztest |
| 45 min | ERM: Entität, Attribut, Primärschlüssel (unterstrichen), Fremdschlüssel (#), Beziehung, **Kardinalitäten 1:1 / 1:n / n:m** | Modell aus Textbeschreibung ableiten | Lernen |
| 35 min | **Originale: F2026 4c, H2024 4b, H2022 4c** | 18 Punkte | Altprüfung |
| 20 min | SQL: `SELECT … FROM … WHERE`, `COUNT()`, `COUNT(DISTINCT …)`, `SUM()`, `GROUP BY`, `ORDER BY` | einfache Abfrage schreiben (Syntaxblatt liegt in der Prüfung bei!) | Lernen |

### Tag 16 · Fr 25.09. – Pseudocode, Struktogramm, UML

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 20 min | Wiederholung Tag 15 | – | Kurztest |
| 50 min | **Schreibtischtest**: Wertetabelle anlegen, Zeile für Zeile durchgehen, Zwischenwerte notieren | Methode beherrschen, nicht „im Kopf" rechnen | Lernen |
| 45 min | **Originale: F2026 4bb (Versandkosten, 10 P!) + H2024 2e (2D-Array, 6 P)** | beide fehlerfrei | Altprüfung |
| 25 min | UML: Use-Case (Akteur, Anwendungsfall, `<<include>>`) und Klassendiagramm (`-` privat, `+` öffentlich, Attribut: Datentyp) | **Originale: H2024 2d, F2026 4ba** | Altprüfung |

### Tag 17 · Sa 26.09. – Probeprüfung 2 (voll)

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 90 min | **Probeprüfung 2: realistische gemischte Prüfung, 100 Punkte, 90 Minuten, Uhr mitlaufen lassen** | Zeitgefühl aufbauen: **ca. 1 Minute pro Punkt** | Probeprüfung |
| 45 min | Selbstkorrektur mit Lösungsbogen, Punkte eintragen | ehrlich bewerten | Korrektur |
| 30 min | Fehler klassifizieren: Wissenslücke / Rechenfehler / Flüchtigkeit / Zeitmangel | `05_FEHLERLISTE.md` füllen | Analyse |
| 15 min | Lernplan Tag 18 anpassen | – | – |

### Tag 18 · So 27.09. – Gezielte Fehlerbehebung + B-Restthemen

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 60 min | **Die drei schwächsten Themen aus Probeprüfung 2** erneut durcharbeiten | von „unsicher" auf „ausreichend" | gezielte Wiederholung |
| 35 min | RAID 0/1/5/6/10 + NAS/SAN/JBOD; Nettokapazität `(n−1)·kleinste Platte` | **Originale: H2021 3e, H2022 2ca/cb/cc** | Lernen + Altprüfung |
| 35 min | Projektmanagement-Vokabular: Lasten-/Pflichtenheft, SMART, Projektmerkmale, Phasen, Stakeholder | in Stichpunkten abrufbar | Lernen |
| 20 min | Wirtschaft & Recht: Kaufvertrag (2 Willenserklärungen), Lieferverzug, Mängel, Leasing, Dienst-/Werkvertrag | – | Lernen |

### Tag 19 · Mo 28.09. – Probeprüfung 3

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 90 min | **Probeprüfung 3: etwas über Prüfungsniveau** | Sicherheitspuffer schaffen | Probeprüfung |
| 40 min | Korrektur + Auswertung | – | Korrektur |
| 20 min | Formelsammlung `02_FORMELSAMMLUNG.md` komplett durchgehen | jede Formel laut erklären | Wiederholung |

### Tag 20 · Di 29.09. – Ruhiger Feinschliff

| Dauer | Thema | Ziel | Lernform |
|---:|---|---|---|
| 30 min | Formelsammlung, nur laut vorsprechen | Sicherheit | Wiederholung |
| 30 min | `05_FEHLERLISTE.md` von oben nach unten durchgehen | keine Wiederholungsfehler | Wiederholung |
| 20 min | Einheiten-Blitzrunde (20 Umrechnungen) | – | Drill |
| 20 min | Standardantworten IT-Sicherheit einmal durchlesen | – | Wiederholung |
| – | **Danach Schluss.** Taschenrechner, Ausweis, Stifte bereitlegen. Früh schlafen. | – | – |

### Tag 21 · Mi 30.09. – **Prüfungstag**

**Prüfungsstrategie (aus den analysierten Prüfungen abgeleitet):**

1. **Erst alle vier Aufgaben überfliegen** (2 Min). Die Punktzahlen stehen an jeder Teilaufgabe.
2. **Rechenaufgaben zuerst** – dort verlierst du Punkte durch Zeitdruck, bei Wissensfragen nicht.
3. **Rechenweg immer aufschreiben.** In den Lösungsbändern gibt es durchgehend Teilpunkte für den Weg, auch bei falschem Endergebnis.
4. **Ersatzwerte nutzen.** Bei mehrstufigen Rechnungen steht regelmäßig „Falls Sie a) nicht lösen konnten, rechnen Sie mit …" – damit sind die Folgepunkte trotzdem erreichbar (belegt in H2021 2b, H2022 2bb, F2024 3f, F2026 1b).
5. **Anzahl beachten.** „Nennen Sie drei …" – wenn du fünf nennst, werden nur die ersten drei gewertet.
6. **Einheiten und Rundungsvorgabe** („auf volle Sekunden aufrunden", „auf zwei Stellen") wörtlich befolgen.
7. **Nichts leer lassen.** Stichwortartige Antworten sind ausdrücklich zugelassen.
8. Faustregel Zeit: **1 Punkt ≈ 1 Minute**, plus 10 Minuten Puffer zum Schluss.

---

## Wenn weniger Zeit bleibt als geplant

Reihenfolge, in der gestrichen wird (von hinten):
1. Tag 15 SQL-Teil
2. Tag 14 IPv6-Vertiefung
3. Tag 18 RAID
4. Probeprüfung 3

**Niemals streichen:** Tage 1–4 (Rechenkern), Tag 5–6 (Subnetting), Tag 11–12 (IT-Sicherheit), Tag 17 (Probeprüfung 2).
