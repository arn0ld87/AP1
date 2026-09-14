# Triage-Labels

Die tatsächlich im Tracker (`arn0ld87/AP1`) vergebenen Labels. Maßgeblich ist immer
`gh label list --repo arn0ld87/AP1` — diese Datei beschreibt, wofür sie stehen.

> Diese Datei war bis zum 14.09.2026 eine unveränderte Vorlage aus `mattpocock/skills` und
> nannte fünf Labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`),
> die es hier nie gab. Ein daraus gebautes Issue-Formular hätte still gar kein Label gesetzt —
> GitHub legt ein unbekanntes Label weder an noch wendet es an. Vor dem Eintragen eines Labels
> also gegen `gh label list` prüfen, nicht gegen diese Tabelle allein.

## Art (`type:`) — genau eines je Issue

| Label               | Bedeutung                                   |
| ------------------- | ------------------------------------------- |
| `type:bug`          | Fehler oder problematische Annahme          |
| `type:feature`      | Neue Funktion                               |
| `type:content`      | Lern- oder Prüfungsinhalt                   |
| `type:documentation`| Dokumentation                               |
| `type:testing`      | Tests und Validierung                       |
| `type:automation`   | Automatisierung / CI                        |
| `type:refactor`     | Strukturverbesserung ohne Funktionsänderung |

## Priorität (`priority:`) — genau eines je Issue

| Label         | Bedeutung                |
| ------------- | ------------------------ |
| `priority:P0` | Kritisch / blockierend   |
| `priority:P1` | Hoher Nutzen             |
| `priority:P2` | Sinnvolle Verbesserung   |
| `priority:P3` | Nice-to-have             |

## Aufwand (`effort:`) — optional, Schätzung

`effort:XS`, `effort:S`, `effort:M`, `effort:L`, `effort:XL`

## Sonstige

`accessibility` (Barriere für Menschen mit Behinderung), `wontfix` (wird nicht bearbeitet),
`duplicate`, `question` sowie die GitHub-Standardlabels (`bug`, `enhancement`,
`documentation`, `good first issue`, `help wanted`, `invalid`) — letztere stammen aus der
Repo-Vorlage und werden hier nicht aktiv vergeben; genutzt wird die `type:`-Taxonomie.

## Verwendung in Issue-Formularen

`.github/ISSUE_TEMPLATE/bug.yml` setzt `type:bug` automatisch. `task.yml` setzt bewusst
**kein** Label, weil die Art dort erst aus der Auswahl hervorgeht — Priorität und Art werden
beim Triage vergeben. Die Formulare fragen beides als Dropdown ab, damit der Vorschlag im
Issue-Text steht.
