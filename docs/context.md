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
[architecture.md](architecture.md)), nicht aber Vision, Feature-Umfang oder Nicht-Ziele.

## Aktueller Stand (10.09.2026)

- Tasks 1–9 (Migration, Supabase-Auth, Content-Import, Rechnen üben) gemerged via
  [PR #33](https://github.com/arn0ld87/AP1/pull/33); Entwicklung läuft seit Task 10 direkt in `app/`.
- Tasks 10–13 (Wissenskarten, Lernblätter, Formelsammlung, Tagesplan) gemerged via
  [PR #34](https://github.com/arn0ld87/AP1/pull/34).
- Tasks 14–15 (Probeprüfungen mit KI-Bewertung über die Edge Function `grade-exam-answer`,
  Fortschritt & Fehlerliste) gemerged via [PR #36](https://github.com/arn0ld87/AP1/pull/36)
  (versehentlich vor dem Review gemerged — Env-Namen- und `verify_jwt`-Korreturen folgen im
  Fix-PR `fix/grade-exam-answer`).
- Task 16 (Live-Deploy) **live seit 10.09.2026**: App unter
  <https://pruefung.alexle135.de> (Traefik/tswebsecure, nur Tailscale), Edge Function
  `grade-exam-answer` deployed, `VERIFY_JWT=true`, Secret `AWS_BEDROCK_API_KEY` (Fix-PR
  [#37](https://github.com/arn0ld87/AP1/pull/37)). Offener End-To-End-Check: einmal mit echtem
  Login eine Probeprüfung durchspielen.
- Docs-Standabgleich erfolgte via PR [#35](https://github.com/arn0ld87/AP1/pull/35).
