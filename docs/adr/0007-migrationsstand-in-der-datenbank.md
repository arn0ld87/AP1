# ADR-0007: Migrationsstand in der Datenbank führen und den Deploy daran binden

- Status: Accepted
- Datum: 14.09.2026
- Folgt auf: [ADR-0006](0006-schema-baseline-statt-drift.md)

## Kontext

ADR-0006 hat den Schema-Rückstand einmalig aufgeholt, den Grund dafür aber nicht beseitigt: Es gab
keinen Ort, an dem stand, welche Migrationen auf einer Datenbank bereits gelaufen sind. Der
Migrationsstand war Erinnerungssache. Das ist im Projekt zweimal konkret schiefgegangen:

- **13.09.2026** — ein `git pull` + `docker compose up -d --build` brachte Anwendungscode live,
  dessen Migration auf der Produktionsdatenbank fehlte. Die Probeprüfungsseite brach. Der
  dokumentierte Update-Ablauf in `docs/architecture.md` bestand exakt aus diesen beiden Befehlen
  und nannte keinen Migrationsschritt.
- **14.09.2026** — 50 Tabellen, 38 Funktionen, 7 Views und 33 Enums existierten ausschließlich in
  der Live-Datenbank (ADR-0006).

Beides ist dieselbe Ursache: Soll-Zustand (Dateien) und Ist-Zustand (Datenbank) lassen sich nicht
vergleichen, also wird geraten.

## Entscheidung

Der angewendete Stand wird in der Datenbank geführt, und der Deploy prüft ihn, bevor er die App
neu baut.

1. **Tabelle `public.schema_migrations`** (Migration `20260914190000`): `version` (der Dateiname,
   Primary Key), `applied_at`, `checksum` (SHA-256 der Datei zum Zeitpunkt der Anwendung). RLS an,
   bewusst **keine** Policy, keine Grants an `anon`/`authenticated` — dasselbe Deny-all-Muster wie
   `ai_budget_daily`; Zugriff nur über `service_role` bzw. `supabase_admin` beim Deploy.
   `scripts/validate_migrations.py` führt die Tabelle entsprechend in `NO_POLICY_TABLES`.
2. **`scripts/apply_migrations.py`** vergleicht `app/supabase/migrations/*.sql` gegen diese Zeilen:
   - `--check` meldet Ausstehendes und beendet sich mit Exit 1 — das Gate vor dem Rebuild.
   - `--apply` wendet Ausstehendes in Dateinamen-Reihenfolge an, **jede Migration in einer eigenen
     Transaktion**, trägt sie ein und sendet danach `notify pgrst, 'reload schema'` (ohne Reload
     serviert PostgREST neue Tabellen und RPCs nicht — der zweite Teil des 13.09.-Fehlers).
   - `--baseline` trägt vorhandene Migrationen als angewendet ein, **ohne sie auszuführen**.
   - `--status` zeigt den Stand, ohne etwas zu ändern.
   Das Ziel kommt aus `DATABASE_URL` oder, für die Container-Datenbank auf dem armserver, aus
   `AP1_PSQL` (z. B. `docker exec -i supabase-db psql -U supabase_admin -d postgres`).
3. **Die Checksumme ist Teil des Vertrags.** Wurde eine bereits angewendete Datei nachträglich
   editiert, brechen `--check` und `--apply` ab. Eine Änderung an einer angewendeten Migration
   erreicht keine Datenbank, auf der sie schon lief — sie gehört in eine neue Datei.
4. **`docs/architecture.md`** beschreibt den Update-Ablauf als eigenen Abschnitt in der Reihenfolge
   Gate → Migrationen → App, und nennt für die Edge Function den tatsächlich servierten Pfad.

## Warum `--baseline` existiert

Die Produktionsdatenbank hat die 12 vorhandenen Migrationen angewendet, ohne dass es vermerkt ist.
Ein `--apply` würde sie alle erneut ausführen — und
`20260914170000_baseline_live_schema.sql` ist ein `pg_dump`, also **nicht idempotent**; der Lauf
würde fehlschlagen und wäre ein unnötiger Eingriff in eine öffentlich laufende Datenbank.
`--baseline` stempelt den Stand stattdessen. Auf einer frischen Datenbank ist das falsch, dort
gehört `--apply` hin. Die Unterscheidung steht bewusst in zwei getrennten Flags statt in einer
Heuristik: Ein Skript, das selbst entscheidet, ob eine Migration „wohl schon gelaufen ist", rät
wieder — genau das soll hier aufhören.

## Alternativen

- **Supabase CLI (`supabase db push`)** — führt `supabase_migrations.schema_migrations` selbst.
  Verworfen: Der Stack ist self-hosted ohne CLI-Anbindung, die CLI erwartet ein verknüpftes
  Projekt, und sie hätte für die nicht idempotente Baseline denselben Sonderweg gebraucht. Der
  Zugriff läuft hier über `docker exec` in den `supabase-db`-Container.
- **Migrations-Framework (Sqitch, Flyway, Alembic)** — mehr Funktionsumfang als der Fall braucht
  (kein Rollback-Bedarf, 12 Dateien, ein Deploy-Ziel) und eine zusätzliche Laufzeitabhängigkeit auf
  dem armserver. Das Skript ist reines Python 3 + `psql`, beides ist dort ohnehin vorhanden.
- **Nur Doku ergänzen** — der Update-Ablauf stand auch vorher dokumentiert da; die fehlende Zeile
  war nicht das Problem, sondern dass nichts den Fehler bemerkt.

## Konsequenzen

**Positiv**

- Ein Rebuild ohne die zugehörige Migration fällt vorher auf, statt in der Anwendung.
- Der Stand einer Datenbank ist abfragbar (`--status`) statt Erinnerungssache.
- Der Schema-Reload nach dem Anwenden ist Teil des Werkzeugs, nicht ein Schritt zum Vergessen.
- CI prüft das Gate selbst mit: `--check` muss auf einer aufgebauten, aber nicht eingetragenen
  Datenbank fehlschlagen, `--baseline` + `--check` danach durchlaufen, und eine simuliert editierte
  Migration muss auffallen. Damit rottet das Werkzeug nicht unbemerkt weg.

**Negativ / in Kauf genommen**

- Das Gate ist ein Schritt in einer dokumentierten Befehlsfolge, kein technischer Zwang. Wer
  `docker compose up -d --build` direkt aufruft, umgeht es weiterhin. Ein Wrapper oder ein
  Pre-Start-Hook im Compose-Setup wäre der nächste Schritt; er ist bewusst nicht Teil dieser
  Entscheidung, weil er den Start der App an eine erreichbare Datenbank koppelt.
- Solange die Produktionsdatenbank nicht gestempelt ist (`--baseline`), greift das Gate dort nicht.
  Der Lauf ist ein separater, ausdrücklich freizugebender Eingriff in die Live-Datenbank.
- Die Checksummenprüfung verbietet nachträgliche Korrekturen an angewendeten Migrationen. Das ist
  beabsichtigt, kostet aber gelegentlich eine zusätzliche Datei für eine Kleinigkeit.
