# Changelog

Alle nennenswerten Änderungen am Projekt werden hier dokumentiert.
Format orientiert an [Keep a Changelog](https://keepachangelog.com/); das Projekt hat noch kein
Versionierungsschema (keine Releases/Tags) — Einträge landen unter „Unreleased" bis zur ersten
Version.

## [Unreleased]

### Remediation (11.09.2026)

#### Fixed

- **AP1-Bestehenslogik:** UI und Doku behaupteten eine eigenständige Bestehensgrenze bei
  50 Punkten. Korrekt: 50 Punkte = Note 4 „ausreichend", AP1 zählt mit 20 % zum Gesamtergebnis,
  keine eigenständige Bestehensgrenze.
- **RAID-10-Generator:** erzeugte ungerade Plattenanzahlen und rechnete per `Math.floor(n/2)`
  weiter; erzeugt jetzt nur vollständige Spiegelpaare (gerade Anzahl, ≥ 4 Platten) — auch in
  `AP1-Trainer.html`.
- **Prüfungsauswertung:** `finishExam()` las einen stale React-State-Snapshot und konnte
  0 Punkte speichern; Timer nutzte stale Closures und konnte doppelt auslösen. Abschluss-Flow
  arbeitet jetzt wertbasiert (`submitExamFlow`), Submit-Guard verhindert Doppelabgabe,
  Selbst-Einschätzung wird persistiert.
- **Schema-Drift:** `exam_questions.intro/ausgangssituation`, `error_log.erledigt`,
  `exam_answers.user_id` existierten nur manuell in der Live-DB; Folgemigration + Unique-Index
  gegen Bewertungs-Dubletten.
- **Edge Function `grade-exam-answer`:** Eigentümerschaft von `attempt_id` wird serverseitig
  geprüft (sonst 403), Eingaben validiert, HTTP-/Insert-Fehler geloggt statt verschluckt,
  KI-Punkte strikt auf 0…max begrenzt, idempotenter Upsert.
- **Wissenskarten-Gewichtung:** `falsch/(r+f+1)` setzte neue Karten auf Gewicht 0; neu
  `(falsch+1)/(richtig+falsch+2)`.
- Doku-Widersprüche bereinigt: alte Domain, „geplant"-Module, offene PR-Claims, Bun/npm,
  nicht existierender Bedrock-Fallback, ADR-0006-Verweis.

#### Added

- Vitest-Testsuite: RAID-10-Regression (1000 deterministische Fälle), Generator-Invarianten,
  Prüfungs-Flow, Wissenskarten-Gewichtung, Content-Validierung (100-Punkte-Regel).
- 16 Deno-Tests für die Edge Function (Auth, Ownership, Bedrock-Fehler, Persistenz).
- Migration-Validierung: `scripts/validate_migrations.py` baut das Schema auf einer frischen
  Postgres-Instanz auf und prüft Tabellen/Spalten/RLS/Policies/RPCs (CI-Job).
- CI: `tests`-, `edge-functions`-Test-, `migration-validation`- und `compose-config`-Jobs;
  Trigger auf PR und `main` ohne enge paths-Filter.
- `.env.example`-Vorlagen für `app/` und `deploy/`; `.env`-Ignore-Regeln repo-weit.
- Backup-/Restore-Dokumentation: [docs/backup-restore.md](docs/backup-restore.md).

### Added

- Web-App `app/` (TanStack Start + self-hosted Supabase): Migration aus dem Lovable-Export,
  Supabase-Auth, Content-Import (Prüfungsaufgaben, Lernblätter, Formelsammlung, Tagesplan),
  Rechnen-üben, Wissenskarten, Probeprüfungen mit 90-Min-Timer und KI-Bewertung, Fortschritt- und
  Fehlerliste-Dashboard (Tasks 1–15, PRs #33–#36).
- Edge Function `grade-exam-answer` (Amazon Bedrock, Claude Haiku 4.5) für die automatische
  KI-Bewertung von Probeprüfung-Antworten (PR #36).
- CI für PRs: `.github/workflows/pr-check.yml` mit fünf parallelen Checks (Lint + Prettier,
  Typecheck, Build, `deno check` der Edge Function, `py_compile` der Migrationsskripte; PR #38).
- Live-Deploy `pruefung.alexle135.de` hinter Traefik auf dem armserver (Task 16, PR #39).

### Changed

- Pivot weg von Lovable (Credit-Stopp) zu self-hosted Supabase auf dem armserver (ADR-0001).

### Fixed

- Edge Function liest `AWS_BEDROCK_API_KEY` korrekt, `verify_jwt` fest gepinnt (PR #37).
- Incomplete Bedrock-Response-Typ-Annotation in `grade-exam-answer.ts` (von `deno check` in CI
  gefunden, PR #38).