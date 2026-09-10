# Kontext

## Ausgangslage

Dieses Repo ist aktuell reines Lernmaterial für die AP1-Prüfung (Fachinformatiker Systemintegration,
Termin **30.09.2026**): Markdown-Dateien (Lernblätter, Formelsammlung, Probeprüfungen, Lösungen,
Lernplan/Fortschritt/Fehlerliste) plus ein einziges eigenständiges Offline-Tool, `AP1-Trainer.html`.
Details zu Inhalt und Arbeitsweise: `README.md`. Details zur Analysegrundlage (welche Prüfungstermine
ausgewertet wurden): `00_PRUEFUNGSANALYSE.md`.

Der bisherige Workflow ist rein manuell: Lernfortschritt und Fehler trägt Alex selbst in
`04_LERNFORTSCHRITT.md` / `05_FEHLERLISTE.md` ein, Probeprüfungen werden gegen die Musterlösungen in
`loesungen/` von Hand korrigiert.

## Warum die Migration (2026-09-10)

Commit `bdb33b9` ("neue richtung") markiert die Entscheidung, dieses statische Material in eine
Web-App zu überführen. Motivation: gerätübergreifender Fortschritt (aktuell nur `localStorage` im
Trainer, nicht synchronisiert) und automatisierte KI-Bewertung der Probeprüfungen statt manueller
Korrektur gegen die Musterlösungen.

Die Entscheidung ist getroffen und genehmigt (Status in [vision.md](vision.md) und
[architecture.md](architecture.md)) — dieses Dokument hält nur fest, *warum* es dazu kam, nicht *was*
gebaut wird.

## Zeitdruck

Prüfungstermin ist der 30.09.2026. Die Migration darf den eigentlichen Lernbetrieb nicht blockieren:
Die vorhandenen `.md`-Dateien und `AP1-Trainer.html` bleiben nutzbar, bis die Lovable-App die
entsprechenden Feature-Module vollständig abdeckt. Kein Big-Bang-Cutover.

## Beteiligte

Single-User-Projekt (Alex, `schneider@alexle135.de`). Kein Team, keine externen Stakeholder — Vision
und Scope-Entscheidungen werden direkt mit Alex getroffen, nicht in Tickets/Boards verwaltet.

## Pivot: Lovable-Credit-Limit (10.09.2026)

Tasks 1–9 des Implementierungsplans liefen über Lovable-MCP (Design-System-Bootstrap, Supabase-Auth,
Content-Import, „Rechnen üben"). Danach war der Lovable-Workspace ohne Guthaben. Statt zu warten,
wurde der komplette Projektstand (TanStack Start + Vite + Nitro, 99 Dateien) exportiert und wird seit
Task 10 direkt in `app/` weiterentwickelt, gegen ein self-hosted Supabase auf dem armserver
(`supabase.alexle135.de`) statt gegen Lovables verwaltetes Supabase-Projekt.

Das ändert Architektur und Deploy-Ziel gegenüber der ursprünglichen Spec (siehe
[architecture.md](architecture.md)), nicht aber Vision, Feature-Umfang oder Nicht-Ziele. Stand und
Fortschritt: [PR #33](https://github.com/arn0ld87/AP1/pull/33), Branch
`worktree-ap1-lovable-plattform`, noch nicht nach `main` gemerged.
