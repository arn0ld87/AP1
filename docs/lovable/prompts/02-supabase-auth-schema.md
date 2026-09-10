# docs/lovable/prompts/02-supabase-auth-schema.md

Richte Supabase für dieses Projekt ein: E-Mail+Passwort-Authentifizierung
(kein Social Login, keine Registrierung über die UI — ein einzelner Account
wird direkt in Supabase angelegt), Login-Screen vor allen anderen Seiten.

Lege folgende Tabellen an:

- `topic_mastery(user_id uuid references auth.users, topic_id text, richtig int default 0, falsch int default 0, updated_at timestamptz default now(), primary key (user_id, topic_id))`
- `flashcard_progress(user_id uuid references auth.users, card_id text, richtig int default 0, falsch int default 0, updated_at timestamptz default now(), primary key (user_id, card_id))`
- `exam_questions(id text primary key, exam_id text, aufgabe_nr int, teil text, frage text, max_punkte int, musterloesung text)`
- `exam_attempts(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users, exam_id text, started_at timestamptz default now(), finished_at timestamptz, gesamtpunkte int)`
- `exam_answers(id uuid primary key default gen_random_uuid(), attempt_id uuid references exam_attempts(id), question_id text references exam_questions(id), antworttext text, ki_punkte int, ki_feedback text)`
- `error_log(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users, quelle text, thema text, beschreibung text, created_at timestamptz default now())`

Row Level Security: jede Tabelle mit `user_id` darf nur vom jeweiligen
eingeloggten Nutzer gelesen/geschrieben werden. `exam_questions` ist für
eingeloggte Nutzer lesbar, aber nicht über die Client-API beschreibbar
(Import erfolgt separat).
