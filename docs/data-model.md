# Datenmodell (Supabase / Postgres)

Ursprünglicher fachlicher Entwurf: [docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md#datenmodell-supabase--postgres).
Das Schema ist inzwischen implementiert (Task 7, Migration in `app/supabase/migrations/`) — dieses
Dokument beschreibt den **tatsächlich angelegten** Stand, nicht mehr nur den Entwurf. Läuft seit dem
Lovable-Pivot (siehe [context.md](context.md#pivot-lovable-credit-limit-10092026)) auf einem
self-hosted Postgres via Supabase auf dem armserver (`supabase.alexle135.de`), nicht mehr auf
Lovables verwaltetem Projekt.

## Tabellen

Die Spec sah zusätzlich eine `profiles`-Tabelle vor; Lovable hat bei der Schema-Implementierung
(Task 7) nur die folgenden 6 Tabellen angelegt. Kein nachgelagerter Task konsumiert `profiles` — bei
Bedarf (z. B. Anzeigename statt E-Mail) müsste sie nachträglich per Migration ergänzt werden.

| Tabelle | Zweck | Schlüsselfelder |
|---|---|---|
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

Alle Tabellen sind implizit auf einen einzelnen `user_id` skaliert (Single-User, siehe
[vision.md](vision.md#nicht-ziele-aktuelle-iteration)) — RLS-Policies entsprechend einfach halten,
keine Mehrbenutzer-Vorbereitung einbauen.
