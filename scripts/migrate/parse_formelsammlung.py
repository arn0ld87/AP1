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
