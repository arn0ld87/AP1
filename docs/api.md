# API

Es gibt keine klassische REST-/GraphQL-API dieses Repos — die einzige Backend-Logik ist eine
Supabase Edge Function für die KI-Bewertung der Probeprüfungen. Alle übrige Datenzugriffe laufen über
den Supabase-Client direkt gegen die Tabellen aus [data-model.md](data-model.md) (mit RLS), nicht über
eigene Endpunkte. Läuft seit dem Lovable-Pivot (siehe
[context.md](context.md#pivot-lovable-credit-limit-10092026)) auf dem self-hosted Supabase auf dem
armserver, nicht mehr auf Lovables verwaltetem Projekt.

> **Stand:** Das Probeprüfungs-Modul (und damit diese Edge Function) ist noch nicht implementiert —
> siehe Modul-Tabelle in [architecture.md](architecture.md#feature-module-7). Der Ablauf unten ist der
> geplante Flow für Task 14.

## Edge Function: KI-Bewertung

Ausführlich in
[docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md#ki-bewertungs-flow),
Implementierungs-Task „09-pruefungsmodus-ki-bewertung" im Plan.

### Ablauf

1. **Input** — Frontend sendet `antworttext` + `question_id` an die Edge Function.
2. **Kontext laden** — Function lädt Musterlösung + Punkteverteilung der Teilaufgabe aus
   `exam_questions`.
3. **Bedrock-Aufruf** — strukturierter Prompt (Antwort, Musterlösung, maximale Punktzahl) an Amazon
   Bedrock. Erwartete Antwort: JSON mit vergebenen Punkten + kurzer Begründung auf Deutsch.
4. **Persistenz** — Ergebnis wird in `exam_answers` (`ki_punkte`, `ki_feedback`) gespeichert und im
   Frontend angezeigt. Niedrig bewertete Antworten fließen automatisch in `error_log`.
5. **Fehlerfall** — Bedrock nicht erreichbar oder Fehler → Musterlösung wird trotzdem angezeigt, Alex
   schätzt sich manuell selbst ein (Fallback auf den bisherigen, vor-App-Workflow).

### Modell & Zugangsdaten

- Primär: **Claude Haiku 4.5** über Amazon Bedrock — Zugriff verifiziert (Task 5, echter `invoke`-Call
  gegen die Vaultwarden-Credentials): in `eu-central-1` nur per Cross-Region-Inferenz erreichbar,
  Modell-ID `eu.anthropic.claude-haiku-4-5-20251001-v1:0`.
- Fallback: **Claude 3.5 Haiku** — die dokumentierte Fallback-ID lieferte im Test „invalid model
  identifier"; ungetestet, solange der Fallback nicht tatsächlich gebraucht wird (Task 14).
- Secrets: `AWS_BEDROCK_API_KEY` / `BEDROCK_GATEWAY_KEY`, in Vaultwarden hinterlegt (`vw get <name>`).
  **Ausschließlich** als Supabase-Edge-Function-Secret konfigurieren — niemals im Frontend-Bundle,
  Prompt-Text oder Chat im Klartext.

## Kein Public-API-Contract

Da Single-User (Alex, Auth via E-Mail/Passwort) und kein externer Konsument geplant ist, gibt es
bewusst keine versionierte, dokumentierte Public API, kein OpenAPI-Schema und keine Backwards-
Compatibility-Garantie für die Edge Function — Änderungen an Request-/Response-Form der Function
können direkt mit dem Frontend zusammen angepasst werden.
