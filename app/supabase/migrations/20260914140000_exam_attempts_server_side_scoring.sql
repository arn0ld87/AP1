-- Prüfungsergebnis serverseitig festschreiben statt vom Client übernehmen.
--
-- Ausgangslage: Migration 20260910061422 vergab `grant select, insert, update,
-- delete on exam_attempts to authenticated` mit der Policy "own exam_attempts"
-- (FOR ALL, USING/WITH CHECK auth.uid() = user_id). Die Policy schützt nur die
-- Zeilen-Zugehörigkeit, nicht die einzelnen Spalten — ein angemeldeter Nutzer
-- konnte damit per direktem PostgREST-Aufruf
--   supabase.from('exam_attempts').update({ gesamtpunkte: 100, finished_at: … })
-- sein eigenes Ergebnis auf einen beliebigen Wert setzen, vollständig entkoppelt
-- von den tatsächlich bewerteten exam_answers. Derselbe Weg stand über INSERT
-- offen: ein neuer Attempt liess sich direkt mit gesamtpunkte/finished_at
-- anlegen, ohne je eine Frage beantwortet zu haben.
--
-- Für exam_answers wurde dieselbe Klasse von Lücke bereits mit
-- 20260914000000_submit_self_grade_rpc.sql geschlossen (revoke insert, update +
-- geprüfte security-definer-RPC). exam_attempts blieb dabei offen — diese
-- Migration zieht das nach, nach demselben Muster.
--
-- Danach ist exam_attempts.gesamtpunkte ausschliesslich das Ergebnis einer
-- serverseitigen Summe über exam_answers.ki_punkte: geschrieben entweder von
-- finish_exam_attempt (Abgabe) oder von submit_self_grade (Selbsteinschätzung).

create or replace function public.finish_exam_attempt(p_attempt_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_finished_at timestamptz;
  v_gesamtpunkte int;
begin
  -- Ownership-Prüfung UND Row-Lock in einem Schritt, analog submit_self_grade:
  -- `for update` serialisiert den Abschluss gegen eine gleichzeitig laufende
  -- Selbsteinschätzung auf demselben Attempt. Ohne die Sperre könnten beide
  -- unter READ COMMITTED eine je unvollständige Summe berechnen und der
  -- letzte Commit gewänne.
  -- auth.uid() muss hier explizit geprüft werden: security-definer-Funktionen
  -- laufen mit den Rechten des Owners, RLS greift für sie nicht automatisch.
  select finished_at into v_finished_at
  from exam_attempts
  where id = p_attempt_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Attempt gehört nicht zum angemeldeten Nutzer' using errcode = '42501';
  end if;

  -- Die Summe stammt ausschliesslich aus den tatsächlich persistierten
  -- Bewertungen. Nicht bewertbare Fragen (KI-Fehler) haben ki_punkte null und
  -- zählen über coalesce/sum als 0 — identisch zur Client-Semantik in
  -- gesamtpunkteVon (`results[f.id]?.punkte ?? 0`).
  select coalesce(sum(ki_punkte), 0) into v_gesamtpunkte
  from exam_answers
  where attempt_id = p_attempt_id;

  -- finished_at wird nur beim ersten Abschluss gesetzt: ein erneuter Aufruf
  -- (Doppelklick, Timer-Ablauf parallel zur manuellen Abgabe) aktualisiert die
  -- Summe, verschiebt aber nicht den dokumentierten Abgabezeitpunkt.
  update exam_attempts
  set gesamtpunkte = v_gesamtpunkte,
      finished_at = coalesce(v_finished_at, now())
  where id = p_attempt_id;

  return v_gesamtpunkte;
end;
$$;

revoke all on function public.finish_exam_attempt(uuid) from anon;
grant execute on function public.finish_exam_attempt(uuid) to authenticated;

-- UPDATE komplett entziehen: es gibt keinen legitimen Client-seitigen Grund,
-- eine exam_attempts-Zeile zu ändern. Beide Schreibpfade (Abgabe und
-- Selbsteinschätzung) laufen über security-definer-RPCs, die von diesem Revoke
-- nicht betroffen sind, weil sie mit den Rechten ihres Owners ausgeführt werden.
revoke update on public.exam_attempts from authenticated;

-- INSERT auf die Spalten beschränken, die der Start einer Prüfung wirklich
-- setzt (probepruefungen.tsx: .insert({ exam_id, user_id })). gesamtpunkte und
-- finished_at fallen damit zwingend auf ihren Default null zurück — ein
-- "fertiger" Attempt lässt sich nicht mehr direkt erzeugen. id und started_at
-- bleiben bewusst aussen vor und werden aus ihren Defaults befüllt.
-- Die RLS-Policy "own exam_attempts" (WITH CHECK auth.uid() = user_id) bleibt
-- unverändert und verhindert weiterhin das Anlegen fremder Attempts.
revoke insert on public.exam_attempts from authenticated;
grant insert (exam_id, user_id) on public.exam_attempts to authenticated;

-- SELECT (Ergebnisanzeige, Statusliste) und DELETE (Nutzer darf eigene
-- Versuche verwerfen; Account-Löschung läuft ohnehin über service_role und
-- ON DELETE CASCADE) bleiben unverändert erhalten.
