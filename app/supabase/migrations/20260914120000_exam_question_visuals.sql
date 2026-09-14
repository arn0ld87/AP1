-- Optionale, abwärtskompatible Darstellung strukturierter Prüfungsaufgaben.
alter table public.exam_questions add column if not exists visual_type text;
alter table public.exam_questions add column if not exists visual_data jsonb;
alter table public.exam_questions add column if not exists visual_path text;
alter table public.exam_questions add column if not exists visual_alt text;
alter table public.exam_questions add column if not exists answer_schema jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_questions_visual_type_check'
      and conrelid = 'public.exam_questions'::regclass
  ) then
    alter table public.exam_questions add constraint exam_questions_visual_type_check
      check (visual_type is null or visual_type in ('er', 'netzplan', 'gantt', 'illustration'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_questions_visual_alt_check'
      and conrelid = 'public.exam_questions'::regclass
  ) then
    alter table public.exam_questions add constraint exam_questions_visual_alt_check
      check (visual_type is null or nullif(btrim(visual_alt), '') is not null);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_questions_answer_schema_check'
      and conrelid = 'public.exam_questions'::regclass
  ) then
    alter table public.exam_questions add constraint exam_questions_answer_schema_check
      check (answer_schema is null or jsonb_typeof(answer_schema) = 'object');
  end if;
end
$$;

comment on column public.exam_questions.visual_data is
  'Typisierte Diagrammdaten für er, netzplan, gantt oder codegenerierte illustration.';
comment on column public.exam_questions.answer_schema is
  'Optionales UI-Schema für text, multiField oder table; bestehende Fragen bleiben Freitext.';
