# ADR-0006: Live-Schema als Baseline-Migration aufnehmen

- Status: Accepted
- Datum: 14.09.2026

## Kontext

Bei einer Rechte-Prüfung auf der Produktionsdatenbank fiel auf, dass sie **57 Tabellen und 44
Funktionen** enthält, während die neun Migrationen in `app/supabase/migrations/` nur **7 Tabellen
und 6 Funktionen** beschreiben. Die zusätzlichen 50 Tabellen, 38 Funktionen, 7 Views und 33
Enum-Typen bilden eine eigene Architektur (Kompetenzmodell, Rubrics, Prüfungs-Blueprints,
Quellenverwaltung) und enthalten produktive Daten — unter anderem 18.316 Zeilen in
`source_chunk_reference`, 141 in `rubric_criterion`, 137 in `question`, 125 in `curriculum_node`.

Eine Suche ergab, dass es für diese Objekte **keine SQL-Quelle** gab: weder in einer Migration,
noch in einem der Remote-Branches (keiner hatte mehr als 9 Migrationsdateien), noch in einer Datei
unterhalb von `/opt` auf dem armserver. Sie waren direkt in der Datenbank entstanden.

Daraus folgten drei konkrete Probleme:

1. **Disaster Recovery war wirkungslos.** Der in [backup-restore.md](../backup-restore.md)
   beschriebene Wiederaufbau aus den Migrationen hätte 50 Tabellen samt Daten nicht
   wiederhergestellt.
2. **Der CI-Job `migration-validation` prüfte eine Fiktion.** Er baute ein 7-Tabellen-Schema auf
   und validierte dieses — über den tatsächlichen Produktionszustand sagte sein grünes Ergebnis
   nichts aus.
3. **Änderungen am Schema waren nicht nachvollziehbar.** Es gab keinen Ort, an dem sich ablesen
   ließ, wie die Produktionsdatenbank aussieht oder warum.

## Entscheidung

Der Ist-Zustand der Produktionsdatenbank wird als **Baseline-Migration** ins Repository
aufgenommen: `20260914170000_baseline_live_schema.sql`.

Sie entsteht aus `pg_dump --schema-only --schema=public --no-owner`, abzüglich der sieben bereits
migrierten Tabellen (`--exclude-table`) und der sechs bereits migrierten Funktionen. Das ist
konfliktfrei möglich, weil zwischen den beiden Objektgruppen **kein einziger Fremdschlüssel**
besteht — die Baseline kann ohne Reihenfolgeabhängigkeit hinter den bestehenden Migrationen
laufen.

Die Datei ist ein **generierter Ist-Abzug und wird nicht von Hand gepflegt**. Künftige
Schemaänderungen gehören in neue, kleine Migrationen — nicht in diese Datei und nicht mehr direkt
in die Live-Datenbank.

Zusätzlich wurde die einzige Abweichung an den bereits migrierten Tabellen korrigiert
(`20260914180000_error_log_erledigt_not_null.sql`): `error_log.erledigt` war live
`NOT NULL DEFAULT false`, aus den Migrationen aber nullable ohne Default.

## Verifikation

Nachgewiesen wurde die Deckungsgleichheit, nicht behauptet: Eine frische Postgres-16-Datenbank
wurde aus allen elf Migrationen aufgebaut und anschließend Objekt für Objekt mit der Produktion
verglichen — Tabellen, Spalten samt Nullability und Default, Funktionen samt `security definer`,
Views, Enum-Werte, Policies samt Kommando, Indizes, Constraints und RLS-Status.

**Ergebnis: 1655 Objekteigenschaften auf beiden Seiten, kein einziger Unterschied.**

## Konsequenzen

**Positiv**

- Der Wiederaufbau aus dem Repository erzeugt wieder den vollständigen Produktionsstand.
- `migration-validation` prüft ab jetzt das reale Schema.
- Die Prüfung wurde verschärft: RLS wird über **alle** Tabellen erzwungen (vorher nur über eine
  feste Namensliste), und jede Tabelle muss entweder eine Policy haben oder bewusst in
  `NO_POLICY_TABLES` als Deny-all eingetragen sein. Eine neue Tabelle ohne Absicherung lässt den
  Job fehlschlagen.

**Negativ / in Kauf genommen**

- Die Baseline ist mit ~500 KB und 10.517 Zeilen eine ungewöhnlich große Migrationsdatei. Das ist
  der Preis dafür, den Zustand überhaupt zu erfassen; sie wird nie wieder angefasst.
- Die Historie der zweiten Schema-Generation ist verloren — sie erscheint als ein einziger
  Zeitpunkt. Rekonstruierbar war sie nicht.
- Die Baseline beschreibt Tabellen, die die ausgelieferte App derzeit nicht verwendet. Ob und wie
  diese zweite Generation in die App integriert wird, ist offen und nicht Gegenstand dieser
  Entscheidung.

## Folgepunkt (erledigt am 14.09.2026, siehe ADR-0007)

Der hier notierte offene Punkt — kein Mechanismus, der Drift verhindert — ist mit
[ADR-0007](0007-migrationsstand-in-der-datenbank.md) geschlossen: `public.schema_migrations`
hält den angewendeten Stand fest, `scripts/apply_migrations.py --check` ist das Gate vor jedem
Rebuild, und der Update-Ablauf in [architecture.md](../architecture.md) enthält den
Migrationsschritt. Offen bleibt allein die einmalige Stempelung der Produktionsdatenbank
(`--baseline`), ohne die das Gate dort noch nicht greift.
