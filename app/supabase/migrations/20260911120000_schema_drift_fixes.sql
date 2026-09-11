-- Schema-Drift zwischen Live-Datenbank und Migrationen aufheben.
--
-- Der Code nutzt Felder, die nur manuell auf dem armserver per ALTER TABLE
-- ergänzt wurden. Diese Migration macht den Produktionszustand vollständig
-- aus committed SQL reproduzierbar (additive Folgemigration, idempotent).

-- exam_questions: Einführungs-/Aufgabentexte des Probeprüfungs-Flows
alter table public.exam_questions add column if not exists intro text;
alter table public.exam_questions add column if not exists ausgangssituation text;

-- error_log: Erledigt-Flag der Fehlerliste (fortschritt.tsx)
alter table public.error_log add column if not exists erledigt boolean;

-- exam_answers: Eigentümer-Spur für Inserts über die Edge Function
-- (Service Role umgeht RLS; user_id kommt verifiziert aus dem JWT).
-- Spalte und Fremdschlüssel getrennt anlegen: inline `references` greift nur
-- beim allerersten Anlegen der Spalte — bestehender Drift (Spalte vorhanden,
-- FK fehlt) bliebe sonst unbemerkt. Constraint-Ergänzung idempotent, erst
-- NOT VALID, dann VALIDATE.
alter table public.exam_answers add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_answers_user_id_fkey'
      and conrelid = 'public.exam_answers'::regclass
      and contype = 'f'
  ) then
    alter table public.exam_answers
      add constraint exam_answers_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade not valid;
  end if;
end
$$;
alter table public.exam_answers validate constraint exam_answers_user_id_fkey;

-- Eine Bewertung je (Attempt, Frage): Die Edge Function konnte bei mehr-
-- facher Bewertung Dubletten erzeugen. Bestehende Dubletten werden auf je
-- einen Datensatz reduziert, danach erzwingt der Unique-Index die Regel.
delete from public.exam_answers a
using public.exam_answers b
where a.attempt_id = b.attempt_id
  and a.question_id is not distinct from b.question_id
  and a.id < b.id;

-- NULLS NOT DISTINCT (Postgres ≥ 15): Der Duplikat-Vergleich im DELETE oben
-- behandelt NULL question_id als gleich — der Index muss dasselbe tun, sonst
-- blieben NULL-Dubletten erlaubt. Der Index wird grundsätzlich neu gebaut,
-- weil `if not exists` die Semantik eines bereits bestehenden Index nicht
-- ändert.
drop index if exists public.exam_answers_attempt_question_uq;
create unique index exam_answers_attempt_question_uq
  on public.exam_answers (attempt_id, question_id) nulls not distinct;
