# AP1-Trainer Web-App

Diese Subdirectory enthält die Web-App der AP1-Prüfungsvorbereitung (TanStack Start + React + Tailwind +
self-hosted Supabase). Allgemeine Anweisungen für Coding-Agents: siehe `../AGENTS.md` im Repo-Root.

## Stack & Build

- Runtime: Bun ≥ 1.2
- Framework: TanStack Start (Vite) mit React 19
- Styling: Tailwind 4 + shadcn/ui
- Backend: self-hosted Supabase (`supabase.alexle135.de`)
- Build: `bun run build` → Nitro-Output in `.output/`
- Tests: `bun run test` (Vitest)
- Linting: `bun run lint`

## Deployment

Live unter `pruefung.alexle135.de` seit 11.09.2026 (öffentlich). Hosting: Docker-Container hinter Traefik
auf dem armserver. Schema-Migrationen in `app/supabase/migrations/`, Edge Function `grade-exam-answer` für
die automatische KI-Bewertung (Amazon Nova Lite über AWS Bedrock).

Dokumentation: siehe `../docs/architecture.md` (Auth, Deploy, Verifikation, Content-Modell).
