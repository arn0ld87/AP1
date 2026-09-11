# ADR-0003: KI-Bewertung via Amazon Bedrock (Claude Haiku 4.5, eu-central-1)

**Status:** Accepted · **Datum:** 11.09.2026 · **Stand:** [docs/api.md](../api.md)

## Kontext

Probeprüfungen sollen automatisch bewertet werden. Direkte Anthropic-API-Calls oder Drittanbieter-
Proxy wären Alternativen; Hosting (armserver, EU) und Kostenvorhersagbarkeit sprechen für einen
regional gebundenen Provider.

## Entscheidung

Bewertung läuft über die Edge Function `grade-exam-answer` → Amazon Bedrock mit
**Claude Haiku 4.5** (`eu.anthropic.claude-haiku-4-5-20251001-v1:0`, Cross-Region-Inferenz
eu-central-1). Der Response-Parsing-Code deckt beide API-Formen ab (`content[0].text` und
`output.message.content[0].text`). Es ist **kein zweites Fallback-Modell implementiert**: Bei
Bedrock-Fehler (HTTP != 2xx, Timeout, invalide Antwort) liefert die Function `punkte: null`
und das Frontend bietet die Selbst-Einschätzung an.

## Konsequenzen

- `AWS_BEDROCK_API_KEY` existiert ausschließlich als Supabase-Edge-Function-Secret (nicht im Repo,
  nicht im Frontend).
- `verify_jwt` ist für die Funktion fest gepinnt (Fix in PR #37) — bewertbare Endpunkte sind nicht
  anonym aufrufbar.
- Bei Bedrock-Fehler zeigt die App die Musterlösung trotzdem an; die Selbsteinschätzung wird zum
  Fallback.
- Regionale Bindung (eu-central-1) schränkt Modellwahl ein, garantiert aber EU-Datenhaltung.