# Handover — UI/UX-Refactor Prüfungsmodus & Wissenskarten

Branch `claude/bold-mendel-j3dp8w`, zwei Commits, vollständig nach `origin` gepusht.
Kein PR angelegt. Basis war `main` zum Stand 11.09.2026.

| Commit | Inhalt |
|---|---|
| `946d7a4` | Prüfungsmodus auf volle Breite, Markdown-Rendering, Antwort-Arbeitsbereich, Flip-Karten |
| `dfc6982` | Mobile-Layout: Sidebar als Drawer, App-Shell mit eigener Scrollfläche |

## Ausgangslage

Aus zwei Screenshots gemeldet:

1. **Probeprüfung** — Aufgabenbereich zu schmal, Markdown-Tabellen erschienen als rohe
   `| … |`-Syntax, Antwortfeld war einzeilig.
2. **Wissenskarten** — funktional in Ordnung, aber visuell statisch.

Vorgabe: im bestehenden Designsystem bleiben (Dark Theme, Tokens, Komponenten), kein
Redesign-Bruch, keine Refactorings außerhalb des Scopes.

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `app/src/routes/_authenticated/probepruefungen.tsx` | Breite, Markdown, Textarea, Teilaufgaben-Trennung, Statusleiste |
| `app/src/routes/_authenticated/wissenskarten.tsx` | Flip-Karte, Tastatursteuerung, Sitzungsstatistik, Themen-Chips |
| `app/src/lib/markdown.ts` | Tabellen: Spaltenausrichtung, Scroll-Container, Breite nach Inhalt |
| `app/src/components/markdown-content.tsx` | **neu** — gemeinsame Render-Komponente für DB-Markdown |
| `app/src/lib/__tests__/markdown.test.ts` | **neu** — 5 Tests (Tabellen, Ausrichtung, Escaping) |
| `app/src/styles.css` | `.flip-scene` / `.flip-card` / `.flip-face` (3D-Wende, `prefers-reduced-motion`) |
| `app/src/components/app-layout.tsx` | App-Shell, mobile Kopfzeile mit Drawer |
| `app/src/components/app-sidebar.tsx` | Desktop-Sidebar unter `md` ausgeblendet, `SidebarNav` extrahiert |

## Was inhaltlich passiert ist

### 1. Breite des Aufgabenbereichs

- Prüfungs- und Ergebnisansicht: `max-w-3xl` → `w-full max-w-[1500px]`. Seitenabstände
  kommen weiterhin aus dem `AppLayout`, keine starre Pixelbreite.
- Die Auswahlliste (drei Einträge) bleibt bewusst schmal (`max-w-3xl`).
- Ab `2xl` (≥ 1536 px) stehen Frage und Antwortbereich nebeneinander (7fr/5fr), darunter
  gestapelt. Ergebnisansicht ab `xl` zweispaltig: eigene Antwort links, Musterlösung und
  KI-Begründung rechts.
- Fließtext ist auf 75 ch begrenzt (`PROSE`-Konstante), Tabellen und Codeblöcke nicht —
  sonst wären Zeilen auf 1500 px unlesbar lang.
- Teilaufgaben: `1a`-Badge links, Punkte rechtsbündig mit tabularen Ziffern,
  Aufgaben-Header mit Punktesumme und Trennlinie.

### 2. Markdown-Rendering

Ursache der rohen Pipes: `probepruefungen.tsx` hatte einen eigenen Mini-Escaper
(`EscapedHtml`), der nur `**bold**`, `` `code` `` und `<br>` konnte. Der vorhandene
`renderMarkdown` aus `lib/markdown.ts` konnte Tabellen längst — er wurde auf dieser Seite
nur nicht benutzt.

- `EscapedHtml` entfernt, überall `MarkdownContent` (nutzt `renderMarkdown`, escaped
  weiterhin vollständig — kein Roh-HTML aus der DB).
- Tabellen zusätzlich verbessert: Ausrichtung aus der Trennzeile (`---:` → rechtsbündig
  mit tabularen Ziffern), eigener `overflow-x-auto`-Container, Breite passt sich dem
  Inhalt an statt erzwungenem `w-full`.
- Gegenprobe über alle drei Probeprüfungen: 10 Tabellen werden gerendert, **0** rohe
  Pipe-Zeilen bleiben übrig.

### 3. Antwortfeld

Einzeiliges `Input` → mitwachsendes `Textarea` (min. 8 Zeilen, monospaced, Einrückungen
bleiben erhalten) mit Zeilen-/Zeichenzähler. In der Ergebnisansicht wird die Antwort mit
`whitespace-pre-wrap` dargestellt, Zeilenumbrüche gehen also nicht mehr verloren.

Die Sticky-Leiste zeigt zusätzlich „x/y beantwortet · n P gesamt“ und färbt den Timer in
den letzten fünf Minuten in `status-bad`.

### 4. Wissenskarten

- Echte 3D-Flip-Karte: beide Seiten liegen in derselben Grid-Zelle, die Karte behält die
  Höhe der längeren Seite und springt beim Wenden nicht. `prefers-reduced-motion` wird
  respektiert (Transition auf 1 ms).
- Tastatur: Leertaste/Enter wenden, `1`/`2` bewerten, `→`/`N` weiter. Shortcuts stehen
  sichtbar unter den Themen-Chips.
- Sitzungsstatistik (Quote, Serie ab 3), Themen-Chips mit Checkbox-Zustand und
  Kartenanzahl, Ergebnis-Chip direkt auf der Karte.
- Gewichtungslogik (`pickWeighted`) und Persistenz (`flashcard-progress.ts`) unverändert.

### 5. Mobile-Layout (nachträglich beauftragt)

Die feste Sidebar (256 px, eingeklappt 64 px) stand bisher auf jedem Viewport und ließ auf
einem 400-px-Gerät kaum Inhaltsbreite übrig.

- Unter `md` ist die Sidebar ausgeblendet; eine 56-px-Kopfzeile öffnet den vorhandenen
  `Sheet`-Drawer mit derselben Navigation. Klick auf einen Punkt schließt ihn.
- Navigation, Abmelden und Einklappen liegen jetzt in `SidebarNav` und werden von
  Desktop-Sidebar und Drawer geteilt — kein doppelter Markup-Pfad.
- Layout ist eine echte App-Shell (`h-dvh`, `overflow-hidden`): gescrollt wird in `main`,
  damit sticky-Elemente wie die Prüfungsleiste an der Oberkante des Inhaltsbereichs kleben
  statt unter der Kopfzeile zu verschwinden. `scrollIntoView` im Tagesplan funktioniert
  unverändert (adressiert den jeweiligen Scroll-Container).
- Innenabstand des Inhalts auf Mobile von 24 px auf 16 px.

## Verifikation

Alles in `app/` ausgeführt, alles grün:

```
bunx tsc --noEmit
bun run lint          # 6 Warnungen, alle vorbestehend (react-refresh in components/ui)
bunx prettier --check .
bun run test          # 5 Dateien, 51 Tests
bun run build
```

Zusätzlich per Chromium (Playwright) gegen ein statisches Preview mit dem gebauten CSS und
echten Prüfungsdaten geprüft — Dokumentbreite gegen Viewport bei 1800 / 1280 / 420 px:
kein horizontaler Overflow. Vor dem Fix waren es bei 420 px 424 px.

## Offene Punkte

1. **Drawer-Interaktion nicht live geklickt.** Die authentifizierten Routen brauchen eine
   Session gegen die selbst gehostete Supabase-Instanz, die in der Cloud-Session nicht
   erreichbar war. Geprüft sind Typen, Build und statisches Layout — Öffnen/Schließen und
   Fokusverhalten des Drawers solltest du einmal lokal antippen.
2. **Kein PR angelegt** (nicht beauftragt). Branch ist pushbereit und CI-tauglich.
3. **Nicht angefasst, bewusst:** `AP1-Trainer.html`, die übrigen Routen
   (`lernblaetter`, `formelsammlung`, `tagesplan`, `fortschritt`, `rechnen`,
   Dashboard) — sie profitieren automatisch vom besseren Tabellen-Rendering und vom
   Mobile-Layout, haben aber weiter ihre bisherige Breite (`max-w-3xl` bzw. `max-w-4xl`).
   Falls dort ebenfalls mehr Breite gewünscht ist, wäre das ein eigener, kleiner Schritt.

## Umgebungshinweis (nur lokal/Cloud, nicht im Code)

Acht Pakete (`@supabase/*`, `iceberg-js`) liegen im Lockfile auf dem Lovable-Mirror
`europe-west4-npm.pkg.dev`. Der Download brach in der Cloud-Session über den Proxy
reproduzierbar ab (`ConnectionClosed`). Workaround dort: dieselben Tarballs von derselben
URL per `curl` geholt, sha512 gegen `bun.lock` geprüft, entpackt. **Registry und
`bun.lock` sind unverändert** — in CI und lokal ist das normalerweise kein Thema.
