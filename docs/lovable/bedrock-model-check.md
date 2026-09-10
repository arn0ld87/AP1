# Bedrock-Modellzugriff für die KI-Bewertung

Geprüft am: 2026-09-10

AWS-CLI-IAM-Zugriff (`aws bedrock list-foundation-models`) war in dieser Umgebung nicht
verfügbar (abgelaufene Session). Die Modell-IDs wurden stattdessen aus der offiziellen
AWS-Bedrock-Modell-Dokumentation entnommen; der eigentliche Zugriffstest erfolgte per
`invoke`-Aufruf über den in Vaultwarden hinterlegten `AWS_BEDROCK_API_KEY`
(`scripts/check_bedrock_access.py`).

Wichtig: Claude Haiku 4.5 unterstützt in `eu-central-1` **kein** In-Region-Invoke — nur
Cross-Region-Inference. Getestet wurde daher die Geo-Inference-ID mit `eu.`-Präfix.

- `eu.anthropic.claude-haiku-4-5-20251001-v1:0`: **OK**
- `anthropic.claude-3-5-haiku-20241022-v1:0` (und mit `eu.`-Präfix): `FEHLER 400: The provided model identifier is invalid` — nicht abschließend verifiziert, da Haiku 4.5 bereits verfügbar ist und der Fallback dadurch nicht mehr benötigt wird. Bei Bedarf vor Task 14 erneut mit der jeweils aktuellen Modell-ID prüfen.

**Gewählt für die KI-Bewertung: `eu.anthropic.claude-haiku-4-5-20251001-v1:0`**
(Haiku 4.5, da laut Test freigeschaltet — siehe Spec-Vorgabe.)
