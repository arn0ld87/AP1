# Status

Aktueller Stand der AP1-Plattform. Dies ist die Kurzübersicht — Detailgründe stehen in
[docs/context.md](context.md), die Entscheidungen in [docs/adr/](adr/).

## Stand 11.09.2026

| Bereich | Status |
|---|---|
| Tasks 1–9 (Migration, Auth, Content-Import, Rechnen üben) | gemerged (PR #33) |
| Tasks 10–13 (Wissenskarten, Lernblätter, Formelsammlung, Tagesplan) | gemerged (PR #34) |
| Tasks 14–15 (Probeprüfungen + KI-Bewertung, Fortschritt & Fehlerliste) | gemerged (PR #36) |
| Edge-Function-Fix (Env-Name, `verify_jwt`) | gemerged (PR #37) |
| CI-Checks je PR | live (PR #38) |
| Task 16: Live-Deploy `pruefung.alexle135.de` | **in Arbeit** (PR #39) |
| Doku: CI-Aufzeichnung | PR #40 (offen) |
| Agent-skills-Setup + CLAUDE.md-Refresh | PR #41 (offen) |

## CI (PR #38)

`.github/workflows/pr-check.yml` — je PR fünf parallele Checks: ESLint + Prettier, `tsc --noEmit`,
Vite-Build, `deno check` der Edge Function, `py_compile` der Migrationsskripte. Kein Test-Runner
(keine Test-Suite, siehe ADR-0004). Docs-only-PRs triggern keine Checks (paths-Filter).

## Offene Risiken / Nächste Schritte

1. **Task 16** (PR #39): Traefik-Routing + Edge-Function-Deploy finalisieren, dann Smoke-Test auf
   `pruefung.alexle135.de`.
2. **Bedrock-Fallback** (3.5 Haiku) noch ungetestet (ADR-0003).
3. **Keine Test-Suite** — Rechnen-Generatoren der App haben nur manuelle Absicherung (ADR-0004).
4. Doku-PRs **#40** und **#41** mergen, danach `docs/context.md` → Aktueller Stand aktualisieren.