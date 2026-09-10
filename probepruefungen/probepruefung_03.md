# Probeprüfung 03 — Schwerpunkt: etwas über dem erwarteten Niveau

**Teil 1 der Abschlussprüfung · Einrichten eines IT-gestützten Arbeitsplatzes**
4 Aufgaben · 90 Minuten Prüfungszeit · 100 Punkte

> Diese Probeprüfung liegt bewusst etwas über dem erwarteten Schwierigkeitsgrad.
> Wenn du hier 60 Punkte erreichst, bist du für den Ernstfall gut aufgestellt.
> Lösungen getrennt unter `loesungen/probepruefung_03_loesung.md`.

---

## Ausgangssituation

Sie sind Auszubildender bei der **Novatex IT-Solutions GmbH**. Der Kunde **Hafenlogistik Wendt KG**
rüstet sein Terminal auf ein videogestütztes Zutritts- und Verladesystem um.
Sie betreuen die technische Planung.

---

## 1. Aufgabe (25 Punkte)

Für das Terminal werden Außenkameras beschafft. Aus dem Datenblatt:

```
Specifications
  Maximum resolution & frame rate   3840 x 2160 @ 30 fps
  Colour depth                      24 bit
  Power consumption                 Typical: 12 W
                                    Max. with heater and IR: 51 W
  Power source                      PoE, IEEE 802.3 compliant switch required
  Connection                        IEEE 802.3 10/100/1000 Ethernet
  Note                              The device ships without a default password.
```

**a)** Die Kamera soll in der Betriebsart „max. with heater and IR" über das Netzwerkkabel mit Strom
versorgt werden. Wählen Sie aus der folgenden Tabelle den passenden Standard aus und berechnen Sie
die zu erwartende maximale Stromstärke in **mA** bei einer Spannung von **48 V**. **4 Punkte**

| Leistung am Port | Standard |
|---|---|
| bis 15,4 W | IEEE 802.3af |
| bis 30,0 W | IEEE 802.3at |
| bis 60,0 W | IEEE 802.3bt (Type 3) |
| bis 90,0 W | IEEE 802.3bt (Type 4) |

**b)** Der Stream soll mit der maximalen Auflösung und Bildrate übertragen und dabei auf **5 %**
komprimiert werden.
Berechnen Sie die erforderliche Datenübertragungsrate in Mbit/s. Runden Sie auf volle Mbit/s auf.
Der Rechenweg ist anzugeben. **4 Punkte**

**c)** Es werden **acht** Kameras betrieben, die Aufnahmen werden **30 Tage** vorgehalten.
Berechnen Sie die notwendige Speicherkapazität in **TiB**. Runden Sie auf.
Falls Sie b) nicht lösen konnten, rechnen Sie mit **299 Mbit/s**.
Der Rechenweg ist anzugeben. **5 Punkte**

**d)** Das Tagesarchiv **einer** Kamera soll über eine Gigabit-Leitung (1 Gbit/s) in ein Rechenzentrum
übertragen werden. Berechnen Sie die reine Übertragungsdauer und geben Sie sie in Stunden, Minuten
und Sekunden an. Der Rechenweg ist anzugeben. **5 Punkte**

**e)** Im Datenblatt steht: *„The device ships without a default password."*
Beschreiben Sie zwei mögliche Konsequenzen dieser Voreinstellung. **4 Punkte**

**f)** Nennen Sie den Zweck, warum die Kamera in einer Variante mit Heizung angeboten wird. **1 Punkt**

**g)** Die Kameras sollen über einen einzigen Switch versorgt werden. Nennen Sie zwei Angaben, die Sie
für die Auswahl dieses Switches zwingend benötigen. **2 Punkte**

---

## 2. Aufgabe (25 Punkte)

**a)** Ein Kollege hat den folgenden Netzplan bereits ausgefüllt. Die zugrunde liegende Vorgangsliste lautet:

| Vorgang | Dauer | Vorgänger |
|---|---:|---|
| A | 2 | – |
| B | 5 | A |
| C | 3 | A |
| D | 4 | B |
| E | 6 | B, C |
| F | 2 | D |
| G | 3 | E |
| H | 2 | F, G |

Die eingetragenen Werte des Kollegen:

| Vorgang | FAZ | FEZ | SAZ | SEZ | GP | FP |
|---|---:|---:|---:|---:|---:|---:|
| A | 0 | 2 | 0 | 2 | 0 | 0 |
| B | 2 | 7 | 2 | 7 | 0 | 0 |
| C | 2 | 5 | 2 | 7 | 2 | 2 |
| D | 7 | 11 | 10 | 14 | 4 | 0 |
| E | 7 | 13 | 7 | 13 | 0 | 0 |
| F | 11 | 13 | 14 | 16 | 3 | 0 |
| G | 13 | 16 | 13 | 16 | 0 | 0 |
| H | 16 | 18 | 16 | 18 | 0 | 0 |

Der Kollege hat **genau drei Werte falsch** eingetragen. Alle übrigen Werte sind korrekt.

Finden Sie die drei Fehler und tragen Sie sie in die folgende Tabelle ein. **9 Punkte**

| Nr. | Vorgang | falsches Feld | eingetragener Wert | korrekter Wert |
|---:|---|---|---:|---:|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**b)** Geben Sie die Projektdauer an und nennen Sie die Vorgänge des kritischen Pfads. **2 Punkte**

**c)** Für das Projekt wird ein Angebot kalkuliert:

- 18 Kameras zu je 489,00 EUR netto
- 4 PoE-Switches zu je 1.290,00 EUR netto
- 1 Aufzeichnungsserver zu 2.450,00 EUR netto
- 3 Arbeitstage Montage zu je 640,00 EUR netto

Berechnen Sie den Nettobetrag und den Bruttobetrag bei 19 % Umsatzsteuer.
Der Rechenweg ist anzugeben. **5 Punkte**

**d)** Zusätzlich wird ein Wartungsvertrag über **5 Jahre** zu **1.180,00 EUR netto pro Jahr** angeboten.
Berechnen Sie die Gesamtkosten über fünf Jahre netto und brutto. **4 Punkte**

**e)** Die Hafenlogistik Wendt KG überlegt, die Anlage stattdessen zu leasen.
Beschreiben Sie drei Vorteile der Beschaffung über Leasing. **3 Punkte**

**f)** Nennen Sie zwei Möglichkeiten, die nach Ablauf der Leasingdauer bestehen. **2 Punkte**

---

## 3. Aufgabe (25 Punkte)

Für die Abrechnung der Softwarelizenzen wird eine Funktion entwickelt.

**a)** Die Klasse `LizenzRechner` soll folgende Attribute besitzen:

- `preisBasis` — Preis einer Basis-Lizenz in EUR
- `preisPro` — Preis einer Pro-Lizenz in EUR
- `preisEnterprise` — Preis einer Enterprise-Lizenz in EUR
- `rabattGrenze` — Betrag, ab dem ein Nachlass gewährt wird

Alle Attribute haben den Datentyp `double` und sind **privat**.
Die öffentlich sichtbare Methode `berechneKosten(kunden: List<Kunde>): double` ist bereits vorgegeben.

Erstellen Sie das UML-Klassendiagramm mit Klassenname, Attributen, Datentypen und Sichtbarkeiten. **5 Punkte**

**b)** Die Kosten werden mit folgender Funktion berechnet:

```
FUNKTION berechneKosten(positionen)
    gesamt = 0
    FÜR JEDE position IN positionen
        typ  = position["typ"]
        anz  = position["anzahl"]

        WENN typ = "Basis" DANN
            kosten = anz * 9.50
        SONST WENN typ = "Pro" DANN
            kosten = anz * 21.00
        SONST
            kosten = anz * 48.00
        ENDE WENN

        WENN anz >= 10 DANN
            kosten = kosten * 0.85
        SONST WENN anz >= 5 DANN
            kosten = kosten * 0.95
        ENDE WENN

        gesamt = gesamt + kosten
    ENDE FÜR

    WENN gesamt > 400 DANN
        gesamt = gesamt - 25
    ENDE WENN

    RÜCKGABE gesamt
ENDE FUNKTION
```

Gegeben sind folgende Positionen:

```
positionen = [
    { "typ": "Basis",      "anzahl": 3  },
    { "typ": "Pro",        "anzahl": 7  },
    { "typ": "Basis",      "anzahl": 12 },
    { "typ": "Pro",        "anzahl": 4  },
    { "typ": "Enterprise", "anzahl": 2  }
]
```

Ermitteln Sie die Kosten jeder einzelnen Position und den Endbetrag.
Legen Sie eine Wertetabelle an. Der Rechenweg ist anzugeben. **10 Punkte**

**c)** Erläutern Sie den wesentlichen Unterschied zwischen einer Compiler- und einer Interpretersprache. **3 Punkte**

**d)** Nennen Sie zwei Vorteile objektorientierter gegenüber prozeduraler Programmierung. **2 Punkte**

**e)** Ergänzen Sie das Entity-Relationship-Modell für folgenden Sachverhalt.
Kennzeichnen Sie die Primärschlüssel und geben Sie die Kardinalitäten an. **5 Punkte**

> Ein Kunde kann mehrere Lizenzen besitzen, eine Lizenz gehört zu genau einem Kunden.
> Gespeichert werden: Kundennummer, Firmenname, Ansprechpartner sowie
> Lizenznummer, Lizenztyp, Gültigkeitsbeginn und Gültigkeitsende.

---

## 4. Aufgabe (25 Punkte)

**a)** Die Aufnahmen des Parkplatzes vor dem Terminal erfassen auch öffentlich zugängliche Flächen.
Nennen Sie zwei rechtliche Vorgaben, die dabei zu beachten sind. **2 Punkte**

**b)** Nennen Sie eine rechtliche Grundlage für den Umgang mit personenbezogenen Daten und
beschreiben Sie deren Zweck. **3 Punkte**

**c)** Der Betriebsleiter erhält von einem Dienstleister einen öffentlichen Schlüssel zur
verschlüsselten Kommunikation.

- **ca)** Beschreiben Sie in vier Schritten den Ablauf, wenn der Betriebsleiter eine vertrauliche
  E-Mail an den Dienstleister senden möchte. **4 Punkte**
- **cb)** Nennen Sie das damit erreichte IT-Schutzziel. **1 Punkt**
- **cc)** Nennen Sie einen Vorteil und einen Nachteil der asymmetrischen gegenüber der
  symmetrischen Verschlüsselung. **2 Punkte**

**d)** Auf der Herstellerseite wird neben der Installationsdatei ein SHA-256-Hashwert veröffentlicht.
Erläutern Sie den Zweck dieses Hashwerts. **3 Punkte**

**e)** Zum Thema Absicherung finden Sie folgenden englischen Herstellertext:

> *Before connecting the system to your production network, apply the following measures.
> Replace all factory-set credentials with individual passwords. Segment the camera network from
> the office LAN by using a separate VLAN. Keep the firmware up to date, since outdated firmware is
> the most common entry point for attackers. Restrict administrative access to a defined range of
> management workstations. Finally, enable logging so that unauthorised access attempts can be traced
> afterwards.*

Nennen Sie **fünf** Sicherheitsmaßnahmen, die in diesem Text beschrieben werden. **5 Punkte**

**f)** Der Betriebsleiter schlägt vor, allen Mitarbeitern Administratorrechte zu geben,
damit sie sich seltener beim Support melden müssen.
Erläutern Sie einen Grund, warum dieses Vorgehen aus Sicherheitsgründen nicht zu empfehlen ist. **3 Punkte**

**g)** Nennen Sie zwei Maßnahmen, mit denen die Verfügbarkeit des Aufzeichnungsservers erhöht werden kann. **2 Punkte**

---

*Ende der Probeprüfung 03*
