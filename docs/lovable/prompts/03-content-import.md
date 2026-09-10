# docs/lovable/prompts/03-content-import.md

## exam_questions importieren

Der Import erfolgt nicht über einen Lovable-Prompt, sondern direkt per
`query_database` (Lovable) bzw. `psql` im Container `supabase-db` auf dem
armserver gegen die eigene Instanz (`supabase.alexle135.de`).
Quelle ist `data/migration/exam_questions.json` (aus Task 4).

### 1. SQL-Insert aus JSON erzeugen

```python
import json

data = json.load(open("data/migration/exam_questions.json"))
lines = []
for exam in data:
    for aufgabe in exam["aufgaben"]:
        for t in aufgabe["teilaufgaben"]:
            qid = f"{exam['exam_id']}-{aufgabe['aufgabe_nr']}-{t['teil']}"
            def esc(s):
                return "" if s is None else str(s).replace("'", "''")
            lines.append(
                "insert into exam_questions (id, exam_id, aufgabe_nr, teil, frage, max_punkte, musterloesung, intro, ausgangssituation) "
                f"values ('{esc(qid)}', '{esc(exam['exam_id'])}', {aufgabe['aufgabe_nr']}, '{esc(t['teil'])}', "
                f"'{esc(t['frage'])}', {t['max_punkte']}, '{esc(t['musterloesung'])}', "
                f"'{esc(aufgabe['intro'])}', '{esc(exam['ausgangssituation'])}') "
                "on conflict (id) do update set frage = excluded.frage, musterloesung = excluded.musterloesung, "
                "max_punkte = excluded.max_punkte, intro = excluded.intro, ausgangssituation = excluded.ausgangssituation;"
            )
print("\n".join(lines))
```

Erwartet: 77 Upsert-Statements (24 + 26 + 27 Teilaufgaben). `intro`
(Aufgaben-Vorwort) und `ausgangssituation` (Prüfungs-Kontext) werden
mit importiert — mehrere Fragen sind ohne diesen Kontext nicht
beantwortbar (z. B. probepruefung_02 Frage 1a verweist auf das
Angeboten-Table im Intro).

### 2. Import ausführen (idempotent)

Alle Statements als **ein Batch in einer Transaktion**. Kein `DELETE`
vorab: `exam_answers.question_id` referenziert `exam_questions.id` ohne
`ON DELETE CASCADE`, ein Tabellen-DELETE würde ab dem ersten gespeicherten
Antwortversuch scheitern. Stattdessen konflikt-bewusste Upserts
(`on conflict (id) do update`) — existierende Question-IDs bleiben
erhalten, Referenzen bleiben intakt, der Import ist jederzeit wiederholbar:

```sql
BEGIN;
<77 upsert statements>
COMMIT;
```

### 3. Verifikation

```sql
select exam_id, count(*)::int as n, sum(max_punkte)::int as punkte
from exam_questions group by exam_id order by exam_id;
```

Erwartet: `probepruefung_01` = 24 / 100 P, `probepruefung_02` = 26 / 100 P,
`probepruefung_03` = 27 / 100 P.

Zusätzlich auf Leaked-Divider prüfen (muss 0 sein):

```sql
select count(*) from exam_questions
where frage ~ '[\n]-{1,3}\s*$' or musterloesung ~ '[\n]-{1,3}\s*$';
```

### 4. Was NICHT importiert wird

Lernblätter, Formelsammlung und Lernplan werden nicht in eigene Tabellen
importiert — sie werden in Task 10/11/12 direkt als statischer Content in
die jeweiligen React-Komponenten eingebettet (kleinere, selten geänderte
Inhalte, kein Admin-Update-Bedarf).
