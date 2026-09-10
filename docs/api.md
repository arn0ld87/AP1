# API

Es gibt keine klassische REST-/GraphQL-API dieses Repos — die einzige Backend-Logik ist eine
Supabase Edge Function für die KI-Bewertung der Probeprüfungen. Alle übrige Datenzugriffe laufen über
den Supabase-Client direkt gegen die Tabellen aus [data-model.md](data-model.md) (mit RLS), nicht über
eigene Endpunkte.

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

- Primär: **Claude Haiku 4.5** über Amazon Bedrock, sofern in der genutzten Region freigeschaltet
  (Model-Access-Check zu Projektbeginn, `scripts/check_bedrock_access.py` laut Plan).
- Fallback: **Claude 3.5 Haiku**.
- Secrets: `AWS_BEDROCK_API_KEY` / `BEDROCK_GATEWAY_KEY`, in Vaultwarden hinterlegt (`vw get <name>`).
  **Ausschließlich** als Supabase-Edge-Function-Secret konfigurieren — niemals im Frontend-Bundle,
  Prompt-Text oder Chat im Klartext.

## Kein Public-API-Contract

Da Single-User (Alex, Auth via E-Mail/Passwort) und kein externer Konsument geplant ist, gibt es
bewusst keine versionierte, dokumentierte Public API, kein OpenAPI-Schema und keine Backwards-
Compatibility-Garantie für die Edge Function — Änderungen an Request-/Response-Form der Function
können direkt mit dem Frontend zusammen angepasst werden.
