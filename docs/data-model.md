# Datenmodell (Supabase / Postgres)

Quelle: [docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md#datenmodell-supabase--postgres).
Konkrete Spaltentypen/Constraints werden erst bei der Implementierung (Task „Supabase-Auth-Schema" im
Plan) als Migrationsdateien festgelegt — hier steht der fachliche Entwurf, nicht das SQL.

## Tabellen

| Tabelle | Zweck | Schlüsselfelder |
|---|---|---|
| `profiles` | Ein Nutzer-Datensatz (Alex, Single-User) | `user_id` |
| `topic_mastery` | Fortschritt „Rechnen üben" pro Thema | `user_id`, `topic_id`, `richtig`, `falsch`, `updated_at` |
| `flashcard_progress` | Fortschritt „Wissenskarten" pro Karte | `user_id`, `card_id`, `richtig`, `falsch`, `updated_at` |
| `exam_questions` | Einmalig aus den `.md`-Dateien migrierte Prüfungsfragen | Prüfung, Aufgabennummer, Teilaufgaben-Text, Musterlösung, Punkteverteilung |
| `exam_attempts` | Ein Durchlauf einer Probeprüfung | `user_id`, `exam_id`, `started_at`, `finished_at`, `gesamtpunkte` |
| `exam_answers` | Antwort + KI-Bewertung pro Teilaufgabe | `attempt_id`, `question_id`, `antworttext`, `ki_punkte`, `ki_feedback` |
| `error_log` | Automatisch befüllt aus falschen Generator-Antworten und niedrig bewerteten KI-Antworten | Thema, Zeitpunkt, Kurzbeschreibung |

## Herkunft der Daten

- `topic_mastery`, `flashcard_progress`, `exam_attempts`, `exam_answers`, `error_log`: entstehen zur
  Laufzeit durch Nutzung der App (ersetzen `ap1state` in `localStorage` sowie die manuell gepflegten
  `04_LERNFORTSCHRITT.md` / `05_FEHLERLISTE.md`).
- `exam_questions`: einmaliger Import via `scripts/migrate/parse_exams.py` aus `probepruefungen/` +
  `loesungen/` — danach ist `exam_questions` die Quelle der Wahrheit, nicht mehr die `.md`-Dateien.
- Lernblätter (`lernen/*.md`) und Formelsammlung (`02_FORMELSAMMLUNG.md`) werden laut Spec ebenfalls
  importiert (`parse_lernblaetter.py`, `parse_formelsammlung.py`), tauchen aber in der Tabellenliste
  der Spec nicht als eigene Postgres-Tabelle auf — beim Task „Content-Import" im Plan klären, ob sie
  eigene Tabellen bekommen oder als JSON/Static-Assets in der App landen.

## Beziehungen

```
exam_attempts 1──n exam_answers n──1 exam_questions
profiles 1──n topic_mastery
profiles 1──n flashcard_progress
profiles 1──n exam_attempts
```

Alle Tabellen sind implizit auf einen einzelnen `user_id` skaliert (Single-User, siehe
[vision.md](vision.md#nicht-ziele-aktuelle-iteration)) — RLS-Policies entsprechend einfach halten,
keine Mehrbenutzer-Vorbereitung einbauen.
