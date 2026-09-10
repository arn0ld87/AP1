/**
 * Formelsammlung aus data/migration/formelsammlung.json (Task 2) —
 * statischer Content, sortiert nach `order`.
 */
export interface FormelKapitel {
  id: string;
  order: number;
  title: string;
  body_markdown: string;
}

export const FORMEL_KAPITEL: FormelKapitel[] = [
  {
    id: "intro",
    order: 0,
    title: "Einleitung",
    body_markdown:
      "Nur Formeln, die in den analysierten Prüfungen **tatsächlich gebraucht wurden**.\nQuellenangabe = Prüfungstermin und Aufgabennummer, in denen der Rechenweg belegt ist.\n\n---",
  },
  {
    id: "01-einheiten-die-basis-f-r-alles",
    order: 1,
    title: "Einheiten (die Basis für alles)",
    body_markdown:
      "| Größe | Umrechnung |\n|---|---|\n| 1 Byte | 8 bit |\n| 1 KiB / MiB / GiB / TiB | × 1024 (binär) – für **Speicher** |\n| 1 kB / MB / GB / TB | × 1000 (dezimal) – für **Datenraten und Herstellerangaben von Festplatten** |\n| 1 Inch | 2,54 cm |\n| 1 kWh | 1.000 W über 1 Stunde |\n\n**Prüfungsfalle Nr. 1:** Datenmenge wird in **MiB/GiB** angegeben, Leitung in **Mbit/s**.\n→ Erst in Bit umrechnen (`× 1024 … × 8`), dann durch die **dezimale** Datenrate teilen.\n*Belegt: F2022 4e (100 MiB · 1024 · 1024 · 8 / 40.000.000 = 21 s), F2024 4f (1 GiB → 172 s).*\n\n**Prüfungsfalle Nr. 2:** Festplattenhersteller rechnen dezimal, RAID-Aufgaben oft auch.\n*Belegt: H2022 2ca – dort steht ausdrücklich TB, nicht TiB.*\n\n---",
  },
  {
    id: "02-speicherbedarf",
    order: 2,
    title: "Speicherbedarf",
    body_markdown:
      '```\nSpeicher [bit] = Breite [px] × Höhe [px] × Farbtiefe [bit]\nSpeicher [Byte] = Speicher [bit] / 8\n```\n\n**Pixel aus dpi:**\n```\nPixel = Länge [cm] / 2,54 × dpi\n```\n\n**Video / Bildfolge:**\n```\nDatenrate [bit/s] = Breite × Höhe × Farbtiefe × fps × Kompressionsfaktor\nSpeicher [bit]    = Datenrate [bit/s] × Zeit [s]\n```\n\n**Farbanzahl:**\n```\nAnzahl Farben = 2^Farbtiefe        (RGB 8 bit/Kanal = 2^24 = 16.777.216)\n```\n\n**Beispiel (F2026 1ad/1b):**\n1920 × 1080 × 24 bit × 30 fps × 0,3 = 447.897.600 bit/s ≈ **448 Mbit/s**\n4 Kameras × 448 Mbit/s × 259.200 s / 8 / 1024⁴ = 52,81 → **53 TiB**\n\n**Beispiel (H2022 2ba):** 50,80 cm / 2,54 × 400 dpi = 8.000 px; 30,48 cm → 4.800 px\n8.000 × 4.800 × 16 bit / 8 / 1024 / 1024 = **73,25 MiB pro Scan**\n\n**Typische Falle:** Farbtiefe pro Kanal vs. gesamt. „8 Bit pro Farbkanal" = 24 Bit pro Pixel.\n\n---',
  },
  {
    id: "03-bertragungszeit",
    order: 3,
    title: "Übertragungszeit",
    body_markdown:
      '```\nt [s] = Datenmenge [bit] / Datenrate [bit/s]\n```\n\n- Beim **Hochladen** die **Upload**-Rate verwenden, nicht die Download-Rate (F2022 4e, F2024 4f).\n- Rundungsvorgabe beachten („auf volle Sekunden **aufrunden**").\n- Ergebnis ggf. in min : s umrechnen (F2024 4f → 2 min 52 s).\n\n**Typische Falle:** Mbit/s ≠ MB/s. Faktor 8.\n\n---',
  },
  {
    id: "04-elektrische-leistung-und-energiekosten",
    order: 4,
    title: "Elektrische Leistung und Energiekosten",
    body_markdown:
      "```\nP [W]      = U [V] × I [A]              →  I = P / U\nP_zu [W]   = P_ab [W] / η               (η = Wirkungsgrad als Dezimalzahl)\nE [kWh]    = P [kW] × t [h]\nKosten [€] = E [kWh] × Preis [€/kWh]\n```\n\n**Beispiele:**\n- H2021 2a: 60 W / 0,43 = **139,53 W**; 180 h × 0,13953 kW × 0,30 €/kWh = **7,53 €/Monat**\n- H2021 2d: 16 A × 230 V = **3.680 W** zulässig; angeschlossen 4.140 W → nicht gleichzeitig betreibbar\n- F2024 3f: 200 Tage × 9 h × (0,75 kW / 0,9) × 0,5 Auslastung × 0,40 €/kWh = **300 €**\n- F2026 1ac: I = 24 W / 48 V = 0,5 A = **500 mA**\n\n**Typische Falle:** Watt vor der Multiplikation in **kW** umrechnen, sonst Faktor 1000 daneben.\n**Typische Falle:** Wirkungsgrad wird **geteilt**, nicht multipliziert, wenn die aufgenommene Leistung gesucht ist.\n\n---",
  },
  {
    id: "05-amortisation-und-kostenvergleich",
    order: 5,
    title: "Amortisation und Kostenvergleich",
    body_markdown:
      "```\nAmortisationsdauer = Mehranschaffungskosten / Ersparnis je Periode\nKosten je Monat    = Anschaffung / Nutzungsmonate + laufende Kosten\nGesamtkosten       = Anschaffung + variable Kosten × Menge + Wartung × Perioden\n```\n\n**Beispiele:**\n- H2021 2b: 100 € / 3,27 €/Monat = 30,58 → **31 Monate** (immer aufrunden!)\n- F2024 1b: Monitor 450 € / 48 Monate, PC 720 € / 36 Monate, minus 5 % Rabatt, plus Leasing und Wartung\n- F2025 1ac: Gerätekosten / 36 Monate + Druckkosten/Monat + Wartung\n- Frühjahr 2021 2.3: Drucker A vs. B über ein Jahr, Differenz bilden\n\n---",
  },
  {
    id: "06-prozent-mwst-kalkulation",
    order: 6,
    title: "Prozent, MwSt, Kalkulation",
    body_markdown:
      "```\nBruttopreis          = Nettopreis × 1,19            (19 % USt)\nNettopreis           = Bruttopreis / 1,19\nBezugspreis          = Listenpreis − Rabatt − Skonto + Bezugskosten\nEffektiver Stundensatz = Jahreskosten / (Nettoarbeitstage × Stunden pro Tag)\nNettoarbeitstage     = Arbeitstage − Urlaub − Krankheit − Feiertage\n```\n\n**Beispiele:**\n- H2024 2f: Gesamtkosten über 5 Jahre netto, dann × 1,19\n- H2022 1e: 140.000 € / ((260 − 30 − 5 − 5) × 7,8 h)\n- H2022 3g: Bareinkaufspreis + Lieferkosten = Bezugspreis pro Stück\n- F2022 4c: Eigenentwicklung 1.005.000 € / 10 Jahre = 100.500 €/Jahr ÷ 25 €/Lizenz = **ab 4.020 Lizenzen**\n\n---",
  },
  {
    id: "07-nutzwertanalyse-gewichteter-angebotsvergleich",
    order: 7,
    title: "Nutzwertanalyse / gewichteter Angebotsvergleich",
    body_markdown:
      "```\nTeilnutzwert  = Gewichtung × Bewertungspunkte\nGesamtnutzwert = Σ aller Teilnutzwerte je Anbieter\n```\n\nVorgehen:\n1. Für jedes Kriterium die Anbieter in eine **Rangfolge** bringen (bester = höchste Punktzahl).\n2. Punktwert × Gewichtung je Zelle.\n3. Spalten addieren, höchster Gesamtnutzwert gewinnt.\n4. **KO-Kriterien zuerst prüfen** – ein Anbieter, der eine Muss-Anforderung verfehlt, scheidet aus, auch wenn er punktbeste wäre (belegt: F2024 1ab – SaaS-Anbieter fällt raus, weil on-premise gefordert ist).\n\n*Belegt: H2022 3g (Ergebnis 64 / 57 / 77), F2024 1aa, F2025 1aa.*\n\n---",
  },
  {
    id: "08-raid-kapazit-ten",
    order: 8,
    title: "RAID-Kapazitäten",
    body_markdown:
      "```\nRAID 0  : n × k                       (kein Ausfallschutz)\nRAID 1  : k                           (Spiegelung, 50 % nutzbar bei 2 Platten)\nRAID 5  : (n − 1) × k_kleinste        (1 Platte darf ausfallen)\nRAID 6  : (n − 2) × k_kleinste        (2 Platten dürfen ausfallen)\nRAID 10 : (n / 2) × k\nJBOD    : Σ aller Platten             (kein Schutz, keine gleiche Größe nötig)\n```\n`n` = Anzahl Platten, `k` = Kapazität der **kleinsten** Platte.\n\n**Beispiel (H2022 2ca):** 2 × 3 TB + 7 × 2 TB, RAID 5 über alle 9 Platten\n→ kleinste gemeinsame Kapazität 2 TB → (9 − 1) × 2 TB = **16 TB**\nJBOD derselben Platten: 6 TB + 14 TB = **20 TB**\n\n**Typische Falle:** Bei ungleichen Platten zählt bei RAID immer die **kleinste**.\n\n---",
  },
  {
    id: "09-subnetting-ipv4",
    order: 9,
    title: "Subnetting (IPv4)",
    body_markdown:
      "```\nAnzahl nutzbarer Hosts = 2^h − 2          (h = Anzahl Hostbits = 32 − Präfix)\nAnzahl Subnetze        = 2^s              (s = geliehene Bits)\nNetzadresse            = IP AND Subnetzmaske\nBroadcastadresse       = Netzadresse + alle Hostbits auf 1\nBlockgröße             = 256 − letzter Maskenwert\n```\n\n| Präfix | Maske | Blockgröße | nutzbare Hosts |\n|---|---|---:|---:|\n| /24 | 255.255.255.0 | 256 | 254 |\n| /25 | 255.255.255.128 | 128 | 126 |\n| /26 | 255.255.255.192 | 64 | 62 |\n| /27 | 255.255.255.224 | 32 | 30 |\n| /28 | 255.255.255.240 | 16 | 14 |\n| /29 | 255.255.255.248 | 8 | 6 |\n| /30 | 255.255.255.252 | 4 | 2 |\n\n**Beispiel (F2026 2a):** 192.168.16.52/25 → Maske 255.255.255.128, Blockgröße 128\n→ Netz **192.168.16.0**, Broadcast **192.168.16.127**, Hosts **126**\n\n**Beispiel (F2025 1d):** 192.168.100.0/26 → Hostbereich .1 bis .62, Broadcast .63\nGateway = letzte nutzbare = .62 → **vorletzte = 192.168.100.61**\n\n**Adressbereiche, die abgefragt werden:**\n- privat: 10.0.0.0/8 · 172.16.0.0/12 · **192.168.0.0/16** → nicht im Internet routbar (F2026 3da)\n- **APIPA: 169.254.0.0/16** → Gerät hat keinen DHCP-Server erreicht (H2024 1da)\n- Loopback: 127.0.0.1 bzw. `::1`\n\n---",
  },
  {
    id: "10-ipv6",
    order: 10,
    title: "IPv6",
    body_markdown:
      "- Länge **128 Bit**, hexadezimal, 8 Blöcke à 16 Bit, durch `:` getrennt\n- Kürzungsregeln: führende Nullen weglassen; **eine** Folge von Nullblöcken durch `::` ersetzen\n- Standardpräfix **/64**: erste 64 Bit = Netz, letzte 64 Bit = **Interface-Identifier**\n- `fe80::/10` = **Link-Local**, wird automatisch erzeugt (SLAAC), auch ohne Konfiguration\n- Anzahl Subnetze bei 48-Bit-Standortpräfix und 16-Bit-Subnetz-ID = **2¹⁶**\n- Parallelbetrieb mit IPv4: **Dual-Stack** (beide Adressen gleichzeitig) oder **Tunneling** (IPv6-Pakete in IPv4 gekapselt)\n\n**Beispiel (F2024 2c):** `fe80::521a:c5ff:fef2:38b7`\n→ ungekürzt `fe80:0000:0000:0000:521a:c5ff:fef2:38b7`, Präfixlänge 64, Interface-ID `521a:c5ff:fef2:38b7`\n\n---",
  },
  {
    id: "11-netzplantechnik",
    order: 11,
    title: "Netzplantechnik",
    body_markdown:
      "```\nVorwärtsrechnung : FEZ = FAZ + Dauer\n                   FAZ des Nachfolgers = größter FEZ aller Vorgänger\nRückwärtsrechnung: SAZ = SEZ − Dauer\n                   SEZ des Vorgängers = kleinster SAZ aller Nachfolger\nGesamtpuffer     : GP = SAZ − FAZ  =  SEZ − FEZ\nFreier Puffer    : FP = kleinster FAZ der Nachfolger − FEZ\nKritischer Pfad  : alle Vorgänge mit GP = 0\n```\n\nReihenfolge beim Rechnen: **erst komplett vorwärts durch den ganzen Plan, dann komplett rückwärts, danach erst die Puffer.**\n\n*Belegt: H2021 1c (14 P), H2023 4b, F2025 3aa (9 P), F2026 2e (Fehlersuche).*\n\n**Typische Falle:** Bei mehreren Vorgängern ist FAZ das **Maximum**, bei mehreren Nachfolgern ist SEZ das **Minimum**.\n\n---",
  },
  {
    id: "12-verf-gbarkeit",
    order: 12,
    title: "Verfügbarkeit",
    body_markdown:
      "```\nVerfügbarkeit [%] = (Gesamtzeit − Ausfallzeit) / Gesamtzeit × 100\n```\n(In den analysierten AP1-Prüfungen nicht als Rechenaufgabe belegt – Verfügbarkeit kam nur als **Schutzziel** vor. Deshalb: kennen, aber nicht üben.)\n\n---",
  },
  {
    id: "13-sonstige-belegte-rechenwege",
    order: 13,
    title: "Sonstige belegte Rechenwege",
    body_markdown:
      "- **Kapazitätsrechnung** (H2021 3bb): 20 Postfächer × 2 h = 40 h ÷ 8 h/Tag ÷ 2 Mitarbeiter = 2,5 → 3 Tage\n- **Stückzahl aus Bahnlänge** (H2022 2a): 30,48 m/min ÷ 0,3048 m = 100 Aufnahmen/min × 60 × 12 h = 72.000/Tag\n- **Netzteil dimensionieren** (F2024 3e): Σ Leistungsaufnahmen × 1,1 → nächste verfügbare Stufe\n- **Taktfrequenz** (F2022 2gc): 3,4 GHz = 3.400.000.000 Hz\n- **Datenraten-Faktor** (ZP 2018 2.9): 5 Gbit/s ÷ 480 Mbit/s = 10,42\n- **Ratendarlehen** (H2024 3a): Zinsen = Restschuld × Zinssatz; Tilgung = Darlehen / Laufzeit; Zahlung = Tilgung + Zinsen\n\n---",
  },
  {
    id: "kontrollritual-f-r-jede-rechenaufgabe",
    order: 99,
    title: "Kontrollritual für jede Rechenaufgabe",
    body_markdown:
      "1. Gesuchte **Einheit** aus der Aufgabenstellung markieren (MiB? TiB? Mbit/s? mA? EUR?).\n2. Alle gegebenen Werte in **eine** Einheitenfamilie bringen.\n3. Rechnen.\n4. **Rundungsvorgabe** anwenden (auf / ab / kaufmännisch, Anzahl Stellen).\n5. **Rückrechnen**: Ergebnis in die Formel einsetzen und prüfen, ob der Ausgangswert herauskommt.\n6. Rechenweg stehen lassen – dafür gibt es Teilpunkte.",
  },
];
