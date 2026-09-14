# Status

Aktueller Stand der AP1-Plattform. Dies ist die Kurzübersicht — Detailgründe stehen in
[docs/context.md](context.md), die Entscheidungen in [docs/adr/](adr/).

## Stand 14.09.2026

| Bereich                                                                                                                                                                                                     | Status                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Adaptive AP1 Mission: Tagespriorisierung, Confidence, Wiederholungs-Loop, Mini-Boss, XP, Readiness und Session-Persistenz                                                                                   | implementiert auf `codex/ap1-adaptive-mission-20260914`                      |
| Tasks 1–9 (Migration, Auth, Content-Import, Rechnen üben)                                                                                                                                                   | gemerged (PR #33)                                                            |
| Tasks 10–13 (Wissenskarten, Lernblätter, Formelsammlung, Tagesplan)                                                                                                                                         | gemerged (PR #34)                                                            |
| Tasks 14–15 (Probeprüfungen + KI-Bewertung, Fortschritt & Fehlerliste)                                                                                                                                      | gemerged (PR #36)                                                            |
| Edge-Function-Fix (Env-Name, `verify_jwt`)                                                                                                                                                                  | gemerged (PR #37)                                                            |
| CI-Checks je PR                                                                                                                                                                                             | live (PR #38)                                                                |
| Task 16: Live-Deploy `pruefung.alexle135.de`                                                                                                                                                                | live (PR #39)                                                                |
| Doku: CI-Aufzeichnung (PR #40), Agent-Skills-Setup (PR #41), ADRs 0001–0005 + Status (PR #42), Dashboard-Startseite (PR #43)                                                                                | gemerged                                                                     |
| Remediation (`fix/remediation-all`): Bestehenslogik, RAID-10, Prüfungs-Persistenz, Schema-Drift, Edge-Function-Härtung, Tests, CI-Gate                                                                      | gemerged (PR #44)                                                            |
| Visuelle Lernaufgaben: ERM, vollständiger Netzplan, Gantt, BAB, Stufenleiterverfahren, Lernvisuals und strukturierte Prüfungsantworten                                                                      | gemerged (`10977d7`)                                                         |
| Deploy-Doku (Git-Checkout-Flow) + öffentlicher Zugriff auf `pruefung.alexle135.de`                                                                                                                          | gemerged (PR #45)                                                            |
| Registrierung geöffnet: Signup, Rechtsseiten, KI-Tageslimit, Selbstlöschung                                                                                                                                 | gemerged (PR #46)                                                            |
| UI: Prüfungsmodus volle Breite, Markdown-Tabellen, Flip-Karten, Mobile-Layout                                                                                                                               | gemerged (PR #47)                                                            |
| Final-Quality-Pass: SelfGrade-Konsistenz (Server-RPC), Edge-Function-Persistenzfehler, Attempt/Question-Kopplung, unabhängige Generator-Referenztests, echter Doppelabgabe-Test, sicheres Restore-Verfahren | gemerged (PR #48)                                                            |
| Sicherheits-Audit (9 Dimensionen, adversarisch gegengeprüft): 1 P0, 9 P1, 33 P2, 13 P3                                                                                                                      | Backlog erstellt 14.09.2026                                                  |
| P0: `exam_attempts.gesamtpunkte` war client-seitig überschreibbar → RPC `finish_exam_attempt`, `UPDATE` entzogen, `INSERT` spaltenweise                                                                     | gemerged (PR #49), live                                                      |
| P1: `parseGermanNumber` las „1.685" als 1,685 — die App wertete ihre eigene angezeigte Musterlösung als falsch                                                                                              | gemerged (PR #50), live                                                      |
| P1: KI-Tageslimit war per Race Condition umgehbar → atomare Reservierung in Postgres (`consume_ai_budget`/`release_ai_budget`)                                                                              | gemerged (PR #51), live                                                      |
| Rechte-Lücke: PostgreSQL vergibt `EXECUTE` auf neue Funktionen an `PUBLIC` — `revoke … from anon, authenticated` allein genügte nicht                                                                       | gemerged (PR #52), live                                                      |
| Schema-Baseline: 50 Tabellen, 38 Funktionen, 7 Views, 33 Enums existierten nur in der Live-DB → als Migration aufgenommen ([ADR-0006](adr/0006-schema-baseline-statt-drift.md))                             | PR offen                                                                     |
| Drift-Prävention: `public.schema_migrations` + `scripts/apply_migrations.py` (`--check`/`--apply`/`--baseline`/`--status`), CI prüft das Gate, Update-Ablauf in `architecture.md` korrigiert                | PR offen (stacked auf Baseline), Live-Stempelung ausstehend                  |
| Edge Function lief auf altem Code: neue Version war nach `main/grade-exam-answer/` kopiert, serviert wird aber das Top-Level-Verzeichnis → korrekt deployed, Relikt entfernt, Anleitung berichtigt          | live seit 14.09.2026                                                         |
| P0-Sicherheitsfix exam_attempts: serverseitiger Abschluss über RPC `finish_exam_attempt` (Migration `20260914140000`), kein Client-`UPDATE`/`INSERT` auf `gesamtpunkte`/`finished_at`                       | implementiert auf `fix/exam-attempts-server-side-scoring`, Review ausstehend |

## CI (PR #38, erweitert durch Remediation)

`.github/workflows/pr-check.yml` — je PR und auf `main`: ESLint + Prettier, `tsc --noEmit`,
Vitest (`bun run test`), Vite-Build, `deno check` + `deno test` der Edge Function,
Migration-Validierung auf frischer Postgres-Testinstanz (`scripts/validate_migrations.py`),
`py_compile` der Python-Skripte, `docker compose config`.

## Testabdeckung

- Generatoren: RAID-10-Regression (1000 deterministische Fälle) + Invarianten je Familie,
  Seed-Determinismus, **unabhängige fachliche Referenzberechnungen** für subnetting, datenmengen,
  uebertragung, strom, wirtschaft, netzplan (Issue #20)
- Prüfungs-Flow: Notenschlüssel (ohne Bestehenslogik), Einzelfehler-Fallback,
  Summen-Konsistenz, Persistenz-Reihenfolge, **SelfGrade-RPC** (Ownership, Clamping, Ersetzen statt
  Aufaddieren, Migrationstest), **echter Doppelabgabe-Test** (`createSingleFlightGuard`, simulierter
  Timer/Klick-Überlapp ohne await dazwischen)
- Wissenskarten: Gewichtung `(falsch+1)/(richtig+falsch+2)` — neue Karten bleiben im Pool
- Content: 3 Probeprüfungen à exakt 100 Punkte, vollständige Teilaufgaben, eindeutige Schlüssel
- Edge Function: Auth, Ownership, **Attempt/Question-Exam-Kopplung**, Bedrock-Fehler,
  **Persistenzfehler → 503 statt Scheinerfolg**, `error_log`-Fehler bleibt non-blocking

## Offene Risiken / Nächste Schritte

1. Automatisierter E2E-Test fehlt noch (kein Playwright/Browser-Test im Repo, Issue #32 offen):
   Login → Probeprüfung → Abgabe → Ergebnis → Reload bleibt konsistent. Bislang nur manuell
   verifiziert. Für CI müsste die KI-Bewertung deterministisch gemockt werden (kein Test darf von
   echtem Bedrock abhängen).
2. Branch Protection + Required Status Checks für `main` sind seit 14.09.2026 **aktiv**
   (PR erforderlich, alle 8 CI-Jobs als Required Status Check, `enforce_admins` bewusst aus, damit
   Alex als Repo-Owner im Notfall noch direkt eingreifen kann).
3. Backup/Restore-Verfahren regelmäßig testen ([backup-restore.md](backup-restore.md)) — Standardweg
   ist jetzt ein isolierter Test-Restore (`ap1_restore_test`), Produktions-Restore ist als
   Notfall-Prozedur mit Vorbedingungen separat dokumentiert.
4. **Drift-Prävention steht, ist auf der Produktion aber noch nicht scharf.** Der Migrationsstand
   wird jetzt in `public.schema_migrations` geführt, `scripts/apply_migrations.py --check` ist das
   Gate vor jedem Rebuild, und [architecture.md](architecture.md) beschreibt den Update-Ablauf mit
   Migrationsschritt. Offen: Die Produktionsdatenbank ist noch nicht gestempelt — dort muss einmalig
   `apply_migrations.py --baseline` laufen (die 12 vorhandenen Migrationen sind angewendet, aber
   nirgends vermerkt; ein `--apply` würde die nicht idempotente Baseline erneut ausführen und
   fehlschlagen). Solange das nicht passiert ist, greift das Gate nur lokal und in CI.
5. Aus dem Audit vom 14.09.2026 offen: JWT-Signatur wird in beiden Edge Functions nicht selbst
   geprüft (`delete-account` fehlt zudem der `verify_jwt`-Eintrag in `config.toml`), kein
   Komponenten-/E2E-Test für den Kernflow, sowie Doku-Widersprüche zu Single-User-Auth und
   Modellname (Nova Lite statt Claude Haiku).
