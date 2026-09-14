#!/usr/bin/env python3
"""Wendet alle Supabase-Migrationen auf eine frische Test-DB an und prüft
das resultierende Schema (Tabellen, Drift-Spalten, RLS, Policies, RPCs,
Fremdschlüssel, Unique-Index). Benötigt psql im PATH und TEST_DATABASE_URL
(explizit gesetzt — das Skript löscht das public-Schema der Ziel-DB und
verweigert ohne Ziel-Angabe die Ausführung).

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

DATABASE_URL = os.environ.get("TEST_DATABASE_URL", "")

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

EXPECT_TABLES = [
    "topic_mastery",
    "flashcard_progress",
    "exam_questions",
    "exam_attempts",
    "exam_answers",
    "error_log",
    "ai_budget_daily",
]

# Spalten, die historisch nur manuell in der Live-DB existierten (Drift)
EXPECT_COLUMNS = {
    "exam_questions": ["intro", "ausgangssituation", "visual_type", "visual_data", "visual_path", "visual_alt", "answer_schema"],
    "error_log": ["erledigt"],
    "exam_answers": ["user_id", "ki_punkte", "ki_feedback"],
}

EXPECT_RPC = [
    "increment_topic_mastery",
    "increment_flashcard_progress",
    "submit_self_grade",
    "finish_exam_attempt",
    "consume_ai_budget",
    "release_ai_budget",
]

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
    out = psql(sql)
    return out.splitlines()[0].strip() if out else ""


def scalar_last(sql: str) -> str:
    """Wie scalar(), aber letzte Ausgabezeile — für Aufrufe, bei denen dem
    eigentlichen Statement ein set_config() im selben psql-Aufruf vorausgeht
    (set_config selbst gibt ebenfalls eine Ergebniszeile aus)."""
    lines = [l for l in psql(sql).splitlines() if l.strip()]
    return lines[-1].strip() if lines else ""


def psql_expect_fail(sql: str) -> bool:
    """Führt sql aus, ohne bei Fehlschlag abzubrechen. True = psql ist mit
    Fehler beendet (erwartetes RAISE EXCEPTION, z.B. Clamping/Ownership)."""
    proc = subprocess.run(
        ["psql", DATABASE_URL, "--no-psqlrc", "--tuples-only", "--no-align", "--set", "ON_ERROR_STOP=1"],
        input=sql,
        capture_output=True,
        text=True,
    )
    return proc.returncode != 0


def main() -> int:
    failures: list[str] = []

    # 0) Schutz vor dem destruktiven Reset: Ohne explizit gesetzte
    #    TEST_DATABASE_URL wird nicht ausgeführt — kein stiller psql-Aufruf
    #    gegen eine lokale Standarddatenbank.
    if not DATABASE_URL:
        print(
            "TEST_DATABASE_URL ist nicht gesetzt. Das Skript löscht das "
            "public-Schema der Ziel-DB (drop schema public cascade); ohne "
            "explizite Ziel-Datenbank bricht es hier ab.",
            file=sys.stderr,
        )
        return 1

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

    # 5) Policies vorhanden? Ausnahme: ai_budget_daily wird bewusst ohne
    #    Policy betrieben — RLS ohne Policy wirkt als Deny-all, Zugriff
    #    läuft ausschließlich über die security-definer-RPCs. Für diese
    #    Tabelle wird zusätzlich positiv geprüft, dass KEINE Policy
    #    existiert (Block 11a sichert die fehlenden Grants ab).
    NO_POLICY_TABLES = {"ai_budget_daily"}
    policies = {r for r in psql(
        "select tablename from pg_policies where schemaname = 'public';"
    ).splitlines() if r}
    for t in EXPECT_TABLES:
        if t in NO_POLICY_TABLES:
            if t in policies:
                failures.append(f"RLS-Policy unerwünscht (Deny-all über RLS): {t}")
        elif t not in policies:
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

    # 7b) FK exam_answers.user_id → auth.users (Schema-Drift-Wächter)
    fk = scalar(
        "select count(*) from pg_constraint "
        "where conname = 'exam_answers_user_id_fkey' "
        "and conrelid = 'public.exam_answers'::regclass and contype = 'f';"
    )
    if fk != "1":
        failures.append("Fremdschlüssel fehlt: exam_answers_user_id_fkey")

    # 8) Seed/Smoke: Insert + RPC-Ausführung im simulierten JWT-Kontext.
    #    Wichtig: set_config gilt nur pro Session — Auth-Kontext und RPC
    #    müssen in EINEM psql-Aufruf laufen.
    user_id = "11111111-1111-1111-1111-111111111111"
    psql(f"insert into auth.users (id) values ('{user_id}') on conflict do nothing;")
    psql(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        "select public.increment_topic_mastery('subnetting', true);"
    )
    got = psql(
        f"select richtig from public.topic_mastery where user_id = '{user_id}' limit 1;"
    )
    if got != "1":
        failures.append(f"RPC-Inkrement unerwartet: richtig={got}")

    # 9) submit_self_grade: Ownership, Clamping, atomare Summenneuberechnung
    #    in exam_attempts.gesamtpunkte, Ersetzen statt Aufaddieren bei
    #    wiederholter Selbsteinschätzung derselben Frage (Regression: die
    #    Summe blieb bisher nach SelfGrade auf dem Stand der ursprünglichen
    #    Abgabe, siehe Migration 20260914000000).
    other_user_id = "22222222-2222-2222-2222-222222222222"
    sg_attempt_id = "33333333-3333-3333-3333-333333333333"
    sg_question_id = "self-grade-test-frage"
    sg_exam_id = "self-grade-test-exam"
    psql(f"insert into auth.users (id) values ('{other_user_id}') on conflict do nothing;")
    psql(
        f"insert into public.exam_questions (id, exam_id, max_punkte) "
        f"values ('{sg_question_id}', '{sg_exam_id}', 10) on conflict (id) do nothing;"
    )
    psql(
        f"insert into public.exam_attempts (id, user_id, exam_id) "
        f"values ('{sg_attempt_id}', '{user_id}', '{sg_exam_id}') on conflict (id) do nothing;"
    )

    ret1 = scalar_last(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.submit_self_grade('{sg_attempt_id}', '{sg_question_id}', 'erste Antwort', 7);"
    )
    if ret1 != "7":
        failures.append(f"submit_self_grade: erwartete Rückgabe 7, bekam {ret1!r}")
    persisted1 = scalar(f"select gesamtpunkte from public.exam_attempts where id = '{sg_attempt_id}';")
    if persisted1 != "7":
        failures.append(f"submit_self_grade: exam_attempts.gesamtpunkte erwartet 7, ist {persisted1!r}")

    # Erneute Selbsteinschätzung derselben Frage muss ERSETZEN, nicht addieren.
    ret2 = scalar_last(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.submit_self_grade('{sg_attempt_id}', '{sg_question_id}', 'korrigierte Antwort', 3);"
    )
    if ret2 != "3":
        failures.append(
            f"submit_self_grade: erneute Bewertung erwartet 3 (ersetzt, nicht 7+3=10), bekam {ret2!r}"
        )
    persisted2 = scalar(f"select gesamtpunkte from public.exam_attempts where id = '{sg_attempt_id}';")
    if persisted2 != "3":
        failures.append(
            f"submit_self_grade: exam_attempts.gesamtpunkte nach erneuter Bewertung erwartet 3, ist {persisted2!r}"
        )

    # Clamping: negative Punkte und Punkte > max_punkte müssen abgelehnt werden.
    if not psql_expect_fail(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.submit_self_grade('{sg_attempt_id}', '{sg_question_id}', 'x', -1);"
    ):
        failures.append("submit_self_grade: punkte=-1 hätte abgelehnt werden müssen")
    if not psql_expect_fail(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.submit_self_grade('{sg_attempt_id}', '{sg_question_id}', 'x', 11);"
    ):
        failures.append("submit_self_grade: punkte=11 > max_punkte=10 hätte abgelehnt werden müssen")
    persisted3 = scalar(f"select gesamtpunkte from public.exam_attempts where id = '{sg_attempt_id}';")
    if persisted3 != "3":
        failures.append(
            f"submit_self_grade: abgelehnte Clamping-Versuche dürfen gesamtpunkte nicht verändern, ist {persisted3!r}"
        )

    # Ownership: fremder Nutzer darf denselben Attempt nicht bewerten.
    if not psql_expect_fail(
        f"select set_config('request.jwt.claim.sub', '{other_user_id}', false);\n"
        f"select public.submit_self_grade('{sg_attempt_id}', '{sg_question_id}', 'x', 5);"
    ):
        failures.append("submit_self_grade: fremder Nutzer hätte abgelehnt werden müssen (Ownership)")

    # Attempt/Frage-Kopplung: Frage aus einer anderen Prüfung muss abgelehnt
    # werden, auch wenn der Attempt dem Nutzer gehört.
    fremde_question_id = "self-grade-test-fremde-frage"
    psql(
        f"insert into public.exam_questions (id, exam_id, max_punkte) "
        f"values ('{fremde_question_id}', 'ein-anderes-exam', 10) on conflict (id) do nothing;"
    )
    if not psql_expect_fail(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.submit_self_grade('{sg_attempt_id}', '{fremde_question_id}', 'x', 5);"
    ):
        failures.append(
            "submit_self_grade: Frage aus fremder Prüfung hätte abgelehnt werden müssen (Exam-Kopplung)"
        )

    # NULL-Punkte dürfen das Clamping nicht umgehen.
    if not psql_expect_fail(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.submit_self_grade('{sg_attempt_id}', '{sg_question_id}', 'x', null);"
    ):
        failures.append("submit_self_grade: punkte=NULL hätte abgelehnt werden müssen")

    # Nach allen abgelehnten Versuchen muss die Summe unverändert bei 3 stehen.
    persisted4 = scalar(f"select gesamtpunkte from public.exam_attempts where id = '{sg_attempt_id}';")
    if persisted4 != "3":
        failures.append(
            f"submit_self_grade: abgelehnte Aufrufe dürfen gesamtpunkte nicht verändern, ist {persisted4!r}"
        )

    # Direktschreibzugriff auf exam_answers ist für authenticated entzogen —
    # Schreiben ausschließlich über die RPC bzw. die Edge Function (service_role).
    for privilege in ("INSERT", "UPDATE"):
        granted = scalar(
            "select count(*) from information_schema.role_table_grants "
            "where table_schema = 'public' and table_name = 'exam_answers' "
            f"and grantee = 'authenticated' and privilege_type = '{privilege}';"
        )
        if granted != "0":
            failures.append(
                f"exam_answers: {privilege} für authenticated haette entzogen sein muessen "
                f"(count={granted})"
            )
    select_granted = scalar(
        "select count(*) from information_schema.role_table_grants "
        "where table_schema = 'public' and table_name = 'exam_answers' "
        "and grantee = 'authenticated' and privilege_type = 'SELECT';"
    )
    if select_granted != "1":
        failures.append("exam_answers: SELECT für authenticated fehlt (Ergebnisanzeige)")

    # 10) finish_exam_attempt + exam_attempts-Rechte (Migration 20260914140000).
    #     Regression P0: gesamtpunkte/finished_at waren vom Client frei setzbar,
    #     der Abschluss lief als direktes UPDATE auf exam_attempts.
    #
    # 10a) UPDATE auf exam_attempts ist entzogen — kein Client-Pfad darf ein
    #      Ergebnis schreiben.
    upd_granted = scalar(
        "select count(*) from information_schema.role_table_grants "
        "where table_schema = 'public' and table_name = 'exam_attempts' "
        "and grantee = 'authenticated' and privilege_type = 'UPDATE';"
    )
    if upd_granted != "0":
        failures.append(
            f"exam_attempts: UPDATE für authenticated hätte entzogen sein müssen (count={upd_granted})"
        )

    # 10b) INSERT nur noch spaltenweise auf exam_id/user_id — gesamtpunkte und
    #      finished_at dürfen beim Anlegen nicht mitgegeben werden können.
    insert_cols = {
        r
        for r in psql(
            "select column_name from information_schema.column_privileges "
            "where table_schema = 'public' and table_name = 'exam_attempts' "
            "and grantee = 'authenticated' and privilege_type = 'INSERT';"
        ).splitlines()
        if r
    }
    if insert_cols != {"exam_id", "user_id"}:
        failures.append(
            "exam_attempts: INSERT-Spalten für authenticated erwartet {'exam_id','user_id'}, "
            f"sind {sorted(insert_cols)}"
        )
    sel_attempts = scalar(
        "select count(*) from information_schema.role_table_grants "
        "where table_schema = 'public' and table_name = 'exam_attempts' "
        "and grantee = 'authenticated' and privilege_type = 'SELECT';"
    )
    if sel_attempts != "1":
        failures.append("exam_attempts: SELECT für authenticated fehlt (Statusliste/Ergebnis)")

    # 10c) Smoke: Summe kommt aus exam_answers, nicht vom Aufrufer.
    fe_attempt_id = "44444444-4444-4444-4444-444444444444"
    psql(
        f"insert into public.exam_attempts (id, user_id, exam_id) "
        f"values ('{fe_attempt_id}', '{user_id}', '{sg_exam_id}') on conflict (id) do nothing;"
    )
    # Zwei bewertete Antworten (4 + 6) und eine unbewertete (null → zählt 0).
    zweite_frage_id = "finish-test-frage-2"
    dritte_frage_id = "finish-test-frage-3"
    for qid in (zweite_frage_id, dritte_frage_id):
        psql(
            f"insert into public.exam_questions (id, exam_id, max_punkte) "
            f"values ('{qid}', '{sg_exam_id}', 10) on conflict (id) do nothing;"
        )
    psql(
        f"insert into public.exam_answers (attempt_id, question_id, antworttext, ki_punkte) values "
        f"('{fe_attempt_id}', '{sg_question_id}', 'a', 4), "
        f"('{fe_attempt_id}', '{zweite_frage_id}', 'b', 6), "
        f"('{fe_attempt_id}', '{dritte_frage_id}', 'c', null);"
    )
    fe_ret = scalar_last(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.finish_exam_attempt('{fe_attempt_id}');"
    )
    if fe_ret != "10":
        failures.append(f"finish_exam_attempt: erwartete Summe 10 (4+6+0), bekam {fe_ret!r}")
    fe_persisted = scalar(
        f"select gesamtpunkte from public.exam_attempts where id = '{fe_attempt_id}';"
    )
    if fe_persisted != "10":
        failures.append(
            f"finish_exam_attempt: exam_attempts.gesamtpunkte erwartet 10, ist {fe_persisted!r}"
        )
    fe_finished = scalar(
        f"select finished_at is not null from public.exam_attempts where id = '{fe_attempt_id}';"
    )
    if fe_finished != "t":
        failures.append("finish_exam_attempt: finished_at wurde nicht gesetzt")

    # 10d) Idempotenz: erneuter Abschluss aktualisiert die Summe, verschiebt aber
    #      den ursprünglichen Abgabezeitpunkt nicht.
    erster_abschluss = scalar(
        f"select finished_at from public.exam_attempts where id = '{fe_attempt_id}';"
    )
    psql(
        f"update public.exam_answers set ki_punkte = 9 "
        f"where attempt_id = '{fe_attempt_id}' and question_id = '{sg_question_id}';"
    )
    fe_ret2 = scalar_last(
        f"select set_config('request.jwt.claim.sub', '{user_id}', false);\n"
        f"select public.finish_exam_attempt('{fe_attempt_id}');"
    )
    if fe_ret2 != "15":
        failures.append(f"finish_exam_attempt: erneuter Abschluss erwartet 15 (9+6+0), bekam {fe_ret2!r}")
    zweiter_abschluss = scalar(
        f"select finished_at from public.exam_attempts where id = '{fe_attempt_id}';"
    )
    if erster_abschluss != zweiter_abschluss:
        failures.append(
            "finish_exam_attempt: finished_at darf beim erneuten Abschluss nicht verschoben werden "
            f"({erster_abschluss!r} → {zweiter_abschluss!r})"
        )

    # 10e) Ownership: fremder Nutzer darf den Attempt nicht abschließen.
    if not psql_expect_fail(
        f"select set_config('request.jwt.claim.sub', '{other_user_id}', false);\n"
        f"select public.finish_exam_attempt('{fe_attempt_id}');"
    ):
        failures.append("finish_exam_attempt: fremder Nutzer hätte abgelehnt werden müssen (Ownership)")

    # 11) ai_budget_daily + atomares KI-Tageslimit (Migration 20260914150000).
    #     Regression P1-3: read-then-act-Race in der Edge Function.
    #
    # 11a) Keine Client-Rechte an der Tabelle — Zugriff nur über die
    #      security-definer-RPCs (Edge Function mit service_role).
    budget_grants = scalar(
        "select count(*) from information_schema.role_table_grants "
        "where table_schema = 'public' and table_name = 'ai_budget_daily' "
        "and grantee in ('anon', 'authenticated');"
    )
    if budget_grants != "0":
        failures.append(
            f"ai_budget_daily: keine Grants für anon/authenticated erwartet (count={budget_grants})"
        )

    # 11b) EXECUTE auf beide Budget-RPCs ist anon/authenticated entzogen.
    budget_exec = scalar(
        "select count(*) from information_schema.role_routine_grants "
        "where routine_schema = 'public' "
        "and routine_name in ('consume_ai_budget', 'release_ai_budget') "
        "and grantee in ('anon', 'authenticated');"
    )
    if budget_exec != "0":
        failures.append(
            "Budget-RPCs: EXECUTE für anon/authenticated hätte entzogen sein müssen "
            f"(count={budget_exec})"
        )

    # 11c) Smoke — atomares Limit mit p_limit=2: zwei Reservierungen gehen
    #      durch, die dritte wird abgelehnt.
    budget_user = "55555555-5555-5555-5555-555555555555"
    psql(f"insert into auth.users (id) values ('{budget_user}') on conflict (id) do nothing;")
    c1 = scalar(f"select public.consume_ai_budget('{budget_user}', 2);")
    c2 = scalar(f"select public.consume_ai_budget('{budget_user}', 2);")
    c3 = scalar(f"select public.consume_ai_budget('{budget_user}', 2);")
    if (c1, c2, c3) != ("t", "t", "f"):
        failures.append(
            f"consume_ai_budget: erwartet t,t,f bei p_limit=2 — bekam {c1!r},{c2!r},{c3!r}"
        )

    # 11d) release gibt ein Stück zurück; danach ist die Reservierung wieder
    #      möglich.
    psql(f"select public.release_ai_budget('{budget_user}');")
    c4 = scalar(f"select public.consume_ai_budget('{budget_user}', 2);")
    if c4 != "t":
        failures.append(f"release_ai_budget: nach Freigabe consume=false (bekam {c4!r})")

    # 11e) Budgets sind je Nutzer isoliert.
    c_other = scalar(f"select public.consume_ai_budget('{other_user_id}', 2);")
    if c_other != "t":
        failures.append(
            f"consume_ai_budget: fremder Nutzer hätte eigenes Budget haben müssen (bekam {c_other!r})"
        )

    # 11f) p_user null wird abgelehnt.
    if not psql_expect_fail("select public.consume_ai_budget(null, 2);"):
        failures.append("consume_ai_budget: p_user=NULL hätte abgelehnt werden müssen")

    if failures:
        print("SCHEMA-VALIDIERUNG FEHLGESCHLAGEN:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print(
        "Schema-Validierung OK: Tabellen, Drift-Spalten, RLS, Policies, RPCs, Fremdschlüssel, "
        "Unique-Index, RPC-Smoke, Schreibrechte auf exam_answers/exam_attempts, "
        "atomares KI-Tageslimit."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
