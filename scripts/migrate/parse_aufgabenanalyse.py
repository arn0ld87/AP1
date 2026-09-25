# scripts/migrate/parse_aufgabenanalyse.py
import csv
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "notebooklm" / "aufgabenanalyse.tsv"
OUT = REPO / "app" / "src" / "data" / "notebooklm" / "aufgabenanalyse.json"

# "6 Punkte", "25 Punkte (Gesamt)", "9 Punkte (6+3)" -> führende Zahl; "Nicht ersichtlich"/
# "Not in source"/"Nicht im Quelltext" -> null.
PUNKTE_RE = re.compile(r"^\s*(\d+)(?:[.,]\d+)?")


def parse_punkte(raw: str) -> int | None:
    match = PUNKTE_RE.match(raw)
    return int(match.group(1)) if match else None


def parse_ja_nein(raw: str) -> bool:
    return raw.strip().lower().startswith("ja")


def main():
    with SRC.open(encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        rows = list(reader)

    aufgaben = []
    for row in rows:
        aufgaben.append(
            {
                "pruefungstermin": row["Jahr / Prüfungstermin"].strip(),
                "pruefung": row["Prüfung"].strip(),
                "aufgabe_nr": row["Aufgabe"].strip(),
                "teilaufgabe": row["Teilaufgabe"].strip(),
                "thema": row["Thema"].strip(),
                "unterthema": row["Unterthema"].strip(),
                "aufgabentyp": row["Aufgabentyp"].strip(),
                "ist_rechenaufgabe": parse_ja_nein(row["Rechenaufgabe ja/nein"]),
                "verwendete_formel": row["Verwendete Formel"].strip(),
                "punkte": parse_punkte(row["Punkte, falls erkennbar"]),
                "typische_fehlerfalle": row["Typische Fehlerfalle"].strip(),
                "loesung_vorhanden": parse_ja_nein(row["Lösung vorhanden ja/nein"]),
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(aufgaben, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(aufgaben)} Teilaufgaben geschrieben nach {OUT}")


if __name__ == "__main__":
    main()
