# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

AP1-Prüfungsvorbereitung (Fachinformatiker Systemintegration, Prüfungstermin **30.09.2026**). Lernmaterial
in Markdown plus ein eigenständiges HTML-Tool und — seit der Migration zur Web-App — die Web-App unter
`app/` (TanStack Start + self-hosted Supabase, Bun). Für den App-Code gibt es Lint/Typecheck/Build als
CI-Checks je PR; das Lernmaterial hat weiterhin keinen Build.

## Struktur

```
00_PRUEFUNGSANALYSE.md    Aufgabenanalyse/Häufigkeitsanalyse aller Alt-Prüfungen, A/B/C-Priorisierung
01_LERNPLAN.md            Tagesplan für die verbleibenden Tage bis zur Prüfung
02_FORMELSAMMLUNG.md      Alle in den Prüfungen vorkommenden Formeln
03_PRUEFUNGSPROGNOSE.md   Prognose je Thema, begründet aus den Altprüfungen
04_LERNFORTSCHRITT.md     Manuell gepflegte Tabelle des eigenen Kenntnisstands
05_FEHLERLISTE.md         Manuell gepflegte Fehlerdatenbank
lernen/                   9 Lernblätter zu den A-/B-Themen, einheitliche Struktur:
                          verstehen → auswendig wissen → Formeln → Musteraufgabe →
                          Lösungsschritte → häufige Fehler → Merksatz
probepruefungen/          3 vollständige Probeprüfungen ohne Lösungen (90 Min., Altprüfungs-Stil)
loesungen/                zugehörige Musterlösungen mit Punkteverteilung
AP1-Trainer.html          eigenständiges Offline-Übungstool (siehe unten)
app/                      Web-App (TanStack Start + self-hosted Supabase, Bun) — Tasks 1–15 gemerged
scripts/migrate/          Python-Parses für den Content-Import der Web-App
docs/                     Stand-Doku: context.md, vision.md, architecture.md, data-model.md, api.md, agents/
.github/workflows/pr-check.yml  CI je PR (Lint/Prettier, Typecheck, Build, Edge-Function, Skripte)
```

Die Datengrundlage (welche Prüfungstermine ausgewertet wurden, welche nicht) und der empfohlene
Lernablauf stehen in `README.md` — dort nachlesen statt hier duplizieren.

## AP1-Trainer.html

Einzelne HTML-Datei, kein Build-Schritt, kein Server nötig — direkt im Browser öffnen. Persistiert
Zustand ausschließlich in `localStorage` (`ap1state`, `ap1theme`). Relevante Strukturen beim Editieren:

- `TOPICS` / `T` — Themen-Definitionen für den Rechnen-Generator (Subnetting, Datenmengen,
  Datenübertragung, Stromrechnung, Wirtschaftsrechnung, RAID, Netzplan, IT-Sicherheit,
  Netzwerkdiagnose)
- `GEN` — pro Thema ein Zufallsaufgaben-Generator; `newCalc()`/`check()` steuern den Übungs-Loop
- `CARDS` — Wissenskarten-Inhalte für den Flashcard-Modus (`newCard()`/`drawCard()`)
- `PLAN` — Spiegel von `01_LERNPLAN.md` für die Tagesplan-Ansicht im Trainer
- `mastery()`/`merge()`/`saveSoon()` — Fortschrittslogik und `localStorage`-Persistenz
- `subnetting`-Helfer (`maskOf`, `ipInt`, `intIp`) für die IPv4-Aufgaben

Änderungen an Inhalten (neue Aufgaben, Formeln, Karten) gehören inhaltlich sowohl hier als auch in
die entsprechende `lernen/*.md`-Datei bzw. `02_FORMELSAMMLUNG.md`, falls diese als Quelle der
Wahrheit dienen soll — beide sind aktuell unabhängig gepflegt, nicht generiert.

## Web-App-Migration (Stand 11.09.2026)

Tasks 1–15 gemerged (PRs #33–#36), CI-Checks je PR live ([PR #38](https://github.com/arn0ld87/AP1/pull/38)),
Task 16 Live-Deploy in Arbeit ([PR #39](https://github.com/arn0ld87/AP1/pull/39)). Task-/PR-Tabelle und
Arbeitsregeln stehen in `AGENTS.md` — Weiterarbeit auf Feature-Branches, nicht direkt auf `main`.

- Ursprüngliche Spec/Plan: `docs/superpowers/specs/`, `docs/superpowers/plans/`
- Warum/Ausgangslage + Pivot: [docs/context.md](docs/context.md)
- Produktvision & Nicht-Ziele: [docs/vision.md](docs/vision.md)
- Architektur & Feature-Module: [docs/architecture.md](docs/architecture.md)
- Datenmodell (self-hosted Supabase/Postgres): [docs/data-model.md](docs/data-model.md)
- API / KI-Bewertungs-Flow (Edge Function `grade-exam-answer`, implementiert): [docs/api.md](docs/api.md)

Wichtige Constraints (nicht wiederholen, nur verlinkt): Auth ist Single-User (Alex), KI-Modell ist
Claude Haiku 4.5 über Amazon Bedrock (Modell-ID `eu.anthropic.claude-haiku-4-5-20251001-v1:0`;
Fallback 3.5 Haiku ungetestet), Secrets ausschließlich als Supabase-Edge-Function-Secret, kein
automatisierter Test-Runner (CI deckt Lint/Typecheck/Build ab, keine Test-Suite).

## Agent skills

### Issue tracker

Issues leben in GitHub Issues (`arn0ld87/AP1`, `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default-Vokabular: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — ein `CONTEXT.md` + `docs/adr/` am Repo-Root (werden lazy von /domain-modeling erzeugt). See `docs/agents/domain.md`.
