-- SelfGrade-Persistenz-Fix: exam_attempts.gesamtpunkte war nach einer
-- Selbsteinschätzung nicht mehr Quelle der Wahrheit. upsertSelfGrade schrieb
-- bisher nur exam_answers.ki_punkte per Client-Upsert; die UI zeigte danach
-- eine neue Summe aus lokalem State, exam_attempts.gesamtpunkte blieb beim
-- zuletzt persistierten Abgabe-Wert. Nach Reload/Navigation zurück zur
-- Auswahlliste (die gesamtpunkte direkt aus der DB liest) sah der Nutzer
-- wieder den alten, niedrigeren Wert.
--
-- Diese RPC macht Ownership-Prüfung, Attempt/Frage-Kopplung, Punkte-Clamping,
-- Upsert und Neuberechnung der Summe atomar — nach demselben Muster wie
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
  v_attempt_exam_id text;
  v_question_exam_id text;
  v_max_punkte int;
  v_gesamtpunkte int;
begin
  -- Ownership UND Row-Lock in einem Schritt: `for update` serialisiert
  -- parallele Aufrufe auf denselben Attempt. Ohne die Sperre könnten zwei
  -- gleichzeitige Selbsteinschätzungen (zwei Fragen, zwei Klicks kurz
  -- hintereinander) unter READ COMMITTED jeweils die Zeile der anderen noch
  -- nicht sehen und beide eine unvollständige Summe schreiben — der letzte
  -- Commit gewinnt und genau die Inkonsistenz wäre zurück, die diese RPC
  -- beheben soll.
  select exam_id into v_attempt_exam_id
  from exam_attempts
  where id = p_attempt_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Attempt gehört nicht zum angemeldeten Nutzer' using errcode = '42501';
  end if;

  select exam_id, max_punkte into v_question_exam_id, v_max_punkte
  from exam_questions
  where id = p_question_id;

  if not found then
    raise exception 'Unbekannte question_id: %', p_question_id using errcode = '22023';
  end if;

  -- Attempt/Frage-Kopplung, analog zur Prüfung in grade-exam-answer.ts:
  -- eine Frage aus einer anderen Prüfung darf die Summe dieses Attempts nicht
  -- verändern (über die UI nicht auslösbar, über einen direkten RPC-Aufruf
  -- schon).
  if v_attempt_exam_id is null
     or v_question_exam_id is null
     or v_question_exam_id is distinct from v_attempt_exam_id then
    raise exception 'Frage % gehört nicht zur Prüfung dieses Attempts', p_question_id
      using errcode = '22023';
  end if;

  -- Clamping: `is null` explizit, sonst wäre der Vergleich bei NULL selbst
  -- NULL und die Exception bliebe aus (NULL-Punktzahl würde persistiert).
  if p_punkte is null or p_punkte < 0 or p_punkte > v_max_punkte then
    raise exception 'punkte außerhalb von 0..%: %', v_max_punkte, p_punkte using errcode = '22023';
  end if;

  -- Längenlimit analog zu MAX_ANTWORT_LAENGE in grade-exam-answer.ts.
  if length(coalesce(p_antworttext, '')) > 10000 then
    raise exception 'antworttext zu lang (max 10000 Zeichen)' using errcode = '22023';
  end if;

  -- user_id bleibt hier bewusst leer: das KI-Tageslimit in grade-exam-answer.ts
  -- zählt exam_answers über user_id + ki_punkte. Eine Selbsteinschätzung ist
  -- keine KI-Bewertung und darf kein KI-Kontingent verbrauchen. Die
  -- Eigentümerschaft der Zeile ergibt sich weiterhin aus dem Attempt
  -- (RLS-Policy "own exam_answers" joint über exam_attempts.user_id).
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

-- Schreibzugriff auf exam_answers ausschließlich über geprüfte Pfade:
-- diese RPC (security definer) und die Edge Function (service_role, umgeht
-- RLS ohnehin). Ohne dieses Revoke bliebe der ursprüngliche Fehler
-- strukturell möglich — jeder direkte Insert/Update auf exam_answers durch
-- einen angemeldeten Nutzer würde exam_attempts.gesamtpunkte wieder
-- auseinanderlaufen lassen, ohne Clamping und ohne Exam-Kopplung.
-- SELECT bleibt erhalten (Ergebnisanzeige), DELETE ebenfalls (Attempt-Cascade
-- und Selbstlöschung des Accounts).
revoke insert, update on public.exam_answers from authenticated;
