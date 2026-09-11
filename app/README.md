# app/ — AP1-Trainer Web-App

TanStack Start (Vite + React 19 + TypeScript), Tailwind + shadcn/ui, Nitro-Build.
Backend: self-hosted Supabase (`supabase.alexle135.de`), Auth per E-Mail+Passwort (Single-User),
RLS auf allen Tabellen. Details: [../docs/architecture.md](../docs/architecture.md).

## Entwicklung

Voraussetzung: [Bun](https://bun.sh) ≥ 1.2.

```sh
bun install
cp .env.example .env   # Werte eintragen (publishable key, nicht committen)
bun run dev            # Dev-Server mit HMR
```

## Checks

```sh
bun run lint           # ESLint
bun run test           # Vitest: Generatoren, Prüfungs-Flow, Wissenskarten, Content
bunx tsc --noEmit      # TypeScript
bun run build          # Produktions-Build (Nitro)
```

Edge Function: `deno check supabase/functions/grade-exam-answer.ts` und
`deno test --allow-env supabase/functions/`.

## Supabase

- Migrationen: `app/supabase/migrations/` (frische DB entsteht vollständig daraus;
  Prüfung: `python3 scripts/validate_migrations.py`)
- Edge Function `grade-exam-answer`: Bedrock-KI-Bewertung, Details in
  [../docs/api.md](../docs/api.md)

## Gebaut mit

- TanStack Start, TypeScript, React 19
- Tailwind CSS, shadcn/ui
- Supabase (self-hosted), Amazon Bedrock
