# Vision

## Ziel

Aus verstreutem, manuell gepflegtem Lernmaterial eine zusammenhängende Lernplattform machen, die zwei
konkrete Schwächen des Status quo behebt:

1. **Kein geräteübergreifender Fortschritt** — `AP1-Trainer.html` speichert nur lokal (`localStorage`),
   Fortschritt geht bei Browser-/Gerätewechsel verloren oder läuft auseinander.
2. **Keine automatisierte Bewertung** — Probeprüfungen werden von Hand gegen `loesungen/` korrigiert;
   das kostet Zeit, die in den verbleibenden Tagen bis zum 30.09.2026 knapp ist.

## Zielbild

Eine Web-App (Lovable/React/Supabase), die alle sieben Lernaktivitäten aus dem bestehenden Material in
einer Oberfläche vereint und den Fortschritt serverseitig für einen einzelnen Account führt. Die
Musterlösungs-Korrektur wird durch eine KI-Bewertung (Amazon Bedrock, Claude Haiku 4.5) ersetzt, mit
manuellem Fallback, falls das Modell nicht erreichbar ist.

Vollständige Feature-Liste, Architektur und Datenmodell: [architecture.md](architecture.md),
[data-model.md](data-model.md), Ursprungs-Spec
[docs/superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md](superpowers/specs/2026-09-10-lovable-ap1-plattform-design.md).

## Nicht-Ziele (aktuelle Iteration)

Explizit aus dem genehmigten Design ausgeschlossen — bei jeder Weiterentwicklung respektieren, nicht
stillschweigend erweitern:

- **Mehrbenutzerfähigkeit.** Ein Account (Alex), keine Nutzerverwaltung, keine Rollen.
- **Eigene Domain.** `ap1.alexle135.de` ist als Idee genannt, aber bewusst nicht Teil dieser Iteration.
- **Automatisierte Tests.** Verifikation läuft über manuelle Klick-Durchläufe in der Lovable-Preview,
  passend zum Lovable-Workflow — kein CI-Test-Runner geplant.
- **alexle135-Branding.** Die App bekommt eine eigenständige Optik („Discord-Stil", dunkles Theme),
  keine Anlehnung an bestehende Alex-Projekte.

## Erfolgskriterium

Die App deckt alle sieben Feature-Module ab (siehe [architecture.md](architecture.md)) und Alex nutzt
sie für den restlichen Lernzeitraum bis zum 30.09.2026 anstelle der manuell gepflegten Markdown-Dateien
und von `AP1-Trainer.html`.
