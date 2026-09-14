-- Baseline: Live-Schema der Lernplattform (Stand 14.09.2026)
--
-- Aufgenommener Ist-Zustand der produktiven Datenbank auf dem armserver. Diese
-- Objekte sind ueber die Zeit direkt in der Datenbank entstanden und hatten
-- bis hierher KEINE Entsprechung im Repository: weder in einer Migration noch
-- in irgendeinem Branch, noch in einer SQL-Datei auf dem Server.
--
-- Folge davon war, dass die neun vorhandenen Migrationen nur 7 der 57 Tabellen
-- beschrieben. Ein Wiederaufbau aus dem Repository (siehe docs/backup-restore.md)
-- haette 50 Tabellen, 38 Funktionen, 7 Views und 33 Enum-Typen samt ihrer Daten
-- nicht wiederhergestellt. scripts/validate_migrations.py pruefte entsprechend
-- ein Schema, das mit der Produktion wenig gemeinsam hatte.
--
-- Erzeugt aus: pg_dump --schema-only --schema=public --no-owner, abzueglich der
-- sieben bereits migrierten Tabellen (--exclude-table) und der sechs bereits
-- migrierten Funktionen. Alt und neu sind vollstaendig entkoppelt: zwischen den
-- beiden Objektgruppen existiert kein einziger Fremdschluessel, weshalb diese
-- Migration ohne Reihenfolgekonflikt hinter den bestehenden laufen kann.
--
-- Verifikation (siehe PR-Beschreibung): frische Datenbank + die neun
-- bestehenden Migrationen + diese Baseline ergibt objektgleich dasselbe Schema
-- wie die Produktionsdatenbank.
--
-- Diese Datei ist bewusst ein reiner Ist-Abzug und wird nicht von Hand
-- gepflegt. Aenderungen am Schema gehoeren ab jetzt in neue, kleine
-- Migrationen -- nicht in diese Datei und nicht mehr direkt in die Live-DB.

-- pg_dump ordnet Funktionen vor den Tabellen an, die sie referenzieren
-- (z. B. pruefung_abschliessen greift auf public.exam zu). Ohne diese
-- Einstellung pruefte Postgres den Funktionskoerper bereits beim CREATE und
-- die Migration schluege mit 'relation does not exist' fehl. Die Einstellung
-- gilt nur fuer diese Transaktion.
set check_function_bodies = false;

--
--


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--


--
-- Name: actor_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.actor_kind AS ENUM (
    'USER',
    'SYSTEM',
    'EDGE_FUNCTION',
    'DIFY',
    'N8N'
);


--
-- Name: assignment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.assignment_method AS ENUM (
    'MANUAL',
    'LLM_PROPOSED',
    'LLM_CONFIRMED',
    'LLM_CORRECTED',
    'KEYWORD',
    'UNRESOLVED'
);


--
-- Name: blueprint_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.blueprint_status AS ENUM (
    'DRAFT',
    'VALIDATED',
    'REJECTED'
);


--
-- Name: copyright_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.copyright_status AS ENUM (
    'PRIVATE_CORPUS',
    'PUBLIC_NORM'
);


--
-- Name: cost_basis; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cost_basis AS ENUM (
    'computed',
    'subscription_quota',
    'unavailable'
);


--
-- Name: criterion_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.criterion_kind AS ENUM (
    'DETERMINISTIC',
    'QUALITATIVE'
);


--
-- Name: curriculum_node_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.curriculum_node_type AS ENUM (
    'SUBTOPIC',
    'SKILL'
);


--
-- Name: doc_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.doc_visibility AS ENUM (
    'INTERNAL',
    'PRIVATE_GRADING_ONLY'
);


--
-- Name: document_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_role AS ENUM (
    'EXAM_TASK',
    'SOLUTION',
    'ANSWER_SHEET',
    'OFFICIAL_SAMPLE',
    'LEGAL_NORM',
    'CURRICULUM',
    'REFERENCE',
    'INFO_SHEET'
);


--
-- Name: edition_member_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.edition_member_type AS ENUM (
    'TASK',
    'ANSWER_SHEET',
    'SOLUTION',
    'SCAN_VARIANT',
    'COMPOSITE_COPY'
);


--
-- Name: error_class; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.error_class AS ENUM (
    'knowledge_gap',
    'calculation_error',
    'unit_error',
    'misread_question',
    'missing_justification',
    'wrong_assumption',
    'incomplete_answer',
    'time_pressure',
    'transcription_error'
);


--
-- Name: exam_generation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exam_generation AS ENUM (
    'CURRENT_AP1',
    'LEGACY_ZP',
    'OTHER_EXAM'
);


--
-- Name: exam_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exam_status AS ENUM (
    'DRAFT',
    'READY',
    'IN_PROGRESS',
    'SUBMITTED',
    'GRADED',
    'ABANDONED'
);


--
-- Name: exam_term; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exam_term AS ENUM (
    'FRUEHJAHR',
    'HERBST'
);


--
-- Name: grader_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.grader_type AS ENUM (
    'DETERMINISTIC',
    'AI',
    'MERGED',
    'SECOND_OPINION'
);


--
-- Name: ingestion_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ingestion_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'READY',
    'FAILED',
    'INGESTED_OUT_OF_SCOPE'
);


--
-- Name: job_result_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_result_kind AS ENUM (
    'EXAM',
    'EXAM_BLUEPRINT',
    'SOURCE_DOCUMENT',
    'GRADING_RESULT',
    'REPORT'
);


--
-- Name: job_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'RETRYING',
    'COMPLETED',
    'FAILED',
    'REVIEW_REQUIRED'
);


--
-- Name: job_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_type AS ENUM (
    'DOCUMENT_INGESTION',
    'FULL_EXAM_GENERATION',
    'BATCH_CORPUS_ANALYSIS',
    'GRADING_REVIEW',
    'SCHEDULED_QUALITY_AUDIT',
    'EXAM_BATCH_GENERATION',
    'REPORT'
);


--
-- Name: learning_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.learning_mode AS ENUM (
    'MISSION',
    'TICKET_BLITZ',
    'FEHLERJAGD',
    'ENTSCHEIDUNGSTRAINING',
    'ADAPTIVE_TRAINING',
    'MINI_EXAM',
    'FULL_EXAM'
);


--
-- Name: model_class; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.model_class AS ENUM (
    'FAST',
    'BALANCED',
    'REASONING',
    'REVIEW'
);


--
-- Name: question_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_status AS ENUM (
    'DRAFT',
    'VALIDATED',
    'PUBLISHED',
    'REJECTED'
);


--
-- Name: review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.review_status AS ENUM (
    'NOT_REQUIRED',
    'PENDING',
    'CONFIRMED',
    'OVERRIDDEN'
);


--
-- Name: similarity_verdict; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.similarity_verdict AS ENUM (
    'PASS',
    'REJECT_GENERATED_QUESTION'
);


--
-- Name: source_tier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.source_tier AS ENUM (
    'TIER_1',
    'TIER_2',
    'TIER_3',
    'TIER_4'
);


--
-- Name: source_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.source_type AS ENUM (
    '01_Rechtsgrundlagen',
    '02_Lehrplaene',
    '03_IHK-Leipzig',
    '04_AP1_Pruefungen',
    '05_Uebungsaufgaben',
    '06_Referenzmaterial'
);


--
-- Name: text_layer; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.text_layer AS ENUM (
    'FULL',
    'SPARSE',
    'NONE'
);


--
-- Name: text_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.text_source AS ENUM (
    'PDFTEXT',
    'OCR'
);


--
-- Name: trend_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.trend_direction AS ENUM (
    'IMPROVING',
    'STABLE',
    'DECLINING'
);


--
-- Name: weight_band; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.weight_band AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW',
    'UNRESOLVED'
);


--
-- Name: weight_provenance; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.weight_provenance AS ENUM (
    'PLACEHOLDER_KMK_HOURS',
    'EMPIRICAL',
    'BLENDED'
);


--
-- Name: weight_scope; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.weight_scope AS ENUM (
    'LEARNING_FIELD',
    'COMPETENCY',
    'TOPIC'
);


--
-- Name: workflow_engine; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.workflow_engine AS ENUM (
    'DIFY',
    'N8N'
);


--
-- Name: assert_answer_exam_chain_consistent(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_answer_exam_chain_consistent() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_question_exam_id uuid;
  v_session_exam_id  uuid;
begin
  select sc.exam_id into v_question_exam_id
    from public.question q
    join public.scenario sc on sc.id = q.scenario_id
   where q.id = new.question_id;

  if v_question_exam_id is distinct from new.exam_id then
    raise exception
      'answer %: question % gehoert (ueber scenario) zu exam %, nicht zu exam % der Antwortzeile',
      new.id, new.question_id, v_question_exam_id, new.exam_id
      using errcode = 'check_violation';
  end if;

  if new.learning_session_id is not null then
    select ls.exam_id into v_session_exam_id
      from public.learning_session ls where ls.id = new.learning_session_id;

    if v_session_exam_id is distinct from new.exam_id then
      raise exception
        'answer %: learning_session % gehoert zu exam %, nicht zu exam % der Antwortzeile',
        new.id, new.learning_session_id, v_session_exam_id, new.exam_id
        using errcode = 'check_violation';
    end if;
  end if;
  return null;
end;
$$;


--
-- Name: assert_audit_event_user_actor(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_audit_event_user_actor() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.actor_kind = 'USER' and new.user_id is null then
    raise exception
      'audit_event mit actor_kind = ''USER'' braucht eine user_id (Masterprompt Abschnitt 26).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;


--
-- Name: assert_exam_id_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_exam_id_immutable() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if old.exam_id is distinct from new.exam_id then
    raise exception
      '%.exam_id ist nach dem Anlegen unveraenderlich (id %, alt %, neu %)',
      TG_TABLE_NAME, old.id, old.exam_id, new.exam_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;


--
-- Name: assert_grading_result_rubric_matches_question(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_grading_result_rubric_matches_question() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_answer_question_id uuid;
  v_rubric_question_id uuid;
begin
  select a.question_id into v_answer_question_id
    from public.answer a where a.id = new.answer_id;
  select r.question_id into v_rubric_question_id
    from public.rubric r where r.id = new.rubric_id;

  if v_answer_question_id is distinct from v_rubric_question_id then
    raise exception
      'grading_result %: rubric % gehoert zu question %, nicht zu question % der bewerteten answer %',
      new.id, new.rubric_id, v_rubric_question_id, v_answer_question_id, new.answer_id
      using errcode = 'check_violation';
  end if;
  return null;
end;
$$;


--
-- Name: assert_merged_hat_vorstufen(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_merged_hat_vorstufen() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_typ    grader_type;
  v_quellen integer;
begin
  select grader_type into v_typ from public.grading_result where id = new.grading_result_id;

  -- Die Zeile kann in derselben Transaktion schon wieder geloescht worden sein.
  if not found then
    return null;
  end if;

  select count(*) into v_quellen
    from public.grading_result_source
   where grading_result_id = new.grading_result_id;

  if v_typ = 'MERGED' then
    if v_quellen < 2 then
      raise exception
        'Eine MERGED-Bewertung braucht mindestens zwei Vorstufen, hat aber %', v_quellen
        using errcode = 'check_violation';
    end if;
  elsif v_quellen > 0 then
    raise exception
      'Nur eine MERGED-Bewertung fuehrt Vorstufen zusammen, dies ist %', v_typ
      using errcode = 'check_violation';
  end if;

  return null;
end $$;


--
-- Name: FUNCTION assert_merged_hat_vorstufen(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.assert_merged_hat_vorstufen() IS 'Haelt die Zusage, die grading_result_ai_is_reproducible fuer MERGED aufgegeben hat: zwei Vorstufen statt eines Modellnamens. Zurueckgestellt, weil die MERGED-Zeile vor ihren Herkunftszeilen entsteht.';


--
-- Name: assert_merged_hat_vorstufen_zeile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_merged_hat_vorstufen_zeile() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare v_quellen integer;
begin
  if new.grader_type <> 'MERGED' then
    return null;
  end if;

  select count(*) into v_quellen
    from public.grading_result_source
   where grading_result_id = new.id;

  if v_quellen < 2 then
    raise exception
      'Eine MERGED-Bewertung braucht mindestens zwei Vorstufen, hat aber %', v_quellen
      using errcode = 'check_violation';
  end if;

  return null;
end $$;


--
-- Name: assert_question_competency_not_orphaned(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_question_competency_not_orphaned() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  -- Die Invariante gilt nur fuer eine Frage, die es noch gibt. question_competency
  -- haengt per ON DELETE CASCADE an question, question wiederum an scenario und
  -- ueber die Kette an user_profile -- jede Loeschung raeumt die Verknuepfungszeilen
  -- also zwangslaeufig mit ab. Ohne diese Existenzpruefung wuerde der Trigger beim
  -- COMMIT genau dann feuern, wenn die Frage korrekt mitgeloescht wurde, und damit
  -- jedes DELETE auf question, scenario, exam oder user_profile blockieren.
  if not exists (
    select 1 from public.question q where q.id = old.question_id
  ) then
    return null;
  end if;
  if not exists (
    select 1 from public.question_competency qc where qc.question_id = old.question_id
  ) then
    raise exception
      'question % hat keine Kompetenz-ID mehr (Masterprompt Abschnitt 12, Zeile 1212)', old.question_id
      using errcode = 'check_violation';
  end if;
  return null;
end;
$$;


--
-- Name: assert_question_has_competency(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_question_has_competency() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if not exists (
    select 1 from public.question_competency qc where qc.question_id = new.id
  ) then
    raise exception
      'question % hat keine Kompetenz-ID (Masterprompt Abschnitt 12, Zeile 1212)', new.id
      using errcode = 'check_violation';
  end if;
  return null;
end;
$$;


--
-- Name: assert_question_id_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_question_id_immutable() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if old.question_id is distinct from new.question_id then
    raise exception
      '%.question_id ist nach dem Anlegen unveraenderlich (id %, alt %, neu %)',
      TG_TABLE_NAME, old.id, old.question_id, new.question_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;


--
-- Name: assert_question_scenario_id_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_question_scenario_id_immutable() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if old.scenario_id is distinct from new.scenario_id then
    raise exception
      'question.scenario_id ist nach dem Anlegen unveraenderlich (id %, alt %, neu %)',
      old.id, old.scenario_id, new.scenario_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;


--
-- Name: assert_rubric_criterion_immutable_once_used(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_rubric_criterion_immutable_once_used() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if exists (
    select 1 from public.grading_result gr where gr.rubric_id = old.rubric_id
  ) then
    raise exception
      'rubric_criterion %: Rubrik % ist bereits von einem grading_result referenziert und damit unveraenderlich - eine neue Bewertungsgrundlage erfordert eine neue Rubrikversion',
      old.id, old.rubric_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;


--
-- Name: assert_rubric_criterion_set_frozen(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_rubric_criterion_set_frozen() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_rubric uuid := coalesce(new.rubric_id, old.rubric_id);
  v_user   uuid := coalesce(new.user_id, old.user_id);
begin
  -- Zwei Faelle, in denen dieser Trigger nicht zustaendig ist:
  --
  -- (1) Kaskade statt gezieltem Eingriff. Die Elternzeile ist schon fort, also gibt es
  --     nichts mehr zu schuetzen -- ohne diese Pruefung liesse sich weder eine
  --     unbenutzte Rubrik noch ein Nutzerkonto loeschen.
  -- (2) Die Rubrik gehoert einem anderen Nutzer. Das beantwortet
  --     rubric_criterion_rubric_fk, und zwar mit 23503. Wuerde dieser Trigger zuerst
  --     mit 23514 abbrechen, saehe ein Mandantenbruch aus wie eine eingefrorene Rubrik
  --     -- der Verhaltenstest 30.04 hat genau das aufgedeckt.
  --
  -- Beide Faelle deckt dieselbe Abfrage ab: gibt es die Rubrik dieses Nutzers noch.
  if not exists (select 1 from public.rubric
                  where id = v_rubric and user_id = v_user)
     or not exists (select 1 from public.user_profile where id = v_user) then
    return coalesce(new, old);
  end if;

  if exists (
    select 1 from public.grading_result gr where gr.rubric_id = v_rubric
  ) then
    raise exception
      'rubric %: bereits von einem grading_result referenziert, die Kriterienliste ist unveraenderlich - eine neue Bewertungsgrundlage erfordert eine neue Rubrikversion', v_rubric
      using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end;
$$;


--
-- Name: FUNCTION assert_rubric_criterion_set_frozen(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.assert_rubric_criterion_set_frozen() IS 'Verhindert Hinzufuegen und Loeschen von Kriterien einer bereits bewerteten Rubrik. Ergaenzt rubric_criterion_immutable_once_used aus 0008, das nur UPDATE abdeckt.';


--
-- Name: assert_rubric_immutable_once_used(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_rubric_immutable_once_used() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if exists (
    select 1 from public.grading_result gr where gr.rubric_id = old.id
  ) then
    raise exception
      'rubric %: bereits von einem grading_result referenziert, total_points ist unveraenderlich - eine neue Bewertungsgrundlage erfordert eine neue Rubrikversion', old.id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;


--
-- Name: assert_supersedes_nicht_vorstufe(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assert_supersedes_nicht_vorstufe() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.supersedes_id is null then
    return null;
  end if;

  if exists (select 1 from public.grading_result_source
              where grading_result_id = new.id
                and source_grading_result_id = new.supersedes_id) then
    raise exception
      'supersedes_id zeigt auf eine eigene Vorstufe -- Herkunft steht in '
      'grading_result_source, Ersetzung in supersedes_id, nicht beides fuer dieselbe Zeile'
      using errcode = 'check_violation';
  end if;

  return null;
end $$;


--
-- Name: FUNCTION assert_supersedes_nicht_vorstufe(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.assert_supersedes_nicht_vorstufe() IS 'Trennt Ersetzung von Zusammenfuehrung. Ohne ihn koennte dieselbe Herkunft auf zwei Wegen behauptet werden und beim naechsten Schreiben auseinanderlaufen.';


--
-- Name: build_weight_set_from_pass(uuid, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.build_weight_set_from_pass(p_pass_id uuid, p_label text, p_design_effect numeric DEFAULT 3.94) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  v_set_id  uuid;
  v_items   int;
  v_points  numeric;
  v_terms   int;
  v_neff    numeric;
  v_kappa   numeric;
  z         constant numeric := 1.96;
begin
  select kappa_vs_gold into v_kappa from public.coding_pass where id = p_pass_id;
  if v_kappa is null or v_kappa < 0.60 then
    raise exception
      'Kodierdurchgang % hat kappa_vs_gold = % (< 0.60 oder unbestimmt). Kein EMPIRICAL-Satz.',
      p_pass_id, v_kappa;
  end if;

  select count(*), coalesce(sum(a.points), 0), count(distinct (e.exam_year, e.exam_term))
    into v_items, v_points, v_terms
    from public.exam_item_assignment a
    join public.exam_corpus_entry   e on e.id = a.exam_corpus_entry_id
   where a.coding_pass_id = p_pass_id
     and a.competency_id is not null;

  v_neff := v_items / greatest(p_design_effect, 1.0);

  insert into public.topic_weight_set
    (label, provenance, basis_coding_pass_id,
     n_exam_terms, n_items, n_points, design_effect, n_effective)
  values
    (p_label, 'EMPIRICAL', p_pass_id,
     v_terms, v_items, v_points, p_design_effect, v_neff)
  returning id into v_set_id;

  -- Kompetenzebene: Gewicht = Punktanteil. Wilson-Intervall auf n_effective, nicht auf n_items.
  insert into public.topic_weight
    (weight_set_id, scope, node_id, weight, band, n_items, n_points, ci_low, ci_high, is_empirical)
  select
    v_set_id, 'COMPETENCY', c.id,
    round(coalesce(s.pts, 0) / v_points, 8),
    case
      when coalesce(s.pts, 0) / v_points >= 0.1250 then 'HIGH'
      when coalesce(s.pts, 0) / v_points >= 0.0625 then 'MEDIUM'
      else 'LOW'
    end::public.weight_band,
    coalesce(s.cnt, 0),
    coalesce(s.pts, 0),
    greatest(0, round(
      ((p + z*z/(2*v_neff)) - z*sqrt(p*(1-p)/v_neff + z*z/(4*v_neff*v_neff)))
      / (1 + z*z/v_neff), 8)),
    least(1, round(
      ((p + z*z/(2*v_neff)) + z*sqrt(p*(1-p)/v_neff + z*z/(4*v_neff*v_neff)))
      / (1 + z*z/v_neff), 8)),
    true
  from public.competency c
  left join lateral (
    select count(*) as cnt, sum(a.points) as pts
      from public.exam_item_assignment a
     where a.coding_pass_id = p_pass_id and a.competency_id = c.id
  ) s on true
  cross join lateral (select coalesce(s.pts, 0) / v_points as p) q;

  -- Lernfeldebene: Aggregat der Kompetenzen, damit die Heatmap-Zeilen dieselbe Basis haben.
  insert into public.topic_weight
    (weight_set_id, scope, node_id, weight, band, n_items, n_points, is_empirical)
  select v_set_id, 'LEARNING_FIELD', c.learning_field_id,
         round(sum(w.weight), 8),
         case when sum(w.weight) >= 0.2500 then 'HIGH'
              when sum(w.weight) >= 0.1250 then 'MEDIUM'
              else 'LOW' end::public.weight_band,
         sum(w.n_items), sum(w.n_points), true
    from public.topic_weight w
    join public.competency  c on c.id = w.node_id
   where w.weight_set_id = v_set_id and w.scope = 'COMPETENCY'
   group by c.learning_field_id;

  update public.topic_weight_set set sealed_at = now() where id = v_set_id;
  return v_set_id;
end;
$$;


--
-- Name: fehler_trend(timestamp with time zone, timestamp with time zone, integer, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fehler_trend(p_erstes timestamp with time zone, p_letztes timestamp with time zone, p_bisher integer, p_jetzt timestamp with time zone) RETURNS public.trend_direction
    LANGUAGE sql IMMUTABLE
    AS $$
  -- Gemessen wird der Abstand, nicht die Menge: ein Fehler, der seltener wiederkehrt als
  -- bisher, ist eine Verbesserung, auch wenn seine Gesamtzahl steigt. occurrences kann nur
  -- wachsen -- ein Trend ueber die Zahl selbst waere immer 'DECLINING' und damit wertlos.
  --
  -- Der bisherige mittlere Abstand ist (last - first) / (occurrences - 1). Er braucht
  -- mindestens zwei bisherige Vorkommen; beim ersten Wiedersehen gibt es keinen Vergleich,
  -- deshalb 'STABLE'.
  --
  -- Die Bandbreite +/- 25 Prozent verhindert, dass zwei fast gleiche Abstaende als Wende
  -- gemeldet werden. Sie ist gegriffen, nicht hergeleitet -- wie 0.05 bei competency_state.
  select case
    when p_bisher is null or p_bisher < 2      then 'STABLE'
    when p_letztes <= p_erstes                 then 'STABLE'
    when (p_jetzt - p_letztes)
         > ((p_letztes - p_erstes) / (p_bisher - 1)) * 1.25::double precision
                                               then 'IMPROVING'
    when (p_jetzt - p_letztes)
         < ((p_letztes - p_erstes) / (p_bisher - 1)) * 0.75::double precision
                                               then 'DECLINING'
    else 'STABLE'
  end::public.trend_direction;
$$;


--
-- Name: FUNCTION fehler_trend(p_erstes timestamp with time zone, p_letztes timestamp with time zone, p_bisher integer, p_jetzt timestamp with time zone); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.fehler_trend(p_erstes timestamp with time zone, p_letztes timestamp with time zone, p_bisher integer, p_jetzt timestamp with time zone) IS 'VORSCHLAG, keine belegte Entscheidung. Vergleicht den Abstand zum letzten Vorkommen mit dem bisherigen mittleren Abstand (+/- 25 Prozent). Ein Trend ueber occurrences waere immer DECLINING, weil die Zahl nur wachsen kann.';


--
-- Name: mastery_neu(numeric, integer, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mastery_neu(p_alt numeric, p_versuche integer, p_quote numeric) RETURNS numeric
    LANGUAGE sql IMMUTABLE
    AS $$
  -- Exponentiell gewichteter gleitender Durchschnitt, alpha = 0.3.
  --
  -- Warum nicht correct_attempts / attempts: eine solche Quote kennt keinen Verfall.
  -- Wer eine Kompetenz zwanzigmal falsch und danach zehnmal richtig beantwortet, stuende
  -- bei 0,33 -- obwohl er sie inzwischen beherrscht. Der gleitende Durchschnitt laesst
  -- alte Versuche verblassen, ohne sie zu vergessen.
  --
  -- Warum die Punktquote und nicht is_met: Teilpunkte fuer einen korrekten Rechenweg
  -- (DETERMINISTIC_GRADER.md Abschnitt 10) waeren sonst wertlos fuer den Lernstand,
  -- obwohl sie fachlich genau die Teilbeherrschung ausdruecken, um die es hier geht.
  --
  -- Der erste Versuch setzt den Wert, statt ihn gegen die Vorgabe 0 zu mitteln: sonst
  -- braeuchte eine perfekt beantwortete Kompetenz vier Versuche, um ueber 0,75 zu
  -- kommen, und das Dashboard zeigte nach der ersten fehlerfreien Aufgabe 0,3.
  select case
    when p_versuche <= 0 then round(p_quote, 3)
    else round(0.3 * p_quote + 0.7 * coalesce(p_alt, 0), 3)
  end;
$$;


--
-- Name: FUNCTION mastery_neu(p_alt numeric, p_versuche integer, p_quote numeric); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.mastery_neu(p_alt numeric, p_versuche integer, p_quote numeric) IS 'VORSCHLAG, keine belegte Entscheidung. Exponentiell gewichteter gleitender Durchschnitt (alpha 0.3) der erreichten Punktquote. Weder Masterprompt noch Phase 1 legen eine Formel fuer mastery_score fest; diese Funktion ist der einzige Ort, der zu aendern ist, wenn die Produktentscheidung faellt.';


--
-- Name: profil_anlegen(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.profil_anlegen() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_meta jsonb := to_jsonb(new) -> 'raw_user_meta_data';
begin
  insert into public.user_profile (id, display_name)
  values (new.id, nullif(btrim(v_meta ->> 'display_name'), ''))
  on conflict (id) do nothing;
  return new;
end $$;


--
-- Name: FUNCTION profil_anlegen(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.profil_anlegen() IS 'Legt zu jedem neuen auth.users-Eintrag das public.user_profile an (O-1, Alternative A). display_name kommt aus raw_user_meta_data.display_name, sonst NULL.';


--
-- Name: pruefung_abschliessen(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.pruefung_abschliessen(p_exam_id uuid) RETURNS TABLE(status text, points_awarded numeric, total_points numeric, bewertet integer, offen integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_user     uuid := auth.uid();
  v_exam     public.exam%rowtype;
  v_offen    integer;
  v_bewertet integer;
  v_summe    numeric;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;

  select * into v_exam from public.exam
   where id = p_exam_id and user_id = v_user;
  if not found then
    raise exception 'Pruefung % nicht gefunden.', p_exam_id using errcode = '42704';
  end if;

  if v_exam.started_at is null then
    raise exception 'Pruefung % wurde nie begonnen.', p_exam_id using errcode = '23514';
  end if;

  with vollstaendig as (
    -- Je Bewertung: deckt sie jedes Kriterium ihrer Rubrik ab? Dieselbe Rechnung wie in
    -- v_ap1_bewertung_unvollstaendig, hier als Ja/Nein je grading_result.
    select gr.id,
           count(gcr.rubric_criterion_id) = count(rc.id) as deckt_ab
      from public.grading_result gr
      join public.rubric_criterion rc
        on rc.rubric_id = gr.rubric_id and rc.user_id = gr.user_id
      left join public.grading_criterion_result gcr
        on gcr.grading_result_id = gr.id and gcr.rubric_criterion_id = rc.id
     group by gr.id
  ), je_antwort as (
    -- Die Zaehlungen bleiben, wie 0018 sie gemeint hat: JEDE Bewertung zaehlt mit.
    -- Die Vollstaendigkeit kommt als eigene Spalte daneben, nicht als Filter.
    --
    -- Das ist der Unterschied, an dem der erste Entwurf dieser Migration scheiterte:
    -- ein `filter (where v.deckt_ab)` in den counts liess eine unvollstaendige Bewertung
    -- VERSCHWINDEN statt sie als offen zu werten. Eine Antwort mit einer vollstaendigen
    -- und einer unvollstaendigen Bewertung waere damit auf anzahl = 1 gefallen und haette
    -- gezaehlt -- obwohl 0018 genau diesen Fall offen halten soll. Die Deno-Tests
    -- "Zwei Bewertungen ohne Zusammenfuehrung gelten als offen" haben es gefangen.
    select a.id as answer_id,
           count(g.id)                                        as anzahl,
           count(g.id) filter (where g.is_final)              as anzahl_final,
           max(g.points_awarded) filter (where g.is_final)    as punkte_merged,
           -- Nur aussagekraeftig, wenn anzahl = 1; dann ist max der einzige Wert.
           max(g.points_awarded)                              as punkte_einzeln,
           bool_and(v.deckt_ab) filter (where g.is_final)     as final_deckt_ab,
           bool_and(v.deckt_ab)                               as alle_decken_ab
      from public.answer a
      left join public.grading_result g on g.answer_id = a.id
      left join vollstaendig v on v.id = g.id
     where a.exam_id = p_exam_id and a.is_final
     group by a.id
  ), gewertet as (
    -- Die alte Bedingung, um die Vollstaendigkeit ergaenzt. Ohne Bewertung sind beide
    -- bool_and NULL, aber `false and null` ist in SQL false -- eine unbewertete Antwort
    -- bleibt damit offen, so wie vorher.
    select answer_id,
           coalesce((anzahl_final = 1 and final_deckt_ab)
                 or (anzahl = 1 and alle_decken_ab), false) as zaehlt,
           coalesce(punkte_merged, punkte_einzeln) as punkte
      from je_antwort
  )
  select count(*) filter (where zaehlt),
         count(*) filter (where not zaehlt),
         coalesce(sum(punkte) filter (where zaehlt), 0)
    into v_bewertet, v_offen, v_summe
    from gewertet;

  if v_bewertet + v_offen = 0 then
    raise exception 'Zu Pruefung % ist keine Antwort abgegeben.', p_exam_id
      using errcode = '23514';
  end if;

  if v_offen = 0 then
    update public.exam e
       set status         = 'GRADED',
           submitted_at   = coalesce(e.submitted_at, now()),
           graded_at      = now(),
           points_awarded = v_summe
     where e.id = p_exam_id;

    -- Der Verlauf entsteht genau hier: mit dem Abschluss steht der Lernstand fest.
    perform public.readiness_snapshot_schreiben(v_user, 'exam_completed');
  else
    update public.exam e
       set status         = 'SUBMITTED',
           submitted_at   = coalesce(e.submitted_at, now()),
           points_awarded = null,
           graded_at      = null
     where e.id = p_exam_id;
  end if;

  return query
    select e.status::text, e.points_awarded, e.total_points, v_bewertet, v_offen
      from public.exam e where e.id = p_exam_id;
end $$;


--
-- Name: FUNCTION pruefung_abschliessen(p_exam_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.pruefung_abschliessen(p_exam_id uuid) IS 'Schliesst eine Uebungspruefung ab, wenn jede abgegebene Antwort eine Bewertung hat, die JEDES Kriterium ihrer Rubrik abdeckt. Eine unvollstaendige Bewertung -- etwa nach einem Dify-Ausfall, wo nur die deterministischen Kriterien bepunktet sind -- zaehlt als offen, und die Pruefung bleibt SUBMITTED. Eine zu schlechte Note als endgueltig auszuweisen waere schlimmer als gar keine.';


--
-- Name: readiness_score(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.readiness_score(p_weight_set_id uuid, p_mastery jsonb) RETURNS TABLE(score numeric, covered_weight numeric)
    LANGUAGE sql STABLE
    AS $$
  select
    round(100 * sum(w.weight * (p_mastery ->> w.node_id)::numeric)
              / nullif(sum(w.weight), 0), 2),
    round(sum(w.weight), 8)
  from public.topic_weight w
  where w.weight_set_id = p_weight_set_id
    and w.scope = 'COMPETENCY'
    and p_mastery ? w.node_id;
$$;


--
-- Name: FUNCTION readiness_score(p_weight_set_id uuid, p_mastery jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.readiness_score(p_weight_set_id uuid, p_mastery jsonb) IS 'Rein und deterministisch: gleiche Eingaben ⇒ gleiche Ausgabe, auch Jahre spaeter. Renormiert ueber die tatsaechlich belegten Kompetenzen, statt fehlende als 0 zu werten — sonst sinkt der Score allein dadurch, dass eine Kompetenz noch nie geprueft wurde.';


--
-- Name: readiness_snapshot_schreiben(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.readiness_snapshot_schreiben(p_user uuid, p_trigger text) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_satz    public.topic_weight_set%rowtype;
  v_mastery jsonb;
  v_score   numeric;
  v_covered numeric;
  v_gleich  numeric;
  v_id      uuid;
begin
  -- Drei Gruende, keinen Schnappschuss zu schreiben, und keiner davon ist ein Fehler:
  -- kein aktiver Gewichtssatz, kein einziger Lernstand, keine Ueberschneidung zwischen
  -- beiden. Die Funktion gibt dann null zurueck, statt den Abschluss der Pruefung
  -- scheitern zu lassen -- sie haengt an ihm, sie traegt ihn nicht.
  select * into v_satz from public.topic_weight_set where is_active;
  if not found then
    return null;
  end if;

  select jsonb_object_agg(cs.competency_id, cs.mastery_score)
    into v_mastery
    from public.competency_state cs
   where cs.user_id = p_user and cs.mastery_score is not null;
  if v_mastery is null then
    return null;
  end if;

  select r.score, r.covered_weight
    into v_score, v_covered
    from public.readiness_score(v_satz.id, v_mastery) r;
  if v_score is null then
    return null;
  end if;

  if v_satz.provenance <> 'EMPIRICAL' then
    -- Die zweite Gewichtung: gleiches Gewicht fuer jede Kompetenz des Satzes, fuer die
    -- ein Lernstand vorliegt. Dieselbe Menge wie oben -- sonst verglichen die beiden
    -- Zahlen nicht dieselbe Frage.
    select round(100 * avg((v_mastery ->> w.node_id)::numeric), 2)
      into v_gleich
      from public.topic_weight w
     where w.weight_set_id = v_satz.id
       and w.scope = 'COMPETENCY'
       and v_mastery ? w.node_id;
  end if;

  insert into public.readiness_snapshot
    (user_id, weight_set_id, weight_provenance, mastery, score,
     score_low, score_high, covered_weight, trigger_event)
  values
    (p_user, v_satz.id, v_satz.provenance, v_mastery, v_score,
     -- least() und greatest() uebergehen NULL: ohne das case stuende bei einem
     -- empirischen Satz der Score selbst als Spanne, also eine Spanne der Breite null,
     -- die etwas anderes behauptet als "keine Spanne".
     case when v_gleich is null then null else least(v_score, v_gleich) end,
     case when v_gleich is null then null else greatest(v_score, v_gleich) end,
     v_covered, p_trigger)
  returning id into v_id;

  return v_id;
end;
$$;


--
-- Name: FUNCTION readiness_snapshot_schreiben(p_user uuid, p_trigger text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.readiness_snapshot_schreiben(p_user uuid, p_trigger text) IS 'Friert den Readiness Score ein: Gewichtssatz, Mastery-Vektor, Score, Spanne ueber beide Platzhalter-Gewichtungen und Anlass. Gibt null zurueck, wenn es nichts einzufrieren gibt (kein aktiver Satz, kein Lernstand) -- ohne Fehler, damit der Aufrufer daran nicht scheitert.';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: tg_topic_weight_sealed(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_topic_weight_sealed() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_old_sealed timestamptz;
  v_new_sealed timestamptz;
begin
  -- Bei INSERT ist OLD nicht zugewiesen, bei DELETE nicht NEW — jeder Zugriff auf das
  -- falsche Record wirft "record is not assigned yet". Darum nur die Seite nachschlagen,
  -- deren Record fuer diesen TG_OP existiert.
  --
  -- Bei einem UPDATE, das weight_set_id aendert, verlaesst die Zeile ihren bisherigen
  -- Satz (OLD) und tritt einem anderen bei (NEW). Beide Saetze muessen ungesiegelt sein —
  -- sonst kaeme man an einem versiegelten Quellsatz vorbei, indem man dessen Zeilen
  -- einfach in einen unversiegelten Satz umhaengt.
  --
  -- FOR SHARE auf beiden Lesungen -- ohne Sperre waere dies ein ungesperrtes SELECT auf
  -- die Elternzeile, das mit einer gleichzeitigen Versiegelung race't: Transaktion A
  -- aendert ein Gewicht dieses noch unversiegelten Satzes und liest hier sealed_at is
  -- null, ohne die Elternzeile zu sperren; waehrend A offen bleibt, versiegelt Transaktion
  -- B denselben Satz (UPDATE topic_weight_set SET sealed_at = now()) und committet dabei
  -- mit den zu diesem Zeitpunkt noch alten Kindwerten; erst danach committet A ihre
  -- Aenderung. Der als unveraenderlich gedachte, laengst versiegelte Satz hat sich damit
  -- nach dem Versiegeln noch veraendert -- unabhaengig davon, in welcher Reihenfolge A und
  -- B ihre jeweilige Anweisung *starten*, denn keine der beiden wartet auf die andere.
  --
  -- FOR SHARE erzwingt genau das Warten: es haelt keine exklusive Sperre, sondern nur eine
  -- Lesesperre auf der Elternzeile, die mit deren eigenem UPDATE (das die Versiegelung
  -- zwingend braucht) kollidiert, mit anderen FOR SHARE-Lesern derselben Zeile aber
  -- vertraeglich ist. Beide Reihenfolgen werden dadurch serialisiert statt verschraenkt:
  --   * Gewichtsaenderung zuerst: sie haelt FOR SHARE bis zu ihrem eigenen Commit/Rollback;
  --     die Versiegelung blockiert an ihrem UPDATE so lange und sieht danach entweder die
  --     aktualisierten Kindwerte (falls committet) oder den Ausgangszustand (falls
  --     zurueckgerollt) -- nie einen Zwischenstand.
  --   * Versiegelung zuerst: ihr UPDATE haelt die Zeilensperre, bevor die Gewichtsaenderung
  --     ihr FOR SHARE anfordern kann; die Gewichtsaenderung blockiert, liest nach der
  --     Freigabe den committeten, nicht mehr NULL-en sealed_at-Wert und schlaegt korrekt
  --     mit der Exception unten fehl.
  --
  -- FOR UPDATE waere ebenfalls korrekt, serialisiert als exklusive Sperre aber zusaetzlich
  -- alle nebenlaeufigen Gewichtsaenderungen an demselben, noch unversiegelten Satz
  -- untereinander -- zwei Aenderungen an verschiedenen Zeilen desselben Satzes muessten
  -- dann nacheinander statt parallel laufen, obwohl sie einander nicht widersprechen. FOR
  -- SHARE laesst mehrere gleichzeitige Leser zu (mehrere Gewichtsaenderungen am selben
  -- unversiegelten Satz bleiben parallel moeglich, siehe naechster Absatz) und blockiert
  -- nur den einen Schreiber, der tatsaechlich mit ihnen kollidiert: die Versiegelung. Das
  -- ist die Grenze des Problems, keine breitere.
  --
  -- Kein Deadlock- und keine Selbstblockade mit build_weight_set_from_pass() (Abschnitt
  -- 4.8): Die Funktion fuegt alle 18 topic_weight-Zeilen (12 Kompetenz-, 6 Lernfeldzeilen)
  -- in derselben Transaktion ein, die zuvor per INSERT INTO topic_weight_set denselben,
  -- neuen Satz angelegt hat. Eine Transaktion sperrt sich nie selbst aus: FOR SHARE auf
  -- einer Zeile, die dieselbe Transaktion bereits (und sei es nur implizit durch das
  -- eigene, noch nicht committete INSERT) haelt, wird sofort gewaehrt, nie blockiert. Das
  -- abschliessende UPDATE ... SET sealed_at = now() am Ende derselben Funktion trifft
  -- folglich nie auf eine fremde Sperre. Aus demselben Grund entsteht auch bei der
  -- Erstmigration (Abschnitt 4.10 -- Platzhaltersatz plus 18 Gewichtszeilen in einer
  -- Transaktion vor jedem Anlegen eines Kompetenzgraphen) keine Blockade.
  if tg_op in ('UPDATE', 'DELETE') then
    select sealed_at into v_old_sealed
      from public.topic_weight_set where id = old.weight_set_id
      for share;

    if v_old_sealed is not null then
      raise exception
        'Quell-Gewichtssatz % ist seit % versiegelt. Neue Gewichtung ⇒ neuer Satz, keine '
        'Aenderung (INSERT/UPDATE/DELETE) an bestehenden Gewichten.',
        old.weight_set_id, v_old_sealed;
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    select sealed_at into v_new_sealed
      from public.topic_weight_set where id = new.weight_set_id
      for share;

    if v_new_sealed is not null then
      raise exception
        'Ziel-Gewichtssatz % ist seit % versiegelt. Neue Gewichtung ⇒ neuer Satz, keine '
        'Aenderung (INSERT/UPDATE/DELETE) an bestehenden Gewichten.',
        new.weight_set_id, v_new_sealed;
    end if;
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;


--
-- Name: tg_topic_weight_set_activation_handoff(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_topic_weight_set_activation_handoff() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_active_count int;
begin
  if (tg_op = 'DELETE' and old.is_active)
     or (tg_op = 'UPDATE' and old.is_active and not new.is_active)
  then
    select count(*) into v_active_count from public.topic_weight_set where is_active;

    if v_active_count = 0 then
      raise exception
        'Gewichtssatz % wird deaktiviert, ohne dass zu diesem Zeitpunkt (Transaktionsende) ein '
        'Nachfolger aktiv ist. Deaktivierung des alten und Aktivierung des neuen Satzes muessen in '
        'derselben Transaktion erfolgen -- sonst liefert v_ap1_readiness fuer niemanden mehr einen '
        'Score.', old.id;
    end if;
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;


--
-- Name: tg_topic_weight_set_sealed(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_topic_weight_set_sealed() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_expected_competencies    int;
  v_expected_learning_fields int;
  v_actual_competencies      int;
  v_actual_learning_fields   int;
begin
  if tg_op = 'DELETE' then
    if old.sealed_at is not null then
      raise exception
        'Gewichtssatz % ist seit % versiegelt und kann nicht geloescht werden. Jeder readiness_snapshot, '
        'der ihn nennt, waere danach nicht mehr nachrechenbar.', old.id, old.sealed_at;
    end if;
    return old;
  end if;

  if old.sealed_at is not null and
     (new.label, new.provenance, new.basis_coding_pass_id, new.n_exam_terms,
      new.n_items, new.n_points, new.design_effect, new.n_effective, new.sealed_at)
     is distinct from
     (old.label, old.provenance, old.basis_coding_pass_id, old.n_exam_terms,
      old.n_items, old.n_points, old.design_effect, old.n_effective, old.sealed_at)
  then
    raise exception 'Gewichtssatz % ist versiegelt; nur is_active und notes sind aenderbar.', old.id;
  end if;

  -- Uebergang unversiegelt -> versiegelt: erst hier wird geprueft, ob der Satz ueberhaupt
  -- vollstaendig ist. tg_topic_weight_sums_to_one (oben) prueft nur "Summe = 1 je Gruppe, die
  -- ueberhaupt existiert" -- sum() liefert NULL fuer eine komplett fehlende Gruppe und wird dann
  -- gar nicht erst mit 1 verglichen, und eine einzelne Zeile mit weight = 1 besteht die Pruefung
  -- ebenfalls. Ohne diese Zaehlung liesse sich ein leerer oder unvollstaendiger Satz versiegeln
  -- und ueber is_active aktivieren; v_ap1_readiness (DATENMODELL.md, 0011_views.sql) und
  -- readiness_score() (Abschnitt 4.7) wuerden dann Kompetenzen stillschweigend auslassen oder,
  -- bei einem komplett leeren Satz, fuer keinen Nutzer einen Score liefern.
  --
  -- Die erwarteten Zahlen (12 Kompetenzen, 6 Lernfelder) stehen nicht als Literal hier, sondern
  -- werden aus public.competency/public.learning_field gezaehlt: das sind dieselben Tabellen, gegen
  -- die exam_item_assignment.competency_id/topic_id referenzieren (Abschnitt 3) und aus denen
  -- build_weight_set_from_pass (Abschnitt 4.8) die topic_weight-Zeilen baut. Aendert sich der
  -- Lehrplan -- neue Kompetenz, aufgeloestes Lernfeld --, zaehlen beide Seiten der Pruefung aus
  -- derselben, dann schon aktualisierten Quelle; ein hier fest eingetragenes "12" bzw. "6" wuerde
  -- dagegen beim naechsten Lehrplanwechsel unbemerkt falsch.
  --
  -- Nur der Uebergang selbst wird geprueft (old.sealed_at is null and new.sealed_at is not null),
  -- nicht jede Aenderung an topic_weight: ein Trigger auf topic_weight, der bei jedem DELETE
  -- pruefen wuerde, ob der Satz noch vollstaendig ist, wuerde jede kaskadierende Loeschung eines
  -- Gewichtssatzes blockieren -- ON DELETE CASCADE raeumt dessen topic_weight-Zeilen einzeln ab,
  -- und die erste geloeschte Zeile macht den Satz unvollstaendig, lange bevor die letzte weg ist.
  -- Ein unversiegelter Entwurf darf dagegen jederzeit unvollstaendig sein; erst der Versuch, ihn zu
  -- versiegeln, erzwingt Vollstaendigkeit.
  if old.sealed_at is null and new.sealed_at is not null then
    select count(*) into v_expected_competencies   from public.competency;
    select count(*) into v_expected_learning_fields from public.learning_field;

    select count(*) into v_actual_competencies
      from public.topic_weight
     where weight_set_id = new.id and scope = 'COMPETENCY';

    select count(*) into v_actual_learning_fields
      from public.topic_weight
     where weight_set_id = new.id and scope = 'LEARNING_FIELD';

    -- Bootstrap: der KMK-Platzhaltersatz aus Abschnitt 4.10 entsteht und wird versiegelt,
    -- WAEHREND public.competency und public.learning_field noch leer sind. Nach
    -- DATENMODELL.md Abschnitt 6.3 laufen erst alle Migrationen (Schritt 1), dann wird der
    -- Kompetenzgraph geladen (Schritt 3). Eine Zaehlung gegen eine leere Tabelle wuerde hier
    -- 12 <> 0 ergeben und die eigene Erstmigration blockieren. Gegen einen leeren Lehrplan
    -- laesst sich Vollstaendigkeit nicht messen -- geprueft wird dann nur, dass ueberhaupt
    -- beide Ebenen belegt sind. Sobald der Graph steht, greift die Zaehlung fuer jeden
    -- weiteren Satz, und das ist der Fall, der zaehlt: der Platzhaltersatz ist im Dokument
    -- festgeschrieben, jeder spaetere entsteht aus Daten.
    if v_expected_competencies = 0 or v_expected_learning_fields = 0 then
      if v_actual_competencies = 0 or v_actual_learning_fields = 0 then
        raise exception
          'Gewichtssatz % kann nicht versiegelt werden: % Kompetenzgewichte, % Lernfeldgewichte. '
          'Der Lehrplan ist noch nicht geladen, daher wird nur geprueft, dass beide Ebenen '
          'ueberhaupt belegt sind.',
          new.id, v_actual_competencies, v_actual_learning_fields;
      end if;
    elsif v_actual_competencies <> v_expected_competencies
       or v_actual_learning_fields <> v_expected_learning_fields
    then
      raise exception
        'Gewichtssatz % kann nicht versiegelt werden: % von % Kompetenzgewichten, % von % '
        'Lernfeldgewichten vorhanden. Ein unvollstaendiger Satz darf nicht versiegelt (und damit '
        'aktivierbar) werden.',
        new.id, v_actual_competencies, v_expected_competencies,
        v_actual_learning_fields, v_expected_learning_fields;
    else
      -- Richtige Anzahl heisst nicht richtige Identitaet: node_id traegt keinen Fremdschluessel
      -- (comment on column topic_weight.node_id oben, Abschnitt 4.4) -- ein Satz mit 12
      -- beliebigen oder falsch geschriebenen COMPETENCY-node_ids bestuende die Zaehlung und
      -- die Summenpruefung (Abschnitt 4.5 oben, tg_topic_weight_sums_to_one) anstandslos.
      -- v_ap1_readiness (DATENMODELL.md, 0011_views.sql) joint topic_weight.node_id gegen
      -- competency_state.competency_id, dessen eigener Fremdschluessel nur echte
      -- public.competency-IDs zulaesst -- eine erfundene node_id faende dort nie eine Zeile,
      -- und zwar lautlos: kein Fehler, nur ein leiser Beitrag von null zum Score.
      --
      -- Diese Pruefung gehoert hierher, an den Uebergang zur Versiegelung, und nicht in einen
      -- eigenen Trigger auf INSERT/UPDATE von topic_weight selbst: ein solcher Trigger wuerde
      -- unbedingt bei jeder Zeile pruefen und dabei genau den Bootstrap-Fall treffen, den der
      -- Zweig oben extra behandelt -- der KMK-Platzhaltersatz aus Abschnitt 4.10 fuegt seine
      -- Zeilen ein, waehrend public.competency und public.learning_field noch leer sind
      -- (DATENMODELL.md Abschnitt 6.3: erst alle Migrationen, dann der Kompetenzgraph). Gegen
      -- eine leere Tabelle bestuende keine node_id die Pruefung, und die eigene Erstmigration
      -- schluege fehl. Am Uebergang zur Versiegelung ist dieser Bootstrap-Fall bereits oben
      -- abgefangen (v_expected_competencies/v_expected_learning_fields = 0 nimmt den ersten
      -- Zweig, nicht diesen); die Pruefung hier laeuft folglich nur, wenn der Lehrplan
      -- tatsaechlich geladen ist und gegen echte Zeilen prueft.
      if exists (
        select 1
          from public.topic_weight tw
         where tw.weight_set_id = new.id
           and tw.scope = 'COMPETENCY'
           and not exists (select 1 from public.competency c where c.id = tw.node_id)
      ) then
        raise exception
          'Gewichtssatz % kann nicht versiegelt werden: mindestens eine COMPETENCY-Zeile '
          'verweist mit ihrer node_id auf keine bestehende Kompetenz in public.competency.',
          new.id;
      end if;

      if exists (
        select 1
          from public.topic_weight tw
         where tw.weight_set_id = new.id
           and tw.scope = 'LEARNING_FIELD'
           and not exists (select 1 from public.learning_field lf where lf.id = tw.node_id)
      ) then
        raise exception
          'Gewichtssatz % kann nicht versiegelt werden: mindestens eine LEARNING_FIELD-Zeile '
          'verweist mit ihrer node_id auf kein bestehendes Lernfeld in public.learning_field.',
          new.id;
      end if;
    end if;
  end if;

  return new;
end;
$$;


--
-- Name: tg_topic_weight_sums_to_one(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_topic_weight_sums_to_one() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_sum numeric;
begin
  -- Bei INSERT ist OLD nicht zugewiesen, bei DELETE nicht NEW — jeder Zugriff auf das
  -- falsche Record wirft "record is not assigned yet". Darum nur die Gruppe pruefen,
  -- deren Record fuer diesen TG_OP existiert.
  --
  -- Ein UPDATE, das weight_set_id oder scope aendert, verschiebt eine Zeile aus ihrer
  -- alten Gruppe (OLD) in eine neue (NEW). Beide muessen wieder auf Summe 1 geprueft
  -- werden, sonst bleibt die Quellgruppe unbemerkt unter 1 zurueck.
  if tg_op in ('UPDATE', 'DELETE') then
    select sum(weight) into v_sum
      from public.topic_weight
     where weight_set_id = old.weight_set_id and scope = old.scope;

    if v_sum is not null and abs(v_sum - 1) > 1e-6 then
      raise exception
        'Gewichtssatz % Ebene % (Quellgruppe): Summe % weicht von 1 ab (Toleranz 1e-6)',
        old.weight_set_id, old.scope, v_sum;
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    select sum(weight) into v_sum
      from public.topic_weight
     where weight_set_id = new.weight_set_id and scope = new.scope;

    if v_sum is not null and abs(v_sum - 1) > 1e-6 then
      raise exception
        'Gewichtssatz % Ebene % (Zielgruppe): Summe % weicht von 1 ab (Toleranz 1e-6)',
        new.weight_set_id, new.scope, v_sum;
    end if;
  end if;

  return null;
end;
$$;


--
-- Name: uebung_skills_setzen(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebung_skills_setzen(p_exam uuid) RETURNS integer
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_anzahl integer := 0;
begin
  -- Eine Aufgabe bekommt ihren Skill nur, wenn die Zuordnung eindeutig ist: traegt sie
  -- mehrere Kompetenzen oder mehrere Rechenarten, die auf verschiedene Knoten zeigen,
  -- bleibt sie ohne. Dieselbe Zurueckhaltung wie in update_error_pattern (0027) -- dort
  -- bleibt curriculum_node_id null, sobald die Frage mehr als einen Skill traegt, und
  -- ein hier erratener Knoten waere genau das, was die Regel dort verhindern soll.
  insert into public.question_skill (question_id, user_id, curriculum_node_id)
  select f.question_id, f.user_id, f.node
    from (
      select q.id as question_id,
             q.user_id,
             min(z.curriculum_node_id)            as node,
             count(distinct z.curriculum_node_id) as knoten
        from public.question q
        join public.scenario s  on s.id = q.scenario_id
        join public.question_competency qc on qc.question_id = q.id
        join public.rubric r    on r.question_id = q.id
        join public.rubric_criterion rc on rc.rubric_id = r.id
        join public.uebung_skill z
             on z.competency_id = qc.competency_id
            and z.computation_type_code = rc.computation_type_code
       where s.exam_id = p_exam
       group by q.id, q.user_id
    ) f
   where f.knoten = 1
  on conflict (question_id, curriculum_node_id) do nothing;

  get diagnostics v_anzahl = row_count;
  return v_anzahl;
end;
$$;


--
-- Name: FUNCTION uebung_skills_setzen(p_exam uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebung_skills_setzen(p_exam uuid) IS 'Traegt question_skill fuer die Aufgaben einer Pruefung nach, anhand von uebung_skill. Nur bei eindeutiger Zuordnung; mehrfach aufrufbar (on conflict do nothing).';


--
-- Name: uebungspruefung_anlegen(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_anlegen(p_variante text DEFAULT 'zweiter_standort'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_titel text;
  v_exam  uuid;
begin
  select u.title into v_titel from public.uebungspruefung u where u.code = p_variante;
  if v_titel is null then
    raise exception 'Unbekannte Uebungspruefung: %', p_variante using errcode = '22023';
  end if;

  begin
    v_exam := case p_variante
      when 'zweiter_standort' then public.uebungspruefung_anlegen_roh()
      when 'servicedesk' then public.uebungspruefung_servicedesk_roh()
      when 'vlan_grundlagen' then public.uebungspruefung_vlan_grundlagen_roh()
      when 'ap1_2025_fruehjahr' then public.uebungspruefung_ap1_2025_fruehjahr_roh()
      when 'ap1_2021_herbst' then public.uebungspruefung_ap1_2021_herbst_roh()
      when 'ap1_2022_fruehjahr' then public.uebungspruefung_ap1_2022_fruehjahr_roh()
      when 'ap1_2022_herbst' then public.uebungspruefung_ap1_2022_herbst_roh()
    end;
  exception
    when unique_violation then
      -- Ein gleichzeitiger Aufruf war schneller (0021). Seine Zeile ist jetzt sichtbar.
      -- Ohne Modus-Filter: der Titel ist über uebungspruefung.title eindeutig, egal ob
      -- die Variante als MINI_EXAM oder FULL_EXAM angelegt wird.
      select e.id into v_exam
        from public.exam e
       where e.user_id = auth.uid()
         and e.status in ('READY', 'IN_PROGRESS')
         and e.title = v_titel
       order by e.created_at
       limit 1;
      if v_exam is null then
        raise;
      end if;
  end;

  if v_exam is null then
    raise exception 'Uebungspruefung % hat keinen Inhalt.', p_variante using errcode = 'XX000';
  end if;

  perform public.uebung_skills_setzen(v_exam);
  return v_exam;
end $$;


--
-- Name: FUNCTION uebungspruefung_anlegen(p_variante text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_anlegen(p_variante text) IS 'Legt die Übungsprüfung mit diesem Code (public.uebungspruefung) für auth.uid() an oder gibt die offene zurück -- auch bei gleichzeitigen Aufrufen (0021). Ohne Argument: zweiter_standort. Fangzweig ohne Modus-Filter seit ap1_2022_herbst (0007_exam.sql:88, erster FULL_EXAM-Nutzer).';


--
-- Name: uebungspruefung_anlegen_roh(smallint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_anlegen_roh(p_satz smallint DEFAULT NULL::smallint) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    SET lc_numeric TO 'C'
    AS $_$
declare
  v_user   uuid := auth.uid();
  v_satz   smallint;
  v_exam   uuid;
  v_scen   uuid;
  v_frage  uuid;
  v_rubrik uuid;
  -- Der Zahlensatz. Genau eine Stelle, aus der Text und Kriterien gespeist werden.
  v_cidr    text;      -- Teilnetz als Adresse mit Praefix
  v_mb      integer;   -- Abbild der Warenwirtschaft in MB
  v_mbit    integer;   -- Leitung in Mbit/s
  v_plaetze integer;   -- Arbeitsplaetze
  v_gb      integer;   -- Ablage je Arbeitsplatz in GB
  v_watt    integer;   -- Leistungsaufnahme eines Rechners
  v_stunden integer;   -- Laufzeit im Jahr
  v_preis   numeric;   -- EUR je kWh
  v_bezug   numeric;   -- Bezugspreis des Switches
  v_gk      integer;   -- Gemeinkostenzuschlag in Prozent
  v_gewinn  integer;
  v_skonto  integer;
  v_rabatt  integer;
  -- Deutsche Schreibweise fuer den Text
  v_mb_t      text;
  v_stunden_t text;
  v_preis_t   text;
  v_bezug_t   text;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.user_profile where id = v_user) then
    raise exception 'Kein Profil zu dieser Sitzung.' using errcode = '23503';
  end if;
  if p_satz is not null and p_satz not between 1 and 3 then
    raise exception 'Zahlensatz % gibt es nicht (1 bis 3).', p_satz using errcode = '22023';
  end if;

  -- Wiederholbarkeit wie in 0016: eine offene Uebung wird fortgesetzt, nicht verdoppelt.
  select e.id into v_exam
    from public.exam e
   where e.user_id = v_user
     and e.mode = 'MINI_EXAM'
     and e.status = 'IN_PROGRESS'
     and e.title = 'Uebungspruefung: zweiter Standort'
   order by e.created_at
   limit 1;
  if v_exam is not null then
    return v_exam;
  end if;

  -- Rotation: der wievielte Lauf dieser Uebung ist das? Jeder bisherige zaehlt, egal in
  -- welchem Zustand. Der erste Lauf (kein bisheriger) bekommt Satz 1.
  if p_satz is not null then
    v_satz := p_satz;
  else
    select (1 + count(*) % 3)::smallint into v_satz
      from public.exam e
     where e.user_id = v_user
       and e.mode = 'MINI_EXAM'
       and e.title = 'Uebungspruefung: zweiter Standort';
  end if;

  case v_satz
    when 1 then
      v_cidr := '192.168.20.130/26'; v_mb := 4700;  v_mbit := 100;
      v_plaetze := 250; v_gb := 20;  v_watt := 45;  v_stunden := 2000; v_preis := 0.32;
      v_bezug := 850;   v_gk := 12;  v_gewinn := 8;  v_skonto := 2; v_rabatt := 10;
    when 2 then
      v_cidr := '10.10.5.77/27';     v_mb := 2300;  v_mbit := 50;
      v_plaetze := 180; v_gb := 25;  v_watt := 60;  v_stunden := 2500; v_preis := 0.30;
      v_bezug := 720;   v_gk := 10;  v_gewinn := 20; v_skonto := 2; v_rabatt := 5;
    when 3 then
      v_cidr := '172.16.40.200/25';  v_mb := 12000; v_mbit := 250;
      v_plaetze := 400; v_gb := 20;  v_watt := 120; v_stunden := 1800; v_preis := 0.35;
      v_bezug := 1200;  v_gk := 8;   v_gewinn := 12; v_skonto := 3; v_rabatt := 10;
  end case;

  v_mb_t      := translate(to_char(v_mb,      'FM999G999'),   ',.', '.,');  -- 4.700
  v_stunden_t := translate(to_char(v_stunden, 'FM999G999'),   ',.', '.,');  -- 2.000
  v_preis_t   := translate(to_char(v_preis,   'FM0D00'),      ',.', '.,');  -- 0,32
  v_bezug_t   := translate(to_char(v_bezug,   'FM9G999D00'),  ',.', '.,');  -- 1.200,00

  v_exam := gen_random_uuid();
  -- started_at wird hier gesetzt (0016): das Anlegen IST der Beginn.
  insert into public.exam (id, user_id, title, mode, status, duration_minutes,
                           total_points, started_at)
  values (v_exam, v_user, 'Uebungspruefung: zweiter Standort', 'MINI_EXAM',
          'IN_PROGRESS', 45, 40, now());

  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text,
                               situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 1, 'Zweiter Standort der Weber & Sohn GmbH',
          format($txt$Die Weber & Sohn GmbH betreibt einen Handel fuer Elektroinstallationsbedarf mit
62 Beschaeftigten. Zum 1. April eroeffnet das Unternehmen einen zweiten Standort in
einem angemieteten Buerogebaeude. Sie arbeiten in der IT-Abteilung und sollen die
technische Anbindung vorbereiten.

Fuer den neuen Standort ist das Teilnetz %s vorgesehen. Die Anbindung
an die Zentrale erfolgt zunaechst ueber eine Leitung mit %s Mbit/s. Zur Eroeffnung
muss ein Abbild der Warenwirtschaft von %s MB uebertragen werden.

Fuer die %s geplanten Arbeitsplaetze rechnet die Geschaeftsfuehrung mit je %s GB
Ablage auf dem Dateiserver. Ein Arbeitsplatzrechner nimmt im Mittel %s W auf und
laeuft %s Stunden im Jahr; der Strompreis betraegt %s EUR je kWh.

Ein Lieferant bietet die Switche zum Bezugspreis von %s EUR je Stueck an. Ihr
Betrieb kalkuliert mit %s %% Gemeinkostenzuschlag, %s %% Gewinn, %s %% Skonto und
%s %% Rabatt.

Der Wartungsvertrag sagt eine Reaktionszeit von 4 Stunden innerhalb der
Geschaeftszeiten von 8:00 bis 17:00 Uhr zu. Eine Stoerung wird am Montag,
2. Maerz 2026, um 16:30 Uhr gemeldet.$txt$,
                 v_cidr, v_mbit, v_mb_t, v_plaetze, v_gb, v_watt, v_stunden_t, v_preis_t,
                 v_bezug_t, v_gk, v_gewinn, v_skonto, v_rabatt),
          'NEUER_STANDORT', 45);

  -- ---------------------------------------------------------------------------
  -- Aufgabe 1: Netzadresse
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 1,
          format('Ermitteln Sie die Netzadresse des Teilnetzes %s.', v_cidr),
          'NETZADRESSE', 2, 4, 4, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, competency_id)
  values (v_user, v_rubrik, 1, 'Netzadresse korrekt bestimmt', 4, 'DETERMINISTIC', 'NETZADRESSE',
          jsonb_build_object('kind', 'cidr', 'value', v_cidr), 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 2: Broadcast-Adresse
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 2,
          'Geben Sie die Broadcast-Adresse dieses Teilnetzes an.',
          'BROADCAST_ADRESSE', 2, 4, 4, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, competency_id)
  values (v_user, v_rubrik, 1, 'Broadcast-Adresse korrekt bestimmt', 4, 'DETERMINISTIC', 'BROADCAST_ADRESSE',
          jsonb_build_object('kind', 'cidr', 'value', v_cidr), 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 3: Hostbereich
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 3,
          'Nennen Sie die erste und die letzte nutzbare Hostadresse des Teilnetzes.',
          'HOSTBEREICH', 3, 6, 5, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, competency_id)
  values (v_user, v_rubrik, 1, 'Hostbereich vollstaendig angegeben', 6, 'DETERMINISTIC', 'HOSTBEREICH',
          jsonb_build_object('kind', 'ip_range', 'value', v_cidr), 'LF3.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C2');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 4: Netzmaske
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 4,
          'Geben Sie die Subnetzmaske in dezimaler Schreibweise an.',
          'NETZMASKE', 1, 3, 2, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, competency_id)
  values (v_user, v_rubrik, 1, 'Netzmaske korrekt', 3, 'DETERMINISTIC', 'NETZMASKE',
          jsonb_build_object('kind', 'netmask', 'value', v_cidr), 'LF3.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C2');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 5: Uebertragungszeit. MB * 8 / Mbit/s = Sekunden
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 5,
          format('Berechnen Sie, wie lange die Uebertragung des Abbilds von %s MB ueber '
                 'die %s-Mbit/s-Leitung dauert. Geben Sie das Ergebnis in Sekunden an.',
                 v_mb_t, v_mbit),
          'UEBERTRAGUNGSZEIT', 3, 5, 6, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, competency_id)
  values (v_user, v_rubrik, 1, 'Uebertragungszeit korrekt berechnet', 5, 'DETERMINISTIC', 'UEBERTRAGUNGSZEIT',
          jsonb_build_object('kind', 'duration',
                             'value', jsonb_build_object('daten_mb', v_mb,
                                                         'bandbreite_mbit', v_mbit)),
          's', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 6: Speicherbedarf. Plaetze * GB
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 6,
          format('Ermitteln Sie den Speicherbedarf fuer die %s Arbeitsplaetze auf dem '
                 'Dateiserver. Geben Sie das Ergebnis in TB an.', v_plaetze),
          'EINHEITENUMRECHNUNG_SPEICHER', 2, 5, 5, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, competency_id)
  values (v_user, v_rubrik, 1, 'Speicherbedarf korrekt umgerechnet', 5, 'DETERMINISTIC', 'EINHEITENUMRECHNUNG_SPEICHER',
          jsonb_build_object('kind', 'data_size',
                             'value', jsonb_build_object('amount', v_plaetze * v_gb),
                             'unit', 'GB'),
          'GB', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 7: Energiekosten. W * h / 1000 * EUR/kWh
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 7,
          'Berechnen Sie die jaehrlichen Stromkosten eines Arbeitsplatzrechners.',
          'EINHEITENUMRECHNUNG_ENERGIE_KOSTEN', 2, 5, 5, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, competency_id)
  values (v_user, v_rubrik, 1, 'Stromkosten korrekt berechnet', 5, 'DETERMINISTIC', 'EINHEITENUMRECHNUNG_ENERGIE_KOSTEN',
          jsonb_build_object('kind', 'currency',
                             'value', jsonb_build_object('watt', v_watt,
                                                         'stunden', v_stunden,
                                                         'preis_pro_kwh', v_preis)),
          'EUR', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 8: Listenverkaufspreis. Bezug * (1+GK) * (1+Gewinn) / (1-Skonto) / (1-Rabatt)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 8,
          'Kalkulieren Sie den Listenverkaufspreis eines Switches.',
          'KOSTENRECHNUNG_PROZENT', 4, 8, 10, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 8);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, awards_method_points, competency_id)
  values (v_user, v_rubrik, 1, 'Listenverkaufspreis korrekt kalkuliert', 8,
          'DETERMINISTIC', 'KOSTENRECHNUNG_PROZENT',
          jsonb_build_object('kind', 'currency',
                             'value', jsonb_build_object('bezugspreis', v_bezug,
                                                         'gemeinkosten_pct', v_gk,
                                                         'gewinn_pct', v_gewinn,
                                                         'skonto_pct', v_skonto,
                                                         'rabatt_pct', v_rabatt)),
          'EUR', true, 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  return v_exam;
end $_$;


--
-- Name: FUNCTION uebungspruefung_anlegen_roh(p_satz smallint); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_anlegen_roh(p_satz smallint) IS 'Rumpf der Uebungspruefung "zweiter Standort" (0016) in drei Zahlensaetzen (0024): ohne Argument rotiert der Satz mit der Zahl der bisherigen Laeufe des Prueflings, mit Argument (1 bis 3) ist er fest -- fuer Tests. Nur ueber uebungspruefung_anlegen(code).';


--
-- Name: uebungspruefung_ap1_2021_herbst_roh(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_ap1_2021_herbst_roh() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $_$
declare
  v_user   uuid := auth.uid();
  v_exam   uuid;
  v_scen   uuid;
  v_frage  uuid;
  v_rubrik uuid;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.user_profile where id = v_user) then
    raise exception 'Kein Profil zu dieser Sitzung.' using errcode = '23503';
  end if;

  -- Wiederholbarkeit: eine offene Prüfung dieser Variante wird fortgesetzt, nicht
  -- verdoppelt -- wie uebungspruefung_anlegen_roh() (0016), nur mit mode = 'FULL_EXAM'
  -- statt 'MINI_EXAM': diese Story ist der erste FULL_EXAM-Nutzer (e01s04, 0007_exam.sql:88).
  select e.id into v_exam
    from public.exam e
   where e.user_id = v_user
     and e.mode = 'FULL_EXAM'
     and e.status = 'IN_PROGRESS'
     and e.title = 'AP1 Herbst 2021 (Originalprüfung)'
   order by e.created_at
   limit 1;
  if v_exam is not null then
    return v_exam;
  end if;

  v_exam := gen_random_uuid();
  insert into public.exam (id, user_id, title, mode, status, duration_minutes,
                           total_points, started_at)
  values (v_exam, v_user, 'AP1 Herbst 2021 (Originalprüfung)', 'FULL_EXAM', 'IN_PROGRESS', 90, 100.0, now());

  -- Szenario 1: Projektplanung für den Praxisumzug
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 1, 'Projektplanung für den Praxisumzug', $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, null, 22);

  -- 1a (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Ihr Kollege sagt zu Ihnen, bei dem Umzug der Arztpraxis handelt es sich um ein Projekt. Nennen Sie vier Merkmale eines Projekts. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$a) 4 Punkte – Zielvorgabe – Zeitliche Begrenzung – Begrenzte Ressourcen (personell, finanziell) – Projektspezifische Organisationsform – Einmaligkeit – Komplexität$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1a: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1b (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) Die Ziele in einem Projekt sollen den SMART-Kriterien entsprechen. Nennen Sie die vier weiteren SMART-Kriterien auf Deutsch oder Englisch. 4 Punkte S specific – spezifisch M A R T$txt$, 4.0, 'PUBLISHED', $txt$b) 4 Punkte S specific – spezifisch M measurable – messbar A accepted- akzeptiert oder attainable – erreichbar oder attractive – attraktiv R reasonable – realistisch T time-bound – terminiert$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1b: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1c (14.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$c) In Vorbereitung des Projektes wird ein Netzplan erstellt. Ihr Kollege hat bereits mit der Erstellung angefangen und bittet Sie, diesen zu vervollständigen. Tragen Sie die fehlenden FAZ, FEZ, SAZ, SEZ, GP und FP in den nebenstehenden Plan ein. 14 Punkte Hinweis: FAZ = frühester Anfangszeitpunkt FEZ = frühester Endzeitpunkt FP = freie Puffer (= FAZ des Nachfolgers – FEZ des aktuellen Vorgangs) SAZ = spätester Anfangszeitpunkt, SEZ = spätester Endzeitpunkt GP = Gesamtpuffer (= SAZ – FAZ oder = SEZ – FEZ)

--- Anlage: Vorgangsliste des Netzplans ---
A Ist-Analyse, 2 h, kein Vorgänger; B Soll-Konzept, 4 h, A; C Beschaffung neuer Server, 3 h, B; D Installation strukturierter Netzwerk-Verkabelung, 8 h, B; E Datensicherung, 2 h, B; F Dokumentation des neuen Netzwerkes, 5 h, B; G Installation neuer Server, 4 h, C und D; H Abbau alter Infrastruktur, 1 h, E; I Einrichtung Clients, 3 h, G und H; J Funktionstest, 1 h, I; K Übergabe und Einweisung der Mitarbeiter, 2 h, F und J.$txt$, 14.0, 'PUBLISHED', $txt$c) 14 Punkte (1 Punkt Ergänzung eines Netzplanknotens, 2 Punkte voller Netzplanknoten)$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 14.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1c: Lösung gemäß Erwartungshorizont', 14.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'NETZWERKDIAGRAMM', 1, 'Vorgangsliste des Netzplans', $txt$A Ist-Analyse, 2 h, kein Vorgänger; B Soll-Konzept, 4 h, A; C Beschaffung neuer Server, 3 h, B; D Installation strukturierter Netzwerk-Verkabelung, 8 h, B; E Datensicherung, 2 h, B; F Dokumentation des neuen Netzwerkes, 5 h, B; G Installation neuer Server, 4 h, C und D; H Abbau alter Infrastruktur, 1 h, E; I Einrichtung Clients, 3 h, G und H; J Funktionstest, 1 h, I; K Übergabe und Einweisung der Mitarbeiter, 2 h, F und J.$txt$);

  -- 1d (1.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$d) Markieren Sie den kritischen Pfad im Netzplan. 1 Punkt

--- Anlage: Vorgangsliste des Netzplans ---
A Ist-Analyse, 2 h, kein Vorgänger; B Soll-Konzept, 4 h, A; C Beschaffung neuer Server, 3 h, B; D Installation strukturierter Netzwerk-Verkabelung, 8 h, B; E Datensicherung, 2 h, B; F Dokumentation des neuen Netzwerkes, 5 h, B; G Installation neuer Server, 4 h, C und D; H Abbau alter Infrastruktur, 1 h, E; I Einrichtung Clients, 3 h, G und H; J Funktionstest, 1 h, I; K Übergabe und Einweisung der Mitarbeiter, 2 h, F und J.$txt$, 1.0, 'PUBLISHED', $txt$d) 1 Punkt A–B–D–G–I–J–K$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1d: Lösung gemäß Erwartungshorizont', 1.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'NETZWERKDIAGRAMM', 1, 'Vorgangsliste des Netzplans', $txt$A Ist-Analyse, 2 h, kein Vorgänger; B Soll-Konzept, 4 h, A; C Beschaffung neuer Server, 3 h, B; D Installation strukturierter Netzwerk-Verkabelung, 8 h, B; E Datensicherung, 2 h, B; F Dokumentation des neuen Netzwerkes, 5 h, B; G Installation neuer Server, 4 h, C und D; H Abbau alter Infrastruktur, 1 h, E; I Einrichtung Clients, 3 h, G und H; J Funktionstest, 1 h, I; K Übergabe und Einweisung der Mitarbeiter, 2 h, F und J.$txt$);

  -- 1e (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$e) Der Vorgang H, der Abbau der alten Infrastruktur, verzögert sich um vier Stunden. Beschreiben Sie die Auswirkung auf das Projektende. 2 Punkte Abbildung zur 1. Aufgabe Vorgang Beschreibung Dauer in Stunden Vorgänger A Ist-Analyse 2 B Soll-Konzept 4 A C Beschaffung neuer Server 3 B D Installation strukturierter Netzwerk-Verkabelung 8 B E Datensicherung 2 B F Dokumentation des neuen Netzwerkes 5 B G Installation neuer Server 4 C, D H Abbau alter Infrastruktur 1 E I Einrichtung Clients 3 G, H J Funktionstest 1 I K Übergabe und Einweisung der Mitarbeiter 2 F, J

--- Anlage: Vorgangsliste des Netzplans ---
A Ist-Analyse, 2 h, kein Vorgänger; B Soll-Konzept, 4 h, A; C Beschaffung neuer Server, 3 h, B; D Installation strukturierter Netzwerk-Verkabelung, 8 h, B; E Datensicherung, 2 h, B; F Dokumentation des neuen Netzwerkes, 5 h, B; G Installation neuer Server, 4 h, C und D; H Abbau alter Infrastruktur, 1 h, E; I Einrichtung Clients, 3 h, G und H; J Funktionstest, 1 h, I; K Übergabe und Einweisung der Mitarbeiter, 2 h, F und J.$txt$, 2.0, 'PUBLISHED', $txt$e) 2 Punkte Keine Auswirkung, da der Puffer von 9 Stunden die 4 Stunden Verzögerung auffängt.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1e: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'NETZWERKDIAGRAMM', 1, 'Vorgangsliste des Netzplans', $txt$A Ist-Analyse, 2 h, kein Vorgänger; B Soll-Konzept, 4 h, A; C Beschaffung neuer Server, 3 h, B; D Installation strukturierter Netzwerk-Verkabelung, 8 h, B; E Datensicherung, 2 h, B; F Dokumentation des neuen Netzwerkes, 5 h, B; G Installation neuer Server, 4 h, C und D; H Abbau alter Infrastruktur, 1 h, E; I Einrichtung Clients, 3 h, G und H; J Funktionstest, 1 h, I; K Übergabe und Einweisung der Mitarbeiter, 2 h, F und J.$txt$);


  -- Szenario 2: Arbeitsplätze, Energiebedarf und Datensicherung
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 2, 'Arbeitsplätze, Energiebedarf und Datensicherung', $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, null, 22);

  -- 2a (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Errechnen Sie die Leistung und die Energiekosten pro Monat, wenn eine kWh 30 Cent kostet. Dem englischsprachigen Manual des Netzteils können Sie folgende Definition entnehmen: Efficiency = Useful power output/Total power input 6 Punkte PC-A PC-B Wirkungsgrad des Netzteils bei 60 W in Prozent 43 % 76 % Durch die Komponenten des PCs benötigte durchschnittliche Leistung im Betrieb 60 W 60 W Vom Netzteil bezogene Leistung aus dem Stromnetz 139,53 W Energiekosten pro Monat in EUR$txt$, 6.0, 'PUBLISHED', $txt$a) 6 Punkte Betriebsstunden pro Monat: 20 Tage/Monat * 9 Stunden/Tag = 180 Stunden PC-A PC-B Wirkungsgrad des Netzteils bei 60 W in Prozent 43 % 76 % Durch die Komponenten des PCs benötigte durchschnittliche Leistung im Betrieb (9 h pro 60 W 60 W Tag) Vom Netzteil bezogene Leistung aus dem Stromnetz 139,53 W 60 W / 0,76 = 78,94 W Energiekosten pro Monat in EUR 180 h * 139,53 W 180 h * 78,94 W * * 0,3 Cent/kWh 0,3 Cent/kWh = 7,53 EUR = 4,26 EUR$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2a: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2b (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) Der PC mit dem Netzteil nach dem 80Plus Gold Standard kostet in der Anschaffung 100 EUR mehr. Berechnen Sie die Dauer in Monaten, ab der sich die Anschaffung amortisiert hat. Hinweis: Falls Sie Aufgabe a) nicht lösen konnten, rechnen Sie bei PC-A mit 6,83 EUR und bei PC-B mit 4,78 EUR. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$b) 4 Punkte Differenz der Energiebetriebskosten pro Monat: 7,53 EUR - 4,26 EUR = 3,27 EUR Bei einer Differenz im Anschaffungspreis von 100 EUR rechnet sich die Anschaffung 100 EUR / 3,27 EUR pro Monat = 30,58 Monate, also nach 31 Monaten. Alternativlösung: Differenz der Energiebetriebskosten pro Monat: 6,83 EUR - 4,78 EUR = 2,05 EUR Bei einer Differenz im Anschaffungspreis von 100 EUR rechnet sich die Anschaffung 100 EUR / 2,05 EUR pro Monat = 48,78 Monate, also nach 49 Monaten.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2b: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2c (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$c) Machen Sie drei weitere Vorschläge zur Senkung der Energiekosten des IT-Arbeitsplatzes. 3 Punkte$txt$, 3.0, 'PUBLISHED', $txt$c) 3 Punkte – Verwendung von schaltbaren Steckdosen zur Vermeidung von Energiekosten im Standby-Betrieb – Verwendung von Monitoren mit Energieeffizienz Label (A, A+, A++, etc. oder neues Label von A - G) – Verwendung von Thin Clients – u. a.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2c: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2d (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$d) Bei der Installation der Geräte stellen Sie fest, dass folgende Geräte über eine einzige Mehrfachsteckdose mit der Aufschrift „maximal 16 A“ angeschlossen werden sollen. – 3 PCs mit einer maximalen Leistungsaufnahme von jeweils 180 W – Ein Drucker mit einer maximalen Leistungsaufnahme von 400 W – Eine Kaffeemaschine mit einer maximalen Leistungsaufnahme von 1.200 W – Klimagerät mit einer maximalen Leistungsaufnahme von 2.000 W Weisen Sie durch eine Rechnung nach, dass diese Geräte nicht gleichzeitig betrieben werden können. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$d) 4 Punkte Eine Steckdose mit 16 A darf mit maximal 16 A x 230 V = 3.680 Watt belastet werden. 3 x 180 Watt + 400 Watt + 1.200 Watt + 2.000 Watt = 4.140 Watt ist zu viel.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2d: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2e (8.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$e) Für den gewählten Rechner wird eine Datensicherung erstellt. Ihr Kollege hat das folgende Skript erstellt, welches eine Warnung ausgeben soll, wenn der Speicherplatz auf dem Ziellaufwerk Z unter 15 % fällt. Erstelltes Skript Falsche Zeilen korrigieren $Drive = Get-Volume -DriveLetter Z $Prozent=($Drive.SizeRemaining/$Drive. Size)* 1000 if($Prozent -gt 15) { Write-Host „Es sind weniger als 15% Speicherplatz frei.“ } else { Write-Host „Es ist genügend Speicherplatz verfügbar.“ } Leider funktioniert das Skript nicht wie gewünscht und bringt eine Warnmeldung, obwohl das Laufwerk nur zu 50 % gefüllt ist. Lesen Sie sich die folgende Anleitung (manual) durch und korrigieren Sie in der obigen Tabelle die zwei Fehler. 8 Punkte Manual: To use a comparison operator, specify the values that you want to compare together with an operator that separates these values. The Shell includes the following comparison operators: Operators Description -eq equals -ne not equals -gt greater than -ge greater than or equal -lt less than -le less than or equal Note: Write-Host produce a display output. Get-Volume return a Volume object that match the specified criteria.$txt$, 8.0, 'PUBLISHED', $txt$e) 8 Punkte Erstelltes Skript Falsche Zeilen korrigieren $Drive = Get-Volume -DriveLetter Z $Prozent=($Drive.SizeRemaining/$Drive.Size) $Prozent=($Drive.SizeRemaining/$Drive. * 1000 Size)*100 if($Prozent -gt 15) if($Prozent -lt 15) { Write-Host „Es sind weniger als 15% Speicherplatz frei.“ } else { Write-Host „Es ist genügend Speicherplatz verfügbar.“ }$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 8.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2e: Lösung gemäß Erwartungshorizont', 8.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');


  -- Szenario 3: Angebot, Remote-Arbeit und Speicherkonzept
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 3, 'Angebot, Remote-Arbeit und Speicherkonzept', $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, null, 23);

  -- 3a (5.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Grundlage für einen möglichen Auftrag an die IT.SYS GmbH ist ein Lastenheft der Arztpraxis Care, das die spezifischen Anforderungen des Auftraggebers an den potenziellen Auftragnehmer beschreibt. Benennen Sie fünf inhaltliche Aspekte, die in solch einem Lastenheft üblicherweise enthalten sind. 5 Punkte$txt$, 5.0, 'PUBLISHED', $txt$a) 5 Punkte Zum Beispiel: – Kurzvorstellung des Auftraggebers – Definition des Projektziels – Beschreibung der bestehenden IT-Infrastruktur – Zeitrahmen der Umsetzung des Projekts – Funktionale Anforderungen – Rahmenparameter IT-Security und Datenschutz$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3a: Lösung gemäß Erwartungshorizont', 5.0, 'QUALITATIVE', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- 3ba (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) Eines der Projektziele ist die Ablösung eines veralteten E-Mail-Systems in der Arztpraxis Care. Ein wesentlicher Aspekt ist hierbei die Migration der bestehenden Postfächer auf den neuen E-Mail-Server. Aus organisatorischen Gründen kann eine solche Migration nur außerhalb der gewöhnlichen Öffnungszeiten der Praxis durchgeführt werden. Die Praxis ist wochentags von 18.00 – 8.00 Uhr geschlossen. Für betreffende Arbeiten beauftragt die IT.SYS GmbH einen Subunternehmer, der diese unter der Woche durchführen soll. Der Dienstleister verlangt für seine Tätigkeit 130 EUR/h. Die Migration eines Postfachs dauert wegen umfangreicher manueller Nacharbeiten im Schnitt zwei Stunden. In Summe sind 20 Postfächer zu migrieren. ba) Berechnen Sie die Gesamtkosten für die Migration, die die IT.SYS GmbH berücksichtigen müsste. Der Rechenweg ist anzugeben. 2 Punkte Gesamtkosten:$txt$, 2.0, 'PUBLISHED', $txt$ba) 2 Punkte Gesamtkosten: 20 * 2 * 130 EUR = 40 * 130 EUR = 5.200 EUR$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3ba: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- 3bb (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$b) Eines der Projektziele ist die Ablösung eines veralteten E-Mail-Systems in der Arztpraxis Care. Ein wesentlicher Aspekt ist hierbei die Migration der bestehenden Postfächer auf den neuen E-Mail-Server. Aus organisatorischen Gründen kann eine solche Migration nur außerhalb der gewöhnlichen Öffnungszeiten der Praxis durchgeführt werden. Die Praxis ist wochentags von 18.00 – 8.00 Uhr geschlossen. Für betreffende Arbeiten beauftragt die IT.SYS GmbH einen Subunternehmer, der diese unter der Woche durchführen soll. Der Dienstleister verlangt für seine Tätigkeit 130 EUR/h. Die Migration eines Postfachs dauert wegen umfangreicher manueller Nacharbeiten im Schnitt zwei Stunden. In Summe sind 20 Postfächer zu migrieren. bb) Ermitteln Sie, nach wie vielen Tagen die Migration frühestens abgeschlossen ist, wenn das Subunternehmen zwei Angestellte mit einer täglichen Arbeitszeit von 8 h pro Tag einsetzt. Der Rechenweg ist anzugeben. 2 Punkte Anzahl der Arbeitstage:$txt$, 2.0, 'PUBLISHED', $txt$bb) 2 Punkte Gesamtdauer: 20 * 2 = 40 h -> 40 / 8 = 5 Tage = 5 Tage / 2 Arbeiter => 2,5 Tage Aufgerundet 3 Tage auch als richtig anzusehen$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3bb: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- 3c (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$c) Mit dem Auftraggeber wird diskutiert, ob gewisse Arbeiten der IT.SYS GmbH remote durchgeführt werden sollen. Nennen Sie zwei Vorteile sowie zwei Nachteile von remote gegenüber einer Vor-Ort-Wartung. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$c) 4 Punkte Vorteile: – Geringere Kosten – Fahrtkosten, Reisezeit, Spesen – Einfachere Einbindung weiterer Spezialisten bei Bedarf – Schonung interner Ressourcen – Büro, Konferenzraum – Kontaktvermeidung – u. a. Nachteile: – Risiko im Bereich Datenschutz, da Patientendaten abgegriffen werden könnten – Zusätzliche Kosten für eine gesicherte Verbindung – Wartung bei Verbindungsproblemen nicht möglich – u. a.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3c: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- 3d (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$d) Auf allen Arbeitsplätzen in der Arztpraxis soll eine neue Software-Suite für die Bereiche Textverarbeitung, Tabellenkalkulation und Präsentationen installiert werden. Eine weitere Aufgabe der IT.SYS GmbH ist es, die Mitarbeiter in der Praxis in diese Programme einzuweisen. Beschreiben Sie drei von den vier vorgegebenen Möglichkeiten, wie die betreffenden Inhalte vermittelt werden können. 6 Punkte (1) Schulung am Arbeitsplatz: (2) Webinare: (3) Video-Tutorien: (4) Multiplikatoren-Schulung:$txt$, 6.0, 'PUBLISHED', $txt$d) 6 Punkte z. B. – Schulung am Arbeitsplatz: Die Einweisung erfolgt während der Arbeitszeit vor Ort. – Webinare: festgelegt von der Zeit, findet online statt, interaktiv – Video-Tutorien: zeitlich flexibel und unabhängig genutzt von den anderen Mitarbeitern, keine Interaktion möglich – Multiplikatoren-Schulung: Schulung ausgewählter Mitarbeiter, die ihr Wissen an die anderen Mitarbeiter weitergeben sollen$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3d: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- 3e (7.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$e) Der Praxisinhaber hat von seinem IT-Dienstleister gehört, dass durch den Verbund mehrerer Festplatten verschiedene RAIDLevel gebildet werden können. Besonders wichtig für die Arztpraxis ist es, dass eine hohe Verfügbarkeit der Daten vorhanden ist. Besonders der Ausfall einer Festplatte soll kompensiert werden. Gleichzeitig soll sich der Anteil der Speicherkapazität für die Nutzdaten auf den Festplatten nicht so stark reduzieren. Hinsichtlich dieser Prioritäten beraten Sie den Praxisinhaber und stellen die RAID-Level 0, 1 und 5 vor. Erklären Sie dem Praxisinhaber die Grundfunktionen der drei RAID-Level-Arten und begründen Sie, für welches RAID-Level sich der Praxisinhaber entscheiden sollte. 7 Punkte$txt$, 7.0, 'PUBLISHED', $txt$e) 7 Punkte Erklärung, jeweils 2 Punkte (Gesamt: 6 Punkte), Entscheidungsauswahl 1 Punkt RAID 0 Kommt für die Arztpraxis nicht in Frage, dieses Level ist nur für den schnellen Datenzugriff optimiert, Data Striping wird verwendet, dadurch Erhöhung der Datentransferrate, keine Erhöhung der Datensicherheit RAID 1 Käme nur für eine Priorität in die Auswahl für die Arztpraxis Verkraftet den Ausfall einer Festplatte, Mirroring, d. h. vollständige Spiegelung der Daten auf weiteren Platten Speicherkapazität für die Nutzdaten reduziert anteilsmäßig, z. B. um 50 % RAID 5 Käme für beide Prioritäten in die Auswahl für die Arztpraxis Verkraftet den Ausfall einer Festplatte, Zerlegung der Nutzdaten in Blöcke mit Paritätsinformationen Verringerung der Speicherkapazität für die Nutzdaten bei z. B. drei Festplatten bei ca. 33 % Entscheidung: RAID 5$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 7.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3e: Lösung gemäß Erwartungshorizont', 7.0, 'QUALITATIVE', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');


  -- Szenario 4: IT-Grundschutz und Datenschutz
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 4, 'IT-Grundschutz und Datenschutz', $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, $txt$Die IT.SYS GmbH plant und realisiert den Umzug der Arztpraxis Care und modernisiert dabei Arbeitsplätze, Infrastruktur und Datensicherung.$txt$, null, 23);

  -- 4a (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) In einem ersten Schritt informieren Sie sich über allgemeine Grundlagen der Informationssicherheit. Als wichtige Schutzziele werden hier u. a. Vertraulichkeit, Integrität und Verfügbarkeit genannt. Sie klären nun, welches Schutzziel der jeweiligen Sicherheitsmaßnahme zugeordnet werden kann. Setzen Sie dazu pro Zeile jeweils ein Kreuz und geben Sie eine Begründung für Ihre Zuordnung an. 6 Punkte Vertraulichkeit Verfügbarkeit Integrität Sicherheitsmaßnahme Begründung Sichere Passwörter wählen x Der Zugriff Fremder auf die Benutzerdaten wird besser geschützt. Regelmäßige Datensicherung der Patientendaten Verschlüsselung der Festplatten Zentrale Bearbeitung wichtiger Dokumente auf Server Hashwertüberprüfung bei Softwareinstallation$txt$, 6.0, 'PUBLISHED', $txt$a) 6 Punkte, 4 x 0,5 Punkte für Kreuz und je 1 Punkt für Begründung Vertraulichkeit Integrität Verfügbarkeit Schutzmaßnahme Begründung Sichere Passwörter wählen x Der Zugriff Fremder auf die Benutzerdaten wird besser geschützt. Regelmäßige Datensicherung der Patien- Daten können bei Verlust der Originaldaten wiederhergestellt x tendaten werden. Inhaltliche Nutzung der Daten ist für unberechtigte Benutzer Verschlüsselung der Festplatten x nicht möglich. Zentrale Bearbeitung wichtiger Doku- Kein unterschiedlicher Bearbeitungsstand der Dokumente (z. B. x mente auf Server auf Clients). Wenn der zusammen mit der Software übermittelte Hashwert Hashwertüberprüfung bei Softwarein- identisch ist mit dem berechneten Hashwert, kann man davon x stallation ausgehen, dass die Software keinen eingeschleusten Trojaner beinhaltet. Andere Lösungen mit sinnvollen Begründungen sind möglich.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4a: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 4b (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) Im IT-Grundschutz-Kompendium des Bundesamtes für Sicherheit in der Informationstechnik (BSI) finden Sie Basis-Anforderungen zur Absicherung eines PC-Clients. Nennen Sie je eine Maßnahme, mit denen die folgenden Anforderungen umgesetzt werden könnten. 2 Punkte – Aktivieren von Autoupdate-Mechanismen: – Differenzieren von Benutzerrollen (Rollentrennung):$txt$, 2.0, 'PUBLISHED', $txt$b) 2 Punkte – Aktivieren von Autoupdate-Mechanismen: z. B. Windows Updates aktivieren, Update der Virensignaturen aktivieren – Differenzieren von Benutzerrollen (Rollentrennung): z. B keine normalen Tätigkeiten mit Administratorrechten durchführen, Installationen und Systemänderungen nur durch Administratoren mit Administratorrechten, nur lesender Zugriff auf Systemdateien für Benutzer.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4b: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 4c (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$c) Im Rahmen einer Schutzbedarfsanalyse versuchen Sie zu ermitteln, wie wichtig die verwendeten unternehmensrelevanten ITAnwendungen für den Fortgang des Geschäftsprozesses sind, um das Maß an benötigtem Schutz zu definieren. Folgende Schutzbedarfskategorien werden vorgeschlagen: In einer Tabelle wurde bereits der Schutzbedarf verschiedener IT-Anwendungen zugewiesen. Fügen Sie jeweils eine mögliche Begründung für den gewählten Schutzbedarf hinzu. 6 Punkte IT-Anwendung Schutzbedarfsfeststellung Schutzziel Kategorie Begründung Prüfziffernverfahren bei der Übermittlung Integrität hoch z. B.: Verfälschte Daten bei der Übertragung der Krankenversicherungsnummer können zu fehlerhaften Abrechnungen führen. Textverarbeitung Verfügbarkeit mittel Software zur telemedizinischen Beratung Vertraulichkeit hoch über Videokonferenz Patientendatenverarbeitung Integrität sehr hoch$txt$, 6.0, 'PUBLISHED', $txt$c) 6 Punkte, 2 Punkte pro Begründung IT-Anwendung Schutzbedarfsfeststellung Grundwert Schutzbedarf Begründung Prüfziffernverfahren bei der Übermittlung Integrität hoch z. B.: Verfälschte Daten bei der Übertragung können der Krankenversicherungsnummer zu fehlerhaften Abrechnungen führen. Textverarbeitung Verfügbarkeit mittel z. B.: Patientenbriefe und Rechnungen können nur verspätet erstellt werden. Software zur telemedizinischen Beratung Vertraulichkeit hoch z. B.: Das Bekanntwerden kann die Betroffenen über Videokonferenz erheblich beeinträchtigen. Patientendatenverarbeitung Integrität sehr hoch z. B.: Fehlerhafte Einträge können zu fehlerhaften Diagnosen und Behandlungen führen. Andere Begründungen sind möglich.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4c: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 4d (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$d) Die Arzthelferin an der Rezeption möchte von Ihnen wissen, für welche Art von Daten ein besonderer Schutz gesetzlich vorgeschrieben ist. Geben Sie der Arzthelferin Auskunft und benennen Sie hierzu eine rechtliche Grundlage. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$d) 2 Punkte Bei personenbezogenen Daten, Patientendaten, Mitarbeiterdaten Bundesdatenschutzgesetz oder DSGVO$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4d: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 4e (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$e) Führen Sie zwei Kriterien an, die ein sicheres Passwort erfüllen sollte. Beschreiben Sie auch, warum diese Kriterien für eine höhere Sicherheit sorgen. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$e) 4 Punkte z. B. – Ausreichende Länge Æ schwer zu ermitteln! – Verwendung von Sonderzeichen Æ Erhöhung des Zeichenvorrats Æ schwieriger zu entschlüsseln – Unsinnige Zeichenketten verwenden (keine festen Begriffe) Æ Softwareunterstütztes Ausspionieren mit Wörterbuch wird erschwert – Unterschiedliche Passwörter für unterschiedliche Zugänge verwenden Æ Risikominimierung bei Bekanntwerden eines Passwortes – u. a.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4e: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 4fa (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$f) Die Gebührenabrechnungssoftware ist so eingerichtet, dass der Datenbestand freitags beim Herunterfahren des PCs auf einer speziell eingerichteten Partition der Festplatte gesichert wird. fa) Ihr Teamleiter beauftragt Sie, der Leiterin des Praxismanagements die Risiken aufzuzeigen. Beschreiben Sie zwei der Risiken. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$fa) 2 Punkte Keine zeitliche und räumliche Trennung der gesicherten Daten vorhanden Wöchentlicher Sicherungszyklus zu lange, Rekonstruktion bei Datensicherung kaum möglich bzw. sehr aufwendig$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4fa: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 4fb (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$f) Die Gebührenabrechnungssoftware ist so eingerichtet, dass der Datenbestand freitags beim Herunterfahren des PCs auf einer speziell eingerichteten Partition der Festplatte gesichert wird. fb) Unterbreiten Sie der Leiterin einen konkreten Verbesserungsvorschlag. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$fb) 2 Punkte Externe Sicherung Sicherungskonzept mit zumindest täglicher Sicherung der veränderten Daten Alle relevanten Daten müssen regelmäßig auf geeignete externe Medien gesichert werden. Das externe Medium ist „abzumelden“ und sicher an einem anderen Ort zu verwahren.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4fb: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  return v_exam;
end $_$;


--
-- Name: FUNCTION uebungspruefung_ap1_2021_herbst_roh(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_ap1_2021_herbst_roh() IS 'Rumpf der echten Prüfung CURRENT_AP1_2021_HERBST (erzeugt aus tools/ap1_pruefungsdaten.py durch tools/ap1_migration_erzeugen.py). Vier Szenarien, 100.0 Punkte, 90 Minuten (FULL_EXAM). Nur über uebungspruefung_anlegen(code).';


--
-- Name: uebungspruefung_ap1_2022_fruehjahr_roh(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_ap1_2022_fruehjahr_roh() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $_$
declare
  v_user   uuid := auth.uid();
  v_exam   uuid;
  v_scen   uuid;
  v_frage  uuid;
  v_rubrik uuid;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.user_profile where id = v_user) then
    raise exception 'Kein Profil zu dieser Sitzung.' using errcode = '23503';
  end if;

  -- Wiederholbarkeit: eine offene Prüfung dieser Variante wird fortgesetzt, nicht
  -- verdoppelt -- wie uebungspruefung_anlegen_roh() (0016), nur mit mode = 'FULL_EXAM'
  -- statt 'MINI_EXAM': diese Story ist der erste FULL_EXAM-Nutzer (e01s04, 0007_exam.sql:88).
  select e.id into v_exam
    from public.exam e
   where e.user_id = v_user
     and e.mode = 'FULL_EXAM'
     and e.status = 'IN_PROGRESS'
     and e.title = 'AP1 Frühjahr 2022 (Originalprüfung)'
   order by e.created_at
   limit 1;
  if v_exam is not null then
    return v_exam;
  end if;

  v_exam := gen_random_uuid();
  insert into public.exam (id, user_id, title, mode, status, duration_minutes,
                           total_points, started_at)
  values (v_exam, v_user, 'AP1 Frühjahr 2022 (Originalprüfung)', 'FULL_EXAM', 'IN_PROGRESS', 90, 100.0, now());

  -- Szenario 1: Unternehmen und Angebot
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 1, 'Unternehmen und Angebot', $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, null, 22);

  -- 1aa (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Als Vorbereitung auf das Erstgespräch mit der Rullix GmbH soll zunächst die AllRound AG allgemein und dann das Leistungsangebot vorgestellt werden, um die Eignung der AllRound AG für diesen Auftrag herauszustellen. Sie sollen eine Präsentationsfolie für die allgemeine Unternehmensdarstellung der AllRound AG erstellen, um für den gewünschten Auftrag einen möglichst guten Eindruck zu hinterlassen. Aus der eingangs beschriebenen Situation sind dazu drei geeignete betriebliche Informationen herauszustellen, um diese auf der Folie als möglichst präsentationsgeeignete Stichpunkte anzuführen. Dabei soll jeder einzelne Stichpunkt eine Botschaft vermitteln. Die inhaltliche Vorlage für die gestalterische Umsetzung soll in Form von Aufzählungspunkten erfolgen, wie in dem Beispiel bereits angedeutet ist. aa) Vermerken Sie im Notizbereich die dazugehörigen Botschaften, welche Sie mit der jeweils gewählten Information aus der Situationsbeschreibung zum Ausdruck bringen wollen. 6 Punkte$txt$, 6.0, 'PUBLISHED', $txt$a) 9 Punkte, davon 3 x 2 Punkte Botschaft im Notizbereich und 3 x 1 Punkt Stichpunkt auf der Folie aa) 3 Punkte Mögliche Inhalte: – Seit 1985 am Markt (Beispiel) – 720 Mitarbeiterinnen und Mitarbeiter – Weltweite Niederlassungen – Kundenreferenzen in allen Branchen – Zertifizierte Kompetenzen – Wechsel in der Geschäftsführung – Neuausrichtung nach Krisensituation – Anbieter für große und internationale IT-Projekte$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1aa: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1ab (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$a) Als Vorbereitung auf das Erstgespräch mit der Rullix GmbH soll zunächst die AllRound AG allgemein und dann das Leistungsangebot vorgestellt werden, um die Eignung der AllRound AG für diesen Auftrag herauszustellen. Sie sollen eine Präsentationsfolie für die allgemeine Unternehmensdarstellung der AllRound AG erstellen, um für den gewünschten Auftrag einen möglichst guten Eindruck zu hinterlassen. Aus der eingangs beschriebenen Situation sind dazu drei geeignete betriebliche Informationen herauszustellen, um diese auf der Folie als möglichst präsentationsgeeignete Stichpunkte anzuführen. Dabei soll jeder einzelne Stichpunkt eine Botschaft vermitteln. Die inhaltliche Vorlage für die gestalterische Umsetzung soll in Form von Aufzählungspunkten erfolgen, wie in dem Beispiel bereits angedeutet ist. ab) Ergänzen Sie den Folienbereich um die drei zur Botschaft passenden Aufzählungspunkte in präsentationsgeeigneter Formulierung. 3 Punkte (Folienbereich:) – Seit 1985 am Markt – – – (Notizbereich:) Botschaften: – z. B.: Beständigkeit durch über 35 Jahre Marktpräsenz und jahrzehntelange Erfahrung garantiert langfristige Partnerschaften auch in der Zukunft. – – –$txt$, 3.0, 'PUBLISHED', $txt$a) 9 Punkte, davon 3 x 2 Punkte Botschaft im Notizbereich und 3 x 1 Punkt Stichpunkt auf der Folie ab) 6 Punkte Notizbereich: – Seit 1985 am Markt  z. B.: Beständigkeit durch über 35 Jahre Marktpräsenz und jahrzehntelange Erfahrung garantiert langfristige Partnerschaften auch in der Zukunft. (Beispiel) – 720 Mitarbeiterinnen und Mitarbeiter  z. B.: Fristgerechte Bewältigung auch personalintensiver Aufträge möglich. – Weltweite Niederlassungen  z. B.: Support vor Ort international möglich – Kundenreferenzen in allen Branchen  z. B.: Branchenübergreifender Kundenstamm und Kundenzufriedenheit beweisen die erfolgreiche Durchführung von Aufträgen. – Zertifizierungen  z. B.: Nachgewiesene Standards garantierten eine professionelle Durchführung der Aufträge. – Wechsel in der Geschäftsführung  z. B. ungeeignet bzw. überzeugende Begründung nötig – Neuausrichtung nach Krisensituation  z. B.: ungeeignet bzw. überzeugende Begründung nötig – Anbieter für große und internationale IT-Projekte  z. B.: interkulturelle Kompetenzen$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1ab: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1b (9.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$b) Aus dem Unternehmensportfolio der AllRound AG sind Ihnen folgende Begriffe im Gedächtnis: – Industrie 4.0 – Support in den Bereichen Prozess- und IT-Management – Migrationsunterstützung – Big Data – Cloud-Hosting in allen Varianten – Beratung im Hinblick auf DSGVO und BDSG – Webhosting – Remarketing von IT-Geräten Die Leistungsangebote der AllRound AG sollen dem Kunden nicht nur erklärt, sondern auch sprachlich überzeugend formuliert werden. Wählen Sie aus den obenstehenden Begriffen drei aus und beschreiben Sie diese dem zukünftigen Kunden so, dass die einzelnen Leistungsangebote möglichst auftrags- und nutzenbezogen erläutert werden. 9 Punkte Leistungsangebote Erläuternder Text, in ganzen Sätzen Industrie 4.0 Beispiel: Wir optimieren Ihren Produktionsprozess durch Nutzung intelligenter Informations- und Kommunikationstechnik. Angestrebt wird die Schaffung einer möglichst hohen Flexibilität durch eine weitgehend selbstorganisierte Produktion.$txt$, 9.0, 'PUBLISHED', $txt$b) 9 Punkte (jeweils 2 Punkte Inhalt, 1 Punkt Sprache mit überzeugender und treffender Formulierung) Leistungsangebote Erläuternder Text, in ganzen Sätzen Beispiel: Industrie 4.0 Wir optimieren Ihren Produktionsprozess durch Nutzung intelligenter Informationsund Kommunikationstechnik. Angestrebt wird die Schaffung einer möglichst hohen Flexibilität durch eine weitgehend selbstorganisierte Produktion. Support in den Bereichen Im Sinne von reibungslosen, flexiblen und transparenten Abläufen erfahren Sie Prozess- und IT-Manage- unsere Unterstützung bei der Optimierung Ihrer betrieblichen Prozesse. Darüber ment hinaus kümmern wir uns um die dafür benötigte IT-Ausstattung. Migrationsunterstützung Wir helfen Ihnen bei der Umstellung oder Anpassung der Hard- und Software innerhalb Ihres kompletten Datenverarbeitungssystems, um wieder möglichst rasch die angestrebte Funktionsfähigkeit zu erlangen. Big Data Um die jederzeitige und schnelle Verfügbarkeit Ihrer Daten zu gewährleisten, unterstützen wir Sie bei der sicheren und datenschutzkonformen Speicherung, Verarbeitung und Analyse Ihres Datenbestands. Cloud-Hosting in allen Wir bieten Ihnen eine zentrale IT-Infrastruktur in Form von Rechenleistung, SpeiVarianten cherplatz und Software unter Verzicht auf das Vorhalten lokaler Ressourcen. Damit bleibt Ihre IT-Ausstattung flexibel skalierbar und Sie können sich aufgrund unserer IT-Kompetenz auf Ihre Kernaufgaben konzentrieren. Beratung im Hinblick auf Wir kümmern uns mit unseren eigens geschulten und zertifizierten Mitarbeitern DSGVO und BDSG zuverlässig darum, dass die Vorschriften der Datenschutzgrundverordnung nicht verletzt und damit Schaden und Strafen vom Unternehmen abgewendet werden. Webhosting Wir stellen für Sie Onlinespeicherplatz und Dienstleistungen für Internetauftritte auf Servern von Internetdienstanbietern bereit, damit Sie sich ausschließlich auf die Aktualisierung der Inhalte konzentrieren können. Remarketing von IT-Geräten Im Sinne einer umweltgerechten Entsorgung und einem verantwortungsvollen Umgang mit den Ressourcen organisieren wir für Sie die Wiedervermarktung Ihrer gebrauchten EDV-Ausstattungen mit zusätzlichen Einnahmen.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 9.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1b: Lösung gemäß Erwartungshorizont', 9.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1ca (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$c) Die AllRound AG soll ein Angebot für das Projekt zur kompletten Neuorganisation der Verwaltung und der IT-Gesamtkonzeption der Rullix GmbH erstellen. ca) Schildern Sie analog des Beispiels, warum folgende Informationen für die Erstellung des Angebots benötigt werden: 6 Punkte Informationen Erläuterungen Beispiel: Beispiel: Räumliche Gegebenheiten Bestimmung der Entfernungen, um den logistischen Aufwand abschätzen zu können Lastenheft Geplanter Zeitrahmen Ergebnisse der Ist-Analyse$txt$, 6.0, 'PUBLISHED', $txt$ca) 6 Punkte Informationen Erläuterungen Beispiel: Räumliche Beispiel: Bestimmung der Entfernungen, um den logistischen Aufwand abschätzen Gegebenheiten zu können Lastenheft Beschreibung aller vom Kunden gewünschten Anforderungen. Es stellt die Grund lage für eine spätere Kalkulation dar. Geplanter Zeitrahmen Terminierung des Projekts zur rechtzeitigen Bereitstellung der Ressourcen Ergebnisse der Ist-Analyse Zur Festlegung der Ausgangslage$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1ca: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1cb (1.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$c) Die AllRound AG soll ein Angebot für das Projekt zur kompletten Neuorganisation der Verwaltung und der IT-Gesamtkonzeption der Rullix GmbH erstellen. cb) Zur Erstellung eines Angebots werden auch formale Informationen benötigt, z. B. die Adresse. Welche formale Information könnte darüber hinaus auch noch erforderlich sein? 1 Punkt$txt$, 1.0, 'PUBLISHED', $txt$cb) 1 Punkt Formale Information, z. B. – Ansprechpartner mit Kontaktdaten – Bindungsfrist des Angebots – Datum$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1cb: Lösung gemäß Erwartungshorizont', 1.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');


  -- Szenario 2: PC-Komponenten auswählen und montieren
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 2, 'PC-Komponenten auswählen und montieren', $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, null, 22);

  -- 2aa (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Sie möchten die CPU in den CPU-Sockel des Mainboards einbauen. Dazu lesen Sie sich die folgende Anleitung durch. CPU installation: To fit the processor in the socket, first lift the lever. The CPU fits in only one correct orientation. Make sure the arrow on top of the processor is aligned with the arrow on the processor socket. Do not force the CPU into the socket to prevent bending the connectors on the socket and damaging the CPU. Gently push the processor into place. Push the lever down to secure the processor. aa) Nennen Sie die drei Schritte für den Einbau der CPU. 3 Punkte$txt$, 3.0, 'PUBLISHED', $txt$aa) 3 Punkte Hebel öffnen CPU vorsichtig einsetzen Hebel schließen.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2aa: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2ab (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$a) Sie möchten die CPU in den CPU-Sockel des Mainboards einbauen. Dazu lesen Sie sich die folgende Anleitung durch. CPU installation: To fit the processor in the socket, first lift the lever. The CPU fits in only one correct orientation. Make sure the arrow on top of the processor is aligned with the arrow on the processor socket. Do not force the CPU into the socket to prevent bending the connectors on the socket and damaging the CPU. Gently push the processor into place. Push the lever down to secure the processor. ab) Beschreiben Sie, welche beiden Punkte beim Schritt 2 besonders zu beachten sind. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$ab) 2 Punkte Die CPU nicht mit Gewalt einsetzen. Der Pfeil auf der Oberseite des Prozessors muss mit dem Pfeil auf dem Prozessorsockel übereinstimmen.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2ab: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2b (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$b) Nach dem Einsetzen der CPU auf das Mainboard wollen Sie den CPU-Kühler montieren. Dem CPU-Kühler liegt eine kleine Tube Wärmeleitpaste bei. Erläutern Sie, welche Aufgabe die Wärmeleitpaste hat. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$b) 2 Punkte Die Wärmeleitpaste soll kleine Unebenheiten auf den Kontaktflächen ausgleichen, da Luft ein schlechter Wärmeleiter ist.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2b: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2c (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$c) Sie möchten nun den DDR 4 Arbeitsspeicher in die Slots des Motherboards einsetzen. Sie haben zwei DDR 4 RAM Riegel und möchten den RAM im Dual Channel Modus betreiben. Auf dem Motherboard sehen Sie die folgenden Slots: Erläutern Sie, was Sie beim Einsetzen der beiden Speicherriegel beachten müssen, damit der RAM im Dual Channel Modus arbeitet. 3 Punkte

--- Anlage: RAM-Steckplaetze ---
Vier RAM-Steckplaetze sind von oben nach unten mit DIMM B1, DIMM B2, DIMM A1 und DIMM A2 beschriftet.$txt$, 3.0, 'PUBLISHED', $txt$c) 3 Punkte Man sollte im Handbuch nachschauen, wie die Belegung der Kanäle ist, bspw. Einsetzen der beiden RAM-Riegel in den Slot A1 und B1 oder in A2 und B2. Die beiden RAM-Riegel (Kanäle) müssen die gleiche Speichergröße haben.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2c: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'RAM-Steckplaetze', $txt$Vier RAM-Steckplaetze sind von oben nach unten mit DIMM B1, DIMM B2, DIMM A1 und DIMM A2 beschriftet.$txt$);

  -- 2d (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$d) Als Datenspeicher haben Sie sich für eine SSD entschieden. Zur Wahl steht eine SATA SSD und eine M.2 SSD. Nennen Sie einen Vorteil und einen Nachteil einer M.2 SSD gegenüber einer SATA SSD. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$d) 2 Punkte Vorteil: – Schneller – Kompakte Bauweise Nachteil: – Teurer – Meist nur ein oder zwei Anschlüsse auf dem Motherboard vorhanden$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2d: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2e (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$e) Nachdem der PC fertig zusammengebaut ist, möchten Sie den Monitor an die Grafikkarte anschließen. Sie sehen an der Grafikkarte die folgenden Anschlüsse: Um welche Anschlüsse handelt es sich bei den mit A, B und C markierten Schnittstellen? Nennen Sie die korrekten Bezeichnungen/Abkürzungen. 3 Punkte A: B: C:

--- Anlage: Anschlüsse der Grafikkarte ---
Drei markierte Monitoranschluesse: A ist rechteckig mit einer abgeschraegten Ecke, B ist schmal und trapezfoermig, C ist breit, mehrreihig und besitzt seitliche Schraubverbindungen.$txt$, 3.0, 'PUBLISHED', $txt$e) 3 Punkte A: DisplayPort B: HDMI C: DVI$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2e: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Anschlüsse der Grafikkarte', $txt$Drei markierte Monitoranschluesse: A ist rechteckig mit einer abgeschraegten Ecke, B ist schmal und trapezfoermig, C ist breit, mehrreihig und besitzt seitliche Schraubverbindungen.$txt$);

  -- 2fa (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$f) An der Rückseite des PC sehen Sie die folgenden Anschlüsse: fa) Beschreiben Sie, welche Besonderheit der umrahmte USB-Anschluss hat. 2 Punkte

--- Anlage: Mainboard-Anschlussfeld ---
Rückseitiges Mainboard-Anschlussfeld. Der markierte rechteckige USB-A-Anschluss ist mit BIOS beschriftet; daneben liegen zwei ovale USB-C-Anschlüsse.$txt$, 2.0, 'PUBLISHED', $txt$fa) 2 Punkte Dieser Anschluss wird für das BIOS (Uefi) Update benutzt.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2fa: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Mainboard-Anschlussfeld', $txt$Rückseitiges Mainboard-Anschlussfeld. Der markierte rechteckige USB-A-Anschluss ist mit BIOS beschriftet; daneben liegen zwei ovale USB-C-Anschlüsse.$txt$);

  -- 2fb (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 8, $txt$f) An der Rückseite des PC sehen Sie die folgenden Anschlüsse: fb) Nennen Sie zwei Vorteile des USB-C Anschlusses gegenüber dem USB-3 Anschluss. 2 Punkte

--- Anlage: Mainboard-Anschlussfeld ---
Rückseitiges Mainboard-Anschlussfeld mit einem USB-A-Anschluss und zwei danebenliegenden ovalen USB-C-Anschlüssen.$txt$, 2.0, 'PUBLISHED', $txt$fb) 2 Punkte – Höhere Datenrate – Höhere Stromversorgung – Beidseitig steckbar$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2fb: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Mainboard-Anschlussfeld', $txt$Rückseitiges Mainboard-Anschlussfeld mit einem USB-A-Anschluss und zwei danebenliegenden ovalen USB-C-Anschlüssen.$txt$);

  -- 2ga (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 9, $txt$g) Sie testen den PC. Der Taskmanager zeigt die folgenden Daten: ga) Erläutern Sie den Begriff „Logische Prozessoren“. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$ga) 2 Punkte Die logischen Prozessoren sind eine Teilung der physikalischen CPU-Kerne und dienen dazu, mehrere Threads gleichzeitig in einem Prozessorkern auszuführen (Hyperthreading).$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2ga: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2gb (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 10, $txt$g) Sie testen den PC. Der Taskmanager zeigt die folgenden Daten: gb) Beschreiben Sie allgemein die Aufgabe eines „Cache“-Speichers. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$gb) 2 Punkte Ein Cache-Speicher ist ein schneller Zwischenspeicher. Der Cache reduziert die Anzahl der Zugriffe auf ein langsameres Speichermedium.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2gb: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2gc (1.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 11, $txt$g) Sie testen den PC. Der Taskmanager zeigt die folgenden Daten: gc) Geben Sie die Taktfrequenz von 3,4 GHz in Hertz an. 1 Punkt$txt$, 1.0, 'PUBLISHED', $txt$gc) 1 Punkt 3.400.000.000 Hz$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2gc: Lösung gemäß Erwartungshorizont', 1.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');


  -- Szenario 3: WLAN-Zugang systematisch analysieren
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 3, 'WLAN-Zugang systematisch analysieren', $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, null, 22);

  -- 3a (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Ihre Aufgabe besteht darin, für ein Notebook einen Netzwerkzugriff ins Firmen-WLAN einzurichten. Hierbei handelt es sich um ein WLAN mit WPA-PSK oder auch WPA Personal. Nennen Sie zwei wesentliche Informationen, die Sie vom Administrator erfragen müssen, um das Notebook im WLAN anmelden zu können. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$a) 2 Punkte SSID des WLAN-Netzes Pre-shared-key (PSK) oder auch Passwort möglich$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3a: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3b (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) Zur Authentifizierung von Nutzern im WLAN gibt es neben dem WPA-PSK-Verfahren auch das EAP-Verfahren, welches auch als WPA-Enterprise-RADIUS bezeichnet wird. Nennen Sie je einen Vor- bzw. Nachteil und geben Sie eine Empfehlung, in welcher Unternehmensgröße es vorwiegend eingesetzt werden sollte. 3 Punkte Verfahren Vorteil Nachteil Unternehmensgröße WPA-PSK Einfach umzusetzen Unsicher, da PW mit steigender Kleine Unternehmen mit weniAnzahl von Nutzern schnell gen Mitarbeitern bekannt werden kann EAP/WPAEnterprise-RADIUS$txt$, 3.0, 'PUBLISHED', $txt$b) 3 Punkte Verfahren Vorteil Nachteil Unternehmen WPA-PSK Einfach umzusetzen Unsicher da PW mit steigender Kleine Unternehmen mit Anzahl von Nutzern schnell wenigen Mitarbeitern bekannt werden kann EAP/WPA-Enterprise- Sehr viel sicherer, da jeder Be- Komplizierter umzusetzen, Mittlere und große RADIUS nutzer seinen eigenen Namen/ RADIUS-Server erforderlich Unternehmen PW-Kombination hat$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3b: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3c (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$c) Sie versuchen, die Verbindung über das WLAN herzustellen, was leider zunächst nicht gelingt. Ihre Idee ist nun, eine Fehleranalyse basierend auf den verschiedenen Schichten des OSI-Modells durchzuführen. Ergänzen Sie zur Vorbereitung die leeren Felder in der folgenden Tabelle. Hinweis: Geben Sie pro Feld jeweils nur ein passendes Beispiel an. 6 Punkte OSI-Schicht Nr. OSI-Schicht Name Verwendete Verwendete Möglicher Fehler Protokolle Adressen 7 – 4 Transportschicht TCP/UDP Ports Verlust eines Segments 3 2 1 – – Medium getrennt$txt$, 6.0, 'PUBLISHED', $txt$c) 6 Punkte OSI-Schicht Nr. OSI-Schicht Name Verwendete Pro- Verwendete Möglicher Fehler tokolle Adressen 7 Anwendung DNS, DHCP u. a. - Serverkonfiguration fehlerhaft 4 Transportschicht TCP/UDP Ports Verlust eines Segments 3 Vermittlung IPv4, IPv6 u. a. IP-Adressen Falsche IP-Adresse vergeben 2 Sicherung Ethernet u. a. MAC-Adressen Netzwerkkarte defekt 1 Bitübertragung - - Medium getrennt$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3c: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3d (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$d) Sie überprüfen nun den Zustand der Netzwerkverbindung. Folgendes wird angezeigt: Entsprechend Ihres Plans starten Sie Ihre Fehlersuche im OSI-Modell von unten nach oben (Bottom-up), beginnend mit Schicht 1. Im obenstehenden Bild suchen Sie dazu Informationen über den Zustand der Verbindung. Benennen Sie einen Wert, welcher der OSI-Schicht 1 zuzuordnen ist und interpretieren Sie diesen bezüglich seiner Funktionalität. 4 Punkte

--- Anlage: Status der WLAN-Verbindung ---
Windows-Statusansicht: IPv4- und IPv6-Konnektivität ohne Netzwerkzugriff; Medienstatus aktiviert; SSID Vodafone-5D2D; Übertragungsrate 144,0 MBit/s; starkes Signal sowie gesendete und empfangene Bytes.$txt$, 4.0, 'PUBLISHED', $txt$d) 4 Punkte (pro Wert 1 Punkt, Interpretation 2 Punkte) Wert: Medienstatus vorhanden Signalqualität hoch Aktivität (gesendete und empfangene Daten) Datenübertragungsrate hoch Interpretation: OSI-Schicht 1 fehlerfrei, Fehler liegt in einer höheren Schicht$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3d: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Status der WLAN-Verbindung', $txt$Windows-Statusansicht: IPv4- und IPv6-Konnektivität ohne Netzwerkzugriff; Medienstatus aktiviert; SSID Vodafone-5D2D; Übertragungsrate 144,0 MBit/s; starkes Signal sowie gesendete und empfangene Bytes.$txt$);

  -- 3ea (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$e) Sie starten nun das Konsolenfenster zur Analyse der OSI-Schichten 2 und 3 und erhalten nach der Eingabe eines Befehls zur Anzeige der Netzwerkkonfiguration die folgende Ausgabe: Trotz des fehlenden Netzwerkzugriffs werden zwei Adressen angezeigt. ea) Beschreiben Sie die Herkunft der Adresse 50-1A-C5-F2-38-B7. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$ea) 2 Punkte Hier handelt es sich um die der Netzwerkkarte vom Hersteller fest zugeordnete MAC-Adresse. Oder ähnliche Antworten$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3ea: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3eb (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$e) Sie starten nun das Konsolenfenster zur Analyse der OSI-Schichten 2 und 3 und erhalten nach der Eingabe eines Befehls zur Anzeige der Netzwerkkonfiguration die folgende Ausgabe: Trotz des fehlenden Netzwerkzugriffs werden zwei Adressen angezeigt. eb) Beschreiben Sie die Herkunft der Adresse Fe80::85e1:1ec1:c9e2:3cbb. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$eb) 2 Punkte Hier handelt es sich um eine link-lokale IPv6-Adresse, die sich der Rechner unabhängig vom Netz selbst zugewiesen hat.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3eb: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3fa (1.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$f) Bei Ihrer Fehleranalyse legen Sie nun Ihren Fokus auf die Analyse der höheren OSI-Schichten. Nach Eingabe des Befehls zur Erneuerung der IP-Adresse wird nun die folgende Information angezeigt: fa) Sie setzen Ihre Fehleranalyse nun fort. Nennen Sie die Bezeichnung des Servers, der hier durch den Befehl zur Erneuerung der IP-Adresse kontaktiert wurde. 1 Punkt

--- Anlage: Ausgabe von ipconfig /all ---
Drahtlos-LAN-Adapter WLAN: Physische Adresse 50-1A-C5-F2-38-B7; DHCP aktiviert: Ja; Autokonfiguration aktiviert: Ja; verbindungslokale IPv6-Adresse fe80::85e1:1ec1:c9e2:3cbb%5.$txt$, 1.0, 'PUBLISHED', $txt$fa) 1 Punkt DHCP-Server$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3fa: Lösung gemäß Erwartungshorizont', 1.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Ausgabe von ipconfig /all', $txt$Drahtlos-LAN-Adapter WLAN: Physische Adresse 50-1A-C5-F2-38-B7; DHCP aktiviert: Ja; Autokonfiguration aktiviert: Ja; verbindungslokale IPv6-Adresse fe80::85e1:1ec1:c9e2:3cbb%5.$txt$);

  -- 3fb (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 8, $txt$f) Bei Ihrer Fehleranalyse legen Sie nun Ihren Fokus auf die Analyse der höheren OSI-Schichten. Nach Eingabe des Befehls zur Erneuerung der IP-Adresse wird nun die folgende Information angezeigt: fb) Geben Sie die nachfolgenden Adressen des hier angegebenen Hosts an. 3 Punkte Netzadresse: Hostadresse: Broadcastadresse:

--- Anlage: IPv4-Konfiguration des WLAN-Adapters ---
IPv4-Adresse 192.168.0.52; Subnetzmaske 255.255.255.0; Standardgateway 192.168.0.1.$txt$, 3.0, 'PUBLISHED', $txt$fb) 3 Punkte Netzadresse: 192.168.0.0/24 (1 Punkt) Hostadresse: 0.0.0.52 oder 192.168.0.52 (1 Punkt) Broadcastadresse: 192.168.0.255 (1 Punkt)$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3fb: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'IPv4-Konfiguration des WLAN-Adapters', $txt$IPv4-Adresse 192.168.0.52; Subnetzmaske 255.255.255.0; Standardgateway 192.168.0.1.$txt$);

  -- 3fc (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 9, $txt$f) Bei Ihrer Fehleranalyse legen Sie nun Ihren Fokus auf die Analyse der höheren OSI-Schichten. Nach Eingabe des Befehls zur Erneuerung der IP-Adresse wird nun die folgende Information angezeigt: fc) Um die nun veränderte Situation zu prüfen, geben Sie den Befehl „ping 192.168.0.1“ ein und erhalten die folgende Ausgabe: Sie analysieren die Ergebnisse Ihrer gesamten Fehlersuche. Benennen Sie den von Ihnen ermittelten Fehler. 2 Punkte

--- Anlage: Ping auf das Standardgateway ---
Ping auf 192.168.0.1: vier Antworten; Pakete gesendet 4, empfangen 4, verloren 0 (0 % Verlust).$txt$, 2.0, 'PUBLISHED', $txt$fc) 2 Punkte Fehlerursache war die fehlende Zuteilung einer IP$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3fc: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Ping auf das Standardgateway', $txt$Ping auf 192.168.0.1: vier Antworten; Pakete gesendet 4, empfangen 4, verloren 0 (0 % Verlust).$txt$);


  -- Szenario 4: Standardarbeitsplaetze automatisiert verwalten
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 4, 'Standardarbeitsplaetze automatisiert verwalten', $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, $txt$Die AllRound AG beraet die Rullix GmbH bei der Neuorganisation ihrer Verwaltung und IT-Gesamtkonzeption.$txt$, null, 24);

  -- 4a (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Über die Workspace-Management-Software informieren Sie sich mit dem folgenden Text: Workspace management systems prepare the PC by installation and configuration, so that the user can immediately work with the programs. Prerequisite for the automatic installation are customized setups (packages), which do not require user input. The packages are installed and configured by a software distribution agent, which must be located on each PC. The patch management controls the administration and automatic installation of patches and updates. The integrated license management combines the data of available and actually used licenses and can thus not only prevent the procurement of neither too few nor too many software licenses. The data collection during the inventory is done remotely. It can also make use of proven network management tools such as SNMP. It is therefore not necessary for the responsible personnel to obtain physical access to the individual devices, as is the case with an inventory. The data stock can be continuously updated by the automatic collection and not only once a year. Nennen Sie vier Leistungsmerkmale einer Workspace-Management-Software anhand des oben zitierten Textes. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$a) 4 Punkte Softwareverteilung – Softwarekonfiguration – Updatemanagement – Patchmanagement – Lizenzmanagement – Inventur$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4a: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4b (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) Die Workspace-Management-Software wird cloudbasiert oder on-premises angeboten. Nennen Sie zwei Vor- und Nachteile einer cloudbasierten Software gegenüber der on-premises. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$b) 4 Punkte Vorteile: – Kosteneinsparung durch geringere Investitionskosten – Stets aktuelle Software – Bessere Skalierbarkeit – Anbieter übernimmt gegebenenfalls die Sicherung der Daten – u. a. Nachteile – Fehlende Verfügbarkeit bei Störung des Internetzuganges – Abhängigkeit vom Cloud-Anbieter – Möglicherweise Speicherung der Daten im Ausland – Ziel für Hackerangriffe – u. a.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4b: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4c (5.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$c) Für die Workspace-Management-Software können die Lizenzen von einem externen Anbieter für 25,00 EUR je Lizenz und Jahr bezogen werden. Für die Eigenentwicklung wird ein Personalaufwand von 12.000 Stunden veranschlagt. Die jährliche Wartung wird mit 140 Stunden pro Jahr über einen Zeitraum von zehn Jahren veranschlagt. Eine Mitarbeiterstunde wird mit dem internen Kostensatz von 75 EUR berechnet. Ab welcher Lizenzanzahl ist die Eigenentwicklung über einen Zeitraum von zehn Jahren günstiger als der Fremdbezug? (Lohnsteigerungen und Erhöhung der Lizenzpreise sollen nicht berücksichtigt werden.) 5 Punkte$txt$, 5.0, 'PUBLISHED', $txt$c) 5 Punkte Jahre Stunden Stundenlohn Eigenfertigung Kosten pro Jahr (bei Preis Lizenz Anzahl (EUR) (EUR) zehn Jahren) in EUR (EUR) Lizenzen 12.000 75,00 900.000,00 10 140 75,00 105.000,00 1.005.000,00 100.500,00 25,00 4.020 Ab 4.020 Lizenzen.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4c: Lösung gemäß Erwartungshorizont', 5.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4d (9.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$d) Sie planen, eine eigene Lösung für eine automatisierte Konfiguration der Standardarbeitsplätze zu programmieren. Aus einer Datenbank werden alle zu konfigurierenden PCs ausgelesen. Danach wird für jeden PC aus der Datenbank die zu installierende Software abgefragt und auf dem PC installiert. Es gibt die folgenden Variablen: PCNr Ganzzahl – Laufvariable SoftwareNr Ganzzahl – Laufvariable Es gibt die folgenden Felder (Array) PCListe[] Stringliste mit den Namen der PC SoftwareListe[] Stringliste mit den Namen der Software Es stehen Ihnen die folgenden Funktionen zur Verfügung: getPC() – liefert eine Liste von PC-Namen aus der Datenbank getSoftware(String)– liefert zu dem angefragten PC eine Liste der zu installierenden Software installSoftware(String, String) Installiert die im ersten String angegebene Software auf dem im zweiten String übergebenen PC Tragen Sie die Anweisungen folgerichtig in das nebenstehende Struktogramm ein. 9 Punkte 1. installSoftware(SoftwareListe [SoftwareNr], PCListe[PCNr]) 2. Solange SoftwareNr < Anzahl der Elemente in SoftwareListe [] 3. PCListe[] = getPC() 4. PCNr = PCNr + 1 5. PCNr = 0 6. SoftwareListe[] = getSoftware(PCListe[PCNr]) 7. SoftwareNr = 0 8. SoftwareNr = SoftwareNr + 1 9. Solange PCNr < Anzahl der Elemente in PCListe[] Abbildung zu Aufgabe 4 d)$txt$, 9.0, 'PUBLISHED', $txt$PCNr = 0; PCListe[] = getPC(); solange PCNr < Anzahl der Elemente in PCListe[]: SoftwareListe[] = getSoftware(PCListe[PCNr]); SoftwareNr = 0; solange SoftwareNr < Anzahl der Elemente in SoftwareListe[]: installSoftware(SoftwareListe[SoftwareNr], PCListe[PCNr]); SoftwareNr = SoftwareNr + 1; danach PCNr = PCNr + 1.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 9.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4d: Lösung gemäß Erwartungshorizont', 9.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4e (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$e) Die Datenbank soll in der Cloud gesichert werden. Berechnen Sie die Zeit in Minuten, die für die Übertragung der 100 MiByte großen Datei bei einer VDSL-Leitung mit 100 Mbit/s download und 40Mbit/s upload benötigt wird. Das Ergebnis ist auf volle Sekunden aufzurunden. Der Rechenweg ist anzugeben. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$e) 4 Punkte Lösung: Upstream: 40.000 kbit/s Dateigröße: 100 Mibyte 100 Byte x 1.024 x 1.024 x 8 Bit/Byte / 40.000.000 bit/s = 20,971 s ~ 21 s$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4e: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  return v_exam;
end $_$;


--
-- Name: FUNCTION uebungspruefung_ap1_2022_fruehjahr_roh(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_ap1_2022_fruehjahr_roh() IS 'Rumpf der echten Prüfung CURRENT_AP1_2022_FRUEHJAHR (erzeugt aus tools/ap1_pruefungsdaten.py durch tools/ap1_migration_erzeugen.py). Vier Szenarien, 100.0 Punkte, 90 Minuten (FULL_EXAM). Nur über uebungspruefung_anlegen(code).';


--
-- Name: uebungspruefung_ap1_2022_herbst_roh(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_ap1_2022_herbst_roh() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $_$
declare
  v_user   uuid := auth.uid();
  v_exam   uuid;
  v_scen   uuid;
  v_frage  uuid;
  v_rubrik uuid;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.user_profile where id = v_user) then
    raise exception 'Kein Profil zu dieser Sitzung.' using errcode = '23503';
  end if;

  -- Wiederholbarkeit: eine offene Prüfung dieser Variante wird fortgesetzt, nicht
  -- verdoppelt -- wie uebungspruefung_anlegen_roh() (0016), nur mit mode = 'FULL_EXAM'
  -- statt 'MINI_EXAM': diese Story ist der erste FULL_EXAM-Nutzer (e01s04, 0007_exam.sql:88).
  select e.id into v_exam
    from public.exam e
   where e.user_id = v_user
     and e.mode = 'FULL_EXAM'
     and e.status = 'IN_PROGRESS'
     and e.title = 'AP1 Herbst 2022 (Originalprüfung)'
   order by e.created_at
   limit 1;
  if v_exam is not null then
    return v_exam;
  end if;

  v_exam := gen_random_uuid();
  insert into public.exam (id, user_id, title, mode, status, duration_minutes,
                           total_points, started_at)
  values (v_exam, v_user, 'AP1 Herbst 2022 (Originalprüfung)', 'FULL_EXAM', 'IN_PROGRESS', 90, 100.0, now());

  -- Szenario 1: Projekt und Wirtschaftlichkeit
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 1, 'Projekt und Wirtschaftlichkeit', $txt$Die Package AG digitalisiert die Herstellung von Wellpappe und erweitert dafür Projektorganisation, Speicher, Netz und Produktionsdatenbank.$txt$, $txt$Die Package AG digitalisiert die Herstellung von Wellpappe und erweitert dafür Projektorganisation, Speicher, Netz und Produktionsdatenbank.$txt$, null, 21);

  -- 1aa (1.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Die Marktsituation der Package AG ist aktuell noch gekennzeichnet durch wenige Anbieter aber viele Nachfrager. aa) Nennen Sie die aktuell vorliegende Marktform. 1 Punkt$txt$, 1.0, 'PUBLISHED', $txt$aa) 1 Punkt Oligopol$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1aa: Lösung gemäß Erwartungshorizont', 1.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1ab (1.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$a) Die Marktsituation der Package AG ist aktuell noch gekennzeichnet durch wenige Anbieter aber viele Nachfrager. ab) Es ist jedoch festzustellen, dass immer mehr Anbieter auf den Markt drängen. Nennen Sie die neue Marktform, mit der die Package AG zukünftig rechnen sollte? 1 Punkt$txt$, 1.0, 'PUBLISHED', $txt$ab) 1 Punkt Polypol$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1ab: Lösung gemäß Erwartungshorizont', 1.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1b (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$b) Um bei dem komplexen Vorhaben den Überblick zu behalten, legt die Arbeitsgruppe Projektschritte (z. B. Projektinitiierung) fest. Beschreiben Sie in nachvollziehbaren Stichpunkten zu jedem Projektschritt einen inhaltlichen Aspekt, der durchzuführen ist. 6 Punkte Projektschritte, z. B. Inhaltlicher Aspekt, z. B. 1. Projektinitiierung Identifikation eines Problembereiches 2. Beschreibung des Istzustands 3. Definition des Sollkonzepts 4. Planung 5. Umsetzung 6. Überprüfung der Zielerreichung 7. Ausblick$txt$, 6.0, 'PUBLISHED', $txt$b) 6 Punkte Projektschritte, z. B. Inhaltlicher Aspekt, z. B. 1. Projektinitiierung Identifikation eines Problembereiches 2. Beschreibung des Istzustands Nachteile beim aktuellen Ablauf 3. Definition des Sollkonzepts Ziel der verbesserten Abläufe festlegen 4. Planung Modellierung der Phasen 5. Umsetzung Einführung der geänderten Abläufe 6. Überprüfung der Zielerreichung Prüfung der durch die Prozessänderung erreichten Wirkung 7. Ausblick Fixierung weiterer Möglichkeiten der Prozessoptimierung$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1b: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1c (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$c) „Stakeholder“ beeinflussen die Machbarkeit von Projekten. Beschreiben Sie drei Gruppen von Stakeholdern mit deren Einfluss auf das Projekt. 3 Punkte$txt$, 3.0, 'PUBLISHED', $txt$c) 3 Punkte z. B. Anteilseigner: Bereitschaft zur Finanzierung des Projekts Mitarbeiter: Akzeptanz des Projekts bei der Durchführung Lieferanten: Realisierbarkeit vollautomatisierter Bestellungen$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1c: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1d (5.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$d) In der Projektgruppe wird die Einbindung eines externen Projektberaters diskutiert. Welche Vorteile und Nachteile sind damit verbunden? Nennen Sie insgesamt fünf Vor- und/oder Nachteile, z. B. zwei Vorteile und drei Nachteile. 5 Punkte Vorteile: Nachteile:$txt$, 5.0, 'PUBLISHED', $txt$d) 5 Punkte Vorteile Nachteile z. B. z. B. – mehr Erfahrung des externen Beraters – zusätzliche Kosten aufgrund dessen Spezialisierung – Know-how außerhalb des Unternehmens – geringere Zusatzbelastung des Personals – Abhängigkeit von externen Stellen – normkonforme Lösungen – fehlende Kenntnisse über interne Abläufe und – höhere Methodenkompetenz Strukturen – bessere Risikoeinschätzung – mehr Schnittstellen in der Kommunikation – zusätzlicher Aufwand mit Datenschutz, z. B. Zutrittskontrolle$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1d: Lösung gemäß Erwartungshorizont', 5.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1e (5.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$e) Alternativ zu internen Fachkräften kann aus dem Büro des Projektberaters vergleichbares Personal zu einem effektiven Stundensatz von 85 EUR beauftragt werden. Berechnen Sie den effektiven Stundensatz der internen Fachkräfte mit nachfolgenden Angaben: – 260 Arbeitstage pro Jahr, – 7,8 Std. pro Tag, – 30 Urlaubstage pro Jahr, – 5 Krankheitstage pro Jahr, – 5 Feiertage pro Jahr, – Jahreskosten eines Arbeitnehmers 140.000 EUR 5 Punkte$txt$, 5.0, 'PUBLISHED', $txt$e) 5 Punkte 140.000 EUR / ((260 – 30 – 5 – 5) * 7,8) = 81,59 EUR$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1e: Lösung gemäß Erwartungshorizont', 5.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 1f (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$f) Es stellt sich die Frage, ob mit dem Projektberater ein Dienstvertrag oder Werkvertrag abgeschlossen werden soll. Geben Sie eine begründete Empfehlung. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$f) 2 Punkte Werkvertrag, da dieser ergebnisabhängig ist, bei einem Dienstvertrag genügt die Arbeitsleistung.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '1f: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');


  -- Szenario 2: Scandaten speichern und kennzeichnen
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 2, 'Scandaten speichern und kennzeichnen', $txt$Die Package AG digitalisiert die Herstellung von Wellpappe und erweitert dafür Projektorganisation, Speicher, Netz und Produktionsdatenbank.$txt$, $txt$Die Package AG digitalisiert die Herstellung von Wellpappe und erweitert dafür Projektorganisation, Speicher, Netz und Produktionsdatenbank.$txt$, null, 22);

  -- 2a (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Ermitteln Sie zunächst die Zahl der Scans/Aufnahmen pro Tag. Der Rechenweg ist anzugeben. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$a) 2 Punkte Zahl der Aufnahmen pro Tag: Anzahl der Scanner auf 508 mm Breite 1 Scanner mit einer Breite von 50,8 cm Anzahl der Aufnahmen bei 30,48 m Karton pro Minute 100 Aufnahmen pro Scanner zu 30,48 cm pro Minute Anzahl der Aufnahmen pro Stunde 6.000 pro Stunde = 1 Scanner * 100 Aufnahmen pro Minute * 60 Minuten Anzahl der Aufnahmen pro Arbeitstag von 12 Stunden 72.000 pro Tag = 6.000 * 12 Stunden Ergebnis: 72.000 Aufnahmen/Tag$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2a: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2ba (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) Die Daten der Scans werden ein Tag für Auswertungen zur Qualitätskontrolle gespeichert. ba) Ermitteln Sie das zu speichernde Datenvolumen in MiB pro Scan. Der Rechenweg ist anzugeben. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$ba) 4 Punkte Datenvolumen pro Scan inch/cm 2,54 Bildpunkte/Pixel 400 Werte in inch Bildpunkte Breite in cm 50,80 20 8.000 Länge in cm 30,48 12 4.800 Pixel/Scan 38.400.000 Pixel 1 Punkt 16 Bit Farbtiefe 16 614.400.000 Bit 1 Punkt durch 8 76.800.000 Byte 1 Punkt durch 1.024 75.000,00 KiB 0,5 Punkte durch 1.024 73,25 MiB 0,5 Punkte$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2ba: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2bb (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$b) Die Daten der Scans werden ein Tag für Auswertungen zur Qualitätskontrolle gespeichert. bb) Ermitteln Sie anschließend das gesamte zu speichernde Datenvolumen pro Tag in TiB. Runden Sie das Ergebnis auf volle TiB auf. Der Rechenweg ist anzugeben. 2 Punkte Hinweis: Sollten Sie die Aufgabe a) oder die Teilaufgabe ba) nicht gelöst haben, gehen Sie von 100.000 Scans/Aufnahmen pro Tag und 70 MiB Datenvolumen pro Scan aus.$txt$, 2.0, 'PUBLISHED', $txt$bb) 2 Punkte Datenvolumen pro Tag Scan/Tag 72.000 pro Tag MiB pro Scan 73,25 5.274.000,00 MiB 0,5 Punkte durch 1.024 5.150,39 GiB 0,5 Punkte durch 1.024 5,029678345 TiB 0,5 Punkte aufgerundet 6 TiB 0,5 Punkte Ersatzrechnung mit 100 MiB Scan/Tag 100.000 pro Tag MiB pro Scan 70 7.000.000,00 MiB 0,5 Punkte durch 1.024 6.835,94 GiB 0,5 Punkte durch 1.024 6,675720215 TiB 0,5 Punkte aufgerundet 7 TiB 0,5 Punkte$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2bb: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2ca (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$c) In Abstimmung mit der IT-Leitung beschließen Sie, ein redundantes Speichersystem einzurichten. Dazu sind folgende Komponenten verfügbar: – 2 Festplatten (je 3 TB Speicherkapazität) – 7 Festplatten (je 2 TB Speicherkapazität) – PCl RAID-Hostadapter ca) Mit allen vorhandenen Festplatten soll eine fehlertolerante RAID 5-Konfiguration erstellt werden, welche die größtmögliche Nettospeicherkapazität biete. Berechnen Sie die maximale Nettospeicherkapazität in TB. Der Rechenweg ist anzugeben. 4 Punkte RAID-Level: Netto-Speicherkapazität: Rechenweg:$txt$, 4.0, 'PUBLISHED', $txt$ca) 4 Punkte Rechenweg: Nutzung der kleinsten gemeinsamen Kapazität der Platten. (2 Punkte) (9 - 1) x 2 TB = 16 TB Nettospeicherkapazität: 16 TB (2 Punkte)$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2ca: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2cb (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$c) In Abstimmung mit der IT-Leitung beschließen Sie, ein redundantes Speichersystem einzurichten. Dazu sind folgende Komponenten verfügbar: – 2 Festplatten (je 3 TB Speicherkapazität) – 7 Festplatten (je 2 TB Speicherkapazität) – PCl RAID-Hostadapter cb) Für einen Vergleich soll auch die Speicherkapazität berechnet werden, wenn man die gegebenen Festplatten als JBOD (Zusammenfassung aller Festplatten zu einem logischen Volume) nutzt. Ermitteln Sie die erreichbare Speicherkapazität in TB. Der Rechenweg ist anzugeben. 2 Punkte Speicherkapazität in TiB: Rechenweg:$txt$, 2.0, 'PUBLISHED', $txt$cb) 2 Punkte 20 TiB Rechenweg: 2 x 3 TiB = 6 TiB 7 x 2 TiB = 14 TiB 6 TiB + 14 TiB = 20 TiB$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2cb: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2cc (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$c) In Abstimmung mit der IT-Leitung beschließen Sie, ein redundantes Speichersystem einzurichten. Dazu sind folgende Komponenten verfügbar: – 2 Festplatten (je 3 TB Speicherkapazität) – 7 Festplatten (je 2 TB Speicherkapazität) – PCl RAID-Hostadapter cc) Beschreiben Sie zwei Vorteile, die ein Laufwerksverbund als JBOD gegenüber einem RAID 0 bietet. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$cc) 4 Punkte – Ein RAID-Controller ist nicht erforderlich. – Volle Ausnutzung der Speicherkapazitäten bei unterschiedlichen Plattengrößen. – Keine identischen Platten erforderlich. – Relativ einfache Erweiterung möglich. – Die Nennung weiterer Vorteile ist möglich.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2cc: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2d (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$d) Die im Netzwerk der Hauptverwaltung eingesetzten NAS-Speichersysteme sollen durch ein SAN (Storage Area Network) abgelöst werden. Nennen Sie drei Vorteile, die den Einsatz begründen. 3 Punkte$txt$, 3.0, 'PUBLISHED', $txt$d) 3 Punkte – SAN besitzt höhere Performance – Erlaubt zeitnahe Datensicherung – Ein SAN arbeitet blockorientiert und für alle Anwendungen und Betriebssysteme kompatibel – Sehr gute Ressourcenauslastung, da viele Systeme gleichzeitig zugreifen können – Besonders geeignet für häufige Zugriffe – Bietet Maximum an Skalierbarkeit – Unabhängig vom Standort und zentraler Verwaltung – Unterbrechungsfreie Online-Erweiterung von Daten-Volumen möglich – Die Verwaltung des SAN kann vom Arbeitsplatz des Administrators geschehen – u. a.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2d: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 2e (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 8, $txt$e) Für die Kennzeichnung der produzierten Kartonrollen durch einen maschinenlesbaren Aufkleber schlägt die Geschäftsleitung die Verwendung von Barcode, QR-Code oder RFID-Chips vor. Stellen Sie jeweils einen Vor- und Nachteil der Kennzeichnung mit QR-Code bzw. RFID-Chips in folgender Tabelle gegenüber. 4 Punkte Kennzeichnung Vorteil Nachteil Barcode z. B.: – Kann bei Verschmutzung oder Sichtbehinde- – Einfach zu erstellen rung nicht gelesen werden – Kostengünstig – Relativ umfangreiche Zeichenfolge für Barcode QR-Code RFID-Chip$txt$, 4.0, 'PUBLISHED', $txt$e) 4 Punkte pro offenes Feld 1 Punkt Kennzeichnung Vorteil Nachteil Barcode z. B.: – Kann bei Verschmutzung oder Sicht – einfach zu erstellen behinderung nicht gelesen werden – kostengünstig – Relativ umfangreiche Zeichenfolge für Barcode QR-Code – einfach zu erstellen – kann bei Verschmutzung oder Sicht – Kostengünstig behinderung nicht gelesen werden – umfangreiche Datenmenge zur Beschreibung möglich RFID-Chip – Auslesen auch ohne direkten – relativ aufwendig in der Herstellung Sichtkontakt möglich der RFID-Chips – umfangreiche Datenmenge zur – kostenintensiv Beschreibung möglich$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '2e: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');


  -- Szenario 3: IPv6 für die Maschinenautomatisierung
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 3, 'IPv6 für die Maschinenautomatisierung', $txt$Für die IoT-Testumgebung steht das IPv6-Präfix 2001:da8:5f2d::/48 bereit. Die Netz-ID ist 16 Bit lang; daraus wurde für das Testnetz die IPv6-Adresse 2001:da8:5f2d:28::/64 gebildet. Ein Router verbindet über einen Switch Sensor, Steuerung und Industrie-PC.$txt$, $txt$Die Package AG digitalisiert die Herstellung von Wellpappe und erweitert dafür Projektorganisation, Speicher, Netz und Produktionsdatenbank.$txt$, null, 25);

  -- 3a (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Zur fachgerechten Kommunikation zwischen den Einzelkomponenten in der Automatisierung wird über den Einsatz von IPv6 als Ersatz für IPv4 nachgedacht. Nennen Sie zwei technologische Vorteile der IPv6-Adressierung gegenüber IPv4, die für den Einsatz im Bereich IoT relevant sein können. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$a) 2 Punkte Z. B. – Nahezu uneingeschränkte Adresszahl – Weltweite Erreichbarkeit einzelner Komponenten – Verbesserte Integration von Sicherheitsmaßnahmen wie IPSec – Verschlankung des Protokoll-Headers$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3a: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3b (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$b) In einer abgeschlossenen Testumgebung soll die Kommunikation zwischen einigen Netzwerkkomponenten über IPv6 geprüft werden. Dabei soll eine globale Adresse ähnlich derjenigen aus einem anderen Teilnetz des Betriebs 2001:da8:5f2d:28::/64 verwendet werden. Hier handelt es sich bereits um eine verkürzte Schreibweise. Sie besteht aus einem 48-Bit langem Standortpräfix und einer 16-Bit Teilnetz-ID. Identifizieren Sie in der gegebenen Adresse die beiden genannten Komponenten und geben Sie die beiden Teile der Adresse in ihrer ungekürzten Form im hexadezimalen Format an. 4 Punkte Ungekürztes Standortpräfix: Ungekürzte Teilnetz-ID:$txt$, 4.0, 'PUBLISHED', $txt$b) 4 Punkte (je 2unkte) Ungekürztes Standortpräfix: 2001:0da8:5f2d Ungekürzte Teilnetz-ID: 0028$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3b: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3c (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$c) Geben Sie an, wie viele Teilnetze mit der gegebenen IPv6-Adresse gebildet werden können. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$c) 2 Punkte 2^16$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3c: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3d (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$d) Vergeben Sie für die abgebildete IoT-Testumgebung nutzbare IPv6-Adressen auf der Grundlage der gegebenen globalen Adresse für alle Geräte. Vermischen Sie dabei aus Gründen der Übersichtlichkeit nicht die Adressen der Endgeräte mit denen der Netzwerkgeräte. Richten Sie die IP-Adressierung so ein, dass alle Geräte später auch aus einem anderen Teilnetz über den Router gewartet werden können. 6 Punkte

--- Anlage: IoT-Testumgebung ---
Ein Router ist mit einem Switch verbunden. Am Switch hängen ein Sensor mit Netzwerkschnittstelle, eine Steuerung mit Netzwerkschnittstelle und ein Industrie-PC; alle Geräte müssen adressiert und über den Router erreichbar sein.$txt$, 6.0, 'PUBLISHED', $txt$d) 6 Punkte 2001:da8:5f2d:29::1/64 Sensor mit Steuerung mit Industrie-PC Netzwerkanschluss Netzwerkanschluss Andere Lösungen sind möglich.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3d: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'NETZWERKDIAGRAMM', 1, 'IoT-Testumgebung', $txt$Ein Router ist mit einem Switch verbunden. Am Switch hängen ein Sensor mit Netzwerkschnittstelle, eine Steuerung mit Netzwerkschnittstelle und ein Industrie-PC; alle Geräte müssen adressiert und über den Router erreichbar sein.$txt$);

  -- 3e (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$e) Auf dem IoT-Gerät 1 soll nun die Erreichbarkeit des Loopback-Interfaces und des Standard-Gateways auf einer Kommandozeile geprüft werden. Geben Sie die erforderlichen Befehle an. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$e) 2 Punkte z. B. ping ::1, ping 2001:da8:5f2d:29::1$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3e: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3f (2.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$f) Nach der Eingabe des Befehls ip addr zur Anzeige der Netzwerkkonfiguration erscheint u. a. die Ausgabe fe80::62eb:69ff:fed2:d2a6/64 Geben Sie den Grund dafür an, dass eine IPv6-Adresse angezeigt wird, die Sie nicht konfiguriert hatten und benennen Sie dabei die Adressart. 2 Punkte$txt$, 2.0, 'PUBLISHED', $txt$f) 2 Punkte Es handelt sich um eine automatisch vergebene Link-Local-(Unicast)-Adresse.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3f: Lösung gemäß Erwartungshorizont', 2.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 3g (10.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$g) Die Geschäftsführung möchte im Umfeld der Maschinenautomatisierung die Mitarbeiter mit weiteren mobilen und robusten Geräten ausstatten. Der Bedarf beträgt im ersten Schritt 30 Stück. Folgende drei unverbindliche Angebote liegen vor: Noteplus AG, Notebook-Clever.de, PC-Genie KG, Mainz Berlin Frankfurt Bareinkaufspreis pro Stück 1.000 EUR 1.100 EUR 1.300 EUR Lieferbedingungen/-kosten pro Stück Ab Werk: 15 EUR Frachtfrei: 10 EUR Frei Haus Bezugspreis pro Stück Lieferzeit 5 Wochen 3 Wochen 1 Woche Qualität Gut Durchschnitt Sehr gut Kundenrückmeldungen auf der Homepage Öfter bei Lieferungen Lieferung ohne Sehr gutes der Lieferanten kleine Mängel Beanstandung Kulanzverhalten Berechnen Sie zuerst den Bezugspreis pro Stück. Bewerten Sie anschließend die Anbieter und Angebote mit einer Skala von 1 (schwach) bis 3 (sehr gut). Führen Sie mithilfe der vorliegenden Daten einen gewichteten Angebotsvergleich durch und entscheiden Sie sich für den geeigneten Lieferanten. 10 Punkte Kriterien Gewichtung Noteplus AG, Notebook-Clever.de, PC-Genie KG, Mainz Berlin Frankfurt Bezugspreis 11 Lieferzeit 8 Qualität 9 Erfahrung 5$txt$, 10.0, 'PUBLISHED', $txt$g) 10 Punkte Kriterien Gewichtung Noteplus AG, Mainz Notebook-Clever.de, PC-Genie KG, Berlin Frankfurt Bezugspreis 11 3 33 2 22 1 11 Lieferzeit 8 1 8 2 16 3 24 Qualität 9 2 18 1 9 3 27 Erfahrung 5 1 5 2 10 3 15 64 57 77$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 10.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '3g: Lösung gemäß Erwartungshorizont', 10.0, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');


  -- Szenario 4: Produktionsdaten abfragen und verarbeiten
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 4, 'Produktionsdaten abfragen und verarbeiten', $txt$Die Package AG digitalisiert die Herstellung von Wellpappe und erweitert dafür Projektorganisation, Speicher, Netz und Produktionsdatenbank.$txt$, $txt$Die Package AG digitalisiert die Herstellung von Wellpappe und erweitert dafür Projektorganisation, Speicher, Netz und Produktionsdatenbank.$txt$, null, 22);

  -- 4aa (3.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$a) Sie erhalten den Auftrag, Produktionsdaten an die Steuerung der Walzanlage zu übergeben. Die Produktionsdaten werden in einer SQL-Datenbank gespeichert. Alle Datentypen sind Ganzzahlen. Die Breite, Länge und Dicke der Wellpappe wird in der Datenbank in Millimeter gespeichert. Die Tabelle ProductionData hat den folgenden Aufbau: OrderID (PK) Width Length Thickness Quantity aa) Geben Sie den SQL-Befehl an, der die Breite, die Länge, die Dicke und die Anzahl der OrderID 736298 ausgibt. Die OrderID soll nicht in der Ergebnismenge enthalten sein. 3 Punkte$txt$, 3.0, 'PUBLISHED', $txt$aa) 3 Punkte SELECT Width, Length, Thickness, Quantity FROM ProductionData WHERE OrderID = 736298;$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4aa: Lösung gemäß Erwartungshorizont', 3.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4ab (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$a) Sie erhalten den Auftrag, Produktionsdaten an die Steuerung der Walzanlage zu übergeben. Die Produktionsdaten werden in einer SQL-Datenbank gespeichert. Alle Datentypen sind Ganzzahlen. Die Breite, Länge und Dicke der Wellpappe wird in der Datenbank in Millimeter gespeichert. Die Tabelle ProductionData hat den folgenden Aufbau: OrderID (PK) Width Length Thickness Quantity ab) Wie viele Produktionsaufträge für Wellpappen mit einer Dicke von 2 mm wurden bisher in der Datenbank gespeichert. Geben Sie dazu den entsprechenden SQL-Befehl an. 4 Punkte$txt$, 4.0, 'PUBLISHED', $txt$ab) 4 Punkte SELECT Thickness, COUNT(*) As „Anzahl Wellpappen“ FROM ProductionData GROUP BY Thickness Having Thickness = 2;$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4ab: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4ac (4.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$a) Sie erhalten den Auftrag, Produktionsdaten an die Steuerung der Walzanlage zu übergeben. Die Produktionsdaten werden in einer SQL-Datenbank gespeichert. Alle Datentypen sind Ganzzahlen. Die Breite, Länge und Dicke der Wellpappe wird in der Datenbank in Millimeter gespeichert. Die Tabelle ProductionData hat den folgenden Aufbau: OrderID (PK) Width Length Thickness Quantity ac) Geben Sie die Gesamtanzahl gefertigter Wellpappen aus der Datenbank an, die mit einer Dicke von 2 mm, einer Breite von 200 mm und einer Länge von 300 mm gefertigt worden sind. Geben Sie dazu den entsprechenden SQL-Befehl an. 4 Punkte Dieses Blatt kann an der Perforation aus dem Aufgabensatz herausgetrennt werden! SQL-Syntax Fortsetzung SQL-Syntax $txt$, 4.0, 'PUBLISHED', $txt$ac) 4 Punkte SELECT SUM(Quantity) AS „Gesamtanzahl“ FROM ProductionData WHERE width = 200 AND length = 300 AND Thickness = 2 GROUP BY width; Hinweis für den Prüfer: statt GROUP BY width geht auch GROUP BY length oder GROUP BY Thickness;$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4ac: Lösung gemäß Erwartungshorizont', 4.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4b (7.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$b) Die abgefragten Produktionsdaten werden über eine entsprechende API an die Steuerung der Walzanlage übergeben. Die Auftragsdaten werden im Array result[] mit dem Index 0 bis 3 gespeichert. Sie sollen jetzt an die Steuerung der Walzanlage durch eine von Ihnen zu erstellende Funktion übergeben werden. Gehen Sie von einem Array result[] aus, bei dem im Index 0 die Breite, im Index 1 die Länge, im Index 2 die Dicke und im Index 3 die Anzahl der zu produzierenden Wellpappen stehen. Erstellen Sie die Funktion „launchTask(result[])“. Zur Kommunikation mit der Steuerung der Walzanlage stehen Ihnen die folgenden API-Funktionen zur Verfügung: setRollerDim(int,int,int) – Übergeben wird Breite, Länge und Dicke der Wellpappe. rollerStart() – Startet einen Auftrag von einem Stück. Es wird eine Wellpappe mit den gesetzten Parametern erzeugt. Die Walzanlage verfügt über einen Notausschalter. Sie darf nur laufen, wenn der Notaus nicht ausgelöst ist. Der Status des Notausschalters kann mit der Funktion bool getEmergencyStop() abgefragt werden, der „true“ liefert wenn der Notaus ausgelöst ist und „false“ wenn der Notaus nicht ausgelöst ist. Ergänzen Sie das gegebene Struktogramm durch die entsprechenden Befehle zur Produktion der geforderten Anzahl von Wellpappen (siehe Index 3) in den angegebenen Maßen (siehe Index 0, 1 und 2). 7 Punkte $txt$, 7.0, 'PUBLISHED', $txt$b) 7 Punkte Zeile 4, 6 und 8 je 1 Punkt, Zeile 5 und 7 je 2 Punkte Hinweis: Die Zeilen 6, 7 und 8 dürfen in der Reihenfolge vertauscht werden.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 7.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4b: Lösung gemäß Erwartungshorizont', 7.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4c (6.0 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$c) Für die Produktion von Wellpappen ist die vorhandene Datenbank zu erweitern. Die Firma hat sich für ein SQL-fähiges relationales Datenbanksystem entschieden, in der die nachfolgenden Bedingungen berücksichtigt werden sollen. Die Speicherung der Datenbank wird auf dem Hostrechner „Steuerungs-PC“ realisiert. In einer ersten Unterredung werden die zu speichernden Informationen definiert. In dieser Datenbank sollen nur die Zusammenhänge zwischen den Walzanlagen, den Produktionsdaten abgebildet werden. In der Produktionshalle sind mehrere Walzanlagen vorhanden. Diese jeweiligen Walzanlagen können Wellpappen mit unterschiedlichen Dicken (z. B. kleiner 4 mm, 4-8 mm, 8-12 mm) herstellen. In der Datenbank soll gespeichert werden, welche Walzanlage für welche Dicken (Spezifikation) verwendet werden kann. Außerdem soll das Baujahr, die Bezeichnung und eine eindeutige Maschinennummer gespeichert werden. Für jede Walzanlage sollen die entsprechenden Produktionsdaten (Breite, Länge, Dicke und Anzahl) mit dem jeweiligen Zeitstempel abgespeichert werden. Vervollständigen Sie das vorgegebene Entity-Relationship-Modell (kurz: ERM) für diese Datenbank mit allen erforderlichen Attributen und Kardinalitäten. 6 Punkte Hinweis: Die eventuell benötigten Fremdschlüssel müssen nicht in diesem Entwurf eingetragen werden. Die Kardinalität zwischen den beiden Tabellen soll auf die entsprechenden Beziehungslinien eingetragen werden. Hinweise: Tabelle (Chen-Notation) Bezeichnung Darstellung Entity-Typ Attribut Primärschlüssel Beziehung (Relation, Relationship, Assoziation) PK bezeichnet ein Primärschlüsselattribut, FK ein Fremdschlüsselattribut, Primärschlüsselattribute werden unterstrichen, Fremdschlüsselattribute werden durch ein nachgestelltes Hash-Zeichen (#) kenntlich gemacht.$txt$, 6.0, 'PUBLISHED', $txt$c) 6 Punkte Lösung: Kardinaliät: 1 Punkt Kennzeichnung Primärschlüssel in beiden Tabelle 2 Punkte Attribute: 3 Punkte$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6.0);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, '4c: Lösung gemäß Erwartungshorizont', 6.0, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  return v_exam;
end $_$;


--
-- Name: FUNCTION uebungspruefung_ap1_2022_herbst_roh(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_ap1_2022_herbst_roh() IS 'Rumpf der echten Prüfung CURRENT_AP1_2022_HERBST (erzeugt aus tools/ap1_pruefungsdaten.py durch tools/ap1_migration_erzeugen.py). Vier Szenarien, 100.0 Punkte, 90 Minuten (FULL_EXAM). Nur über uebungspruefung_anlegen(code).';


--
-- Name: uebungspruefung_ap1_2025_fruehjahr_roh(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_ap1_2025_fruehjahr_roh() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $_$
declare
  v_user   uuid := auth.uid();
  v_exam   uuid;
  v_scen   uuid;
  v_frage  uuid;
  v_rubrik uuid;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.user_profile where id = v_user) then
    raise exception 'Kein Profil zu dieser Sitzung.' using errcode = '23503';
  end if;

  -- Wiederholbarkeit: eine offene Pruefung dieser Variante wird fortgesetzt, nicht
  -- verdoppelt -- wie uebungspruefung_anlegen_roh() (0016), nur mit mode = 'FULL_EXAM'
  -- statt 'MINI_EXAM': diese Story ist der erste FULL_EXAM-Nutzer (e01s04, 0007_exam.sql:88).
  select e.id into v_exam
    from public.exam e
   where e.user_id = v_user
     and e.mode = 'FULL_EXAM'
     and e.status = 'IN_PROGRESS'
     and e.title = 'AP1 Fruehjahr 2025 (Originalpruefung)'
   order by e.created_at
   limit 1;
  if v_exam is not null then
    return v_exam;
  end if;

  v_exam := gen_random_uuid();
  insert into public.exam (id, user_id, title, mode, status, duration_minutes,
                           total_points, started_at)
  values (v_exam, v_user, 'AP1 Fruehjahr 2025 (Originalpruefung)', 'FULL_EXAM', 'IN_PROGRESS', 90, 100, now());

  -- Szenario 1: Auswahl und Anschluss eines Multifunktionsgeraets
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 1, 'Auswahl und Anschluss eines Multifunktionsgeraets', $txt$In der Kanzlei sollen neue Multifunktionsgeraete angeschafft werden. Die Kanzlei druckt im Monat ca. 2.000 Seiten Schwarz/Weiss und 500 Seiten Farbe. Die Kanzleileitung legt grossen Wert auf eine hohe Druckqualitaet, geringe Wartungskosten und eine hohe Druck- bzw. Scangeschwindigkeit.

Ihnen werden drei verschiedene Modelle mit folgenden technischen Daten angeboten:

Kriterium | Multifunktionsgeraet 1 | Multifunktionsgeraet 2 | Multifunktionsgeraet 3
Geschwindigkeit Druck | 40 Seiten/min | 62 Seiten/min | 50 Seiten/min
Geschwindigkeit Scan | 20 Seiten/min | 50 Seiten/min | 40 Seiten/min
Druckqualitaet | 1.200x1.200 dpi | 1.200x1.200 dpi | 1.200x1.200 dpi
Wartungskosten | 50 EUR/Monat | 10 EUR/Monat | 15 EUR/Monat
Tonermenge | 10.000 Seiten/SW | 8.000 Seiten/SW | 6.000 Seiten/SW
Preis | 3.456 EUR | 2.844 EUR | 1.656 EUR$txt$, $txt$Drei Rechtsanwaelte sind gerade dabei, eine Gemeinschaftskanzlei zu eroeffnen. Ihr gemeinsames Bestreben besteht darin, die bestmoegliche Betreuung ihrer Mandanten durch Nutzung der aktuellen technischen Moeglichkeiten zu bieten. Da Ihr Ausbildungsbetrieb, die Innova DVTech 2000 OHG, als innovatives Beratungsunternehmen im IT-Support bekannt ist, erhalten Sie den Auftrag der IT-technischen Betreuung.$txt$, 'HARDWAREVERGLEICH', 23);

  -- 1aa (6 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$Vervollstaendigen Sie anhand der vorliegenden Werte die Entscheidungsmatrix zur Auswahl des geeignetsten Multifunktionsgeraets. Bestimmen Sie fuer die Kriterien Geschwindigkeit Druck, Geschwindigkeit Scan, Wartungskosten und Preis jeweils eine Rangfolge der drei Geraete (3 = bester Wert, 1 = schlechtester Wert) und bilden Sie je Geraet die Summe (Ergebnis).$txt$, 6, 'PUBLISHED', $txt$Geschwindigkeit Druck: MFG1=1, MFG2=3, MFG3=2. Geschwindigkeit Scan: MFG1=1, MFG2=3, MFG3=2. Wartungskosten (niedriger ist besser): MFG1=1, MFG2=3, MFG3=2. Preis (niedriger ist besser): MFG1=1, MFG2=2, MFG3=3. Ergebnis (Summe): MFG1=4, MFG2=11, MFG3=9 -- Multifunktionsgeraet 2 hat die hoechste Punktzahl.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Rangfolge und Summe je Geraet korrekt', 6, 'QUALITATIVE', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- 1ab (1 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status)
  values (v_frage, v_user, v_scen, 2, $txt$Nennen Sie das Geraet, das Sie aufgrund der Entscheidungsmatrix auswaehlen.$txt$, 1, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value, accepted_alternatives)
  values (v_user, v_rubrik, 1, 'Geraet korrekt benannt', 1, 'DETERMINISTIC', 'LF2.C1', 'TABELLENWERT', '{"value": "Multifunktionsgeraet 2"}'::jsonb, array['MFG 2','Geraet 2','Multifunktionsgeraet 2 (MFG 2)','Modell 2','Multifunktionsgerät 2']);
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- 1ac (3 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$Das gewaehlte Geraet soll gekauft werden. Fuer den Druck fallen komplett 0,05 EUR pro Seite Schwarz/Weiss und 0,07 EUR pro Seite Farbe an, bei einer Nutzungsdauer von 36 Monaten. Berechnen Sie die Kosten je Monat mit Angabe des Rechenwegs unter der Voraussetzung, dass das Multifunktionsgeraet drei Jahre genutzt wird. Runden Sie das Ergebnis auf ganze EUR.$txt$, 3, 'PUBLISHED', $txt$Druckkosten pro Monat: 2.000 Seiten x 0,05 EUR + 500 Seiten x 0,07 EUR = 100 EUR + 35 EUR = 135 EUR. Anschaffungskosten je Monat: 2.844 EUR / 36 Monate = 79 EUR. Wartungskosten: 10 EUR/Monat. Gesamtkosten je Monat: 135 + 79 + 10 = 224 EUR.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Monatliche Gesamtkosten mit Rechenweg korrekt', 3, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 1b (4 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$Nach der Beschaffung sollen die Multifunktionsgeraete vor Ort eingerichtet werden. Ordnen Sie die vier abgebildeten Anschluesse (RJ45, USB Typ A, USB Typ C, Kaltgeraetebuchse) den Abbildungen 1 bis 4 zu.

--- Anlage: Abbildungen der vier Anschlussbuchsen ---
Abbildung 1: schmale, laengliche, symmetrisch abgerundete Steckbuchse ohne erkennbare Ausrichtungsnase (kapselfoermig). Abbildung 2: kleines, kastenfoermiges Gehaeuse mit acht parallelen Kontaktstiften in einer Reihe und seitlicher Rastnase. Abbildung 3: rechteckiges Gehaeuse mit drei quadratisch angeordneten Kontaktoeffnungen fuer ein Kaltgeraetekabel. Abbildung 4: flache, rechteckige Steckbuchse mit sichtbarem innerem Metallsteg, breiter als hoch. (Das Originalaufgabenblatt zeigt hier Abbildungen; die Textbeschreibung tritt an ihre Stelle.)$txt$, 4, 'PUBLISHED', $txt$Nach Bauform: USB Typ C = Abbildung 1, RJ45 = Abbildung 2, Kaltgeraetebuchse = Abbildung 3, USB Typ A = Abbildung 4. Die Zuordnung von Abbildung 1 und 4 (USB Typ C vs. USB Typ A) traegt eine Restunsicherheit aus der Bildvorlage.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Alle vier Anschluesse korrekt zugeordnet', 4, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Abbildungen der vier Anschlussbuchsen', $txt$Abbildung 1: schmale, laengliche, symmetrisch abgerundete Steckbuchse ohne erkennbare Ausrichtungsnase (kapselfoermig). Abbildung 2: kleines, kastenfoermiges Gehaeuse mit acht parallelen Kontaktstiften in einer Reihe und seitlicher Rastnase. Abbildung 3: rechteckiges Gehaeuse mit drei quadratisch angeordneten Kontaktoeffnungen fuer ein Kaltgeraetekabel. Abbildung 4: flache, rechteckige Steckbuchse mit sichtbarem innerem Metallsteg, breiter als hoch. (Das Originalaufgabenblatt zeigt hier Abbildungen; die Textbeschreibung tritt an ihre Stelle.)$txt$);

  -- 1c (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status)
  values (v_frage, v_user, v_scen, 5, $txt$Auf den Multifunktionsgeraeten sind zwei Symbole abgebildet (siehe Abbildung). Benennen Sie die beiden Symbole.

--- Anlage: Zwei Symbole auf dem Geraetegehaeuse ---
Symbol 1: mehrere konzentrische, nach oben offene Bogenlinien ueber einem Punkt. Symbol 2: eine stilisierte Rune aus zwei ineinander verschraenkten spitzen Winkeln.$txt$, 2, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value, accepted_alternatives)
  values (v_user, v_rubrik, 1, 'Symbol 1 korrekt benannt', 1, 'DETERMINISTIC', 'LF2.C2', 'TABELLENWERT', '{"value": "WLAN"}'::jsonb, array['Wi-Fi','WiFi','Wireless LAN']);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value)
  values (v_user, v_rubrik, 2, 'Symbol 2 korrekt benannt', 1, 'DETERMINISTIC', 'LF2.C2', 'TABELLENWERT', '{"value": "Bluetooth"}'::jsonb);
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'SCREENSHOT', 1, 'Zwei Symbole auf dem Geraetegehaeuse', $txt$Symbol 1: mehrere konzentrische, nach oben offene Bogenlinien ueber einem Punkt. Symbol 2: eine stilisierte Rune aus zwei ineinander verschraenkten spitzen Winkeln.$txt$);

  -- 1d (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status)
  values (v_frage, v_user, v_scen, 6, $txt$Die Multifunktionsgeraete werden per LAN eingebunden. Das Geraet „Druckstation 1“ ist im Netz 192.168.100.0/26 nicht erreichbar. Die letzte moegliche IP-Adresse im Netz wird fuer das Gateway genutzt (192.168.100.62), die vorletzte soll fuer „Druckstation 1“ verwendet werden. Geben Sie diese IP-Adresse an.$txt$, 2, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value)
  values (v_user, v_rubrik, 1, 'Vorletzte moegliche Adresse korrekt', 2, 'DETERMINISTIC', 'LF3.C2', 'TABELLENWERT', '{"value": "192.168.100.61"}'::jsonb);
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C2');

  -- 1ea (4 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$Ein Hersteller-Text nennt folgende Massnahmen: eine Security Baseline aus dem Security Compliance Toolkit, starke und einzigartige Passwoerter, eine aktivierte Firewall, regelmaessige automatische Updates sowie eine Memory-Integrity-Funktion gegen speicherbasierte Angriffe. Nennen Sie vier Sicherheitsmassnahmen, die im Text beschrieben werden.$txt$, 4, 'PUBLISHED', $txt$Vier von: (1) Security Baseline / Security Compliance Toolkit installieren, (2) starke, einzigartige Passwoerter verwenden, (3) die integrierte Firewall aktiviert lassen, (4) automatische Updates aktivieren, (5) die Memory-Integrity-Funktion nutzen.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Vier Sicherheitsmassnahmen korrekt genannt', 4, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 1eb (3 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 8, $txt$Es wird vorgeschlagen, allen Benutzern Adminrechte zu geben, damit sie sich seltener beim IT-Support melden muessen. Erlaeutern Sie einen Grund, warum dieses Vorgehen aus Sicherheitsgruenden nicht zu empfehlen ist.$txt$, 3, 'PUBLISHED', $txt$Mit Adminrechten ausgestattete Benutzerkonten fuehren auch Schadprogramme mit denselben weitreichenden Rechten aus; Malware koennte dann ungehindert Systemaenderungen vornehmen oder das gesamte System beschaedigen. Nach dem Prinzip der geringsten Rechte sollten Nutzer nur eingeschraenkte Rechte erhalten und Adminrechte nur temporaer bei Bedarf.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Nachvollziehbarer Sicherheitsgrund genannt', 3, 'QUALITATIVE', 'LF4.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C2');


  -- Szenario 2: Datensicherheit im E-Mail-Verkehr
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 2, 'Datensicherheit im E-Mail-Verkehr', $txt$Die Rechtsanwaelte wuenschen sich die Moeglichkeit, mit ihren Mandanten bei Bedarf auch verschluesselt kommunizieren zu koennen. Sie beraten die Rechtsanwaelte. Die E-Mail-Kommunikation zwischen Rechtsanwalt und Mandanten unterliegt dabei erhoehten Sicherheitsanforderungen.$txt$, $txt$Drei Rechtsanwaelte sind gerade dabei, eine Gemeinschaftskanzlei zu eroeffnen. Ihr gemeinsames Bestreben besteht darin, die bestmoegliche Betreuung ihrer Mandanten durch Nutzung der aktuellen technischen Moeglichkeiten zu bieten. Da Ihr Ausbildungsbetrieb, die Innova DVTech 2000 OHG, als innovatives Beratungsunternehmen im IT-Support bekannt ist, erhalten Sie den Auftrag der IT-technischen Betreuung.$txt$, 'DATENSCHUTZPROBLEM', 18);

  -- 2aa (1 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status)
  values (v_frage, v_user, v_scen, 1, $txt$Nennen Sie eine rechtliche Grundlage fuer die erhoehten Sicherheitsanforderungen der E-Mail-Kommunikation zwischen Rechtsanwalt und Mandant.$txt$, 1, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value, accepted_alternatives)
  values (v_user, v_rubrik, 1, 'Rechtliche Grundlage korrekt genannt', 1, 'DETERMINISTIC', 'LF4.C1', 'TABELLENWERT', '{"value": "DSGVO"}'::jsonb, array['Datenschutz-Grundverordnung','Datenschutzgrundverordnung','GDPR']);
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 2ab (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$Beschreiben Sie den Zweck dieser rechtlichen Grundlage.$txt$, 2, 'PUBLISHED', $txt$Die DSGVO soll personenbezogene Daten vor unbefugtem Zugriff, Veraenderung oder Weitergabe schuetzen und regelt die rechtmaessige Verarbeitung personenbezogener Daten.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Zweck korrekt beschrieben', 2, 'QUALITATIVE', 'LF4.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 2ba (4 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$Ein Anwalt hat von einem Mandanten per E-Mail einen oeffentlichen Schluessel fuer die Einrichtung einer sicheren Kommunikation erhalten. Beschreiben Sie die Vorgehensweise bei der asymmetrischen Verschluesselung und Entschluesselung zur Uebertragung von E-Mails vom Anwalt zum Mandanten anhand der Skizze.

--- Anlage: Skizze zur asymmetrischen Verschluesselung ---
Die Skizze zeigt links den Anwalt mit einem privaten und einem oeffentlichen Schluessel, rechts den Mandanten ebenso mit einem privaten und einem oeffentlichen Schluessel. Ein Pfeil fuehrt von einem Briefsymbol mit geschlossenem Schloss beim Anwalt zu einem Briefsymbol mit geoeffnetem Schloss beim Mandanten.$txt$, 4, 'PUBLISHED', $txt$Der Mandant sendet seinen oeffentlichen Schluessel an den Anwalt. Der Anwalt verschluesselt die E-Mail mit dem oeffentlichen Schluessel des Mandanten. Die verschluesselte E-Mail wird an den Mandanten gesendet. Der Mandant entschluesselt die E-Mail mit seinem privaten Schluessel.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Ablauf von Ver- und Entschluesselung korrekt', 4, 'QUALITATIVE', 'LF4.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C2');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'NETZWERKDIAGRAMM', 1, 'Skizze zur asymmetrischen Verschluesselung', $txt$Die Skizze zeigt links den Anwalt mit einem privaten und einem oeffentlichen Schluessel, rechts den Mandanten ebenso mit einem privaten und einem oeffentlichen Schluessel. Ein Pfeil fuehrt von einem Briefsymbol mit geschlossenem Schloss beim Anwalt zu einem Briefsymbol mit geoeffnetem Schloss beim Mandanten.$txt$);

  -- 2bb (1 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status)
  values (v_frage, v_user, v_scen, 4, $txt$Nennen Sie das IT-Schutzziel, welches durch die beschriebene Verwendung der Schluessel erreicht werden kann.$txt$, 1, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value, accepted_alternatives)
  values (v_user, v_rubrik, 1, 'Schutzziel korrekt genannt', 1, 'DETERMINISTIC', 'LF4.C1', 'TABELLENWERT', '{"value": "Vertraulichkeit"}'::jsonb, array['Confidentiality']);
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C1');

  -- 2bc (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$Nennen Sie einen Vorteil und einen Nachteil der asymmetrischen Verschluesselung im Vergleich zu einer symmetrischen Verschluesselung.$txt$, 2, 'PUBLISHED', $txt$Vorteil: Der geheime (private) Schluessel muss nicht uebertragen werden, nur der oeffentliche Schluessel wird verteilt -- das ist sicherer. Nachteil: Die asymmetrische Verschluesselung ist rechenintensiver und dadurch langsamer als die symmetrische Verschluesselung.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Ein Vorteil und ein Nachteil korrekt genannt', 2, 'QUALITATIVE', 'LF4.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C2');

  -- 2c (4 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$Fuer den praktischen Einsatz der E-Mail-Verschluesselung wird eine Software gesucht. Zur Verfuegung stehen ein Produkt unter einer Open-Source-Lizenz und eine proprietaere Software des Betriebssystem-Herstellers. Nennen Sie jeweils zwei Vorteile dieser Lizenzmodelle.$txt$, 4, 'PUBLISHED', $txt$Open-Source-Software: kostenfrei nutzbar (keine Lizenzkosten); transparenter Quellcode, der von jedem ueberprueft und bei Bedarf angepasst werden kann. Proprietaere Software: professioneller Hersteller-Support mit regelmaessigen Updates und Wartung; meist einfachere Bedienung und bessere Integration in das Betriebssystem.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Je zwei Vorteile beider Lizenzmodelle korrekt', 4, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 2da (4 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$Auf der Website des Software-Anbieters wird neben der Installationsdatei ein SHA-256-Hashwert angeboten. Erlaeutern Sie den Zweck der Verwendung eines Hashwerts beim Softwaredownload.$txt$, 4, 'PUBLISHED', $txt$Ein Hashwert dient der Integritaetspruefung der heruntergeladenen Datei: Stimmt der selbst berechnete Hashwert mit dem vom Anbieter veroeffentlichten ueberein, ist die Datei unveraendert und vertrauenswuerdig; weicht er ab, wurde die Datei veraendert oder manipuliert.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Zweck des Hashwerts korrekt erlaeutert', 4, 'QUALITATIVE', 'LF4.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C2');

  -- 2db (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 8, $txt$Bei der Einrichtung der Software werden die Protokolle IMAP und POP3 angeboten. Begruenden Sie, warum Sie sich fuer die Variante IMAP entscheiden.$txt$, 2, 'PUBLISHED', $txt$IMAP speichert die E-Mails auf dem Server, sodass von mehreren Geraeten darauf zugegriffen werden kann; die E-Mails bleiben zudem erhalten, auch wenn das lokale Geraet defekt ist oder verloren geht.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Begruendung fuer IMAP korrekt', 2, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');


  -- Szenario 3: Aufbau und Betrieb der Kanzlei-Website
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 3, 'Aufbau und Betrieb der Kanzlei-Website', $txt$Die Anwaltskanzlei moechte ihren Mandanten eine bestmoegliche Betreuung durch Nutzung der aktuellen technischen Moeglichkeiten bieten. Dafuer soll eine Website aufgebaut werden. Sie arbeiten an der Planung mit.$txt$, $txt$Drei Rechtsanwaelte sind gerade dabei, eine Gemeinschaftskanzlei zu eroeffnen. Ihr gemeinsames Bestreben besteht darin, die bestmoegliche Betreuung ihrer Mandanten durch Nutzung der aktuellen technischen Moeglichkeiten zu bieten. Da Ihr Ausbildungsbetrieb, die Innova DVTech 2000 OHG, als innovatives Beratungsunternehmen im IT-Support bekannt ist, erhalten Sie den Auftrag der IT-technischen Betreuung.$txt$, 'DATENVERARBEITUNG', 27);

  -- 3aa (9 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$Fuer den Aufbau der Website liegt die abgebildete Vorgangsliste vor. Erstellen Sie den vollstaendigen Netzplan nach der Vorgangsknoten-Methode: Tragen Sie zu jedem Vorgang FAZ (fruehester Anfangszeitpunkt), FEZ (fruehester Endzeitpunkt), SAZ (spaetester Anfangszeitpunkt), SEZ (spaetester Endzeitpunkt), GP (Gesamtpuffer = SAZ - FAZ bzw. SEZ - FEZ) und FP (freier Puffer = FAZ des Nachfolgers - FEZ des aktuellen Vorgangs) ein.

--- Anlage: Vorgangsliste zum Netzplan ---
Vorgang | Beschreibung | Dauer (Stunden) | Vorgaenger
A | Kickoff Meeting | 2 | -
B | Kundenanforderungen erfassen | 25 | A
C | Design und Konzeptentwicklung | 32 | B
D | Content-Erstellung | 40 | B
E | Webentwicklung | 70 | C, D
F | Suchmaschinenoptimierung (SEO) | 15 | E
G | Cloud Server auswaehlen | 8 | B
H | Cloud Server mieten | 2 | G
I | Testen und Qualitaetssicherung | 16 | E
J | Website-Launch | 4 | F, I, H
(Das Original zeigt diese Liste als grafischen Netzplan mit teilweise bereits eingetragenen Werten; die Tabelle tritt an seine Stelle.)$txt$, 9, 'PUBLISHED', $txt$A: FAZ 0, FEZ 2, SAZ 0, SEZ 2, GP 0, FP 0. B: FAZ 2, FEZ 27, SAZ 2, SEZ 27, GP 0, FP 0. C: FAZ 27, FEZ 59, SAZ 35, SEZ 67, GP 8, FP 8. D: FAZ 27, FEZ 67, SAZ 27, SEZ 67, GP 0, FP 0. E: FAZ 67, FEZ 137, SAZ 67, SEZ 137, GP 0, FP 0. F: FAZ 137, FEZ 152, SAZ 138, SEZ 153, GP 1, FP 1. G: FAZ 27, FEZ 35, SAZ 143, SEZ 151, GP 116, FP 0. H: FAZ 35, FEZ 37, SAZ 151, SEZ 153, GP 116, FP 116. I: FAZ 137, FEZ 153, SAZ 137, SEZ 153, GP 0, FP 0. J: FAZ 153, FEZ 157, SAZ 153, SEZ 157, GP 0, FP 0.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 9);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Netzplan (FAZ/FEZ/SAZ/SEZ/GP/FP je Vorgang) korrekt', 9, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');
  insert into public.attachment (id, user_id, question_id, attachment_type_code, position, title, content_text)
  values (gen_random_uuid(), v_user, v_frage, 'NETZWERKDIAGRAMM', 1, 'Vorgangsliste zum Netzplan', $txt$Vorgang | Beschreibung | Dauer (Stunden) | Vorgaenger
A | Kickoff Meeting | 2 | -
B | Kundenanforderungen erfassen | 25 | A
C | Design und Konzeptentwicklung | 32 | B
D | Content-Erstellung | 40 | B
E | Webentwicklung | 70 | C, D
F | Suchmaschinenoptimierung (SEO) | 15 | E
G | Cloud Server auswaehlen | 8 | B
H | Cloud Server mieten | 2 | G
I | Testen und Qualitaetssicherung | 16 | E
J | Website-Launch | 4 | F, I, H
(Das Original zeigt diese Liste als grafischen Netzplan mit teilweise bereits eingetragenen Werten; die Tabelle tritt an seine Stelle.)$txt$);

  -- 3ab (1 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$Nennen Sie die Vorgaenge des kritischen Pfads.$txt$, 1, 'PUBLISHED', $txt$A-B-D-E-I-J (alle Vorgaenge mit Gesamtpuffer 0).$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 1);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Kritischer Pfad korrekt genannt', 1, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 3b (3 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$Die zukuenftige Website soll als dynamische Website erstellt werden. Erlaeutern Sie den Unterschied gegenueber einer statischen Website.$txt$, 3, 'PUBLISHED', $txt$Eine statische Website zeigt immer denselben, fest im Quellcode hinterlegten Inhalt, unabhaengig vom Nutzer. Eine dynamische Website generiert Inhalte in Echtzeit, zum Beispiel abhaengig von Benutzereingaben oder Datenbankabfragen, und kann sich automatisch aktualisieren.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Unterschied statisch/dynamisch korrekt erlaeutert', 3, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 3c (3 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$Nennen Sie drei Programmiersprachen, die fuer die Entwicklung von dynamischen Webinhalten verwendet werden.$txt$, 3, 'PUBLISHED', $txt$Drei von: JavaScript, PHP, Python, C#, Ruby, Java.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Drei passende Programmiersprachen genannt', 3, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 3d (6 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 5, $txt$Fuehren Sie einen Schreibtischtest fuer die folgende Funktion durch:

def analytics_berechnen(besucher, seitenaufrufe, besucherSuchmaschinen, anzahlBounces):
    durchschnittSeitenaufrufeProBesucher = seitenaufrufe / besucher
    prozentsatzSuchmaschinenBesucher = (besucherSuchmaschinen / besucher) * 100
    nonBounceRate = ((besucher - anzahlBounces) / besucher) * 100
    return (durchschnittSeitenaufrufeProBesucher, prozentsatzSuchmaschinenBesucher, nonBounceRate)

Aufruf: ergebnis = analytics_berechnen(12000, 33000, 5562, 7554)

Berechnen Sie die drei Rueckgabewerte (durchschnittliche Seitenaufrufe pro Besucher, Prozentsatz der Besucher ueber Suchmaschinen, Non-Bounce-Rate) mit zwei Nachkommastellen.$txt$, 6, 'PUBLISHED', $txt$Durchschnittliche Seitenaufrufe pro Besucher: 33000 / 12000 = 2,75. Prozentsatz der Besucher ueber Suchmaschinen: (5562 / 12000) * 100 = 46,35 %. Non-Bounce-Rate: ((12000 - 7554) / 12000) * 100 = 37,05 %.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Alle drei Rueckgabewerte korrekt berechnet', 6, 'QUALITATIVE', 'LF5.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C2');

  -- 3e (8 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status)
  values (v_frage, v_user, v_scen, 6, $txt$Fuer folgenden Pseudocode ist die Rueckgabe zweier Aufrufe gefragt:

Funktion bewertung_webseite(ladezeit, html_valid, mobile_freundlich, seo_optimierung):
    Wenn ladezeit < 2:
        Wenn html_valid:
            Wenn mobile_freundlich:
                Wenn seo_optimierung > 80: ergebnis = "Hervorragend"
                Sonst, wenn seo_optimierung > 50: ergebnis = "Gut, SEO koennte besser sein"
                Sonst: ergebnis = "Schwaches SEO"
            Sonst:
                Wenn seo_optimierung > 80: ergebnis = "Nicht mobilfreundlich, aber SEO gut"
                Sonst: ergebnis = "SEO und Mobilfreundlichkeit koennten besser sein"
        Sonst:
            Wenn mobile_freundlich: ergebnis = "HTML nicht valide, aber mobilfreundlich"
            Sonst: ergebnis = "HTML nicht valide und nicht mobilfreundlich"
    Sonst:
        Wenn html_valid:
            Wenn mobile_freundlich: ergebnis = "Langsam, aber valide und mobilfreundlich"
            Sonst: ergebnis = "Langsam und nicht mobilfreundlich"
        Sonst: ergebnis = "Langsam und HTML nicht valide"
    Rueckgabe ergebnis

1. bewertung_webseite(1.5, Wahr, Wahr, 80) -- ergebnis = ?
2. bewertung_webseite(3.0, Wahr, Falsch, 45) -- ergebnis = ?

Antwortformat: zwei Absaetze, getrennt durch eine Leerzeile -- zuerst die Rueckgabe von Aufruf 1, dann die Rueckgabe von Aufruf 2, jeweils ohne Nummerierung und im genauen Wortlaut des Pseudocodes. Die Leerzeile trennt die beiden Bewertungen voneinander; ohne sie kann die Zuordnung der Rueckgaben zu den Aufrufen nicht gelingen.$txt$, 8, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 8);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value, accepted_alternatives)
  values (v_user, v_rubrik, 1, 'Rueckgabe Aufruf 1 korrekt', 4, 'DETERMINISTIC', 'LF5.C2', 'TABELLENWERT', '{"value": "Gut, SEO koennte besser sein"}'::jsonb, array['Gut, SEO könnte besser sein']);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value)
  values (v_user, v_rubrik, 2, 'Rueckgabe Aufruf 2 korrekt', 4, 'DETERMINISTIC', 'LF5.C2', 'TABELLENWERT', '{"value": "Langsam und nicht mobilfreundlich"}'::jsonb);
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C2');


  -- Szenario 4: Einsatz von KI und Mandantendatenverwaltung
  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text, company_context, situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 4, 'Einsatz von KI und Mandantendatenverwaltung', $txt$Die Kanzlei ist bestrebt, stets up to date zu bleiben und offen fuer Innovationen zu sein. Daher wird auch der Einsatz von Kuenstlicher Intelligenz (KI) geprueft.$txt$, $txt$Drei Rechtsanwaelte sind gerade dabei, eine Gemeinschaftskanzlei zu eroeffnen. Ihr gemeinsames Bestreben besteht darin, die bestmoegliche Betreuung ihrer Mandanten durch Nutzung der aktuellen technischen Moeglichkeiten zu bieten. Da Ihr Ausbildungsbetrieb, die Innova DVTech 2000 OHG, als innovatives Beratungsunternehmen im IT-Support bekannt ist, erhalten Sie den Auftrag der IT-technischen Betreuung.$txt$, 'DATENVERARBEITUNG', 22);

  -- 4a (6 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 1, $txt$Bei Anfrage eines Mandanten nach einem Beratungstermin ist folgender grober Ablauf vorgesehen: 1. Erfassen/Aktualisieren der Mandantendaten, 2. Grobe Erfassung des Rechtsfalls durch einen Anwaltsgehilfen, 3. Terminvereinbarung fuer das Erstgespraech, 4. Kurze Vorabrecherche durch einen Rechtsanwalt, 5. Erstberatung durch einen Rechtsanwalt. Waehlen Sie drei Stellen des Ablaufs und beschreiben Sie jeweils, wie KI sinnvoll zum Einsatz kommen kann.$txt$, 6, 'PUBLISHED', $txt$Drei Beispiele von: (1) Erfassen/Aktualisieren der Mandantendaten: automatische Recherche nach Informationen ueber den Mandanten. (2) Erfassung des Rechtsfalls: KI-gestuetzte Analyse und Vorstrukturierung bzw. Kategorisierung des Falls. (3) Terminvereinbarung: automatische Terminvorschlaege und Kalenderabgleich. (4) Vorabrecherche: automatisches Recherchieren aehnlicher Faelle, Gerichtsurteile oder Gesetzestexte. (5) Erstberatung: KI liefert vorbereitete Informationen, Argumentationshilfen oder eine strukturierte Falluebersicht.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Drei sinnvolle KI-Einsatzstellen beschrieben', 6, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 4b (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 2, $txt$Einige Mitarbeiter der Kanzlei stehen dem Einsatz von KI skeptisch gegenueber. Erlaeutern Sie einen moeglichen Vorteil fuer die Mitarbeiter.$txt$, 2, 'PUBLISHED', $txt$Ein Vorteil ist die Entlastung von wiederkehrenden Routineaufgaben, wodurch mehr Zeit fuer anspruchsvollere Taetigkeiten bleibt.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Vorteil fuer Mitarbeiter korrekt erlaeutert', 2, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 4c (4 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 3, $txt$Der Kanzlei liegt ein Angebot ueber einen KI-Chatbot fuer Anwaelte vor: monatliche Kosten 100,00 EUR je User, jaehrliche dreistuendige individuelle (Pflicht-)Schulung 1.800,00 EUR je Anwalt. Errechnen Sie die jaehrlichen Kosten des Chatbot-Anbieters fuer die drei Anwaelte der Kanzlei. Beruecksichtigen Sie neben den Kosten auch den entgangenen Umsatz durch die Pflichtschulung bei einem Stundensatz von 200 EUR.$txt$, 4, 'PUBLISHED', $txt$Chatbot-Kosten: 3 Anwaelte x 100 EUR x 12 Monate = 3.600 EUR. Schulungskosten: 3 Anwaelte x 1.800 EUR = 5.400 EUR. Entgangener Umsatz: 3 Anwaelte x 3 Stunden x 200 EUR = 1.800 EUR. Jaehrliche Gesamtkosten: 3.600 + 5.400 + 1.800 = 10.800 EUR.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Jaehrliche Gesamtkosten mit Rechenweg korrekt', 4, 'QUALITATIVE', 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- 4d (4 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 4, $txt$Der Kanzlei wird ein KI-Chatbot angeboten, der auf der Homepage platziert kostenlos Rechtsauskunft gibt und dabei unter Beruecksichtigung der Erfolgsaussichten versucht, weitere Mandanten zu gewinnen. Beschreiben Sie einen Vorteil und einen Nachteil dieses Chatbots fuer die Kanzlei.$txt$, 4, 'PUBLISHED', $txt$Vorteil: Der Chatbot kann potenzielle Mandanten ansprechen und erste Fragen beantworten, was die Kanzlei entlastet und neue Mandanten gewinnt. Nachteil: Falsche oder missverstaendliche Auskuenfte koennten das Vertrauen in die Kanzlei beeintraechtigen.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Ein Vorteil und ein Nachteil korrekt beschrieben', 4, 'QUALITATIVE', 'LF1.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF1.C1');

  -- 4ea (3 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status)
  values (v_frage, v_user, v_scen, 5, $txt$Die KI-Anwendung wird auf einem Cloud-Server gehostet (IPv4 32.42.230.33). Sie sollen eine gesicherte Verbindung zu dem Server erstellen. Aus der Porttabelle sind unter anderem bekannt: Port 21 FTP-Verbindungsaufbau, Port 22 Secure Shell (verschluesselte Fernwartung und Dateiuebertragung), Port 23 Telnet (unverschluesselt). Geben Sie Host, Port und Verbindungstyp an, um eine gesicherte Verbindung aufzubauen. Gehen Sie davon aus, dass alle Dienste auf dem Standardport laufen.$txt$, 3, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value)
  values (v_user, v_rubrik, 1, 'Host korrekt', 1, 'DETERMINISTIC', 'LF3.C1', 'TABELLENWERT', '{"value": "32.42.230.33"}'::jsonb);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value)
  values (v_user, v_rubrik, 2, 'Port korrekt', 1, 'DETERMINISTIC', 'LF3.C1', 'TABELLENWERT', '{"value": "22"}'::jsonb);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id, computation_type_code, expected_value)
  values (v_user, v_rubrik, 3, 'Verbindungstyp korrekt', 1, 'DETERMINISTIC', 'LF3.C1', 'TABELLENWERT', '{"value": "SSH"}'::jsonb);
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 4eb (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 6, $txt$Begruenden Sie, warum Sie sich nicht fuer die uebrigen angebotenen Verbindungstypen (Serial, Telnet) entschieden haben.$txt$, 2, 'PUBLISHED', $txt$Telnet uebertraegt Daten unverschluesselt und ist daher fuer sensible Daten unsicher. Serial-Verbindungen erfordern physische Naehe zum Geraet und sind fuer einen Cloud-Server ungeeignet. SSH bietet dagegen eine verschluesselte, sichere Verbindung ueber das Internet.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Begruendung gegen Serial und Telnet korrekt', 2, 'QUALITATIVE', 'LF3.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1');

  -- 4fa (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 7, $txt$Es bot sich die Gelegenheit, den Mandantenstamm einer aufgeloesten Kanzlei zu uebernehmen. Die Mandantentabelle beinhaltet jedoch Redundanzen. Erklaeren Sie den Begriff Redundanzen.$txt$, 2, 'PUBLISHED', $txt$Redundanzen sind doppelt oder mehrfach vorhandene Daten -- ein Datensatz oder eine Information ist mehrmals gespeichert.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Begriff Redundanzen korrekt erklaert', 2, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  -- 4fb (2 Punkte)
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt, max_points, status, reference_answer)
  values (v_frage, v_user, v_scen, 8, $txt$Beschreiben Sie ein Problem, welches durch Redundanzen entstehen kann.$txt$, 2, 'PUBLISHED', $txt$Ein typisches Problem ist die Inkonsistenz: Ist eine Information an mehreren Stellen unterschiedlich gespeichert, kann das zu falschen Auswertungen oder Entscheidungen fuehren; ausserdem steigt der Speicherbedarf unnoetig.$txt$);
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 2);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values (v_user, v_rubrik, 1, 'Ein Problem durch Redundanzen korrekt beschrieben', 2, 'QUALITATIVE', 'LF5.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF5.C1');

  return v_exam;
end $_$;


--
-- Name: FUNCTION uebungspruefung_ap1_2025_fruehjahr_roh(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_ap1_2025_fruehjahr_roh() IS 'Rumpf der echten Pruefung CURRENT_AP1_2025_FRUEHJAHR (erzeugt aus tools/ap1_pruefungsdaten.py durch tools/ap1_migration_erzeugen.py). Vier Szenarien, 100 Punkte, 90 Minuten (FULL_EXAM). Nur ueber uebungspruefung_anlegen(code).';


--
-- Name: uebungspruefung_servicedesk_roh(smallint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_servicedesk_roh(p_satz smallint DEFAULT NULL::smallint) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    SET lc_numeric TO 'C'
    AS $_$
declare
  v_user   uuid := auth.uid();
  v_satz   smallint;
  v_exam   uuid;
  v_scen   uuid;
  v_frage  uuid;
  v_rubrik uuid;
  -- Der Zahlensatz. Genau eine Stelle, aus der Texte und Kriterien gespeist werden.
  v_meld1     timestamptz;  -- erste Meldung (Servicefenster-Vertrag)
  v_meld1_t   text;         -- dieselbe Meldung als deutscher Satzteil
  v_objekt1_t text;         -- was gemeldet wurde
  v_umstand_t text;         -- der Umstand, aus dem die Prioritaetsklasse folgt
  v_prio      text;         -- die richtige Klasse dazu
  v_reak1     integer;      -- Reaktionszeit im Servicefenster
  v_meld2     timestamptz;  -- zweite Meldung (24/7-Vertrag)
  v_meld2_t   text;
  v_reak2     integer;      -- Reaktionszeit im 24/7-Vertrag
  v_mb        integer;      -- Log-Archiv in MB
  v_mbit      integer;      -- Standleitung in Mbit/s
  v_gb_tag    integer;      -- Vollsicherung je Tag in GB
  v_tage      integer;      -- Aufbewahrung in Tagen
  v_watt      integer;      -- Leistungsaufnahme des Dateiservers
  v_preis     numeric;      -- EUR je kWh
  v_bezug     numeric;      -- Bezugspreis des Ersatz-Notebooks
  v_gk        integer;      -- Gemeinkostenzuschlag in Prozent
  v_gewinn    integer;
  v_skonto    integer;
  v_rabatt    integer;
  v_cidr      text;         -- IP-Konfiguration des Arbeitsplatzes
  -- Abgeleitetes und deutsche Schreibweise fuer die Texte
  v_prio_alt  text[];
  v_gb_ges    integer;
  v_mb_t      text;
  v_gb_ges_t  text;
  v_watt_t    text;
  v_preis_t   text;
  v_bezug_t   text;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.user_profile where id = v_user) then
    raise exception 'Kein Profil zu dieser Sitzung.' using errcode = '23503';
  end if;
  if p_satz is not null and p_satz not between 1 and 3 then
    raise exception 'Zahlensatz % gibt es nicht (1 bis 3).', p_satz using errcode = '22023';
  end if;

  -- Wiederholbarkeit wie in 0023: eine offene Uebung wird fortgesetzt, nicht verdoppelt.
  select e.id into v_exam
    from public.exam e
   where e.user_id = v_user
     and e.mode = 'MINI_EXAM'
     and e.status = 'IN_PROGRESS'
     and e.title = 'Uebungspruefung: Servicedesk'
   order by e.created_at
   limit 1;
  if v_exam is not null then
    return v_exam;
  end if;

  -- Rotation: der wievielte Lauf dieser Uebung ist das? Jeder bisherige zaehlt, egal in
  -- welchem Zustand. Der erste Lauf (kein bisheriger) bekommt Satz 1.
  if p_satz is not null then
    v_satz := p_satz;
  else
    select (1 + count(*) % 3)::smallint into v_satz
      from public.exam e
     where e.user_id = v_user
       and e.mode = 'MINI_EXAM'
       and e.title = 'Uebungspruefung: Servicedesk';
  end if;

  case v_satz
    when 1 then
      v_meld1 := '2026-03-06 15:45+01'; v_meld1_t := 'Am Freitag, 6. Maerz 2026, um 15:45 Uhr';
      v_objekt1_t := 'meldet die Buchhaltung, dass ihr Abteilungsdrucker ausgefallen ist';
      v_umstand_t := 'der Etagendrucker steht als Ausweichmoeglichkeit zur Verfuegung';
      v_prio := 'P3'; v_reak1 := 4;
      v_meld2 := '2026-03-07 22:10+01'; v_meld2_t := 'Am Samstag, 7. Maerz 2026, um 22:10 Uhr';
      v_reak2 := 6;
      v_mb := 900;  v_mbit := 16; v_gb_tag := 120; v_tage := 30;
      v_watt := 350; v_preis := 0.30;
      v_bezug := 620; v_gk := 15; v_gewinn := 10; v_skonto := 3; v_rabatt := 5;
      v_cidr := '10.20.37.140/22';
    when 2 then
      v_meld1 := '2026-03-05 16:20+01'; v_meld1_t := 'Am Donnerstag, 5. Maerz 2026, um 16:20 Uhr';
      v_objekt1_t := 'meldet der Wareneingang, dass der Etikettendrucker ausgefallen ist';
      v_umstand_t := 'ein Ersatzgeraet gibt es nicht, und ohne Etiketten kann der '
                     'Wareneingang keine Ware annehmen';
      v_prio := 'P2'; v_reak1 := 4;
      v_meld2 := '2026-03-08 20:35+01'; v_meld2_t := 'Am Sonntag, 8. Maerz 2026, um 20:35 Uhr';
      v_reak2 := 6;
      v_mb := 1500; v_mbit := 25; v_gb_tag := 150; v_tage := 20;
      v_watt := 500; v_preis := 0.30;
      v_bezug := 480; v_gk := 20; v_gewinn := 15; v_skonto := 2; v_rabatt := 10;
      v_cidr := '172.20.135.77/19';
    when 3 then
      v_meld1 := '2026-03-04 15:30+01'; v_meld1_t := 'Am Mittwoch, 4. Maerz 2026, um 15:30 Uhr';
      v_objekt1_t := 'faellt der zentrale Switch im Verwaltungsgebaeude aus';
      v_umstand_t := 'saemtliche Arbeitsplaetze der Verwaltung sind ohne Netzzugang';
      v_prio := 'P1'; v_reak1 := 4;
      v_meld2 := '2026-03-07 19:50+01'; v_meld2_t := 'Am Samstag, 7. Maerz 2026, um 19:50 Uhr';
      v_reak2 := 8;
      v_mb := 2100; v_mbit := 24; v_gb_tag := 200; v_tage := 25;
      v_watt := 600; v_preis := 0.35;
      v_bezug := 950; v_gk := 10; v_gewinn := 12; v_skonto := 3; v_rabatt := 8;
      v_cidr := '192.168.130.45/21';
  end case;

  -- "P3" -> "P 3", "Prio 3", "Prioritaet 3", "Prioritaetsklasse P3", "Klasse P3". Aus der
  -- Klasse abgeleitet statt je Satz getippt: eine Schreibweise kann nicht zur falschen
  -- Klasse gehoeren.
  v_prio_alt := array['P ' || right(v_prio, 1),
                      'Prio ' || right(v_prio, 1),
                      'Prioritaet ' || right(v_prio, 1),
                      'Prioritaetsklasse ' || v_prio,
                      'Klasse ' || v_prio];
  v_gb_ges   := v_gb_tag * v_tage;
  v_mb_t     := translate(to_char(v_mb,     'FM999G999'),    ',.', '.,');  -- 1.500
  v_gb_ges_t := translate(to_char(v_gb_ges, 'FM999G999'),    ',.', '.,');  -- 3.600
  v_watt_t   := translate(to_char(v_watt,   'FM999G999'),    ',.', '.,');  -- 350
  v_preis_t  := translate(to_char(v_preis,  'FM999G999D00'), ',.', '.,');  -- 0,30
  v_bezug_t  := translate(to_char(v_bezug,  'FM999G999D00'), ',.', '.,');  -- 620,00

  v_exam := gen_random_uuid();
  insert into public.exam (id, user_id, title, mode, status, duration_minutes,
                           total_points, started_at)
  values (v_exam, v_user, 'Uebungspruefung: Servicedesk', 'MINI_EXAM',
          'IN_PROGRESS', 45, 40, now());

  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text,
                               situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 1, 'Servicedesk der Nordlicht Logistik GmbH',
          format(
$txt$Die Nordlicht Logistik GmbH betreibt drei Lager und eine Verwaltung mit zusammen
140 Beschaeftigten. Sie arbeiten im Servicedesk und bearbeiten die eingehenden
Stoerungen und Anfragen.

Fuer die Buero-IT gilt ein Wartungsvertrag mit einer Reaktionszeit von %s Stunden
innerhalb der Servicezeiten Montag bis Freitag, 8:00 bis 17:00 Uhr. Fuer den
Warenwirtschaftsserver gilt ein 24/7-Vertrag mit einer Reaktionszeit von %s Stunden.

%s %s; %s. %s meldet die Nachtschicht den Ausfall des Warenwirtschaftsservers.

Prioritaetsklassen laut Servicehandbuch:
  P1  Ausfall eines zentralen Systems, alle Nutzer betroffen
  P2  Ausfall eines Arbeitsplatzes oder einer Abteilungsfunktion ohne Ausweichmoeglichkeit
  P3  Einschraenkung mit Umgehungsloesung
  P4  Anfrage ohne Stoerung

Zur Fehlersuche soll ein Log-Archiv von %s MB ueber die Standleitung eines Lagers
mit %s Mbit/s an die Verwaltung uebertragen werden. Die taegliche Vollsicherung des
Dateiservers umfasst %s GB und wird %s Tage lang aufbewahrt. Der Dateiserver nimmt
im Mittel %s W auf und laeuft durchgehend, also 8.760 Stunden im Jahr; der
Strompreis betraegt %s EUR je kWh.

Fuer einen defekten Arbeitsplatz wird ein Ersatz-Notebook beschafft: Bezugspreis
%s EUR, Gemeinkostenzuschlag %s %%, Gewinn %s %%, Skonto %s %%, Rabatt %s %%. Der
Arbeitsplatz erhaelt die IP-Konfiguration %s.$txt$,
            v_reak1, v_reak2,
            v_meld1_t, v_objekt1_t, v_umstand_t, v_meld2_t,
            v_mb_t, v_mbit, v_gb_tag, v_tage, v_watt_t, v_preis_t,
            v_bezug_t, v_gk, v_gewinn, v_skonto, v_rabatt, v_cidr),
          'SERVICEFALL', 45);

  -- ---------------------------------------------------------------------------
  -- Aufgabe 1: SLA-Frist im Servicefenster (Satz 1: Fr 15:45 + 4 h in 8-17 ->
  -- Montag, 9. Maerz 2026, 10:45 Uhr)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 1,
          'Bestimmen Sie den spaetesten Zeitpunkt, zu dem laut Wartungsvertrag auf die '
          'zuerst gemeldete Stoerung reagiert werden muss. Geben Sie Datum und '
          'Uhrzeit an.',
          'ZEITBERECHNUNG_SLA', 3, 6, 6, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 6);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, competency_id)
  values (v_user, v_rubrik, 1, 'Reaktionsfrist im Servicefenster korrekt', 6,
          'DETERMINISTIC', 'ZEITBERECHNUNG_SLA',
          jsonb_build_object(
            'kind', 'duration',
            'value', jsonb_build_object(
              'meldezeitpunkt', to_char(v_meld1 at time zone 'Europe/Berlin',
                                        'YYYY-MM-DD"T"HH24:MI:SS') || '+01:00',
              'reaktionszeit_stunden', v_reak1,
              'geschaeftszeiten', jsonb_build_object('start', 8, 'end', 17),
              'zeitzone', 'Europe/Berlin')),
          'LF6.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF6.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 2: SLA-Frist rund um die Uhr (Satz 1: Sa 22:10 + 6 h -> Sonntag,
  -- 8. Maerz 2026, 04:10 Uhr)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 2,
          'Bestimmen Sie den spaetesten Reaktionszeitpunkt fuer den Ausfall des '
          'Warenwirtschaftsservers. Geben Sie Datum und Uhrzeit an.',
          'ZEITBERECHNUNG_SLA', 2, 4, 4, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, competency_id)
  values (v_user, v_rubrik, 1, 'Reaktionsfrist im 24/7-Vertrag korrekt', 4,
          'DETERMINISTIC', 'ZEITBERECHNUNG_SLA',
          jsonb_build_object(
            'kind', 'duration',
            'value', jsonb_build_object(
              'meldezeitpunkt', to_char(v_meld2 at time zone 'Europe/Berlin',
                                        'YYYY-MM-DD"T"HH24:MI:SS') || '+01:00',
              'reaktionszeit_stunden', v_reak2,
              'geschaeftszeiten', null,
              'zeitzone', 'Europe/Berlin')),
          'LF6.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF6.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 3: Prioritaetsklasse laut Tabelle (Satz 1: Einschraenkung mit
  -- Umgehung -> P3; Satz 2: kein Ersatz -> P2; Satz 3: alle betroffen -> P1)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 3,
          'Ordnen Sie die zuerst gemeldete Stoerung laut Servicehandbuch einer '
          'Prioritaetsklasse zu. Geben Sie nur die Klasse an, zum Beispiel "P4".',
          'TABELLENWERT', 1, 3, 2, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 3);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, accepted_alternatives, competency_id)
  values (v_user, v_rubrik, 1, 'Prioritaetsklasse korrekt zugeordnet', 3,
          'DETERMINISTIC', 'TABELLENWERT',
          jsonb_build_object('kind', 'text', 'value', v_prio),
          v_prio_alt, 'LF6.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF6.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 4: Uebertragungszeit (Satz 1: 900 MB * 8 / 16 Mbit/s = 450 s)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 4,
          format('Berechnen Sie, wie lange die Uebertragung des Log-Archivs von %s MB '
                 'ueber die %s-Mbit/s-Standleitung dauert. Geben Sie das Ergebnis in '
                 'Sekunden an.', v_mb_t, v_mbit),
          'UEBERTRAGUNGSZEIT', 3, 5, 6, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, competency_id)
  values (v_user, v_rubrik, 1, 'Uebertragungszeit korrekt berechnet', 5,
          'DETERMINISTIC', 'UEBERTRAGUNGSZEIT',
          jsonb_build_object('kind', 'duration',
                             'value', jsonb_build_object('daten_mb', v_mb,
                                                         'bandbreite_mbit', v_mbit)),
          's', 'LF6.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF6.C2');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 5: Speicherbedarf der Sicherung (Satz 1: 120 GB * 30 = 3.600 GB = 3,6 TB)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 5,
          format('Ermitteln Sie den Speicherbedarf fuer %s Tage Vollsicherung des '
                 'Dateiservers. Geben Sie das Ergebnis in TB an.', v_tage),
          'EINHEITENUMRECHNUNG_SPEICHER', 2, 5, 5, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, competency_id)
  values (v_user, v_rubrik, 1, 'Speicherbedarf korrekt umgerechnet', 5,
          'DETERMINISTIC', 'EINHEITENUMRECHNUNG_SPEICHER',
          jsonb_build_object('kind', 'data_size',
                             'value', jsonb_build_object('amount', v_gb_ges),
                             'unit', 'GB'),
          'GB', 'LF4.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF4.C2');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 6: Stromkosten (Satz 1: 350 W * 8.760 h = 3.066 kWh; * 0,30 = 919,80 EUR)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 6,
          'Berechnen Sie die jaehrlichen Stromkosten des Dateiservers.',
          'EINHEITENUMRECHNUNG_ENERGIE_KOSTEN', 2, 5, 5, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, competency_id)
  values (v_user, v_rubrik, 1, 'Stromkosten korrekt berechnet', 5,
          'DETERMINISTIC', 'EINHEITENUMRECHNUNG_ENERGIE_KOSTEN',
          jsonb_build_object('kind', 'currency',
                             'value', jsonb_build_object('watt', v_watt,
                                                         'stunden', 8760,
                                                         'preis_pro_kwh', v_preis)),
          'EUR', 'LF2.C1');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C1');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 7: Listenverkaufspreis (Satz 1: 620 * 1,15 = 713,00; * 1,10 = 784,30;
  -- / 0,97 = 808,56; / 0,95 = 851,11 EUR)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 7,
          'Kalkulieren Sie den Listenverkaufspreis des Ersatz-Notebooks.',
          'KOSTENRECHNUNG_PROZENT', 4, 8, 10, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 8);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, unit, awards_method_points, competency_id)
  values (v_user, v_rubrik, 1, 'Listenverkaufspreis korrekt kalkuliert', 8,
          'DETERMINISTIC', 'KOSTENRECHNUNG_PROZENT',
          jsonb_build_object('kind', 'currency',
                             'value', jsonb_build_object('bezugspreis', v_bezug,
                                                         'gemeinkosten_pct', v_gk,
                                                         'gewinn_pct', v_gewinn,
                                                         'skonto_pct', v_skonto,
                                                         'rabatt_pct', v_rabatt)),
          'EUR', true, 'LF2.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF2.C2');

  -- ---------------------------------------------------------------------------
  -- Aufgabe 8: Netzadresse des Clients (Satz 1: 10.20.37.140/22 -> 10.20.36.0)
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               computation_type_code, difficulty, max_points,
                               expected_minutes, status)
  values (v_frage, v_user, v_scen, 8,
          format('Ermitteln Sie die Netzadresse des Teilnetzes, in dem der Arbeitsplatz '
                 'mit der IP-Konfiguration %s liegt.', v_cidr),
          'NETZADRESSE', 3, 4, 4, 'PUBLISHED');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 4);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, computation_type_code,
     expected_value, competency_id)
  values (v_user, v_rubrik, 1, 'Netzadresse korrekt bestimmt', 4,
          'DETERMINISTIC', 'NETZADRESSE',
          jsonb_build_object('kind', 'cidr', 'value', v_cidr), 'LF3.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C2');

  return v_exam;
end $_$;


--
-- Name: FUNCTION uebungspruefung_servicedesk_roh(p_satz smallint); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_servicedesk_roh(p_satz smallint) IS 'Rumpf der Uebungspruefung "Servicedesk" (0023) in drei Zahlensaetzen (0026); nur ueber uebungspruefung_anlegen(code). Ohne Argument rotiert der Satz mit der Zahl der bisherigen Laeufe, mit Argument (1 bis 3) nimmt die Funktion den genannten -- fuer Tests.';


--
-- Name: uebungspruefung_vlan_grundlagen_roh(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uebungspruefung_vlan_grundlagen_roh() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $_$
declare
  v_user   uuid := auth.uid();
  v_exam   uuid;
  v_scen   uuid;
  v_frage  uuid;
  v_rubrik uuid;
begin
  if v_user is null then
    raise exception 'Keine angemeldete Sitzung.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.user_profile where id = v_user) then
    raise exception 'Kein Profil zu dieser Sitzung.' using errcode = '23503';
  end if;

  select e.id into v_exam
    from public.exam e
   where e.user_id = v_user
     and e.mode = 'MINI_EXAM'
     and e.status = 'IN_PROGRESS'
     and e.title = 'Uebungspruefung: VLAN-Grundlagen'
   order by e.created_at
   limit 1;
  if v_exam is not null then
    return v_exam;
  end if;

  v_exam := gen_random_uuid();
  insert into public.exam (id, user_id, title, mode, status, duration_minutes,
                           total_points, started_at)
  values (v_exam, v_user, 'Uebungspruefung: VLAN-Grundlagen', 'MINI_EXAM',
          'IN_PROGRESS', 10, 5, now());

  v_scen := gen_random_uuid();
  insert into public.scenario (id, user_id, exam_id, position, title, situation_text,
                               situation_type_code, expected_minutes)
  values (v_scen, v_user, v_exam, 1, 'Netzwerkerweiterung bei der Baumann Elektrotechnik GmbH',
$txt$Die Baumann Elektrotechnik GmbH hat am Standort zwei Abteilungen, Verwaltung und
Fertigung, die bislang ueber denselben unmanaged Switch am selben physischen Netzwerk
haengen. Rundrufe aus der Fertigung, ausgeloest durch haeufige ARP-Anfragen der
Produktionsmaschinen, verlangsamen spuerbar die Arbeitsplaetze der Verwaltung.

Die Geschaeftsfuehrung hat bereits einen managed Switch bestellt und moechte vorab
verstehen, welches Konzept die Trennung der beiden Abteilungen technisch loest. Sie
arbeiten im Support und sollen das Konzept in einfachen Worten erklaeren, bevor der
Switch eingerichtet wird.$txt$,
          'NETZWERKERWEITERUNG', 10);

  -- ---------------------------------------------------------------------------
  -- Aufgabe 1: Freitext zu VLANs. Zwei QUALITATIVE-Kriterien -- der einzige Weg auf dieser
  -- Instanz, den KI-Bewertungspfad (WF-05) ueberhaupt auszuloesen.
  -- ---------------------------------------------------------------------------
  v_frage := gen_random_uuid(); v_rubrik := gen_random_uuid();
  insert into public.question (id, user_id, scenario_id, position, prompt,
                               difficulty, max_points, expected_minutes, status,
                               reference_answer)
  values (v_frage, v_user, v_scen, 1,
          'Erklären Sie, wozu VLANs in einem Betriebsnetz wie diesem dienen und an '
          'welcher Stelle im Netzpfad die VLAN-Markierung entsteht.',
          2, 5, 10, 'PUBLISHED',
          'VLANs teilen ein physisches Netzwerk logisch in mehrere getrennte '
          'Broadcast-Domänen. Dadurch bleibt ein Rundruf aus der Fertigung auf das '
          'Fertigungs-VLAN beschränkt und belastet nicht mehr das gesamte Netz; '
          'Verwaltung und Fertigung lassen sich trotz gemeinsamer Verkabelung getrennt '
          'und gezielt absichern. Die VLAN-Markierung nach IEEE 802.1Q entsteht am '
          'Switchport: ein als Trunk konfigurierter Port fügt jedem Frame beim '
          'Verlassen ein Tag mit der VLAN-ID hinzu und entfernt es beim Eintritt '
          'wieder, während ein Access-Port dem angeschlossenen Endgerät unmarkierte '
          'Frames liefert und sie beim Eintritt fest einem VLAN zuordnet. Das '
          'Endgerät selbst markiert nichts -- das Tagging geschieht ausschließlich '
          'im Switch.');
  insert into public.rubric (id, user_id, question_id, total_points)
  values (v_rubrik, v_user, v_frage, 5);
  insert into public.rubric_criterion
    (user_id, rubric_id, position, label, max_points, kind, competency_id)
  values
    (v_user, v_rubrik, 1, 'Zweck der Trennung von Broadcast-Domänen', 2,
     'QUALITATIVE', 'LF3.C1'),
    (v_user, v_rubrik, 2, 'Ort der VLAN-Markierung im Netzpfad (802.1Q am Switchport)', 3,
     'QUALITATIVE', 'LF3.C2');
  insert into public.question_competency (question_id, user_id, competency_id)
  values (v_frage, v_user, 'LF3.C1'), (v_frage, v_user, 'LF3.C2');

  return v_exam;
end $_$;


--
-- Name: FUNCTION uebungspruefung_vlan_grundlagen_roh(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.uebungspruefung_vlan_grundlagen_roh() IS 'Rumpf der Uebungspruefung "VLAN-Grundlagen" (0048): eine Freitextaufgabe mit zwei QUALITATIVE-Kriterien, damit auf der Instanz ueberhaupt eine Rubrik existiert, die den KI-Bewertungspfad (WF-05) ausloest. Nur ueber uebungspruefung_anlegen(code).';


--
-- Name: update_competency_state(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_competency_state(p_grading_result_id uuid) RETURNS integer
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_user   uuid;
  v_answer uuid;
  v_anzahl integer := 0;
begin
  select user_id, answer_id into v_user, v_answer
    from public.grading_result where id = p_grading_result_id;
  if v_user is null then
    raise exception 'update_competency_state: Bewertung % existiert nicht',
      p_grading_result_id using errcode = '23503';
  end if;

  -- Eine Antwort kann mehrere Bewertungen tragen: DETERMINISTIC, AI, dann MERGED
  -- (DETERMINISTIC_GRADER.md Abschnitt 7). Ohne die folgende Bedingung zaehlte
  -- dieselbe Aufgabe drei Versuche, und die Trefferquote einer Kompetenz haette mit
  -- dem Koennen des Prueflings nichts mehr zu tun -- nur damit, wie viele
  -- Bewertungsstufen die Pipeline gerade durchlaeuft.
  --
  -- Gezaehlt wird deshalb nur die ERSTE Bewertung je (Antwort, Kriterium).
  --
  -- Verglichen wird ueber die blosse Existenz, nicht ueber created_at. Diese Spalte
  -- traegt default now(), und now() ist die TRANSAKTIONS-, nicht die Anweisungszeit:
  -- zwei Bewertungen, die in derselben Transaktion entstehen, haben denselben
  -- Zeitstempel, und ein "frueher.created_at < gcr.created_at" waere fuer beide falsch
  -- -- also zaehlten beide. In der Pipeline laufen die Stufen zwar meist in getrennten
  -- Transaktionen, sodass der Fehler dort lange unbemerkt bliebe; genau deshalb steht
  -- er hier nicht.
  with beruehrt as (
    select rc.competency_id,
           sum(gcr.points_awarded) as punkte,
           sum(gcr.max_points)     as moeglich
      from public.grading_criterion_result gcr
      join public.rubric_criterion rc on rc.id = gcr.rubric_criterion_id
     where gcr.grading_result_id = p_grading_result_id
       and rc.competency_id is not null
       and not exists (
         select 1
           from public.grading_criterion_result frueher
           join public.grading_result gr on gr.id = frueher.grading_result_id
          where gr.answer_id = v_answer
            and frueher.rubric_criterion_id = gcr.rubric_criterion_id
            and frueher.grading_result_id <> p_grading_result_id
       )
     group by rc.competency_id
  )
  insert into public.competency_state
    (user_id, competency_id, mastery_score, attempts, correct_attempts, last_seen_at)
  select v_user, b.competency_id,
         public.mastery_neu(0, 0, b.punkte / nullif(b.moeglich, 0)),
         1,
         -- Als Treffer zaehlt, wer die volle Punktzahl der Kompetenz erreicht hat.
         -- Teilpunkte fliessen ueber mastery_score ein, nicht ueber diese Zaehlung --
         -- correct_attempts ist eine Anzahl, kein Anteil.
         case when b.punkte >= b.moeglich then 1 else 0 end,
         now()
    from beruehrt b
  on conflict (user_id, competency_id) do update
     set mastery_score = public.mastery_neu(
           public.competency_state.mastery_score,
           public.competency_state.attempts,
           excluded.mastery_score),
         attempts         = public.competency_state.attempts + 1,
         correct_attempts = public.competency_state.correct_attempts
                            + excluded.correct_attempts,
         last_seen_at     = excluded.last_seen_at,
         recent_trend     = case
           when excluded.mastery_score > public.competency_state.mastery_score + 0.05
             then 'IMPROVING'
           when excluded.mastery_score < public.competency_state.mastery_score - 0.05
             then 'DECLINING'
           else 'STABLE'
         end::public.trend_direction;

  get diagnostics v_anzahl = row_count;
  return v_anzahl;
end;
$$;


--
-- Name: FUNCTION update_competency_state(p_grading_result_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_competency_state(p_grading_result_id uuid) IS 'Schreibt competency_state fort: Zaehlungen und mastery_neu(). Zaehlt nur die erste Bewertung je (Antwort, Kriterium) -- DETERMINISTIC, AI und MERGED zur selben Antwort sind eine Aufgabe, nicht drei Versuche.';


--
-- Name: update_error_pattern(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_error_pattern(p_grading_result_id uuid) RETURNS integer
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_user     uuid;
  v_answer   uuid;
  v_question uuid;
  v_node     text;
  v_anzahl   integer := 0;
begin
  select gr.user_id, gr.answer_id, a.question_id
    into v_user, v_answer, v_question
    from public.grading_result gr
    join public.answer a on a.id = gr.answer_id
   where gr.id = p_grading_result_id;
  if v_user is null then
    raise exception 'update_error_pattern: Bewertung % existiert nicht',
      p_grading_result_id using errcode = '23503';
  end if;

  -- Die Skill-Ebene wird nur besetzt, wenn sie eindeutig ist. question_skill kennt weder
  -- Gewicht noch Primaermarkierung (0007): traegt eine Aufgabe drei Skill-Knoten, waere
  -- jede Wahl erfunden, und alle drei zu zaehlen vervielfachte denselben Fehler. Die
  -- Kompetenzebene bleibt in jedem Fall belegt, sie steht am Kriterium.
  select case when count(*) = 1 then min(qs.curriculum_node_id) end
    into v_node
    from public.question_skill qs
   where qs.question_id = v_question;

  -- Gezaehlt wird nur die ERSTE Bewertung je (Antwort, Kriterium) -- gleiche Begruendung
  -- wie in update_competency_state (0014): DETERMINISTIC, AI und MERGED zur selben
  -- Antwort sind eine Aufgabe, nicht drei Fehler. Der Vergleich laeuft ueber die blosse
  -- Existenz, nicht ueber created_at: now() ist die Transaktions-, nicht die
  -- Anweisungszeit, zwei Bewertungen derselben Transaktion traegen denselben Zeitstempel.
  with betroffen as (
    select gcr.error_class,
           rc.competency_id,
           count(*) as anzahl
      from public.grading_criterion_result gcr
      join public.rubric_criterion rc on rc.id = gcr.rubric_criterion_id
     where gcr.grading_result_id = p_grading_result_id
       and gcr.error_class is not null
       and not gcr.is_met
       and not exists (
         select 1
           from public.grading_criterion_result frueher
           join public.grading_result gr on gr.id = frueher.grading_result_id
          where gr.answer_id = v_answer
            and frueher.rubric_criterion_id = gcr.rubric_criterion_id
            and frueher.grading_result_id <> p_grading_result_id
       )
     -- Ein Kriterium ohne Kompetenz zaehlt mit, competency_id bleibt dann null: die
     -- Klasse allein ist auch ohne Zuordnung ein Befund, und error_pattern_scope ist mit
     -- "nulls not distinct" genau dafuer gebaut. update_competency_state muss solche
     -- Kriterien ueberspringen -- dort gibt es ohne Kompetenz nichts fortzuschreiben.
     group by gcr.error_class, rc.competency_id
  )
  insert into public.error_pattern
    (user_id, error_class, competency_id, curriculum_node_id,
     occurrences, first_seen_at, last_seen_at, last_answer_id)
  select v_user, b.error_class, b.competency_id, v_node,
         b.anzahl, now(), now(), v_answer
    from betroffen b
  on conflict on constraint error_pattern_scope do update
     set occurrences    = public.error_pattern.occurrences + excluded.occurrences,
         last_seen_at   = excluded.last_seen_at,
         last_answer_id = excluded.last_answer_id,
         recent_trend   = public.fehler_trend(
                            public.error_pattern.first_seen_at,
                            public.error_pattern.last_seen_at,
                            public.error_pattern.occurrences,
                            excluded.last_seen_at);

  get diagnostics v_anzahl = row_count;
  return v_anzahl;
end;
$$;


--
-- Name: FUNCTION update_error_pattern(p_grading_result_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_error_pattern(p_grading_result_id uuid) IS 'Schreibt error_pattern fort: je (Fehlerklasse, Kompetenz) eine Zeile mit occurrences. Zaehlt nur die erste Bewertung je (Antwort, Kriterium) und nur nicht erfuellte Kriterien mit gesetzter error_class.';


--
-- Name: write_grading_result(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.write_grading_result(p_answer_id uuid, p_rubric_id uuid, p_result jsonb) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_user_id  uuid;
  v_question uuid;
  v_id       uuid;
  v_review   boolean := coalesce((p_result ->> 'review_required')::boolean, false);
  v_typ      public.grader_type := (p_result ->> 'grader_type')::public.grader_type;
  v_quellen  jsonb := coalesce(p_result -> 'merge_sources', '[]'::jsonb);
  v_genannt  integer;
  v_anzahl   integer;
begin
  select user_id, question_id into v_user_id, v_question
    from public.answer where id = p_answer_id;
  if v_user_id is null then
    raise exception 'write_grading_result: Antwort % existiert nicht', p_answer_id
      using errcode = '23503';
  end if;

  if not exists (
    select 1 from public.rubric
     where id = p_rubric_id and user_id = v_user_id and question_id = v_question
  ) then
    raise exception
      'write_grading_result: Rubrik % gehoert nicht zur Frage % dieser Antwort',
      p_rubric_id, v_question using errcode = '23503';
  end if;

  if jsonb_typeof(v_quellen) <> 'array' then
    raise exception 'write_grading_result: merge_sources muss eine Liste sein, war %',
      jsonb_typeof(v_quellen) using errcode = '22023';
  end if;
  v_genannt := jsonb_array_length(v_quellen);

  -- Dieselbe Bedingung wie in assert_merged_hat_vorstufen_zeile, nur frueher und mit
  -- einer Meldung, die den Aufrufer erreicht.
  if v_typ = 'MERGED' and v_genannt < 2 then
    raise exception
      'write_grading_result: eine MERGED-Bewertung braucht mindestens zwei Vorstufen '
      'in merge_sources, genannt wurden %', v_genannt
      using errcode = '22023';
  end if;
  if v_typ <> 'MERGED' and v_genannt > 0 then
    raise exception
      'write_grading_result: nur eine MERGED-Bewertung fuehrt Vorstufen zusammen, '
      'dies ist %', v_typ
      using errcode = '22023';
  end if;

  insert into public.grading_result (
    user_id, answer_id, rubric_id, grader_type,
    source_ids, confidence, execution_time_ms,
    points_awarded, max_points, review_required, review_status,
    model, model_class, prompt_version_id, workflow_version_id, correlation_id
  ) values (
    v_user_id, p_answer_id, p_rubric_id,
    v_typ,
    coalesce(p_result -> 'source_ids', '[]'::jsonb),
    (p_result ->> 'confidence')::numeric,
    (p_result ->> 'execution_time_ms')::integer,
    (p_result ->> 'points_awarded')::numeric,
    (p_result ->> 'max_points')::numeric,
    v_review,
    case when v_review then 'PENDING' else 'NOT_REQUIRED' end::public.review_status,
    p_result ->> 'model',
    nullif(p_result ->> 'model_class', '')::public.model_class,
    nullif(p_result ->> 'prompt_version_id', '')::uuid,
    nullif(p_result ->> 'workflow_version_id', '')::uuid,
    nullif(p_result ->> 'correlation_id', '')::uuid
  )
  returning id into v_id;

  -- Die Rolle kommt aus der Quellzeile, nicht aus dem Ergebnisdokument. Der Verbund
  -- schluckt eine Kennung, die es nicht gibt, still -- deshalb wird gleich danach
  -- gezaehlt statt darauf zu vertrauen.
  insert into public.grading_result_source
    (grading_result_id, source_grading_result_id, role, answer_id, user_id)
  select v_id, g.id, g.grader_type, p_answer_id, v_user_id
    from jsonb_array_elements_text(v_quellen) as s(kennung)
    join public.grading_result g on g.id = s.kennung::uuid;

  get diagnostics v_anzahl = row_count;
  if v_anzahl <> v_genannt then
    raise exception
      'write_grading_result: merge_sources nennt % Bewertungen, gefunden wurden %',
      v_genannt, v_anzahl using errcode = '23503';
  end if;

  insert into public.grading_criterion_result (
    user_id, grading_result_id, rubric_criterion_id, rubric_id,
    points_awarded, max_points, is_met, detected_value, expected_value_snapshot,
    label_snapshot, rechenweg_snapshot,
    method_points_awarded, error_class, justification, confidence
  )
  select
    v_user_id, v_id,
    (e ->> 'rubric_criterion_id')::uuid,
    p_rubric_id,
    (e ->> 'points_awarded')::numeric,
    (e ->> 'max_points')::numeric,
    (e ->> 'is_met')::boolean,
    e -> 'detected_value',
    e -> 'expected_value_snapshot',
    -- Codex-Befund zu PR #151: Die Formulierung kommt aus der Kriteriumszeile
    -- selbst, damit die Momentaufnahme fuer jeden Schreiber stimmt -- eines, das
    -- das Feld leer laesst (die Form von vor 0051) oder falsch fuellt, hinterlaesst
    -- sonst ein NULL oder eine fremde Formulierung. Der Verbund unten ist links
    -- und der Fremdschluessel bleibt der Waechter: eine Kennung, die es nicht
    -- gibt, scheitert wie zuvor am Insert, statt still wegzufallen (dieselbe
    -- Regel wie bei merge_sources oben).
    coalesce(rc.label, e ->> 'label_snapshot'),
    e -> 'rechenweg_snapshot',
    coalesce((e ->> 'method_points_awarded')::boolean, false),
    nullif(e ->> 'error_class', '')::public.error_class,
    e ->> 'justification',
    (e ->> 'confidence')::numeric
  from jsonb_array_elements(p_result -> 'criterion_results') as e
  left join public.rubric_criterion rc on rc.id = (e ->> 'rubric_criterion_id')::uuid;

  get diagnostics v_anzahl = row_count;
  if v_anzahl = 0 then
    raise exception 'write_grading_result: criterion_results ist leer'
      using errcode = '22023';
  end if;

  -- Momentaufnahme (0050): deckt diese Zeile jedes Kriterium ihrer Rubrik ab?
  -- Dieselbe Regel wie v_ap1_bewertung_unvollstaendig, hier einmalig mit vollen Rechten
  -- berechnet und gespeichert -- der Verbund auf rubric_criterion zur Lesezeit bliebe fuer
  -- authenticated leer (Kategorie 1c).
  update public.grading_result gr
     set deckt_rubrik_ab = sub.vollstaendig
    from (
      select count(gcr.rubric_criterion_id) = count(rc.id) as vollstaendig
        from public.rubric_criterion rc
        left join public.grading_criterion_result gcr
          on gcr.grading_result_id = v_id and gcr.rubric_criterion_id = rc.id
       where rc.rubric_id = p_rubric_id and rc.user_id = v_user_id
    ) sub
   where gr.id = v_id;

  perform public.update_competency_state(v_id);
  perform public.update_error_pattern(v_id);
  return v_id;
end;
$$;


--
-- Name: FUNCTION write_grading_result(p_answer_id uuid, p_rubric_id uuid, p_result jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.write_grading_result(p_answer_id uuid, p_rubric_id uuid, p_result jsonb) IS 'Schreibt eine Bewertung samt Kriteriumszeilen, setzt deckt_rubrik_ab (0050) sowie label_snapshot und rechenweg_snapshot je Kriteriumszeile (0051) als Momentaufnahmen und schreibt Lernstand und Fehlerprofil fort. Bei grader_type = MERGED traegt sie zusaetzlich die Vorstufen aus p_result->merge_sources in grading_result_source ein; die Rolle je Vorstufe kommt aus deren eigener Zeile, answer_id und user_id aus dem Aufrufkontext.';


--
-- Name: ai_call_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_call_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    generation_job_id uuid,
    correlation_id uuid NOT NULL,
    model_class public.model_class NOT NULL,
    provider text NOT NULL,
    model_name text NOT NULL,
    grader_type public.grader_type,
    workflow_version text,
    prompt_version text,
    input_tokens integer NOT NULL,
    output_tokens integer NOT NULL,
    cost_basis public.cost_basis DEFAULT 'computed'::public.cost_basis NOT NULL,
    cost_usd numeric(14,8),
    confidence numeric(4,3),
    latency_ms integer,
    retry_count integer DEFAULT 0 NOT NULL,
    error_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_call_log_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
    CONSTRAINT ai_call_log_cost_basis_cost_usd_chk CHECK ((((cost_basis = 'computed'::public.cost_basis) AND (cost_usd IS NOT NULL)) OR ((cost_basis <> 'computed'::public.cost_basis) AND (cost_usd IS NULL)))),
    CONSTRAINT ai_call_log_cost_usd_check CHECK ((cost_usd >= (0)::numeric)),
    CONSTRAINT ai_call_log_input_tokens_check CHECK ((input_tokens >= 0)),
    CONSTRAINT ai_call_log_latency_ms_check CHECK ((latency_ms >= 0)),
    CONSTRAINT ai_call_log_output_tokens_check CHECK ((output_tokens >= 0))
);


--
-- Name: answer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    question_id uuid NOT NULL,
    learning_session_id uuid,
    attempt_no smallint DEFAULT 1 NOT NULL,
    draft_text text,
    answer_text text,
    parsed_value jsonb,
    is_flagged boolean DEFAULT false NOT NULL,
    is_final boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone,
    autosaved_at timestamp with time zone,
    submitted_at timestamp with time zone,
    time_spent_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT answer_attempt_no_check CHECK ((attempt_no > 0)),
    CONSTRAINT answer_final_has_text CHECK (((NOT is_final) OR (answer_text IS NOT NULL))),
    CONSTRAINT answer_final_has_timestamp CHECK ((is_final = (submitted_at IS NOT NULL))),
    CONSTRAINT answer_time_spent_seconds_check CHECK ((time_spent_seconds >= 0))
);


--
-- Name: answer_format; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer_format (
    code text NOT NULL,
    label_de text NOT NULL,
    description text,
    sort_order smallint DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT answer_format_code_check CHECK ((code ~ '^[A-Z][A-Z0-9_]{1,39}$'::text))
);


--
-- Name: attachment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    scenario_id uuid,
    question_id uuid,
    attachment_type_code text NOT NULL,
    "position" smallint DEFAULT 1 NOT NULL,
    title text NOT NULL,
    content_text text,
    content_json jsonb,
    storage_object_path text,
    mime_type text,
    byte_size bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT attachment_binary_needs_object CHECK (((storage_object_path IS NULL) OR (mime_type IS NOT NULL))),
    CONSTRAINT attachment_byte_size_check CHECK ((byte_size > 0)),
    CONSTRAINT attachment_has_content CHECK ((num_nonnulls(content_text, content_json, storage_object_path) >= 1)),
    CONSTRAINT attachment_position_check CHECK (("position" > 0)),
    CONSTRAINT attachment_single_parent CHECK ((num_nonnulls(scenario_id, question_id) = 1))
);


--
-- Name: attachment_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachment_type (
    code text NOT NULL,
    label_de text NOT NULL,
    is_binary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT attachment_type_code_check CHECK ((code ~ '^[A-Z][A-Z0-9_]{1,39}$'::text))
);


--
-- Name: audit_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    actor_kind public.actor_kind NOT NULL,
    user_id uuid,
    correlation_id uuid,
    action text NOT NULL,
    entity_table text,
    entity_id uuid,
    generation_job_id uuid,
    workflow_version_id uuid,
    prompt_version_id uuid,
    duration_ms integer,
    model text,
    model_class public.model_class,
    token_input integer,
    token_output integer,
    retrieval_hits smallint,
    grader_confidence numeric(4,3),
    retry_count smallint,
    error_code text,
    cost_estimate_eur numeric(12,6),
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT audit_event_action_check CHECK ((action ~ '^[a-z0-9_.]{3,64}$'::text)),
    CONSTRAINT audit_event_cost_estimate_eur_check CHECK ((cost_estimate_eur >= (0)::numeric)),
    CONSTRAINT audit_event_duration_ms_check CHECK ((duration_ms >= 0)),
    CONSTRAINT audit_event_entity_table_check CHECK ((entity_table ~ '^[a-z_]{3,63}$'::text)),
    CONSTRAINT audit_event_grader_confidence_check CHECK (((grader_confidence >= (0)::numeric) AND (grader_confidence <= (1)::numeric))),
    CONSTRAINT audit_event_retrieval_hits_check CHECK ((retrieval_hits >= 0)),
    CONSTRAINT audit_event_retry_count_check CHECK ((retry_count >= 0)),
    CONSTRAINT audit_event_token_input_check CHECK ((token_input >= 0)),
    CONSTRAINT audit_event_token_output_check CHECK ((token_output >= 0))
);


--
-- Name: TABLE audit_event; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.audit_event IS 'Ziel der Workflows, nicht der Anwendung. ENTSCHIEDEN 2026-09-08 (OFFENE_ENTSCHEIDUNGEN.md Punkt 14, Option a): nur service_role schreibt hier. Was die Anwendung ueber eine Bewertung zu sagen hat, steht in grading_result -- zwei Schreibpfade waeren zwei Wahrheiten ueber denselben Vorgang.';


--
-- Name: coding_pass; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coding_pass (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    label text NOT NULL,
    method public.assignment_method NOT NULL,
    coder text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    is_gold boolean DEFAULT false NOT NULL,
    kappa_vs_gold numeric(4,3),
    notes text
);


--
-- Name: COLUMN coding_pass.kappa_vs_gold; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.coding_pass.kappa_vs_gold IS 'Cohen''s kappa ueber 12 Kompetenzkategorien. < 0.60 ⇒ Durchgang taugt nicht als Basis eines EMPIRICAL-Gewichtssatzes (Festlegung THEMENGEWICHTUNG.md Abschnitt 3.4).';


--
-- Name: cognitive_level; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cognitive_level (
    code text NOT NULL,
    label_de text NOT NULL,
    description text,
    rank smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cognitive_level_code_check CHECK ((code ~ '^[A-Z][A-Z0-9_]{1,39}$'::text))
);


--
-- Name: competency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competency (
    id text NOT NULL,
    learning_field_id text NOT NULL,
    title text NOT NULL,
    can_do text NOT NULL,
    berufsbildposition_nummer text,
    berufsbildposition_titel text,
    sort_order smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT competency_id_check CHECK ((id ~ '^LF[1-6]\.C[0-9]+$'::text)),
    CONSTRAINT competency_id_prefix CHECK ((id ~~ (learning_field_id || '.C%'::text)))
);


--
-- Name: competency_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competency_state (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    competency_id text NOT NULL,
    mastery_score numeric(4,3) DEFAULT 0 NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    correct_attempts integer DEFAULT 0 NOT NULL,
    average_time_seconds integer,
    recent_trend public.trend_direction DEFAULT 'STABLE'::public.trend_direction NOT NULL,
    confidence numeric(4,3),
    last_seen_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    success_rate numeric(5,4) GENERATED ALWAYS AS (
CASE
    WHEN (attempts = 0) THEN NULL::numeric
    ELSE round(((correct_attempts)::numeric / (attempts)::numeric), 4)
END) STORED,
    CONSTRAINT competency_state_attempts_check CHECK ((attempts >= 0)),
    CONSTRAINT competency_state_average_time_seconds_check CHECK ((average_time_seconds >= 0)),
    CONSTRAINT competency_state_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
    CONSTRAINT competency_state_correct_attempts_check CHECK ((correct_attempts >= 0)),
    CONSTRAINT competency_state_correct_bounded CHECK ((correct_attempts <= attempts)),
    CONSTRAINT competency_state_mastery_score_check CHECK (((mastery_score >= (0)::numeric) AND (mastery_score <= (1)::numeric)))
);


--
-- Name: TABLE competency_state; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.competency_state IS 'common_errors aus Abschnitt 17 ist keine Spalte, sondern die Menge der error_pattern-Zeilen desselben Nutzers zu dieser Kompetenz.';


--
-- Name: COLUMN competency_state.success_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.competency_state.success_rate IS 'Abgeleitet aus attempts und correct_attempts (Masterprompt Abschnitt 17).';


--
-- Name: computation_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.computation_type (
    code text NOT NULL,
    label_de text NOT NULL,
    description text,
    grader_handler text,
    tolerance_default jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT computation_type_code_check CHECK ((code ~ '^[A-Z][A-Z0-9_]{1,39}$'::text))
);


--
-- Name: TABLE computation_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.computation_type IS 'Rechenarten des deterministischen Graders (Masterprompt Abschnitt 9) plus die in competency_graph.json vergebenen computation_type-Codes.';


--
-- Name: curriculum_node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curriculum_node (
    id text NOT NULL,
    node_type public.curriculum_node_type NOT NULL,
    topic_id text NOT NULL,
    parent_id text,
    title text NOT NULL,
    deterministically_gradable boolean DEFAULT false NOT NULL,
    computation_type_code text,
    sort_order smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    parent_node_type public.curriculum_node_type GENERATED ALWAYS AS (
CASE
    WHEN (node_type = 'SKILL'::public.curriculum_node_type) THEN 'SUBTOPIC'::public.curriculum_node_type
    ELSE NULL::public.curriculum_node_type
END) STORED,
    CONSTRAINT curriculum_node_computation_requires_flag CHECK (((computation_type_code IS NULL) OR deterministically_gradable)),
    CONSTRAINT curriculum_node_id_check CHECK ((id ~ '^LF[1-6]\.C[0-9]+\.T[0-9]+\.S[0-9]+(\.K[0-9]+)?$'::text)),
    CONSTRAINT curriculum_node_parent_prefix CHECK (((parent_id IS NULL) OR (id ~~ (parent_id || '.K%'::text)))),
    CONSTRAINT curriculum_node_parentage CHECK ((((node_type = 'SUBTOPIC'::public.curriculum_node_type) AND (parent_id IS NULL)) OR ((node_type = 'SKILL'::public.curriculum_node_type) AND (parent_id IS NOT NULL)))),
    CONSTRAINT curriculum_node_subtopic_not_gradable CHECK (((node_type = 'SKILL'::public.curriculum_node_type) OR (NOT deterministically_gradable))),
    CONSTRAINT curriculum_node_topic_prefix CHECK ((id ~~ (topic_id || '.S%'::text)))
);


--
-- Name: error_pattern; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_pattern (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    error_class public.error_class NOT NULL,
    competency_id text,
    curriculum_node_id text,
    occurrences integer DEFAULT 1 NOT NULL,
    first_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    recent_trend public.trend_direction DEFAULT 'STABLE'::public.trend_direction NOT NULL,
    last_answer_id uuid,
    notes text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT error_pattern_occurrences_check CHECK ((occurrences > 0)),
    CONSTRAINT error_pattern_time_order CHECK ((last_seen_at >= first_seen_at))
);


--
-- Name: exam; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    blueprint_id uuid,
    mode public.learning_mode NOT NULL,
    status public.exam_status DEFAULT 'DRAFT'::public.exam_status NOT NULL,
    title text,
    duration_minutes smallint,
    total_points numeric(6,2),
    points_awarded numeric(6,2),
    started_at timestamp with time zone,
    last_autosave_at timestamp with time zone,
    submitted_at timestamp with time zone,
    graded_at timestamp with time zone,
    generation_job_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exam_duration_minutes_check CHECK (((duration_minutes >= 1) AND (duration_minutes <= 480))),
    CONSTRAINT exam_full_exam_duration CHECK (((mode <> 'FULL_EXAM'::public.learning_mode) OR (duration_minutes = 90))),
    CONSTRAINT exam_graded_needs_submit CHECK (((graded_at IS NULL) OR (submitted_at IS NOT NULL))),
    CONSTRAINT exam_points_awarded_check CHECK ((points_awarded >= (0)::numeric)),
    CONSTRAINT exam_status_timeline CHECK ((((status = 'GRADED'::public.exam_status) = (graded_at IS NOT NULL)) AND ((status = ANY (ARRAY['SUBMITTED'::public.exam_status, 'GRADED'::public.exam_status])) = (submitted_at IS NOT NULL)))),
    CONSTRAINT exam_submitted_needs_start CHECK (((submitted_at IS NULL) OR (started_at IS NOT NULL))),
    CONSTRAINT exam_total_points_check CHECK ((total_points > (0)::numeric))
);


--
-- Name: exam_blueprint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_blueprint (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mode public.learning_mode NOT NULL,
    status public.blueprint_status DEFAULT 'DRAFT'::public.blueprint_status NOT NULL,
    duration_minutes smallint NOT NULL,
    total_points numeric(6,2) NOT NULL,
    expected_minutes smallint,
    competency_distribution jsonb DEFAULT '{}'::jsonb NOT NULL,
    question_type_distribution jsonb DEFAULT '{}'::jsonb NOT NULL,
    difficulty_distribution jsonb DEFAULT '{}'::jsonb NOT NULL,
    scenario_plan jsonb DEFAULT '[]'::jsonb NOT NULL,
    validation_report jsonb,
    generation_job_id uuid,
    workflow_version_id uuid,
    prompt_version_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exam_blueprint_distributions_are_objects CHECK (((jsonb_typeof(competency_distribution) = 'object'::text) AND (jsonb_typeof(question_type_distribution) = 'object'::text) AND (jsonb_typeof(difficulty_distribution) = 'object'::text) AND (jsonb_typeof(scenario_plan) = 'array'::text))),
    CONSTRAINT exam_blueprint_duration_minutes_check CHECK (((duration_minutes >= 1) AND (duration_minutes <= 480))),
    CONSTRAINT exam_blueprint_expected_minutes_check CHECK ((expected_minutes > 0)),
    CONSTRAINT exam_blueprint_total_points_check CHECK ((total_points > (0)::numeric)),
    CONSTRAINT exam_blueprint_validated_has_report CHECK (((status = 'DRAFT'::public.blueprint_status) OR (validation_report IS NOT NULL)))
);


--
-- Name: exam_corpus_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_corpus_entry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_document_id uuid NOT NULL,
    logical_exam_id text NOT NULL,
    exam_year smallint NOT NULL,
    exam_term public.exam_term,
    exam_generation public.exam_generation NOT NULL,
    situation_no smallint,
    situation_title text,
    situation_type_code text,
    task_no smallint NOT NULL,
    subtask_label text,
    points numeric(5,2),
    question_type_code text,
    answer_format_code text,
    computation_type_code text,
    cognitive_level_code text,
    difficulty smallint,
    expected_minutes smallint,
    attachment_type_codes text[] DEFAULT '{}'::text[] NOT NULL,
    task_text text,
    solution_text text,
    extraction_confidence numeric(3,2),
    extraction_job_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exam_corpus_entry_difficulty_check CHECK (((difficulty >= 1) AND (difficulty <= 5))),
    CONSTRAINT exam_corpus_entry_exam_year_check CHECK (((exam_year >= 1996) AND (exam_year <= 2100))),
    CONSTRAINT exam_corpus_entry_expected_minutes_check CHECK ((expected_minutes > 0)),
    CONSTRAINT exam_corpus_entry_extraction_confidence_check CHECK (((extraction_confidence >= (0)::numeric) AND (extraction_confidence <= (1)::numeric))),
    CONSTRAINT exam_corpus_entry_points_check CHECK ((points >= (0)::numeric)),
    CONSTRAINT exam_corpus_entry_situation_no_check CHECK ((situation_no > 0)),
    CONSTRAINT exam_corpus_entry_task_no_check CHECK ((task_no > 0))
);


--
-- Name: exam_corpus_entry_competency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_corpus_entry_competency (
    exam_corpus_entry_id uuid NOT NULL,
    competency_id text NOT NULL
);


--
-- Name: exam_corpus_entry_topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_corpus_entry_topic (
    exam_corpus_entry_id uuid NOT NULL,
    topic_id text NOT NULL
);


--
-- Name: exam_item_assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_item_assignment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exam_corpus_entry_id uuid NOT NULL,
    coding_pass_id uuid NOT NULL,
    competency_id text,
    topic_id text,
    method public.assignment_method NOT NULL,
    confidence numeric(4,3),
    points numeric(5,2) NOT NULL,
    rationale text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exam_item_assignment_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
    CONSTRAINT exam_item_assignment_points_check CHECK ((points > (0)::numeric)),
    CONSTRAINT exam_item_assignment_resolved CHECK (((method = 'UNRESOLVED'::public.assignment_method) = (competency_id IS NULL))),
    CONSTRAINT exam_item_assignment_topic_matches_competency CHECK (((topic_id IS NULL) OR (competency_id IS NULL) OR (topic_id ~~ (competency_id || '.%'::text))))
);


--
-- Name: generation_job; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generation_job (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    job_type public.job_type NOT NULL,
    status public.job_status DEFAULT 'PENDING'::public.job_status NOT NULL,
    progress smallint DEFAULT 0 NOT NULL,
    correlation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    input_hash character(64) NOT NULL,
    input_payload jsonb NOT NULL,
    result_kind public.job_result_kind,
    result_id uuid,
    retry_count smallint DEFAULT 0 NOT NULL,
    error_code text,
    error_message text,
    workflow_version_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    CONSTRAINT generation_job_error_on_failure CHECK (((status <> 'FAILED'::public.job_status) OR (error_code IS NOT NULL))),
    CONSTRAINT generation_job_input_hash_check CHECK ((input_hash ~ '^[0-9a-f]{64}$'::text)),
    CONSTRAINT generation_job_progress_check CHECK (((progress >= 0) AND (progress <= 100))),
    CONSTRAINT generation_job_result_pair CHECK ((num_nonnulls(result_kind, result_id) = ANY (ARRAY[0, 2]))),
    CONSTRAINT generation_job_retry_count_check CHECK ((retry_count >= 0)),
    CONSTRAINT generation_job_terminal_state CHECK (((status = ANY (ARRAY['COMPLETED'::public.job_status, 'FAILED'::public.job_status])) = (finished_at IS NOT NULL)))
);


--
-- Name: grading_criterion_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grading_criterion_result (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    grading_result_id uuid NOT NULL,
    rubric_criterion_id uuid NOT NULL,
    rubric_id uuid NOT NULL,
    points_awarded numeric(5,2) NOT NULL,
    max_points numeric(5,2) NOT NULL,
    is_met boolean NOT NULL,
    detected_value jsonb,
    expected_value_snapshot jsonb,
    method_points_awarded boolean DEFAULT false NOT NULL,
    error_class public.error_class,
    justification text,
    confidence numeric(4,3),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    label_snapshot text,
    rechenweg_snapshot jsonb,
    CONSTRAINT gcr_points_bounded CHECK ((points_awarded <= max_points)),
    CONSTRAINT gcr_unmet_needs_cause CHECK ((is_met OR (error_class IS NOT NULL))),
    CONSTRAINT grading_criterion_result_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
    CONSTRAINT grading_criterion_result_max_points_check CHECK ((max_points > (0)::numeric)),
    CONSTRAINT grading_criterion_result_points_awarded_check CHECK ((points_awarded >= (0)::numeric))
);


--
-- Name: COLUMN grading_criterion_result.label_snapshot; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.grading_criterion_result.label_snapshot IS 'Momentaufnahme von rubric_criterion.label zum Bewertungszeitpunkt, nach demselben Muster wie expected_value_snapshot (0008) und grading_result.deckt_rubrik_ab (0050): rubric_criterion traegt fuer authenticated keine SELECT-Policy (RLS_POLICIES.md, Kategorie 1c, Zeile 199), die Formulierung des Kriteriums muss deshalb beim Bewerten mitgeschrieben werden, sonst bleibt sie dem Pruefling nach der Abgabe unsichtbar. Gesetzt von write_grading_result, nie nachtraeglich geaendert.';


--
-- Name: COLUMN grading_criterion_result.rechenweg_snapshot; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.grading_criterion_result.rechenweg_snapshot IS 'Die benannten Zwischenwerte, mit denen der deterministische Grader den Sollwert gebildet hat (grader/typen.ts, Rechenschritt) -- bisher nur bei KOSTENRECHNUNG_PROZENT (Handelskalkulation). null heisst nicht "verworfen", sondern "diese Rechenart kennt keinen mehrstufigen Weg" oder "eine AI-Zeile, die nicht rechnet". Fuer den Bestand vor dieser Migration immer null: der Rechenweg wurde damals nicht mitgeschrieben.';


--
-- Name: grading_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grading_result (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    answer_id uuid NOT NULL,
    grader_type public.grader_type NOT NULL,
    model text,
    model_class public.model_class,
    workflow_version_id uuid,
    prompt_version_id uuid,
    rubric_id uuid NOT NULL,
    source_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    confidence numeric(4,3),
    execution_time_ms integer,
    points_awarded numeric(5,2) NOT NULL,
    max_points numeric(5,2) NOT NULL,
    review_required boolean DEFAULT false NOT NULL,
    review_status public.review_status DEFAULT 'NOT_REQUIRED'::public.review_status NOT NULL,
    supersedes_id uuid,
    is_final boolean DEFAULT false NOT NULL,
    feedback_text text,
    feedback_json jsonb,
    correlation_id uuid,
    generation_job_id uuid,
    token_input integer,
    token_output integer,
    cost_estimate_eur numeric(12,6),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deckt_rubrik_ab boolean DEFAULT false NOT NULL,
    CONSTRAINT grading_result_ai_is_reproducible CHECK (((grader_type = ANY (ARRAY['DETERMINISTIC'::public.grader_type, 'MERGED'::public.grader_type])) OR ((model IS NOT NULL) AND (prompt_version_id IS NOT NULL)))),
    CONSTRAINT grading_result_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
    CONSTRAINT grading_result_cost_estimate_eur_check CHECK ((cost_estimate_eur >= (0)::numeric)),
    CONSTRAINT grading_result_execution_time_ms_check CHECK ((execution_time_ms >= 0)),
    CONSTRAINT grading_result_final_is_merged CHECK (((NOT is_final) OR (grader_type = 'MERGED'::public.grader_type))),
    CONSTRAINT grading_result_max_points_check CHECK ((max_points > (0)::numeric)),
    CONSTRAINT grading_result_points_awarded_check CHECK ((points_awarded >= (0)::numeric)),
    CONSTRAINT grading_result_points_bounded CHECK ((points_awarded <= max_points)),
    CONSTRAINT grading_result_review_flag CHECK ((review_required = (review_status <> 'NOT_REQUIRED'::public.review_status))),
    CONSTRAINT grading_result_token_input_check CHECK ((token_input >= 0)),
    CONSTRAINT grading_result_token_output_check CHECK ((token_output >= 0))
);


--
-- Name: COLUMN grading_result.deckt_rubrik_ab; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.grading_result.deckt_rubrik_ab IS 'Momentaufnahme zum Schreibzeitpunkt: deckt diese Bewertung jedes Kriterium ihrer Rubrik ab? Dieselbe Regel wie v_ap1_bewertung_unvollstaendig (0046), aber ohne Verbund auf rubric_criterion zur Lesezeit -- der bliebe fuer authenticated leer (RLS_POLICIES.md, Kategorie 1c). grading_result ist bereits SELECT-eigen fuer authenticated (0012); diese Spalte braucht deshalb kein eigenes Recht. Gesetzt von write_grading_result, nie nachtraeglich geaendert.';


--
-- Name: CONSTRAINT grading_result_ai_is_reproducible ON grading_result; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT grading_result_ai_is_reproducible ON public.grading_result IS 'Wer ein Modell aufruft, sagt welches und mit welcher Prompt-Fassung. DETERMINISTIC ruft keins auf, MERGED auch nicht -- dessen Reproduzierbarkeit liegt in den Vorstufen und wird von assert_merged_hat_vorstufen geprueft, nicht hier.';


--
-- Name: grading_result_source; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grading_result_source (
    grading_result_id uuid NOT NULL,
    source_grading_result_id uuid NOT NULL,
    role public.grader_type NOT NULL,
    answer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT grading_result_source_nicht_selbst CHECK ((grading_result_id <> source_grading_result_id)),
    CONSTRAINT grading_result_source_role_not_merged CHECK ((role <> 'MERGED'::public.grader_type))
);


--
-- Name: TABLE grading_result_source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.grading_result_source IS 'Herkunft einer zusammengefuehrten Bewertung: welche Vorstufen sind in sie eingegangen und in welcher Rolle. Ohne sie traegt eine MERGED-Zeile eine Punktzahl, deren Zustandekommen sich nachtraeglich nicht mehr aufloesen laesst.';


--
-- Name: COLUMN grading_result_source.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.grading_result_source.role IS 'Der grader_type der Vorstufe. Doppelt gehalten, damit der Primaerschluessel ohne Verbund auskommt; grading_result_source_rolle_stimmt_fk haelt die Kopie am Original.';


--
-- Name: job_error_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_error_code (
    code text NOT NULL,
    category text NOT NULL,
    retryable boolean NOT NULL,
    label_de text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_error_code_category CHECK ((category = ANY (ARRAY['TRANSIENT'::text, 'RATE_LIMIT'::text, 'TIMEOUT'::text, 'NETWORK'::text, 'VALIDATION'::text, 'PROVIDER_REFUSAL'::text, 'INTERNAL'::text, 'DEAD_LETTER'::text]))),
    CONSTRAINT job_error_code_format CHECK ((code ~ '^[A-Z][A-Z0-9_]{1,39}$'::text))
);


--
-- Name: TABLE job_error_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.job_error_code IS 'Wertemenge fuer generation_job.error_code (JOBMODELL.md Abschnitt 6). Ohne sie ist das Feld freier Text, und derselbe Fehler unter zwei Schreibweisen wird in jeder Auswertung zu zwei Fehlerarten.';


--
-- Name: COLUMN job_error_code.retryable; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.job_error_code.retryable IS 'Ob ein erneuter Versuch ueberhaupt Aussicht hat. generation_job.retry_count zaehlt nur, wie oft es versucht wurde -- nicht, ob es sinnvoll war.';


--
-- Name: learning_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_field (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    hours smallint,
    training_year smallint,
    official_source text NOT NULL,
    sort_order smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT learning_field_hours_check CHECK ((hours > 0)),
    CONSTRAINT learning_field_id_check CHECK ((id ~ '^LF[1-6]$'::text)),
    CONSTRAINT learning_field_training_year_check CHECK (((training_year >= 1) AND (training_year <= 3)))
);


--
-- Name: learning_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    active_seconds integer,
    questions_answered smallint DEFAULT 0 NOT NULL,
    points_earned numeric(6,2),
    points_possible numeric(6,2),
    was_interrupted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT learning_session_active_seconds_check CHECK ((active_seconds >= 0)),
    CONSTRAINT learning_session_points_earned_check CHECK ((points_earned >= (0)::numeric)),
    CONSTRAINT learning_session_points_possible_check CHECK ((points_possible >= (0)::numeric)),
    CONSTRAINT learning_session_questions_answered_check CHECK ((questions_answered >= 0)),
    CONSTRAINT learning_session_time_order CHECK (((ended_at IS NULL) OR (ended_at >= started_at)))
);


--
-- Name: model_class_route; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_class_route (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_class public.model_class NOT NULL,
    primary_model_pricing_id uuid NOT NULL,
    fallback_model_pricing_id uuid,
    notes text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: model_pricing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_pricing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    model_name text NOT NULL,
    pricing_model text DEFAULT 'per_token'::text NOT NULL,
    input_price_per_1k_usd numeric(14,8),
    output_price_per_1k_usd numeric(14,8),
    currency text DEFAULT 'USD'::text NOT NULL,
    pricing_source_url text NOT NULL,
    pricing_checked_at date NOT NULL,
    effective_from date DEFAULT CURRENT_DATE NOT NULL,
    effective_to date,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT model_pricing_price_required CHECK ((((pricing_model = 'per_token'::text) AND (input_price_per_1k_usd IS NOT NULL) AND (output_price_per_1k_usd IS NOT NULL)) OR ((pricing_model <> 'per_token'::text) AND (input_price_per_1k_usd IS NULL) AND (output_price_per_1k_usd IS NULL)))),
    CONSTRAINT model_pricing_pricing_model_check CHECK ((pricing_model = ANY (ARRAY['per_token'::text, 'subscription_quota'::text, 'unknown'::text])))
);


--
-- Name: source_document; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_document (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    relative_path text NOT NULL,
    file_name text NOT NULL,
    slug text NOT NULL,
    sha256 character(64) NOT NULL,
    size_bytes bigint NOT NULL,
    mime_type text DEFAULT 'application/pdf'::text NOT NULL,
    page_count integer,
    producer text,
    creator text,
    pdf_version text,
    is_encrypted boolean DEFAULT false NOT NULL,
    page_size text,
    text_layer public.text_layer NOT NULL,
    text_source public.text_source NOT NULL,
    text_bytes integer,
    final_text_bytes integer,
    chars_per_page numeric(10,2),
    document_title text,
    publisher text,
    document_date_raw text,
    document_date date,
    valid_from date,
    valid_to date,
    source_type public.source_type NOT NULL,
    source_tier public.source_tier NOT NULL,
    document_role public.document_role NOT NULL,
    exam_generation public.exam_generation,
    edition_member_type public.edition_member_type,
    exam_year smallint,
    exam_term public.exam_term,
    logical_exam_id text,
    edition_group text NOT NULL,
    is_edition_primary boolean DEFAULT true NOT NULL,
    duplicate_of uuid,
    contains_solution boolean NOT NULL,
    copyright_status public.copyright_status NOT NULL,
    visibility public.doc_visibility DEFAULT 'INTERNAL'::public.doc_visibility NOT NULL,
    ingestion_status public.ingestion_status DEFAULT 'PENDING'::public.ingestion_status NOT NULL,
    ingestion_error text,
    dify_dataset_id text,
    dify_document_id text,
    indexed_at timestamp with time zone,
    metadata_warnings text[] DEFAULT '{}'::text[] NOT NULL,
    classification_confidence numeric(3,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    counts_in_statistics boolean GENERATED ALWAYS AS ((COALESCE((exam_generation = 'CURRENT_AP1'::public.exam_generation), false) AND (NOT contains_solution) AND is_edition_primary AND (ingestion_status = 'READY'::public.ingestion_status))) STORED,
    CONSTRAINT source_document_chars_per_page_check CHECK ((chars_per_page >= (0)::numeric)),
    CONSTRAINT source_document_classification_confidence_check CHECK (((classification_confidence >= (0)::numeric) AND (classification_confidence <= (1)::numeric))),
    CONSTRAINT source_document_document_date_raw_check CHECK ((document_date_raw ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$'::text)),
    CONSTRAINT source_document_exam_year_check CHECK (((exam_year >= 1996) AND (exam_year <= 2100))),
    CONSTRAINT source_document_final_text_bytes_check CHECK ((final_text_bytes >= 0)),
    CONSTRAINT source_document_indexed_state CHECK (((ingestion_status = 'READY'::public.ingestion_status) = (indexed_at IS NOT NULL))),
    CONSTRAINT source_document_logical_exam_id_check CHECK ((logical_exam_id ~ '^(CURRENT_AP1|LEGACY_ZP|OTHER_EXAM)_[0-9]{4}(_(FRUEHJAHR|HERBST))?$'::text)),
    CONSTRAINT source_document_no_self_duplicate CHECK (((duplicate_of IS NULL) OR (duplicate_of <> id))),
    CONSTRAINT source_document_page_count_check CHECK ((page_count > 0)),
    CONSTRAINT source_document_public_norm_role CHECK (((copyright_status <> 'PUBLIC_NORM'::public.copyright_status) OR (document_role = ANY (ARRAY['LEGAL_NORM'::public.document_role, 'CURRICULUM'::public.document_role, 'INFO_SHEET'::public.document_role])))),
    CONSTRAINT source_document_sha256_check CHECK ((sha256 ~ '^[0-9a-f]{64}$'::text)),
    CONSTRAINT source_document_size_bytes_check CHECK ((size_bytes > 0)),
    CONSTRAINT source_document_solution_implies_flag CHECK (((document_role <> 'SOLUTION'::public.document_role) OR contains_solution)),
    CONSTRAINT source_document_solution_role CHECK (((NOT contains_solution) OR (document_role = ANY (ARRAY['EXAM_TASK'::public.document_role, 'SOLUTION'::public.document_role, 'ANSWER_SHEET'::public.document_role])))),
    CONSTRAINT source_document_solution_visibility CHECK (((NOT contains_solution) OR (visibility = 'PRIVATE_GRADING_ONLY'::public.doc_visibility))),
    CONSTRAINT source_document_text_bytes_check CHECK ((text_bytes >= 0)),
    CONSTRAINT source_document_tier2_scope CHECK (((source_tier <> 'TIER_2'::public.source_tier) OR (exam_generation = 'CURRENT_AP1'::public.exam_generation) OR (document_role = 'OFFICIAL_SAMPLE'::public.document_role))),
    CONSTRAINT source_document_validity_order CHECK (((valid_to IS NULL) OR (valid_from IS NULL) OR (valid_to >= valid_from)))
);


--
-- Name: topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic (
    id text NOT NULL,
    competency_id text NOT NULL,
    title text NOT NULL,
    description text,
    sort_order smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT topic_id_check CHECK ((id ~ '^LF[1-6]\.C[0-9]+\.T[0-9]+$'::text)),
    CONSTRAINT topic_id_prefix CHECK ((id ~~ (competency_id || '.T%'::text)))
);


--
-- Name: mv_topic_frequency; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.mv_topic_frequency AS
 WITH per_topic AS (
         SELECT t.id AS topic_id,
            c.id AS competency_id,
            lf.id AS learning_field_id,
            count(DISTINCT e.id) FILTER (WHERE d.counts_in_statistics) AS task_count,
            COALESCE(sum(e.points) FILTER (WHERE d.counts_in_statistics), (0)::numeric) AS points_total
           FROM (((((public.topic t
             JOIN public.competency c ON ((c.id = t.competency_id)))
             JOIN public.learning_field lf ON ((lf.id = c.learning_field_id)))
             LEFT JOIN public.exam_corpus_entry_topic et ON ((et.topic_id = t.id)))
             LEFT JOIN public.exam_corpus_entry e ON ((e.id = et.exam_corpus_entry_id)))
             LEFT JOIN public.source_document d ON ((d.id = e.source_document_id)))
          GROUP BY t.id, c.id, lf.id
        )
 SELECT topic_id,
    competency_id,
    learning_field_id,
    task_count,
    points_total,
    round((points_total / NULLIF(sum(points_total) OVER (), (0)::numeric)), 6) AS weight
   FROM per_topic
  WITH NO DATA;


--
-- Name: MATERIALIZED VIEW mv_topic_frequency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON MATERIALIZED VIEW public.mv_topic_frequency IS 'Wird von NW-03 batch_corpus_analysis und NW-05 scheduled_quality_audit aktualisiert. Enthaelt ausschliesslich geteilte Stammdaten, kein user_id. Rein deskriptiv (Trefferzaehler je Thema) - speist keine Gewichtung.';


--
-- Name: prompt_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompt_version (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prompt_key text NOT NULL,
    version text NOT NULL,
    workflow_version_id uuid,
    template_hash character(64) NOT NULL,
    model text,
    model_class public.model_class,
    is_active boolean DEFAULT false NOT NULL,
    activated_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT prompt_version_prompt_key_check CHECK ((prompt_key ~ '^[a-z0-9_]{3,64}$'::text)),
    CONSTRAINT prompt_version_template_hash_check CHECK ((template_hash ~ '^[0-9a-f]{64}$'::text)),
    CONSTRAINT prompt_version_version_check CHECK ((version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'::text))
);


--
-- Name: question; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    scenario_id uuid NOT NULL,
    "position" smallint NOT NULL,
    prompt text NOT NULL,
    question_type_code text,
    answer_format_code text,
    cognitive_level_code text,
    computation_type_code text,
    difficulty smallint,
    max_points numeric(5,2) NOT NULL,
    expected_minutes smallint,
    reference_answer text,
    status public.question_status DEFAULT 'DRAFT'::public.question_status NOT NULL,
    similarity_score numeric(5,4),
    similarity_verdict public.similarity_verdict,
    similarity_checked_at timestamp with time zone,
    similarity_reference_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    workflow_version_id uuid,
    prompt_version_id uuid,
    generation_job_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT question_difficulty_check CHECK (((difficulty >= 1) AND (difficulty <= 5))),
    CONSTRAINT question_expected_minutes_check CHECK ((expected_minutes > 0)),
    CONSTRAINT question_max_points_check CHECK ((max_points > (0)::numeric)),
    CONSTRAINT question_position_check CHECK (("position" > 0)),
    CONSTRAINT question_published_needs_pass CHECK (((status <> 'PUBLISHED'::public.question_status) OR (similarity_verdict = 'PASS'::public.similarity_verdict))),
    CONSTRAINT question_reject_on_similarity CHECK (((similarity_verdict IS DISTINCT FROM 'REJECT_GENERATED_QUESTION'::public.similarity_verdict) OR (status = 'REJECTED'::public.question_status))),
    CONSTRAINT question_similarity_pair CHECK ((num_nonnulls(similarity_verdict, similarity_checked_at) = ANY (ARRAY[0, 2]))),
    CONSTRAINT question_similarity_score_check CHECK (((similarity_score >= (0)::numeric) AND (similarity_score <= (1)::numeric)))
);


--
-- Name: question_competency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_competency (
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    competency_id text NOT NULL,
    weight numeric(4,3) DEFAULT 1.0 NOT NULL,
    CONSTRAINT question_competency_weight_check CHECK (((weight > (0)::numeric) AND (weight <= (1)::numeric)))
);


--
-- Name: question_skill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_skill (
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    curriculum_node_id text NOT NULL
);


--
-- Name: question_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_type (
    code text NOT NULL,
    label_de text NOT NULL,
    description text,
    sort_order smallint DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT question_type_code_check CHECK ((code ~ '^[A-Z][A-Z0-9_]{1,39}$'::text))
);


--
-- Name: TABLE question_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.question_type IS 'Aufgabentyp (Masterprompt Abschnitt 13). Werte entstehen aus NW-03 batch_corpus_analysis.';


--
-- Name: readiness_snapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.readiness_snapshot (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL,
    weight_set_id uuid NOT NULL,
    weight_provenance public.weight_provenance NOT NULL,
    mastery jsonb NOT NULL,
    score numeric(5,2) NOT NULL,
    score_low numeric(5,2),
    score_high numeric(5,2),
    covered_weight numeric(9,8) NOT NULL,
    trigger_event text,
    CONSTRAINT readiness_snapshot_band_ordered CHECK (((score_low IS NULL) OR (score_high IS NULL) OR (score_low <= score_high))),
    CONSTRAINT readiness_snapshot_mastery_is_object CHECK ((jsonb_typeof(mastery) = 'object'::text)),
    CONSTRAINT readiness_snapshot_score_check CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric))),
    CONSTRAINT readiness_snapshot_score_high_check CHECK (((score_high >= (0)::numeric) AND (score_high <= (100)::numeric))),
    CONSTRAINT readiness_snapshot_score_low_check CHECK (((score_low >= (0)::numeric) AND (score_low <= (100)::numeric)))
);


--
-- Name: COLUMN readiness_snapshot.mastery; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.readiness_snapshot.mastery IS 'Eingefrorener Mastery-Vektor zum Zeitpunkt der Berechnung. Zusammen mit weight_set_id ist der Score damit byte-genau reproduzierbar, auch nachdem ein neuer Gewichtssatz aktiv wurde.';


--
-- Name: COLUMN readiness_snapshot.covered_weight; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.readiness_snapshot.covered_weight IS 'Anteil der Gewichtsmasse, fuer den ueberhaupt ein mastery-Wert vorlag. Unter 1.0 ist der Score ueber die abgedeckten Kompetenzen renormiert — die Oberflaeche muss das kenntlich machen.';


--
-- Name: rubric; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rubric (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    version smallint DEFAULT 1 NOT NULL,
    total_points numeric(5,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT rubric_total_points_check CHECK ((total_points > (0)::numeric)),
    CONSTRAINT rubric_version_check CHECK ((version > 0))
);


--
-- Name: rubric_criterion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rubric_criterion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    rubric_id uuid NOT NULL,
    "position" smallint NOT NULL,
    label text NOT NULL,
    description text,
    max_points numeric(5,2) NOT NULL,
    kind public.criterion_kind NOT NULL,
    computation_type_code text,
    expected_value jsonb,
    tolerance jsonb,
    unit text,
    accepted_alternatives text[] DEFAULT '{}'::text[] NOT NULL,
    awards_method_points boolean DEFAULT false NOT NULL,
    competency_id text,
    error_class_hint public.error_class,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT rubric_criterion_deterministic_needs_expected CHECK (((kind <> 'DETERMINISTIC'::public.criterion_kind) OR (expected_value IS NOT NULL))),
    CONSTRAINT rubric_criterion_max_points_check CHECK ((max_points > (0)::numeric)),
    CONSTRAINT rubric_criterion_position_check CHECK (("position" > 0)),
    CONSTRAINT rubric_criterion_qualitative_has_no_expected CHECK (((kind <> 'QUALITATIVE'::public.criterion_kind) OR ((expected_value IS NULL) AND (tolerance IS NULL) AND (computation_type_code IS NULL))))
);


--
-- Name: scenario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scenario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exam_id uuid NOT NULL,
    "position" smallint NOT NULL,
    title text NOT NULL,
    situation_text text NOT NULL,
    company_context text,
    situation_type_code text,
    expected_minutes smallint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT scenario_expected_minutes_check CHECK ((expected_minutes > 0)),
    CONSTRAINT scenario_position_check CHECK (("position" > 0))
);


--
-- Name: situation_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.situation_type (
    code text NOT NULL,
    label_de text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT situation_type_code_check CHECK ((code ~ '^[A-Z][A-Z0-9_]{1,39}$'::text))
);


--
-- Name: source_chunk_competency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_chunk_competency (
    source_chunk_reference_id uuid NOT NULL,
    competency_id text NOT NULL
);


--
-- Name: source_chunk_reference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_chunk_reference (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_document_id uuid NOT NULL,
    chunk_index integer NOT NULL,
    page_from integer,
    page_to integer,
    char_from integer,
    char_to integer,
    content_hash character(64) NOT NULL,
    content_preview text,
    dify_dataset_id text NOT NULL,
    dify_document_id text NOT NULL,
    dify_segment_id text NOT NULL,
    rag_metadata jsonb NOT NULL,
    indexed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT source_chunk_char_order CHECK (((char_to IS NULL) OR (char_from IS NULL) OR (char_to >= char_from))),
    CONSTRAINT source_chunk_page_order CHECK (((page_to IS NULL) OR (page_from IS NULL) OR (page_to >= page_from))),
    CONSTRAINT source_chunk_rag_metadata_keys CHECK ((rag_metadata ?& ARRAY['source_document_id'::text, 'source_type'::text, 'source_tier'::text, 'document_role'::text, 'contains_solution'::text, 'copyright_status'::text])),
    CONSTRAINT source_chunk_reference_char_from_check CHECK ((char_from >= 0)),
    CONSTRAINT source_chunk_reference_char_to_check CHECK ((char_to >= 0)),
    CONSTRAINT source_chunk_reference_chunk_index_check CHECK ((chunk_index >= 0)),
    CONSTRAINT source_chunk_reference_content_hash_check CHECK ((content_hash ~ '^[0-9a-f]{64}$'::text)),
    CONSTRAINT source_chunk_reference_page_from_check CHECK ((page_from > 0)),
    CONSTRAINT source_chunk_reference_page_to_check CHECK ((page_to > 0))
);


--
-- Name: source_chunk_topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_chunk_topic (
    source_chunk_reference_id uuid NOT NULL,
    topic_id text NOT NULL
);


--
-- Name: source_document_learning_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_document_learning_field (
    source_document_id uuid NOT NULL,
    learning_field_id text NOT NULL
);


--
-- Name: topic_weight; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_weight (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    weight_set_id uuid NOT NULL,
    scope public.weight_scope NOT NULL,
    node_id text NOT NULL,
    weight numeric(9,8) NOT NULL,
    band public.weight_band NOT NULL,
    n_items integer DEFAULT 0 NOT NULL,
    n_points numeric(8,2) DEFAULT 0 NOT NULL,
    ci_low numeric(9,8),
    ci_high numeric(9,8),
    is_empirical boolean DEFAULT false NOT NULL,
    CONSTRAINT topic_weight_ci_high_check CHECK ((ci_high <= (1)::numeric)),
    CONSTRAINT topic_weight_ci_low_check CHECK ((ci_low >= (0)::numeric)),
    CONSTRAINT topic_weight_ci_ordered CHECK (((ci_low IS NULL) OR (ci_high IS NULL) OR (ci_low <= ci_high))),
    CONSTRAINT topic_weight_no_topic_scope CHECK ((scope <> 'TOPIC'::public.weight_scope)),
    CONSTRAINT topic_weight_weight_check CHECK (((weight >= (0)::numeric) AND (weight <= (1)::numeric)))
);


--
-- Name: COLUMN topic_weight.node_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.topic_weight.node_id IS 'Kein Fremdschluessel: das Ziel haengt vom scope ab (COMPETENCY -> public.competency, LEARNING_FIELD -> public.learning_field), und PostgreSQL kennt keinen bedingten Fremdschluessel. tg_topic_weight_set_sealed (Abschnitt 4.5) prueft beim Versiegeln stattdessen, dass jede node_id in der zum scope passenden Tabelle existiert -- Zaehl- und Summenpruefung allein wuerden einen Satz mit richtiger Anzahl, aber erfundenen oder falsch geschriebenen IDs durchlassen.';


--
-- Name: CONSTRAINT topic_weight_no_topic_scope ON topic_weight; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT topic_weight_no_topic_scope ON public.topic_weight IS 'Bei n_effective ~63 ist das 95%-Konfidenzintervall eines Themengewichts breiter als der Schaetzwert selbst und enthaelt die Null (THEMENGEWICHTUNG.md Abschnitt 2.3). Themen werden in exam_item_assignment.topic_id gezaehlt, aber nicht gewichtet.';


--
-- Name: topic_weight_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_weight_set (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    label text NOT NULL,
    provenance public.weight_provenance NOT NULL,
    basis_coding_pass_id uuid,
    n_exam_terms integer DEFAULT 0 NOT NULL,
    n_items integer DEFAULT 0 NOT NULL,
    n_points numeric(8,2) DEFAULT 0 NOT NULL,
    design_effect numeric(5,3),
    n_effective numeric(8,2),
    computed_at timestamp with time zone DEFAULT now() NOT NULL,
    sealed_at timestamp with time zone,
    is_active boolean DEFAULT false NOT NULL,
    notes text,
    CONSTRAINT topic_weight_set_active_is_sealed CHECK (((NOT is_active) OR (sealed_at IS NOT NULL))),
    CONSTRAINT topic_weight_set_empirical_has_basis CHECK (((provenance <> 'EMPIRICAL'::public.weight_provenance) OR ((basis_coding_pass_id IS NOT NULL) AND (n_items > 0) AND (n_exam_terms > 0))))
);


--
-- Name: uebung_skill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uebung_skill (
    competency_id text NOT NULL,
    computation_type_code text NOT NULL,
    curriculum_node_id text NOT NULL,
    begruendung text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE uebung_skill; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.uebung_skill IS 'Welcher Lehrplan-Skill zu einer Aufgabe gehoert, bestimmt aus Kompetenz und Rechenart. Gelesen von uebung_skills_setzen(); leer bleibt, was der Lehrplan nicht benennt.';


--
-- Name: COLUMN uebung_skill.begruendung; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.uebung_skill.begruendung IS 'Der Titel des Knotens, gekuerzt -- damit beim Lesen der Zeile nachvollziehbar ist, warum gerade dieser Skill und nicht der Nachbarknoten.';


--
-- Name: uebungspruefung; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uebungspruefung (
    code text NOT NULL,
    title text NOT NULL,
    beschreibung text NOT NULL,
    total_points numeric(5,2) NOT NULL,
    sort_order smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT uebungspruefung_code_check CHECK ((code ~ '^[a-z][a-z0-9_]{1,39}$'::text)),
    CONSTRAINT uebungspruefung_total_points_check CHECK ((total_points > (0)::numeric))
);


--
-- Name: TABLE uebungspruefung; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.uebungspruefung IS 'Die festen Uebungspruefungen (0016, 0023): Code fuer uebungspruefung_anlegen(code), Titel als Schluessel der offenen Uebung (Teilindex 0021), ein Satz fuer die Oberflaeche.';


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profile (
    id uuid NOT NULL,
    display_name text,
    target_exam_year smallint,
    target_exam_term public.exam_term,
    daily_goal_minutes smallint,
    locale text DEFAULT 'de-DE'::text NOT NULL,
    time_zone text DEFAULT 'Europe/Berlin'::text NOT NULL,
    onboarding_completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_profile_daily_goal_minutes_check CHECK (((daily_goal_minutes >= 0) AND (daily_goal_minutes <= 1440))),
    CONSTRAINT user_profile_target_exam_year_check CHECK (((target_exam_year >= 2020) AND (target_exam_year <= 2100)))
);


--
-- Name: TABLE user_profile; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_profile IS 'Kein readiness_score: der AP1 Readiness Score ist abgeleitet (CONTEXT.md Zeile 46), siehe View public.v_ap1_readiness in Migration 0011.';


--
-- Name: v_ap1_bewertung_unvollstaendig; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ap1_bewertung_unvollstaendig WITH (security_invoker='true') AS
 SELECT gr.id AS grading_result_id,
    gr.user_id,
    gr.answer_id,
    gr.rubric_id,
    gr.grader_type,
    count(rc.id) AS kriterien_gesamt,
    count(gcr.rubric_criterion_id) AS kriterien_bewertet,
    (count(rc.id) - count(gcr.rubric_criterion_id)) AS kriterien_offen,
    array_agg((rc.kind)::text ORDER BY rc."position") FILTER (WHERE (gcr.rubric_criterion_id IS NULL)) AS offene_arten
   FROM ((public.grading_result gr
     JOIN public.rubric_criterion rc ON (((rc.rubric_id = gr.rubric_id) AND (rc.user_id = gr.user_id))))
     LEFT JOIN public.grading_criterion_result gcr ON (((gcr.grading_result_id = gr.id) AND (gcr.rubric_criterion_id = rc.id))))
  GROUP BY gr.id, gr.user_id, gr.answer_id, gr.rubric_id, gr.grader_type
 HAVING (count(gcr.rubric_criterion_id) < count(rc.id));


--
-- Name: VIEW v_ap1_bewertung_unvollstaendig; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_ap1_bewertung_unvollstaendig IS 'Bewertungen, die nicht jedes Kriterium ihrer Rubrik abdecken -- der Zustand nach einem Dify-Ausfall (CONVENTIONS.md, Graceful Degradation). Abgeleitet, nicht gespeichert: rubric_criterion sagt, was es gibt, grading_criterion_result, was bewertet wurde.';


--
-- Name: v_ap1_fehlerprofil; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ap1_fehlerprofil WITH (security_invoker='true') AS
 SELECT ep.user_id,
    ep.error_class,
    ep.occurrences,
    ep.first_seen_at,
    ep.last_seen_at,
    ep.recent_trend,
    ep.competency_id,
    c.title AS kompetenz,
    c.learning_field_id,
    lf.title AS lernfeld,
    ep.curriculum_node_id,
    n.title AS skill,
    ep.last_answer_id,
    q.id AS letzte_frage_id,
    q."position" AS letzte_aufgabe_position,
    q.prompt AS letzte_aufgabe,
    e.id AS letzte_pruefung_id,
    e.title AS letzte_pruefung
   FROM ((((((public.error_pattern ep
     LEFT JOIN public.competency c ON ((c.id = ep.competency_id)))
     LEFT JOIN public.learning_field lf ON ((lf.id = c.learning_field_id)))
     LEFT JOIN public.curriculum_node n ON ((n.id = ep.curriculum_node_id)))
     LEFT JOIN public.answer a ON (((a.id = ep.last_answer_id) AND (a.user_id = ep.user_id))))
     LEFT JOIN public.question q ON (((q.id = a.question_id) AND (q.user_id = a.user_id))))
     LEFT JOIN public.exam e ON (((e.id = a.exam_id) AND (e.user_id = a.user_id))));


--
-- Name: VIEW v_ap1_fehlerprofil; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_ap1_fehlerprofil IS 'Das Fehlerprofil eines Prueflings mit aufgeloesten Namen: Fehlerklasse, Haeufigkeit, Trend, Kompetenz und Lernfeld, Skill aus dem Lehrplan und die Aufgabe, bei der der Fehler zuletzt auftrat. Aeussere Verbuende: Zeilen ohne Kompetenz, ohne Skill oder ohne Antwort bleiben sichtbar. security_invoker: jeder sieht nur seine eigenen Zeilen. Keine Sortierung -- der Aufrufer ordnet, meist nach occurrences absteigend.';


--
-- Name: v_ap1_nachpruefung; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ap1_nachpruefung WITH (security_invoker='true') AS
 SELECT gr.user_id,
    gr.id AS grading_result_id,
    gr.grader_type,
    gr.review_status,
    gr.confidence AS bewertung_konfidenz,
    gr.created_at AS bewertet_am,
    a.id AS answer_id,
    a.answer_text,
    a.submitted_at,
    e.id AS exam_id,
    e.title AS exam_title,
    e.status AS exam_status,
    q.id AS question_id,
    q."position" AS aufgabe_position,
    q.prompt AS aufgabe,
    gcr.rubric_criterion_id,
    gcr.created_at AS kriterium_bewertet_am,
    gcr.is_met,
    gcr.points_awarded,
    gcr.max_points,
    gcr.detected_value,
    gcr.error_class,
    gcr.justification,
    gcr.confidence AS kriterium_konfidenz
   FROM ((((public.grading_result gr
     JOIN public.grading_criterion_result gcr ON (((gcr.grading_result_id = gr.id) AND (gcr.user_id = gr.user_id))))
     JOIN public.answer a ON (((a.id = gr.answer_id) AND (a.user_id = gr.user_id))))
     JOIN public.question q ON (((q.id = a.question_id) AND (q.user_id = a.user_id))))
     LEFT JOIN public.exam e ON (((e.id = a.exam_id) AND (e.user_id = a.user_id))))
  WHERE (gr.review_required AND (gr.review_status = 'PENDING'::public.review_status));


--
-- Name: VIEW v_ap1_nachpruefung; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_ap1_nachpruefung IS 'Arbeitsliste der offenen Nachpruefungen. Filtert auf den Bearbeitungsstand (PENDING), nicht auf die Tatsache (review_required) -- sonst bliebe jede quittierte Zeile stehen. security_invoker, damit die Policies der Basistabellen durchgreifen.';


--
-- Name: v_ap1_readiness; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ap1_readiness WITH (security_invoker='true') AS
 WITH competency_weight AS (
         SELECT tw.node_id AS competency_id,
            tw.weight
           FROM (public.topic_weight tw
             JOIN public.topic_weight_set tws ON ((tws.id = tw.weight_set_id)))
          WHERE (tws.is_active AND (tw.scope = 'COMPETENCY'::public.weight_scope))
        )
 SELECT cs.user_id,
    round((((100)::numeric * sum((cs.mastery_score * w.weight))) / NULLIF(sum(w.weight), (0)::numeric)), 1) AS readiness_score,
    count(*) FILTER (WHERE (w.weight > (0)::numeric)) AS weighted_competencies,
    round(sum(w.weight), 8) AS covered_weight,
    max(cs.last_seen_at) AS last_activity_at
   FROM (public.competency_state cs
     JOIN competency_weight w ON ((w.competency_id = cs.competency_id)))
  GROUP BY cs.user_id;


--
-- Name: VIEW v_ap1_readiness; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_ap1_readiness IS 'Gewichteter Aggregat aus CompetencyState.mastery_score nach dem aktiven topic_weight_set (THEMENGEWICHTUNG.md, Ticket 20), nicht nach Themenhaeufigkeit. Kein Roh-Durchschnitt, kein gespeichertes Feld. covered_weight ist die Gewichtsmasse mit vorhandenem CompetencyState (Semantik wie readiness_snapshot.covered_weight/readiness_score() in THEMENGEWICHTUNG.md) - liegt sie unter der Gesamtmasse des aktiven Satzes, ist der Score renormiert und deckt nur einen Teil ab.';


--
-- Name: v_kb_zuordnung; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_kb_zuordnung WITH (security_invoker='true') AS
 SELECT id AS source_document_id,
    relative_path,
    document_title,
    source_tier,
    document_role,
    exam_generation,
    contains_solution,
    edition_member_type,
    ingestion_status,
        CASE
            WHEN ((source_tier = 'TIER_1'::public.source_tier) AND (document_role = ANY (ARRAY['LEGAL_NORM'::public.document_role, 'CURRICULUM'::public.document_role, 'INFO_SHEET'::public.document_role]))) THEN 'KB-01'::text
            WHEN ((document_role = ANY (ARRAY['EXAM_TASK'::public.document_role, 'ANSWER_SHEET'::public.document_role])) AND (NOT contains_solution)) THEN 'KB-02'::text
            WHEN ((document_role = 'SOLUTION'::public.document_role) AND contains_solution AND (exam_generation IS DISTINCT FROM 'OTHER_EXAM'::public.exam_generation)) THEN 'KB-03'::text
            WHEN ((source_tier = 'TIER_3'::public.source_tier) OR (document_role = ANY (ARRAY['REFERENCE'::public.document_role, 'OFFICIAL_SAMPLE'::public.document_role]))) THEN 'KB-04'::text
            ELSE NULL::text
        END AS dataset_code,
        CASE
            WHEN ((source_tier = 'TIER_1'::public.source_tier) AND (document_role = ANY (ARRAY['LEGAL_NORM'::public.document_role, 'CURRICULUM'::public.document_role, 'INFO_SHEET'::public.document_role]))) THEN NULL::text
            WHEN ((document_role = ANY (ARRAY['EXAM_TASK'::public.document_role, 'ANSWER_SHEET'::public.document_role])) AND (NOT contains_solution)) THEN NULL::text
            WHEN ((document_role = 'SOLUTION'::public.document_role) AND contains_solution AND (exam_generation IS DISTINCT FROM 'OTHER_EXAM'::public.exam_generation)) THEN NULL::text
            WHEN ((source_tier = 'TIER_3'::public.source_tier) OR (document_role = ANY (ARRAY['REFERENCE'::public.document_role, 'OFFICIAL_SAMPLE'::public.document_role]))) THEN NULL::text
            WHEN ((document_role = 'SOLUTION'::public.document_role) AND (exam_generation = 'OTHER_EXAM'::public.exam_generation)) THEN 'Sammel-PDF: ADR-0004 haelt es aus allen Knowledge Bases heraus'::text
            WHEN ((edition_member_type = 'COMPOSITE_COPY'::public.edition_member_type) AND contains_solution) THEN 'Aufgabe und Loesung in derselben Datei: braucht einen Splitschritt vor dem Upload'::text
            WHEN ((document_role = 'CURRICULUM'::public.document_role) AND (source_tier = 'TIER_4'::public.source_tier)) THEN 'Curriculumdokument ohne Zielort: TIER_4 faellt aus KB-01 und KB-04'::text
            ELSE 'nicht zugeordnet und nicht als Ausnahme benannt'::text
        END AS ausschlussgrund
   FROM public.source_document d;


--
-- Name: VIEW v_kb_zuordnung; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_kb_zuordnung IS 'Zuordnung Dokument -> Dify-Dataset nach DIFY_KNOWLEDGE_BASES.md 4.2. dataset_code ist null, wenn das Dokument in keine Knowledge Base gehoert; ausschlussgrund sagt dann, warum. Genau eine der beiden Spalten ist gefuellt.';


--
-- Name: v_kb_verstoss; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_kb_verstoss WITH (security_invoker='true') AS
 WITH belegt AS (
         SELECT DISTINCT c.dify_dataset_id,
            c.source_document_id,
            z.dataset_code,
            z.ausschlussgrund,
            d.contains_solution,
            d.relative_path
           FROM ((public.source_chunk_reference c
             JOIN public.source_document d ON ((d.id = c.source_document_id)))
             JOIN public.v_kb_zuordnung z ON ((z.source_document_id = c.source_document_id)))
        ), je_dataset AS (
         SELECT belegt.dify_dataset_id,
            count(DISTINCT belegt.dataset_code) AS codes,
            count(DISTINCT belegt.contains_solution) AS loesungswerte
           FROM belegt
          GROUP BY belegt.dify_dataset_id
        )
 SELECT 'gemischte_loesung'::text AS art,
    b.dify_dataset_id,
    b.source_document_id,
    b.relative_path,
    b.dataset_code,
    b.contains_solution,
    b.ausschlussgrund
   FROM (belegt b
     JOIN je_dataset j USING (dify_dataset_id))
  WHERE (j.loesungswerte > 1)
UNION ALL
 SELECT 'gemischter_code'::text AS art,
    b.dify_dataset_id,
    b.source_document_id,
    b.relative_path,
    b.dataset_code,
    b.contains_solution,
    b.ausschlussgrund
   FROM (belegt b
     JOIN je_dataset j USING (dify_dataset_id))
  WHERE (j.codes > 1)
UNION ALL
 SELECT 'ohne_zielort'::text AS art,
    b.dify_dataset_id,
    b.source_document_id,
    b.relative_path,
    b.dataset_code,
    b.contains_solution,
    b.ausschlussgrund
   FROM belegt b
  WHERE (b.dataset_code IS NULL);


--
-- Name: VIEW v_kb_verstoss; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_kb_verstoss IS 'Belegstellen, deren Dify-Dataset nicht zur Zuordnung aus v_kb_zuordnung passt. Leer, wenn alles stimmt. art: gemischte_loesung (Loesungs- und Aufgabentext im selben Dataset -- bricht die Trennung KB-02/KB-03), gemischter_code (ein Dataset traegt mehrere Knowledge Bases), ohne_zielort (indexiert, obwohl 0033 keinen Ort nennt).';


--
-- Name: v_source_chunk_rag_metadata; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_source_chunk_rag_metadata WITH (security_invoker='true') AS
 SELECT ch.id AS chunk_id,
    ch.dify_dataset_id,
    ch.dify_segment_id,
    d.id AS source_document_id,
    d.source_type,
    d.source_tier,
    d.exam_year,
    d.exam_generation,
    d.exam_term,
    COALESCE(( SELECT array_agg(x.learning_field_id ORDER BY x.learning_field_id) AS array_agg
           FROM public.source_document_learning_field x
          WHERE (x.source_document_id = d.id)), '{}'::text[]) AS learning_fields,
    COALESCE(( SELECT array_agg(x.competency_id ORDER BY x.competency_id) AS array_agg
           FROM public.source_chunk_competency x
          WHERE (x.source_chunk_reference_id = ch.id)), '{}'::text[]) AS competency_ids,
    COALESCE(( SELECT array_agg(x.topic_id ORDER BY x.topic_id) AS array_agg
           FROM public.source_chunk_topic x
          WHERE (x.source_chunk_reference_id = ch.id)), '{}'::text[]) AS topic_ids,
    d.document_role,
    d.contains_solution,
    d.copyright_status,
    d.visibility AS publication_scope,
    d.valid_from,
    d.valid_to
   FROM (public.source_chunk_reference ch
     JOIN public.source_document d ON ((d.id = ch.source_document_id)));


--
-- Name: workflow_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_version (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    engine public.workflow_engine NOT NULL,
    workflow_key text NOT NULL,
    version text NOT NULL,
    definition_hash character(64) NOT NULL,
    default_model_class public.model_class,
    is_active boolean DEFAULT false NOT NULL,
    activated_at timestamp with time zone,
    deactivated_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT workflow_version_active_dates CHECK (((deactivated_at IS NULL) OR (activated_at IS NOT NULL))),
    CONSTRAINT workflow_version_definition_hash_check CHECK ((definition_hash ~ '^[0-9a-f]{64}$'::text)),
    CONSTRAINT workflow_version_engine_prefix CHECK ((((engine = 'DIFY'::public.workflow_engine) AND (workflow_key ~~ 'WF-%'::text)) OR ((engine = 'N8N'::public.workflow_engine) AND (workflow_key ~~ 'NW-%'::text)))),
    CONSTRAINT workflow_version_version_check CHECK ((version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'::text)),
    CONSTRAINT workflow_version_workflow_key_check CHECK ((workflow_key ~ '^(WF|NW)-[0-9]{2}_[a-z0-9_]+$'::text))
);


--
-- Name: ai_call_log ai_call_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_call_log
    ADD CONSTRAINT ai_call_log_pkey PRIMARY KEY (id);


--
-- Name: answer_format answer_format_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_format
    ADD CONSTRAINT answer_format_pkey PRIMARY KEY (code);


--
-- Name: answer answer_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_id_user_uk UNIQUE (id, user_id);


--
-- Name: answer answer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (id);


--
-- Name: answer answer_question_id_attempt_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_question_id_attempt_no_key UNIQUE (question_id, attempt_no);


--
-- Name: attachment attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment
    ADD CONSTRAINT attachment_pkey PRIMARY KEY (id);


--
-- Name: attachment_type attachment_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment_type
    ADD CONSTRAINT attachment_type_pkey PRIMARY KEY (code);


--
-- Name: audit_event audit_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_pkey PRIMARY KEY (id);


--
-- Name: coding_pass coding_pass_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_pass
    ADD CONSTRAINT coding_pass_label_key UNIQUE (label);


--
-- Name: coding_pass coding_pass_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_pass
    ADD CONSTRAINT coding_pass_pkey PRIMARY KEY (id);


--
-- Name: cognitive_level cognitive_level_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cognitive_level
    ADD CONSTRAINT cognitive_level_pkey PRIMARY KEY (code);


--
-- Name: cognitive_level cognitive_level_rank_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cognitive_level
    ADD CONSTRAINT cognitive_level_rank_key UNIQUE (rank);


--
-- Name: competency competency_learning_field_id_sort_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency
    ADD CONSTRAINT competency_learning_field_id_sort_order_key UNIQUE (learning_field_id, sort_order);


--
-- Name: competency competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency
    ADD CONSTRAINT competency_pkey PRIMARY KEY (id);


--
-- Name: competency_state competency_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_state
    ADD CONSTRAINT competency_state_pkey PRIMARY KEY (id);


--
-- Name: competency_state competency_state_user_id_competency_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_state
    ADD CONSTRAINT competency_state_user_id_competency_id_key UNIQUE (user_id, competency_id);


--
-- Name: computation_type computation_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.computation_type
    ADD CONSTRAINT computation_type_pkey PRIMARY KEY (code);


--
-- Name: curriculum_node curriculum_node_id_node_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_node
    ADD CONSTRAINT curriculum_node_id_node_type_key UNIQUE (id, node_type);


--
-- Name: curriculum_node curriculum_node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_node
    ADD CONSTRAINT curriculum_node_pkey PRIMARY KEY (id);


--
-- Name: error_pattern error_pattern_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_pattern
    ADD CONSTRAINT error_pattern_pkey PRIMARY KEY (id);


--
-- Name: error_pattern error_pattern_scope; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_pattern
    ADD CONSTRAINT error_pattern_scope UNIQUE NULLS NOT DISTINCT (user_id, error_class, competency_id, curriculum_node_id);


--
-- Name: exam_blueprint exam_blueprint_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_blueprint
    ADD CONSTRAINT exam_blueprint_id_user_uk UNIQUE (id, user_id);


--
-- Name: exam_blueprint exam_blueprint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_blueprint
    ADD CONSTRAINT exam_blueprint_pkey PRIMARY KEY (id);


--
-- Name: exam_corpus_entry_competency exam_corpus_entry_competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry_competency
    ADD CONSTRAINT exam_corpus_entry_competency_pkey PRIMARY KEY (exam_corpus_entry_id, competency_id);


--
-- Name: exam_corpus_entry exam_corpus_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_pkey PRIMARY KEY (id);


--
-- Name: exam_corpus_entry exam_corpus_entry_position_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_position_uk UNIQUE NULLS NOT DISTINCT (source_document_id, situation_no, task_no, subtask_label);


--
-- Name: exam_corpus_entry_topic exam_corpus_entry_topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry_topic
    ADD CONSTRAINT exam_corpus_entry_topic_pkey PRIMARY KEY (exam_corpus_entry_id, topic_id);


--
-- Name: exam exam_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT exam_id_user_uk UNIQUE (id, user_id);


--
-- Name: exam_item_assignment exam_item_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_item_assignment
    ADD CONSTRAINT exam_item_assignment_pkey PRIMARY KEY (id);


--
-- Name: exam_item_assignment exam_item_assignment_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_item_assignment
    ADD CONSTRAINT exam_item_assignment_unique UNIQUE (exam_corpus_entry_id, coding_pass_id);


--
-- Name: exam exam_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT exam_pkey PRIMARY KEY (id);


--
-- Name: generation_job generation_job_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_job
    ADD CONSTRAINT generation_job_id_user_uk UNIQUE (id, user_id);


--
-- Name: generation_job generation_job_idempotency_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_job
    ADD CONSTRAINT generation_job_idempotency_uk UNIQUE (user_id, job_type, input_hash);


--
-- Name: generation_job generation_job_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_job
    ADD CONSTRAINT generation_job_pkey PRIMARY KEY (id);


--
-- Name: grading_criterion_result grading_criterion_result_grading_result_id_rubric_criterion_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_criterion_result
    ADD CONSTRAINT grading_criterion_result_grading_result_id_rubric_criterion_key UNIQUE (grading_result_id, rubric_criterion_id);


--
-- Name: grading_criterion_result grading_criterion_result_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_criterion_result
    ADD CONSTRAINT grading_criterion_result_pkey PRIMARY KEY (id);


--
-- Name: grading_result grading_result_id_answer_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_id_answer_user_uk UNIQUE (id, answer_id, user_id);


--
-- Name: grading_result grading_result_id_rubric_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_id_rubric_user_uk UNIQUE (id, rubric_id, user_id);


--
-- Name: grading_result grading_result_id_type_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_id_type_uk UNIQUE (id, grader_type);


--
-- Name: grading_result grading_result_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_pkey PRIMARY KEY (id);


--
-- Name: grading_result_source grading_result_source_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result_source
    ADD CONSTRAINT grading_result_source_pkey PRIMARY KEY (grading_result_id, role);


--
-- Name: job_error_code job_error_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_error_code
    ADD CONSTRAINT job_error_code_pkey PRIMARY KEY (code);


--
-- Name: learning_field learning_field_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_field
    ADD CONSTRAINT learning_field_pkey PRIMARY KEY (id);


--
-- Name: learning_field learning_field_sort_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_field
    ADD CONSTRAINT learning_field_sort_order_key UNIQUE (sort_order);


--
-- Name: learning_session learning_session_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session
    ADD CONSTRAINT learning_session_id_user_uk UNIQUE (id, user_id);


--
-- Name: learning_session learning_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session
    ADD CONSTRAINT learning_session_pkey PRIMARY KEY (id);


--
-- Name: model_class_route model_class_route_model_class_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_class_route
    ADD CONSTRAINT model_class_route_model_class_key UNIQUE (model_class);


--
-- Name: model_class_route model_class_route_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_class_route
    ADD CONSTRAINT model_class_route_pkey PRIMARY KEY (id);


--
-- Name: model_pricing model_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_pkey PRIMARY KEY (id);


--
-- Name: model_pricing model_pricing_provider_model_name_effective_from_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_provider_model_name_effective_from_key UNIQUE (provider, model_name, effective_from);


--
-- Name: prompt_version prompt_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_version
    ADD CONSTRAINT prompt_version_pkey PRIMARY KEY (id);


--
-- Name: prompt_version prompt_version_prompt_key_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_version
    ADD CONSTRAINT prompt_version_prompt_key_version_key UNIQUE (prompt_key, version);


--
-- Name: question_competency question_competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_competency
    ADD CONSTRAINT question_competency_pkey PRIMARY KEY (question_id, competency_id);


--
-- Name: question question_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_id_user_uk UNIQUE (id, user_id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: question question_scenario_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_scenario_id_position_key UNIQUE (scenario_id, "position");


--
-- Name: question_skill question_skill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skill
    ADD CONSTRAINT question_skill_pkey PRIMARY KEY (question_id, curriculum_node_id);


--
-- Name: question_type question_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_type
    ADD CONSTRAINT question_type_pkey PRIMARY KEY (code);


--
-- Name: readiness_snapshot readiness_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readiness_snapshot
    ADD CONSTRAINT readiness_snapshot_pkey PRIMARY KEY (id);


--
-- Name: rubric_criterion rubric_criterion_id_rubric_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric_criterion
    ADD CONSTRAINT rubric_criterion_id_rubric_user_uk UNIQUE (id, rubric_id, user_id);


--
-- Name: rubric_criterion rubric_criterion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric_criterion
    ADD CONSTRAINT rubric_criterion_pkey PRIMARY KEY (id);


--
-- Name: rubric_criterion rubric_criterion_rubric_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric_criterion
    ADD CONSTRAINT rubric_criterion_rubric_id_position_key UNIQUE (rubric_id, "position");


--
-- Name: rubric rubric_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric
    ADD CONSTRAINT rubric_id_user_uk UNIQUE (id, user_id);


--
-- Name: rubric rubric_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric
    ADD CONSTRAINT rubric_pkey PRIMARY KEY (id);


--
-- Name: rubric rubric_question_id_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric
    ADD CONSTRAINT rubric_question_id_version_key UNIQUE (question_id, version);


--
-- Name: scenario scenario_exam_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_exam_id_position_key UNIQUE (exam_id, "position");


--
-- Name: scenario scenario_id_user_uk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_id_user_uk UNIQUE (id, user_id);


--
-- Name: scenario scenario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_pkey PRIMARY KEY (id);


--
-- Name: situation_type situation_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.situation_type
    ADD CONSTRAINT situation_type_pkey PRIMARY KEY (code);


--
-- Name: source_chunk_competency source_chunk_competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_competency
    ADD CONSTRAINT source_chunk_competency_pkey PRIMARY KEY (source_chunk_reference_id, competency_id);


--
-- Name: source_chunk_reference source_chunk_reference_dify_dataset_id_dify_segment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_reference
    ADD CONSTRAINT source_chunk_reference_dify_dataset_id_dify_segment_id_key UNIQUE (dify_dataset_id, dify_segment_id);


--
-- Name: source_chunk_reference source_chunk_reference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_reference
    ADD CONSTRAINT source_chunk_reference_pkey PRIMARY KEY (id);


--
-- Name: source_chunk_reference source_chunk_reference_source_document_id_chunk_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_reference
    ADD CONSTRAINT source_chunk_reference_source_document_id_chunk_index_key UNIQUE (source_document_id, chunk_index);


--
-- Name: source_chunk_topic source_chunk_topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_topic
    ADD CONSTRAINT source_chunk_topic_pkey PRIMARY KEY (source_chunk_reference_id, topic_id);


--
-- Name: source_document_learning_field source_document_learning_field_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document_learning_field
    ADD CONSTRAINT source_document_learning_field_pkey PRIMARY KEY (source_document_id, learning_field_id);


--
-- Name: source_document source_document_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document
    ADD CONSTRAINT source_document_pkey PRIMARY KEY (id);


--
-- Name: source_document source_document_relative_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document
    ADD CONSTRAINT source_document_relative_path_key UNIQUE (relative_path);


--
-- Name: source_document source_document_sha256_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document
    ADD CONSTRAINT source_document_sha256_key UNIQUE (sha256);


--
-- Name: source_document source_document_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document
    ADD CONSTRAINT source_document_slug_key UNIQUE (slug);


--
-- Name: topic topic_competency_id_sort_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_competency_id_sort_order_key UNIQUE (competency_id, sort_order);


--
-- Name: topic topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_pkey PRIMARY KEY (id);


--
-- Name: topic_weight topic_weight_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_weight
    ADD CONSTRAINT topic_weight_pkey PRIMARY KEY (id);


--
-- Name: topic_weight_set topic_weight_set_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_weight_set
    ADD CONSTRAINT topic_weight_set_label_key UNIQUE (label);


--
-- Name: topic_weight_set topic_weight_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_weight_set
    ADD CONSTRAINT topic_weight_set_pkey PRIMARY KEY (id);


--
-- Name: topic_weight topic_weight_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_weight
    ADD CONSTRAINT topic_weight_unique UNIQUE (weight_set_id, scope, node_id);


--
-- Name: uebung_skill uebung_skill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uebung_skill
    ADD CONSTRAINT uebung_skill_pkey PRIMARY KEY (competency_id, computation_type_code);


--
-- Name: uebungspruefung uebungspruefung_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uebungspruefung
    ADD CONSTRAINT uebungspruefung_pkey PRIMARY KEY (code);


--
-- Name: uebungspruefung uebungspruefung_sort_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uebungspruefung
    ADD CONSTRAINT uebungspruefung_sort_order_key UNIQUE (sort_order);


--
-- Name: uebungspruefung uebungspruefung_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uebungspruefung
    ADD CONSTRAINT uebungspruefung_title_key UNIQUE (title);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- Name: workflow_version workflow_version_engine_workflow_key_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_version
    ADD CONSTRAINT workflow_version_engine_workflow_key_version_key UNIQUE (engine, workflow_key, version);


--
-- Name: workflow_version workflow_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_version
    ADD CONSTRAINT workflow_version_pkey PRIMARY KEY (id);


--
-- Name: ai_call_log_class_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_call_log_class_created_idx ON public.ai_call_log USING btree (model_class, created_at DESC);


--
-- Name: ai_call_log_job_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_call_log_job_idx ON public.ai_call_log USING btree (generation_job_id);


--
-- Name: ai_call_log_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ai_call_log_user_created_idx ON public.ai_call_log USING btree (user_id, created_at DESC);


--
-- Name: answer_exam_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_exam_idx ON public.answer USING btree (exam_id);


--
-- Name: answer_flagged_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_flagged_idx ON public.answer USING btree (exam_id) WHERE is_flagged;


--
-- Name: answer_one_final_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX answer_one_final_uq ON public.answer USING btree (question_id) WHERE is_final;


--
-- Name: answer_question_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_question_idx ON public.answer USING btree (question_id);


--
-- Name: answer_session_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_session_idx ON public.answer USING btree (learning_session_id);


--
-- Name: answer_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_user_created_idx ON public.answer USING btree (user_id, created_at DESC);


--
-- Name: attachment_question_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachment_question_idx ON public.attachment USING btree (question_id, "position");


--
-- Name: attachment_scenario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachment_scenario_idx ON public.attachment USING btree (scenario_id, "position");


--
-- Name: attachment_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachment_user_idx ON public.attachment USING btree (user_id);


--
-- Name: audit_event_action_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_event_action_time_idx ON public.audit_event USING btree (action, occurred_at DESC);


--
-- Name: audit_event_correlation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_event_correlation_idx ON public.audit_event USING btree (correlation_id);


--
-- Name: audit_event_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_event_entity_idx ON public.audit_event USING btree (entity_table, entity_id);


--
-- Name: audit_event_error_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_event_error_idx ON public.audit_event USING btree (occurred_at DESC) WHERE (error_code IS NOT NULL);


--
-- Name: audit_event_payload_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_event_payload_gin ON public.audit_event USING gin (payload jsonb_path_ops);


--
-- Name: audit_event_user_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_event_user_time_idx ON public.audit_event USING btree (user_id, occurred_at DESC);


--
-- Name: competency_learning_field_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX competency_learning_field_idx ON public.competency USING btree (learning_field_id);


--
-- Name: competency_state_last_seen_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX competency_state_last_seen_idx ON public.competency_state USING btree (user_id, last_seen_at DESC);


--
-- Name: competency_state_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX competency_state_user_idx ON public.competency_state USING btree (user_id);


--
-- Name: competency_state_weak_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX competency_state_weak_idx ON public.competency_state USING btree (user_id, mastery_score);


--
-- Name: curriculum_node_gradable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_node_gradable_idx ON public.curriculum_node USING btree (computation_type_code) WHERE deterministically_gradable;


--
-- Name: curriculum_node_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_node_parent_idx ON public.curriculum_node USING btree (parent_id);


--
-- Name: curriculum_node_topic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX curriculum_node_topic_idx ON public.curriculum_node USING btree (topic_id, sort_order);


--
-- Name: error_pattern_competency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_pattern_competency_idx ON public.error_pattern USING btree (competency_id);


--
-- Name: error_pattern_recent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_pattern_recent_idx ON public.error_pattern USING btree (user_id, last_seen_at DESC);


--
-- Name: error_pattern_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX error_pattern_user_idx ON public.error_pattern USING btree (user_id, occurrences DESC);


--
-- Name: exam_blueprint_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_blueprint_idx ON public.exam USING btree (blueprint_id);


--
-- Name: exam_blueprint_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_blueprint_user_created_idx ON public.exam_blueprint USING btree (user_id, created_at DESC);


--
-- Name: exam_corpus_entry_attachments_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_corpus_entry_attachments_gin ON public.exam_corpus_entry USING gin (attachment_type_codes);


--
-- Name: exam_corpus_entry_competency_competency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_corpus_entry_competency_competency_idx ON public.exam_corpus_entry_competency USING btree (competency_id);


--
-- Name: exam_corpus_entry_computation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_corpus_entry_computation_idx ON public.exam_corpus_entry USING btree (computation_type_code);


--
-- Name: exam_corpus_entry_document_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_corpus_entry_document_idx ON public.exam_corpus_entry USING btree (source_document_id);


--
-- Name: exam_corpus_entry_generation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_corpus_entry_generation_idx ON public.exam_corpus_entry USING btree (exam_generation, exam_year);


--
-- Name: exam_corpus_entry_logical_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_corpus_entry_logical_idx ON public.exam_corpus_entry USING btree (logical_exam_id);


--
-- Name: exam_corpus_entry_topic_topic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_corpus_entry_topic_topic_idx ON public.exam_corpus_entry_topic USING btree (topic_id);


--
-- Name: exam_item_assignment_comp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_item_assignment_comp_idx ON public.exam_item_assignment USING btree (competency_id);


--
-- Name: exam_item_assignment_pass_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_item_assignment_pass_idx ON public.exam_item_assignment USING btree (coding_pass_id);


--
-- Name: exam_open_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_open_idx ON public.exam USING btree (user_id, last_autosave_at DESC) WHERE (status = ANY (ARRAY['READY'::public.exam_status, 'IN_PROGRESS'::public.exam_status]));


--
-- Name: exam_uebung_offen_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exam_uebung_offen_uq ON public.exam USING btree (user_id, title) WHERE ((mode = 'MINI_EXAM'::public.learning_mode) AND (status = ANY (ARRAY['READY'::public.exam_status, 'IN_PROGRESS'::public.exam_status])));


--
-- Name: INDEX exam_uebung_offen_uq; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.exam_uebung_offen_uq IS 'Je Nutzer und Titel hoechstens eine offene Uebungspruefung (0021); uebungspruefung_anlegen() faengt den Konflikt und gibt die vorhandene zurueck.';


--
-- Name: exam_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_user_created_idx ON public.exam USING btree (user_id, created_at DESC);


--
-- Name: exam_user_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_user_status_idx ON public.exam USING btree (user_id, status);


--
-- Name: gcr_criterion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gcr_criterion_idx ON public.grading_criterion_result USING btree (rubric_criterion_id);


--
-- Name: gcr_error_class_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gcr_error_class_idx ON public.grading_criterion_result USING btree (user_id, error_class) WHERE (error_class IS NOT NULL);


--
-- Name: gcr_result_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gcr_result_idx ON public.grading_criterion_result USING btree (grading_result_id);


--
-- Name: generation_job_correlation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generation_job_correlation_idx ON public.generation_job USING btree (correlation_id);


--
-- Name: generation_job_open_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generation_job_open_idx ON public.generation_job USING btree (status, created_at) WHERE (status = ANY (ARRAY['PENDING'::public.job_status, 'PROCESSING'::public.job_status, 'RETRYING'::public.job_status, 'REVIEW_REQUIRED'::public.job_status]));


--
-- Name: generation_job_result_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generation_job_result_idx ON public.generation_job USING btree (result_kind, result_id);


--
-- Name: generation_job_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX generation_job_user_created_idx ON public.generation_job USING btree (user_id, created_at DESC);


--
-- Name: grading_result_answer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grading_result_answer_idx ON public.grading_result USING btree (answer_id, created_at);


--
-- Name: grading_result_correlation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grading_result_correlation_idx ON public.grading_result USING btree (correlation_id);


--
-- Name: grading_result_low_confidence_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grading_result_low_confidence_idx ON public.grading_result USING btree (created_at DESC) WHERE (confidence < 0.7);


--
-- Name: grading_result_one_deterministic_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX grading_result_one_deterministic_uq ON public.grading_result USING btree (answer_id) WHERE (grader_type = 'DETERMINISTIC'::public.grader_type);


--
-- Name: INDEX grading_result_one_deterministic_uq; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.grading_result_one_deterministic_uq IS 'Je Antwort hoechstens eine deterministische Bewertung (0022); antwort-bewerten faengt den Konflikt und gibt die vorhandene zurueck. KI-Stufen bleiben wiederholbar.';


--
-- Name: grading_result_one_final_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX grading_result_one_final_uq ON public.grading_result USING btree (answer_id) WHERE is_final;


--
-- Name: grading_result_review_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grading_result_review_idx ON public.grading_result USING btree (review_status) WHERE review_required;


--
-- Name: grading_result_source_ids_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grading_result_source_ids_gin ON public.grading_result USING gin (source_ids jsonb_path_ops);


--
-- Name: grading_result_source_quelle_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grading_result_source_quelle_idx ON public.grading_result_source USING btree (source_grading_result_id);


--
-- Name: grading_result_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grading_result_user_created_idx ON public.grading_result USING btree (user_id, created_at DESC);


--
-- Name: learning_session_exam_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_session_exam_idx ON public.learning_session USING btree (exam_id, started_at);


--
-- Name: learning_session_user_started_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX learning_session_user_started_idx ON public.learning_session USING btree (user_id, started_at DESC);


--
-- Name: mv_topic_frequency_lf_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mv_topic_frequency_lf_idx ON public.mv_topic_frequency USING btree (learning_field_id);


--
-- Name: mv_topic_frequency_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX mv_topic_frequency_pk ON public.mv_topic_frequency USING btree (topic_id);


--
-- Name: prompt_version_one_active_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX prompt_version_one_active_uq ON public.prompt_version USING btree (prompt_key) WHERE is_active;


--
-- Name: prompt_version_workflow_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prompt_version_workflow_idx ON public.prompt_version USING btree (workflow_version_id);


--
-- Name: question_competency_competency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_competency_competency_idx ON public.question_competency USING btree (competency_id);


--
-- Name: question_competency_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_competency_user_idx ON public.question_competency USING btree (user_id);


--
-- Name: question_computation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_computation_idx ON public.question USING btree (computation_type_code) WHERE (computation_type_code IS NOT NULL);


--
-- Name: question_scenario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_scenario_idx ON public.question USING btree (scenario_id, "position");


--
-- Name: question_skill_node_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_skill_node_idx ON public.question_skill USING btree (curriculum_node_id);


--
-- Name: question_skill_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_skill_user_idx ON public.question_skill USING btree (user_id);


--
-- Name: question_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_status_idx ON public.question USING btree (status);


--
-- Name: question_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_user_idx ON public.question USING btree (user_id);


--
-- Name: readiness_snapshot_user_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX readiness_snapshot_user_time_idx ON public.readiness_snapshot USING btree (user_id, computed_at DESC);


--
-- Name: rubric_criterion_rubric_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rubric_criterion_rubric_idx ON public.rubric_criterion USING btree (rubric_id, "position");


--
-- Name: rubric_criterion_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rubric_criterion_user_idx ON public.rubric_criterion USING btree (user_id);


--
-- Name: rubric_one_active_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX rubric_one_active_uq ON public.rubric USING btree (question_id) WHERE is_active;


--
-- Name: rubric_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rubric_user_idx ON public.rubric USING btree (user_id);


--
-- Name: scenario_exam_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scenario_exam_idx ON public.scenario USING btree (exam_id, "position");


--
-- Name: scenario_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scenario_user_idx ON public.scenario USING btree (user_id);


--
-- Name: source_chunk_competency_competency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_chunk_competency_competency_idx ON public.source_chunk_competency USING btree (competency_id);


--
-- Name: source_chunk_document_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_chunk_document_idx ON public.source_chunk_reference USING btree (source_document_id, chunk_index);


--
-- Name: source_chunk_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_chunk_metadata_gin ON public.source_chunk_reference USING gin (rag_metadata jsonb_path_ops);


--
-- Name: source_chunk_topic_topic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_chunk_topic_topic_idx ON public.source_chunk_topic USING btree (topic_id);


--
-- Name: source_document_dify_document_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX source_document_dify_document_id_key ON public.source_document USING btree (dify_document_id) WHERE (dify_document_id IS NOT NULL);


--
-- Name: INDEX source_document_dify_document_id_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.source_document_dify_document_id_key IS 'Ein Dify-Dokument gehoert zu hoechstens einer Quelle. Ohne diesen Index lud der Ingest zwei gleichnamige Dateien unter denselben Dify-Namen hoch; Dify ersetzte das erste Dokument, und 368 Belegstellen zeigten danach auf geloeschte Segmente, ohne dass etwas fehlschlug.';


--
-- Name: source_document_edition_group_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_edition_group_idx ON public.source_document USING btree (edition_group);


--
-- Name: source_document_generation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_generation_idx ON public.source_document USING btree (exam_generation, exam_year, exam_term);


--
-- Name: source_document_ingestion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_ingestion_idx ON public.source_document USING btree (ingestion_status) WHERE (ingestion_status = ANY (ARRAY['PENDING'::public.ingestion_status, 'PROCESSING'::public.ingestion_status, 'FAILED'::public.ingestion_status]));


--
-- Name: source_document_kb02_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_kb02_idx ON public.source_document USING btree (exam_generation) WHERE (NOT contains_solution);


--
-- Name: source_document_learning_field_lf_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_learning_field_lf_idx ON public.source_document_learning_field USING btree (learning_field_id);


--
-- Name: source_document_logical_exam_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_logical_exam_idx ON public.source_document USING btree (logical_exam_id);


--
-- Name: source_document_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_role_idx ON public.source_document USING btree (document_role);


--
-- Name: source_document_statistics_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_statistics_idx ON public.source_document USING btree (exam_year, exam_term) WHERE counts_in_statistics;


--
-- Name: source_document_tier_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_tier_idx ON public.source_document USING btree (source_tier);


--
-- Name: source_document_warnings_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX source_document_warnings_gin ON public.source_document USING gin (metadata_warnings);


--
-- Name: topic_competency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topic_competency_idx ON public.topic USING btree (competency_id);


--
-- Name: topic_weight_set_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topic_weight_set_idx ON public.topic_weight USING btree (weight_set_id, scope);


--
-- Name: topic_weight_set_single_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX topic_weight_set_single_active ON public.topic_weight_set USING btree (is_active) WHERE is_active;


--
-- Name: workflow_version_one_active_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX workflow_version_one_active_uq ON public.workflow_version USING btree (engine, workflow_key) WHERE is_active;


--
-- Name: answer answer_exam_chain_consistent; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER answer_exam_chain_consistent AFTER INSERT OR UPDATE OF exam_id, question_id, learning_session_id ON public.answer DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.assert_answer_exam_chain_consistent();


--
-- Name: answer answer_question_id_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER answer_question_id_immutable BEFORE UPDATE OF question_id ON public.answer FOR EACH ROW EXECUTE FUNCTION public.assert_question_id_immutable();


--
-- Name: answer answer_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER answer_set_updated_at BEFORE UPDATE ON public.answer FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: attachment attachment_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER attachment_set_updated_at BEFORE UPDATE ON public.attachment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: audit_event audit_event_user_actor; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_event_user_actor BEFORE INSERT ON public.audit_event FOR EACH ROW EXECUTE FUNCTION public.assert_audit_event_user_actor();


--
-- Name: competency competency_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER competency_set_updated_at BEFORE UPDATE ON public.competency FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: competency_state competency_state_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER competency_state_set_updated_at BEFORE UPDATE ON public.competency_state FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: curriculum_node curriculum_node_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER curriculum_node_set_updated_at BEFORE UPDATE ON public.curriculum_node FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: error_pattern error_pattern_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER error_pattern_set_updated_at BEFORE UPDATE ON public.error_pattern FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: exam_blueprint exam_blueprint_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER exam_blueprint_set_updated_at BEFORE UPDATE ON public.exam_blueprint FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: exam_corpus_entry exam_corpus_entry_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER exam_corpus_entry_set_updated_at BEFORE UPDATE ON public.exam_corpus_entry FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: exam exam_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER exam_set_updated_at BEFORE UPDATE ON public.exam FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: grading_result grading_result_merged_braucht_herkunft; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER grading_result_merged_braucht_herkunft AFTER INSERT OR UPDATE ON public.grading_result DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.assert_merged_hat_vorstufen_zeile();


--
-- Name: grading_result_source grading_result_merged_hat_vorstufen; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER grading_result_merged_hat_vorstufen AFTER INSERT OR UPDATE ON public.grading_result_source DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.assert_merged_hat_vorstufen();


--
-- Name: grading_result grading_result_rubric_matches_question; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER grading_result_rubric_matches_question AFTER INSERT OR UPDATE OF answer_id, rubric_id ON public.grading_result DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.assert_grading_result_rubric_matches_question();


--
-- Name: grading_result grading_result_supersedes_nicht_vorstufe; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER grading_result_supersedes_nicht_vorstufe AFTER INSERT OR UPDATE ON public.grading_result DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.assert_supersedes_nicht_vorstufe();


--
-- Name: learning_field learning_field_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER learning_field_set_updated_at BEFORE UPDATE ON public.learning_field FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: learning_session learning_session_exam_id_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER learning_session_exam_id_immutable BEFORE UPDATE OF exam_id ON public.learning_session FOR EACH ROW EXECUTE FUNCTION public.assert_exam_id_immutable();


--
-- Name: question_competency question_competency_requires_remaining; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER question_competency_requires_remaining AFTER DELETE OR UPDATE ON public.question_competency DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.assert_question_competency_not_orphaned();


--
-- Name: question question_requires_competency; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER question_requires_competency AFTER INSERT OR UPDATE ON public.question DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.assert_question_has_competency();


--
-- Name: question question_scenario_id_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER question_scenario_id_immutable BEFORE UPDATE OF scenario_id ON public.question FOR EACH ROW EXECUTE FUNCTION public.assert_question_scenario_id_immutable();


--
-- Name: question question_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER question_set_updated_at BEFORE UPDATE ON public.question FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: rubric_criterion rubric_criterion_immutable_once_used; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER rubric_criterion_immutable_once_used BEFORE UPDATE OF label, description, max_points, kind, computation_type_code, expected_value, tolerance, unit, accepted_alternatives, awards_method_points, competency_id, error_class_hint, "position" ON public.rubric_criterion FOR EACH ROW EXECUTE FUNCTION public.assert_rubric_criterion_immutable_once_used();


--
-- Name: rubric_criterion rubric_criterion_set_frozen; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER rubric_criterion_set_frozen BEFORE INSERT OR DELETE ON public.rubric_criterion FOR EACH ROW EXECUTE FUNCTION public.assert_rubric_criterion_set_frozen();


--
-- Name: rubric_criterion rubric_criterion_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER rubric_criterion_set_updated_at BEFORE UPDATE ON public.rubric_criterion FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: rubric rubric_immutable_once_used; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER rubric_immutable_once_used BEFORE UPDATE OF total_points ON public.rubric FOR EACH ROW EXECUTE FUNCTION public.assert_rubric_immutable_once_used();


--
-- Name: rubric rubric_question_id_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER rubric_question_id_immutable BEFORE UPDATE OF question_id ON public.rubric FOR EACH ROW EXECUTE FUNCTION public.assert_question_id_immutable();


--
-- Name: rubric rubric_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER rubric_set_updated_at BEFORE UPDATE ON public.rubric FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: scenario scenario_exam_id_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER scenario_exam_id_immutable BEFORE UPDATE OF exam_id ON public.scenario FOR EACH ROW EXECUTE FUNCTION public.assert_exam_id_immutable();


--
-- Name: scenario scenario_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER scenario_set_updated_at BEFORE UPDATE ON public.scenario FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: source_chunk_reference source_chunk_reference_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER source_chunk_reference_set_updated_at BEFORE UPDATE ON public.source_chunk_reference FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: source_document source_document_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER source_document_set_updated_at BEFORE UPDATE ON public.source_document FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: topic topic_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER topic_set_updated_at BEFORE UPDATE ON public.topic FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: topic_weight topic_weight_sealed; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER topic_weight_sealed BEFORE INSERT OR DELETE OR UPDATE ON public.topic_weight FOR EACH ROW EXECUTE FUNCTION public.tg_topic_weight_sealed();


--
-- Name: topic_weight_set topic_weight_set_activation_handoff; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER topic_weight_set_activation_handoff AFTER DELETE OR UPDATE ON public.topic_weight_set DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.tg_topic_weight_set_activation_handoff();


--
-- Name: topic_weight_set topic_weight_set_sealed; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER topic_weight_set_sealed BEFORE DELETE OR UPDATE ON public.topic_weight_set FOR EACH ROW EXECUTE FUNCTION public.tg_topic_weight_set_sealed();


--
-- Name: topic_weight topic_weight_sums_to_one; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER topic_weight_sums_to_one AFTER INSERT OR DELETE OR UPDATE ON public.topic_weight DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.tg_topic_weight_sums_to_one();


--
-- Name: user_profile user_profile_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_profile_set_updated_at BEFORE UPDATE ON public.user_profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ai_call_log ai_call_log_job_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_call_log
    ADD CONSTRAINT ai_call_log_job_fk FOREIGN KEY (generation_job_id, user_id) REFERENCES public.generation_job(id, user_id) ON DELETE SET NULL (generation_job_id);


--
-- Name: ai_call_log ai_call_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_call_log
    ADD CONSTRAINT ai_call_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: answer answer_exam_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_exam_fk FOREIGN KEY (exam_id, user_id) REFERENCES public.exam(id, user_id) ON DELETE CASCADE;


--
-- Name: answer answer_question_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_question_fk FOREIGN KEY (question_id, user_id) REFERENCES public.question(id, user_id) ON DELETE CASCADE;


--
-- Name: answer answer_session_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_session_fk FOREIGN KEY (learning_session_id, user_id) REFERENCES public.learning_session(id, user_id) ON DELETE SET NULL (learning_session_id);


--
-- Name: answer answer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: attachment attachment_attachment_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment
    ADD CONSTRAINT attachment_attachment_type_code_fkey FOREIGN KEY (attachment_type_code) REFERENCES public.attachment_type(code) ON DELETE RESTRICT;


--
-- Name: attachment attachment_question_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment
    ADD CONSTRAINT attachment_question_fk FOREIGN KEY (question_id, user_id) REFERENCES public.question(id, user_id) ON DELETE CASCADE;


--
-- Name: attachment attachment_scenario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment
    ADD CONSTRAINT attachment_scenario_fk FOREIGN KEY (scenario_id, user_id) REFERENCES public.scenario(id, user_id) ON DELETE CASCADE;


--
-- Name: attachment attachment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachment
    ADD CONSTRAINT attachment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: audit_event audit_event_generation_job_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_generation_job_fk FOREIGN KEY (generation_job_id, user_id) REFERENCES public.generation_job(id, user_id) ON DELETE SET NULL (generation_job_id);


--
-- Name: audit_event audit_event_prompt_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_prompt_version_id_fkey FOREIGN KEY (prompt_version_id) REFERENCES public.prompt_version(id) ON DELETE SET NULL;


--
-- Name: audit_event audit_event_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- Name: audit_event audit_event_workflow_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_workflow_version_id_fkey FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_version(id) ON DELETE SET NULL;


--
-- Name: competency competency_learning_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency
    ADD CONSTRAINT competency_learning_field_id_fkey FOREIGN KEY (learning_field_id) REFERENCES public.learning_field(id) ON DELETE RESTRICT;


--
-- Name: competency_state competency_state_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_state
    ADD CONSTRAINT competency_state_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: competency_state competency_state_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency_state
    ADD CONSTRAINT competency_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: curriculum_node curriculum_node_computation_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_node
    ADD CONSTRAINT curriculum_node_computation_type_code_fkey FOREIGN KEY (computation_type_code) REFERENCES public.computation_type(code) ON DELETE RESTRICT;


--
-- Name: curriculum_node curriculum_node_parent_is_subtopic; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_node
    ADD CONSTRAINT curriculum_node_parent_is_subtopic FOREIGN KEY (parent_id, parent_node_type) REFERENCES public.curriculum_node(id, node_type) ON DELETE RESTRICT;


--
-- Name: curriculum_node curriculum_node_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum_node
    ADD CONSTRAINT curriculum_node_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON DELETE RESTRICT;


--
-- Name: error_pattern error_pattern_answer_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_pattern
    ADD CONSTRAINT error_pattern_answer_fk FOREIGN KEY (last_answer_id, user_id) REFERENCES public.answer(id, user_id) ON DELETE SET NULL (last_answer_id);


--
-- Name: error_pattern error_pattern_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_pattern
    ADD CONSTRAINT error_pattern_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: error_pattern error_pattern_curriculum_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_pattern
    ADD CONSTRAINT error_pattern_curriculum_node_id_fkey FOREIGN KEY (curriculum_node_id) REFERENCES public.curriculum_node(id) ON DELETE RESTRICT;


--
-- Name: error_pattern error_pattern_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_pattern
    ADD CONSTRAINT error_pattern_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: exam exam_blueprint_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT exam_blueprint_fk FOREIGN KEY (blueprint_id, user_id) REFERENCES public.exam_blueprint(id, user_id) ON DELETE SET NULL (blueprint_id);


--
-- Name: exam_blueprint exam_blueprint_generation_job_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_blueprint
    ADD CONSTRAINT exam_blueprint_generation_job_fk FOREIGN KEY (generation_job_id, user_id) REFERENCES public.generation_job(id, user_id) ON DELETE SET NULL (generation_job_id);


--
-- Name: exam_blueprint exam_blueprint_prompt_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_blueprint
    ADD CONSTRAINT exam_blueprint_prompt_version_id_fkey FOREIGN KEY (prompt_version_id) REFERENCES public.prompt_version(id) ON DELETE SET NULL;


--
-- Name: exam_blueprint exam_blueprint_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_blueprint
    ADD CONSTRAINT exam_blueprint_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: exam_blueprint exam_blueprint_workflow_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_blueprint
    ADD CONSTRAINT exam_blueprint_workflow_version_id_fkey FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_version(id) ON DELETE SET NULL;


--
-- Name: exam_corpus_entry exam_corpus_entry_answer_format_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_answer_format_code_fkey FOREIGN KEY (answer_format_code) REFERENCES public.answer_format(code) ON DELETE RESTRICT;


--
-- Name: exam_corpus_entry exam_corpus_entry_cognitive_level_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_cognitive_level_code_fkey FOREIGN KEY (cognitive_level_code) REFERENCES public.cognitive_level(code) ON DELETE RESTRICT;


--
-- Name: exam_corpus_entry_competency exam_corpus_entry_competency_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry_competency
    ADD CONSTRAINT exam_corpus_entry_competency_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: exam_corpus_entry_competency exam_corpus_entry_competency_exam_corpus_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry_competency
    ADD CONSTRAINT exam_corpus_entry_competency_exam_corpus_entry_id_fkey FOREIGN KEY (exam_corpus_entry_id) REFERENCES public.exam_corpus_entry(id) ON DELETE CASCADE;


--
-- Name: exam_corpus_entry exam_corpus_entry_computation_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_computation_type_code_fkey FOREIGN KEY (computation_type_code) REFERENCES public.computation_type(code) ON DELETE RESTRICT;


--
-- Name: exam_corpus_entry exam_corpus_entry_extraction_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_extraction_job_id_fkey FOREIGN KEY (extraction_job_id) REFERENCES public.generation_job(id) ON DELETE SET NULL;


--
-- Name: exam_corpus_entry exam_corpus_entry_question_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_question_type_code_fkey FOREIGN KEY (question_type_code) REFERENCES public.question_type(code) ON DELETE RESTRICT;


--
-- Name: exam_corpus_entry exam_corpus_entry_situation_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_situation_type_code_fkey FOREIGN KEY (situation_type_code) REFERENCES public.situation_type(code) ON DELETE RESTRICT;


--
-- Name: exam_corpus_entry exam_corpus_entry_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry
    ADD CONSTRAINT exam_corpus_entry_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.source_document(id) ON DELETE CASCADE;


--
-- Name: exam_corpus_entry_topic exam_corpus_entry_topic_exam_corpus_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry_topic
    ADD CONSTRAINT exam_corpus_entry_topic_exam_corpus_entry_id_fkey FOREIGN KEY (exam_corpus_entry_id) REFERENCES public.exam_corpus_entry(id) ON DELETE CASCADE;


--
-- Name: exam_corpus_entry_topic exam_corpus_entry_topic_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_corpus_entry_topic
    ADD CONSTRAINT exam_corpus_entry_topic_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON DELETE RESTRICT;


--
-- Name: exam exam_generation_job_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT exam_generation_job_fk FOREIGN KEY (generation_job_id, user_id) REFERENCES public.generation_job(id, user_id) ON DELETE SET NULL (generation_job_id);


--
-- Name: exam_item_assignment exam_item_assignment_coding_pass_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_item_assignment
    ADD CONSTRAINT exam_item_assignment_coding_pass_id_fkey FOREIGN KEY (coding_pass_id) REFERENCES public.coding_pass(id) ON DELETE CASCADE;


--
-- Name: exam_item_assignment exam_item_assignment_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_item_assignment
    ADD CONSTRAINT exam_item_assignment_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id);


--
-- Name: exam_item_assignment exam_item_assignment_exam_corpus_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_item_assignment
    ADD CONSTRAINT exam_item_assignment_exam_corpus_entry_id_fkey FOREIGN KEY (exam_corpus_entry_id) REFERENCES public.exam_corpus_entry(id) ON DELETE CASCADE;


--
-- Name: exam_item_assignment exam_item_assignment_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_item_assignment
    ADD CONSTRAINT exam_item_assignment_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id);


--
-- Name: exam exam_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam
    ADD CONSTRAINT exam_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: grading_criterion_result gcr_criterion_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_criterion_result
    ADD CONSTRAINT gcr_criterion_fk FOREIGN KEY (rubric_criterion_id, rubric_id, user_id) REFERENCES public.rubric_criterion(id, rubric_id, user_id) ON DELETE RESTRICT;


--
-- Name: grading_criterion_result gcr_result_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_criterion_result
    ADD CONSTRAINT gcr_result_fk FOREIGN KEY (grading_result_id, rubric_id, user_id) REFERENCES public.grading_result(id, rubric_id, user_id) ON DELETE CASCADE;


--
-- Name: generation_job generation_job_error_code_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_job
    ADD CONSTRAINT generation_job_error_code_fk FOREIGN KEY (error_code) REFERENCES public.job_error_code(code);


--
-- Name: generation_job generation_job_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_job
    ADD CONSTRAINT generation_job_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: generation_job generation_job_workflow_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_job
    ADD CONSTRAINT generation_job_workflow_version_id_fkey FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_version(id) ON DELETE SET NULL;


--
-- Name: grading_criterion_result grading_criterion_result_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_criterion_result
    ADD CONSTRAINT grading_criterion_result_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: grading_result grading_result_answer_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_answer_fk FOREIGN KEY (answer_id, user_id) REFERENCES public.answer(id, user_id) ON DELETE CASCADE;


--
-- Name: grading_result grading_result_generation_job_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_generation_job_fk FOREIGN KEY (generation_job_id, user_id) REFERENCES public.generation_job(id, user_id) ON DELETE SET NULL (generation_job_id);


--
-- Name: grading_result grading_result_prompt_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_prompt_version_id_fkey FOREIGN KEY (prompt_version_id) REFERENCES public.prompt_version(id) ON DELETE SET NULL;


--
-- Name: grading_result grading_result_rubric_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_rubric_fk FOREIGN KEY (rubric_id, user_id) REFERENCES public.rubric(id, user_id) ON DELETE RESTRICT;


--
-- Name: grading_result_source grading_result_source_quelle_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result_source
    ADD CONSTRAINT grading_result_source_quelle_fk FOREIGN KEY (source_grading_result_id, answer_id, user_id) REFERENCES public.grading_result(id, answer_id, user_id) ON DELETE RESTRICT;


--
-- Name: grading_result_source grading_result_source_rolle_stimmt_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result_source
    ADD CONSTRAINT grading_result_source_rolle_stimmt_fk FOREIGN KEY (source_grading_result_id, role) REFERENCES public.grading_result(id, grader_type) ON DELETE RESTRICT;


--
-- Name: grading_result_source grading_result_source_ziel_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result_source
    ADD CONSTRAINT grading_result_source_ziel_fk FOREIGN KEY (grading_result_id, answer_id, user_id) REFERENCES public.grading_result(id, answer_id, user_id) ON DELETE CASCADE;


--
-- Name: grading_result grading_result_supersedes_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_supersedes_fk FOREIGN KEY (supersedes_id, answer_id, user_id) REFERENCES public.grading_result(id, answer_id, user_id) ON DELETE SET NULL (supersedes_id);


--
-- Name: grading_result grading_result_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: grading_result grading_result_workflow_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grading_result
    ADD CONSTRAINT grading_result_workflow_version_id_fkey FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_version(id) ON DELETE SET NULL;


--
-- Name: learning_session learning_session_exam_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session
    ADD CONSTRAINT learning_session_exam_fk FOREIGN KEY (exam_id, user_id) REFERENCES public.exam(id, user_id) ON DELETE CASCADE;


--
-- Name: learning_session learning_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_session
    ADD CONSTRAINT learning_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: model_class_route model_class_route_fallback_model_pricing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_class_route
    ADD CONSTRAINT model_class_route_fallback_model_pricing_id_fkey FOREIGN KEY (fallback_model_pricing_id) REFERENCES public.model_pricing(id);


--
-- Name: model_class_route model_class_route_primary_model_pricing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_class_route
    ADD CONSTRAINT model_class_route_primary_model_pricing_id_fkey FOREIGN KEY (primary_model_pricing_id) REFERENCES public.model_pricing(id);


--
-- Name: prompt_version prompt_version_workflow_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_version
    ADD CONSTRAINT prompt_version_workflow_version_id_fkey FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_version(id) ON DELETE RESTRICT;


--
-- Name: question question_answer_format_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_answer_format_code_fkey FOREIGN KEY (answer_format_code) REFERENCES public.answer_format(code) ON DELETE RESTRICT;


--
-- Name: question question_cognitive_level_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_cognitive_level_code_fkey FOREIGN KEY (cognitive_level_code) REFERENCES public.cognitive_level(code) ON DELETE RESTRICT;


--
-- Name: question_competency question_competency_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_competency
    ADD CONSTRAINT question_competency_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: question_competency question_competency_question_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_competency
    ADD CONSTRAINT question_competency_question_fk FOREIGN KEY (question_id, user_id) REFERENCES public.question(id, user_id) ON DELETE CASCADE;


--
-- Name: question question_computation_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_computation_type_code_fkey FOREIGN KEY (computation_type_code) REFERENCES public.computation_type(code) ON DELETE RESTRICT;


--
-- Name: question question_generation_job_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_generation_job_fk FOREIGN KEY (generation_job_id, user_id) REFERENCES public.generation_job(id, user_id) ON DELETE SET NULL (generation_job_id);


--
-- Name: question question_prompt_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_prompt_version_id_fkey FOREIGN KEY (prompt_version_id) REFERENCES public.prompt_version(id) ON DELETE SET NULL;


--
-- Name: question question_question_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_question_type_code_fkey FOREIGN KEY (question_type_code) REFERENCES public.question_type(code) ON DELETE RESTRICT;


--
-- Name: question question_scenario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_scenario_fk FOREIGN KEY (scenario_id, user_id) REFERENCES public.scenario(id, user_id) ON DELETE CASCADE;


--
-- Name: question_skill question_skill_curriculum_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skill
    ADD CONSTRAINT question_skill_curriculum_node_id_fkey FOREIGN KEY (curriculum_node_id) REFERENCES public.curriculum_node(id) ON DELETE RESTRICT;


--
-- Name: question_skill question_skill_question_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_skill
    ADD CONSTRAINT question_skill_question_fk FOREIGN KEY (question_id, user_id) REFERENCES public.question(id, user_id) ON DELETE CASCADE;


--
-- Name: question question_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: question question_workflow_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_workflow_version_id_fkey FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_version(id) ON DELETE SET NULL;


--
-- Name: readiness_snapshot readiness_snapshot_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readiness_snapshot
    ADD CONSTRAINT readiness_snapshot_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: readiness_snapshot readiness_snapshot_weight_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readiness_snapshot
    ADD CONSTRAINT readiness_snapshot_weight_set_id_fkey FOREIGN KEY (weight_set_id) REFERENCES public.topic_weight_set(id);


--
-- Name: rubric_criterion rubric_criterion_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric_criterion
    ADD CONSTRAINT rubric_criterion_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: rubric_criterion rubric_criterion_computation_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric_criterion
    ADD CONSTRAINT rubric_criterion_computation_type_code_fkey FOREIGN KEY (computation_type_code) REFERENCES public.computation_type(code) ON DELETE RESTRICT;


--
-- Name: rubric_criterion rubric_criterion_rubric_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric_criterion
    ADD CONSTRAINT rubric_criterion_rubric_fk FOREIGN KEY (rubric_id, user_id) REFERENCES public.rubric(id, user_id) ON DELETE CASCADE;


--
-- Name: rubric_criterion rubric_criterion_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric_criterion
    ADD CONSTRAINT rubric_criterion_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: rubric rubric_question_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric
    ADD CONSTRAINT rubric_question_fk FOREIGN KEY (question_id, user_id) REFERENCES public.question(id, user_id) ON DELETE CASCADE;


--
-- Name: rubric rubric_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rubric
    ADD CONSTRAINT rubric_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: scenario scenario_exam_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_exam_fk FOREIGN KEY (exam_id, user_id) REFERENCES public.exam(id, user_id) ON DELETE CASCADE;


--
-- Name: scenario scenario_situation_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_situation_type_code_fkey FOREIGN KEY (situation_type_code) REFERENCES public.situation_type(code) ON DELETE RESTRICT;


--
-- Name: scenario scenario_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scenario
    ADD CONSTRAINT scenario_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- Name: source_chunk_competency source_chunk_competency_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_competency
    ADD CONSTRAINT source_chunk_competency_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: source_chunk_competency source_chunk_competency_source_chunk_reference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_competency
    ADD CONSTRAINT source_chunk_competency_source_chunk_reference_id_fkey FOREIGN KEY (source_chunk_reference_id) REFERENCES public.source_chunk_reference(id) ON DELETE CASCADE;


--
-- Name: source_chunk_reference source_chunk_reference_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_reference
    ADD CONSTRAINT source_chunk_reference_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.source_document(id) ON DELETE CASCADE;


--
-- Name: source_chunk_topic source_chunk_topic_source_chunk_reference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_topic
    ADD CONSTRAINT source_chunk_topic_source_chunk_reference_id_fkey FOREIGN KEY (source_chunk_reference_id) REFERENCES public.source_chunk_reference(id) ON DELETE CASCADE;


--
-- Name: source_chunk_topic source_chunk_topic_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_chunk_topic
    ADD CONSTRAINT source_chunk_topic_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topic(id) ON DELETE RESTRICT;


--
-- Name: source_document source_document_duplicate_of_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document
    ADD CONSTRAINT source_document_duplicate_of_fkey FOREIGN KEY (duplicate_of) REFERENCES public.source_document(id) ON DELETE SET NULL;


--
-- Name: source_document_learning_field source_document_learning_field_learning_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document_learning_field
    ADD CONSTRAINT source_document_learning_field_learning_field_id_fkey FOREIGN KEY (learning_field_id) REFERENCES public.learning_field(id) ON DELETE RESTRICT;


--
-- Name: source_document_learning_field source_document_learning_field_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_document_learning_field
    ADD CONSTRAINT source_document_learning_field_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.source_document(id) ON DELETE CASCADE;


--
-- Name: topic topic_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: topic_weight_set topic_weight_set_basis_coding_pass_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_weight_set
    ADD CONSTRAINT topic_weight_set_basis_coding_pass_id_fkey FOREIGN KEY (basis_coding_pass_id) REFERENCES public.coding_pass(id);


--
-- Name: topic_weight topic_weight_weight_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_weight
    ADD CONSTRAINT topic_weight_weight_set_id_fkey FOREIGN KEY (weight_set_id) REFERENCES public.topic_weight_set(id) ON DELETE CASCADE;


--
-- Name: uebung_skill uebung_skill_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uebung_skill
    ADD CONSTRAINT uebung_skill_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE RESTRICT;


--
-- Name: uebung_skill uebung_skill_computation_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uebung_skill
    ADD CONSTRAINT uebung_skill_computation_type_code_fkey FOREIGN KEY (computation_type_code) REFERENCES public.computation_type(code) ON DELETE RESTRICT;


--
-- Name: uebung_skill uebung_skill_curriculum_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uebung_skill
    ADD CONSTRAINT uebung_skill_curriculum_node_id_fkey FOREIGN KEY (curriculum_node_id) REFERENCES public.curriculum_node(id) ON DELETE RESTRICT;


--
-- Name: user_profile user_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_call_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_call_log ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_call_log ai_call_log_insert_service; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_call_log_insert_service ON public.ai_call_log FOR INSERT TO service_role WITH CHECK (true);


--
-- Name: ai_call_log ai_call_log_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ai_call_log_select_own ON public.ai_call_log FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: answer; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answer ENABLE ROW LEVEL SECURITY;

--
-- Name: answer answer_delete_own_draft; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_delete_own_draft ON public.answer FOR DELETE TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) AND (NOT is_final)));


--
-- Name: answer_format; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answer_format ENABLE ROW LEVEL SECURITY;

--
-- Name: answer_format answer_format_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_format_read ON public.answer_format FOR SELECT TO authenticated USING (true);


--
-- Name: answer answer_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_insert_own ON public.answer FOR INSERT TO authenticated WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: answer answer_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_select_own ON public.answer FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: answer answer_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY answer_update_own ON public.answer FOR UPDATE TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) AND (NOT is_final))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: attachment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attachment ENABLE ROW LEVEL SECURITY;

--
-- Name: attachment attachment_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attachment_select_own ON public.attachment FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: attachment_type; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attachment_type ENABLE ROW LEVEL SECURITY;

--
-- Name: attachment_type attachment_type_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY attachment_type_read ON public.attachment_type FOR SELECT TO authenticated USING (true);


--
-- Name: audit_event; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_event ENABLE ROW LEVEL SECURITY;

--
-- Name: coding_pass; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coding_pass ENABLE ROW LEVEL SECURITY;

--
-- Name: coding_pass coding_pass_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY coding_pass_read ON public.coding_pass FOR SELECT TO authenticated USING (true);


--
-- Name: cognitive_level; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cognitive_level ENABLE ROW LEVEL SECURITY;

--
-- Name: cognitive_level cognitive_level_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cognitive_level_read ON public.cognitive_level FOR SELECT TO authenticated USING (true);


--
-- Name: competency; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.competency ENABLE ROW LEVEL SECURITY;

--
-- Name: competency competency_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY competency_read ON public.competency FOR SELECT TO authenticated USING (true);


--
-- Name: competency_state; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.competency_state ENABLE ROW LEVEL SECURITY;

--
-- Name: competency_state competency_state_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY competency_state_select_own ON public.competency_state FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: computation_type; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.computation_type ENABLE ROW LEVEL SECURITY;

--
-- Name: computation_type computation_type_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY computation_type_read ON public.computation_type FOR SELECT TO authenticated USING (true);


--
-- Name: curriculum_node; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.curriculum_node ENABLE ROW LEVEL SECURITY;

--
-- Name: curriculum_node curriculum_node_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY curriculum_node_read ON public.curriculum_node FOR SELECT TO authenticated USING (true);


--
-- Name: error_pattern; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.error_pattern ENABLE ROW LEVEL SECURITY;

--
-- Name: error_pattern error_pattern_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY error_pattern_select_own ON public.error_pattern FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: exam; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exam ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_blueprint; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exam_blueprint ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_blueprint exam_blueprint_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY exam_blueprint_select_own ON public.exam_blueprint FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: exam_corpus_entry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exam_corpus_entry ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_corpus_entry_competency; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exam_corpus_entry_competency ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_corpus_entry_topic; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exam_corpus_entry_topic ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_item_assignment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exam_item_assignment ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_item_assignment exam_item_assignment_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY exam_item_assignment_read ON public.exam_item_assignment FOR SELECT TO authenticated USING (true);


--
-- Name: exam exam_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY exam_select_own ON public.exam FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: exam exam_update_own_lifecycle; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY exam_update_own_lifecycle ON public.exam FOR UPDATE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: generation_job; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.generation_job ENABLE ROW LEVEL SECURITY;

--
-- Name: generation_job generation_job_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY generation_job_select_own ON public.generation_job FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: grading_criterion_result; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grading_criterion_result ENABLE ROW LEVEL SECURITY;

--
-- Name: grading_criterion_result grading_criterion_result_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY grading_criterion_result_select_own ON public.grading_criterion_result FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: grading_result; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grading_result ENABLE ROW LEVEL SECURITY;

--
-- Name: grading_result grading_result_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY grading_result_select_own ON public.grading_result FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: grading_result_source; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grading_result_source ENABLE ROW LEVEL SECURITY;

--
-- Name: grading_result_source grading_result_source_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY grading_result_source_select_own ON public.grading_result_source FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: grading_result grading_result_update_review_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY grading_result_update_review_own ON public.grading_result FOR UPDATE TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) AND review_required AND (review_status = 'PENDING'::public.review_status))) WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND review_required AND (review_status = 'CONFIRMED'::public.review_status)));


--
-- Name: POLICY grading_result_update_review_own ON grading_result; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY grading_result_update_review_own ON public.grading_result IS 'Genau ein Uebergang: PENDING -> CONFIRMED, auf der eigenen Zeile. Der Ausgangszustand steht in der using-Klausel, damit das Quittieren einmal stattfindet statt beliebig oft. OVERRIDDEN fehlt in der with-check-Klausel, weil es geaenderte Punkte bedeutet und points_awarded dem Pruefling durch den Spalten-Grant verschlossen ist.';


--
-- Name: job_error_code; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.job_error_code ENABLE ROW LEVEL SECURITY;

--
-- Name: job_error_code job_error_code_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY job_error_code_select_all ON public.job_error_code FOR SELECT TO authenticated USING (true);


--
-- Name: POLICY job_error_code_select_all ON job_error_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY job_error_code_select_all ON public.job_error_code IS 'Lesbar fuer jeden Angemeldeten: die Tabelle ist ein Woerterbuch ohne Personenbezug. Geschrieben wird sie nur per Migration, nicht zur Laufzeit.';


--
-- Name: learning_field; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_field ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_field learning_field_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY learning_field_read ON public.learning_field FOR SELECT TO authenticated USING (true);


--
-- Name: learning_session; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_session ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_session learning_session_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY learning_session_delete_own ON public.learning_session FOR DELETE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: learning_session learning_session_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY learning_session_insert_own ON public.learning_session FOR INSERT TO authenticated WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: learning_session learning_session_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY learning_session_select_own ON public.learning_session FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: learning_session learning_session_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY learning_session_update_own ON public.learning_session FOR UPDATE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: model_class_route; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.model_class_route ENABLE ROW LEVEL SECURITY;

--
-- Name: model_pricing; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.model_pricing ENABLE ROW LEVEL SECURITY;

--
-- Name: prompt_version; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prompt_version ENABLE ROW LEVEL SECURITY;

--
-- Name: question; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question ENABLE ROW LEVEL SECURITY;

--
-- Name: question_competency; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_competency ENABLE ROW LEVEL SECURITY;

--
-- Name: question_competency question_competency_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_competency_select_own ON public.question_competency FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: question question_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_select_own ON public.question FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: question_skill; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_skill ENABLE ROW LEVEL SECURITY;

--
-- Name: question_skill question_skill_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_skill_select_own ON public.question_skill FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: question_type; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_type ENABLE ROW LEVEL SECURITY;

--
-- Name: question_type question_type_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY question_type_read ON public.question_type FOR SELECT TO authenticated USING (true);


--
-- Name: readiness_snapshot; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.readiness_snapshot ENABLE ROW LEVEL SECURITY;

--
-- Name: readiness_snapshot readiness_snapshot_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY readiness_snapshot_insert_own ON public.readiness_snapshot FOR INSERT TO authenticated WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: readiness_snapshot readiness_snapshot_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY readiness_snapshot_select_own ON public.readiness_snapshot FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: rubric; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rubric ENABLE ROW LEVEL SECURITY;

--
-- Name: rubric_criterion; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rubric_criterion ENABLE ROW LEVEL SECURITY;

--
-- Name: scenario; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scenario ENABLE ROW LEVEL SECURITY;

--
-- Name: scenario scenario_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY scenario_select_own ON public.scenario FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: situation_type; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.situation_type ENABLE ROW LEVEL SECURITY;

--
-- Name: situation_type situation_type_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY situation_type_read ON public.situation_type FOR SELECT TO authenticated USING (true);


--
-- Name: source_chunk_competency; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.source_chunk_competency ENABLE ROW LEVEL SECURITY;

--
-- Name: source_chunk_reference; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.source_chunk_reference ENABLE ROW LEVEL SECURITY;

--
-- Name: source_chunk_topic; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.source_chunk_topic ENABLE ROW LEVEL SECURITY;

--
-- Name: source_document; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.source_document ENABLE ROW LEVEL SECURITY;

--
-- Name: source_document_learning_field; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.source_document_learning_field ENABLE ROW LEVEL SECURITY;

--
-- Name: topic; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topic ENABLE ROW LEVEL SECURITY;

--
-- Name: topic topic_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY topic_read ON public.topic FOR SELECT TO authenticated USING (true);


--
-- Name: topic_weight; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topic_weight ENABLE ROW LEVEL SECURITY;

--
-- Name: topic_weight topic_weight_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY topic_weight_read ON public.topic_weight FOR SELECT TO authenticated USING (true);


--
-- Name: topic_weight_set; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.topic_weight_set ENABLE ROW LEVEL SECURITY;

--
-- Name: topic_weight_set topic_weight_set_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY topic_weight_set_read ON public.topic_weight_set FOR SELECT TO authenticated USING (true);


--
-- Name: uebung_skill; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.uebung_skill ENABLE ROW LEVEL SECURITY;

--
-- Name: uebung_skill uebung_skill_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY uebung_skill_read ON public.uebung_skill FOR SELECT TO authenticated USING (true);


--
-- Name: uebungspruefung; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.uebungspruefung ENABLE ROW LEVEL SECURITY;

--
-- Name: uebungspruefung uebungspruefung_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY uebungspruefung_read ON public.uebungspruefung FOR SELECT TO authenticated USING (true);


--
-- Name: user_profile; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profile user_profile_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_profile_select_own ON public.user_profile FOR SELECT TO authenticated USING ((id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_profile user_profile_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_profile_update_own ON public.user_profile FOR UPDATE TO authenticated USING ((id = ( SELECT auth.uid() AS uid))) WITH CHECK ((id = ( SELECT auth.uid() AS uid)));


--
-- Name: workflow_version; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workflow_version ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION assert_answer_exam_chain_consistent(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_answer_exam_chain_consistent() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_answer_exam_chain_consistent() TO service_role;


--
-- Name: FUNCTION assert_audit_event_user_actor(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_audit_event_user_actor() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_audit_event_user_actor() TO service_role;


--
-- Name: FUNCTION assert_exam_id_immutable(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_exam_id_immutable() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_exam_id_immutable() TO service_role;


--
-- Name: FUNCTION assert_grading_result_rubric_matches_question(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_grading_result_rubric_matches_question() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_grading_result_rubric_matches_question() TO service_role;


--
-- Name: FUNCTION assert_merged_hat_vorstufen(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_merged_hat_vorstufen() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_merged_hat_vorstufen() TO service_role;


--
-- Name: FUNCTION assert_merged_hat_vorstufen_zeile(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_merged_hat_vorstufen_zeile() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_merged_hat_vorstufen_zeile() TO service_role;


--
-- Name: FUNCTION assert_question_competency_not_orphaned(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_question_competency_not_orphaned() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_question_competency_not_orphaned() TO service_role;


--
-- Name: FUNCTION assert_question_has_competency(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_question_has_competency() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_question_has_competency() TO service_role;


--
-- Name: FUNCTION assert_question_id_immutable(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_question_id_immutable() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_question_id_immutable() TO service_role;


--
-- Name: FUNCTION assert_question_scenario_id_immutable(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_question_scenario_id_immutable() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_question_scenario_id_immutable() TO service_role;


--
-- Name: FUNCTION assert_rubric_criterion_immutable_once_used(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_rubric_criterion_immutable_once_used() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_rubric_criterion_immutable_once_used() TO service_role;


--
-- Name: FUNCTION assert_rubric_criterion_set_frozen(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_rubric_criterion_set_frozen() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_rubric_criterion_set_frozen() TO service_role;


--
-- Name: FUNCTION assert_rubric_immutable_once_used(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_rubric_immutable_once_used() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_rubric_immutable_once_used() TO service_role;


--
-- Name: FUNCTION assert_supersedes_nicht_vorstufe(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.assert_supersedes_nicht_vorstufe() FROM PUBLIC;
GRANT ALL ON FUNCTION public.assert_supersedes_nicht_vorstufe() TO service_role;


--
-- Name: FUNCTION build_weight_set_from_pass(p_pass_id uuid, p_label text, p_design_effect numeric); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.build_weight_set_from_pass(p_pass_id uuid, p_label text, p_design_effect numeric) FROM PUBLIC;
GRANT ALL ON FUNCTION public.build_weight_set_from_pass(p_pass_id uuid, p_label text, p_design_effect numeric) TO service_role;


--
-- Name: FUNCTION consume_ai_budget(p_user uuid, p_limit integer); Type: ACL; Schema: public; Owner: -
--


--
-- Name: FUNCTION fehler_trend(p_erstes timestamp with time zone, p_letztes timestamp with time zone, p_bisher integer, p_jetzt timestamp with time zone); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.fehler_trend(p_erstes timestamp with time zone, p_letztes timestamp with time zone, p_bisher integer, p_jetzt timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.fehler_trend(p_erstes timestamp with time zone, p_letztes timestamp with time zone, p_bisher integer, p_jetzt timestamp with time zone) TO service_role;


--
-- Name: FUNCTION finish_exam_attempt(p_attempt_id uuid); Type: ACL; Schema: public; Owner: -
--


--
-- Name: FUNCTION increment_flashcard_progress(p_card_id text, p_correct boolean); Type: ACL; Schema: public; Owner: -
--


--
-- Name: FUNCTION increment_topic_mastery(p_topic_id text, p_correct boolean); Type: ACL; Schema: public; Owner: -
--


--
-- Name: FUNCTION mastery_neu(p_alt numeric, p_versuche integer, p_quote numeric); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.mastery_neu(p_alt numeric, p_versuche integer, p_quote numeric) FROM PUBLIC;
GRANT ALL ON FUNCTION public.mastery_neu(p_alt numeric, p_versuche integer, p_quote numeric) TO service_role;


--
-- Name: FUNCTION profil_anlegen(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.profil_anlegen() FROM PUBLIC;
GRANT ALL ON FUNCTION public.profil_anlegen() TO service_role;


--
-- Name: FUNCTION pruefung_abschliessen(p_exam_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.pruefung_abschliessen(p_exam_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.pruefung_abschliessen(p_exam_id uuid) TO service_role;
GRANT ALL ON FUNCTION public.pruefung_abschliessen(p_exam_id uuid) TO authenticated;


--
-- Name: FUNCTION readiness_score(p_weight_set_id uuid, p_mastery jsonb); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.readiness_score(p_weight_set_id uuid, p_mastery jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.readiness_score(p_weight_set_id uuid, p_mastery jsonb) TO service_role;


--
-- Name: FUNCTION readiness_snapshot_schreiben(p_user uuid, p_trigger text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.readiness_snapshot_schreiben(p_user uuid, p_trigger text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.readiness_snapshot_schreiben(p_user uuid, p_trigger text) TO service_role;


--
-- Name: FUNCTION release_ai_budget(p_user uuid); Type: ACL; Schema: public; Owner: -
--


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION submit_self_grade(p_attempt_id uuid, p_question_id text, p_antworttext text, p_punkte integer); Type: ACL; Schema: public; Owner: -
--


--
-- Name: FUNCTION tg_topic_weight_sealed(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.tg_topic_weight_sealed() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_topic_weight_sealed() TO service_role;


--
-- Name: FUNCTION tg_topic_weight_set_activation_handoff(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.tg_topic_weight_set_activation_handoff() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_topic_weight_set_activation_handoff() TO service_role;


--
-- Name: FUNCTION tg_topic_weight_set_sealed(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.tg_topic_weight_set_sealed() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_topic_weight_set_sealed() TO service_role;


--
-- Name: FUNCTION tg_topic_weight_sums_to_one(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.tg_topic_weight_sums_to_one() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_topic_weight_sums_to_one() TO service_role;


--
-- Name: FUNCTION uebung_skills_setzen(p_exam uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebung_skills_setzen(p_exam uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebung_skills_setzen(p_exam uuid) TO service_role;


--
-- Name: FUNCTION uebungspruefung_anlegen(p_variante text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_anlegen(p_variante text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_anlegen(p_variante text) TO service_role;
GRANT ALL ON FUNCTION public.uebungspruefung_anlegen(p_variante text) TO authenticated;


--
-- Name: FUNCTION uebungspruefung_anlegen_roh(p_satz smallint); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_anlegen_roh(p_satz smallint) FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_anlegen_roh(p_satz smallint) TO service_role;


--
-- Name: FUNCTION uebungspruefung_ap1_2021_herbst_roh(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_ap1_2021_herbst_roh() FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_ap1_2021_herbst_roh() TO service_role;


--
-- Name: FUNCTION uebungspruefung_ap1_2022_fruehjahr_roh(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_ap1_2022_fruehjahr_roh() FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_ap1_2022_fruehjahr_roh() TO service_role;


--
-- Name: FUNCTION uebungspruefung_ap1_2022_herbst_roh(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_ap1_2022_herbst_roh() FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_ap1_2022_herbst_roh() TO service_role;


--
-- Name: FUNCTION uebungspruefung_ap1_2025_fruehjahr_roh(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_ap1_2025_fruehjahr_roh() FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_ap1_2025_fruehjahr_roh() TO service_role;


--
-- Name: FUNCTION uebungspruefung_servicedesk_roh(p_satz smallint); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_servicedesk_roh(p_satz smallint) FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_servicedesk_roh(p_satz smallint) TO service_role;


--
-- Name: FUNCTION uebungspruefung_vlan_grundlagen_roh(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.uebungspruefung_vlan_grundlagen_roh() FROM PUBLIC;
GRANT ALL ON FUNCTION public.uebungspruefung_vlan_grundlagen_roh() TO service_role;


--
-- Name: FUNCTION update_competency_state(p_grading_result_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.update_competency_state(p_grading_result_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.update_competency_state(p_grading_result_id uuid) TO service_role;


--
-- Name: FUNCTION update_error_pattern(p_grading_result_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.update_error_pattern(p_grading_result_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.update_error_pattern(p_grading_result_id uuid) TO service_role;


--
-- Name: FUNCTION write_grading_result(p_answer_id uuid, p_rubric_id uuid, p_result jsonb); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.write_grading_result(p_answer_id uuid, p_rubric_id uuid, p_result jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.write_grading_result(p_answer_id uuid, p_rubric_id uuid, p_result jsonb) TO service_role;


--
-- Name: TABLE ai_call_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.ai_call_log TO authenticated;
GRANT ALL ON TABLE public.ai_call_log TO service_role;


--
-- Name: TABLE answer; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,DELETE ON TABLE public.answer TO authenticated;
GRANT ALL ON TABLE public.answer TO service_role;


--
-- Name: COLUMN answer.user_id; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(user_id) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.exam_id; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(exam_id) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.question_id; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(question_id) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.learning_session_id; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(learning_session_id) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.attempt_no; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(attempt_no) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.draft_text; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(draft_text),UPDATE(draft_text) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.answer_text; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(answer_text),UPDATE(answer_text) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.is_flagged; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(is_flagged),UPDATE(is_flagged) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.is_final; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(is_final),UPDATE(is_final) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.started_at; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(started_at) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.autosaved_at; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(autosaved_at),UPDATE(autosaved_at) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.submitted_at; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(submitted_at),UPDATE(submitted_at) ON TABLE public.answer TO authenticated;


--
-- Name: COLUMN answer.time_spent_seconds; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(time_spent_seconds),UPDATE(time_spent_seconds) ON TABLE public.answer TO authenticated;


--
-- Name: TABLE answer_format; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.answer_format TO authenticated;
GRANT ALL ON TABLE public.answer_format TO service_role;


--
-- Name: TABLE attachment; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.attachment TO authenticated;
GRANT ALL ON TABLE public.attachment TO service_role;


--
-- Name: TABLE attachment_type; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.attachment_type TO authenticated;
GRANT ALL ON TABLE public.attachment_type TO service_role;


--
-- Name: TABLE audit_event; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.audit_event TO service_role;


--
-- Name: TABLE coding_pass; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.coding_pass TO authenticated;
GRANT ALL ON TABLE public.coding_pass TO service_role;


--
-- Name: TABLE cognitive_level; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.cognitive_level TO authenticated;
GRANT ALL ON TABLE public.cognitive_level TO service_role;


--
-- Name: TABLE competency; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.competency TO authenticated;
GRANT ALL ON TABLE public.competency TO service_role;


--
-- Name: TABLE competency_state; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.competency_state TO authenticated;
GRANT ALL ON TABLE public.competency_state TO service_role;


--
-- Name: TABLE computation_type; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.computation_type TO authenticated;
GRANT ALL ON TABLE public.computation_type TO service_role;


--
-- Name: TABLE curriculum_node; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.curriculum_node TO authenticated;
GRANT ALL ON TABLE public.curriculum_node TO service_role;


--
-- Name: TABLE error_pattern; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.error_pattern TO authenticated;
GRANT ALL ON TABLE public.error_pattern TO service_role;


--
-- Name: TABLE exam; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.exam TO authenticated;
GRANT ALL ON TABLE public.exam TO service_role;


--
-- Name: COLUMN exam.title; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(title) ON TABLE public.exam TO authenticated;


--
-- Name: COLUMN exam.started_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(started_at) ON TABLE public.exam TO authenticated;


--
-- Name: COLUMN exam.last_autosave_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(last_autosave_at) ON TABLE public.exam TO authenticated;


--
-- Name: COLUMN exam.submitted_at; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(submitted_at) ON TABLE public.exam TO authenticated;


--
-- Name: TABLE exam_blueprint; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.exam_blueprint TO authenticated;
GRANT ALL ON TABLE public.exam_blueprint TO service_role;


--
-- Name: TABLE exam_corpus_entry; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.exam_corpus_entry TO authenticated;
GRANT ALL ON TABLE public.exam_corpus_entry TO service_role;


--
-- Name: TABLE exam_corpus_entry_competency; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.exam_corpus_entry_competency TO authenticated;
GRANT ALL ON TABLE public.exam_corpus_entry_competency TO service_role;


--
-- Name: TABLE exam_corpus_entry_topic; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.exam_corpus_entry_topic TO authenticated;
GRANT ALL ON TABLE public.exam_corpus_entry_topic TO service_role;


--
-- Name: TABLE exam_item_assignment; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.exam_item_assignment TO authenticated;
GRANT ALL ON TABLE public.exam_item_assignment TO service_role;


--
-- Name: TABLE generation_job; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.generation_job TO authenticated;
GRANT ALL ON TABLE public.generation_job TO service_role;


--
-- Name: TABLE grading_criterion_result; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.grading_criterion_result TO authenticated;
GRANT ALL ON TABLE public.grading_criterion_result TO service_role;


--
-- Name: TABLE grading_result; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.grading_result TO authenticated;
GRANT ALL ON TABLE public.grading_result TO service_role;


--
-- Name: COLUMN grading_result.review_status; Type: ACL; Schema: public; Owner: -
--

GRANT UPDATE(review_status) ON TABLE public.grading_result TO authenticated;


--
-- Name: TABLE grading_result_source; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.grading_result_source TO authenticated;
GRANT ALL ON TABLE public.grading_result_source TO service_role;


--
-- Name: TABLE job_error_code; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.job_error_code TO authenticated;
GRANT ALL ON TABLE public.job_error_code TO service_role;


--
-- Name: TABLE learning_field; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.learning_field TO authenticated;
GRANT ALL ON TABLE public.learning_field TO service_role;


--
-- Name: TABLE learning_session; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.learning_session TO authenticated;
GRANT ALL ON TABLE public.learning_session TO service_role;


--
-- Name: TABLE model_class_route; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.model_class_route TO authenticated;
GRANT ALL ON TABLE public.model_class_route TO service_role;


--
-- Name: TABLE model_pricing; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.model_pricing TO authenticated;
GRANT ALL ON TABLE public.model_pricing TO service_role;


--
-- Name: TABLE source_document; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.source_document TO authenticated;
GRANT ALL ON TABLE public.source_document TO service_role;


--
-- Name: TABLE topic; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.topic TO authenticated;
GRANT ALL ON TABLE public.topic TO service_role;


--
-- Name: TABLE mv_topic_frequency; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.mv_topic_frequency TO authenticated;
GRANT ALL ON TABLE public.mv_topic_frequency TO service_role;


--
-- Name: TABLE prompt_version; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.prompt_version TO authenticated;
GRANT ALL ON TABLE public.prompt_version TO service_role;


--
-- Name: TABLE question; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question TO service_role;


--
-- Name: COLUMN question.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.user_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(user_id) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.scenario_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(scenario_id) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question."position"; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT("position") ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.prompt; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(prompt) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.question_type_code; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(question_type_code) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.answer_format_code; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(answer_format_code) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.cognitive_level_code; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(cognitive_level_code) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.computation_type_code; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(computation_type_code) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.difficulty; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(difficulty) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.max_points; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(max_points) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.expected_minutes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(expected_minutes) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.status; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(status) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.workflow_version_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(workflow_version_id) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.prompt_version_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(prompt_version_id) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.generation_job_id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(generation_job_id) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.question TO authenticated;


--
-- Name: COLUMN question.updated_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(updated_at) ON TABLE public.question TO authenticated;


--
-- Name: TABLE question_competency; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.question_competency TO authenticated;
GRANT ALL ON TABLE public.question_competency TO service_role;


--
-- Name: TABLE question_skill; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.question_skill TO authenticated;
GRANT ALL ON TABLE public.question_skill TO service_role;


--
-- Name: TABLE question_type; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.question_type TO authenticated;
GRANT ALL ON TABLE public.question_type TO service_role;


--
-- Name: TABLE readiness_snapshot; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT ON TABLE public.readiness_snapshot TO authenticated;
GRANT ALL ON TABLE public.readiness_snapshot TO service_role;


--
-- Name: TABLE rubric; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.rubric TO authenticated;
GRANT ALL ON TABLE public.rubric TO service_role;


--
-- Name: TABLE rubric_criterion; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.rubric_criterion TO authenticated;
GRANT ALL ON TABLE public.rubric_criterion TO service_role;


--
-- Name: TABLE scenario; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.scenario TO authenticated;
GRANT ALL ON TABLE public.scenario TO service_role;


--
-- Name: TABLE situation_type; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.situation_type TO authenticated;
GRANT ALL ON TABLE public.situation_type TO service_role;


--
-- Name: TABLE source_chunk_competency; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.source_chunk_competency TO authenticated;
GRANT ALL ON TABLE public.source_chunk_competency TO service_role;


--
-- Name: TABLE source_chunk_reference; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.source_chunk_reference TO authenticated;
GRANT ALL ON TABLE public.source_chunk_reference TO service_role;


--
-- Name: TABLE source_chunk_topic; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.source_chunk_topic TO authenticated;
GRANT ALL ON TABLE public.source_chunk_topic TO service_role;


--
-- Name: TABLE source_document_learning_field; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.source_document_learning_field TO authenticated;
GRANT ALL ON TABLE public.source_document_learning_field TO service_role;


--
-- Name: TABLE topic_weight; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.topic_weight TO authenticated;
GRANT ALL ON TABLE public.topic_weight TO service_role;


--
-- Name: TABLE topic_weight_set; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.topic_weight_set TO authenticated;
GRANT ALL ON TABLE public.topic_weight_set TO service_role;


--
-- Name: TABLE uebung_skill; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.uebung_skill TO authenticated;
GRANT ALL ON TABLE public.uebung_skill TO service_role;


--
-- Name: TABLE uebungspruefung; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.uebungspruefung TO authenticated;
GRANT ALL ON TABLE public.uebungspruefung TO service_role;


--
-- Name: TABLE user_profile; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,UPDATE ON TABLE public.user_profile TO authenticated;
GRANT ALL ON TABLE public.user_profile TO service_role;


--
-- Name: TABLE v_ap1_bewertung_unvollstaendig; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.v_ap1_bewertung_unvollstaendig TO service_role;
GRANT SELECT ON TABLE public.v_ap1_bewertung_unvollstaendig TO authenticated;


--
-- Name: TABLE v_ap1_fehlerprofil; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.v_ap1_fehlerprofil TO authenticated;
GRANT ALL ON TABLE public.v_ap1_fehlerprofil TO service_role;


--
-- Name: TABLE v_ap1_nachpruefung; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.v_ap1_nachpruefung TO authenticated;
GRANT ALL ON TABLE public.v_ap1_nachpruefung TO service_role;


--
-- Name: TABLE v_ap1_readiness; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.v_ap1_readiness TO authenticated;
GRANT ALL ON TABLE public.v_ap1_readiness TO service_role;


--
-- Name: TABLE v_kb_zuordnung; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.v_kb_zuordnung TO service_role;


--
-- Name: TABLE v_kb_verstoss; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.v_kb_verstoss TO service_role;


--
-- Name: TABLE v_source_chunk_rag_metadata; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.v_source_chunk_rag_metadata TO service_role;


--
-- Name: TABLE workflow_version; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.workflow_version TO authenticated;
GRANT ALL ON TABLE public.workflow_version TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
--
