# 02 – Formelsammlung AP1

Nur Formeln, die in den analysierten Prüfungen **tatsächlich gebraucht wurden**.
Quellenangabe = Prüfungstermin und Aufgabennummer, in denen der Rechenweg belegt ist.

---

## 1. Einheiten (die Basis für alles)

| Größe | Umrechnung |
|---|---|
| 1 Byte | 8 bit |
| 1 KiB / MiB / GiB / TiB | × 1024 (binär) – für **Speicher** |
| 1 kB / MB / GB / TB | × 1000 (dezimal) – für **Datenraten und Herstellerangaben von Festplatten** |
| 1 Inch | 2,54 cm |
| 1 kWh | 1.000 W über 1 Stunde |

**Prüfungsfalle Nr. 1:** Datenmenge wird in **MiB/GiB** angegeben, Leitung in **Mbit/s**.
→ Erst in Bit umrechnen (`× 1024 … × 8`), dann durch die **dezimale** Datenrate teilen.
*Belegt: F2022 4e (100 MiB · 1024 · 1024 · 8 / 40.000.000 = 21 s), F2024 4f (1 GiB → 172 s).*

**Prüfungsfalle Nr. 2:** Festplattenhersteller rechnen dezimal, RAID-Aufgaben oft auch.
*Belegt: H2022 2ca – dort steht ausdrücklich TB, nicht TiB.*

---

## 2. Speicherbedarf

```
Speicher [bit] = Breite [px] × Höhe [px] × Farbtiefe [bit]
Speicher [Byte] = Speicher [bit] / 8
```

**Pixel aus dpi:**
```
Pixel = Länge [cm] / 2,54 × dpi
```

**Video / Bildfolge:**
```
Datenrate [bit/s] = Breite × Höhe × Farbtiefe × fps × Kompressionsfaktor
Speicher [bit]    = Datenrate [bit/s] × Zeit [s]
```

**Farbanzahl:**
```
Anzahl Farben = 2^Farbtiefe        (RGB 8 bit/Kanal = 2^24 = 16.777.216)
```

**Beispiel (F2026 1ad/1b):**
1920 × 1080 × 24 bit × 30 fps × 0,3 = 447.897.600 bit/s ≈ **448 Mbit/s**
4 Kameras × 448 Mbit/s × 259.200 s / 8 / 1024⁴ = 52,81 → **53 TiB**

**Beispiel (H2022 2ba):** 50,80 cm / 2,54 × 400 dpi = 8.000 px; 30,48 cm → 4.800 px
8.000 × 4.800 × 16 bit / 8 / 1024 / 1024 = **73,25 MiB pro Scan**

**Typische Falle:** Farbtiefe pro Kanal vs. gesamt. „8 Bit pro Farbkanal" = 24 Bit pro Pixel.

---

## 3. Übertragungszeit

```
t [s] = Datenmenge [bit] / Datenrate [bit/s]
```

- Beim **Hochladen** die **Upload**-Rate verwenden, nicht die Download-Rate (F2022 4e, F2024 4f).
- Rundungsvorgabe beachten („auf volle Sekunden **aufrunden**").
- Ergebnis ggf. in min : s umrechnen (F2024 4f → 2 min 52 s).

**Typische Falle:** Mbit/s ≠ MB/s. Faktor 8.

---

## 4. Elektrische Leistung und Energiekosten

```
P [W]      = U [V] × I [A]              →  I = P / U
P_zu [W]   = P_ab [W] / η               (η = Wirkungsgrad als Dezimalzahl)
E [kWh]    = P [kW] × t [h]
Kosten [€] = E [kWh] × Preis [€/kWh]
```

**Beispiele:**
- H2021 2a: 60 W / 0,43 = **139,53 W**; 180 h × 0,13953 kW × 0,30 €/kWh = **7,53 €/Monat**
- H2021 2d: 16 A × 230 V = **3.680 W** zulässig; angeschlossen 4.140 W → nicht gleichzeitig betreibbar
- F2024 3f: 200 Tage × 9 h × (0,75 kW / 0,9) × 0,5 Auslastung × 0,40 €/kWh = **300 €**
- F2026 1ac: I = 24 W / 48 V = 0,5 A = **500 mA**

**Typische Falle:** Watt vor der Multiplikation in **kW** umrechnen, sonst Faktor 1000 daneben.
**Typische Falle:** Wirkungsgrad wird **geteilt**, nicht multipliziert, wenn die aufgenommene Leistung gesucht ist.

---

## 5. Amortisation und Kostenvergleich

```
Amortisationsdauer = Mehranschaffungskosten / Ersparnis je Periode
Kosten je Monat    = Anschaffung / Nutzungsmonate + laufende Kosten
Gesamtkosten       = Anschaffung + variable Kosten × Menge + Wartung × Perioden
```

**Beispiele:**
- H2021 2b: 100 € / 3,27 €/Monat = 30,58 → **31 Monate** (immer aufrunden!)
- F2024 1b: Monitor 450 € / 48 Monate, PC 720 € / 36 Monate, minus 5 % Rabatt, plus Leasing und Wartung
- F2025 1ac: Gerätekosten / 36 Monate + Druckkosten/Monat + Wartung
- Frühjahr 2021 2.3: Drucker A vs. B über ein Jahr, Differenz bilden

---

## 6. Prozent, MwSt, Kalkulation

```
Bruttopreis          = Nettopreis × 1,19            (19 % USt)
Nettopreis           = Bruttopreis / 1,19
Bezugspreis          = Listenpreis − Rabatt − Skonto + Bezugskosten
Effektiver Stundensatz = Jahreskosten / (Nettoarbeitstage × Stunden pro Tag)
Nettoarbeitstage     = Arbeitstage − Urlaub − Krankheit − Feiertage
```

**Beispiele:**
- H2024 2f: Gesamtkosten über 5 Jahre netto, dann × 1,19
- H2022 1e: 140.000 € / ((260 − 30 − 5 − 5) × 7,8 h)
- H2022 3g: Bareinkaufspreis + Lieferkosten = Bezugspreis pro Stück
- F2022 4c: Eigenentwicklung 1.005.000 € / 10 Jahre = 100.500 €/Jahr ÷ 25 €/Lizenz = **ab 4.020 Lizenzen**

---

## 7. Nutzwertanalyse / gewichteter Angebotsvergleich

```
Teilnutzwert  = Gewichtung × Bewertungspunkte
Gesamtnutzwert = Σ aller Teilnutzwerte je Anbieter
```

Vorgehen:
1. Für jedes Kriterium die Anbieter in eine **Rangfolge** bringen (bester = höchste Punktzahl).
2. Punktwert × Gewichtung je Zelle.
3. Spalten addieren, höchster Gesamtnutzwert gewinnt.
4. **KO-Kriterien zuerst prüfen** – ein Anbieter, der eine Muss-Anforderung verfehlt, scheidet aus, auch wenn er punktbeste wäre (belegt: F2024 1ab – SaaS-Anbieter fällt raus, weil on-premise gefordert ist).

*Belegt: H2022 3g (Ergebnis 64 / 57 / 77), F2024 1aa, F2025 1aa.*

---

## 8. RAID-Kapazitäten

```
RAID 0  : n × k                       (kein Ausfallschutz)
RAID 1  : k                           (Spiegelung, 50 % nutzbar bei 2 Platten)
RAID 5  : (n − 1) × k_kleinste        (1 Platte darf ausfallen)
RAID 6  : (n − 2) × k_kleinste        (2 Platten dürfen ausfallen)
RAID 10 : (n / 2) × k
JBOD    : Σ aller Platten             (kein Schutz, keine gleiche Größe nötig)
```
`n` = Anzahl Platten, `k` = Kapazität der **kleinsten** Platte.

**Beispiel (H2022 2ca):** 2 × 3 TB + 7 × 2 TB, RAID 5 über alle 9 Platten
→ kleinste gemeinsame Kapazität 2 TB → (9 − 1) × 2 TB = **16 TB**
JBOD derselben Platten: 6 TB + 14 TB = **20 TB**

**Typische Falle:** Bei ungleichen Platten zählt bei RAID immer die **kleinste**.

---

## 9. Subnetting (IPv4)

```
Anzahl nutzbarer Hosts = 2^h − 2          (h = Anzahl Hostbits = 32 − Präfix)
Anzahl Subnetze        = 2^s              (s = geliehene Bits)
Netzadresse            = IP AND Subnetzmaske
Broadcastadresse       = Netzadresse + alle Hostbits auf 1
Blockgröße             = 256 − letzter Maskenwert
```

| Präfix | Maske | Blockgröße | nutzbare Hosts |
|---|---|---:|---:|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 |

**Beispiel (F2026 2a):** 192.168.16.52/25 → Maske 255.255.255.128, Blockgröße 128
→ Netz **192.168.16.0**, Broadcast **192.168.16.127**, Hosts **126**

**Beispiel (F2025 1d):** 192.168.100.0/26 → Hostbereich .1 bis .62, Broadcast .63
Gateway = letzte nutzbare = .62 → **vorletzte = 192.168.100.61**

**Adressbereiche, die abgefragt werden:**
- privat: 10.0.0.0/8 · 172.16.0.0/12 · **192.168.0.0/16** → nicht im Internet routbar (F2026 3da)
- **APIPA: 169.254.0.0/16** → Gerät hat keinen DHCP-Server erreicht (H2024 1da)
- Loopback: 127.0.0.1 bzw. `::1`

---

## 10. IPv6

- Länge **128 Bit**, hexadezimal, 8 Blöcke à 16 Bit, durch `:` getrennt
- Kürzungsregeln: führende Nullen weglassen; **eine** Folge von Nullblöcken durch `::` ersetzen
- Standardpräfix **/64**: erste 64 Bit = Netz, letzte 64 Bit = **Interface-Identifier**
- `fe80::/10` = **Link-Local**, wird automatisch erzeugt (SLAAC), auch ohne Konfiguration
- Anzahl Subnetze bei 48-Bit-Standortpräfix und 16-Bit-Subnetz-ID = **2¹⁶**
- Parallelbetrieb mit IPv4: **Dual-Stack** (beide Adressen gleichzeitig) oder **Tunneling** (IPv6-Pakete in IPv4 gekapselt)

**Beispiel (F2024 2c):** `fe80::521a:c5ff:fef2:38b7`
→ ungekürzt `fe80:0000:0000:0000:521a:c5ff:fef2:38b7`, Präfixlänge 64, Interface-ID `521a:c5ff:fef2:38b7`

---

## 11. Netzplantechnik

```
Vorwärtsrechnung : FEZ = FAZ + Dauer
                   FAZ des Nachfolgers = größter FEZ aller Vorgänger
Rückwärtsrechnung: SAZ = SEZ − Dauer
                   SEZ des Vorgängers = kleinster SAZ aller Nachfolger
Gesamtpuffer     : GP = SAZ − FAZ  =  SEZ − FEZ
Freier Puffer    : FP = kleinster FAZ der Nachfolger − FEZ
Kritischer Pfad  : alle Vorgänge mit GP = 0
```

Reihenfolge beim Rechnen: **erst komplett vorwärts durch den ganzen Plan, dann komplett rückwärts, danach erst die Puffer.**

*Belegt: H2021 1c (14 P), H2023 4b, F2025 3aa (9 P), F2026 2e (Fehlersuche).*

**Typische Falle:** Bei mehreren Vorgängern ist FAZ das **Maximum**, bei mehreren Nachfolgern ist SEZ das **Minimum**.

---

## 12. Verfügbarkeit

```
Verfügbarkeit [%] = (Gesamtzeit − Ausfallzeit) / Gesamtzeit × 100
```
(In den analysierten AP1-Prüfungen nicht als Rechenaufgabe belegt – Verfügbarkeit kam nur als **Schutzziel** vor. Deshalb: kennen, aber nicht üben.)

---

## 13. Sonstige belegte Rechenwege

- **Kapazitätsrechnung** (H2021 3bb): 20 Postfächer × 2 h = 40 h ÷ 8 h/Tag ÷ 2 Mitarbeiter = 2,5 → 3 Tage
- **Stückzahl aus Bahnlänge** (H2022 2a): 30,48 m/min ÷ 0,3048 m = 100 Aufnahmen/min × 60 × 12 h = 72.000/Tag
- **Netzteil dimensionieren** (F2024 3e): Σ Leistungsaufnahmen × 1,1 → nächste verfügbare Stufe
- **Taktfrequenz** (F2022 2gc): 3,4 GHz = 3.400.000.000 Hz
- **Datenraten-Faktor** (ZP 2018 2.9): 5 Gbit/s ÷ 480 Mbit/s = 10,42
- **Ratendarlehen** (H2024 3a): Zinsen = Restschuld × Zinssatz; Tilgung = Darlehen / Laufzeit; Zahlung = Tilgung + Zinsen

---

## Kontrollritual für jede Rechenaufgabe

1. Gesuchte **Einheit** aus der Aufgabenstellung markieren (MiB? TiB? Mbit/s? mA? EUR?).
2. Alle gegebenen Werte in **eine** Einheitenfamilie bringen.
3. Rechnen.
4. **Rundungsvorgabe** anwenden (auf / ab / kaufmännisch, Anzahl Stellen).
5. **Rückrechnen**: Ergebnis in die Formel einsetzen und prüfen, ob der Ausgangswert herauskommt.
6. Rechenweg stehen lassen – dafür gibt es Teilpunkte.
