/**
 * Lernblätter aus data/migration/lernblaetter.json (Task 1) — statischer
 * Content, bewusst nicht in der DB (selten geändert, kein Admin-Bedarf).
 */
export interface Lernblatt {
  id: string;
  title: string;
  verstehen: string;
  auswendig_wissen: string;
  formeln: string;
  musteraufgabe: string;
  loesungsschritte: string;
  haeufige_fehler: string;
  merksatz: string;
}

export const LERNBLAETTER: Lernblatt[] = [
  {
    id: "datenmengen",
    title: "Datenmengen und Speicherbedarf",
    verstehen:
      "Jede Speicheraufgabe folgt derselben Kette:\n**Wie viele Bildpunkte? → wie viele Bit pro Punkt? → durch 8 = Byte → durch 1024 = KiB → MiB → GiB → TiB.**\n\nDer einzige Grund, warum Prüflinge hier Punkte verlieren, ist die Verwechslung zweier Einheitenfamilien:\n\n| Familie | Faktor | wofür |\n|---|---|---|\n| KiB, MiB, GiB, TiB (binär) | **1024** | Speicherplatz, Dateigrößen, RAM |\n| kB, MB, GB, TB (dezimal) | **1000** | Datenraten, Festplattenaufdrucke, Herstellerangaben |",
    auswendig_wissen:
      '- 1 Byte = 8 bit\n- 1 KiB = 1.024 Byte · 1 MiB = 1.024 KiB · 1 GiB = 1.024 MiB · 1 TiB = 1.024 GiB\n- 1 Inch = 2,54 cm\n- Farbtiefe „8 Bit pro Farbkanal" bei RGB bedeutet **24 Bit pro Pixel**\n- Anzahl darstellbarer Farben = 2^Farbtiefe (24 Bit → 16.777.216)\n- Auflösung in dpi = Bildpunkte pro Inch',
    formeln:
      '```\nPixelanzahl   = Breite [px] × Höhe [px]\nPixel aus dpi = Länge [cm] / 2,54 × dpi\nSpeicher [bit]  = Pixelanzahl × Farbtiefe [bit]\nSpeicher [Byte] = Speicher [bit] / 8\nVideodatenrate [bit/s] = Breite × Höhe × Farbtiefe × fps × Kompressionsfaktor\nSpeicher [bit]  = Datenrate [bit/s] × Zeit [s]\n```\n\nKompression „auf 30 %" bedeutet **× 0,3**. Kompression „um 30 %" bedeutet **× 0,7**. Lies genau.',
    musteraufgabe:
      "Eine Kamera nimmt mit 1920 × 1080 Pixeln bei 24 Bit Farbtiefe und 30 Bildern pro Sekunde auf.\nDas Material wird auf 30 % komprimiert.\na) Berechnen Sie die erforderliche Datenübertragungsrate in Mbit/s. Runden Sie auf volle Mbit/s.\nb) Vier Kameras nehmen 72 Stunden auf. Berechnen Sie den Speicherbedarf in TiB.",
    loesungsschritte:
      "**a)**\n1. Pixel pro Bild: 1920 × 1080 = 2.073.600\n2. Bit pro Bild: 2.073.600 × 24 = 49.766.400\n3. Bit pro Sekunde: 49.766.400 × 30 = 1.492.992.000\n4. Kompression: × 0,3 = 447.897.600 bit/s\n5. In Mbit/s (dezimal, also ÷ 1.000.000): 447,8976 → **448 Mbit/s**\n\n**b)**\n1. Sekunden: 72 × 3.600 = 259.200\n2. Bit gesamt: 448.000.000 × 4 × 259.200 = 4,644864 × 10¹⁴\n3. Byte: ÷ 8 = 5,80608 × 10¹³\n4. TiB: ÷ 1024⁴ = 52,81 → **53 TiB**\n\n*(Originalaufgabe: Frühjahr 2026, Aufgabe 1ad und 1b.)*",
    haeufige_fehler:
      '- Mbit/s mit MB/s verwechselt → Faktor 8 daneben\n- In Schritt 5 durch 1024² statt 1.000.000 geteilt (Datenrate ist **dezimal**)\n- Kompressionsfaktor vergessen oder falsch herum angewendet\n- Bei „TiB" mit 1000er-Schritten gerechnet\n- Rundungsvorgabe missachtet („aufrunden" ist nicht „kaufmännisch runden")\n- Farbtiefe pro Kanal mit Farbtiefe pro Pixel verwechselt',
    merksatz: "> **Pixel × Bit ÷ 8 = Byte. Speicher rechnet 1024, Leitung rechnet 1000.**",
  },
  {
    id: "datenuebertragung",
    title: "Datenübertragung und Übertragungszeit",
    verstehen:
      "Es gibt genau eine Formel. Der ganze Aufwand steckt darin, beide Seiten in dieselbe Einheit zu bringen:\nDatenmenge in **Bit**, Datenrate in **Bit pro Sekunde**.",
    auswendig_wissen:
      '- Datenraten werden **dezimal** gezählt: 1 Mbit/s = 1.000.000 bit/s\n- Dateigrößen werden **binär** gezählt: 1 MiB = 1.048.576 Byte\n- „Mbps" = Mbit/s, nicht MB/s\n- Beim **Hochladen** zählt die **Upload**-Rate. Bei DSL/VDSL ist sie deutlich kleiner als der Download.\n- Übliche Bruttoraten: USB 2.0 = 480 Mbit/s · USB 3.0 = 5 Gbit/s · Fast Ethernet = 100 Mbit/s · Gigabit Ethernet = 1 Gbit/s',
    formeln:
      "```\nt [s] = Datenmenge [bit] / Datenrate [bit/s]\n\nDatenmenge [bit] = Größe [MiB] × 1024 × 1024 × 8\nFaktor zweier Raten = schnellere Rate / langsamere Rate\n```",
    musteraufgabe:
      "Herr Berger sichert eine Datei von 1 GiB über seinen Anschluss. Der Speedtest zeigt:\nDownload 75,78 Mbit/s, Upload 50,02 Mbit/s.\nBerechnen Sie die Übertragungsdauer. Runden Sie auf volle Sekunden auf und geben Sie das Ergebnis in Minuten und Sekunden an.",
    loesungsschritte:
      "1. **Upload** ist die richtige Richtung (er lädt hoch): 50,02 Mbit/s = 50.020.000 bit/s\n2. 1 GiB = 1 × 1024 × 1024 × 1024 × 8 = 8.589.934.592 bit\n3. 8.589.934.592 / 50.020.000 = 171,73 s\n4. Aufrunden: 172 s\n5. 172 s = **2 Minuten 52 Sekunden**\n\n*(Originalaufgabe: Frühjahr 2024, Aufgabe 4f.)*",
    haeufige_fehler:
      '- Download- statt Upload-Rate genommen (der häufigste Fehler in dieser Aufgabenfamilie)\n- MiB nicht in Bit umgerechnet, sondern direkt geteilt\n- 1024 statt 1.000.000 beim Umrechnen der Datenrate\n- Ergebnis nicht in min : s umgewandelt, obwohl gefordert\n- Bei „auf volle Sekunden aufrunden" abgerundet',
    merksatz: "> **Bit durch Bit pro Sekunde. Hochladen heißt Upload.**",
  },
  {
    id: "it-sicherheit",
    title: "IT-Sicherheit und Datenschutz",
    verstehen:
      "Der punktstärkste Block der ganzen Prüfung: In sechs von acht ausgewerteten Terminen kam er vor,\noft als **komplette Aufgabe mit 20 bis 26 Punkten**. Es wird kein Spezialwissen verlangt, sondern\nStandardantworten, die man auswendig können muss.",
    auswendig_wissen:
      "### Die drei Schutzziele\n\n| Schutzziel | Frage | Beispielmaßnahmen |\n|---|---|---|\n| **Vertraulichkeit** | Wer darf es sehen? | Verschlüsselung, Zugriffsrechte, sichere Passwörter, Blickschutzfolie |\n| **Integrität** | Ist es unverändert? | Hashwerte, Prüfziffern, digitale Signatur, Versionierung |\n| **Verfügbarkeit** | Ist es erreichbar? | Backup, RAID, USV, Redundanz, Wartungsverträge |\n\nMerkhilfe für die Zuordnungstabelle:\n*Verschlüsselung → Vertraulichkeit · Hashwert → Integrität · Datensicherung → Verfügbarkeit ·\nzentrale Ablage auf dem Server → Integrität (einheitlicher Bearbeitungsstand).*\n\n### Schutzbedarfskategorien\nnormal · hoch · sehr hoch — jeweils mit Begründung über die **Schadenshöhe** für den Geschäftsprozess.\n\n### Rechtsgrundlagen\n- **DSGVO** (EU-Datenschutz-Grundverordnung) — Schutz personenbezogener Daten\n- **BDSG** (Bundesdatenschutzgesetz)\n- StGB (Ausspähen und Abfangen von Daten), GG Art. 10 (Fernmeldegeheimnis), Landesdatenschutzgesetze\n- Besonders geschützt: personenbezogene Daten, insbesondere Gesundheits-, Mitarbeiter- und Mandantendaten\n\n### Sicheres Passwort — Kriterium **mit Begründung**\n- ausreichende Länge → größerer Suchraum, Brute Force dauert länger\n- Groß-/Kleinbuchstaben, Ziffern, Sonderzeichen → größerer Zeichenvorrat\n- keine Wörterbuchbegriffe → Wörterbuchangriff läuft ins Leere\n- je Dienst ein eigenes Passwort → ein Leck kompromittiert nicht alle Zugänge\n- zusätzlich: Zwei-Faktor-Authentifizierung\n\n### Phishing\n**Anzeichen:** unpersönliche Anrede · Dringlichkeit und Drohung · fehlerhafte Sprache ·\nabweichende Absenderadresse · Link-Ziel stimmt nicht mit Anzeigetext überein · unerwarteter Anhang ·\nAufforderung zur Eingabe von Zugangsdaten\n**Maßnahmen im Unternehmen:** Spamfilter, Mail-Gateway, Schulungen/Awareness, Anhänge in der Sandbox,\nSPF/DKIM/DMARC, Meldeweg an die IT\n**Maßnahmen für Mitarbeiter:** keine Links/Anhänge aus unerwarteten Mails öffnen, Absender prüfen,\nim Zweifel telefonisch rückfragen, nie Zugangsdaten per Mail\n\n### Malware-Arten mit je einem Merkmal\n- **Virus** — hängt sich an ein Wirtsprogramm und verbreitet sich mit ihm\n- **Wurm** — verbreitet sich selbstständig über das Netz, ohne Wirt\n- **Trojaner** — versteckt sich in scheinbar nützlicher Software\n- **Ransomware** — verschlüsselt Daten und fordert Lösegeld\n- **Spyware / Keylogger** — späht Verhalten bzw. Tastatureingaben aus\n- **Backdoor** — verschafft Dritten verdeckten Zugang\n- **Adware / Scareware** — blendet Werbung ein bzw. verunsichert zum Kauf\n\n**Schutz:** Virenschutz aktuell halten · Betriebssystem und Anwendungen patchen ·\nkeine Software aus unsicheren Quellen · Makros und aktive Inhalte deaktivieren ·\neingeschränkte Benutzerrechte · Mitarbeiter sensibilisieren · Backups\n\n### Verschlüsselung\n| | symmetrisch | asymmetrisch |\n|---|---|---|\n| Schlüssel | ein gemeinsamer | Schlüsselpaar öffentlich/privat |\n| Vorteil | schnell | kein geheimer Schlüsselaustausch nötig |\n| Nachteil | Schlüsselaustausch ist das Problem | rechenintensiv, langsamer |\n\n**Ablauf asymmetrisch (vertraulich senden):**\n1. Der Empfänger schickt seinen **öffentlichen** Schlüssel.\n2. Der Absender verschlüsselt mit dem **öffentlichen Schlüssel des Empfängers**.\n3. Die Nachricht wird übertragen.\n4. Der Empfänger entschlüsselt mit seinem **privaten** Schlüssel.\n→ erreichtes Schutzziel: **Vertraulichkeit**\n(Umgekehrt — mit dem eigenen privaten Schlüssel signieren — erreicht Authentizität und Integrität.)\n\n**Hashwert:** Einwegfunktion, dient der **Integritätsprüfung**. Stimmt der selbst berechnete\nHash mit dem veröffentlichten überein, wurde die Datei nicht verändert.\n\n**Digitales Zertifikat:** bestätigt die Zuordnung eines öffentlichen Schlüssels zu einer Identität,\nausgestellt von einer Zertifizierungsstelle → **Authentifizierung**.\n\n**VPN:** baut über ein unsicheres Netz einen verschlüsselten Tunnel auf, sodass der Client so\narbeiten kann, als wäre er im Firmennetz.\n\n### BSI IT-Grundschutz — typische Basis-Anforderungen\nAutoupdate aktivieren · Rollentrennung (nicht als Administrator arbeiten) · Minimalkonfiguration ·\nTrennung von Netzen · Bildschirmsperre · Protokollierung · Datensicherungskonzept\n\n### Datensicherung\n- **Generationenprinzip** (Großvater-Vater-Sohn): mehrere Sicherungsstände in fester Reihenfolge\n- **räumliche und zeitliche Trennung** vom Original — sonst hilft das Backup bei Brand oder Diebstahl nicht\n- Sicherungsmedien verschlüsseln\n- **Rücksicherung regelmäßig testen** — ein nie getestetes Backup ist kein Backup\n- Sicherungsarten: Vollsicherung · differenziell (seit der letzten Vollsicherung) · inkrementell (seit der letzten Sicherung)",
    formeln: "",
    musteraufgabe:
      "Ordnen Sie jeder Sicherheitsmaßnahme das passende Schutzziel zu und begründen Sie die Zuordnung.\n\n| Maßnahme | Schutzziel | Begründung |\n|---|---|---|\n| Sichere Passwörter wählen | Vertraulichkeit | Der Zugriff Fremder auf die Benutzerdaten wird erschwert. |\n| Regelmäßige Datensicherung | Verfügbarkeit | Daten können nach einem Verlust wiederhergestellt werden. |\n| Verschlüsselung der Festplatten | Vertraulichkeit | Unberechtigte können die Daten nicht inhaltlich nutzen. |\n| Zentrale Bearbeitung auf dem Server | Integrität | Es entstehen keine abweichenden Bearbeitungsstände. |\n| Hashwertprüfung bei Installation | Integrität | Eine Veränderung der Datei würde auffallen. |\n\n*(Originalaufgabe: Herbst 2021, Aufgabe 4a.)*",
    loesungsschritte: "",
    haeufige_fehler:
      '- Bei „Begründen Sie" nur das Schutzziel genannt, ohne Begründung → halbe Punktzahl\n- Vertraulichkeit und Integrität verwechselt (Hashwert ist **Integrität**, nicht Vertraulichkeit)\n- Beim asymmetrischen Verfahren mit dem eigenen öffentlichen Schlüssel verschlüsselt\n- Mehr Maßnahmen genannt als verlangt — nur die ersten zählen\n- DSGVO als „Datenschutzgesetz" abgekürzt statt korrekt benannt',
    merksatz:
      "> **Vertraulichkeit = wer darf sehen. Integrität = ist es echt. Verfügbarkeit = komme ich dran.\n> Verschlüsselt wird mit dem öffentlichen Schlüssel des Empfängers.**",
  },
  {
    id: "netzplan",
    title: "Netzplantechnik",
    verstehen:
      "Ein Netzplan wird in **drei getrennten Durchgängen** gerechnet. Wer vermischt, verrechnet sich.\n\n1. **Vorwärts** durch den ganzen Plan: FAZ und FEZ für alle Vorgänge\n2. **Rückwärts** durch den ganzen Plan: SEZ und SAZ für alle Vorgänge\n3. Erst danach die **Puffer**",
    auswendig_wissen:
      "| Kürzel | Bedeutung |\n|---|---|\n| FAZ | frühester Anfangszeitpunkt |\n| FEZ | frühester Endzeitpunkt |\n| SAZ | spätester Anfangszeitpunkt |\n| SEZ | spätester Endzeitpunkt |\n| GP | Gesamtpuffer |\n| FP | freier Puffer |\n\nKnotenaufbau (so steht er in der Prüfung):\n\n```\n FAZ  |  Dauer  |  FEZ\n------+---------+------\n      Vorgang\n------+---------+------\n SAZ  |   GP FP |  SEZ\n```",
    formeln:
      "```\nFEZ = FAZ + Dauer\nFAZ des Nachfolgers = MAXIMUM aller FEZ der Vorgänger\nSAZ = SEZ − Dauer\nSEZ des Vorgängers  = MINIMUM aller SAZ der Nachfolger\nGP  = SAZ − FAZ  =  SEZ − FEZ\nFP  = kleinster FAZ der Nachfolger − FEZ\nKritischer Pfad = alle Vorgänge mit GP = 0\n```\n\nStart: FAZ des ersten Vorgangs = 0.\nEnde: SEZ des letzten Vorgangs = dessen FEZ (= Projektdauer).",
    musteraufgabe:
      "| Vorgang | Dauer | Vorgänger |\n|---|---:|---|\n| A Ist-Analyse | 3 | – |\n| B Soll-Konzept | 4 | A |\n| C Beschaffung | 6 | B |\n| D Verkabelung | 5 | B |\n| E Serverinstallation | 4 | C, D |\n| F Clients einrichten | 3 | E |\n| G Schulung | 2 | F |\n| H Dokumentation | 2 | E |\n| I Abnahme | 1 | G, H |\n\nErmitteln Sie FAZ, FEZ, SAZ, SEZ, GP und FP sowie den kritischen Pfad.",
    loesungsschritte:
      "**Vorwärts:** A 0/3 → B 3/7 → C 7/13, D 7/12 → E beginnt bei max(13; 12) = **13**, endet 17\n→ F 17/20 → G 20/22 → H 17/19 → I beginnt bei max(22; 19) = **22**, endet **23**\n\n**Rückwärts** (Projektdauer 23): I 22/23 → G 20/22, H 20/22 → F 17/20\n→ E endet spätestens bei min(SAZ F; SAZ H) = min(17; 20) = 17, also E 13/17\n→ C 7/13, D 8/13 → B 3/7 → A 0/3\n\n| V | D | FAZ | FEZ | SAZ | SEZ | GP | FP |\n|---|--:|--:|--:|--:|--:|--:|--:|\n| A | 3 | 0 | 3 | 0 | 3 | 0 | 0 |\n| B | 4 | 3 | 7 | 3 | 7 | 0 | 0 |\n| C | 6 | 7 | 13 | 7 | 13 | 0 | 0 |\n| D | 5 | 7 | 12 | 8 | 13 | 1 | 1 |\n| E | 4 | 13 | 17 | 13 | 17 | 0 | 0 |\n| F | 3 | 17 | 20 | 17 | 20 | 0 | 0 |\n| G | 2 | 20 | 22 | 20 | 22 | 0 | 0 |\n| H | 2 | 17 | 19 | 20 | 22 | 3 | 3 |\n| I | 1 | 22 | 23 | 22 | 23 | 0 | 0 |\n\n**Projektdauer 23 Tage · kritischer Pfad A – B – C – E – F – G – I**",
    haeufige_fehler:
      "- Bei mehreren Vorgängern das Minimum statt des **Maximums** genommen\n- Bei mehreren Nachfolgern das Maximum statt des **Minimums** genommen\n- Puffer schon während der Vorwärtsrechnung eingetragen\n- GP und FP verwechselt: GP darf das Projektende nicht verschieben, FP darf zusätzlich den **Nachfolger** nicht verschieben\n- Kritischen Pfad über Vorgänge mit GP > 0 gezogen\n\n## Die schwierigere Variante\n\nIn Frühjahr 2026 war der Netzplan bereits ausgefüllt und enthielt **drei Fehler**.\nVorgehen: jeden Knoten stur gegen die vier Formeln nachrechnen, den ersten abweichenden Wert markieren\nund den korrekten Wert danebenschreiben. Nicht raten, sondern durchrechnen.",
    merksatz: "> **Vorwärts Maximum, rückwärts Minimum. Puffer null heißt kritisch.**",
  },
  {
    id: "netzwerkdiagnose",
    title: "Netzwerkdiagnose, OSI-Modell und Konsolenbefehle",
    verstehen:
      "Die Prüfung will eine **Systematik** sehen, keine Bastellösung: von unten nach oben durch das\nOSI-Modell, und zu jedem vermuteten Fehler ein Befehl, der ihn beweist oder ausschließt.",
    auswendig_wissen:
      "### OSI-Tabelle (die geprüften Zeilen)\n\n| Nr. | Schicht | Protokolle | Adressen | typischer Fehler |\n|---:|---|---|---|---|\n| 7 | Anwendung | HTTP, DNS, DHCP, SMTP, IMAP | – | Serverkonfiguration fehlerhaft |\n| 4 | Transport | TCP, UDP | Ports | Verlust eines Segments, Port blockiert |\n| 3 | Vermittlung | IPv4, IPv6, ICMP | IP-Adressen | falsche IP oder falsches Gateway |\n| 2 | Sicherung | Ethernet, ARP | MAC-Adressen | Netzwerkkarte defekt, VLAN falsch |\n| 1 | Bitübertragung | – | – | Kabel getrennt, Dose nicht gepatcht |\n\n### Befehle und was sie beweisen\n\n| Befehl | Zeigt | beweist Schicht |\n|---|---|---|\n| `ipconfig /all` (Windows) · `ifconfig` / `ip addr` (Linux) | IP, Maske, Gateway, DNS, MAC, DHCP-Status | 2 und 3 |\n| `ping <IP>` | Erreichbarkeit, Antwortzeit, TTL, Paketverlust | 3 |\n| `ping 127.0.0.1` bzw. `ping ::1` | eigener TCP/IP-Stack funktioniert | 3 |\n| `arp -a` | Zuordnung IP → MAC im lokalen Netz | 2 |\n| `nslookup <name>` | Namensauflösung über DNS | 7 |\n| `tracert` / `traceroute` | Weg über die Router, wo es hängt | 3 |\n| `getmac` | MAC-Adresse | 2 |\n| LED an der RJ-45-Buchse | Link vorhanden / Datenverkehr | 1 |\n\n**LED-Deutung:** leuchtet durchgehend = physikalische Verbindung besteht ·\nblinkt unregelmäßig = Datenverkehr · aus = kein Link, Kabel oder Gegenstelle prüfen\n\n### ARP in einem Satz\nARP ermittelt zu einer bekannten **IP-Adresse** die zugehörige **MAC-Adresse** im lokalen Netz,\ndamit das Paket auf Schicht 2 zugestellt werden kann.\n\n### Auffällige Werte in einer ping-Ausgabe\n- **Paketverlust > 0 %** → instabile Verbindung\n- **sehr hohe oder stark schwankende Antwortzeit** (z. B. Mittelwert 466 ms) → Ruckeln,\n  Verbindungsabbrüche, Timeouts\n- **Zeitüberschreitung der Anforderung** → Ziel nicht erreichbar oder ICMP geblockt\n- **TTL** gibt Hinweise auf die Anzahl der Router auf dem Weg\n\n### Adressen richtig deuten\n- **169.254.x.x** = APIPA → kein DHCP-Server erreicht\n- **192.168.x.x / 10.x.x.x / 172.16–31.x.x** = privat, im Internet nicht routbar\n- **fe80::…** = IPv6 Link-Local, wird immer automatisch vergeben",
    formeln: "",
    musteraufgabe:
      'Füllen Sie die Tabelle: Nennen Sie zu jedem möglichen Fehler eine Überprüfung und eine Behebung.\n\n| Möglicher Fehler | Mögliche Überprüfung | Fehlerbehebung |\n|---|---|---|\n| Gateway-Adresse ist falsch | Gateway mit `ipconfig /all` prüfen | korrekte Gateway-Adresse zuweisen (lassen) |\n| Patchkabel defekt | LED an der Netzwerkbuchse prüfen | Netzwerkkabel austauschen |\n| Netzwerkadresse liegt nicht in der richtigen Range | IP mit `ipconfig` prüfen und mit der Vorgabe abgleichen | korrekte Adresse zuweisen (lassen) |\n| Netzwerkdose ist nicht gepatcht | funktionierenden Rechner an der Dose testen oder Kabeltester nutzen | Dose patchen lassen oder Dose wechseln |\n| Namensauflösung funktioniert nicht | `ping` auf eine IP funktioniert, auf den Namen nicht; `nslookup` | DNS-Server prüfen, Ticket aufnehmen |\n\n*(Originalaufgabe: Frühjahr 2026, Aufgabe 2b.)*\n\n## Vorgehen bei „Beschreiben Sie Ihre Vorgehensweise"\n\nImmer als nummerierte Schrittfolge, immer mit dem Befehl, der die Entscheidung trägt:\n\n1. Patchkabel in die erste Buchse stecken und Rechner verbinden\n2. Kommandozeile öffnen\n3. `ipconfig` ausführen und die zugewiesene Adresse ablesen\n4. Adresse mit dem vorgegebenen Netzbereich abgleichen\n5. Passt sie, Buchse entsprechend beschriften\n6. Passt sie nicht, in die zweite Buchse umstecken und ab Schritt 3 wiederholen\n7. Beide Buchsen dauerhaft beschriften\n\n*(Originalaufgabe: Herbst 2024, Aufgabe 1dc.)*',
    loesungsschritte: "",
    haeufige_fehler:
      '- Befehl genannt, aber nicht gesagt, **was** er beweist\n- `ping` als Schicht-2-Werkzeug eingeordnet (es ist Schicht 3)\n- MAC- und IP-Adresse in der Skizze vertauscht\n- Bei der Fehlertabelle Überprüfung und Behebung in dieselbe Spalte geschrieben\n- APIPA-Adresse als „vom DHCP vergeben" beschrieben — sie entsteht gerade **weil** kein DHCP antwortet',
    merksatz:
      "> **Von unten nach oben: Kabel, MAC, IP, Port, Name. Zu jedem Verdacht ein Befehl, der ihn beweist.**",
  },
  {
    id: "raid",
    title: "RAID, NAS, SAN und Speichersysteme",
    verstehen:
      "RAID erhöht **Ausfallsicherheit** oder **Geschwindigkeit** — nicht die Datensicherheit.\nEin RAID ersetzt kein Backup: Wer eine Datei löscht, hat sie auf allen Platten gleichzeitig gelöscht.",
    auswendig_wissen:
      "| Level | Verfahren | Nettokapazität | verkraftet Ausfall von | Zweck |\n|---|---|---|---|---|\n| RAID 0 | Striping | n × k | **keiner Platte** | Geschwindigkeit |\n| RAID 1 | Mirroring | k (bei 2 Platten 50 %) | 1 Platte | Ausfallsicherheit |\n| RAID 5 | Striping + verteilte Parität | (n − 1) × k | 1 Platte | guter Kompromiss |\n| RAID 6 | Striping + doppelte Parität | (n − 2) × k | 2 Platten | hohe Sicherheit |\n| RAID 10 | Spiegelung plus Striping | (n / 2) × k | 1 je Spiegelpaar | schnell und sicher |\n| JBOD | einfache Verkettung | Summe aller Platten | keiner | maximale Kapazität |\n\n`n` = Anzahl Platten · `k` = Kapazität der **kleinsten** Platte\n\n**JBOD gegenüber RAID 0:** kein RAID-Controller nötig · Platten dürfen unterschiedlich groß sein ·\nvolle Kapazität nutzbar · leicht erweiterbar · beim Ausfall einer Platte sind nicht zwingend alle Daten verloren\n\n**NAS vs. SAN**\n- NAS: dateibasiert, hängt am normalen LAN, einfach, für Abteilungen und kleine Umgebungen\n- SAN: blockbasiert, eigenes Speichernetz, hohe Performance und Skalierbarkeit, zentrale Verwaltung,\n  unterbrechungsfreie Erweiterung, für Rechenzentren",
    formeln: "",
    musteraufgabe:
      "Verfügbar sind 2 Festplatten à 3 TB und 7 Festplatten à 2 TB.\nMit **allen** Platten soll eine fehlertolerante RAID-5-Konfiguration mit größtmöglicher\nNettospeicherkapazität erstellt werden. Berechnen Sie die maximale Nettospeicherkapazität in TB.",
    loesungsschritte:
      "1. Insgesamt n = 2 + 7 = **9 Platten**\n2. Bei RAID zählt die **kleinste** gemeinsame Kapazität: k = **2 TB**\n   (von den 3-TB-Platten bleiben je 1 TB ungenutzt)\n3. RAID 5: (9 − 1) × 2 TB = **16 TB**\n\nZum Vergleich als JBOD: 2 × 3 TB + 7 × 2 TB = **20 TB**, aber ohne jede Ausfallsicherheit.\n\n*(Originalaufgabe: Herbst 2022, Aufgabe 2ca und 2cb.)*",
    haeufige_fehler:
      '- Mit der größten statt der **kleinsten** Platte gerechnet\n- Bei RAID 5 „n × k − 1" statt „(n − 1) × k" gerechnet\n- RAID 1 als „doppelte Kapazität" beschrieben statt als Halbierung\n- Behauptet, RAID ersetze ein Backup\n- TB und TiB vermischt: In RAID-Aufgaben stehen meist **TB** (dezimal)',
    merksatz:
      "> **RAID 5 opfert eine Platte, RAID 6 zwei. Immer mit der kleinsten rechnen. RAID ist kein Backup.**",
  },
  {
    id: "stromrechnung",
    title: "Strom, Leistung und Energiekosten",
    verstehen:
      'Vier Formeln decken jede Aufgabe dieser Familie ab. Die einzige echte Hürde ist der **Wirkungsgrad**:\nEin Netzteil zieht mehr aus der Steckdose, als der Rechner verbraucht. Der Rest geht als Wärme verloren.\nDeshalb wird beim Weg „vom Verbrauch zur Steckdose" **geteilt**, nicht multipliziert.',
    auswendig_wissen:
      "- Haushalts-/Bürosteckdose: 230 V\n- Übliche Absicherung einer Mehrfachsteckdose: 16 A → maximal **3.680 W**\n- 80 PLUS: Bronze ≈ 82 %, Gold ≈ 87–90 %, Platinum ≈ 92 %, Titanium ≈ 94 %\n- PoE-Klassen: 802.3af = 15,4 W · 802.3at (PoE+) = 30 W · 802.3bt Type 3 = 60 W · Type 4 = 90 W\n- 1 kWh = 1.000 W über eine Stunde",
    formeln:
      "```\nP [W]      = U [V] × I [A]          →  I = P / U          →  U = P / I\nP_zu [W]   = P_ab [W] / η           (η als Dezimalzahl, z. B. 0,88)\nE [kWh]    = P [kW] × t [h]\nKosten [€] = E [kWh] × Strompreis [€/kWh]\nAmortisation [Perioden] = Mehrpreis / Ersparnis je Periode\n```",
    musteraufgabe:
      "**a)** PC-A hat ein Netzteil ohne Zertifikat (Wirkungsgrad 43 %), PC-B eines nach 80 PLUS Gold (76 %).\nBeide Rechner benötigen im Betrieb 60 W. Betrieb: 9 Stunden an 20 Arbeitstagen pro Monat, 30 Cent/kWh.\nBerechnen Sie die aus dem Netz bezogene Leistung und die Energiekosten pro Monat.\n\n**b)** PC-B kostet 100 EUR mehr. Nach wie vielen Monaten hat sich die Anschaffung amortisiert?",
    loesungsschritte:
      '**a)**\n1. Betriebsstunden: 20 × 9 = **180 h/Monat**\n2. PC-A: 60 W / 0,43 = **139,53 W**\n3. PC-A: 0,13953 kW × 180 h × 0,30 €/kWh = **7,53 €**\n4. PC-B: 60 W / 0,76 = **78,94 W**\n5. PC-B: 0,07894 kW × 180 h × 0,30 €/kWh = **4,26 €**\n\n**b)**\n6. Ersparnis: 7,53 − 4,26 = **3,27 €/Monat**\n7. 100 € / 3,27 €/Monat = 30,58 → **nach 31 Monaten**\n\n*(Originalaufgabe: Herbst 2021, Aufgabe 2a und 2b.)*\n\n## Zweite Variante: Nachweis über die Steckdosenlast\n\nDrei PCs à 180 W, ein Drucker 400 W, eine Kaffeemaschine 1.200 W, ein Klimagerät 2.000 W an einer\nMehrfachsteckdose „maximal 16 A".\n\n- zulässig: 16 A × 230 V = **3.680 W**\n- angeschlossen: 3 × 180 + 400 + 1.200 + 2.000 = **4.140 W**\n- 4.140 W > 3.680 W → **nicht gleichzeitig betreibbar**\n\n*(Originalaufgabe: Herbst 2021, Aufgabe 2d.)*\n\n## Dritte Variante: mit Auslastung\n\nEin PC läuft an 200 Arbeitstagen je 9 Stunden. Das 750-W-Netzteil hat 90 % Wirkungsgrad\nund ist im Schnitt zu 50 % ausgelastet. Strompreis 0,40 €/kWh.\n\n200 × 9 h × (0,750 kW / 0,9) × 0,5 × 0,40 €/kWh = **300,00 €**\n\n*(Originalaufgabe: Frühjahr 2024, Aufgabe 3f.)*',
    haeufige_fehler:
      "- Watt nicht in Kilowatt umgerechnet → Ergebnis um Faktor 1.000 daneben\n- Wirkungsgrad multipliziert statt dividiert\n- Auslastung vergessen\n- Cent und Euro vermischt (30 Cent/kWh = 0,30 €/kWh)\n- Bei der Amortisation abgerundet statt aufgerundet",
    merksatz:
      "> **Netzteil rein = Verbrauch geteilt durch Wirkungsgrad. kW mal Stunden mal Preis.**",
  },
  {
    id: "subnetting",
    title: "Subnetting und IPv4-Adressierung",
    verstehen:
      "Eine IPv4-Adresse hat 32 Bit. Der Präfix (`/26`) sagt, wie viele davon zum **Netz** gehören.\nDer Rest sind **Hostbits**. Aus den Hostbits folgt alles Weitere: Blockgröße, Netzadresse, Broadcast, Anzahl Hosts.",
    auswendig_wissen:
      "| Präfix | Subnetzmaske | Blockgröße | nutzbare Hosts |\n|---|---|---:|---:|\n| /24 | 255.255.255.0 | 256 | 254 |\n| /25 | 255.255.255.128 | 128 | 126 |\n| /26 | 255.255.255.192 | 64 | 62 |\n| /27 | 255.255.255.224 | 32 | 30 |\n| /28 | 255.255.255.240 | 16 | 14 |\n| /29 | 255.255.255.248 | 8 | 6 |\n| /30 | 255.255.255.252 | 4 | 2 |\n\n**Adressbereiche:**\n- privat (nicht im Internet routbar): 10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16\n- **APIPA: 169.254.0.0/16** — Gerät hat keinen DHCP-Server erreicht\n- Loopback: 127.0.0.1",
    formeln:
      "```\nHostbits h        = 32 − Präfix\nnutzbare Hosts    = 2^h − 2        (Netz- und Broadcastadresse fallen weg)\nAnzahl Subnetze   = 2^s            (s = zusätzlich geliehene Bits)\nBlockgröße        = 256 − letzter Oktettwert der Maske\nNetzadresse       = größtes Vielfaches der Blockgröße, das ≤ dem Oktett der IP ist\nBroadcastadresse  = Netzadresse + Blockgröße − 1\nerster Host       = Netzadresse + 1\nletzter Host      = Broadcastadresse − 1\n```",
    musteraufgabe:
      "Der Netzwerkadministrator gibt Ihnen für die erste Kamera die Adresse **192.168.16.52/25** vor.\nErmitteln Sie Subnetzmaske, Anzahl nutzbarer IP-Adressen, Netzadresse und Broadcast-Adresse.",
    loesungsschritte:
      "1. /25 → 25 Netzbits, **7 Hostbits**\n2. Maske: 255.255.255.**128**\n3. Blockgröße: 256 − 128 = **128**\n4. Blöcke im letzten Oktett: 0–127 und 128–255. Die .52 liegt im ersten Block.\n5. **Netzadresse 192.168.16.0**\n6. **Broadcast 192.168.16.127**\n7. Hosts: 2⁷ − 2 = **126**\n\n*(Originalaufgabe: Frühjahr 2026, Aufgabe 2a.)*\n\n**Zweites Beispiel (Frühjahr 2025, 1d):** Netz 192.168.100.0/26.\nHostbereich .1 bis .62, Broadcast .63. Das Gateway nutzt die letzte nutzbare Adresse (.62),\nalso ist die vorletzte **192.168.100.61**.",
    haeufige_fehler:
      '- `2^h` statt `2^h − 2` bei der Hostanzahl\n- Blockgröße falsch bestimmt und dadurch im falschen Block gelandet\n- Broadcast als „letzte Hostadresse" angegeben\n- Bei /25 und größer vergessen, dass das dritte Oktett unverändert bleibt\n- APIPA-Adresse für eine gültige Konfiguration gehalten',
    merksatz:
      "> **Blockgröße = 256 − Maske. Netz ist der Blockanfang, Broadcast das Blockende, dazwischen minus zwei.**",
  },
  {
    id: "wirtschaftsrechnung",
    title: "Wirtschaftsrechnung und Kalkulation",
    verstehen:
      "Der am häufigsten geprüfte Themenbereich überhaupt: In **sieben von acht** ausgewerteten Prüfungen\nkam eine kaufmännische Rechnung vor. Fachlich ist es nur Prozentrechnung und Dreisatz —\ndie Punkte liegen darin, sauber zu strukturieren und den Rechenweg aufzuschreiben.",
    auswendig_wissen:
      "- Umsatzsteuer in Deutschland: **19 %** (ermäßigt 7 %)\n- Brutto = Netto × 1,19 · Netto = Brutto / 1,19\n- Bezugspreis = Listenpreis − Rabatt − Skonto + Bezugskosten\n- Abschreibung linear: Anschaffungswert / Nutzungsdauer\n- Nettoarbeitstage = Arbeitstage − Urlaub − Krankheit − Feiertage",
    formeln:
      "```\nBruttopreis            = Nettopreis × 1,19\nKosten je Monat        = Anschaffung / Nutzungsmonate + laufende Kosten je Monat\nGesamtkosten           = Anschaffung + variable Kosten × Menge + Wartung × Perioden\nEffektiver Stundensatz = Jahreskosten / (Nettoarbeitstage × Stunden je Tag)\nAmortisation           = Mehrkosten / Ersparnis je Periode\nBreak-even (Make/Buy)  = Eigenkosten je Periode / Preis je Einheit\n```",
    musteraufgabe:
      "Fünf CAD-Arbeitsplätze. Monitor 450 EUR (Nutzungsdauer 4 Jahre), PC 720 EUR (3 Jahre),\nSoftwareleasing 50 EUR pro Monat und Arbeitsplatz, Wartungspauschale 1.200 EUR pro Jahr für alle\nGeräte, 5 % Rabatt auf PC und Monitor. Berechnen Sie die laufenden Kosten pro Monat.\n\n### Lösungsschritte\n1. Monitor nach Rabatt: 450 × 0,95 = 427,50 EUR → / 48 Monate = 8,91 EUR/Monat je Platz\n2. PC nach Rabatt: 720 × 0,95 = 684,00 EUR → / 36 Monate = 19,00 EUR/Monat je Platz\n3. Softwareleasing: 50,00 EUR/Monat je Platz\n4. Summe je Platz × 5 Plätze\n5. Wartung: 1.200 / 12 = 100,00 EUR/Monat für alle\n6. Gesamtsumme bilden\n\n*(Originalaufgabe: Frühjahr 2024, Aufgabe 1b.)*\n\n260 Arbeitstage, 7,8 Stunden je Tag, 30 Urlaubstage, 5 Krankheitstage, 5 Feiertage,\nJahreskosten eines Arbeitnehmers 140.000 EUR.\n\n1. Nettoarbeitstage: 260 − 30 − 5 − 5 = **220**\n2. Jahresstunden: 220 × 7,8 = **1.716 h**\n3. 140.000 / 1.716 = **81,59 EUR/h**\n\n*(Originalaufgabe: Herbst 2022, Aufgabe 1e.)*\n\nFremdbezug 25,00 EUR je Lizenz und Jahr. Eigenentwicklung: 12.000 Stunden Personalaufwand,\njährliche Wartung 140 Stunden über 10 Jahre, interner Kostensatz 75 EUR/Stunde.\nAb welcher Lizenzanzahl ist die Eigenentwicklung über 10 Jahre günstiger?\n\n1. Entwicklung: 12.000 × 75 = 900.000 EUR\n2. Wartung: 10 × 140 × 75 = 105.000 EUR\n3. Gesamt: 1.005.000 EUR → pro Jahr 100.500 EUR\n4. 100.500 / 25 = **ab 4.020 Lizenzen**\n\n*(Originalaufgabe: Frühjahr 2022, Aufgabe 4c.)*",
    loesungsschritte: "",
    haeufige_fehler:
      "- Rabatt auf den falschen Posten angewendet (im Beispiel nur auf PC und Monitor, nicht auf Leasing)\n- Nutzungsdauer in Jahren gelassen, obwohl Monatskosten gefragt sind\n- Netto und Brutto vertauscht: Brutto **mal** 1,19, Netto **durch** 1,19\n- Feiertage/Urlaub bei den Nettoarbeitstagen vergessen\n- Ergebnis nicht auf die geforderte Genauigkeit gerundet\n- Rechenweg nicht aufgeschrieben, obwohl ausdrücklich verlangt → Teilpunkte verschenkt",
    merksatz:
      "> **Erst Rabatt, dann Bezugskosten. Anschaffung durch Nutzungsmonate. Brutto ist mal 1,19.**",
  },
];
