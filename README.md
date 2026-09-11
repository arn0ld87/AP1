# AP1-Vorbereitung — Fachinformatiker Systemintegration

### Lernmaterial + begleitende Web-App für die Abschlussprüfung Teil 1

**Prüfungstermin: 30.09.2026** · Paket erstellt am 10.09.2026

[Inhalt](#inhalt) · [So arbeitest du damit](#so-arbeitest-du-damit) · [Datengrundlage](#datengrundlage) · [AP1 Trainer — die Web-App](#ap1-trainer--die-web-app-app) · [Aktueller Stand](#aktueller-stand) · [Dokumentation](#dokumentation)

---

## Inhalt

```
00_PRUEFUNGSANALYSE.md      Inventar aller Prüfungs-PDFs, Aufgabenanalyse,
                            Häufigkeitsanalyse, A/B/C-Priorisierung, 80/20
01_LERNPLAN.md              Tagesplan für die verbleibenden Tage
02_FORMELSAMMLUNG.md        alle Formeln, die in den Prüfungen gebraucht wurden
03_PRUEFUNGSPROGNOSE.md     Prognose je Thema mit Begründung aus den Altprüfungen
04_LERNFORTSCHRITT.md       Tabelle zum Eintragen des eigenen Kenntnisstands
05_FEHLERLISTE.md           Fehlerdatenbank mit Checkliste typischer Fallen

lernen/                     neun Lernblätter zu den A- und B-Themen
  datenmengen.md            Einheiten, Speicherbedarf, dpi, Farbtiefe
  datenuebertragung.md      Übertragungszeit und Datenraten
  subnetting.md             IPv4-Adressierung
  netzplan.md               Netzplantechnik
  stromrechnung.md          Leistung, Wirkungsgrad, Energiekosten
  wirtschaftsrechnung.md    Kalkulation, Amortisation, MwSt
  it-sicherheit.md          Schutzziele, DSGVO, Verschlüsselung, Malware
  raid.md                   RAID-Level, NAS, SAN, JBOD
  netzwerkdiagnose.md       OSI, Konsolenbefehle, Fehlersystematik

probepruefungen/            drei vollständige Probeprüfungen ohne Lösungen
  probepruefung_01.md       Schwerpunkt: wahrscheinlichste Aufgaben
  probepruefung_02.md       realistische gemischte Prüfung
  probepruefung_03.md       etwas über dem erwarteten Niveau

loesungen/                  die zugehörigen Musterlösungen mit Punkteverteilung

AP1-Trainer.html            eigenständiges Offline-Übungstool (siehe unten)
docs/                       Kontext, Vision, Architektur, Datenmodell, API der Web-App
```

## So arbeitest du damit

1. `00_PRUEFUNGSANALYSE.md` einmal lesen — dort steht, warum welches Thema wichtig ist.
2. `01_LERNPLAN.md` Tag für Tag abarbeiten. Jeder Tag beginnt mit einem Kurztest zum Vortag.
3. Zu jedem A-Thema gibt es ein Lernblatt in `lernen/`. Struktur überall gleich:
   verstehen → auswendig wissen → Formeln → Musteraufgabe → Lösungsschritte → häufige Fehler → Merksatz.
4. Probeprüfungen unter Zeitdruck schreiben: **90 Minuten, Uhr mitlaufen lassen**, erst danach
   den Ordner `loesungen/` öffnen.
5. Jeden Fehler in `05_FEHLERLISTE.md` eintragen und den Kenntnisstand in `04_LERNFORTSCHRITT.md`
   fortschreiben. Ein A-Thema mit Kenntnisstand „unsicher" verdrängt jedes B-Thema aus dem Tagesplan.

Alternativ läuft dasselbe Übungsmaterial interaktiv in `AP1-Trainer.html` (einfach im Browser öffnen,
kein Server nötig) bzw. — sobald fertig migriert — im begleitenden Web-Trainer unter `app/`, siehe unten.

## Datengrundlage

Ausgewertet wurden acht vollständig lesbare AP1-Termine im aktuellen Format:
Herbst 2021 · Frühjahr 2022 · Herbst 2022 · Herbst 2023 · Frühjahr 2024 · Herbst 2024 ·
Frühjahr 2025 · Frühjahr 2026.

Nicht auswertbar waren Frühjahr 2023 und Herbst 2025 — beide PDFs sind reine Bild-Scans ohne
Textebene. Sie sind deshalb aus allen Häufigkeitsangaben ausgenommen.

Alle Zahlenwerte in den Probeprüfungen wurden programmatisch nachgerechnet und durch Rückrechnung
kontrolliert. Szenarien, Firmen, Zahlen und IP-Adressen sind neu — die geforderte fachliche
Kompetenz entspricht den Originalprüfungen.

## AP1 Trainer — die Web-App (`app/`)

Die hier abgelegten Markdown-Unterlagen sind die Quelle für eine begleitende
Lern-Web-App: dunkles Theme im Discord-Look, Sidebar mit sieben Modulen.
Sie wurde zuerst in Lovable gebaut (Prompts in `docs/lovable/prompts/`),
nach dessen Credit-Limit aber exportiert und lokal weiterentwickelt.

### Architektur

- **Frontend:** TanStack Start (Vite + React 19 + TypeScript), Tailwind, shadcn/ui
- **Backend:** self-hosted Supabase auf dem armserver (`supabase.alexle135.de`),
  E-Mail+Passwort-Auth (ein Account), 6 Tabellen mit Row Level Security:
  `topic_mastery`, `flashcard_progress`, `exam_questions` (read-only für den Client),
  `exam_attempts`, `exam_answers`, `error_log`
- **Build-Output:** Nitro (Cloudflare-Worker-kompatibel), Deploy-Ziel ist
  `pruefung.alexle135.de` hinter Traefik auf dem armserver (Router-Vorlage:
  `deploy/traefik-pruefung.yml`)

### Module

| Modul | Route | Stand |
|---|---|---|
| Rechnen üben | `/rechnen` | fertig — 7 Aufgaben-Generatoren, `topic_mastery`-Upsert |
| Wissenskarten | `/wissenskarten` | fertig — 47 Karten, Gewichtung `(falsch+1)/(richtig+falsch+2)`, `flashcard_progress`-Upsert |
| Lernblätter | `/lernblaetter` | fertig — statischer Content aus `data/migration/lernblaetter.json` |
| Formelsammlung | `/formelsammlung` | fertig — Suche und Sprungnavigation |
| Tagesplan | `/tagesplan` | fertig — migrierter Tagesplan mit Abhaken |
| Probeprüfungen | `/probepruefungen` | fertig — 90-Minuten-Timer, KI-Bewertung via Bedrock Edge-Function, Selbst-Einschätzungs-Fallback |
| Fortschritt & Fehlerliste | `/fortschritt` | fertig — Supabase-Dashboard |
| Dashboard | `/` (authentifiziert) | fertig — Countdown, Modul-Kacheln, Fortschritt |

### Installation

Voraussetzungen: [Bun](https://bun.sh) ≥ 1.2, Netzwerkzugriff auf
`supabase.alexle135.de` (Tailscale oder öffentlich).

```bash
cd app
bun install          # Dependencies

# .env anlegen (Vorlage: app/.env.example — Keys NICHT committen):
#   VITE_SUPABASE_URL=https://supabase.alexle135.de
#   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key, liegt in Vaultwarden>

bun run dev          # Dev-Server mit HMR
bun run build        # Produktions-Build (Nitro-Output in .output/)
bun run preview      # gebauten Output lokal ansehen
bun run lint         # ESLint
bun run test         # Vitest (Generatoren, Prüfungs-Flow, Content)
```

Login: der eine angelegte Account (Zugangsdaten in Vaultwarden, nicht im Repo).
Ohne Login erscheint nur der Login-Screen — alle Modulrouten liegen hinter
dem Auth-Gate (`src/routes/_authenticated/route.tsx`).

### Datenbank

Schema-Migrationen liegen vollständig in `app/supabase/migrations/` — eine frische Datenbank
entsteht ausschließlich durch Anwenden dieser Migrationen in Reihenfolge (keine manuellen
ALTERs). Verifikation auf frischer Postgres-Instanz:
`python3 scripts/validate_migrations.py` (prüft Tabellen, Spalten, RLS, Policies, RPCs).
Content-Import: `python3 scripts/migrate/parse_exams.py` (u. a.) erzeugt `data/migration/*.json`
(77 Prüfungsaufgaben: 24/26/27 je Probeprüfung, je 100 Punkte), Import in `exam_questions`.
Backup/Restore: [docs/backup-restore.md](docs/backup-restore.md).

### Historie

Tasks 1–9 des SDD-Plans (`.superpowers/sdd/2026-09-10-lovable-ap1-plattform/`)
liefen über Lovable-MCP; seit dem Credit-Stopp wird direkt in `app/`
implementiert. Der PR dazu: arn0ld87/AP1#33. CI für PRs läuft seit
arn0ld87/AP1#38 (`.github/workflows/pr-check.yml`: Lint, Prettier, Typecheck,
Build, Edge-Function-Check, Migrationsskripte-Check).

