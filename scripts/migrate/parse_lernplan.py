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
            # Woche wechselt erst NACH dem Flush des laufenden Tages — sonst
            # erbt der letzte Tag der alten Woche schon die neue Woche.
            # (current=None analog zum TAIL-Zweig, sonst doppelt flush_day.)
            flush_day()
            current = None
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
