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
