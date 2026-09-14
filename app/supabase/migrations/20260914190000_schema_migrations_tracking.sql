-- Migrationsstand in der Datenbank festhalten.
--
-- Bis hierher gab es keinen Ort, an dem stand, welche Migrationen auf einer
-- Datenbank bereits gelaufen sind. Die Folgen davon sind im Projekt zweimal
-- konkret aufgetreten:
--
--   * 13.09.2026: Ein Container-Rebuild brachte Anwendungscode live, dessen
--     Migration auf der Produktionsdatenbank fehlte -- die Probepruefungsseite
--     brach.
--   * 14.09.2026: 50 Tabellen und 38 Funktionen existierten ausschliesslich in
--     der Live-Datenbank, ohne jede Entsprechung im Repository
--     (siehe ADR-0006 und Migration 20260914170000).
--
-- Diese Tabelle ist die Grundlage fuer scripts/apply_migrations.py, das den
-- Soll-Zustand (Dateien in app/supabase/migrations/) gegen den Ist-Zustand
-- (Zeilen hier) vergleicht und den Unterschied anwendet statt ihn zu raten.
--
-- checksum ist der SHA-256 der Migrationsdatei zum Zeitpunkt der Anwendung.
-- Damit faellt auf, wenn eine bereits angewendete Migration nachtraeglich
-- editiert wurde -- der haeufigste Weg, auf dem Datenbanken unbemerkt
-- auseinanderlaufen.

create table if not exists public.schema_migrations (
  version    text primary key,
  applied_at timestamptz not null default now(),
  checksum   text
);

comment on table public.schema_migrations is
  'Angewendete Datenbankmigrationen. Gepflegt von scripts/apply_migrations.py, nicht von Hand.';

-- Kein Client hat hier etwas zu suchen: RLS an, bewusst KEINE Policy
-- (Deny-all) und keine Grants an anon/authenticated. Zugriff ausschliesslich
-- ueber supabase_admin bzw. service_role beim Deploy. Dasselbe Muster wie
-- ai_budget_daily; scripts/validate_migrations.py fuehrt die Tabelle
-- entsprechend in NO_POLICY_TABLES.
alter table public.schema_migrations enable row level security;

revoke all on public.schema_migrations from anon;
revoke all on public.schema_migrations from authenticated;
grant all on public.schema_migrations to service_role;
