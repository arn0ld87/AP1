# AP1-Lernplattform als Lovable-App — Design

Status: Genehmigt · 2026-09-10

## Kontext & Ziel

Das Repo enthält statisches Lernmaterial für die AP1-Prüfung (Fachinformatiker
Systemintegration, Prüfungstermin 30.09.2026): einen interaktiven
Übungs-Trainer (`AP1-Trainer.html`), 9 Lernblätter, eine Formelsammlung, 3
Probeprüfungen mit Musterlösungen sowie Lernplan/Fortschritt/Fehlerliste als
Markdown-Dateien, die manuell gepflegt werden.

Ziel: eine anspruchsvoll designte Web-App (gebaut mit Lovable), die den
gesamten Lerninhalt zu einer zusammenhängenden Plattform mit
gerätübergreifendem Fortschritt und KI-gestützter Prüfungsbewertung macht.

## Architektur & Stack

- Lovable-Standard: React + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Supabase (Auth, Postgres, Edge Functions)
- Auth: E-Mail + Passwort, ein einzelner Account (Alex)
- Deploy: Lovable-Live-Deploy; optional später eigene Domain
  (`ap1.alexle135.de` via Cloudflare-CNAME) — nicht Teil dieser Iteration

## Feature-Module

1. **Rechnen üben** — Port der bestehenden Zufallsgenerator-Logik aus
   `AP1-Trainer.html` (`TOPICS`, `pick`, Themen: Subnetting, Datenmengen,
   Datenübertragung, Stromrechnung, Wirtschaftsrechnung, RAID, Netzplan,
   IT-Sicherheit, Netzwerkdiagnose). Ergebnis pro Versuch (richtig/falsch)
   landet in Supabase statt `localStorage`.
2. **Wissenskarten** — Flashcard-Review der bestehenden `CARDS`-Inhalte,
   Richtig/Falsch-Tracking pro Karte.
3. **Lernblätter** — die 9 Blätter aus `lernen/` als durchsuchbare,
   aufklappbare Seiten mit einheitlicher Struktur (verstehen → auswendig
   wissen → Formeln → Musteraufgabe → Lösungsschritte → häufige Fehler →
   Merksatz). Markierung „sicher/unsicher" pro Blatt.
4. **Formelsammlung** — durchsuchbare Referenzseite aus
   `02_FORMELSAMMLUNG.md`.
5. **Probeprüfungen** — die 3 Prüfungen aus `probepruefungen/` mit
   90-Minuten-Timer, Antworteingabe pro Teilaufgabe, KI-Bewertung gegen die
   Musterlösungen aus `loesungen/` inkl. Punkteverteilung. Ergebnis +
   Feedback pro Aufgabe wird angezeigt und gespeichert.
6. **Fortschritt & Fehlerliste** — automatisch abgeleitetes Dashboard aus
   Generator-Ergebnissen und Prüfungs-Feedback; ersetzt die manuell
   gepflegten `04_LERNFORTSCHRITT.md` / `05_FEHLERLISTE.md`.
7. **Tagesplan** — die 20 Tage aus `01_LERNPLAN.md` als Checkliste,
   verlinkt auf das passende Lernblatt bzw. Generator-Thema des Tages.

## Datenmodell (Supabase / Postgres)

- `profiles` — ein Nutzer-Datensatz (Alex)
- `topic_mastery` (user_id, topic_id, richtig, falsch, updated_at)
- `flashcard_progress` (user_id, card_id, richtig, falsch, updated_at)
- `exam_questions` — einmalig aus den `.md`-Dateien migriert: Prüfung,
  Aufgabennummer, Teilaufgaben-Text, Musterlösung, Punkteverteilung
- `exam_attempts` (user_id, exam_id, started_at, finished_at,
  gesamtpunkte)
- `exam_answers` (attempt_id, question_id, antworttext, ki_punkte,
  ki_feedback)
- `error_log` — automatisch befüllt aus falschen Generator-Antworten und
  KI-Bewertungen mit niedriger Punktzahl (Thema, Zeitpunkt, Kurzbeschreibung)

## KI-Bewertungs-Flow

1. Frontend sendet Antworttext + `question_id` an eine Supabase Edge
   Function.
2. Die Function lädt Musterlösung + Punkteverteilung aus
   `exam_questions`.
3. Bedrock-Aufruf mit strukturiertem Prompt (Antwort, Musterlösung,
   maximale Punktzahl der Teilaufgabe) → Modell liefert JSON zurück:
   vergebene Punkte + kurze Begründung auf Deutsch.
4. Ergebnis wird in `exam_answers` gespeichert und im Frontend angezeigt;
   niedrig bewertete Antworten fließen automatisch in `error_log`.
5. **Fehlerfall:** Bedrock nicht erreichbar/Fehler → Musterlösung wird
   trotzdem angezeigt, Nutzer schätzt sich manuell selbst ein (Fallback
   auf den bisherigen Workflow).

**Modellwahl:** Claude Haiku 4.5 über Amazon Bedrock, sofern in der
genutzten Region freigeschaltet (Model-Access-Check zu Beginn der
Implementierung). Fallback: Claude 3.5 Haiku. Zugangsdaten
(`AWS_BEDROCK_API_KEY` / `BEDROCK_GATEWAY_KEY`, bereits in Vaultwarden
hinterlegt) werden ausschließlich als Supabase-Edge-Function-Secret
hinterlegt, nie im Frontend-Bundle.

## Design-System — „Discord-Stil"

Dunkles Theme, linke Sidebar mit den 7 Bereichen (analog Server-/
Kanal-Liste), Content-Pane rechts, abgerundete Karten, Blurple-artiger
Akzent. Kein Bezug zum alexle135-Branding — eigenständige Optik für
diese Lernapp.

## Migration & Setup

Einmaliger Import-Schritt vor dem ersten Feature-Build: Lernblätter,
Formelsammlung, Probeprüfungen und Musterlösungen aus den vorhandenen
`.md`-Dateien werden strukturiert in die Supabase-Tabellen überführt
(`exam_questions` u. a.), damit sowohl UI als auch die Bewertungs-Edge-
Function darauf zugreifen können.

## Out of Scope (diese Iteration)

- Eigene Domain / Cloudflare-Einrichtung
- Mehrbenutzerfähigkeit (nur ein Account)
- Automatisierte Tests (Verifikation erfolgt durch Klick-Durchlauf in der
  Lovable-Preview je Feature, passend zum Lovable-Workflow)
