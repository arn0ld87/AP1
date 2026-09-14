-- error_log.erledigt: NOT NULL + Default nachziehen.
--
-- Beim Vergleich der Produktionsdatenbank mit einem allein aus den Migrationen
-- aufgebauten Schema war dies die einzige Abweichung an den sieben bereits
-- migrierten Tabellen (1598 verglichene Objekteigenschaften, 1 Unterschied):
--
--   live:  erledigt boolean NOT NULL DEFAULT false
--   Repo:  erledigt boolean            (nullable, ohne Default)
--
-- Ursache ist 20260911120000_schema_drift_fixes.sql, das die Spalte mit
-- `add column if not exists erledigt boolean` nachtraegt und dabei Default und
-- NOT NULL der manuell angelegten Live-Spalte nicht uebernommen hat.
--
-- Auf der Produktionsdatenbank sind alle drei Statements wirkungslos (der
-- Zielzustand besteht dort bereits); auf einer frisch aufgebauten Datenbank
-- stellen sie ihn her. Das update laeuft vor dem set not null, damit die
-- Migration auch auf einer Datenbank durchlaeuft, in der bereits Zeilen mit
-- erledigt is null liegen.

alter table public.error_log alter column erledigt set default false;
update public.error_log set erledigt = false where erledigt is null;
alter table public.error_log alter column erledigt set not null;
