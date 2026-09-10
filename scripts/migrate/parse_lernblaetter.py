import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "lernen"
OUT = REPO / "data" / "migration" / "lernblaetter.json"

CANONICAL = [
    ("das musst du verstehen", "verstehen"),
    ("das musst du auswendig wissen", "auswendig_wissen"),
    ("formeln", "formeln"),
    ("typische prüfungsaufgabe", "musteraufgabe"),
    ("lösungsschritte", "loesungsschritte"),
    ("häufige fehler", "haeufige_fehler"),
    ("merksatz", "merksatz"),
]

OPTIONAL_KEYS = {"formeln", "loesungsschritte"}
REQUIRED_KEYS = [k for _, k in CANONICAL if k not in OPTIONAL_KEYS]


def match_canonical(heading: str) -> str | None:
    h = heading.strip().lower()
    for prefix, key in CANONICAL:
        if h.startswith(prefix):
            return key
    return None


def parse_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    assert lines[0].startswith("# "), f"{path.name}: erste Zeile ist kein H1"
    title = lines[0][2:].strip()

    sections: dict[str, list[str]] = {key: [] for _, key in CANONICAL}
    current_key: str | None = None
    buf: list[str] = []
    seen_first_heading = False

    def flush():
        if current_key is not None:
            sections[current_key].append("\n".join(buf).strip())

    for line in lines[1:]:
        m = re.match(r"^## (.+)$", line)
        if m:
            flush()
            buf = []
            heading = m.group(1).strip()
            key = match_canonical(heading)
            if not seen_first_heading:
                seen_first_heading = True
                assert key == "verstehen", (
                    f"{path.name}: erste '## '-Überschrift ist '{heading}', erwartet 'Das musst du verstehen'"
                )
            if key is not None:
                current_key = key
            else:
                buf.append(line)
        else:
            buf.append(line)
    flush()

    result = {k: "\n\n".join(v).strip() for k, v in sections.items()}

    missing_required = [k for k in REQUIRED_KEYS if not result[k]]
    if missing_required:
        raise ValueError(f"{path.name}: fehlende Pflichtabschnitte {missing_required}")

    return {"id": path.stem, "title": title, **result}


def main():
    files = sorted(SRC.glob("*.md"))
    result = [parse_file(f) for f in files]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(result)} Lernblätter geschrieben nach {OUT}")
    for r in result:
        optional_missing = [k for k in OPTIONAL_KEYS if not r[k]]
        flag = f"  (ohne: {optional_missing})" if optional_missing else ""
        print(f"  - {r['id']}: {r['title']}{flag}")


if __name__ == "__main__":
    main()
