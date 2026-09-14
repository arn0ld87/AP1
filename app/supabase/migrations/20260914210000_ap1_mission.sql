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

create or replace function public.record_mission_attempt(
  p_session_id uuid,
  p_topic_id text,
  p_correct boolean,
  p_confidence text,
  p_xp integer,
  p_error_description text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_streak integer := 0;
  v_attempts integer := 0;
  v_confidence numeric(4,3);
  v_new_streak integer;
  v_interval_days integer;
  v_next_review timestamptz;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert' using errcode = '42501';
  end if;
  if p_confidence not in ('sure', 'unsure', 'guessed') then
    raise exception 'Ungültige Antwortsicherheit' using errcode = '22023';
  end if;
  if p_xp < 0 or p_xp > 50 then
    raise exception 'Ungültige XP' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.learning_session
    where id = p_session_id and user_id = v_user_id
      and session_kind in ('mission', 'blitz', 'formula') and ended_at is null
  ) then
    raise exception 'Lernsession nicht gefunden oder bereits beendet' using errcode = '42501';
  end if;

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
    xp = topic_mastery.xp + p_xp
  where user_id = v_user_id and topic_id = p_topic_id;

  update public.learning_session set
    questions_answered = questions_answered + 1,
    points_earned = coalesce(points_earned, 0) + case when p_correct then 1 else 0 end,
    points_possible = coalesce(points_possible, 0) + 1,
    xp_earned = xp_earned + p_xp
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

  return jsonb_build_object(
    'streak', v_new_streak,
    'next_review_at', v_next_review,
    'repeat_in_session', not p_correct,
    'xp', p_xp
  );
end;
$$;

revoke all on function public.record_mission_attempt(uuid, text, boolean, text, integer, text) from public;
revoke all on function public.record_mission_attempt(uuid, text, boolean, text, integer, text) from anon;
grant execute on function public.record_mission_attempt(uuid, text, boolean, text, integer, text) to authenticated;
