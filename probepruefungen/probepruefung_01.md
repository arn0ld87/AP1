# Probeprüfung 01 — Schwerpunkt: wahrscheinlichste Aufgaben

**Teil 1 der Abschlussprüfung · Einrichten eines IT-gestützten Arbeitsplatzes**
4 Aufgaben · 90 Minuten Prüfungszeit · 100 Punkte

> Hilfsmittel: nicht programmierbarer Taschenrechner. Rechenwege sind anzugeben.
> Halte dich an die geforderte Anzahl von Antworten — es werden nur die ersten gewertet.
> Die Lösungen liegen getrennt unter `loesungen/probepruefung_01_loesung.md`. **Erst nach der Bearbeitung öffnen.**

---

## Ausgangssituation

Sie sind Auszubildender im Systemhaus **NordTec IT-Service GmbH**. Das Unternehmen betreut kleine und
mittlere Betriebe von der Hardwarebeschaffung bis zur laufenden Betreuung.

Ihr Kunde, die **VeloWerk GmbH**, stellt Komponenten für E-Bikes her und bezieht eine neue
Fertigungshalle mit angeschlossenem Lager. Die NordTec IT-Service GmbH erhält den Auftrag,
die IT-Infrastruktur zu planen und einzurichten. Sie arbeiten in diesem Projekt mit.

---

## 1. Aufgabe (25 Punkte)

Für den Umzug in die neue Halle wird die Terminplanung erstellt.

**a)** Nennen Sie vier Merkmale, an denen man erkennt, dass es sich bei dem Umzug um ein Projekt handelt. **4 Punkte**

**b)** Für die Terminplanung wurde die folgende Vorgangsliste erstellt.

| Vorgang | Beschreibung | Dauer (Tage) | Vorgänger |
|---|---|---:|---|
| A | Ist-Analyse | 3 | – |
| B | Soll-Konzept | 4 | A |
| C | Beschaffung Hardware | 6 | B |
| D | Strukturierte Verkabelung | 5 | B |
| E | Serverinstallation | 4 | C, D |
| F | Clients einrichten | 3 | E |
| G | Mitarbeiterschulung | 2 | F |
| H | Dokumentation | 2 | E |
| I | Abnahme und Übergabe | 1 | G, H |

Ermitteln Sie für alle Vorgänge FAZ, FEZ, SAZ, SEZ, GP und FP.
Tragen Sie die Werte in eine Tabelle ein. **12 Punkte**

Hinweis: FAZ = frühester Anfangszeitpunkt · FEZ = frühester Endzeitpunkt ·
SAZ = spätester Anfangszeitpunkt · SEZ = spätester Endzeitpunkt ·
GP = Gesamtpuffer (= SAZ − FAZ) · FP = freier Puffer (= FAZ des Nachfolgers − FEZ)

**c)** Geben Sie die Projektdauer in Tagen an und nennen Sie die Vorgänge des kritischen Pfads. **3 Punkte**

**d)** Die Verkabelung (Vorgang D) verzögert sich um zwei Tage.
Beschreiben Sie die Auswirkung auf das Projektende und begründen Sie Ihre Antwort. **2 Punkte**

**e)** Grundlage des Auftrags ist ein Lastenheft der VeloWerk GmbH.
Benennen Sie vier inhaltliche Aspekte, die üblicherweise in einem Lastenheft enthalten sind. **4 Punkte**

---

## 2. Aufgabe (25 Punkte)

Im Lager sollen Überwachungskameras installiert und ein neuer Server beschafft werden.

**a)** Die Kameras nehmen mit einer Auflösung von **2560 × 1440** Bildpunkten bei einer Farbtiefe von
**24 Bit** und **25 Bildern pro Sekunde** auf. Das Material wird auf **8 %** komprimiert.

Berechnen Sie die erforderliche Datenübertragungsrate **pro Kamera in Mbit/s**.
Runden Sie das Ergebnis auf volle Mbit/s auf. Der Rechenweg ist anzugeben. **4 Punkte**

**b)** Es werden **sechs** Kameras installiert. Die Aufnahmen sollen **14 Tage** gespeichert werden.

Berechnen Sie die erforderliche Speicherkapazität in **TiB**. Runden Sie auf volle TiB auf.
Falls Sie Aufgabe a) nicht lösen konnten, rechnen Sie mit **177 Mbit/s**.
Der Rechenweg ist anzugeben. **5 Punkte**

**c)** Für den Serverraum stehen zwei Netzteilvarianten zur Auswahl. Die Serverkomponenten benötigen
im Betrieb durchgehend **450 W**. Der Server läuft an **365 Tagen je 24 Stunden**.
Der Strompreis beträgt **0,34 EUR/kWh**.

| | Variante A | Variante B |
|---|---|---|
| Wirkungsgrad des Netzteils | 82 % | 94 % |
| Anschaffungspreis | 260 EUR | 400 EUR |

Berechnen Sie für **Variante A** die aus dem Netz bezogene Leistung und die jährlichen Stromkosten.
Der Rechenweg ist anzugeben. **5 Punkte**

**d)** Berechnen Sie, nach wie vielen **Monaten** sich der Mehrpreis der Variante B amortisiert hat.
Der Rechenweg ist anzugeben. **4 Punkte**

**e)** In der Werkstatt sollen folgende Geräte über eine einzige Mehrfachsteckdose mit der Aufschrift
„maximal 16 A" betrieben werden:

- 3 Arbeitsplatzrechner mit je 220 W maximaler Leistungsaufnahme
- 1 Laserdrucker mit 1.100 W
- 1 Wasserkocher mit 2.200 W

Weisen Sie durch eine Rechnung nach, dass diese Geräte nicht gleichzeitig betrieben werden können. **4 Punkte**

**f)** Nennen Sie drei weitere Maßnahmen zur Senkung der Energiekosten an IT-Arbeitsplätzen. **3 Punkte**

---

## 3. Aufgabe (25 Punkte)

Sie richten die Netzwerkkonfiguration der neuen Arbeitsplätze ein.

**a)** Einem Arbeitsplatzrechner wurde die Adresse **172.20.48.137/26** zugewiesen.

Ermitteln Sie:
- Subnetzmaske in Dezimalschreibweise
- Netzadresse
- Broadcast-Adresse
- erste und letzte nutzbare Hostadresse
- Anzahl nutzbarer IP-Adressen

**6 Punkte**

**b)** Das Netz **172.20.48.0/24** soll vollständig in Subnetze mit dem Präfix **/26** aufgeteilt werden.
Geben Sie an, wie viele Subnetze dabei entstehen, und begründen Sie Ihre Antwort. **2 Punkte**

**c)** Ergänzen Sie die leeren Felder der folgenden Tabelle. Geben Sie pro Feld jeweils nur ein
passendes Beispiel an. **5 Punkte**

| OSI-Schicht Nr. | Schichtname | Verwendete Protokolle | Verwendete Adressen | Möglicher Fehler |
|---:|---|---|---|---|
| 7 | | | – | |
| 3 | | | | |
| 2 | Sicherung | Ethernet | MAC-Adressen | Netzwerkkarte defekt |
| 1 | | – | – | |

**d)** Bei der Analyse eines PCs wird Ihnen die IP-Adresse **169.254.87.13** angezeigt,
obwohl im Netz ein DHCP-Server betrieben wird.

Begründen Sie diese Anzeige und nennen Sie zwei mögliche Ursachen. **3 Punkte**

**e)** Nennen Sie zu jedem der folgenden Fehler eine mögliche Überprüfung und eine Fehlerbehebung. **6 Punkte**

| Möglicher Fehler | Mögliche Überprüfung | Fehlerbehebung |
|---|---|---|
| Gateway-Adresse ist falsch | Beispiel: Gateway mit `ipconfig /all` prüfen | Beispiel: korrekte Gateway-Adresse zuweisen lassen |
| Patchkabel ist defekt | | |
| Netzwerkdose ist nicht gepatcht | | |
| Namensauflösung funktioniert nicht | | |

**f)** Die Kameras erhalten Adressen aus dem Bereich 192.168.30.0/24.
Beschreiben Sie, wie sich diese Adressen hinsichtlich ihrer Erreichbarkeit aus dem Internet verhalten. **3 Punkte**

---

## 4. Aufgabe (25 Punkte)

Die VeloWerk GmbH beauftragt Sie, Datenschutz und Datensicherheit zu bewerten.

**a)** Ordnen Sie jeder Sicherheitsmaßnahme genau ein Schutzziel zu (Vertraulichkeit, Integrität
oder Verfügbarkeit) und geben Sie jeweils eine Begründung an. **8 Punkte**

| Sicherheitsmaßnahme | Schutzziel | Begründung |
|---|---|---|
| Verschlüsselung der Notebook-Festplatten | | |
| Tägliche Datensicherung der Konstruktionsdaten | | |
| Prüfsummenvergleich nach dem Software-Download | | |
| Unterbrechungsfreie Stromversorgung im Serverraum | | |

**b)** Die Personalabteilung möchte wissen, für welche Art von Daten ein besonderer gesetzlicher
Schutz vorgeschrieben ist. Geben Sie Auskunft und benennen Sie eine rechtliche Grundlage. **3 Punkte**

**c)** Nennen Sie zwei Kriterien für ein sicheres Passwort und begründen Sie jeweils, warum das
Kriterium die Sicherheit erhöht. **4 Punkte**

**d)** In der Buchhaltung häufen sich verdächtige E-Mails.

- **da)** Nennen Sie drei Anzeichen, an denen ein Anwender eine Phishing-Mail erkennen kann. **3 Punkte**
- **db)** Nennen Sie zwei technische oder organisatorische Maßnahmen, die das Unternehmen zum Schutz vor Phishing ergreifen kann. **2 Punkte**

**e)** Die Konstruktionsdaten werden derzeit freitags beim Herunterfahren auf eine zweite Partition
derselben Festplatte gesichert.

- **ea)** Beschreiben Sie zwei Risiken dieses Vorgehens. **2 Punkte**
- **eb)** Unterbreiten Sie einen konkreten Verbesserungsvorschlag. **3 Punkte**

---

*Ende der Probeprüfung 01*
