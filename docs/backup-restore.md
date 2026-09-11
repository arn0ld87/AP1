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

## Restore

```bash
# In eine LEERE Datenbank (nie in die laufende produzieren!)
docker exec -i supabase-db \
  pg_restore -U supabase_admin -d postgres --clean --if-exists \
  < /opt/backups/ap1/ap1-2026-09-11-0300.dump
```

Danach: App-Container neu starten (`docker restart pruefung-frontend`) und Smoke-Test
(Login + Probeprüfung) fahren.

## Test-Restore (mindestens monatlich)

1. Frische Test-DB anlegen: `createdb ap1_restore_test` (im Container).
2. `pg_restore` des aktuellsten Backups in `ap1_restore_test`.
3. Integritätsprüfung:
   ```sql
   select count(*) from public.exam_questions;  -- erwartet: 77
   select exam_id, sum(max_punkte) from public.exam_questions group by 1;  -- je 100
   select count(*) from public.exam_attempts;
   ```
4. Test-DB wieder entfernen (`dropdb ap1_restore_test`).

**Belegter Test-Restore:** wird nach dem ersten monatlichen Lauf hier mit Datum eingetragen.
