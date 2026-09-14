#!/usr/bin/env python3
"""Gleicht die Migrationsdateien im Repository gegen den in der Datenbank
festgehaltenen Stand ab (Tabelle `public.schema_migrations`).

Hintergrund: Bis zum 14.09.2026 wurden Migrationen auf dem armserver von Hand
eingespielt, ohne dass irgendwo stand, welche bereits liefen. Zweimal ist das
konkret schiefgegangen — einmal brach eine fehlende Migration die
Probeprüfungsseite (13.09.), einmal liefen Repository und Produktion um
50 Tabellen auseinander (14.09., siehe ADR-0006). Dieses Skript ersetzt das
Raten durch einen Abgleich.

## Modi

    --check       Listet ausstehende Migrationen. Exit 1, wenn welche fehlen
                  oder eine bereits angewendete Datei nachträglich geändert
                  wurde. Für das Deploy-Gate und für CI.
    --apply       Wendet ausstehende Migrationen in Dateinamen-Reihenfolge an,
                  jede in einer eigenen Transaktion, und trägt sie ein.
                  Danach `notify pgrst, 'reload schema'`.
    --baseline    Trägt alle vorhandenen Migrationen als angewendet ein, OHNE
                  sie auszuführen. Einmalig für eine Datenbank, die den
                  Zielzustand bereits hat (die Produktion am 14.09.2026).
    --status      Zeigt den Stand, ändert nichts, Exit immer 0.

## Datenbankzugriff

Standardmäßig `psql "$DATABASE_URL"`. Läuft die Datenbank in einem Container
ohne exponierten Port — wie auf dem armserver —, lässt sich das Kommando
vollständig ersetzen:

    AP1_PSQL="docker exec -i supabase-db psql -U supabase_admin -d postgres" \\
      python3 scripts/apply_migrations.py --check

Genau ein Weg muss gesetzt sein: entweder AP1_PSQL oder DATABASE_URL.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import shlex
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
MIGRATIONS = REPO / "app" / "supabase" / "migrations"

# Die Migration, die die Tracking-Tabelle selbst anlegt. Sie muss angewendet
# sein, bevor irgendetwas eingetragen werden kann — beim ersten Lauf gegen eine
# frische Datenbank wird sie deshalb gesondert behandelt.
TRACKING_MIGRATION = "20260914190000_schema_migrations_tracking.sql"


def psql_argv() -> list[str]:
    """Kommando für einen psql-Aufruf, der SQL über stdin entgegennimmt."""
    override = os.environ.get("AP1_PSQL", "").strip()
    if override:
        return shlex.split(override)
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        print(
            "Weder AP1_PSQL noch DATABASE_URL gesetzt — ohne Ziel wird nichts "
            "angefasst.\n"
            "  lokal:      DATABASE_URL='postgres://…' python3 scripts/apply_migrations.py --check\n"
            "  armserver:  AP1_PSQL='docker exec -i supabase-db psql -U supabase_admin -d postgres' \\\n"
            "                python3 scripts/apply_migrations.py --check",
            file=sys.stderr,
        )
        raise SystemExit(2)
    return ["psql", url]


def run_sql(sql: str, *, single_transaction: bool = False) -> tuple[int, str, str]:
    argv = psql_argv() + ["--no-psqlrc", "--tuples-only", "--no-align", "--set", "ON_ERROR_STOP=1"]
    if single_transaction:
        argv.append("--single-transaction")
    proc = subprocess.run(argv, input=sql, capture_output=True, text=True)
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def query(sql: str) -> str:
    rc, out, err = run_sql(sql)
    if rc != 0:
        print(f"psql fehlgeschlagen:\n{err}", file=sys.stderr)
        raise SystemExit(1)
    return out


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def migrationsdateien() -> list[Path]:
    dateien = sorted(MIGRATIONS.glob("*.sql"))
    if not dateien:
        print(f"Keine Migrationen in {MIGRATIONS} gefunden", file=sys.stderr)
        raise SystemExit(1)
    return dateien


def tracking_vorhanden() -> bool:
    return query(
        "select count(*) from information_schema.tables "
        "where table_schema='public' and table_name='schema_migrations';"
    ).splitlines()[0].strip() == "1"


def angewendet() -> dict[str, str]:
    """version -> checksum (leerer String, wenn ohne Checksum eingetragen)."""
    if not tracking_vorhanden():
        return {}
    out = query("select version || '\t' || coalesce(checksum,'') from public.schema_migrations;")
    stand: dict[str, str] = {}
    for zeile in out.splitlines():
        if not zeile.strip():
            continue
        version, _, checksum = zeile.partition("\t")
        stand[version.strip()] = checksum.strip()
    return stand


def eintragen(version: str, checksum: str) -> None:
    rc, _, err = run_sql(
        "insert into public.schema_migrations (version, checksum) values "
        f"('{version}', '{checksum}') "
        "on conflict (version) do update set checksum = excluded.checksum;"
    )
    if rc != 0:
        print(f"Eintrag in schema_migrations fehlgeschlagen: {err}", file=sys.stderr)
        raise SystemExit(1)


def analyse() -> tuple[list[Path], list[tuple[str, str, str]]]:
    """(ausstehend, geaendert) — geaendert: (version, checksum_db, checksum_datei)."""
    stand = angewendet()
    ausstehend: list[Path] = []
    geaendert: list[tuple[str, str, str]] = []
    for datei in migrationsdateien():
        version = datei.name
        if version not in stand:
            ausstehend.append(datei)
            continue
        db_summe = stand[version]
        datei_summe = sha256(datei)
        if db_summe and db_summe != datei_summe:
            geaendert.append((version, db_summe, datei_summe))
    return ausstehend, geaendert


def bericht(ausstehend: list[Path], geaendert: list[tuple[str, str, str]]) -> None:
    gesamt = len(migrationsdateien())
    print(f"Migrationen im Repository: {gesamt}")
    print(f"davon angewendet:          {gesamt - len(ausstehend)}")
    print(f"ausstehend:                {len(ausstehend)}")
    for d in ausstehend:
        print(f"   offen: {d.name}")
    for version, db_summe, datei_summe in geaendert:
        print(
            f"   GEAENDERT: {version}\n"
            f"      in der DB angewendet als {db_summe[:12]}…, Datei ist jetzt {datei_summe[:12]}…"
        )


def cmd_status() -> int:
    ausstehend, geaendert = analyse()
    if not tracking_vorhanden():
        print("Tabelle public.schema_migrations existiert noch nicht — der Stand dieser")
        print("Datenbank ist unbekannt. Erst --apply (frische DB) oder --baseline")
        print("(Datenbank hat den Zielzustand bereits) ausfuehren.")
    bericht(ausstehend, geaendert)
    return 0


def cmd_check() -> int:
    ausstehend, geaendert = analyse()
    bericht(ausstehend, geaendert)
    if geaendert:
        print(
            "\nFEHLER: Bereits angewendete Migrationen wurden nachtraeglich geaendert.\n"
            "Eine angewendete Migration darf nicht editiert werden — die Aenderung erreicht\n"
            "keine Datenbank, auf der sie schon lief. Stattdessen eine neue Migration anlegen.",
            file=sys.stderr,
        )
        return 1
    if ausstehend:
        print(
            "\nFEHLER: Es stehen Migrationen aus. Vor dem Rebuild anwenden:\n"
            "  python3 scripts/apply_migrations.py --apply",
            file=sys.stderr,
        )
        return 1
    print("\nDatenbank ist auf dem Stand des Repositorys.")
    return 0


def cmd_apply() -> int:
    ausstehend, geaendert = analyse()
    if geaendert:
        print("Abbruch: bereits angewendete Migrationen wurden geaendert.", file=sys.stderr)
        bericht(ausstehend, geaendert)
        return 1
    if not ausstehend:
        print("Nichts anzuwenden — Datenbank ist auf dem Stand des Repositorys.")
        return 0

    # Die Tracking-Migration zuerst, sonst gibt es keine Tabelle zum Eintragen.
    ausstehend.sort(key=lambda p: (p.name != TRACKING_MIGRATION, p.name))

    for datei in ausstehend:
        # flush: sonst landet die Fehlermeldung auf stderr vor dieser Zeile und
        # die Ausgabe sagt nicht mehr, welche Migration gescheitert ist.
        print(f"wende an: {datei.name}", flush=True)
        rc, _, err = run_sql(datei.read_text(encoding="utf-8"), single_transaction=True)
        if rc != 0:
            print(
                f"\nFEHLER in {datei.name} — die Migration lief in einer Transaktion und\n"
                f"wurde vollstaendig zurueckgerollt. Nachfolgende Migrationen wurden nicht\n"
                f"angefasst.\n\n{err}",
                file=sys.stderr,
            )
            return 1
        eintragen(datei.name, sha256(datei))
        print(f"   ok, eingetragen ({sha256(datei)[:12]}…)")

    # Ohne Schema-Reload serviert PostgREST die neuen Tabellen/RPCs nicht — der
    # Schritt, der am 13.09.2026 gefehlt hat.
    rc, _, err = run_sql("notify pgrst, 'reload schema';")
    if rc != 0:
        print(f"WARNUNG: Schema-Reload fehlgeschlagen: {err}", file=sys.stderr)
        print("PostgREST kennt neue Tabellen/RPCs erst nach einem Reload oder Neustart.")
        return 1
    print("\nSchema-Reload an PostgREST gesendet.")
    print(f"{len(ausstehend)} Migration(en) angewendet.")
    return 0


def cmd_baseline() -> int:
    if not tracking_vorhanden():
        datei = MIGRATIONS / TRACKING_MIGRATION
        if not datei.exists():
            print(f"{TRACKING_MIGRATION} fehlt im Repository.", file=sys.stderr)
            return 1
        print(f"Tracking-Tabelle fehlt — wende {TRACKING_MIGRATION} an.")
        rc, _, err = run_sql(datei.read_text(encoding="utf-8"), single_transaction=True)
        if rc != 0:
            print(f"FEHLER: {err}", file=sys.stderr)
            return 1

    dateien = migrationsdateien()
    stand = angewendet()
    neu = [d for d in dateien if d.name not in stand]
    if not neu:
        print("Alle Migrationen sind bereits eingetragen — nichts zu tun.")
        return 0

    print(
        f"Trage {len(neu)} Migration(en) als angewendet ein, OHNE sie auszufuehren.\n"
        "Das ist nur richtig, wenn diese Datenbank den beschriebenen Zustand bereits hat."
    )
    for datei in neu:
        eintragen(datei.name, sha256(datei))
        print(f"   eingetragen: {datei.name}")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(
        description="Gleicht Migrationsdateien gegen public.schema_migrations ab.",
    )
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--check", action="store_true", help="Ausstehende melden, Exit 1 wenn welche da sind")
    g.add_argument("--apply", action="store_true", help="Ausstehende anwenden und eintragen")
    g.add_argument("--baseline", action="store_true", help="Alle als angewendet eintragen, ohne auszufuehren")
    g.add_argument("--status", action="store_true", help="Stand anzeigen, Exit immer 0")
    args = p.parse_args()

    if args.status:
        return cmd_status()
    if args.check:
        return cmd_check()
    if args.apply:
        return cmd_apply()
    return cmd_baseline()


if __name__ == "__main__":
    raise SystemExit(main())
