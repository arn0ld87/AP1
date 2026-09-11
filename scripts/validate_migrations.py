#!/usr/bin/env python3
"""Wendet alle Supabase-Migrationen auf eine frische Test-DB an und prüft
das resultierende Schema (Tabellen, Drift-Spalten, RLS, Policies, RPCs,
Unique-Index). Benötigt psql im PATH und TEST_DATABASE_URL (Voreinstellung:
postgres://postgres:postgres@localhost:5432/postgres, leerer Postgres-Server).

Nutzung in CI: Postgres-Service-Container starten, dann dieses Skript laufen
lassen. Beendet sich mit Exit-Code 1, wenn eine Erwartung verletzt ist.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
MIGRATIONS = REPO / "app" / "supabase" / "migrations"

DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres"
)

# Minimaler auth-Schema-Ersatz für reines Postgres (Supabase liefert das
# produktiv selbst): auth.users-Tabelle + auth.uid() aus dem JWT-Claim +
# die Supabase-Rollen, auf die die Migrationen GRANTs ausführen.
AUTH_STUB = """
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end
$$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid());
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
"""

EXPECT_TABLES = ["topic_mastery", "flashcard_progress", "exam_questions", "exam_attempts", "exam_answers", "error_log"]

# Spalten, die historisch nur manuell in der Live-DB existierten (Drift)
EXPECT_COLUMNS = {
    "exam_questions": ["intro", "ausgangssituation"],
    "error_log": ["erledigt"],
    "exam_answers": ["user_id", "ki_punkte", "ki_feedback"],
}

EXPECT_RPC = ["increment_topic_mastery", "increment_flashcard_progress"]

EXPECT_UNIQUE_INDEX = "exam_answers_attempt_question_uq"


def psql(sql: str, database_url: str = DATABASE_URL) -> str:
    proc = subprocess.run(
        ["psql", database_url, "--no-psqlrc", "--tuples-only", "--no-align", "--set", "ON_ERROR_STOP=1"],
        input=sql,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        print(f"psql fehlgeschlagen:\n{proc.stderr}", file=sys.stderr)
        raise SystemExit(1)
    return proc.stdout.strip()


def scalar(sql: str) -> str:
    return psql(sql).splitlines()[0].strip() if psql(sql) else ""


def main() -> int:
    failures: list[str] = []

    # 1) auth-Stub + alle Migrationen in Dateinamen-Reihenfolge anwenden
    psql("drop schema public cascade; create schema public;")
    psql(AUTH_STUB)
    migrations = sorted(MIGRATIONS.glob("*.sql"))
    if not migrations:
        print(f"Keine Migrationen in {MIGRATIONS} gefunden", file=sys.stderr)
        return 1
    for m in migrations:
        psql(m.read_text(encoding="utf-8"))
        print(f"angewendet: {m.name}")

    # 2) Tabellen vorhanden?
    tables = {r for r in psql(
        "select tablename from pg_tables where schemaname = 'public';"
    ).splitlines() if r}
    for t in EXPECT_TABLES:
        if t not in tables:
            failures.append(f"Tabelle fehlt: {t}")

    # 3) Drift-Spalten vorhanden?
    for table, cols in EXPECT_COLUMNS.items():
        have = {r for r in psql(
            "select column_name from information_schema.columns "
            f"where table_schema = 'public' and table_name = '{table}';"
        ).splitlines() if r}
        for c in cols:
            if c not in have:
                failures.append(f"Spalte fehlt: {table}.{c}")

    # 4) RLS aktiv auf allen Tabellen?
    unsecured = {r for r in psql(
        "select tablename from pg_tables "
        "where schemaname = 'public' and rowsecurity = false;"
    ).splitlines() if r}
    for t in sorted(unsecured & set(EXPECT_TABLES)):
        failures.append(f"RLS nicht aktiv: {t}")

    # 5) Policies vorhanden?
    policies = {r for r in psql(
        "select tablename from pg_policies where schemaname = 'public';"
    ).splitlines() if r}
    for t in EXPECT_TABLES:
        if t not in policies:
            failures.append(f"Keine RLS-Policy: {t}")

    # 6) RPCs vorhanden und ausführbar?
    fns = {r for r in psql(
        "select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace "
        "where n.nspname = 'public';"
    ).splitlines() if r}
    for f in EXPECT_RPC:
        if f not in fns:
            failures.append(f"RPC fehlt: {f}")

    # 7) Unique-Index gegen Bewertungs-Dubletten?
    idx = scalar(
        "select count(*) from pg_indexes "
        f"where schemaname = 'public' and indexname = '{EXPECT_UNIQUE_INDEX}';"
    )
    if idx != "1":
        failures.append(f"Unique-Index fehlt: {EXPECT_UNIQUE_INDEX}")

    # 8) Seed/Smoke: Insert + RPC-Ausführung funktionieren schematisch
    psql("insert into auth.users (id) values ('11111111-1111-1111-1111-111111111111') on conflict do nothing;")
    psql("select public.increment_topic_mastery('subnetting', true);")
    got = scalar("select richtig from public.topic_mastery limit 1;")
    if got != "1":
        failures.append(f"RPC-Inkrement unerwartet: richtig={got}")

    if failures:
        print("SCHEMA-VALIDIERUNG FEHLGESCHLAGEN:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("Schema-Validierung OK: Tabellen, Drift-Spalten, RLS, Policies, RPCs, Unique-Index, RPC-Smoke.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
