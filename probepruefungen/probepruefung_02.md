# Probeprüfung 02 — Schwerpunkt: realistische gemischte Prüfung

**Teil 1 der Abschlussprüfung · Einrichten eines IT-gestützten Arbeitsplatzes**
4 Aufgaben · 90 Minuten Prüfungszeit · 100 Punkte

> Lösungen getrennt unter `loesungen/probepruefung_02_loesung.md`. **Erst nach der Bearbeitung öffnen.**

---

## Ausgangssituation

Sie sind Auszubildender bei der **DataFlow Systemhaus AG**. Ihr Kunde, die **Stadtwerke Bergheim**,
richtet ein neues Kundenzentrum ein. Sie sind dem Team zugeteilt, das Beschaffung, Hardware,
Netzwerk und die Datenhaltung verantwortet.

---

## 1. Aufgabe (26 Punkte)

Für das Kundenzentrum werden **24 Notebooks** beschafft. Drei Angebote liegen vor.

| | TecPoint GmbH | ByteDirekt AG | NordCom KG |
|---|---|---|---|
| Listenpreis pro Stück | 1.250 EUR | 1.190 EUR | 1.320 EUR |
| Rabatt | 3 % | – | 5 % |
| Lieferkosten pro Stück | 18 EUR | 12 EUR | 0 EUR |
| Bezugspreis pro Stück | | | |
| Lieferzeit | 4 Wochen | 2 Wochen | 3 Wochen |
| Qualität | gut | durchschnittlich | sehr gut |
| Kundenrückmeldungen | gelegentlich Reklamationen | Lieferung ohne Beanstandung | sehr gutes Kulanzverhalten |

**a)** Berechnen Sie den Bezugspreis pro Stück für alle drei Anbieter. Der Rechenweg ist anzugeben. **3 Punkte**

**b)** Bewerten Sie die Anbieter je Kriterium mit einer Skala von **1 (schwach) bis 3 (sehr gut)** und
führen Sie mit den folgenden Gewichtungen einen gewichteten Angebotsvergleich durch.
Entscheiden Sie sich anschließend begründet für einen Lieferanten. **10 Punkte**

| Kriterium | Gewichtung | TecPoint GmbH | ByteDirekt AG | NordCom KG |
|---|---:|---|---|---|
| Bezugspreis | 10 | | | |
| Lieferzeit | 6 | | | |
| Qualität | 8 | | | |
| Service / Erfahrung | 4 | | | |
| **Summe** | | | | |

**c)** Der ausgewählte Anbieter legt folgendes Angebot vor:

- 24 Notebooks zum ermittelten Bezugspreis, Nutzungsdauer **4 Jahre**
- 24 Dockingstationen zu je 180 EUR, Nutzungsdauer **3 Jahre**
- Softwaremiete 22 EUR pro Monat und Arbeitsplatz
- Wartungspauschale 2.880 EUR pro Jahr für alle Geräte

Berechnen Sie die **laufenden Kosten pro Monat** für die gesamte Ausstattung.
Der Rechenweg ist anzugeben. **7 Punkte**

**d)** Die Notebooks wurden am 12. Mai bestellt. Eine Auftragsbestätigung gibt es nicht.
Geliefert wurde am 3. Juni, die Rechnung ging am 5. Juni ein.
Erläutern Sie, zu welchem Zeitpunkt der Kaufvertrag zustande gekommen ist, und begründen Sie Ihre Entscheidung. **2 Punkte**

**e)** Nennen Sie zwei Kaufvertragsstörungen und geben Sie zu jeder eine Maßnahme an,
mit der der Kunde ihr vorbeugen kann. **4 Punkte**

---

## 2. Aufgabe (24 Punkte)

Im Serverraum wird ein neues Speichersystem aufgebaut.

**a)** Verfügbar sind **3 Festplatten à 6 TB** und **5 Festplatten à 4 TB** sowie ein RAID-Controller.
Mit allen Platten soll eine fehlertolerante **RAID-5**-Konfiguration mit größtmöglicher
Nettospeicherkapazität erstellt werden.

Berechnen Sie die Nettospeicherkapazität in TB. Der Rechenweg ist anzugeben. **4 Punkte**

**b)** Berechnen Sie zum Vergleich die Nettospeicherkapazität derselben Platten als **RAID 6**
und als **JBOD**. Der Rechenweg ist anzugeben. **4 Punkte**

**c)** Erklären Sie die Grundfunktion von RAID 1, RAID 5 und RAID 10 und geben Sie jeweils an,
wie viele Festplatten ausfallen dürfen. **6 Punkte**

**d)** Ein Kollege sagt: „Mit dem RAID brauchen wir kein Backup mehr."
Nehmen Sie begründet Stellung. **2 Punkte**

**e)** Nennen Sie drei Vorteile einer SSD gegenüber einer HDD. **3 Punkte**

**f)** Für einen Arbeitsplatzrechner soll das Netzteil ausgewählt werden. Netzteile stehen von
400 W bis 1.200 W in 50-W-Schritten zur Verfügung. Zur ermittelten Leistungsaufnahme ist ein
Puffer von **15 %** hinzuzurechnen.

| Komponente | max. Leistungsaufnahme je Stück | Anzahl |
|---|---:|---:|
| Prozessor | 125 W | 1 |
| Grafikkarte | 220 W | 1 |
| Mainboard inkl. RAM | 60 W | 1 |
| SSD | 8 W | 2 |
| Gehäuselüfter | 4 W | 3 |

Berechnen Sie die Leistungsaufnahme mit Puffer und benennen Sie das auszuwählende Netzteil. **5 Punkte**

---

## 3. Aufgabe (25 Punkte)

**a)** Einem Server wurde die Adresse **10.42.16.200/27** zugewiesen.
Ermitteln Sie Subnetzmaske, Netzadresse, Broadcast-Adresse, erste und letzte nutzbare Hostadresse
sowie die Anzahl nutzbarer IP-Adressen. **6 Punkte**

**b)** Geben Sie an, wie viele Subnetze mit dem Präfix /27 aus einem /24-Netz gebildet werden können,
und begründen Sie Ihre Antwort. **2 Punkte**

**c)** Im Kundenzentrum wird zusätzlich IPv6 eingesetzt. Ein Gerät meldet die Adresse
**2001:db8:4f1a:27::8a2/64**.

- **ca)** Geben Sie die Länge einer IPv6-Adresse in Bit an. **1 Punkt**
- **cb)** Geben Sie die Adresse in ungekürzter hexadezimaler Schreibweise an. **2 Punkte**
- **cc)** Nennen Sie die Präfixlänge und den Interface-Identifier. **2 Punkte**

**d)** Nach der Eingabe von `ip addr` erscheint zusätzlich die Adresse `fe80::7a2b:cbff:fe41:9d05`,
die niemand konfiguriert hat. Benennen Sie die Adressart und erklären Sie ihre Herkunft. **2 Punkte**

**e)** Erläutern Sie eine Möglichkeit, IPv4 und IPv6 im selben Netz parallel zu betreiben. **3 Punkte**

**f)** Sie prüfen drei Geräte mit `ping` und erhalten folgende Ergebnisse:

| Gerät | Paketverlust | Mittelwert Antwortzeit |
|---|---:|---:|
| Kasse 1 | 0 % | 3 ms |
| Kasse 2 | 0 % | 512 ms |
| Kasse 3 | 75 % | 18 ms |

Benennen Sie für Kasse 2 und Kasse 3 jeweils den kritischen Wert und beschreiben Sie ein Problem,
das daraus entstehen kann. **4 Punkte**

**g)** Erläutern Sie anhand eines Beispiels die grundlegende Aufgabe des Address Resolution Protocol (ARP). **3 Punkte**

---

## 4. Aufgabe (25 Punkte)

Die Auftragsdaten des Kundenzentrums sollen in einer Datenbank verwaltet werden.

**a)** Erstellen Sie ein Entity-Relationship-Modell für den folgenden Sachverhalt.
Geben Sie alle Attribute, die Primärschlüssel und die Kardinalitäten an. **6 Punkte**

> Ein Kunde kann mehrere Aufträge erteilen. Jeder Auftrag gehört zu genau einem Kunden.
> Zu einem Kunden werden Kundennummer, Name, Vorname und Anschrift gespeichert.
> Zu einem Auftrag werden Auftragsnummer, Auftragsdatum, Betrag und Status gespeichert.

**b)** Die Tabelle `Auftrag` hat die Spalten `AuftragID` (PK), `KundenID`, `Auftragsdatum`,
`Betrag`, `Status`. Geben Sie den jeweils passenden SQL-Befehl an.

- **ba)** Alle Aufträge mit einem Betrag über 500 EUR, absteigend nach Betrag sortiert. **3 Punkte**
- **bb)** Die Anzahl der Aufträge je Status. **3 Punkte**
- **bc)** Die Summe aller Beträge der Aufträge mit dem Status `offen`. **3 Punkte**

**c)** Für die Rechnungsstellung wurde die folgende Funktion entworfen.

```
FUNKTION rechnungsbetrag(positionen)
    summe = 0
    FÜR JEDE position IN positionen
        menge  = position["menge"]
        preis  = position["einzelpreis"]
        zwischensumme = menge * preis
        WENN menge >= 10 DANN
            zwischensumme = zwischensumme * 0.90
        ENDE WENN
        summe = summe + zwischensumme
    ENDE FÜR
    WENN summe > 500 DANN
        summe = summe * 0.95
    ENDE WENN
    RÜCKGABE summe
ENDE FUNKTION
```

Gegeben sind folgende Positionen:

```
positionen = [
    { "menge": 4,  "einzelpreis": 35.00 },
    { "menge": 12, "einzelpreis": 18.50 },
    { "menge": 10, "einzelpreis": 24.00 }
]
```

Ermitteln Sie den Zwischenbetrag je Position und den Endbetrag der Rechnung.
Der Rechenweg ist anzugeben. **7 Punkte**

**d)** Beim Import eines fremden Kundenbestands stellen Sie Redundanzen fest.
Erklären Sie den Begriff und beschreiben Sie ein Problem, das durch Redundanzen entstehen kann. **3 Punkte**

---

*Ende der Probeprüfung 02*
