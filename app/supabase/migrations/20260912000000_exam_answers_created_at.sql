-- KI-Tageslimit: Zeitspur für Bewertungen (grade-exam-answer zählt
-- Bewertungen pro Nutzer/Tag über created_at, siehe DAILY_KI_LIMIT).
alter table public.exam_answers
  add column if not exists created_at timestamptz not null default now();

create index if not exists exam_answers_user_created_idx
  on public.exam_answers (user_id, created_at);
