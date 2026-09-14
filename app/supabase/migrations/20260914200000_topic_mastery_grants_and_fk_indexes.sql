-- Teil 1: Direktschreibzugriff auf topic_mastery/flashcard_progress entziehen.
--
-- Migration 20260910061422 vergab `grant select, insert, update, delete ...
-- to authenticated` auf beiden Tabellen. Fachlich gepflegt werden sie
-- ausschliesslich atomar ueber increment_topic_mastery /
-- increment_flashcard_progress (20260910120000_atomic_increment_rpc.sql,
-- SECURITY DEFINER) -- app/src/lib/topic-mastery.ts und
-- flashcard-progress.ts rufen fuer Schreibzugriffe nur diese RPCs auf, nie
-- ein direktes .insert()/.update()/.delete() auf die Tabellen (siehe
-- fetchTopicMastery/fetchFlashcardProgress: ausschliesslich .select()).
-- Die vollen Grants erlaubten also einen zweiten, ungeprueften Schreibpfad
-- per direktem PostgREST-Aufruf (z.B. beliebige richtig/falsch-Werte ohne
-- das atomare Inkrement), der die RPC-Logik komplett umgeht.
--
-- SECURITY DEFINER-Funktionen laufen mit den Rechten ihres Owners, nicht
-- des Aufrufers -- das Entziehen der Tabellen-Grants von `authenticated`
-- aendert daher nichts am RPC-Pfad (gleiches Muster wie beim UPDATE-Entzug
-- auf exam_attempts in 20260914140000_exam_attempts_server_side_scoring.sql).
-- SELECT bleibt erhalten (Fortschrittsanzeige in fortschritt.tsx,
-- index.tsx, lernblaetter.tsx, rechnen.tsx, wissenskarten.tsx). Es gibt im
-- Frontend keine Reset-/Loesch-Funktion fuer einzelne Zeilen, DELETE faellt
-- deshalb komplett weg (die Account-Loeschung laeuft ohnehin ueber
-- service_role + ON DELETE CASCADE, siehe delete-account.ts). Die
-- RLS-Policy "own topic_mastery"/"own flashcard_progress" (FOR ALL) bleibt
-- unveraendert -- sie schuetzt die Zeilen-Zugehoerigkeit, die eigentliche
-- Rechtegrenze zieht dieser REVOKE.

revoke insert, update, delete on public.topic_mastery from authenticated;
revoke insert, update, delete on public.flashcard_progress from authenticated;

-- Teil 2: Fehlende Indizes auf Fremdschluesselspalten im public-Schema.
--
-- Migration 20260910061422 legte topic_mastery/flashcard_progress/
-- exam_attempts/error_log ohne Index auf ihre user_id-FK an (topic_mastery
-- und flashcard_progress sind ueber ihren zusammengesetzten Primary Key
-- (user_id, ...) bereits abgedeckt, siehe Pruefabfrage unten -- betroffen
-- sind nur exam_attempts.user_id, exam_answers.question_id und
-- error_log.user_id).
--
-- Die Baseline-Migration 20260914170000 hat daneben 50 zuvor nur live
-- existierende Tabellen samt ihrer Fremdschluessel importiert (ADR-0006) --
-- ein Domaenenmodell fuer KI-gestuetzte Prüfungsgenerierung (generation_job,
-- exam_blueprint, rubric, grading_result, curriculum_node, competency,
-- source_document u.a.), das in der bisherigen Projekt-Doku (CLAUDE.md)
-- nicht beschrieben ist, aber laut Kommentar der Baseline-Migration
-- produktiv auf dem armserver liegt. Ein Grossteil der dort neu
-- hinzugekommenen FK-Spalten hat ebenfalls keinen Index erhalten.
--
-- Ermittelt durch Anwenden aller bestehenden Migrationen auf eine frische
-- Postgres-16-Instanz und Abgleich von pg_constraint (contype='f') gegen
-- pg_index je Tabelle: eine FK-Spalte gilt als abgedeckt, wenn ihre
-- Spalte(n) das fuehrende Prefix irgendeines Index auf derselben Tabelle
-- bilden (Composite-FKs entsprechend in FK-Reihenfolge). Alle unten
-- aufgefuehrten Konstellationen hatten KEINEN solchen Index.
--
-- Warum das zaehlt:
--  * Join-Pfad: jede Abfrage, die von der Kind- zur Elterntabelle joint
--    (oder umgekehrt selektiv nach der FK-Spalte filtert), braucht sonst
--    einen Sequential Scan ueber die komplette Kind-Tabelle.
--  * Loesch-/Update-Pfad: Postgres muss bei DELETE/UPDATE auf der
--    referenzierten Elternzeile (bzw. bei ON DELETE CASCADE) pruefen, ob
--    abhaengige Zeilen existieren -- ohne Index auf der FK-Spalte ist das
--    ebenfalls ein Sequential Scan ueber die Kind-Tabelle, bei jeder
--    einzelnen geloeschten/aktualisierten Elternzeile erneut.
-- Indexnamen sind deterministisch aus dem jeweiligen Constraint-Namen
-- abgeleitet (idx_<conname>), damit sie eindeutig sind und sich der Bezug
-- zur pruefenden FK sofort erschliesst.

-- ai_call_log
create index if not exists idx_ai_call_log_job_fk on public.ai_call_log(generation_job_id,user_id);

-- answer
create index if not exists idx_answer_exam_fk on public.answer(exam_id,user_id);
create index if not exists idx_answer_question_fk on public.answer(question_id,user_id);
create index if not exists idx_answer_session_fk on public.answer(learning_session_id,user_id);

-- attachment
create index if not exists idx_attachment_attachment_type_code_fkey on public.attachment(attachment_type_code);
create index if not exists idx_attachment_question_fk on public.attachment(question_id,user_id);
create index if not exists idx_attachment_scenario_fk on public.attachment(scenario_id,user_id);

-- audit_event
create index if not exists idx_audit_event_generation_job_fk on public.audit_event(generation_job_id,user_id);
create index if not exists idx_audit_event_prompt_version_id_fkey on public.audit_event(prompt_version_id);
create index if not exists idx_audit_event_workflow_version_id_fkey on public.audit_event(workflow_version_id);

-- competency_state
create index if not exists idx_competency_state_competency_id_fkey on public.competency_state(competency_id);

-- curriculum_node
create index if not exists idx_curriculum_node_parent_is_subtopic on public.curriculum_node(parent_id,parent_node_type);

-- error_log (aus Migration 20260910061422)
create index if not exists idx_error_log_user_id_fkey on public.error_log(user_id);

-- error_pattern
create index if not exists idx_error_pattern_answer_fk on public.error_pattern(last_answer_id,user_id);
create index if not exists idx_error_pattern_curriculum_node_id_fkey on public.error_pattern(curriculum_node_id);

-- exam
create index if not exists idx_exam_blueprint_fk on public.exam(blueprint_id,user_id);
create index if not exists idx_exam_generation_job_fk on public.exam(generation_job_id,user_id);

-- exam_answers (aus Migration 20260910061422; attempt_id und user_id sind
-- bereits ueber exam_answers_attempt_id_idx bzw. exam_answers_user_created_idx
-- abgedeckt, nur question_id fehlte)
create index if not exists idx_exam_answers_question_id_fkey on public.exam_answers(question_id);

-- exam_attempts (aus Migration 20260910061422)
create index if not exists idx_exam_attempts_user_id_fkey on public.exam_attempts(user_id);

-- exam_blueprint
create index if not exists idx_exam_blueprint_generation_job_fk on public.exam_blueprint(generation_job_id,user_id);
create index if not exists idx_exam_blueprint_prompt_version_id_fkey on public.exam_blueprint(prompt_version_id);
create index if not exists idx_exam_blueprint_workflow_version_id_fkey on public.exam_blueprint(workflow_version_id);

-- exam_corpus_entry
create index if not exists idx_exam_corpus_entry_answer_format_code_fkey on public.exam_corpus_entry(answer_format_code);
create index if not exists idx_exam_corpus_entry_cognitive_level_code_fkey on public.exam_corpus_entry(cognitive_level_code);
create index if not exists idx_exam_corpus_entry_extraction_job_id_fkey on public.exam_corpus_entry(extraction_job_id);
create index if not exists idx_exam_corpus_entry_question_type_code_fkey on public.exam_corpus_entry(question_type_code);
create index if not exists idx_exam_corpus_entry_situation_type_code_fkey on public.exam_corpus_entry(situation_type_code);

-- exam_item_assignment
create index if not exists idx_exam_item_assignment_topic_id_fkey on public.exam_item_assignment(topic_id);

-- generation_job
create index if not exists idx_generation_job_error_code_fk on public.generation_job(error_code);
create index if not exists idx_generation_job_workflow_version_id_fkey on public.generation_job(workflow_version_id);

-- grading_criterion_result
create index if not exists idx_gcr_criterion_fk on public.grading_criterion_result(rubric_criterion_id,rubric_id,user_id);
create index if not exists idx_gcr_result_fk on public.grading_criterion_result(grading_result_id,rubric_id,user_id);

-- grading_result
create index if not exists idx_grading_result_answer_fk on public.grading_result(answer_id,user_id);
create index if not exists idx_grading_result_generation_job_fk on public.grading_result(generation_job_id,user_id);
create index if not exists idx_grading_result_prompt_version_id_fkey on public.grading_result(prompt_version_id);
create index if not exists idx_grading_result_rubric_fk on public.grading_result(rubric_id,user_id);
create index if not exists idx_grading_result_supersedes_fk on public.grading_result(supersedes_id,answer_id,user_id);
create index if not exists idx_grading_result_workflow_version_id_fkey on public.grading_result(workflow_version_id);

-- grading_result_source
create index if not exists idx_grading_result_source_quelle_fk on public.grading_result_source(source_grading_result_id,answer_id,user_id);
create index if not exists idx_grading_result_source_rolle_stimmt_fk on public.grading_result_source(source_grading_result_id,role);
create index if not exists idx_grading_result_source_ziel_fk on public.grading_result_source(grading_result_id,answer_id,user_id);

-- learning_session
create index if not exists idx_learning_session_exam_fk on public.learning_session(exam_id,user_id);

-- model_class_route
create index if not exists idx_model_class_route_fallback_model_pricing_id_fkey on public.model_class_route(fallback_model_pricing_id);
create index if not exists idx_model_class_route_primary_model_pricing_id_fkey on public.model_class_route(primary_model_pricing_id);

-- question
create index if not exists idx_question_answer_format_code_fkey on public.question(answer_format_code);
create index if not exists idx_question_cognitive_level_code_fkey on public.question(cognitive_level_code);
create index if not exists idx_question_generation_job_fk on public.question(generation_job_id,user_id);
create index if not exists idx_question_prompt_version_id_fkey on public.question(prompt_version_id);
create index if not exists idx_question_question_type_code_fkey on public.question(question_type_code);
create index if not exists idx_question_scenario_fk on public.question(scenario_id,user_id);
create index if not exists idx_question_workflow_version_id_fkey on public.question(workflow_version_id);

-- question_competency
create index if not exists idx_question_competency_question_fk on public.question_competency(question_id,user_id);

-- question_skill
create index if not exists idx_question_skill_question_fk on public.question_skill(question_id,user_id);

-- readiness_snapshot
create index if not exists idx_readiness_snapshot_weight_set_id_fkey on public.readiness_snapshot(weight_set_id);

-- rubric
create index if not exists idx_rubric_question_fk on public.rubric(question_id,user_id);

-- rubric_criterion
create index if not exists idx_rubric_criterion_competency_id_fkey on public.rubric_criterion(competency_id);
create index if not exists idx_rubric_criterion_computation_type_code_fkey on public.rubric_criterion(computation_type_code);
create index if not exists idx_rubric_criterion_rubric_fk on public.rubric_criterion(rubric_id,user_id);

-- scenario
create index if not exists idx_scenario_exam_fk on public.scenario(exam_id,user_id);
create index if not exists idx_scenario_situation_type_code_fkey on public.scenario(situation_type_code);

-- source_document
create index if not exists idx_source_document_duplicate_of_fkey on public.source_document(duplicate_of);

-- topic_weight_set
create index if not exists idx_topic_weight_set_basis_coding_pass_id_fkey on public.topic_weight_set(basis_coding_pass_id);

-- uebung_skill
create index if not exists idx_uebung_skill_computation_type_code_fkey on public.uebung_skill(computation_type_code);
create index if not exists idx_uebung_skill_curriculum_node_id_fkey on public.uebung_skill(curriculum_node_id);
