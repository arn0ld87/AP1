# Status

Aktueller Stand der AP1-Plattform. Dies ist die Kurzübersicht — Detailgründe stehen in
[docs/context.md](context.md), die Entscheidungen in [docs/adr/](adr/).

## Stand 11.09.2026 (Remediation)

| Bereich | Status |
|---|---|
| Tasks 1–9 (Migration, Auth, Content-Import, Rechnen üben) | gemerged (PR #33) |
| Tasks 10–13 (Wissenskarten, Lernblätter, Formelsammlung, Tagesplan) | gemerged (PR #34) |
| Tasks 14–15 (Probeprüfungen + KI-Bewertung, Fortschritt & Fehlerliste) | gemerged (PR #36) |
| Edge-Function-Fix (Env-Name, `verify_jwt`) | gemerged (PR #37) |
| CI-Checks je PR | live (PR #38) |
| Task 16: Live-Deploy `pruefung.alexle135.de` | live (PR #39) |
| Doku: CI-Aufzeichnung (PR #40), Agent-Skills-Setup (PR #41), ADRs 0001–0005 + Status (PR #42), Dashboard-Startseite (PR #43) | gemerged |
| Remediation (`fix/remediation-all`): Bestehenslogik, RAID-10, Prüfungs-Persistenz, Schema-Drift, Edge-Function-Härtung, Tests, CI-Gate | **in Arbeit** (PR folgt) |

## CI (PR #38, erweitert durch Remediation)

`.github/workflows/pr-check.yml` — je PR und auf `main`: ESLint + Prettier, `tsc --noEmit`,
Vitest (`bun run test`), Vite-Build, `deno check` + `deno test` der Edge Function,
Migration-Validierung auf frischer Postgres-Testinstanz (`scripts/validate_migrations.py`),
`py_compile` der Python-Skripte, `docker compose config`.

## Testabdeckung

- Generatoren: RAID-10-Regression (1000 deterministische Fälle) + Invarianten je Familie,
  Seed-Determinismus
- Prüfungs-Flow: Notenschlüssel (ohne Bestehenslogik), Einzelfehler-Fallback,
  Summen-Konsistenz, Persistenz-Reihenfolge, Doppelabgabe-Schutz
- Wissenskarten: Gewichtung `(falsch+1)/(richtig+falsch+2)` — neue Karten bleiben im Pool
- Content: 3 Probeprüfungen à exakt 100 Punkte, vollständige Teilaufgaben, eindeutige Schlüssel
- Edge Function: 16 Deno-Szenarien (Auth, Ownership, Bedrock-Fehler, Persistenz)

## Offene Risiken / Nächste Schritte

1. End-To-End-Check live: einmal mit echtem Login eine Probeprüfung durchspielen.
2. Branch Protection + Required Status Checks für `main` in den GitHub-Repo-Settings aktivieren
   (Lint, Typecheck, Tests, Build, Migration-Validation) — Settings sind nicht per Repo-Datei
   erzwingbar.
3. Backup/Restore-Verfahren regelmäßig testen ([backup-restore.md](backup-restore.md)).
