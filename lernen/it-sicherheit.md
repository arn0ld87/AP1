# IT-Sicherheit und Datenschutz

## Das musst du verstehen

Der punktstärkste Block der ganzen Prüfung: In sechs von acht ausgewerteten Terminen kam er vor,
oft als **komplette Aufgabe mit 20 bis 26 Punkten**. Es wird kein Spezialwissen verlangt, sondern
Standardantworten, die man auswendig können muss.

## Das musst du auswendig wissen

### Die drei Schutzziele

| Schutzziel | Frage | Beispielmaßnahmen |
|---|---|---|
| **Vertraulichkeit** | Wer darf es sehen? | Verschlüsselung, Zugriffsrechte, sichere Passwörter, Blickschutzfolie |
| **Integrität** | Ist es unverändert? | Hashwerte, Prüfziffern, digitale Signatur, Versionierung |
| **Verfügbarkeit** | Ist es erreichbar? | Backup, RAID, USV, Redundanz, Wartungsverträge |

Merkhilfe für die Zuordnungstabelle:
*Verschlüsselung → Vertraulichkeit · Hashwert → Integrität · Datensicherung → Verfügbarkeit ·
zentrale Ablage auf dem Server → Integrität (einheitlicher Bearbeitungsstand).*

### Schutzbedarfskategorien
normal · hoch · sehr hoch — jeweils mit Begründung über die **Schadenshöhe** für den Geschäftsprozess.

### Rechtsgrundlagen
- **DSGVO** (EU-Datenschutz-Grundverordnung) — Schutz personenbezogener Daten
- **BDSG** (Bundesdatenschutzgesetz)
- StGB (Ausspähen und Abfangen von Daten), GG Art. 10 (Fernmeldegeheimnis), Landesdatenschutzgesetze
- Besonders geschützt: personenbezogene Daten, insbesondere Gesundheits-, Mitarbeiter- und Mandantendaten

### Sicheres Passwort — Kriterium **mit Begründung**
- ausreichende Länge → größerer Suchraum, Brute Force dauert länger
- Groß-/Kleinbuchstaben, Ziffern, Sonderzeichen → größerer Zeichenvorrat
- keine Wörterbuchbegriffe → Wörterbuchangriff läuft ins Leere
- je Dienst ein eigenes Passwort → ein Leck kompromittiert nicht alle Zugänge
- zusätzlich: Zwei-Faktor-Authentifizierung

### Phishing
**Anzeichen:** unpersönliche Anrede · Dringlichkeit und Drohung · fehlerhafte Sprache ·
abweichende Absenderadresse · Link-Ziel stimmt nicht mit Anzeigetext überein · unerwarteter Anhang ·
Aufforderung zur Eingabe von Zugangsdaten
**Maßnahmen im Unternehmen:** Spamfilter, Mail-Gateway, Schulungen/Awareness, Anhänge in der Sandbox,
SPF/DKIM/DMARC, Meldeweg an die IT
**Maßnahmen für Mitarbeiter:** keine Links/Anhänge aus unerwarteten Mails öffnen, Absender prüfen,
im Zweifel telefonisch rückfragen, nie Zugangsdaten per Mail

### Malware-Arten mit je einem Merkmal
- **Virus** — hängt sich an ein Wirtsprogramm und verbreitet sich mit ihm
- **Wurm** — verbreitet sich selbstständig über das Netz, ohne Wirt
- **Trojaner** — versteckt sich in scheinbar nützlicher Software
- **Ransomware** — verschlüsselt Daten und fordert Lösegeld
- **Spyware / Keylogger** — späht Verhalten bzw. Tastatureingaben aus
- **Backdoor** — verschafft Dritten verdeckten Zugang
- **Adware / Scareware** — blendet Werbung ein bzw. verunsichert zum Kauf

**Schutz:** Virenschutz aktuell halten · Betriebssystem und Anwendungen patchen ·
keine Software aus unsicheren Quellen · Makros und aktive Inhalte deaktivieren ·
eingeschränkte Benutzerrechte · Mitarbeiter sensibilisieren · Backups

### Verschlüsselung
| | symmetrisch | asymmetrisch |
|---|---|---|
| Schlüssel | ein gemeinsamer | Schlüsselpaar öffentlich/privat |
| Vorteil | schnell | kein geheimer Schlüsselaustausch nötig |
| Nachteil | Schlüsselaustausch ist das Problem | rechenintensiv, langsamer |

**Ablauf asymmetrisch (vertraulich senden):**
1. Der Empfänger schickt seinen **öffentlichen** Schlüssel.
2. Der Absender verschlüsselt mit dem **öffentlichen Schlüssel des Empfängers**.
3. Die Nachricht wird übertragen.
4. Der Empfänger entschlüsselt mit seinem **privaten** Schlüssel.
→ erreichtes Schutzziel: **Vertraulichkeit**
(Umgekehrt — mit dem eigenen privaten Schlüssel signieren — erreicht Authentizität und Integrität.)

**Hashwert:** Einwegfunktion, dient der **Integritätsprüfung**. Stimmt der selbst berechnete
Hash mit dem veröffentlichten überein, wurde die Datei nicht verändert.

**Digitales Zertifikat:** bestätigt die Zuordnung eines öffentlichen Schlüssels zu einer Identität,
ausgestellt von einer Zertifizierungsstelle → **Authentifizierung**.

**VPN:** baut über ein unsicheres Netz einen verschlüsselten Tunnel auf, sodass der Client so
arbeiten kann, als wäre er im Firmennetz.

### BSI IT-Grundschutz — typische Basis-Anforderungen
Autoupdate aktivieren · Rollentrennung (nicht als Administrator arbeiten) · Minimalkonfiguration ·
Trennung von Netzen · Bildschirmsperre · Protokollierung · Datensicherungskonzept

### Datensicherung
- **Generationenprinzip** (Großvater-Vater-Sohn): mehrere Sicherungsstände in fester Reihenfolge
- **räumliche und zeitliche Trennung** vom Original — sonst hilft das Backup bei Brand oder Diebstahl nicht
- Sicherungsmedien verschlüsseln
- **Rücksicherung regelmäßig testen** — ein nie getestetes Backup ist kein Backup
- Sicherungsarten: Vollsicherung · differenziell (seit der letzten Vollsicherung) · inkrementell (seit der letzten Sicherung)

## Typische Prüfungsaufgabe

Ordnen Sie jeder Sicherheitsmaßnahme das passende Schutzziel zu und begründen Sie die Zuordnung.

| Maßnahme | Schutzziel | Begründung |
|---|---|---|
| Sichere Passwörter wählen | Vertraulichkeit | Der Zugriff Fremder auf die Benutzerdaten wird erschwert. |
| Regelmäßige Datensicherung | Verfügbarkeit | Daten können nach einem Verlust wiederhergestellt werden. |
| Verschlüsselung der Festplatten | Vertraulichkeit | Unberechtigte können die Daten nicht inhaltlich nutzen. |
| Zentrale Bearbeitung auf dem Server | Integrität | Es entstehen keine abweichenden Bearbeitungsstände. |
| Hashwertprüfung bei Installation | Integrität | Eine Veränderung der Datei würde auffallen. |

*(Originalaufgabe: Herbst 2021, Aufgabe 4a.)*

## Häufige Fehler

- Bei „Begründen Sie" nur das Schutzziel genannt, ohne Begründung → halbe Punktzahl
- Vertraulichkeit und Integrität verwechselt (Hashwert ist **Integrität**, nicht Vertraulichkeit)
- Beim asymmetrischen Verfahren mit dem eigenen öffentlichen Schlüssel verschlüsselt
- Mehr Maßnahmen genannt als verlangt — nur die ersten zählen
- DSGVO als „Datenschutzgesetz" abgekürzt statt korrekt benannt

## Merksatz

> **Vertraulichkeit = wer darf sehen. Integrität = ist es echt. Verfügbarkeit = komme ich dran.
> Verschlüsselt wird mit dem öffentlichen Schlüssel des Empfängers.**
