# ADR-0001: Web-App statt Lovable — Migration auf self-hosted Supabase

**Status:** Accepted · **Datum:** 10.09.2026 · **Stand:** [docs/context.md](../context.md)

## Kontext

Die genehmigte Spezifikation ging von einer reinen Lovable-App aus (Lovable-MCP, von Lovable verwaltetes
Supabase-Projekt). Der Lovable-Credit-Stopp machte diesen Weg unmöglich — einerseits als Build-Umgebung,
andererseits als Backend-Betreiber.

## Entscheidung

Direkte Implementierung in `app/` (TanStack Start) mit **self-hosted Supabase auf dem armserver**
(`supabase.alexle135.de`). Schema-Migrationen liegen in `app/supabase/migrations/`, angewendet per
`psql` im Container `supabase-db`. Kein Lovable-Build-Loop mehr; Deploy-Ziel ist Traefik auf dem
armserver (Task 16, siehe ADR-0005).

## Konsequenzen

- Volle Kontrolle über Schema, Auth und Edge Functions; keine Credit-/Limit-Abhängigkeit.
- Betrieb (Backups, Updates, Secrets) liegt bei Alex statt beim SaaS-Anbieter.
- Deploy-Pipeline fehlte zunächst (bewusst out of scope, inzwischen als Task 16 nachgezogen).