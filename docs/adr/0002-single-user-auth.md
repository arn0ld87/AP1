# ADR-0002: Single-User-Auth ohne Registrierung und Social Login

**Status:** Superseded by implementation (14.09.2026) · **Datum:** 10.09.2026 · **Stand:** [docs/vision.md](../vision.md), [docs/architecture.md](../architecture.md)

**Korrektur (14.09.2026):** Diese ADR beschreibt die ursprüngliche Entscheidung. Im Deployment
(seit 11.09.2026) wurde Single-User-Auth durch Multi-User mit offener Registrierung ersetzt:
E-Mail+Passwort, E-Mail-Bestätigung (SMTP: Fastmail), Self-Service-Kontolöschung (Edge Function).
Registrierung erfolgt im UI-Tab „Registrieren" auf `/auth`, keine manuellen Invites. Siehe
[architecture.md § Auth & Deploy](../architecture.md#auth--deploy).

## Kontext

Die Web-App ist ein persönliches Prüfungsvorbereitungstool mit genau einem Nutzer (Alex). Multi-User-
Betreten, Registrierungs-UI oder OAuth-Anbieter würden Aufwand ohne Nutzwert erzeugen und die
Angriffsfläche vergrößern.

## Entscheidung

E-Mail + Passwort als einziger Auth-Weg, implementiert als Route-Guard
(`app/src/routes/_authenticated/route.tsx`) + Login-Route (`app/src/routes/auth.tsx`,
`signInWithPassword`). Kein Social Login, keine Registrierungs-UI.

## Konsequenzen

- Minimaler Auth-Surface: eine Account-Konfiguration, kein Invite-Flow.
- Keine Multi-Tenancy-Logik in Abfragen; Datenmodell bleibt einzelnutzertauglich (siehe
  [docs/data-model.md](../data-model.md)).
- Falls später ein zweiter Nutzer dazukommt, muss Auth nachgerüstet werden — bewusst nicht vorbereitet.