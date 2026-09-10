# Architektur

Kanonische Quelle für den ursprünglichen Entwurf ist die genehmigte Spec:
[docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md)
und der zugehörige Plan:
[docs/superpowers/plans/2026-09-10-lovable-ap1-plattform.md](superpowers/plans/2026-09-10-lovable-ap1-plattform.md).
Die tatsächliche Umsetzung ist seit dem Lovable-Pivot (siehe
[context.md](context.md#pivot-lovable-credit-limit-10092026)) davon abgewichen — dieses Dokument
beschreibt den **aktuellen** Stand aus [PR #33](https://github.com/arn0ld87/AP1/pull/33)
(Branch `worktree-ap1-lovable-plattform`, noch nicht nach `main` gemerged); bei Widerspruch zur Spec
gilt dieses Dokument als aktueller.

## Zwei-Phasen-Architektur

1. **Lokale Migrationsskripte** (Python-Stdlib, keine Zusatzpakete), Tasks 1–4:
   `scripts/migrate/parse_lernblaetter.py`, `parse_formelsammlung.py`, `parse_lernplan.py`,
   `parse_exams.py` — überführen die vorhandenen `.md`-Dateien einmalig nach `data/migration/*.json`.
   Abgeschlossen; Quelldateien bleiben dabei unverändert (nur gelesen, nie geschrieben).
2. **Web-App**, Tasks 5–16, in zwei Sub-Phasen:
   - **Phase A (Tasks 5–9, über Lovable-MCP):** Lovable bootstrappt Design-System, Auth-Schema und
     Content-Import gegen sein eigenes verwaltetes Supabase-Projekt, danach das erste Feature-Modul
     „Rechnen üben". Prompts dazu liegen unter `docs/lovable/prompts/`.
   - **Phase B (ab Task 10, lokal in `app/`):** Nach Erreichen des Lovable-Credit-Limits wurde der
     komplette Projektstand (TanStack Start + Vite + React 19 + TypeScript + Tailwind + shadcn/ui,
     Nitro-Build) exportiert. Alle weiteren Feature-Module und Fixes werden seither direkt im Code
     unter `app/` implementiert, gegen ein **self-hosted Supabase** auf dem armserver
     (`supabase.alexle135.de`) statt Lovables gehostetes Projekt.

## Feature-Module (7)

| # | Modul | Route | Quelle im Repo | Ersetzt | Stand |
|---|---|---|---|---|---|
| 1 | Rechnen üben | `/rechnen` | `AP1-Trainer.html` (`TOPICS`, `GEN`, `pick`) | Generator-Teil des Trainers | **fertig** |
| 2 | Wissenskarten | `/wissenskarten` | `AP1-Trainer.html` (`CARDS`) | Flashcard-Teil des Trainers | **fertig** |
| 3 | Lernblätter | `/lernblaetter` | `lernen/*.md` (9 Dateien, migriert nach `data/migration/lernblaetter.json`) | manuelles Nachschlagen | geplant |
| 4 | Formelsammlung | `/formelsammlung` | `02_FORMELSAMMLUNG.md` (migriert nach `data/migration/formelsammlung.json`) | manuelles Nachschlagen | geplant |
| 5 | Probeprüfungen + KI-Bewertung | `/probepruefungen` | `probepruefungen/`, `loesungen/` (migriert, `exam_questions`-Tabelle befüllt) | manuelle Korrektur | geplant |
| 6 | Fortschritt & Fehlerliste | `/fortschritt` | abgeleitet aus 1/2/5 | `04_LERNFORTSCHRITT.md`, `05_FEHLERLISTE.md` | geplant |
| 7 | Tagesplan | `/tagesplan` | `01_LERNPLAN.md` (migriert nach `data/migration/lernplan.json`) | manuelles Abhaken | geplant |

Module 1 und 2 sind fertig implementiert (`app/src/routes/_authenticated/rechnen.tsx` bzw.
`wissenskarten.tsx`) inklusive serverseitigem Fortschritts-Upsert gegen `topic_mastery` bzw.
`flashcard_progress`. Module 3–7 haben aktuell nur Platzhalter-Routen; die Daten dafür liegen bereits
migriert unter `data/migration/*.json` bzw. in der `exam_questions`-Tabelle vor.

## Auth & Deploy

- Auth: E-Mail + Passwort, ein einzelner Account (Alex) — kein Multi-User (siehe
  [vision.md](vision.md#nicht-ziele-aktuelle-iteration)). Implementiert als Route-Guard
  (`app/src/routes/_authenticated/route.tsx`) + Login (`app/src/routes/auth.tsx`,
  `signInWithPassword`), kein Social Login, keine Registrierungs-UI.
- Backend: self-hosted Supabase auf dem armserver (`supabase.alexle135.de`) — nicht mehr Lovables
  verwaltetes Supabase-Projekt (Pivot, siehe oben). Schema-Migrationen liegen in
  `app/supabase/migrations/`, angewendet per `psql` im Container `supabase-db`.
- Deploy: Build-Output ist Nitro (Cloudflare-Worker-kompatibel), Ziel-Domain
  `ap1.alexle135.de` hinter Traefik auf dem armserver — ursprünglich als „bewusst out of scope"
  geplant, seit dem Pivot weg von Lovables eigenem Live-Deploy das tatsächliche Ziel (noch nicht
  live).
- CI: PR-Checks via GitHub Actions (`.github/workflows/pr-check.yml`, [PR #38](https://github.com/arn0ld87/AP1/pull/38))
  — fünf parallele Jobs: ESLint + Prettier, `tsc --noEmit`, Vite-Build, `deno check` der Edge
  Function, `py_compile` der Migrationsskripte. Kein Deploy-Workflow — Deploy erfolgt weiterhin
  manuell (Task 16).

## Design-System

„Discord-Stil": dunkles Theme, linke Sidebar mit den 7 Feature-Modulen, Content-Pane rechts,
abgerundete Karten, eigenständige Optik ohne Bezug zum alexle135-Branding.

## KI-Bewertungs-Flow (Kurzfassung)

Ausführlich in [api.md](api.md). Kurz: Frontend → Supabase Edge Function → lädt Musterlösung aus
`exam_questions` → Bedrock-Aufruf (Claude Haiku 4.5, Fallback 3.5 Haiku) → Punkte + Begründung
zurück → Speicherung in `exam_answers`, niedrige Bewertungen fließen in `error_log`. Bei
Bedrock-Fehler: Musterlösung wird trotzdem angezeigt, Selbsteinschätzung als Fallback.

## Verifikation

Kein automatisierter Test-Runner. Phase A (Tasks 5–9) endete mit manuellem Klick-Durchlauf in der
Lovable-Preview; Phase B (ab Task 10, lokal in `app/`) verifiziert über `bun run build`/`bun run lint`
plus manuellen Durchlauf gegen `bun run dev` und Stichproben per `query_database`/`psql` gegen das
self-hosted Supabase — weiterhin kein CI-Test-Runner (siehe Plan → „Global Constraints").
