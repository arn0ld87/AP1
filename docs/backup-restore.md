# Backup & Restore (self-hosted Supabase auf dem armserver)

Die Plattform läuft auf einem selbst gehosteten Supabase-Stack (`supabase-db`-Container,
Postgres 15/16) auf dem armserver. Backup/Restore nutzt die Standardwerkzeuge `pg_dump`/
`pg_restore` bzw. `psql` — kein proprietäres Verfahren.

## Was zu sichern ist

- **Datenbank** (alle Schemas, inkl. `auth.users` und RLS-Policies): `pg_dump` des
  `supabase-db`-Containers.
- **Edge-Function-Datei** liegt im Repo (`app/supabase/functions/grade-exam-answer.ts`) und in
  `/opt/supabase/volumes/functions/main/grade-exam-answer/index.ts` — durch Git abgedeckt.
- **Secrets** (Vaultwarden, Edge-Function-Env) werden nicht im Backup der DB gespeichert.

> **Das Datenbank-Backup ist die einzige vollständige Quelle der Daten.** Das Schema selbst lässt
> sich seit dem 14.09.2026 wieder vollständig aus `app/supabase/migrations/` aufbauen
> ([ADR-0006](adr/0006-schema-baseline-statt-drift.md)) — bis dahin war das nicht der Fall: 50 der
> 57 Tabellen existierten nur in der Live-Datenbank. Ein Wiederaufbau allein aus dem Repository
> hätte sie verloren. Die **Daten** stehen ohnehin ausschließlich im `pg_dump`, nicht im Repo.
>
> Für einen Schema-Aufbau aus den Migrationen (nicht aus einem Dump) ist
> `scripts/apply_migrations.py --apply` der Weg — es wendet ausstehende Migrationen an und trägt
> sie in `public.schema_migrations` ein ([ADR-0007](adr/0007-migrationsstand-in-der-datenbank.md)).
> Eine per `pg_restore` wiederhergestellte Datenbank bringt diese Tabelle samt Inhalt aus dem Dump
> mit; der Stand stimmt also automatisch. Nach einem Restore lohnt `--check` als Kontrolle,
> ob inzwischen neue Migrationen im Repository liegen.

## Backup

Auf dem armserver (Beispiel, ohne echte Credentials — Werte aus Vaultwarden/`docker exec`):

```bash
# Logisches Backup, komprimiert, mit Zeitstempel
docker exec supabase-db \
  pg_dump -U supabase_admin -d postgres -Fc \
  > /opt/backups/ap1/ap1-$(date +%F-%H%M).dump
```

- **Intervall:** täglich (z. B. systemd-Timer oder cron, nachts).
- **Aufbewahrung:** 30 Tage (rotierend, z. B. `find /opt/backups/ap1 -name '*.dump' -mtime +30 -delete`).
- **Verschlüsselung/Offsite:** Backup-Verzeichnis liegt auf dem verschlüsselten Datenträger des
  armservers; für Offsite-Kopie zusätzlich auf Tresor-/Cloud-Ziel übertragen (z. B. Restic auf
  Vaultwarden-angebundenes Ziel) — vor Aktivierung dokumentieren.

## Restore — Standardweg: immer zuerst in eine separate Test-DB

Jeder Restore-Test und jede Backup-Prüfung läuft gegen eine eigene, wegwerfbare
Datenbank auf demselben Postgres-Server — **niemals** direkt gegen `postgres` (das ist die
laufende, produktive Datenbank im `supabase-db`-Container).

```bash
# 1) Frische, isolierte Test-DB anlegen
docker exec supabase-db createdb -U supabase_admin ap1_restore_test

# 2) Backup NUR in diese Test-DB einspielen
docker exec -i supabase-db \
  pg_restore -U supabase_admin -d ap1_restore_test --clean --if-exists \
  < /opt/backups/ap1/ap1-2026-09-11-0300.dump

# 3) Integritätsprüfung
docker exec supabase-db psql -U supabase_admin -d ap1_restore_test -c "
  select count(*) from public.exam_questions;  -- erwartet: 77
  select exam_id, sum(max_punkte) from public.exam_questions group by 1;  -- je 100
  select count(*) from public.exam_attempts;
"

# 4) Test-DB wieder entfernen
docker exec supabase-db dropdb -U supabase_admin ap1_restore_test
```

**Intervall:** mindestens monatlich. **Belegter Test-Restore:** wird nach dem ersten
monatlichen Lauf hier mit Datum eingetragen.

## Produktions-Restore — NUR im Notfall, NICHT der Standardweg

⚠️ Dieser Abschnitt restored direkt in die laufende Datenbank (`postgres` im
`supabase-db`-Container) und **löscht dabei bestehende Objekte** (`--clean`). Der Befehl ist
absichtlich nicht als copy-pasteable Einzeiler formuliert — jeder Schritt einzeln ausführen.

Vorbedingungen, alle müssen erfüllt sein, bevor Schritt 3 läuft:

1. Die Live-Datenbank ist nachweislich korrupt oder Daten sind nachweislich verloren
   (nicht: „sicherheitshalber", nicht als Testlauf).
2. Ein Test-Restore desselben Backups nach obigem Standardweg war erfolgreich
   (Integritätsprüfung bestanden).
3. Ein frisches Backup der aktuellen (defekten) Live-DB wurde vor dem Restore gezogen —
   auch ein kaputter Zustand kann sonst nicht mehr forensisch untersucht werden.

Ablauf:

```bash
# 1) App-Container stoppen — keine Schreibzugriffe während des Restores
docker stop pruefung-frontend

# 2) Sicherheits-Backup des aktuellen (defekten) Zustands ziehen
docker exec supabase-db \
  pg_dump -U supabase_admin -d postgres -Fc \
  > /opt/backups/ap1/ap1-vor-notfall-restore-$(date +%F-%H%M).dump

# 3) Restore GEGEN DIE LIVE-DB "postgres" — nur nachdem 1) und 2) durchgelaufen sind
docker exec -i supabase-db \
  pg_restore -U supabase_admin -d postgres --clean --if-exists \
  < /opt/backups/ap1/<ZU_RESTORENDES_BACKUP>.dump

# 4) App-Container wieder starten und Smoke-Test fahren (Login + Probeprüfung)
docker start pruefung-frontend
```
