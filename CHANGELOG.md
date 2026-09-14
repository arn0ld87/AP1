# Changelog

Alle nennenswerten Änderungen am Projekt werden hier dokumentiert.
Format orientiert an [Keep a Changelog](https://keepachangelog.com/); das Projekt hat noch kein
Versionierungsschema (keine Releases/Tags) — Einträge landen unter „Unreleased" bis zur ersten
Version.

## [Unreleased]

### Drift-Prävention (14.09.2026)

#### Added

- **Migrationsstand in der Datenbank** (`public.schema_migrations`, Migration
  `20260914190000`): Version, Zeitpunkt und SHA-256 jeder angewendeten Migration. RLS an, keine
  Policy, keine Grants an `anon`/`authenticated` — Zugriff nur über `service_role` bzw.
  `supabase_admin` beim Deploy.
- **`scripts/apply_migrations.py`** — gleicht die Dateien in `app/supabase/migrations/` gegen
  diesen Stand ab: `--check` (ausstehende melden, Exit 1 — das Deploy-Gate), `--apply` (in
  Reihenfolge anwenden, jede in eigener Transaktion, danach `notify pgrst, 'reload schema'`),
  `--baseline` (vorhandene als angewendet eintragen, **ohne** sie auszuführen — nötig, weil
  `20260914170000_baseline_live_schema.sql` ein `pg_dump` und nicht idempotent ist) und
  `--status`. Zielverbindung über `DATABASE_URL` oder, für die Container-DB auf dem armserver,
  `AP1_PSQL`.
- CI-Job `migration-validation` prüft das Gate jetzt selbst mit: `--check` muss auf einer
  frisch aufgebauten, aber nicht eingetragenen DB fehlschlagen, `--baseline` + `--check` danach
  durchlaufen, und eine simuliert nachträglich editierte Migration muss erkannt werden.

#### Fixed

- **`docs/architecture.md` beschrieb ein Update ohne Migrationsschritt** („Update: nur dieser
  Schritt nach `git pull`" = Container-Rebuild). Genau dieses Muster brach am 13.09.2026 die
  Probeprüfungsseite. Der Ablauf steht jetzt als eigener Abschnitt
  „Update eines bestehenden Deployments" da: Gate → Migrationen → App.
- **Falscher Edge-Function-Pfad in der Deploy-Anleitung:** Schritt 5 nannte
  `/opt/supabase/volumes/functions/main/grade-exam-answer/index.ts`. Der edge-runtime serviert
  aber aus dem Top-Level-Verzeichnis; die Kopie unter `main/` ist ein Relikt. Am 14.09.2026 lief
  die Produktion deshalb auf altem Code, dem der atomare KI-Budget-Fix (PR #51) fehlte.

### Schema-Baseline (14.09.2026)

#### Fixed

- **Schema-Drift zwischen Repository und Produktion:** Die Live-Datenbank enthielt 57 Tabellen und
  44 Funktionen, die Migrationen beschrieben davon nur 7 bzw. 6. Die fehlenden 50 Tabellen,
  38 Funktionen, 7 Views und 33 Enum-Typen (Kompetenzmodell, Rubrics, Prüfungs-Blueprints,
  Quellenverwaltung) waren direkt in der Datenbank entstanden und hatten **keine SQL-Quelle** —
  weder im Repository noch auf dem Server. Ein Wiederaufbau nach `docs/backup-restore.md` hätte sie
  samt Daten (u. a. 18.316 Zeilen `source_chunk_reference`) verloren, und der CI-Job
  `migration-validation` validierte ein Schema ohne Bezug zur Produktion. Der Ist-Zustand ist jetzt
  als Baseline-Migration `20260914170000_baseline_live_schema.sql` aufgenommen; nachgewiesen über
  einen Objektvergleich frische DB ↔ Produktion (1655 Objekteigenschaften, keine Abweichung).
  Siehe [ADR-0006](docs/adr/0006-schema-baseline-statt-drift.md).
- **`error_log.erledigt`:** live `NOT NULL DEFAULT false`, aus den Migrationen aber nullable ohne
  Default — die einzige verbliebene Abweichung an den bereits migrierten Tabellen
  (`20260914180000_error_log_erledigt_not_null.sql`).

#### Changed

- `scripts/validate_migrations.py` erzwingt RLS jetzt über **alle** Tabellen des `public`-Schemas
  statt nur über eine feste Namensliste, und verlangt für jede Tabelle entweder eine RLS-Policy
  oder einen bewussten Eintrag in `NO_POLICY_TABLES` (Deny-all, Zugriff nur über `service_role`
  bzw. `security definer`-RPCs). Eine neue Tabelle ohne Absicherung lässt den CI-Job fehlschlagen.

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

- **exam_attempts vom Client überschreibbar:** `gesamtpunkte` und `finished_at` ließen sich
  per direktem PostgREST-Update auf beliebige Werte setzen, entkoppelt von den bewerteten
  `exam_answers`; über `INSERT` ließ sich ein bereits „fertiger" Attempt anlegen. Der
  Abschluss läuft jetzt über die serverseitige RPC `finish_exam_attempt` (Ownership-Prüfung,
  Row-Lock, Summe aus `exam_answers`); `UPDATE` ist entzogen, `INSERT` auf `exam_id`/`user_id`
  beschränkt.
- Edge Function liest `AWS_BEDROCK_API_KEY` korrekt, `verify_jwt` fest gepinnt (PR #37).
- Incomplete Bedrock-Response-Typ-Annotation in `grade-exam-answer.ts` (von `deno check` in CI
  gefunden, PR #38).