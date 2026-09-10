# docs/lovable/prompts/03-content-import.md

## exam_questions importieren

Der Import erfolgt nicht über einen Lovable-Prompt, sondern direkt per
`query_database` gegen das Projekt (`32348bcb-dc62-470a-9d81-04184d270545`).
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
                return s.replace("'", "''")
            lines.append(
                "insert into exam_questions (id, exam_id, aufgabe_nr, teil, frage, max_punkte, musterloesung) "
                f"values ('{qid}', '{exam['exam_id']}', {aufgabe['aufgabe_nr']}, '{t['teil']}', "
                f"'{esc(t['frage'])}', {t['max_punkte']}, '{esc(t['musterloesung'])}');"
            )
print("\n".join(lines))
```

Erwartet: 77 Insert-Statements (24 + 26 + 27 Teilaufgaben).

### 2. Import ausführen (idempotent)

Alle Statements als **ein Batch in einer Transaktion**, mit `DELETE`
vorab, damit der Import jederzeit wiederholbar ist:

```sql
BEGIN;
DELETE FROM exam_questions;
<77 insert statements>
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
