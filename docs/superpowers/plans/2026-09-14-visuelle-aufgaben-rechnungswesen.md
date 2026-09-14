# Visuelle Aufgaben und Rechnungswesen

## Zielbild

Der Trainer wird als technische Prüfungs-Workbench erweitert: bestehende Scalar-Aufgaben bleiben kompatibel, neue strukturierte Aufgaben und fachlich kontrollierte SVG-Visualisierungen teilen sich dieselben Daten wie Prüfung und Lösung. Die bestehende Dark-UI und ihre semantischen Tokens bleiben maßgeblich.

## Batch 1 – Verträge und Visual-System

1. `ap1-tasks.ts` mit discriminated unions für `scalar`, `text`, `table`, `multiField` und `diagram`, typisierten Visual-Daten sowie zentraler Antwortauswertung ergänzen.
2. Wiederverwendbare, responsive und barrierearme React/SVG-Komponenten für ERM, Vorgangsknoten-Netzplan, Gantt und weitere Lernvisuals unter `components/ap1/visuals/` anlegen.
3. Deterministische Fachmodelle für Netzplan/Gantt, BAB und Stufenleiterverfahren testgetrieben implementieren; bekannte, unabhängig berechnete Beispiele als Tests verwenden.

## Batch 2 – Aufgaben-Workspace und Themen

4. Bestehende Generatoren kontrolliert auf `scalar` migrieren; `erm`, `gantt`, `bab` und `stufenleiter` ergänzen und Netzplan auf vollständige Vorgangsknoten umstellen.
5. `/rechnen` auf breite, responsive Task-Renderer mit Tabellenzellen, Multi-Field-Eingaben, Dezimalkomma, Tastaturnavigation, Zellfeedback und nachvollziehbaren Lösungen umbauen.
6. Topics, Mastery und Wissenskarten um die neuen Fachgebiete erweitern, ohne bestehende Topic-IDs oder Statistiken zu brechen.

## Batch 3 – Inhalte, Prüfungen und visueller Pass

7. Lernblätter und Formelsammlung um Netzplan-, ERM-, Gantt-, BAB-/Stufenleiter-Inhalte sowie Subnetting-, RAID- und OSI-Visuals ergänzen.
8. `exam_questions` additiv um optionale Visual-/Antwortschemafelder erweitern; Supabase-Typen, Importer und Probeprüfungs-Renderer abwärtskompatibel anpassen.
9. Eigene dekorative AP1-Illustrationen in `app/public/visuals/` integrieren und Dashboard/Lernmodule gezielt auflockern; abschließend Tests, Lint, Typecheck, Build, Migration-Checks und CRG-Impact-Review ausführen.

## Test-Seams

- Öffentliche Task-Verträge: `evaluateTaskAnswer`, `formatTaskAnswer` und Generatoren.
- Fachalgorithmen: vollständiger Netzplan (Vorwärts-/Rückwärtsrechnung), BAB-Verteilung und Stufenleiterfolge gegen fest gerechnete Beispiele.
- Persistenzgrenze: additive Migration, generierte Supabase-Typen und Importformat bleiben für bestehende Prüfungsfragen optional.
- UI-Grenze: Renderer akzeptiert jede Task-Variante, liefert semantische Tabellen/Labels und funktioniert ohne neue große Diagramm-Dependency.
