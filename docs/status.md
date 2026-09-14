# Status

Aktueller Stand der AP1-Plattform. Dies ist die Kurzübersicht — Detailgründe stehen in
[docs/context.md](context.md), die Entscheidungen in [docs/adr/](adr/).

## Stand 14.09.2026

| Bereich                                                                                                                                                                                                     | Status                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Tasks 1–9 (Migration, Auth, Content-Import, Rechnen üben)                                                                                                                                                   | gemerged (PR #33)                                            |
| Tasks 10–13 (Wissenskarten, Lernblätter, Formelsammlung, Tagesplan)                                                                                                                                         | gemerged (PR #34)                                            |
| Tasks 14–15 (Probeprüfungen + KI-Bewertung, Fortschritt & Fehlerliste)                                                                                                                                      | gemerged (PR #36)                                            |
| Edge-Function-Fix (Env-Name, `verify_jwt`)                                                                                                                                                                  | gemerged (PR #37)                                            |
| CI-Checks je PR                                                                                                                                                                                             | live (PR #38)                                                |
| Task 16: Live-Deploy `pruefung.alexle135.de`                                                                                                                                                                | live (PR #39)                                                |
| Doku: CI-Aufzeichnung (PR #40), Agent-Skills-Setup (PR #41), ADRs 0001–0005 + Status (PR #42), Dashboard-Startseite (PR #43)                                                                                | gemerged                                                     |
| Remediation (`fix/remediation-all`): Bestehenslogik, RAID-10, Prüfungs-Persistenz, Schema-Drift, Edge-Function-Härtung, Tests, CI-Gate                                                                      | gemerged (PR #44)                                            |
| Visuelle Lernaufgaben: ERM, vollständiger Netzplan, Gantt, BAB, Stufenleiterverfahren, Lernvisuals und strukturierte Prüfungsantworten                                                                      | implementiert auf `codex/visual-learning`, Review ausstehend |
| Deploy-Doku (Git-Checkout-Flow) + öffentlicher Zugriff auf `pruefung.alexle135.de`                                                                                                                          | gemerged (PR #45)                                            |
| Registrierung geöffnet: Signup, Rechtsseiten, KI-Tageslimit, Selbstlöschung                                                                                                                                 | gemerged (PR #46)                                            |
| UI: Prüfungsmodus volle Breite, Markdown-Tabellen, Flip-Karten, Mobile-Layout                                                                                                                               | gemerged (PR #47)                                            |
| Final-Quality-Pass: SelfGrade-Konsistenz (Server-RPC), Edge-Function-Persistenzfehler, Attempt/Question-Kopplung, unabhängige Generator-Referenztests, echter Doppelabgabe-Test, sicheres Restore-Verfahren | **in Arbeit** (PR folgt, `fix/final-quality-pass`)           |

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
