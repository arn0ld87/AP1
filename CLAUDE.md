# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

AP1-Prüfungsvorbereitung (Fachinformatiker Systemintegration, Prüfungstermin **30.09.2026**). Kein
Software-Projekt im klassischen Sinn — es gibt keinen Build, kein Lint, keine Test-Suite. Der Inhalt
ist Lernmaterial in Markdown plus ein einziges selbstständiges HTML-Tool. Es gibt keine
Build-/Lint-/Test-Befehle, weil es kein Package-Manifest (`package.json`, `pyproject.toml` o. ä.) gibt.

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

## Geplante Migration (Lovable-Plattform)

Es existiert ein genehmigter Plan, dieses statische Material in eine Lovable-App
(React/Vite/TS/Tailwind/shadcn + Supabase) mit KI-Prüfungsbewertung zu überführen:

- Spec: `docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md`
- Plan: `docs/superpowers/plans/2026-09-10-lovable-ap1-plattform.md`
- Warum/Ausgangslage: [docs/context.md](docs/context.md)
- Produktvision & Nicht-Ziele: [docs/vision.md](docs/vision.md)
- Architektur & Feature-Module: [docs/architecture.md](docs/architecture.md)
- Datenmodell (Supabase/Postgres): [docs/data-model.md](docs/data-model.md)
- API / KI-Bewertungs-Flow (Edge Function): [docs/api.md](docs/api.md)

Der Plan sieht lokale Python-Migrationsskripte unter `scripts/migrate/` vor (reines Stdlib, keine
Zusatzpakete), die die `.md`-Dateien nach `data/migration/*.json` überführen, sowie eine Serie von
`lovable`-Skill-Prompts unter `docs/lovable/prompts/`. Diese Verzeichnisse existieren im Repo noch
nicht — erst beim Abarbeiten des Plans anlegen. Wichtige Constraints aus dem Plan (nicht wiederholen,
nur verlinkt): Auth ist Single-User (Alex), KI-Modell ist Claude Haiku 4.5 über Amazon Bedrock
(Fallback 3.5 Haiku), Secrets ausschließlich als Supabase-Edge-Function-Secret, kein automatisierter
Test-Runner — Verifikation erfolgt manuell in der Lovable-Preview.

Sobald an diesem Plan gearbeitet wird: `superpowers:subagent-driven-development` oder
`superpowers:executing-plans` verwenden, wie im Plan-Header vermerkt.
