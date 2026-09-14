# Datenmodell (Supabase / Postgres)

Ursprünglicher fachlicher Entwurf: [docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md#datenmodell-supabase--postgres).
Das Schema ist inzwischen implementiert (Task 7, Migration in `app/supabase/migrations/`) — dieses
Dokument beschreibt den **tatsächlich angelegten** Stand, nicht mehr nur den Entwurf. Läuft seit dem
Lovable-Pivot (siehe [context.md](context.md#pivot-lovable-credit-limit-10092026)) auf einem
self-hosted Postgres via Supabase auf dem armserver (`supabase.alexle135.de`), nicht mehr auf
Lovables verwaltetem Projekt.

## Überblick: zwei Schema-Generationen

Die Datenbank enthält seit dem 14.09.2026 **57 Tabellen in zwei klar getrennten Gruppen**:

1. **Lernplattform-Kern (7 Tabellen)** — die ursprünglich mit Task 7 angelegten Tabellen, die
   die ausgelieferte App (`app/`) nutzt. Sie sind unten im Detail beschrieben.
2. **Aufgaben-/Bewertungspipeline (50 Tabellen, 38 Funktionen, 7 Views, 33 Enum-Typen)** —
   eine umfangreichere, jüngere Architektur rund um Kompetenzmodell, Rubrics, Prüfungs-Blueprints
   und Quellenverwaltung (`competency`, `curriculum_node`, `rubric`, `rubric_criterion`,
   `grading_result`, `exam_blueprint`, `question`, `topic_weight`, `source_document`,
   `source_chunk_reference`, `model_pricing`, `prompt_version`, `workflow_version` u. a.).

Beide Gruppen sind **vollständig entkoppelt**: zwischen ihnen existiert kein einziger
Fremdschlüssel. Die 50 Tabellen der zweiten Gruppe waren bis zum 14.09.2026 **nicht im Repository
abgebildet** — sie waren direkt in der Produktionsdatenbank entstanden. Migration
`20260914170000_baseline_live_schema.sql` hat diesen Ist-Zustand aufgenommen; seitdem baut sich
das vollständige Schema wieder allein aus `app/supabase/migrations/` auf (nachgewiesen über einen
Objektvergleich: 1655 Objekteigenschaften, keine Abweichung — siehe
[ADR-0006](adr/0006-schema-baseline-statt-drift.md)).

Alle 57 Tabellen haben RLS aktiviert. 16 davon führen bewusst **keine** Policy — RLS ohne Policy
wirkt als Deny-all, der Zugriff läuft dort ausschließlich über `service_role` bzw.
`security definer`-Funktionen. `scripts/validate_migrations.py` erzwingt, dass jede Tabelle einem
der beiden Muster folgt.

## Tabellen (Lernplattform-Kern)

Die Spec sah zusätzlich eine `profiles`-Tabelle vor; Lovable hat bei der Schema-Implementierung
(Task 7) nur die folgenden 6 Tabellen angelegt (`ai_budget_daily` kam später dazu). Kein
nachgelagerter Task konsumiert `profiles` — bei Bedarf (z. B. Anzeigename statt E-Mail) müsste sie
nachträglich per Migration ergänzt werden. Die zweite Schema-Generation bringt inzwischen eine
eigene `user_profile`-Tabelle mit, die die App bislang nicht nutzt.

| Tabelle              | Zweck                                                                                    | Schlüsselfelder                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `topic_mastery`      | Fortschritt „Rechnen üben" pro Thema                                                     | `user_id`, `topic_id`, `richtig`, `falsch`, `updated_at`                                                                        |
| `flashcard_progress` | Fortschritt „Wissenskarten" pro Karte                                                    | `user_id`, `card_id`, `richtig`, `falsch`, `updated_at`                                                                         |
| `exam_questions`     | Einmalig migrierte Prüfungsfragen mit optionalen Visuals                                 | Prüfung, Aufgabennummer, Text, Musterlösung, Punkte, `visual_type`, `visual_data`, `visual_path`, `visual_alt`, `answer_schema` |
| `exam_attempts`      | Ein Durchlauf einer Probeprüfung                                                         | `user_id`, `exam_id`, `started_at`, `finished_at`, `gesamtpunkte`                                                               |
| `exam_answers`       | Antwort + KI-Bewertung pro Teilaufgabe                                                   | `attempt_id`, `question_id`, `antworttext`, `ki_punkte`, `ki_feedback`, `user_id`, `created_at`                                 |
| `error_log`          | Automatisch befüllt aus falschen Generator-Antworten und niedrig bewerteten KI-Antworten | Thema, Zeitpunkt, Kurzbeschreibung                                                                                              |

## Herkunft der Daten

- `topic_mastery`, `flashcard_progress`, `exam_attempts`, `exam_answers`, `error_log`: entstehen zur
  Laufzeit durch Nutzung der App (ersetzen `ap1state` in `localStorage` sowie die manuell gepflegten
  `04_LERNFORTSCHRITT.md` / `05_FEHLERLISTE.md`).
- `exam_questions`: einmaliger Import via `scripts/migrate/parse_exams.py` aus `probepruefungen/` +
  `loesungen/`; optionale Visual- und Antwortschemata werden aus
  `data/source/exam_question_enrichments.json` zugemischt. Bestehende Fragen ohne diese Felder
  bleiben Freitext. Danach ist `exam_questions` die Quelle der Wahrheit, nicht mehr die `.md`-Dateien.
- Lernblätter (`lernen/*.md`), Formelsammlung (`02_FORMELSAMMLUNG.md`) und Lernplan
  (`01_LERNPLAN.md`) sind per `parse_lernblaetter.py`/`parse_formelsammlung.py`/`parse_lernplan.py`
  bereits nach `data/migration/*.json` migriert, bekommen aber **keine** eigene Postgres-Tabelle —
  sie landen als statische JSON-Assets direkt in der App (siehe Modul-Tabelle in
  [architecture.md](architecture.md#feature-module-7)), sobald die zugehörigen Routen implementiert
  sind.

## Beziehungen

```
exam_attempts 1──n exam_answers n──1 exam_questions
auth.users 1──n topic_mastery
auth.users 1──n flashcard_progress
auth.users 1──n exam_attempts
```

Schreibzugriff auf Bewertungsdaten läuft ausschließlich über geprüfte serverseitige Pfade:
`exam_answers` hat für `authenticated` kein `INSERT`/`UPDATE` (nur `submit_self_grade` und die Edge
Function mit `service_role`), `exam_attempts` kein `UPDATE` und `INSERT` nur auf `exam_id`/`user_id`.
`gesamtpunkte` wird nie vom Client gesetzt, sondern von `finish_exam_attempt` bzw.
`submit_self_grade` aus `sum(exam_answers.ki_punkte)` berechnet. Die RPCs leiten die Identität immer
aus `auth.uid()` ab und nehmen nie eine `user_id` als Parameter entgegen.

Alle fachlichen Tabellen sind über `user_id` nutzerspezifisch (RLS: `auth.uid() = user_id`) und
auf mehrere Nutzer skaliert — die Registrierung ist seit `public-signup` offen (E-Mail-Bestätigung
erforderlich). Kostenkontrolle: die KI-Bewertung ist auf 50 Bewertungen je Nutzer/Tag begrenzt
(`exam_answers.created_at`, geprüft in der Edge Function). Account-Löschung entfernt den
`auth.users`-Eintrag; alle Fachdaten hängen per FK `ON DELETE CASCADE` daran.

Schreibzugriff auf Bewertungsdaten läuft ausschließlich über geprüfte serverseitige Pfade:
`exam_answers` hat für `authenticated` kein `INSERT`/`UPDATE` (nur `submit_self_grade` und die
Edge Function mit `service_role`), `exam_attempts` kein `UPDATE` und `INSERT` nur auf
`exam_id`/`user_id`. `gesamtpunkte` wird nie vom Client gesetzt, sondern von
`finish_exam_attempt` bzw. `submit_self_grade` aus `sum(exam_answers.ki_punkte)` berechnet.
