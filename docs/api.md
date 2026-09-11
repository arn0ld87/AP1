# API

Es gibt keine klassische REST-/GraphQL-API dieses Repos — die einzige Backend-Logik ist eine
Supabase Edge Function für die KI-Bewertung der Probeprüfungen. Alle übrige Datenzugriffe laufen über
den Supabase-Client direkt gegen die Tabellen aus [data-model.md](data-model.md) (mit RLS), nicht über
eigene Endpunkte. Läuft seit dem Lovable-Pivot (siehe
[context.md](context.md#pivot-lovable-credit-limit-10092026)) auf dem self-hosted Supabase auf dem
armserver, nicht mehr auf Lovables verwaltetem Projekt.

> **Stand:** `grade-exam-answer.ts` + `delete-account.ts`, Feature-Branch `public-signup`.
> `verify_jwt = true` ist in `app/supabase/config.toml` gepinnt.
>
> **Verifiziert (11.09.2026, Live-Test am armserver):** `AWS_BEDROCK_API_KEY` authentifiziert per
> `Authorization: Bearer` gegen `bedrock-runtime.eu-central-1.amazonaws.com`. Freigeschaltet (echte
> Converse-Calls HTTP 200): `eu.amazon.nova-lite-v1:0`, `eu.amazon.nova-micro-v1:0`,
> `eu.amazon.nova-pro-v1:0`. Nicht nutzbar: alle Anthropic-IDs (nicht freigeschaltet), Llama/Mistral
> (invalid identifier), Nova on-demand-IDs ohne `eu.`-Präfix. Die Function ruft ausschließlich
> `/model/{id}/converse` auf (Nova-Body-Format) — der frühere Invoke-Shape (Anthropic-Format) ist
> entfernt. Der alte `BEDROCK_GATEWAY_KEY` (`gw-…`) liefert 403 und ist obsolet.

## Edge Function: KI-Bewertung

Ausführlich in
[docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md#ki-bewertungs-flow),
Implementierungs-Task „09-pruefungsmodus-ki-bewertung" im Plan.

### Ablauf

1. **Input** — Frontend sendet `antworttext` + `question_id` + `attempt_id` an die Edge Function.
2. **Auth + Eigentümerschaft** — JWT muss vorliegen; die Function prüft serverseitig, dass
   `exam_attempts.user_id` dem JWT-`sub` entspricht (Service Role umgeht RLS bewusst), sonst 403.
   Danach Tageslimit-Prüfung (50 KI-Bewertungen je Nutzer/Tag UTC, sonst 429 — siehe unten).
   Eingaben werden auf Form und Länge validiert (question_id, UUID-attempt_id, Antworttext
   ≤ 10.000 Zeichen), sonst 400.
3. **Kontext laden** — Function lädt Musterlösung + Punkteverteilung der Teilaufgabe aus
   `exam_questions`.
4. **Bedrock-Aufruf** — strukturierter Prompt (Antwort, Musterlösung, maximale Punktzahl) an Amazon
   Bedrock. Erwartete Antwort: JSON mit vergebenen Punkten + kurzer Begründung auf Deutsch.
   HTTP-Fehler, Timeout und invalides JSON werden geloggt und führen zu `punkte: null`.
5. **Persistenz** — Bewertung wird idempotent in `exam_answers` gespeichert (Upsert über
   `attempt_id,question_id`; `ki_punkte` wird strikt auf `0 <= punkte <= max_punkte` begrenzt).
   Niedrig bewertete Antworten fließen automatisch in `error_log`.
6. **Fehlerfall** — Bedrock nicht erreichbar oder Fehler → Musterlösung wird trotzdem angezeigt, Alex
   schätzt sich manuell selbst ein (Fallback auf den bisherigen, vor-App-Workflow); die Selbst-
   Punkte werden ebenfalls in `exam_answers` persistiert.

### Modell & Zugangsdaten

- Primär (und einziger implementierter Modellpfad): **Amazon Nova Lite** über Amazon Bedrock
  Converse API, Modell-ID `eu.amazon.nova-lite-v1:0` (Live-getestet 11.09.2026). Anthropic-Modelle
  (Claude Haiku 4.5 u. a.) sind für den AWS-Account **nicht freigeschaltet** — alle
  Claude-Modell-IDs liefern 400/„invalid model identifier". Nova ist nur über die
  Cross-Region-Inferenz-Profil-ID (`eu.`-Präfix) nutzbar, nicht on-demand. Es gibt **keinen
  implementierten Fallback auf ein zweites Modell**.
- Tageslimit: max. **50 KI-Bewertungen je Nutzer/Tag (UTC)**; die Function zählt
  `exam_answers` mit `ki_punkte` des Tages (`created_at`, Migration
  `20260912000000_exam_answers_created_at.sql`) und antwortet bei Erschöpfung mit
  `429 { "error": "Tageslimit erreicht …" }`. Nicht prüfbar (Lookup-Fehler) → 503 (fail-closed).
- Secrets: `AWS_BEDROCK_API_KEY`, in Vaultwarden hinterlegt (`vw get AWS_BEDROCK_API_KEY`). Die
  Env-Variable heißt exakt so — die Live-Kopie las versehentlich `BEDROCK_API_KEY` und erzeugte
  dadurch einen leeren Bearer (Bedrock-SigV4-403, 11.09.2026 behoben). **Ausschließlich** als
  Supabase-Edge-Function-Secret konfigurieren — niemals im Frontend-Bundle, Prompt-Text oder Chat
  im Klartext.

## Edge Function: Konto löschen (`delete-account`)

Self-Service-Kontolöschung (DSGVO Art. 17). Implementiert als `delete-account.ts` + Tests.

1. **Input** — `POST /functions/v1/delete-account` mit `Authorization: Bearer <user-JWT>`
   (`VERIFY_JWT` prüft die Signatur am Gateway), Body leer.
2. **Auth** — Ziel-ID ist ausschließlich der JWT-`sub` (nie ein Body-Feld — Service Role könnte
   sonst beliebige Nutzer löschen), sonst 401.
3. **Delete** — `DELETE {SUPABASE_URL}/auth/v1/admin/users/{sub}` mit dem Service-Role-Key
   (GoTrue-Admin-API). Alle Fachdaten hängen per FK `ON DELETE CASCADE` an `auth.users` und werden
   mitgelöscht.
4. **Response** — `200 { "ok": true }`; Fehler: 404 (User existiert nicht), 502 (GoTrue-Fehler),
   503 (Netzwerk). Das Frontend meldet den Nutzer danach ab (`signOut`) und navigiert zu `/auth`.

## Kein Public-API-Contract

Die App ist öffentlich registrierbar, hat aber weiterhin keinen externen API-Konsumenten — daher
gibt es bewusst keine versionierte, dokumentierte Public API, kein OpenAPI-Schema und keine
Backwards-Compatibility-Garantie für die Edge Functions — Änderungen an Request-/Response-Form
können direkt mit dem Frontend zusammen angepasst werden.
