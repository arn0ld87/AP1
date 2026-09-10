# Changelog

Alle nennenswerten Änderungen am Projekt werden hier dokumentiert.
Format orientiert an [Keep a Changelog](https://keepachangelog.com/); das Projekt hat noch kein
Versionierungsschema (keine Releases/Tags) — Einträge landen unter „Unreleased" bis zur ersten
Version.

## [Unreleased]

### Added

- Web-App `app/` (TanStack Start + self-hosted Supabase): Migration aus dem Lovable-Export,
  Supabase-Auth, Content-Import (Prüfungsaufgaben, Lernblätter, Formelsammlung, Tagesplan),
  Rechnen-üben, Wissenskarten, Probeprüfungen mit 90-Min-Timer und KI-Bewertung, Fortschritt- und
  Fehlerliste-Dashboard (Tasks 1–15, PRs #33–#36).
- Edge Function `grade-exam-answer` (Amazon Bedrock, Claude Haiku 4.5) für die automatische
  KI-Bewertung von Probeprüfung-Antworten (PR #36).
- CI für PRs: `.github/workflows/pr-check.yml` mit fünf parallelen Checks (Lint + Prettier,
  Typecheck, Build, `deno check` der Edge Function, `py_compile` der Migrationsskripte; PR #38).
- Live-Deploy `pruefung.alexle135.de` hinter Traefik auf dem armserver (Task 16, PR #39 — offen).

### Changed

- Pivot weg von Lovable (Credit-Stopp) zu self-hosted Supabase auf dem armserver (ADR-0001).

### Fixed

- Edge Function liest `AWS_BEDROCK_API_KEY` korrekt, `verify_jwt` fest gepinnt (PR #37).
- Incomplete Bedrock-Response-Typ-Annotation in `grade-exam-answer.ts` (von `deno check` in CI
  gefunden, PR #38).