-- Kostenkontrolle atomar machen (P1-3): Das KI-Tageslimit wurde in der
-- Edge Function per GET-Zaehlung geprueft (read-then-act) — zwischen
-- Pruefung und Insert der Bewertung liegt der Bedrock-Aufruf, deshalb
-- sahen N parallele Anfragen alle "Kontingent frei" und liefen alle
-- durch. Diese Migration verlagert die Entscheidung in Postgres:
--
-- consume_ai_budget() reserviert atomar ein Kontingent-Stueck. Das
-- INSERT ... ON CONFLICT DO UPDATE nimmt einen Row-Lock auf der
-- (user_id, day)-Zeile; das WHERE des DO UPDATE wird nach dem Erwerb
-- der Sperre gegen den aktuell committeten Stand neu bewertet
-- (EvalPlanQual unter READ COMMITTED). Ueberschreitet der Zaehler das
-- Limit, aktualisiert das Statement keine Zeile, RETURNING bleibt
-- leer und die Funktion liefert false.
--
-- release_ai_budget() gibt bei fehlgeschlagener Bewertung (Bedrock-
-- Fehler, Parse-Fehler, Persistenzfehler) das reservierte Stueck
-- zurueck — nur erfolgreiche KI-Bewertungen verbrauchen Kontingent.
--
-- Aufrufer ist ausschliesslich die Edge Function (service_role). Die
-- Tabelle und beide RPCs haben deshalb keine Rechte fuer anon oder
-- authenticated; p_user ist als Parameter vertrauenswuerdig, weil nur
-- service_role/supabase_admin die RPCs ausfuehren duerfen.

create table if not exists public.ai_budget_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  n integer not null default 1,
  constraint ai_budget_daily_pk primary key (user_id, day)
);

alter table public.ai_budget_daily enable row level security;

-- Keine Client-Rechte an der Tabelle: Default-Privileges in self-hosted
-- Supabase wuerden anon/authenticated sonst Rechte geben. Zugriff laeuft
-- nur ueber die security-definer-RPCs (service_role).
revoke all on public.ai_budget_daily from anon, authenticated;

create or replace function public.consume_ai_budget(p_user uuid, p_limit integer default 50)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if p_user is null then
    raise exception 'p_user darf nicht null sein' using errcode = '22023';
  end if;
  if p_limit is null or p_limit < 1 then
    raise exception 'p_limit muss >= 1 sein' using errcode = '22023';
  end if;

  insert into ai_budget_daily (user_id, day, n)
  values (p_user, current_date, 1)
  on conflict (user_id, day) do update
    set n = ai_budget_daily.n + 1
    where ai_budget_daily.n < p_limit
  returning n into v_n;

  return v_n is not null;
end;
$$;

create or replace function public.release_ai_budget(p_user uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update ai_budget_daily set n = n - 1
  where user_id = p_user and day = current_date and n > 0;
$$;

revoke all on function public.consume_ai_budget(uuid, integer) from anon, authenticated;
revoke all on function public.release_ai_budget(uuid) from anon, authenticated;
