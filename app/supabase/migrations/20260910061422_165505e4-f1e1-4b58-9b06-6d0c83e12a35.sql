CREATE TABLE public.topic_mastery (
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  topic_id text NOT NULL,
  richtig int NOT NULL DEFAULT 0,
  falsch int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_mastery TO authenticated;
GRANT ALL ON public.topic_mastery TO service_role;
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own topic_mastery" ON public.topic_mastery FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.flashcard_progress (
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  card_id text NOT NULL,
  richtig int NOT NULL DEFAULT 0,
  falsch int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_progress TO authenticated;
GRANT ALL ON public.flashcard_progress TO service_role;
ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own flashcard_progress" ON public.flashcard_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.exam_questions (
  id text PRIMARY KEY,
  exam_id text,
  aufgabe_nr int,
  teil text,
  frage text,
  max_punkte int,
  musterloesung text
);
GRANT SELECT ON public.exam_questions TO authenticated;
GRANT ALL ON public.exam_questions TO service_role;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read exam_questions" ON public.exam_questions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  exam_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  gesamtpunkte int
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exam_attempts" ON public.exam_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id text REFERENCES public.exam_questions(id),
  antworttext text,
  ki_punkte int,
  ki_feedback text
);
CREATE INDEX exam_answers_attempt_id_idx ON public.exam_answers(attempt_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_answers TO authenticated;
GRANT ALL ON public.exam_answers TO service_role;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exam_answers" ON public.exam_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exam_attempts a WHERE a.id = exam_answers.attempt_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exam_attempts a WHERE a.id = exam_answers.attempt_id AND a.user_id = auth.uid()));

CREATE TABLE public.error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  quelle text,
  thema text,
  beschreibung text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_log TO authenticated;
GRANT ALL ON public.error_log TO service_role;
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own error_log" ON public.error_log FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);