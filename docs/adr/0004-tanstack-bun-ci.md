# ADR-0004: App-Stack TanStack Start + Bun, CI je PR ohne Test-Runner

**Status:** Accepted · **Datum:** 11.09.2026 · **Stand:** [docs/architecture.md](../architecture.md)

**Korrektur (14.09.2026):** Die ADR beschreibt die ursprüngliche Planung; der Titel („ohne
Test-Runner") gilt nicht mehr. Zwischenzeitlich wurde eine Testsuite implementiert: Vitest für
Generatoren und Prüfungs-Flow (darunter 1000 deterministische RAID-10-Regressionsfälle), Deno-Tests
für beide Edge Functions (39 Fälle: 26 für `grade-exam-answer`, 13 für `delete-account`). CI umfasst
8 Jobs (ESLint + Prettier, Typecheck, Vitest, Vite-Build, Deno-Check + Deno-Test,
Migration-Validation inkl. Deploy-Gate, `py_compile` der Skripte, Compose-Config), Trigger auf PR und
`main` ohne paths-Filter. Siehe [docs/architecture.md § Verifikation](../architecture.md#verifikation)
und `.github/workflows/pr-check.yml`.

## Kontext

Die App entstand im Lovable-Ökosystem (TanStack-Template mit shadcn/ui-Komponenten) und wurde nach
dem Pivot in `app/` eigenständig weitergeführt. Parallel gibt es kein pytest/vitest-Äquivalent und
keine Test-Suite — die Prüfungs-Prüfungsvorbereitung ist Zeit- statt Qualitätstreibend.

## Entscheidung

- **Stack:** TanStack Start + React 19 + Tailwind 4 + self-hosted Supabase; **Bun** als
  Package-Manager (`bun.lock` als SSoT) und Runtime.
- **CI** (`.github/workflows/pr-check.yml`, PR #38): fünf parallele Jobs je PR — ESLint + Prettier,
  `tsc --noEmit`, Vite-Build, `deno check` der Edge Function, `py_compile` der Migrationsskripte.
- **Kein automatisierter Test-Runner:** Es gibt keine Test-Suite; CI ersetzt sie nicht, deckt aber
  Lint/Typen/Build-Brüche ab.

## Konsequenzen

- PRs werden standardmäßig durch alle fünf Checks validiert; Docs-only-PRs triggern nichts
  (paths-Filter), veraltete Pushes werden abgebrochen (concurrency).
- `deno check` hat beim ersten Lauf einen realen Typfehler in `grade-exam-answer.ts` gefunden —
  der Check zahlt sich bereits aus.
- Fehlende Test-Suite bleibt bekanntes Risiko (v. a. für Rechnen-Generatoren der App); UX-Regressionen
  fallen erst beim manuellen Prüf-Run auf.