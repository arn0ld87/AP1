# ADR-0004: App-Stack TanStack Start + Bun, CI je PR ohne Test-Runner

**Status:** Accepted · **Datum:** 11.09.2026 · **Stand:** [docs/architecture.md](../architecture.md)

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