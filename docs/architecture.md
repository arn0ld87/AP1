# Architektur

Kanonische Quelle für den ursprünglichen Entwurf ist die genehmigte Spec:
[docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md)
und der zugehörige Plan:
[docs/superpowers/plans/2026-09-10-lovable-ap1-plattform.md](superpowers/plans/2026-09-10-lovable-ap1-plattform.md).
Die tatsächliche Umsetzung ist seit dem Lovable-Pivot (siehe
[context.md](context.md#pivot-lovable-credit-limit-10092026)) davon abgewichen — dieses Dokument
beschreibt den **aktuellen** Stand auf `main` (PRs
[#33](https://github.com/arn0ld87/AP1/pull/33)–[#37](https://github.com/arn0ld87/AP1/pull/37),
Tasks 1–16); bei Widerspruch zur Spec gilt dieses Dokument als aktueller.

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
| 3 | Lernblätter | `/lernblaetter` | `lernen/*.md` (9 Dateien, migriert nach `data/migration/lernblaetter.json`) | manuelles Nachschlagen | **fertig** |
| 4 | Formelsammlung | `/formelsammlung` | `02_FORMELSAMMLUNG.md` (migriert nach `data/migration/formelsammlung.json`) | manuelles Nachschlagen | **fertig** |
| 5 | Probeprüfungen + KI-Bewertung | `/probepruefungen` | `probepruefungen/`, `loesungen/` (migriert, `exam_questions`-Tabelle befüllt) | manuelle Korrektur | **fertig** |
| 6 | Fortschritt & Fehlerliste | `/fortschritt` | abgeleitet aus 1/2/5 | `04_LERNFORTSCHRITT.md`, `05_FEHLERLISTE.md` | **fertig** |
| 7 | Tagesplan | `/tagesplan` | `01_LERNPLAN.md` (migriert nach `data/migration/lernplan.json`) | manuelles Abhaken | **fertig** |

Alle 7 Module sind implementiert (Routes unter `app/src/routes/_authenticated/`) inklusive
serverseitigem Fortschritts-Upsert gegen `topic_mastery` bzw. `flashcard_progress`; das
Probeprüfungs-Modul bewertet über die Edge Function `grade-exam-answer` (siehe
[api.md](api.md)).

## Auth & Deploy

- Auth: E-Mail + Passwort, ein einzelner Account (Alex) — kein Multi-User (siehe
  [vision.md](vision.md#nicht-ziele-aktuelle-iteration)). Implementiert als Route-Guard
  (`app/src/routes/_authenticated/route.tsx`) + Login (`app/src/routes/auth.tsx`,
  `signInWithPassword`), kein Social Login, keine Registrierungs-UI.
- Backend: self-hosted Supabase auf dem armserver (`supabase.alexle135.de`) — nicht mehr Lovables
  verwaltetes Supabase-Projekt (Pivot, siehe oben). Schema-Migrationen liegen in
  `app/supabase/migrations/`, angewendet per `psql` im Container `supabase-db`.
- Deploy (Task 16, live seit 10.09.2026): Ziel-Domain **`pruefung.alexle135.de`** (DNS →
  Tailscale-IP `100.71.152.44`). Docker-Container `pruefung-frontend` (Nitro `node-server`-Build,
  `app/Dockerfile`) hinter Traefik (Entry Point `tswebsecure`, Letsencrypt-Zertifikat, Router
  `/opt/traefik/dynamic/pruefung.yml`, Vorlage `deploy/traefik-pruefung.yml`) — nur aus dem
  Tailscale-Netz erreichbar. Compose liegt unter `deploy/docker-compose.pruefung.yml` (auf dem
  Server `/opt/pruefung-frontend/`). `ap1.alexle135.de` ist dagegen der ältere Vor-Pivot-Deploy
  (Lovable-Projekt „ap1-skill-simulator") und läuft unberührt parallel.
- Edge Function `grade-exam-answer`: deployed unter
  `/opt/supabase/volumes/functions/main/grade-exam-answer/index.ts` auf dem armserver; Env am
  Container `functions`: `AWS_BEDROCK_API_KEY` (aus Vaultwarden), `VERIFY_JWT=true` (Bounce-Main
  verifiziert User-JWTs gegen JWKS).

## Design-System

„Discord-Stil": dunkles Theme, linke Sidebar mit den 7 Feature-Modulen, Content-Pane rechts,
abgerundete Karten, eigenständige Optik ohne Bezug zum alexle135-Branding.

## KI-Bewertungs-Flow (Kurzfassung)

Ausführlich in [api.md](api.md). Kurz: Frontend → Supabase Edge Function (prüft JWT + Attempt-
Eigentümerschaft serverseitig) → lädt Musterlösung aus `exam_questions` → Bedrock-Aufruf
(Claude Haiku 4.5, kein Modell-Fallback) → Punkte + Begründung zurück → Upsert in `exam_answers`
(eine Bewertung je Attempt/Frage), niedrige Bewertungen fließen in `error_log`. Bei
Bedrock-Fehler: Musterlösung wird trotzdem angezeigt, Selbsteinschätzung als Fallback.

## Verifikation

CI (`.github/workflows/pr-check.yml`) prüft je PR und auf `main`: ESLint + Prettier, `tsc --noEmit`,
Vitest (`bun run test` — Generator-Invarianten inkl. RAID-10-Regression über 1000 deterministische
Fälle, Prüfungs-Flow, Wissenskarten-Gewichtung, Content-Validierung der Probeprüfungen), Vite-Build,
`deno check` + `deno test` der Edge Function (16 Szenarien), frischer Schema-Aufbau inkl. Drift-
Prüfung gegen eine Postgres-Testinstanz (`scripts/validate_migrations.py`) und
`docker compose config`. Lokal: `bun run test` in `app/`.

## Deployment reproduzierbar aufbauen (Kurzfassung)

Voraussetzungen: armserver im Tailscale-Netz (`100.71.152.44`), laufendes self-hosted Supabase
(`supabase.alexle135.de`), Traefik mit Entry Point `tswebsecure` + Letsencrypt-Resolver,
DNS `pruefung.alexle135.de` → Tailscale-IP.

1. `.env` aus `deploy/.env.example` befüllen (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
2. Schema aufbauen: alle Migrationen aus `app/supabase/migrations/` in Reihenfolge anwenden
   (auf dem armserver per `psql` im Container `supabase-db`); Verifikation auf frischer DB:
   `python3 scripts/validate_migrations.py`.
3. Content laden: `python3 scripts/migrate/parse_exams.py` (u. a.) erzeugt `data/migration/*.json`,
   Import der Probeprüfungsfragen in `exam_questions` (77 Aufgaben, je Prüfung exakt 100 Punkte).
4. App bauen und starten: `docker compose -f deploy/docker-compose.pruefung.yml up -d --build`
   (Container `pruefung-frontend`, Netz `tsproxy` für Traefik).
5. Edge Function deployen: Datei nach
   `/opt/supabase/volumes/functions/main/grade-exam-answer/index.ts`, Container `functions` neu
   starten; Secrets `AWS_BEDROCK_API_KEY` + `VERIFY_JWT=true` am Container setzen.
6. Smoke-Test: `curl -sI https://pruefung.alexle135.de/` erwartet HTTP 200; der Container-
   Healthcheck (`deploy/docker-compose.pruefung.yml`) prüft alle 30 s `GET /` auf Port 3000
   (HTTP 2xx = healthy, Node-fetch statt curl, da das Image kein curl mitbringt).
   Funktionstest: Login im Browser, eine Probeprüfung starten und bewerten lassen.
