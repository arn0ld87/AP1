import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
Q_DIR = REPO / "probepruefungen"
L_DIR = REPO / "loesungen"
OUT = REPO / "data" / "migration" / "exam_questions.json"

AUFGABE_RE = re.compile(r"^## (\d+)\. Aufgabe \((\d+) Punkte\)\s*$", re.MULTILINE)
TEIL_Q_RE = re.compile(r"\*\*([a-z]{1,2})\)\*\*")
TEIL_L_RE = re.compile(r"\*\*([a-z]{1,2})\)\s*(\d+)\s*Punkte?\*\*")
TRAILING_PUNKTE_RE = re.compile(r"\*\*(\d+)\s*Punkte?\*\*\s*$")
TRAILING_DIVIDER_RE = re.compile(r"\n?-{3,}\s*(?:\*Ende der Probepr[üu]fung[^\n]*\*)?\s*$")
TRAILING_BULLET_RE = re.compile(r"\n-\s*$")


def strip_trailing_noise(span: str, strip_punkte: bool = True) -> str:
    """Drop the section divider (and, for a file's final teilaufgabe, the
    closing '*Ende der Probeprüfung N*' line) that split_aufgaben's last
    teilaufgabe of each Aufgabe inherits from the source markdown, the
    trailing bullet prefix every non-final teilaufgabe inherits from the
    NEXT teilaufgabe's '- **xx)**' marker, then the now-exposed trailing
    points annotation."""
    span = TRAILING_DIVIDER_RE.sub("", span).strip()
    span = TRAILING_BULLET_RE.sub("", span).strip()
    if strip_punkte:
        span = TRAILING_PUNKTE_RE.sub("", span).strip()
    return span


def split_aufgaben(text: str) -> list[tuple[int, int, str]]:
    matches = list(AUFGABE_RE.finditer(text))
    out = []
    for i, m in enumerate(matches):
        nr, max_punkte = int(m.group(1)), int(m.group(2))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        out.append((nr, max_punkte, text[start:end].strip()))
    return out


def parse_question_aufgabe(block: str) -> tuple[str, dict[str, str]]:
    markers = list(TEIL_Q_RE.finditer(block))
    intro = block[: markers[0].start()].strip() if markers else block.strip()
    teile: dict[str, str] = {}
    for i, m in enumerate(markers):
        letter = m.group(1)
        start = m.end()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(block)
        span = block[start:end].strip()
        span = strip_trailing_noise(span)
        teile[letter] = span
    return intro, teile


def parse_loesung_aufgabe(block: str) -> dict[str, tuple[int, str]]:
    markers = list(TEIL_L_RE.finditer(block))
    teile: dict[str, tuple[int, str]] = {}
    for i, m in enumerate(markers):
        letter, punkte = m.group(1), int(m.group(2))
        start = m.end()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(block)
        teile[letter] = (punkte, strip_trailing_noise(block[start:end].strip(), strip_punkte=False))
    return teile


def merge_leadin_parents(q_teile: dict[str, str], l_teile: dict[str, tuple[int, str]]) -> dict[str, str]:
    """Fold a parent teilaufgabe with no own score into each of its nested
    (one-letter-longer) children, so every scored teilaufgabe stays
    self-contained."""
    merged = dict(q_teile)
    for key in list(merged):
        if key in l_teile:
            continue
        children = [k for k in l_teile if len(k) == len(key) + 1 and k.startswith(key)]
        if not children:
            continue  # leave unresolved for the caller's assertion to catch
        parent_text = merged.pop(key)
        for child in children:
            if child in merged:
                merged[child] = f"{parent_text}\n\n{merged[child]}"
    return merged


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
            q_teile = merge_leadin_parents(q_teile, l_teile)

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
