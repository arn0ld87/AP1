# Vision

## Ziel

Aus verstreutem, manuell gepflegtem Lernmaterial eine zusammenhängende Lernplattform machen, die zwei
konkrete Schwächen des Status quo behebt:

1. **Kein geräteübergreifender Fortschritt** — `AP1-Trainer.html` speichert nur lokal (`localStorage`),
   Fortschritt geht bei Browser-/Gerätewechsel verloren oder läuft auseinander.
2. **Keine automatisierte Bewertung** — Probeprüfungen werden von Hand gegen `loesungen/` korrigiert;
   das kostet Zeit, die in den verbleibenden Tagen bis zum 30.09.2026 knapp ist.

## Zielbild

Eine Web-App (React/Supabase — ursprünglich auf Lovable gebaut, seit dem Credit-Limit-Pivot lokal in
`app/` gegen ein self-hosted Supabase weiterentwickelt, siehe [context.md](context.md#pivot-lovable-credit-limit-10092026)),
die alle sieben Lernaktivitäten aus dem bestehenden Material in einer Oberfläche vereint und den
Fortschritt serverseitig je Nutzerkonto führt (seit PR #46 offene Registrierung, vorher ein
einzelner Account). Die Musterlösungs-Korrektur wird durch
eine KI-Bewertung (Amazon Bedrock, Amazon Nova Lite — Claude-Modelle sind für den genutzten
AWS-Account nicht freigeschaltet, siehe [api.md](api.md#modell--zugangsdaten)) ersetzt, mit
manuellem Fallback, falls das Modell nicht erreichbar ist.

Vollständige Feature-Liste, Architektur und Datenmodell: [architecture.md](architecture.md),
[data-model.md](data-model.md), Ursprungs-Spec
[docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md).

## Nicht-Ziele (aktuelle Iteration)

Explizit aus dem genehmigten Design ausgeschlossen — bei jeder Weiterentwicklung respektieren, nicht
stillschweigend erweitern:

- **alexle135-Branding.** Die App bekommt eine eigenständige Optik („Discord-Stil", dunkles Theme),
  keine Anlehnung an bestehende Alex-Projekte.

Das Deploy-Ziel ist `pruefung.alexle135.de` (live seit 10.09.2026, öffentlich seit 11.09.2026) auf
Traefik am armserver; siehe [architecture.md](architecture.md#auth--deploy). `ap1.alexle135.de` ist der
ältere Vor-Pivot-Deploy (Lovable-Projekt) und läuft unberührt parallel.

## Erfolgskriterium

Die App deckt alle sieben Feature-Module ab (siehe [architecture.md](architecture.md)) und Alex nutzt
sie für den restlichen Lernzeitraum bis zum 30.09.2026 anstelle der manuell gepflegten Markdown-Dateien
und von `AP1-Trainer.html`.
