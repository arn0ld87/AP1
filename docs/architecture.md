# Architektur

Kanonische Quelle ist die genehmigte Spec:
[docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md)
und der zugehörige Plan:
[docs/superpowers/plans/2026-09-10-lovable-ap1-plattform.md](superpowers/plans/2026-09-10-lovable-ap1-plattform.md).
Dieses Dokument fasst nur die Struktur zusammen, damit man sie nicht aus 1233 Plan-Zeilen
zusammensuchen muss — bei Widerspruch gilt die Spec.

## Zwei-Teile-Architektur

1. **Lokale Migrationsskripte** (dieses Repo, Python-Stdlib, keine Zusatzpakete):
   `scripts/migrate/parse_lernblaetter.py`, `parse_formelsammlung.py`, `parse_lernplan.py`,
   `parse_exams.py` — überführen die vorhandenen `.md`-Dateien einmalig nach `data/migration/*.json`.
   Diese Verzeichnisse existieren noch nicht, erst beim Abarbeiten des Plans anlegen.
2. **Lovable-App** (React + Vite + TypeScript + Tailwind + shadcn/ui, Lovable-Standardstack) +
   **Supabase** (Auth, Postgres, Edge Functions) — importiert das JSON und implementiert die
   Feature-Module. Wird per `lovable`-Skill-Prompts gebaut (`docs/lovable/prompts/01…10-*.md`, noch
   nicht angelegt).

## Feature-Module (7)

| # | Modul | Quelle im Repo | Ersetzt |
|---|---|---|---|
| 1 | Rechnen üben | `AP1-Trainer.html` (`TOPICS`, `GEN`, `pick`) | Generator-Teil des Trainers |
| 2 | Wissenskarten | `AP1-Trainer.html` (`CARDS`) | Flashcard-Teil des Trainers |
| 3 | Lernblätter | `lernen/*.md` (9 Dateien) | manuelles Nachschlagen |
| 4 | Formelsammlung | `02_FORMELSAMMLUNG.md` | manuelles Nachschlagen |
| 5 | Probeprüfungen + KI-Bewertung | `probepruefungen/`, `loesungen/` | manuelle Korrektur |
| 6 | Fortschritt & Fehlerliste | abgeleitet aus 1/2/5 | `04_LERNFORTSCHRITT.md`, `05_FEHLERLISTE.md` |
| 7 | Tagesplan | `01_LERNPLAN.md` | manuelles Abhaken |

## Auth & Deploy

- Auth: E-Mail + Passwort, ein einzelner Account (Alex) — kein Multi-User (siehe
  [vision.md](vision.md#nicht-ziele-aktuelle-iteration)).
- Deploy: Lovable-Live-Deploy. Eigene Domain (`ap1.alexle135.de` via Cloudflare-CNAME) ist bewusst
  out of scope dieser Iteration.

## Design-System

„Discord-Stil": dunkles Theme, linke Sidebar mit den 7 Feature-Modulen, Content-Pane rechts,
abgerundete Karten, eigenständige Optik ohne Bezug zum alexle135-Branding.

## KI-Bewertungs-Flow (Kurzfassung)

Ausführlich in [api.md](api.md). Kurz: Frontend → Supabase Edge Function → lädt Musterlösung aus
`exam_questions` → Bedrock-Aufruf (Claude Haiku 4.5, Fallback 3.5 Haiku) → Punkte + Begründung
zurück → Speicherung in `exam_answers`, niedrige Bewertungen fließen in `error_log`. Bei
Bedrock-Fehler: Musterlösung wird trotzdem angezeigt, Selbsteinschätzung als Fallback.

## Verifikation

Kein automatisierter Test-Runner. Jede Aufgabe aus dem Plan endet mit einem manuellen Klick-Durchlauf
in der Lovable-Preview (passend zum Lovable-Workflow, siehe Plan → „Global Constraints").
