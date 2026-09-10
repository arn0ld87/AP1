-- Findings-Fix (Codex Review, PR #33): Inkremente atomar statt
-- client-seitigem Read-Modify-Write (Race bei zwei Tabs: Zähler geht
-- verloren). Beide RPCs laufen als security definer und nutzen Upserts,
-- die das Inkrement in der DB machen. RLS greift weiter: auth.uid()
-- wird serverseitig geprüft.

create or replace function public.increment_topic_mastery(
  p_topic_id text,
  p_correct boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into topic_mastery (user_id, topic_id, richtig, falsch, updated_at)
  values (
    auth.uid(),
    p_topic_id,
    case when p_correct then 1 else 0 end,
    case when p_correct then 0 else 1 end,
    now()
  )
  on conflict (user_id, topic_id) do update set
    richtig = topic_mastery.richtig + (case when p_correct then 1 else 0 end),
    falsch = topic_mastery.falsch + (case when p_correct then 0 else 1 end),
    updated_at = now();
end;
$$;

create or replace function public.increment_flashcard_progress(
  p_card_id text,
  p_correct boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into flashcard_progress (user_id, card_id, richtig, falsch, updated_at)
  values (
    auth.uid(),
    p_card_id,
    case when p_correct then 1 else 0 end,
    case when p_correct then 0 else 1 end,
    now()
  )
  on conflict (user_id, card_id) do update set
    richtig = flashcard_progress.richtig + (case when p_correct then 1 else 0 end),
    falsch = flashcard_progress.falsch + (case when p_correct then 0 else 1 end),
    updated_at = now();
end;
$$;

revoke all on function public.increment_topic_mastery(text, boolean) from anon;
revoke all on function public.increment_flashcard_progress(text, boolean) from anon;
grant execute on function public.increment_topic_mastery(text, boolean) to authenticated;
grant execute on function public.increment_flashcard_progress(text, boolean) to authenticated;
