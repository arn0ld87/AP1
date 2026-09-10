# AP1-Lernplattform (Lovable) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die statischen AP1-Lernmaterialien (Trainer, Lernblätter, Formelsammlung, Probeprüfungen, Lösungen, Lernplan) in eine über Lovable gebaute, Supabase-gestützte Lernplattform mit KI-Prüfungsbewertung überführen.

**Architecture:** Zwei Teile: (1) lokale Python-Migrationsskripte in diesem Repo, die die vorhandenen `.md`-Dateien in strukturiertes JSON überführen; (2) eine Lovable-App (React/Vite/TS/Tailwind/shadcn + Supabase), gebaut über eine Serie von `lovable`-Skill-Prompts, die das JSON importiert und die 7 Feature-Module implementiert. Die KI-Bewertung der Probeprüfungen läuft über eine Supabase Edge Function, die Amazon Bedrock aufruft.

**Tech Stack:** Python 3.12 (Stdlib, keine Zusatzpakete) für die Migration; Lovable-Standard (React + Vite + TypeScript + Tailwind + shadcn/ui) + Supabase (Auth, Postgres, Edge Functions) für die App; Amazon Bedrock (Claude Haiku 4.5, Fallback 3.5) für die KI-Bewertung.

**Spec:** [docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](../specs/2026-09-10-lovable-ap1-plattform-design.md)

## Global Constraints

- Auth: E-Mail + Passwort, ein einzelner Account (Alex) — kein Multi-User.
- Design: „Discord-Stil" — dunkles Theme, linke Sidebar-Navigation, abgerundete Karten, eigenständige Optik ohne Bezug zum alexle135-Branding.
- KI-Modell: **Claude Haiku 4.5** über Amazon Bedrock, sofern in der genutzten Region freigeschaltet; sonst Fallback **Claude 3.5 Haiku**.
- Secrets (`AWS_BEDROCK_API_KEY`, `BEDROCK_GATEWAY_KEY`) ausschließlich als Supabase-Edge-Function-Secret, niemals im Frontend-Bundle oder in Prompts/Chat im Klartext.
- Kein automatisierter Test-Runner — jede Aufgabe endet mit einer manuellen Verifikation in der Lovable-Preview (Klick-Pfad + erwartetes Ergebnis).
- Migrationsskripte: reines Python-Stdlib (`re`, `json`, `pathlib`), keine neuen Abhängigkeiten.
- Deploy: Lovable-Live-Deploy nach Fertigstellung. Eigene Domain (`ap1.alexle135.de`) ist explizit **out of scope** dieser Iteration.

---

## File Structure

```
scripts/migrate/
  parse_lernblaetter.py       # lernen/*.md → data/migration/lernblaetter.json
  parse_formelsammlung.py     # 02_FORMELSAMMLUNG.md → data/migration/formelsammlung.json
  parse_lernplan.py           # 01_LERNPLAN.md → data/migration/lernplan.json
  parse_exams.py              # probepruefungen/ + loesungen/ → data/migration/exam_questions.json
scripts/
  check_bedrock_access.py     # prüft Modellzugriff für Haiku 4.5 / 3.5 auf Bedrock
data/migration/
  lernblaetter.json
  formelsammlung.json
  lernplan.json
  exam_questions.json
docs/lovable/
  bedrock-model-check.md      # Ergebnis des Modellzugriffs-Checks
  prompts/
    01-bootstrap-design-system.md
    02-supabase-auth-schema.md
    03-content-import.md
    04-rechnen-ueben.md
    05-wissenskarten.md
    06-lernblaetter.md
    07-formelsammlung.md
    08-tagesplan.md
    09-pruefungsmodus-ki-bewertung.md
    10-fortschritt-fehlerliste.md
```

Jede Datei unter `docs/lovable/prompts/` ist der exakte Prompttext, der per `send_message`/`create_project` an Lovable geschickt wird — Audit-Trail und Wiederholbarkeit, falls ein Schritt neu gemacht werden muss.

---

### Task 1: Lernblätter migrieren

**Files:**
- Create: `scripts/migrate/parse_lernblaetter.py`
- Create: `data/migration/lernblaetter.json` (Output, nicht von Hand geschrieben)

**Interfaces:**
- Produces: `lernblaetter.json` — Liste von Objekten `{id, title, verstehen, auswendig_wissen, formeln, musteraufgabe, loesungsschritte, haeufige_fehler, merksatz}`, jeweils Markdown-Fließtext als String. Wird von Task 6 (Lovable-Prompt „Lernblätter") konsumiert.

- [ ] **Step 1: Skript schreiben**

```python
# scripts/migrate/parse_lernblaetter.py
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "lernen"
OUT = REPO / "data" / "migration" / "lernblaetter.json"

HEADING_MAP = {
    "das musst du verstehen": "verstehen",
    "das musst du auswendig wissen": "auswendig_wissen",
    "formeln": "formeln",
    "typische prüfungsaufgabe": "musteraufgabe",
    "lösungsschritte": "loesungsschritte",
    "häufige fehler": "haeufige_fehler",
    "merksatz": "merksatz",
}


def parse_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    assert lines[0].startswith("# "), f"{path.name}: erste Zeile ist kein H1"
    title = lines[0][2:].strip()

    sections: dict[str, str] = {}
    current_key = None
    buf: list[str] = []

    def flush():
        if current_key is not None:
            sections[current_key] = "\n".join(buf).strip()

    for line in lines[1:]:
        m = re.match(r"^## (.+)$", line)
        if m:
            flush()
            heading = m.group(1).strip().lower()
            current_key = HEADING_MAP.get(heading)
            if current_key is None:
                raise ValueError(f"{path.name}: unbekannte Überschrift '{heading}'")
            buf = []
        else:
            buf.append(line)
    flush()

    missing = set(HEADING_MAP.values()) - set(sections)
    if missing:
        raise ValueError(f"{path.name}: fehlende Abschnitte {missing}")

    return {"id": path.stem, "title": title, **sections}


def main():
    files = sorted(SRC.glob("*.md"))
    result = [parse_file(f) for f in files]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(result)} Lernblätter geschrieben nach {OUT}")
    for r in result:
        print(f"  - {r['id']}: {r['title']}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Skript ausführen**

Run: `python3 scripts/migrate/parse_lernblaetter.py`
Expected: `9 Lernblätter geschrieben nach .../data/migration/lernblaetter.json`, gefolgt von 9 Zeilen mit `id: title`. Bricht das Skript mit `AssertionError`/`ValueError` ab, stimmt eine Überschrift in einer `lernen/*.md`-Datei nicht mit `HEADING_MAP` überein — dann die abweichende Überschrift in `HEADING_MAP` ergänzen und erneut ausführen.

- [ ] **Step 3: Stichprobe prüfen**

Run: `python3 -c "import json; d=json.load(open('data/migration/lernblaetter.json')); print(d[7]['id']); print(d[7]['merksatz'])"`
Expected: `subnetting` und der Text `**Blockgröße = 256 − Maske. Netz ist der Blockanfang, Broadcast das Blockende, dazwischen minus zwei.**` (Reihenfolge alphabetisch nach Dateiname, `subnetting.md` ist Index 7).

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate/parse_lernblaetter.py data/migration/lernblaetter.json
git commit -m "feat: migrate Lernblätter to structured JSON"
```

---

### Task 2: Formelsammlung migrieren

**Files:**
- Create: `scripts/migrate/parse_formelsammlung.py`
- Create: `data/migration/formelsammlung.json` (Output)

**Interfaces:**
- Produces: `formelsammlung.json` — Liste von `{id, order, title, body_markdown}`, `order` ist die führende Zahl aus der Überschrift (`intro`/`kontrollritual` erhalten `order: 0` bzw. `order: 99`). Wird von Task 7 (Lovable-Prompt „Formelsammlung") konsumiert.

- [ ] **Step 1: Skript schreiben**

```python
# scripts/migrate/parse_formelsammlung.py
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "02_FORMELSAMMLUNG.md"
OUT = REPO / "data" / "migration" / "formelsammlung.json"

HEADING_RE = re.compile(r"^## (.+)$", re.MULTILINE)
NUM_RE = re.compile(r"^(\d+)\.\s*(.+)$")


def main():
    text = SRC.read_text(encoding="utf-8")
    matches = list(HEADING_RE.finditer(text))
    assert matches, "keine '## '-Überschriften gefunden"

    sections = []

    intro = text[: matches[0].start()].strip()
    intro = re.sub(r"^# .+\n", "", intro).strip()  # H1-Titel abschneiden
    sections.append({"id": "intro", "order": 0, "title": "Einleitung", "body_markdown": intro})

    for i, m in enumerate(matches):
        heading = m.group(1).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()

        num_match = NUM_RE.match(heading)
        if num_match:
            order = int(num_match.group(1))
            title = num_match.group(2).strip()
            slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
            section_id = f"{order:02d}-{slug}"
        else:
            order = 99
            slug = re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")
            section_id = slug
            title = heading

        sections.append({"id": section_id, "order": order, "title": title, "body_markdown": body})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(sections, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(sections)} Abschnitte geschrieben nach {OUT}")
    for s in sections:
        print(f"  - [{s['order']:02d}] {s['id']}: {s['title']}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Skript ausführen**

Run: `python3 scripts/migrate/parse_formelsammlung.py`
Expected: 15 Abschnitte (`intro` + 13 nummerierte Abschnitte 1–13 + `kontrollritual-fuer-jede-rechenaufgabe`), jeweils mit `order` und `title` in der ausgegebenen Liste.

- [ ] **Step 3: Stichprobe prüfen**

Run: `python3 -c "import json; d=json.load(open('data/migration/formelsammlung.json')); s=[x for x in d if x['id']=='08-raid-kapazitaeten'][0]; print(s['body_markdown'][:80])"`
Expected: Textanfang beginnt mit dem RAID-Codeblock (```\nRAID 0  : n × k...`).

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate/parse_formelsammlung.py data/migration/formelsammlung.json
git commit -m "feat: migrate Formelsammlung to structured JSON"
```

---

### Task 3: Lernplan migrieren

**Files:**
- Create: `scripts/migrate/parse_lernplan.py`
- Create: `data/migration/lernplan.json` (Output)

**Interfaces:**
- Produces: `lernplan.json` — `{"days": [...], "wenn_weniger_zeit": [...]}`. Jeder Tag: `{day, date_label, title, week, items: [{dauer, thema, ziel, lernform}], raw_text}` — `items` ist leer und `raw_text` gefüllt bei Tagen ohne Tabelle (Tag 21). Wird von Task 8 (Lovable-Prompt „Tagesplan") konsumiert.

- [ ] **Step 1: Skript schreiben**

```python
# scripts/migrate/parse_lernplan.py
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "01_LERNPLAN.md"
OUT = REPO / "data" / "migration" / "lernplan.json"

WEEK_RE = re.compile(r"^## Woche (\d+)")
DAY_RE = re.compile(r"^### Tag (\d+) · (.+?) – (.+)$")
TAIL_RE = re.compile(r"^## Wenn weniger Zeit bleibt als geplant$")


def parse_table(block_lines: list[str]) -> list[dict]:
    rows = [l for l in block_lines if l.strip().startswith("|")]
    items = []
    for row in rows:
        cells = [c.strip() for c in row.strip().strip("|").split("|")]
        if len(cells) != 4 or set(cells[0]) <= {"-", ":"}:
            continue  # Trennzeile oder Header
        if cells[0].lower() == "dauer":
            continue  # Kopfzeile
        items.append({"dauer": cells[0], "thema": cells[1], "ziel": cells[2], "lernform": cells[3]})
    return items


def main():
    lines = SRC.read_text(encoding="utf-8").splitlines()

    week = 0
    days = []
    current = None
    buf: list[str] = []
    tail_lines: list[str] = []
    in_tail = False

    def flush_day():
        if current is None:
            return
        items = parse_table(buf)
        raw = "\n".join(buf).strip() if not items else ""
        days.append({**current, "week": week, "items": items, "raw_text": raw})

    for line in lines:
        if WEEK_RE.match(line):
            week = int(WEEK_RE.match(line).group(1))
            continue
        if TAIL_RE.match(line):
            flush_day()
            current = None
            in_tail = True
            continue
        day_m = DAY_RE.match(line)
        if day_m and not in_tail:
            flush_day()
            current = {
                "day": int(day_m.group(1)),
                "date_label": day_m.group(2).strip(),
                "title": day_m.group(3).strip(),
            }
            buf = []
            continue
        if in_tail:
            tail_lines.append(line)
        elif current is not None:
            buf.append(line)
    flush_day()

    expected_days = set(range(1, 22))
    found_days = {d["day"] for d in days}
    assert found_days == expected_days, f"fehlende/zusätzliche Tage: {expected_days ^ found_days}"

    result = {"days": days, "wenn_weniger_zeit": "\n".join(tail_lines).strip()}

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(days)} Tage geschrieben nach {OUT}")
    for d in days:
        print(f"  - Tag {d['day']:>2} ({d['date_label']}): {d['title']} — {len(d['items'])} Zeilen")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Skript ausführen**

Run: `python3 scripts/migrate/parse_lernplan.py`
Expected: `21 Tage geschrieben nach ...`, Tag 1–20 mit jeweils ≥ 3 Zeilen, Tag 21 mit `0 Zeilen` (Prüfungstag hat keine Tabelle, nur `raw_text`).

- [ ] **Step 3: Stichprobe prüfen**

Run: `python3 -c "import json; d=json.load(open('data/migration/lernplan.json')); t21=[x for x in d['days'] if x['day']==21][0]; print(t21['title']); print(t21['raw_text'][:60])"`
Expected: `**Prüfungstag**` und Textanfang `**Prüfungsstrategie (aus den analysierten Prüfungen...`.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate/parse_lernplan.py data/migration/lernplan.json
git commit -m "feat: migrate Lernplan to structured JSON"
```

---

### Task 4: Probeprüfungen + Musterlösungen migrieren

Der wichtigste Migrationsschritt — `exam_questions.json` ist die Grundlage für das KI-Bewertungs-Modul (Task 9).

**Files:**
- Create: `scripts/migrate/parse_exams.py`
- Create: `data/migration/exam_questions.json` (Output)

**Interfaces:**
- Produces: `exam_questions.json` — Liste von Prüfungen `{exam_id, title, ausgangssituation, aufgaben: [{aufgabe_nr, max_punkte, intro, teilaufgaben: [{teil, frage, max_punkte, musterloesung}]}]}`. `teil` ist der Buchstaben-Key (`"a"`, `"da"`, …). Wird von Task 3 (Supabase-Import) und Task 9 (KI-Bewertung) konsumiert.

- [ ] **Step 1: Skript schreiben**

```python
# scripts/migrate/parse_exams.py
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
Q_DIR = REPO / "probepruefungen"
L_DIR = REPO / "loesungen"
OUT = REPO / "data" / "migration" / "exam_questions.json"

AUFGABE_RE = re.compile(r"^## (\d+)\. Aufgabe \((\d+) Punkte\)\s*$", re.MULTILINE)
TEIL_Q_RE = re.compile(r"\*\*([a-z]{1,2})\)\*\*")
TEIL_L_RE = re.compile(r"\*\*([a-z]{1,2})\)\s*(\d+)\s*Punkte\*\*")
TRAILING_PUNKTE_RE = re.compile(r"\*\*(\d+)\s*Punkte\*\*\s*$")


def split_aufgaben(text: str) -> list[tuple[int, int, str]]:
    matches = list(AUFGABE_RE.finditer(text))
    out = []
    for i, m in enumerate(matches):
        nr, max_punkte = int(m.group(1)), int(m.group(2))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        out.append((nr, max_punkte, text[start:end].strip()))
    return out


def split_teile(block: str, marker_re: re.Pattern) -> list[re.Match]:
    return list(marker_re.finditer(block))


def parse_question_aufgabe(block: str) -> tuple[str, dict[str, str]]:
    markers = split_teile(block, TEIL_Q_RE)
    intro = block[: markers[0].start()].strip() if markers else block.strip()
    teile: dict[str, str] = {}
    for i, m in enumerate(markers):
        letter = m.group(1)
        start = m.end()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(block)
        span = block[start:end].strip()
        span = TRAILING_PUNKTE_RE.sub("", span).strip()
        teile[letter] = span
    return intro, teile


def parse_loesung_aufgabe(block: str) -> dict[str, tuple[int, str]]:
    markers = split_teile(block, TEIL_L_RE)
    teile: dict[str, tuple[int, str]] = {}
    for i, m in enumerate(markers):
        letter, punkte = m.group(1), int(m.group(2))
        start = m.end()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(block)
        teile[letter] = (punkte, block[start:end].strip())
    return teile


def main():
    results = []
    q_files = sorted(Q_DIR.glob("probepruefung_*.md"))

    for q_path in q_files:
        exam_id = q_path.stem
        l_path = L_DIR / f"{exam_id}_loesung.md"
        assert l_path.exists(), f"keine Lösung für {exam_id} gefunden"

        q_text = q_path.read_text(encoding="utf-8")
        l_text = l_path.read_text(encoding="utf-8")

        title = q_text.splitlines()[0].lstrip("# ").strip()

        aus_m = re.search(r"^## Ausgangssituation\s*$(.*?)(?=^## \d+\. Aufgabe)", q_text, re.MULTILINE | re.DOTALL)
        ausgangssituation = aus_m.group(1).strip() if aus_m else ""

        q_aufgaben = split_aufgaben(q_text)
        l_aufgaben = split_aufgaben(l_text)
        l_by_nr = {nr: (max_p, body) for nr, max_p, body in l_aufgaben}

        aufgaben_out = []
        exam_total = 0
        for nr, max_punkte, q_block in q_aufgaben:
            assert nr in l_by_nr, f"{exam_id}: Aufgabe {nr} hat keine Lösung"
            l_max_punkte, l_block = l_by_nr[nr]
            assert l_max_punkte == max_punkte, f"{exam_id} Aufgabe {nr}: Punkte-Mismatch Frage={max_punkte} Lösung={l_max_punkte}"

            intro, q_teile = parse_question_aufgabe(q_block)
            l_teile = parse_loesung_aufgabe(l_block)

            missing_in_l = set(q_teile) - set(l_teile)
            missing_in_q = set(l_teile) - set(q_teile)
            assert not missing_in_l, f"{exam_id} Aufgabe {nr}: Teilaufgaben ohne Lösung: {missing_in_l}"
            assert not missing_in_q, f"{exam_id} Aufgabe {nr}: Lösungen ohne Frage: {missing_in_q}"

            teilaufgaben = []
            punkte_summe = 0
            for letter, frage in q_teile.items():
                punkte, musterloesung = l_teile[letter]
                punkte_summe += punkte
                teilaufgaben.append({
                    "teil": letter,
                    "frage": frage,
                    "max_punkte": punkte,
                    "musterloesung": musterloesung,
                })
            assert punkte_summe == max_punkte, (
                f"{exam_id} Aufgabe {nr}: Teilpunkte summieren zu {punkte_summe}, erwartet {max_punkte}"
            )
            teilaufgaben.sort(key=lambda t: t["teil"])
            aufgaben_out.append({
                "aufgabe_nr": nr,
                "max_punkte": max_punkte,
                "intro": intro,
                "teilaufgaben": teilaufgaben,
            })
            exam_total += max_punkte

        assert exam_total == 100, f"{exam_id}: Gesamtpunktzahl {exam_total}, erwartet 100"

        results.append({
            "exam_id": exam_id,
            "title": title,
            "ausgangssituation": ausgangssituation,
            "aufgaben": aufgaben_out,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(results)} Prüfungen geschrieben nach {OUT}")
    for r in results:
        n_teile = sum(len(a["teilaufgaben"]) for a in r["aufgaben"])
        print(f"  - {r['exam_id']}: {len(r['aufgaben'])} Aufgaben, {n_teile} Teilaufgaben, 100 Punkte OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Skript ausführen**

Run: `python3 scripts/migrate/parse_exams.py`
Expected: `3 Prüfungen geschrieben nach ...`, je Prüfung eine Zeile `<exam_id>: N Aufgaben, M Teilaufgaben, 100 Punkte OK`. Ein `AssertionError` zeigt exakt an, welche Aufgabe/welcher Teilbuchstabe nicht zusammenpasst (Punkte-Mismatch oder fehlender Teil) — in dem Fall die betroffene Stelle im Originaltext (`probepruefungen/`/`loesungen/`) ansehen und das Skript anpassen (z. B. wenn eine Teilaufgabe abweichend formatiert ist).

- [ ] **Step 3: Stichprobe prüfen**

Run: `python3 -c "
import json
d = json.load(open('data/migration/exam_questions.json'))
a4 = [a for a in d[0]['aufgaben'] if a['aufgabe_nr'] == 4][0]
letters = sorted(t['teil'] for t in a4['teilaufgaben'])
print(letters)
"`
Expected: `['a', 'b', 'c', 'da', 'db', 'e', 'ea', 'eb']` — die verschachtelten Teilaufgaben `da`/`db`/`ea`/`eb` aus Probeprüfung 1, Aufgabe 4 wurden korrekt als eigene Einträge erkannt.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate/parse_exams.py data/migration/exam_questions.json
git commit -m "feat: migrate exam questions and model solutions to structured JSON"
```

---

### Task 5: Bedrock-Modellzugriff prüfen (Claude Haiku 4.5 vs. Fallback)

**Files:**
- Create: `scripts/check_bedrock_access.py`
- Create: `docs/lovable/bedrock-model-check.md` (Ergebnis-Notiz, kein Secret-Inhalt)

**Interfaces:**
- Produces: `docs/lovable/bedrock-model-check.md` mit der Entscheidung `MODELL = "anthropic.claude-haiku-4-5-<...>-v1:0"` oder `MODELL = "anthropic.claude-3-5-haiku-20241022-v1:0"`. Wird von Task 9 (KI-Bewertungs-Prompt) als Eingabe für die Edge-Function-Konfiguration verwendet.

- [ ] **Step 1: Exakte Bedrock-Modell-IDs ermitteln**

Die genaue Modell-ID für „Claude Haiku 4.5" auf Bedrock ändert sich mit AWS-Releases und ist hier nicht zuverlässig vorhersagbar. Vor dem Skript-Lauf die aktuelle ID nachschlagen:

Run: `aws bedrock list-foundation-models --by-provider anthropic --query "modelSummaries[].modelId" --region eu-central-1 2>&1 || echo "IAM-Zugriff nicht verfügbar — Modell-ID stattdessen im AWS Bedrock Console unter 'Model access' nachsehen"`

Notiere die gefundene(n) Haiku-4.5-ID(s) (Format ähnlich `anthropic.claude-haiku-4-5-YYYYMMDD-v1:0`) und die bekannte 3.5-Fallback-ID `anthropic.claude-3-5-haiku-20241022-v1:0`.

- [ ] **Step 2: Skript schreiben**

```python
# scripts/check_bedrock_access.py
import json
import subprocess
import sys
import urllib.error
import urllib.request

REGION = "eu-central-1"  # bei Bedarf anpassen, falls das Bedrock-Gateway eine andere Region nutzt
ENDPOINT = f"https://bedrock-runtime.{REGION}.amazonaws.com/model/{{model_id}}/invoke"


def get_api_key() -> str:
    result = subprocess.run(["vw", "get", "AWS_BEDROCK_API_KEY"], capture_output=True, text=True, check=True)
    return result.stdout.strip()


def check_model(model_id: str, api_key: str) -> str:
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 8,
        "messages": [{"role": "user", "content": "ping"}],
    }).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT.format(model_id=model_id),
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
            return "OK"
    except urllib.error.HTTPError as e:
        payload = e.read().decode("utf-8", errors="replace")
        if e.code == 403 or "AccessDenied" in payload:
            return "KEIN ZUGRIFF (Model access in der Bedrock-Console freischalten)"
        if e.code == 404 or "ResourceNotFound" in payload:
            return "MODELL-ID NICHT GEFUNDEN (ID prüfen)"
        return f"FEHLER {e.code}: {payload[:200]}"
    except Exception as e:
        return f"FEHLER: {e}"


def main():
    if len(sys.argv) < 2:
        print("Nutzung: python3 scripts/check_bedrock_access.py <haiku-4.5-model-id> [<fallback-model-id>]")
        sys.exit(1)

    api_key = get_api_key()
    try:
        candidates = sys.argv[1:] or ["anthropic.claude-3-5-haiku-20241022-v1:0"]
        for model_id in candidates:
            status = check_model(model_id, api_key)
            print(f"{model_id}: {status}")
    finally:
        del api_key  # Key nicht länger im Speicher halten als nötig


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Skript ausführen**

Run: `python3 scripts/check_bedrock_access.py <in Step 1 ermittelte Haiku-4.5-ID> anthropic.claude-3-5-haiku-20241022-v1:0`
Expected: Pro übergebener Modell-ID eine Zeile `<model-id>: OK` oder `<model-id>: KEIN ZUGRIFF (...)`. Kein API-Key-Wert erscheint in der Ausgabe.

- [ ] **Step 4: Entscheidung dokumentieren**

```markdown
# docs/lovable/bedrock-model-check.md

Geprüft am: <Datum>

- `<haiku-4.5-id>`: <Ergebnis aus Step 3>
- `anthropic.claude-3-5-haiku-20241022-v1:0`: <Ergebnis aus Step 3>

**Gewählt für die KI-Bewertung: `<gewählte Modell-ID>`**
(Haiku 4.5, falls „OK" — sonst 3.5 als Fallback, siehe Spec-Vorgabe.)
```

- [ ] **Step 5: Commit**

```bash
git add scripts/check_bedrock_access.py docs/lovable/bedrock-model-check.md
git commit -m "chore: verify Bedrock model access for exam grading"
```

---

### Task 6: Lovable-Projekt bootstrappen — Design-System

**Files:**
- Create: `docs/lovable/prompts/01-bootstrap-design-system.md`

**Interfaces:**
- Produces: laufendes Lovable-Projekt (projectId, editor_url, preview_url) — wird von allen folgenden Lovable-Tasks weiterverwendet. Notiere `projectId` am Ende dieses Tasks für die folgenden Tasks.

- [ ] **Step 1: Prompt-Datei schreiben**

```markdown
# docs/lovable/prompts/01-bootstrap-design-system.md

Baue eine neue Lern-App "AP1 Trainer" für die Vorbereitung auf die
IHK-Abschlussprüfung Teil 1 (Fachinformatiker Systemintegration).

Design-Richtung: dunkles Theme im Stil einer Discord-artigen Oberfläche —
linke Sidebar mit Navigationseinträgen (wie eine Server-/Kanal-Liste),
rechts ein großer Content-Bereich, abgerundete Karten (rounded-xl), ein
Akzentton im Blurple-Bereich (ca. #5865F2), keine Bezüge zu anderen
Marken oder Farbschemata.

Sidebar-Einträge (noch ohne Funktion, nur Navigation + Platzhalter-Seiten):
1. Rechnen üben
2. Wissenskarten
3. Lernblätter
4. Formelsammlung
5. Tagesplan
6. Probeprüfungen
7. Fortschritt & Fehlerliste

Jede Platzhalter-Seite zeigt nur den Titel und einen kurzen Platzhaltertext
("Wird als Nächstes gebaut."). Noch kein Backend, keine Datenbank, keine
Authentifizierung in diesem Schritt — nur Navigation und Theme.
```

- [ ] **Step 2: Projekt erstellen**

Rufe den `lovable`-Skill auf: `create_project` mit `initial_message` = Inhalt der obigen Datei. Bei mehreren möglichen Workspaces den richtigen auswählen. Nach Rückgabe der `projectId`: `render_project_widget` aufrufen, um den Build-Fortschritt zu zeigen.

- [ ] **Step 3: Manuelle Verifikation**

Öffne die `preview_url`. Erwartet: dunkles Theme, linke Sidebar mit den 7 genannten Einträgen, Klick auf jeden Eintrag zeigt eine eigene Platzhalterseite mit Titel. Keine JavaScript-Fehler in der Browser-Konsole.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/01-bootstrap-design-system.md
git commit -m "docs: record Lovable bootstrap prompt for AP1 trainer design system"
```

---

### Task 7: Supabase — Auth & Datenmodell

**Files:**
- Create: `docs/lovable/prompts/02-supabase-auth-schema.md`

**Interfaces:**
- Consumes: laufendes Lovable-Projekt aus Task 6.
- Produces: Supabase-Tabellen `profiles`, `topic_mastery`, `flashcard_progress`, `exam_questions`, `exam_attempts`, `exam_answers`, `error_log` (Spalten wie im Spec-Abschnitt „Datenmodell"); Auth mit E-Mail+Passwort. Werden von allen folgenden Feature-Tasks konsumiert.

- [ ] **Step 1: Prompt-Datei schreiben**

```markdown
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
```

- [ ] **Step 2: Prompt senden**

`send_message` mit dem Inhalt der Datei an das Projekt aus Task 6.

- [ ] **Step 3: Manuelle Verifikation**

`get_database_status` aufrufen → erwartet: Datenbank aktiv, alle 6 Tabellen gelistet. In der `preview_url` erscheint vor den Sidebar-Seiten ein Login-Screen; ohne Login sind die Feature-Seiten nicht erreichbar.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/02-supabase-auth-schema.md
git commit -m "docs: record Lovable prompt for Supabase auth and schema"
```

---

### Task 8: Inhalte importieren

**Files:**
- Create: `docs/lovable/prompts/03-content-import.md`

**Interfaces:**
- Consumes: `data/migration/exam_questions.json` (Task 4), `exam_questions`-Tabelle (Task 7).
- Produces: befüllte `exam_questions`-Tabelle. Lernblätter/Formelsammlung/Lernplan werden **nicht** in eigene Tabellen importiert, sondern in Task 10/11/12 direkt als statischer Content in die jeweiligen React-Komponenten eingebettet (kleinere, seltener geänderte Inhalte — kein Admin-Update-Bedarf, daher kein Overhead durch zusätzliche Tabellen).

- [ ] **Step 1: SQL-Insert aus JSON erzeugen**

```python
# einmaliger, lokaler Hilfsschritt — kein dauerhaftes Skript im Repo nötig
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

Run: `python3 -c "$(cat <<'PY'
<Inhalt des obigen Snippets>
PY
)" > /tmp/exam_questions_seed.sql`
Expected: eine `.sql`-Datei mit einer `insert into exam_questions ...`-Zeile pro Teilaufgabe (Summe über alle 3 Prüfungen, siehe Task 4 Step 2 für die genaue Anzahl).

- [ ] **Step 2: Import ausführen**

Rufe `query_database` mit dem Inhalt von `/tmp/exam_questions_seed.sql` gegen das Lovable-Projekt auf (Statement-für-Statement oder als ein Batch, je nach Tool-Grenzen).

- [ ] **Step 3: Manuelle Verifikation**

`query_database` mit `select exam_id, count(*) from exam_questions group by exam_id;` → erwartet: 3 Zeilen (`probepruefung_01`, `_02`, `_03`), jede mit derselben Teilaufgaben-Anzahl wie in Task 4 Step 2 ausgegeben.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/03-content-import.md
git commit -m "docs: record exam_questions import procedure"
```

---

### Task 9: Feature-Modul „Rechnen üben"

**Files:**
- Create: `docs/lovable/prompts/04-rechnen-ueben.md`

**Interfaces:**
- Consumes: Supabase-Tabelle `topic_mastery` (Task 7).
- Produces: funktionsfähige „Rechnen üben"-Seite im Lovable-Projekt.

- [ ] **Step 1: Prompt-Datei schreiben** (enthält die portierten TOPICS + eine der Generator-Funktionen als Referenzimplementierung; die übrigen sechs Generatoren — `datenmengen`, `uebertragung`, `strom`, `wirtschaft`, `netzplan`, `raid` — folgen demselben Muster aus `AP1-Trainer.html:388-698` und werden 1:1 mit übergeben)

```markdown
# docs/lovable/prompts/04-rechnen-ueben.md

Baue die Seite "Rechnen üben". Portiere die folgende bestehende
JavaScript-Logik nach TypeScript/React (Themenliste + acht
Aufgaben-Generatoren, siehe Referenzimplementierung `subnetting` unten
als vollständiges Muster — die übrigen sieben Generatoren
`datenmengen`, `uebertragung`, `strom`, `wirtschaft`, `netzplan`, `raid`
sind im angehängten Quelltext aus `AP1-Trainer.html` (Zeilen 334–698)
identisch aufgebaut und 1:1 zu übernehmen):

[Vollständiger Inhalt von AP1-Trainer.html Zeilen 329–698 wird hier
eingefügt — TOPICS-Array, `pick`/`de`/`de0`-Hilfsfunktionen, das
komplette `GEN`-Objekt mit allen sieben Generatoren.]

UI: Themenauswahl (Chips wie in der Sidebar-Struktur), "Neue Aufgabe"
erzeugt per Zufall ein Thema + ruft den passenden Generator auf, zeigt
`lead`, `q`, `given` an, ein Eingabefeld für die Antwort (numerisch oder
IP-Adresse je nach `ip`-Flag), ein "Prüfen"-Button vergleicht gegen
`answer` (bei `dec` gerundet), zeigt bei Fehler die `steps` und `trap`.

Nach jeder Antwort: `richtig`/`falsch` in der Supabase-Tabelle
`topic_mastery` für den eingeloggten Nutzer hochzählen (upsert auf
`(user_id, topic_id)`).
```

- [ ] **Step 2: Prompt senden**

`send_message` mit dem vollständigen Prompt (inkl. dem eingefügten Quelltext-Abschnitt aus `AP1-Trainer.html`) an das laufende Projekt.

- [ ] **Step 3: Manuelle Verifikation**

In der Preview: „Rechnen üben" öffnen, "Neue Aufgabe" mehrfach klicken → unterschiedliche Themen/Aufgaben erscheinen. Eine Aufgabe absichtlich richtig, eine absichtlich falsch beantworten. `query_database` mit `select * from topic_mastery where user_id = '<eigene id>';` zeigt für die betroffenen Themen erhöhte `richtig`/`falsch`-Zähler.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/04-rechnen-ueben.md
git commit -m "docs: record Lovable prompt for Rechnen-üben module"
```

---

### Task 10: Feature-Modul „Wissenskarten"

**Files:**
- Create: `docs/lovable/prompts/05-wissenskarten.md`

**Interfaces:**
- Consumes: Supabase-Tabelle `flashcard_progress` (Task 7).
- Produces: funktionsfähige „Wissenskarten"-Seite.

- [ ] **Step 1: Prompt-Datei schreiben**

```markdown
# docs/lovable/prompts/05-wissenskarten.md

Baue die Seite "Wissenskarten" als Flashcard-Review. Portiere die
folgende Karten-Liste (Themen-Key, Frage-HTML, Antwort-HTML) nach
TypeScript:

[Vollständiger Inhalt der CARDS-Definition aus `AP1-Trainer.html`
Zeilen 701–812 wird hier eingefügt.]

UI: Themenfilter (gleiche Themen-Chips wie bei "Rechnen üben", nur die
Themen mit `kind:'card'` aus der TOPICS-Liste), eine Karte zeigt die
Frage, Klick/Tap dreht die Karte und zeigt die Antwort (HTML-Inhalt
sicher rendern, `q`/`a` enthalten einfache Tags wie `<b>`, `<ul>`,
`<code>`), darunter zwei Buttons "wusste ich" / "wusste ich nicht".

Nach jeder Bewertung: `richtig`/`falsch` in `flashcard_progress` für
`(user_id, card_id)` hochzählen (upsert). Karten mit niedriger
Trefferquote sollen beim nächsten Durchgang häufiger erscheinen
(einfache Gewichtung: Wahrscheinlichkeit proportional zu
`falsch / (richtig + falsch + 1)`).
```

- [ ] **Step 2: Prompt senden**

`send_message` mit dem vollständigen Prompt an das laufende Projekt.

- [ ] **Step 3: Manuelle Verifikation**

In der Preview: „Wissenskarten" öffnen, eine Karte umdrehen, als „wusste ich nicht" bewerten. `query_database` mit `select * from flashcard_progress where user_id = '<eigene id>';` zeigt einen Eintrag mit `falsch = 1`. Karte nach mehreren Durchläufen erscheint spürbar häufiger als frisch bewertete Karten.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/05-wissenskarten.md
git commit -m "docs: record Lovable prompt for Wissenskarten module"
```

---

### Task 11: Feature-Modul „Lernblätter"

**Files:**
- Create: `docs/lovable/prompts/06-lernblaetter.md`

**Interfaces:**
- Consumes: `data/migration/lernblaetter.json` (Task 1).
- Produces: funktionsfähige „Lernblätter"-Seite.

- [ ] **Step 1: Prompt-Datei schreiben**

```markdown
# docs/lovable/prompts/06-lernblaetter.md

Baue die Seite "Lernblätter". Lege die folgenden 9 Lernblätter als
statische Inhaltsdaten im Frontend an (Struktur: id, title, verstehen,
auswendig_wissen, formeln, musteraufgabe, loesungsschritte,
haeufige_fehler, merksatz — jeweils Markdown-Text):

[Vollständiger Inhalt von `data/migration/lernblaetter.json` wird hier
eingefügt.]

UI: Liste aller Lernblätter (Titel + Suchfeld, das im Titel und in
`verstehen` sucht). Klick öffnet eine Detailseite mit allen 7
Abschnitten untereinander (Markdown gerendert, Codeblöcke in
`formeln` als `<pre>`), in genau dieser Reihenfolge: verstehen →
auswendig wissen → Formeln → Musteraufgabe → Lösungsschritte →
häufige Fehler → Merksatz. Am Kopf jedes Lernblatts ein
Segmented-Control "sicher" / "unsicher" / "noch nicht bewertet", das
lokal im Supabase-Nutzerprofil gespeichert wird
(`topic_mastery`-Zeile mit `topic_id = 'lernblatt:<id>'`, `richtig=1`
bei "sicher", `falsch=1` bei "unsicher" — wiederverwendet dieselbe
Tabelle wie "Rechnen üben", da es sich fachlich um denselben
Fortschritts-Begriff handelt).
```

- [ ] **Step 2: Prompt senden**

`send_message` mit dem vollständigen Prompt an das laufende Projekt.

- [ ] **Step 3: Manuelle Verifikation**

In der Preview: „Lernblätter" öffnen, alle 9 Titel sichtbar, Suche nach „Subnetting" filtert auf 1 Treffer, Detailseite zeigt alle 7 Abschnitte in korrekter Reihenfolge, „unsicher" markieren ändert sichtbar den Status.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/06-lernblaetter.md
git commit -m "docs: record Lovable prompt for Lernblätter module"
```

---

### Task 12: Feature-Modul „Formelsammlung"

**Files:**
- Create: `docs/lovable/prompts/07-formelsammlung.md`

**Interfaces:**
- Consumes: `data/migration/formelsammlung.json` (Task 2).
- Produces: funktionsfähige „Formelsammlung"-Seite.

- [ ] **Step 1: Prompt-Datei schreiben**

```markdown
# docs/lovable/prompts/07-formelsammlung.md

Baue die Seite "Formelsammlung" als durchsuchbare Referenz. Lege die
folgenden Abschnitte (id, order, title, body_markdown) als statische
Inhaltsdaten an, sortiert nach `order`:

[Vollständiger Inhalt von `data/migration/formelsammlung.json` wird
hier eingefügt.]

UI: eine einzige scrollbare Seite mit Sprungmarken-Navigation (Anker
pro Abschnittstitel in einer schmalen rechten Randspalte, wie ein
Inhaltsverzeichnis), Suchfeld oben filtert Abschnitte nach Titel und
Volltext in `body_markdown` und blendet nicht treffende Abschnitte
aus. `body_markdown` wird als Markdown gerendert (Codeblöcke
monospace mit dunklem Hintergrund, Tabellen mit den Standard-shadcn
Table-Komponenten).
```

- [ ] **Step 2: Prompt senden**

`send_message` mit dem vollständigen Prompt an das laufende Projekt.

- [ ] **Step 3: Manuelle Verifikation**

In der Preview: „Formelsammlung" öffnen, alle 15 Abschnitte sichtbar in aufsteigender `order`, Suche nach „RAID" zeigt nur den RAID-Abschnitt, Codeblöcke sind lesbar formatiert.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/07-formelsammlung.md
git commit -m "docs: record Lovable prompt for Formelsammlung module"
```

---

### Task 13: Feature-Modul „Tagesplan"

**Files:**
- Create: `docs/lovable/prompts/08-tagesplan.md`

**Interfaces:**
- Consumes: `data/migration/lernplan.json` (Task 3).
- Produces: funktionsfähige „Tagesplan"-Seite.

- [ ] **Step 1: Prompt-Datei schreiben**

```markdown
# docs/lovable/prompts/08-tagesplan.md

Baue die Seite "Tagesplan". Lege die folgenden 21 Tage (day,
date_label, title, week, items, raw_text) als statische Inhaltsdaten
an:

[Vollständiger Inhalt von `data/migration/lernplan.json` wird hier
eingefügt.]

UI: Liste aller Tage gruppiert nach `week` (Woche 1/2/3), jeder Tag als
aufklappbare Karte mit `date_label` und `title` im Kopf. Bei Tagen mit
`items`: Tabelle mit Spalten Dauer/Thema/Ziel/Lernform, jede Zeile mit
einer Checkbox "erledigt" (lokal in `localStorage` unter dem Schlüssel
`tagesplan-<user_id>-<day>-<index>`, kein Supabase-Sync nötig — der
Tagesplan ist eine reine Ablaufliste, kein Prüfungs- oder
Wissensfortschritt). Bei Tag 21 (leeres `items`, gefülltes
`raw_text`): `raw_text` als Markdown rendern statt einer Tabelle. Der
heutige Tag (Systemdatum gegen `date_label` des laufenden Jahres
geprüft) wird optisch hervorgehoben und die Seite scrollt beim Laden
automatisch dorthin.
```

- [ ] **Step 2: Prompt senden**

`send_message` mit dem vollständigen Prompt an das laufende Projekt.

- [ ] **Step 3: Manuelle Verifikation**

In der Preview: „Tagesplan" öffnen, 3 Wochen-Gruppen mit insgesamt 21 Tagen sichtbar, ein Häkchen setzen und Seite neu laden → Häkchen bleibt gesetzt (localStorage), Tag 21 zeigt Fließtext statt Tabelle.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/08-tagesplan.md
git commit -m "docs: record Lovable prompt for Tagesplan module"
```

---

### Task 14: Feature-Modul „Probeprüfungen" mit KI-Bewertung

Der aufwändigste Task — Timer-UI, Antworteingabe, Supabase Edge Function mit Bedrock-Aufruf.

**Files:**
- Create: `docs/lovable/prompts/09-pruefungsmodus-ki-bewertung.md`

**Interfaces:**
- Consumes: `exam_questions`-Tabelle (Task 7/8), Bedrock-Modell-ID aus `docs/lovable/bedrock-model-check.md` (Task 5), `AWS_BEDROCK_API_KEY`/`BEDROCK_GATEWAY_KEY` aus Vaultwarden.
- Produces: funktionsfähiges Probeprüfungs-Modul inkl. Edge Function `grade-exam-answer`.

- [ ] **Step 1: Bedrock-Secret in Supabase hinterlegen**

```bash
export AWS_BEDROCK_API_KEY="$(vw get AWS_BEDROCK_API_KEY)"
# Supabase-Secret über die Lovable-DB-Tools setzen (kein Klartext-Print, kein Commit dieses Werts)
```

Rufe die passende Lovable-/Supabase-Secret-Funktion mit Namen `BEDROCK_API_KEY` und Wert `$AWS_BEDROCK_API_KEY` auf. Danach:

```bash
unset AWS_BEDROCK_API_KEY
```

- [ ] **Step 2: Prompt-Datei schreiben**

```markdown
# docs/lovable/prompts/09-pruefungsmodus-ki-bewertung.md

Baue die Seite "Probeprüfungen" plus eine Supabase Edge Function für
die KI-Bewertung.

**Auswahlseite:** Liste der 3 Prüfungen (`probepruefung_01/02/03`) mit
Titel und Status (noch nicht begonnen / in Bearbeitung / abgeschlossen,
aus `exam_attempts`). Klick startet eine neue Zeile in
`exam_attempts` und öffnet den Prüfungsmodus.

**Prüfungsmodus:** Countdown-Timer 90:00 sichtbar oben, läuft ab
Start rückwärts. Darunter die 4 Aufgaben in Reihenfolge, gruppiert
nach `aufgabe_nr`, mit den zugehörigen `exam_questions`-Zeilen als
Teilaufgaben (Textfeld je Teilaufgabe zur Antworteingabe, Anzeige der
`max_punkte`). Ein "Abgeben"-Button pro Aufgabe oder am Ende für die
gesamte Prüfung. Läuft der Timer ab, werden offene Teilaufgaben
automatisch als abgegeben markiert (leere Antwort zulässig).

**Bewertung:** Beim Abgeben einer Teilaufgabe ruft das Frontend die
Edge Function `grade-exam-answer` auf mit
`{question_id, antworttext}`. Die Function:
1. Lädt `frage`, `musterloesung`, `max_punkte` aus `exam_questions`
   anhand `question_id`.
2. Ruft Amazon Bedrock auf, Modell `<hier die in
   docs/lovable/bedrock-model-check.md gewählte Modell-ID einsetzen>`,
   mit einem Prompt, der Frage, Musterlösung, maximale Punktzahl und
   die eingereichte Antwort enthält und um eine JSON-Antwort bittet:
   `{"punkte": <ganzzahl 0..max_punkte>, "begruendung": "<kurzer
   deutscher Text>"}`. System-Anweisung: "Du bist Prüfer für die
   IHK-Abschlussprüfung AP1 Fachinformatiker Systemintegration. Bewerte
   nach der Musterlösung, vergib anteilige Punkte für teilweise
   richtige Antworten, antworte ausschließlich mit dem geforderten
   JSON."
3. Speichert `ki_punkte`/`ki_feedback` in `exam_answers` (Insert mit
   `attempt_id`, `question_id`, `antworttext`, den beiden Werten).
4. Schlägt der Bedrock-Aufruf fehl (Timeout, 4xx/5xx): Function gibt
   `{"punkte": null, "begruendung": "KI-Bewertung nicht verfügbar."}`
   zurück, Frontend zeigt trotzdem die Musterlösung an und bietet ein
   Eingabefeld "Punkte selbst einschätzen" als Fallback.

Nach Abschluss der Prüfung: `gesamtpunkte` (Summe aller `ki_punkte`,
fehlende als 0 gewertet) und `finished_at` in `exam_attempts`
aktualisieren. Ergebnisseite zeigt Gesamtpunktzahl, Note nach dem
Schlüssel 100–92=1, 91–81=2, 80–67=3, 66–50=4 (bestanden), 49–30=5,
29–0=6, sowie pro Teilaufgabe Frage, eigene Antwort, Musterlösung,
KI-Punkte und KI-Begründung.

Für jede Teilaufgabe mit `ki_punkte < max_punkte * 0.5`: automatisch
einen Eintrag in `error_log` anlegen (`quelle='pruefung'`,
`thema=exam_id + ' Aufgabe ' + aufgabe_nr + t.teil`,
`beschreibung=ki_feedback`).
```

- [ ] **Step 3: Prompt senden**

`send_message` mit dem vollständigen Prompt an das laufende Projekt.

- [ ] **Step 4: Manuelle Verifikation**

In der Preview: eine Probeprüfung starten, Timer läuft. Eine Teilaufgabe mit einer erkennbar richtigen Antwort beantworten, eine mit einer erkennbar falschen/leeren Antwort. Nach Abgabe: KI-Punkte + Begründung erscheinen für beide, die richtige Antwort bekommt spürbar mehr Punkte als die falsche. `query_database` mit `select * from exam_answers order by id desc limit 5;` zeigt die gespeicherten Bewertungen. `query_database` mit `select * from error_log order by created_at desc limit 5;` zeigt einen neuen Eintrag für die schwach bewertete Antwort.

- [ ] **Step 5: Commit**

```bash
git add docs/lovable/prompts/09-pruefungsmodus-ki-bewertung.md
git commit -m "docs: record Lovable prompt for exam mode with Bedrock AI grading"
```

---

### Task 15: Feature-Modul „Fortschritt & Fehlerliste"

**Files:**
- Create: `docs/lovable/prompts/10-fortschritt-fehlerliste.md`

**Interfaces:**
- Consumes: `topic_mastery`, `flashcard_progress`, `error_log`, `exam_attempts` (alle vorherigen Tasks).
- Produces: funktionsfähiges Dashboard, letztes Feature-Modul der Plattform.

- [ ] **Step 1: Prompt-Datei schreiben**

```markdown
# docs/lovable/prompts/10-fortschritt-fehlerliste.md

Baue die Seite "Fortschritt & Fehlerliste" als Dashboard, das
`04_LERNFORTSCHRITT.md` und `05_FEHLERLISTE.md` ersetzt.

**Fortschritts-Ansicht:** Eine Zeile pro Thema aus der TOPICS-Liste
(siehe Task "Rechnen üben"), mit Trefferquote aus `topic_mastery`
(inkl. der `topic_id = 'lernblatt:<id>'`-Zeilen aus dem
Lernblätter-Modul) als Fortschrittsbalken: <4 Bewertungen = "kaum
geübt" (grau), Quote ≥80% = "sicher" (grün), ≥55% = "wackelig" (gelb),
sonst "schwach" (rot) — dieselbe Klassifikation wie die bestehende
`mastery()`-Funktion aus `AP1-Trainer.html` Zeilen 357–365. Zusätzlich
eine Zeile pro Prüfungsversuch aus `exam_attempts`
(Datum, `gesamtpunkte`, Note nach dem in Task 14 genannten Schlüssel).

**Fehlerliste-Ansicht:** Tabelle aller `error_log`-Einträge (neueste
zuerst), Spalten Datum, Quelle (Rechenaufgabe/Prüfung/Lernblatt),
Thema, Beschreibung. Filter nach Quelle. Ein "Als erledigt markieren"-
Button pro Zeile setzt ein `erledigt`-Flag (neue Spalte `erledigt
boolean default false` in `error_log` anlegen), erledigte Einträge
werden ausgegraut statt gelöscht.
```

- [ ] **Step 2: Prompt senden**

`send_message` mit dem vollständigen Prompt an das laufende Projekt.

- [ ] **Step 3: Manuelle Verifikation**

In der Preview: „Fortschritt & Fehlerliste" öffnen. Themen aus „Rechnen üben"/„Wissenskarten"/„Lernblätter" erscheinen mit korrekt eingefärbten Balken passend zu den in Task 9–11 erzeugten Testdaten. Der in Task 14 erzeugte `error_log`-Eintrag erscheint in der Fehlerliste; "Als erledigt markieren" graut die Zeile aus, ohne sie zu entfernen.

- [ ] **Step 4: Commit**

```bash
git add docs/lovable/prompts/10-fortschritt-fehlerliste.md
git commit -m "docs: record Lovable prompt for Fortschritt/Fehlerliste dashboard"
```

---

### Task 16: Live-Deploy

**Files:** keine (reine Lovable-Aktion)

**Interfaces:**
- Consumes: fertiges Lovable-Projekt aus Task 6–15.

- [ ] **Step 1: Deploy auslösen**

Rufe `deploy_project` für das Projekt auf.

- [ ] **Step 2: Manuelle Verifikation**

Öffne die deploy-URL in einem neuen, nicht eingeloggten Browserfenster: Login-Screen erscheint, nach Login sind alle 7 Sidebar-Bereiche erreichbar und funktionieren wie in den vorherigen Tasks verifiziert.

- [ ] **Step 3: Commit**

Kein Commit nötig — reine Deploy-Aktion ohne Dateiänderung in diesem Repo.

---

## Self-Review (durchgeführt)

- **Spec-Abdeckung:** alle 7 Feature-Module (Tasks 9–15), Datenmodell (Task 7), KI-Bewertungs-Flow inkl. Fehlerfall (Task 14), Design-System (Task 6), Modellwahl mit Fallback (Task 5), Migration (Tasks 1–4), Deploy (Task 16) — jeweils mit eigenem Task abgedeckt.
- **Platzhalter-Scan:** die einzige bewusste Unschärfe ist die exakte Bedrock-Modell-ID für Haiku 4.5 (Task 5, Step 1) — das ist ein externer Nachschlage-Schritt mit konkretem Befehl, kein TODO in der Logik.
- **Typkonsistenz:** `topic_id`/`card_id`/`question_id`-Schlüssel sind repo-weit konsistent (`topic_id` aus `TOPICS[].id` bzw. `'lernblatt:<id>'`, `question_id` aus `exam_id-aufgabe_nr-teil`).
