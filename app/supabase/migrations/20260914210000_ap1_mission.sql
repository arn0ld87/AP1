-- AP1 Mission nutzt die bestehende learning_session- und topic_mastery-Struktur.
-- Generator-Sessions sind nicht an eine persistierte Prüfung gebunden, deshalb
-- darf exam_id für session_kind='mission' leer sein.

alter table public.learning_session alter column exam_id drop not null;
alter table public.learning_session
  add column if not exists session_kind text not null default 'exam',
  add column if not exists xp_earned integer not null default 0,
  add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.learning_session
  add constraint learning_session_kind_check
  check (session_kind in ('exam', 'mission', 'blitz', 'formula'));
alter table public.learning_session
  add constraint learning_session_xp_check check (xp_earned >= 0);
alter table public.learning_session
  add constraint learning_session_exam_requirement_check
  check ((session_kind = 'exam') = (exam_id is not null));

alter table public.topic_mastery
  add column if not exists confidence_score numeric(4,3) not null default 0.5,
  add column if not exists streak integer not null default 0,
  add column if not exists next_review_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists xp integer not null default 0;

alter table public.topic_mastery
  add constraint topic_mastery_confidence_check
  check (confidence_score between 0 and 1),
  add constraint topic_mastery_streak_check check (streak >= 0),
  add constraint topic_mastery_xp_check check (xp >= 0);

drop function if exists public.record_mission_attempt(uuid, text, boolean, text, integer, text);

create or replace function public.record_mission_attempt(
  p_attempt_id uuid,
  p_session_id uuid,
  p_topic_id text,
  p_correct boolean,
  p_confidence text,
  p_next_queue jsonb,
  p_error_description text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_details jsonb;
  v_question jsonb;
  v_recorded_attempt jsonb;
  v_recorded_attempts jsonb;
  v_current_index integer;
  v_questions_answered integer;
  v_correct_answers integer;
  v_session_xp integer;
  v_current_streak integer := 0;
  v_attempts integer := 0;
  v_confidence numeric(4,3);
  v_new_streak integer;
  v_interval_days integer;
  v_next_review timestamptz;
  v_task_kind text;
  v_xp integer;
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert' using errcode = '42501';
  end if;
  if p_attempt_id is null or p_session_id is null or nullif(p_topic_id, '') is null then
    raise exception 'Versuchs-, Session- oder Themenkennung fehlt' using errcode = '22023';
  end if;
  if p_correct is null then
    raise exception 'Antwortergebnis fehlt' using errcode = '22023';
  end if;
  if p_confidence is null or p_confidence not in ('sure', 'unsure', 'guessed') then
    raise exception 'Ungültige Antwortsicherheit' using errcode = '22023';
  end if;
  if p_next_queue is null or jsonb_typeof(p_next_queue) <> 'array' then
    raise exception 'Ungültige Missionswarteschlange' using errcode = '22023';
  end if;

  select details, questions_answered, coalesce(points_earned, 0)::integer, xp_earned
    into v_details, v_questions_answered, v_correct_answers, v_session_xp
  from public.learning_session
  where id = p_session_id and user_id = v_user_id
    and session_kind in ('mission', 'blitz', 'formula') and ended_at is null
  for update;
  if not found then
    raise exception 'Lernsession nicht gefunden oder bereits beendet' using errcode = '42501';
  end if;

  v_recorded_attempt := coalesce(v_details->'recordedAttempts', '{}'::jsonb)->(p_attempt_id::text);
  if v_recorded_attempt is not null then
    return v_recorded_attempt || jsonb_build_object(
      'duplicate', true,
      'queue', v_details->'queue'
    );
  end if;

  if v_details->'queue' is null
     or v_details->'currentIndex' is null
     or jsonb_typeof(v_details->'queue') <> 'array'
     or jsonb_typeof(v_details->'currentIndex') <> 'number' then
    raise exception 'Ungültiger Missionszustand' using errcode = '22023';
  end if;
  v_current_index := (v_details->>'currentIndex')::integer;
  if v_current_index < 0 or v_current_index >= jsonb_array_length(v_details->'queue') then
    raise exception 'Ungültiger Wiederaufnahmepunkt' using errcode = '22023';
  end if;
  v_question := (v_details->'queue')->v_current_index;
  if v_question->>'id' <> p_attempt_id::text or v_question->>'topicId' <> p_topic_id then
    raise exception 'Versuch gehört nicht zur aktuellen Missionsaufgabe' using errcode = '22023';
  end if;
  if jsonb_array_length(p_next_queue) < jsonb_array_length(v_details->'queue')
     or (p_next_queue->v_current_index)->>'id' <> p_attempt_id::text then
    raise exception 'Missionswarteschlange darf bestehende Aufgaben nicht ersetzen' using errcode = '22023';
  end if;

  v_task_kind := case
    when v_question->>'isBoss' = 'true' then 'boss'
    when v_question->>'kind' = 'calc' then 'calculation'
    when v_question->>'kind' = 'card' then 'quick'
    else null
  end;
  if v_task_kind is null then
    raise exception 'Ungültiger Missionsaufgabentyp' using errcode = '22023';
  end if;
  v_xp := case
    when not p_correct then 0
    else round(
      (case v_task_kind when 'boss' then 50 when 'calculation' then 20 else 10 end)
      * (case p_confidence when 'sure' then 1.0 when 'unsure' then 0.75 else 0.5 end)
    )::integer
  end;

  insert into public.topic_mastery (user_id, topic_id)
  values (v_user_id, p_topic_id)
  on conflict (user_id, topic_id) do nothing;

  select streak, richtig + falsch
    into v_current_streak, v_attempts
  from public.topic_mastery
  where user_id = v_user_id and topic_id = p_topic_id
  for update;

  v_current_streak := coalesce(v_current_streak, 0);
  v_attempts := coalesce(v_attempts, 0);
  v_confidence := case p_confidence when 'sure' then 1.0 when 'unsure' then 0.5 else 0.2 end;
  v_new_streak := case when p_correct then v_current_streak + 1 else 0 end;
  v_interval_days := case
    when not p_correct then 1
    when p_confidence = 'guessed' then 1
    when p_confidence = 'unsure' then least(case when v_new_streak >= 3 then 7 when v_new_streak = 2 then 3 else 1 end, 3)
    when v_new_streak >= 4 then 14
    when v_new_streak = 3 then 7
    when v_new_streak = 2 then 3
    else 1
  end;
  v_next_review := now() + make_interval(days => v_interval_days);

  update public.topic_mastery set
    richtig = topic_mastery.richtig + case when p_correct then 1 else 0 end,
    falsch = topic_mastery.falsch + case when p_correct then 0 else 1 end,
    updated_at = now(),
    confidence_score = round(
      ((topic_mastery.confidence_score * v_attempts) + v_confidence) / (v_attempts + 1),
      3
    ),
    streak = v_new_streak,
    next_review_at = v_next_review,
    last_seen_at = now(),
    xp = topic_mastery.xp + v_xp
  where user_id = v_user_id and topic_id = p_topic_id;

  v_questions_answered := v_questions_answered + 1;
  v_correct_answers := v_correct_answers + case when p_correct then 1 else 0 end;
  v_session_xp := v_session_xp + v_xp;
  v_result := jsonb_build_object(
    'correct', p_correct,
    'xp', v_xp
  );
  v_recorded_attempts := coalesce(v_details->'recordedAttempts', '{}'::jsonb)
    || jsonb_build_object(p_attempt_id::text, v_result);

  update public.learning_session set
    questions_answered = v_questions_answered,
    points_earned = v_correct_answers,
    points_possible = coalesce(points_possible, 0) + 1,
    xp_earned = v_session_xp,
    details = jsonb_build_object(
      'queue', p_next_queue,
      'currentIndex', v_current_index,
      'stats', jsonb_build_object(
        'answered', v_questions_answered,
        'correct', v_correct_answers,
        'xp', v_session_xp
      ),
      'answeredQuestionId', p_attempt_id::text,
      'answeredResult', v_result,
      'recordedAttempts', v_recorded_attempts
    )
  where id = p_session_id and user_id = v_user_id;

  if not p_correct then
    insert into public.error_log (user_id, quelle, thema, beschreibung, erledigt)
    values (
      v_user_id,
      'ap1-mission',
      p_topic_id,
      left(coalesce(nullif(p_error_description, ''), 'Falsche Antwort in AP1 Mission'), 500),
      false
    );
  end if;

  return v_result || jsonb_build_object('duplicate', false, 'queue', p_next_queue);
end;
$$;

create or replace function public.advance_mission_session(
  p_session_id uuid,
  p_attempt_id uuid,
  p_next_index integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_details jsonb;
  v_current_index integer;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert' using errcode = '42501';
  end if;
  if p_session_id is null or p_attempt_id is null or p_next_index is null then
    raise exception 'Session, Versuch oder Wiederaufnahmepunkt fehlt' using errcode = '22023';
  end if;

  select details into v_details
  from public.learning_session
  where id = p_session_id and user_id = v_user_id
    and session_kind in ('mission', 'blitz', 'formula') and ended_at is null
  for update;
  if not found then
    raise exception 'Lernsession nicht gefunden oder bereits beendet' using errcode = '42501';
  end if;

  if v_details->'queue' is null
     or v_details->'currentIndex' is null
     or jsonb_typeof(v_details->'queue') <> 'array'
     or jsonb_typeof(v_details->'currentIndex') <> 'number' then
    raise exception 'Ungültiger Missionszustand' using errcode = '22023';
  end if;
  v_current_index := (v_details->>'currentIndex')::integer;
  if v_details->>'answeredQuestionId' <> p_attempt_id::text
     or p_next_index <> v_current_index + 1
     or p_next_index >= jsonb_array_length(v_details->'queue') then
    raise exception 'Ungültiger Wiederaufnahmepunkt' using errcode = '22023';
  end if;

  v_details := (v_details - 'answeredQuestionId' - 'answeredResult')
    || jsonb_build_object('currentIndex', p_next_index);
  update public.learning_session set details = v_details
  where id = p_session_id and user_id = v_user_id;
  return v_details;
end;
$$;

revoke all on function public.record_mission_attempt(uuid, uuid, text, boolean, text, jsonb, text) from public;
revoke all on function public.record_mission_attempt(uuid, uuid, text, boolean, text, jsonb, text) from anon;
grant execute on function public.record_mission_attempt(uuid, uuid, text, boolean, text, jsonb, text) to authenticated;
revoke all on function public.advance_mission_session(uuid, uuid, integer) from public;
revoke all on function public.advance_mission_session(uuid, uuid, integer) from anon;
grant execute on function public.advance_mission_session(uuid, uuid, integer) to authenticated;
