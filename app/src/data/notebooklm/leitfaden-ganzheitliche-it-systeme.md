# Ganzheitliche IT-Systeme: Von der Projektplanung bis zur Netzwerksicherheit

## Introduction

Wie plant man ein IT-Projekt fehlerfrei, strukturiert komplexe Software-Architekturen, normalisiert relationale Datenbanken und sichert Netzwerke gegen Ausfälle? In der modernen IT-Welt greifen Softwareentwicklung, Projektmanagement und Systemintegration nahtlos ineinander. Diese Lektion vermittelt Ihnen das theoretische Fundament und die praktischen Fähigkeiten, um komplexe IT-Herausforderungen strukturiert zu lösen.

**Lernziele:**

- Erstellen und Analysieren von Netzplänen zur Ermittlung des kritischen Pfads.
- Implementieren von robusten Software-Architekturen mit dem MVC- und Observer-Pattern.
- Überführen von Datenbeständen in die 3. Normalform (3NF) und Formulieren von SQL-Abfragen.
- Diagnose von Netzwerkfehlern, Berechnen von IPv6-Subnetzen und Dimensionieren von RAID-Systemen.

## Projektplanung mit der Netzplantechnik

Die Netzplantechnik ist ein mächtiges Werkzeug des Projektmanagements, um zeitliche Abläufe zu visualisieren, Abhängigkeiten darzustellen und Engpässe frühzeitig zu identifizieren.

Jeder Vorgang im Netzplan wird durch einen standardisierten Knoten dargestellt. Dieser enthält:

- **Vorgangs-ID & Beschreibung**
- **Dauer (D):** Die veranschlagte Zeitspanne für die Umsetzung.
- **Frühesten Anfangszeitpunkt (FAZ) & Frühesten Endzeitpunkt (FEZ):** Werden durch die Vorwärtsrechnung ermittelt (FEZ=FAZ+D).
- **Spätesten Anfangszeitpunkt (SAZ) & Spätesten Endzeitpunkt (SEZ):** Werden durch die Rückwärtsrechnung ermittelt (SAZ=SEZ−D).
- **Gesamtpuffer (GP):** Die Zeitspanne, um die ein Vorgang verschoben werden kann, ohne das Projektende zu gefährden (GP=SAZ−FAZ).
- **Freien Puffer (FP):** Die Zeitspanne, um die ein Vorgang verschoben werden kann, ohne den FAZ des Nachfolgers zu beeinflussen.

Der **kritische Pfad** ist die Kette von Vorgängen, bei denen der Gesamtpuffer genau Null ist (GP=0). Verzögerungen bei diesen Vorgängen führen unweigerlich zu einer Verschiebung des Projektendes. Verschiebt sich beispielsweise ein Vorgang außerhalb des kritischen Pfads (z. B. Vorgang E mit einem Gesamtpuffer von 2 Tagen) um 3 Tage, so verschiebt sich das Gesamtprojekt um genau 1 Tag.

## Software-Design-Patterns: MVC und Observer

Um Software wartbar, erweiterbar und testbar zu gestalten, greift man auf bewährte Entwurfsmuster (Design Patterns) zurück.

Das **Model-View-Controller (MVC) Pattern** trennt eine Anwendung in drei Kernbereiche:

1. **Model (Modell):** Verwaltet die Daten und die Geschäftslogik. Es ist unabhängig von der Benutzeroberfläche.
1. **View (Ansicht):** Ist für die Darstellung der Daten auf dem Bildschirm und die Interaktion mit dem Benutzer zuständig.
1. **Controller (Steuerung):** Vermittelt zwischen View und Model. Er nimmt Benutzereingaben von der View entgegen, verarbeitet diese und stößt Änderungen im Model an.

Die Synchronisation zwischen Model und View wird häufig über das **Observer-Pattern (Beobachter-Muster)** realisiert. Hierbei registriert sich die View (als *Observer*) beim Model (als *Subject*).

Sobald sich die Daten im Model ändern (z. B. durch einen Aufruf von `setData`), benachrichtigt das Model über `notifyObservers()` alle registrierten Beobachter. Diese führen daraufhin ihre `update()` -Methode aus, rufen die aktuellen Daten über `getData()` ab und bringen die Anzeige über `display()` auf den neuesten Stand.

## Datenbanken: Normalisierung und SQL-Abfragen

Ein robustes Datenbankdesign verhindert Redundanzen und Anomalien. Die Normalisierung überführt Tabellen schrittweise in ein sauberes relationales Modell:

- **1. Normalform (1NF):** Alle Attribute müssen atomar vorliegen (keine zusammengesetzten Werte oder Listen in einem Feld).
- **2. Normalform (2NF):** Die Tabelle befindet sich in der 1NF und jedes Nicht-Schlüssel-Attribut ist voll funktional abhängig vom gesamten Primärschlüssel (wichtig bei zusammengesetzten Schlüsseln).
- **3. Normalform (3NF):** Die Tabelle befindet sich in der 2NF und es existieren keine transitiven Abhängigkeiten (kein Nicht-Schlüssel-Attribut darf von einem anderen Nicht-Schlüssel-Attribut abhängen).

*Ein anschauliches Beispiel:* Hängt der Name eines Arztes von der Arztnummer ab und diese wiederum vom Patienten-Behandlungs-Datensatz, liegt eine transitive Abhängigkeit vor. In der 3NF wird die Arzt-Entität in eine eigene Tabelle ausgelagert.

**Komplexe SQL-Abfragen formulieren:** Um Daten aus normalisierten Tabellen wieder zusammenzuführen, nutzen wir `JOIN` -Operationen. Sollen beispielsweise alle belegten Betten für einen Zeitraum gefiltert oder freie Betten an einem bestimmten Stichtag ermittelt werden, sind oft verschachtelte Unterabfragen (`Subqueries`) nötig, die Prüfungen auf `NULL` -Werte und Datumsberechnungen kombinieren.

## Netzwerktechnik & IPv6-Subnetzierung

Die Fehlersuche in IP-Netzwerken erfordert einen systematischen Ansatz. Typische Fehlerquellen sind falsch konfigurierte Standardgateways oder vertauschte IP-Adressen für Gateway und DNS-Server.

*Beispiel aus der Praxis:* Ein Client kann keine Hosts außerhalb des eigenen Netzes erreichen, weil als Standardgateway fälschlicherweise die Broadcastadresse eingetragen wurde.

**IPv6-Subnetzierung im Detail:** IPv6-Adressen bieten einen gigantischen Adressraum. Erhält ein Unternehmen vom Provider beispielsweise ein `/56` -Netz (z. B. `2a02:ac20:e0:a000::/56`) und soll dieses in **vier gleich große Subnetze** unterteilen, geht man wie folgt vor:

1. Um vier (22) Netze zu adressieren, werden 2 zusätzliche Bits für den Subnetzanteil benötigt.
1. Die neue Präfixlänge erhöht sich von `/56` auf `/58` (56+2=58).
1. Die Subnetz-IDs verändern sich im entsprechenden Hexadezimalwert an der 57. und 58. Stelle:
  - **Subnetz 1:** `2a02:ac20:e0:a000::/58` (Binär: `0000 0000` -> Hex: `00`)
  - **Subnetz 2:** `2a02:ac20:e0:a040::/58` (Binär: `0100 0000` -> Hex: `40`)
  - **Subnetz 3:** `2a02:ac20:e0:a080::/58` (Binär: `1000 0000` -> Hex: `80`)
  - **Subnetz 4:** `2a02:ac20:e0:a0c0::/58` (Binär: `1100 0000` -> Hex: `c0`)

## IT-Sicherheit, Backup-Strategien & Speicherberechnung

Die Grundwerte der Informationssicherheit werden durch die **CIA-Triade** beschrieben:

- **Confidentiality (Vertraulichkeit):** Autorisierter Zugriff auf Daten (Sicherung durch Verschlüsselung, ACLs).
- **Integrity (Integrität):** Korrektheit und Unveränderlichkeit von Daten (Sicherung durch Hashwerte, Prüfsummen).
- **Availability (Verfügbarkeit):** Ausfallsicherheit der Systeme (Sicherung durch redundante Hardware, Backups).

**Ausfallsicherheit durch RAID-Systeme:** Ein RAID-5-Verbund schützt vor dem Ausfall einer Festplatte, indem Paritätsdaten verteilt auf alle Festplatten geschrieben werden.

*Berechnungsbeispiel:* Ein SAN nutzt 6 Disk-Arrays als RAID-5-Verbund. Jedes Array besitzt 16 Festplatten mit je 3 TiB Kapazität. In jedem Array wird eine Festplatte als Hot-Spare-Platte (inaktive Reserve) vorgehalten.

- **Festplatten im produktiven RAID pro Array:** 15 Festplatten (16 minus 1 Hot-Spare).
- **Nettokapazität pro RAID-5-Array:** Bei RAID-5 geht die Kapazität genau einer Festplatte für Paritätsdaten verloren. Somit verbleiben 15−1=14 Festplatten zur Datenspeicherung.
- **Kapazität je Array:** 14×3 TiB=42 TiB.
- **Gesamtnettogröße des SAN:** 6 Arrays×42 TiB=252 TiB.

## Summary

In dieser Lektion haben wir die wesentlichen Säulen moderner IT-Infrastrukturen kennengelernt:

- **Projektplanung:** Der kritische Pfad bestimmt das Projektende; Pufferzeiten helfen, Verzögerungen abzufangen.
- **Software-Architektur:** MVC strukturiert den Code, während das Observer-Pattern eine lose gekoppelte, ereignisgesteuerte Synchronisation der GUI ermöglicht.
- **Datenbankdesign:** Die 3. Normalform eliminiert Redundanzen und schützt vor Anomalien. Mithilfe von SQL Joins lassen sich verteilte Daten flexibel abfragen.
- **Netzwerk & IP-Infrastruktur:** IPv6-Subnetzierung teilt Netze binär auf. Systematische Fehleranalyse sichert das Zusammenspiel von Gateway, DNS und Routing.
- **Sicherheit & Speicher:** Die CIA-Triade schützt die Unternehmensdaten, RAID-Systeme bieten Hardware-Ausfallsicherheit und ausgeklügelte NTFS-Berechtigungen (Read, Write, Modify) sichern Backup-Verzeichnisse.
