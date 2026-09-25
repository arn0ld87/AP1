# Prüfungsanalyse-Bericht: Struktur- und Trendanalyse der Fachinformatiker-Abschlussprüfungen (AP1/GHA1)

## 1. Einleitung und strategischer Kontext der Analyse

Der Erfolg in der Fachinformatiker-Abschlussprüfung ist maßgeblich von der Fähigkeit geprägt, strukturelle Muster in der Aufgabenstellung zu erkennen und methodisch sicher zu adressieren. Eine isolierte Reproduktion von auswendig gelerntem Fachwissen greift in der aktuellen Prüfungspraxis zu kurz, da die IHK verstärkt auf den Transfer von Kompetenzen in komplexen Handlungssituationen setzt. Das Verständnis der zugrunde liegenden Logik und der Gewichtung einzelner Themenkomplexe ermöglicht eine gezielte Ressourcenallokation während der Vorbereitungsphase. Die vorliegende Analyse basiert auf einer systematischen Auswertung der Prüfungssätze und Lösungshinweise (GHA1 Fachqualifikation AE/SI) im Zeitraum von Sommer 2020 bis Winter 2021/22. Im Fokus steht dabei die Dokumentation der inhaltlichen Themenverteilung und deren Relevanz für das Gesamtergebnis.

## 2. Thematische Kernbereiche und Häufigkeitsverteilung

Die Auswertung der Prüfungssätze belegt eine hohe inhaltliche Kontinuität. Bestimmte Themenfelder bilden das Rückgrat jeder Fachqualifikationsprüfung, was eine präzise Zeitplanung in der Vorbereitung ermöglicht.

Folgende Kernthemen wurden im Analysezeitraum identifiziert:

- **Projektplanung und Netzplantechnik:** Erstellung von Netzplänen, Ermittlung des kritischen Pfads sowie die Berechnung von Pufferzeiten.
- **Algorithmen und Anwendungslogik:** Entwicklung funktionaler Logikbausteine mittels Pseudocode oder Struktogrammen, häufig im Kontext von Datenverarbeitung (z. B. Lauflängenkodierung).
- **Datenbanken (Modellierung & Abfragen):** Überführung in die 3. Normalform, ER-Modellierung sowie SQL-Abfragen unter Einsatz von JOINs und Aggregatfunktionen.
- **Objektorientierte Konzepte und UML:** Ergänzung von Klassendiagrammen und Sequenzdiagrammen sowie die Anwendung von Entwurfsmustern (MVC, Observer).
- **Netzwerkinfrastruktur (Schwerpunkt SI):** IP-Adressierung, Subnetting und Fehleranalyse in Netzwerkkonfigurationen.

**Strategische Relevanz:** Die quantitative Analyse belegt eine klare Dominanz von Datenbank- und Logikthemen. Während die Datenbankmodellierung (Normalisierung) mit bis zu 21 Punkten ein massives High-Score-Cluster bildet, liegen SQL-Abfragen (SELECT) meist im Bereich von 5 bis 10 Punkten. Da Logikaufgaben (Pseudocode) regelmäßig mit etwa 20 Punkten gewichtet werden, entscheiden diese methodisch anspruchsvollen Bereiche über die finale Notendifferenzierung. Ein Defizit in diesen Kernbereichen kann durch einfache Wissensfragen kaum kompensiert werden.

## 3. Profiling der Aufgabentypen: Von Wissen zu Handlungssituationen

Die neue Prüfungsordnung manifestiert eine Verschiebung der Anforderungen: Der reine Wissensabruf wird zunehmend durch komplexe Handlungssituationen ersetzt, die eine aktive Problemlösungskompetenz erfordern.

Basierend auf den Quellen lassen sich vier Aufgabentypen kategorisieren:

1. **Wissen:** Reproduktion von Fachtermini oder Vor-/Nachteilen (z. B. Funktionen eines CMS oder Vorteile eines Wikis).
1. **Rechnen:** Anwendung mathematischer Verfahren, primär bei der Netzplan-Pufferzeitberechnung (GP, FP) oder der Ermittlung von Netz-IDs beim Subnetting.
1. **Analyse:** Identifikation von Fehlern in bestehenden Systemen. Belegt ist dies insbesondere bei SQL-Fehlermeldungen wie *"Cannot delete or update a parent row: a foreign key constraint fails"*, wobei die technische Abhängigkeit zwischen Parent- und Child-Datensätzen erläutert werden muss.
1. **Handlungssituation:** Aktive Entwicklung von Lösungen nach spezifischen Vorgaben, etwa die Konstruktion einer Komprimierungsfunktion (Lauflängenkodierung) in Pseudocode.

**Prüfungsökonomische Einordnung:** Das belegte Verhältnis zeigt, dass die Erstellungsleistung ("Entwickeln Sie...", "Überführen Sie...") die reinen Nennungsaufgaben ("Nennen Sie...", "Beschreiben Sie...") deutlich überwiegt. Methodische Kompetenz ist hierbei die entscheidende Variable: Fachkenntnis ist die Voraussetzung, doch die Fähigkeit, diese in formale Modelle (UML, Code, ERM) zu übersetzen, generiert die eigentliche Punktzahl.

## 4. Punktegewichtung und strukturelle Merkmale

Die Identifikation von „High-Score-Clustern“ ist für das Zeitmanagement essenziell. Eine Fehlpriorisierung bei gering gewichteten Wissensfragen führt oft zu Zeitnot bei den punktstarken Logikaufgaben.

Die folgende Tabelle illustriert die Punktegewichtung zentraler Themen (Beispielwerte aus dem Analysezeitraum):

| Aufgabentyp / Thema | Punktzahl (Beispiel) | Quelle |
|---|---|---|
| Datenbankmodellierung (3. NF) | 21 Punkte | |
| Pseudocode-Logik entwickeln | 20 Punkte | |
| Netzplan erstellen & Kritischer Pfad | 15 Punkte | |
| SQL-Abfragen (komplex/JOINs) | 10 Punkte | |
| Wissensfragen (Wiki/CMS) | 4 - 8 Punkte | |
| UML-Klassendiagramm ergänzen | 6 Punkte | |

**Analyse wiederkehrender Operatoren:** Die IHK nutzt präzise Operatoren, um die Tiefe der Lösung zu steuern. Der Operator „Erläutern Sie die Ursache...“ (z. B. bei Foreign Keys) verlangt explizit die Darstellung technischer Interdependenzen. „Entwickeln Sie nach Vorgabe...“ fungiert als Indikator für eine komplexe Logikaufgabe, bei der die Einhaltung der Randbedingungen (z. B. Mindestanzahl an Zeichen für Komprimierung) direkt in die Bewertung einfließt.

**Typische Themenkombinationen:** Es ist dokumentiert, dass Projektplanung (Netzplan) oft mit einleitenden Wissensfragen zu Kollaborationswerkzeugen (Wiki/CMS) verknüpft wird.

## 5. Längsschnittanalyse: Evolution der Prüfungsinhalte

Die Analyse zeigt eine kontinuierliche Evolution hin zu höheren Abstraktionsebenen und prozessualer Integrität.

- **Abnehmende Relevanz:** Rein hardwareorientierte Wissensfragen und einfache Hardware-Komponentenabfragen treten in den Fachqualifikationen (AE) deutlich zurück.
- **Zunehmende Relevanz:** UML-Diagramme (insbesondere Klassendiagramm und Sequenzdiagramm) sind als Standardwerkzeuge der Analyse etabliert. Entwurfsmuster wie MVC oder Observer werden konsistent geprüft, um das Verständnis moderner Software-Architekturen zu evaluieren.
- **Trend zur Abstraktion:** Die Prüfung setzt verstärkt auf sprachneutrale Logikdarstellungen. Logikaufgaben müssen unabhängig von spezifischen Programmiersprachen in Pseudocode oder Struktogrammen gelöst werden können.
- **Trend zur Datenintegrität:** In Datenbank-Aufgaben verschiebt sich der Fokus von einfachen Abfragen hin zur Sicherstellung der referentiellen Integrität und der korrekten Definition von Constraints.

## 6. Strategische Synthese und Wiederholungsempfehlung

Diese Synthese dient als objektive Entscheidungsgrundlage für eine effiziente Prüfungsvorbereitung.

**Häufigste Themengruppen**

- Datenbanken (Modellierung und SQL).
- Anwendungslogik (Algorithmen-Design).
- Projektmanagement (Netzplanung).

**Häufigste Rechenarten**

- Netzplan-Methodik (FAZ, FEZ, SAZ, SEZ sowie Gesamt- und Freier Puffer).
- IP-Adressierung und Subnetting (Netz-IDs, Subnetzmasken).

**Häufigste Fehlerfallen**

- **Referentielle Integrität:** Unzureichende Erklärung von Foreign-Key-Abhängigkeiten (Fehlermeldung: *"Cannot delete or update a parent row"*).
- **Rundungsvorgaben:** Missachtung der expliziten IHK-Regel: *"Wenn Sie ein gerundetes Ergebnis eintragen und damit weiterrechnen müssen, rechnen Sie... nur mit diesem gerundeten Ergebnis weiter"*.
- **Modellierungs-Details:** Unvollständige Kardinalitäten oder fehlende Primär-/Fremdschlüssel-Kennzeichnungen (PK/FK).

**Themen mit hohem Lernnutzen (High Impact)**

- **Datenbank-Normalisierung:** Hohe Punktzahl (ca. 21 Pkt.) bei klarer methodischer Struktur.
- **SQL-JOINs:** Mittlere Punktzahl bei moderatem Lernaufwand.

**Empfohlene Wiederholungsreihenfolge (nach Impact-Grad)**

1. **Datenbankmodellierung:** Fokus auf 3. Normalform und ER-Modelle (High-Impact: ~20+ Pkt.).
1. **Anwendungslogik:** Training von Pseudocode (Schleifen, Bedingungen) unabhängig von Programmiersprachen (High-Impact: ~20 Pkt.).
1. **Projektplanung:** Routine in der Netzplanberechnung und Pufferermittlung (Medium-Impact: ~15 Pkt.).
1. **UML & Entwurfsmuster:** Verständnis von Klassendiagrammen und MVC-Architekturen.
1. **Wissensbasierte Themen:** Management-Tools und Kooperationssysteme (Low-Impact: 4-8 Pkt.).
