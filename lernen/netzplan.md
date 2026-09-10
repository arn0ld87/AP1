# Netzplantechnik

## Das musst du verstehen

Ein Netzplan wird in **drei getrennten Durchgängen** gerechnet. Wer vermischt, verrechnet sich.

1. **Vorwärts** durch den ganzen Plan: FAZ und FEZ für alle Vorgänge
2. **Rückwärts** durch den ganzen Plan: SEZ und SAZ für alle Vorgänge
3. Erst danach die **Puffer**

## Das musst du auswendig wissen

| Kürzel | Bedeutung |
|---|---|
| FAZ | frühester Anfangszeitpunkt |
| FEZ | frühester Endzeitpunkt |
| SAZ | spätester Anfangszeitpunkt |
| SEZ | spätester Endzeitpunkt |
| GP | Gesamtpuffer |
| FP | freier Puffer |

Knotenaufbau (so steht er in der Prüfung):

```
 FAZ  |  Dauer  |  FEZ
------+---------+------
      Vorgang
------+---------+------
 SAZ  |   GP FP |  SEZ
```

## Formeln

```
FEZ = FAZ + Dauer
FAZ des Nachfolgers = MAXIMUM aller FEZ der Vorgänger
SAZ = SEZ − Dauer
SEZ des Vorgängers  = MINIMUM aller SAZ der Nachfolger
GP  = SAZ − FAZ  =  SEZ − FEZ
FP  = kleinster FAZ der Nachfolger − FEZ
Kritischer Pfad = alle Vorgänge mit GP = 0
```

Start: FAZ des ersten Vorgangs = 0.
Ende: SEZ des letzten Vorgangs = dessen FEZ (= Projektdauer).

## Typische Prüfungsaufgabe

| Vorgang | Dauer | Vorgänger |
|---|---:|---|
| A Ist-Analyse | 3 | – |
| B Soll-Konzept | 4 | A |
| C Beschaffung | 6 | B |
| D Verkabelung | 5 | B |
| E Serverinstallation | 4 | C, D |
| F Clients einrichten | 3 | E |
| G Schulung | 2 | F |
| H Dokumentation | 2 | E |
| I Abnahme | 1 | G, H |

Ermitteln Sie FAZ, FEZ, SAZ, SEZ, GP und FP sowie den kritischen Pfad.

## Lösungsschritte

**Vorwärts:** A 0/3 → B 3/7 → C 7/13, D 7/12 → E beginnt bei max(13; 12) = **13**, endet 17
→ F 17/20 → G 20/22 → H 17/19 → I beginnt bei max(22; 19) = **22**, endet **23**

**Rückwärts** (Projektdauer 23): I 22/23 → G 20/22, H 20/22 → F 17/20
→ E endet spätestens bei min(SAZ F; SAZ H) = min(17; 20) = 17, also E 13/17
→ C 7/13, D 8/13 → B 3/7 → A 0/3

| V | D | FAZ | FEZ | SAZ | SEZ | GP | FP |
|---|--:|--:|--:|--:|--:|--:|--:|
| A | 3 | 0 | 3 | 0 | 3 | 0 | 0 |
| B | 4 | 3 | 7 | 3 | 7 | 0 | 0 |
| C | 6 | 7 | 13 | 7 | 13 | 0 | 0 |
| D | 5 | 7 | 12 | 8 | 13 | 1 | 1 |
| E | 4 | 13 | 17 | 13 | 17 | 0 | 0 |
| F | 3 | 17 | 20 | 17 | 20 | 0 | 0 |
| G | 2 | 20 | 22 | 20 | 22 | 0 | 0 |
| H | 2 | 17 | 19 | 20 | 22 | 3 | 3 |
| I | 1 | 22 | 23 | 22 | 23 | 0 | 0 |

**Projektdauer 23 Tage · kritischer Pfad A – B – C – E – F – G – I**

## Häufige Fehler

- Bei mehreren Vorgängern das Minimum statt des **Maximums** genommen
- Bei mehreren Nachfolgern das Maximum statt des **Minimums** genommen
- Puffer schon während der Vorwärtsrechnung eingetragen
- GP und FP verwechselt: GP darf das Projektende nicht verschieben, FP darf zusätzlich den **Nachfolger** nicht verschieben
- Kritischen Pfad über Vorgänge mit GP > 0 gezogen

## Die schwierigere Variante

In Frühjahr 2026 war der Netzplan bereits ausgefüllt und enthielt **drei Fehler**.
Vorgehen: jeden Knoten stur gegen die vier Formeln nachrechnen, den ersten abweichenden Wert markieren
und den korrekten Wert danebenschreiben. Nicht raten, sondern durchrechnen.

## Merksatz

> **Vorwärts Maximum, rückwärts Minimum. Puffer null heißt kritisch.**
