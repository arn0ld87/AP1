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
-- (Service Role umgeht RLS; user_id kommt verifiziert aus dem JWT)
alter table public.exam_answers
  add column if not exists user_id uuid references auth.users on delete cascade;

-- Eine Bewertung je (Attempt, Frage): Die Edge Function konnte bei mehr-
-- facher Bewertung Dubletten erzeugen. Bestehende Dubletten werden auf je
-- einen Datensatz reduziert, danach erzwingt der Unique-Index die Regel.
delete from public.exam_answers a
using public.exam_answers b
where a.attempt_id = b.attempt_id
  and a.question_id is not distinct from b.question_id
  and a.id < b.id;

create unique index if not exists exam_answers_attempt_question_uq
  on public.exam_answers (attempt_id, question_id);
