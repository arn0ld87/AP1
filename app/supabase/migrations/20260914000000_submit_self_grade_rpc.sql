-- SelfGrade-Persistenz-Fix: exam_attempts.gesamtpunkte war nach einer
-- Selbsteinschätzung nicht mehr Quelle der Wahrheit. upsertSelfGrade schrieb
-- bisher nur exam_answers.ki_punkte per Client-Upsert; die UI zeigte danach
-- eine neue Summe aus lokalem State, exam_attempts.gesamtpunkte blieb beim
-- zuletzt persistierten Abgabe-Wert. Nach Reload/Navigation zurück zur
-- Auswahlliste (die gesamtpunkte direkt aus der DB liest) sah der Nutzer
-- wieder den alten, niedrigeren Wert.
--
-- Diese RPC macht Ownership-Prüfung, Punkte-Clamping, Upsert und
-- Neuberechnung der Summe atomar — nach demselben Muster wie
-- increment_topic_mastery (security definer, auth.uid()-Check serverseitig,
-- da RLS für security-definer-Funktionen nicht automatisch greift).

create or replace function public.submit_self_grade(
  p_attempt_id uuid,
  p_question_id text,
  p_antworttext text,
  p_punkte int
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_punkte int;
  v_gesamtpunkte int;
begin
  if not exists (
    select 1 from exam_attempts
    where id = p_attempt_id and user_id = auth.uid()
  ) then
    raise exception 'Attempt gehört nicht zum angemeldeten Nutzer' using errcode = '42501';
  end if;

  select max_punkte into v_max_punkte
  from exam_questions
  where id = p_question_id;

  if v_max_punkte is null then
    raise exception 'Unbekannte question_id: %', p_question_id using errcode = '22023';
  end if;

  if p_punkte < 0 or p_punkte > v_max_punkte then
    raise exception 'punkte außerhalb von 0..%: %', v_max_punkte, p_punkte using errcode = '22023';
  end if;

  insert into exam_answers (attempt_id, question_id, antworttext, ki_punkte, ki_feedback)
  values (p_attempt_id, p_question_id, p_antworttext, p_punkte, 'Selbst eingeschätzt.')
  on conflict (attempt_id, question_id) do update set
    antworttext = excluded.antworttext,
    ki_punkte = excluded.ki_punkte,
    ki_feedback = excluded.ki_feedback;

  select coalesce(sum(ki_punkte), 0) into v_gesamtpunkte
  from exam_answers
  where attempt_id = p_attempt_id;

  update exam_attempts
  set gesamtpunkte = v_gesamtpunkte
  where id = p_attempt_id;

  return v_gesamtpunkte;
end;
$$;

revoke all on function public.submit_self_grade(uuid, text, text, int) from anon;
grant execute on function public.submit_self_grade(uuid, text, text, int) to authenticated;
