# ADR-0005: Deploy-Ziel Traefik auf dem armserver (`pruefung.alexle135.de`)

**Status:** Proposed (Task 16 in Arbeit, PR #39) · **Datum:** 11.09.2026 · **Stand:** [docs/architecture.md](../architecture.md)

## Kontext

Nach dem Pivot (ADR-0001) ist der armserver das Hosting-Zuhause. Der Build-Output der App ist
Nitro und damit Cloudflare-Worker-kompatibel — die ursprüngliche Planung sah bewusst kein Deploy
vor („out of scope"), seit dem Selbsthosting ist ein erreichbares Deployment aber das eigentliche
Ziel der Plattform.

## Entscheidung

Deploy als Worker-kompatibles Nitro-Build hinter **Traefik auf dem armserver** unter
`pruefung.alexle135.de`. Umsetzung in PR #39 (offen): Traefik-Routing + Edge Function. Kein
Cloudflare-/Vercel-Deploysystem, kein zusätzlicher CI-Deploy-Workflow — Deploy bleibt manuell
bzw. über den laufenden Task 16.

## Konsequenzen

- Kein externer Cloud-Abhängiger im Deploy-Pfad; Daten (Supabase) und App bleiben auf demselben
  Host-Umfeld (Tailscale/Alex-Infrastruktur).
- CI läuft nur als PR-Check (ADR-0004) — kein Auto-Deploy nach Merge; Stand nach `main` manuell
  nachziehen.
- Solange PR #39 nicht gemerged ist, existiert kein Live-Deploy (Build-Output lokal erzeugbar:
  `bun run build` in `app/`).