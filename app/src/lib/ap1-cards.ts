/**
 * Wissenskarten aus dem Original-AP1-Trainer (1:1 portiert).
 * Jede Karte: [themen-key, frage-html, antwort-html], gefolgt von der
 * id-Ableitung c0, c1, ... wie im Original.
 */
export interface Card {
  id: string;
  topic: string;
  q: string;
  a: string;
}

export const CARDS = [
  [
    "sicherheit",
    "Welche drei Schutzziele der Informationssicherheit gibt es, und was fragt jedes ab?",
    "<b>Vertraulichkeit</b> — wer darf es sehen?<br><b>Integrität</b> — ist es unverändert?<br><b>Verfügbarkeit</b> — komme ich dran?",
  ],
  [
    "sicherheit",
    "Ordne zu: Festplattenverschlüsselung, tägliches Backup, Hashwertprüfung, USV.",
    "<ul><li>Festplattenverschlüsselung → Vertraulichkeit</li><li>Tägliches Backup → Verfügbarkeit</li><li>Hashwertprüfung → Integrität</li><li>USV → Verfügbarkeit</li></ul>",
  ],
  [
    "sicherheit",
    "Wozu dient ein Hashwert beim Softwaredownload?",
    "Zur <b>Integritätsprüfung</b>. Der selbst berechnete Hash wird mit dem veröffentlichten verglichen. Stimmen beide überein, wurde die Datei weder beschädigt noch manipuliert.",
  ],
  [
    "sicherheit",
    "Beschreibe den Ablauf, wenn du jemandem eine vertraulich verschlüsselte E-Mail schickst.",
    "<ul><li>Der Empfänger schickt dir seinen <b>öffentlichen</b> Schlüssel.</li><li>Du verschlüsselst mit dem <b>öffentlichen Schlüssel des Empfängers</b>.</li><li>Die Mail wird übertragen.</li><li>Der Empfänger entschlüsselt mit seinem <b>privaten</b> Schlüssel.</li></ul>Erreichtes Schutzziel: Vertraulichkeit.",
  ],
  [
    "sicherheit",
    "Ein Vorteil und ein Nachteil der asymmetrischen gegenüber der symmetrischen Verschlüsselung?",
    "<b>Vorteil:</b> Der geheime Schlüssel muss nie übertragen werden — kein Problem des sicheren Schlüsselaustauschs.<br><b>Nachteil:</b> deutlich rechenintensiver und damit langsamer.",
  ],
  [
    "sicherheit",
    "Nenne fünf Malware-Arten mit je einem Merkmal.",
    "<ul><li><b>Virus</b> — hängt sich an ein Wirtsprogramm</li><li><b>Wurm</b> — verbreitet sich selbstständig übers Netz</li><li><b>Trojaner</b> — versteckt in nützlicher Software</li><li><b>Ransomware</b> — verschlüsselt Daten, fordert Lösegeld</li><li><b>Keylogger / Spyware</b> — späht Eingaben und Verhalten aus</li></ul>",
  ],
  [
    "sicherheit",
    "Drei Anzeichen für eine Phishing-Mail?",
    "Unpersönliche Anrede · Druck und Drohung · Rechtschreibfehler · Absenderadresse passt nicht zur Organisation · Linkziel weicht vom Anzeigetext ab · unerwarteter Anhang · Aufforderung zur Eingabe von Zugangsdaten.",
  ],
  [
    "sicherheit",
    "Warum sollen Anwender keine Administratorrechte haben?",
    "Weil dann auch <b>Schadsoftware mit vollen Rechten läuft</b> und Systemdateien ändern, Schutzfunktionen abschalten und sich im Netz ausbreiten kann. Prinzip der minimalen Rechtevergabe: Adminrechte nur bei Bedarf und zeitlich begrenzt.",
  ],
  [
    "sicherheit",
    "Was ist beim Backup auf externe Festplatten zu beachten?",
    "<ul><li><b>Räumliche und zeitliche Trennung</b> vom Original</li><li>Mehrere Datenträger im Wechsel — <b>Generationenprinzip</b> (Großvater-Vater-Sohn)</li><li>Datenträger verschlüsseln</li><li>Rücksicherung regelmäßig <b>testen</b></li></ul>",
  ],
  [
    "sicherheit",
    "Welche rechtliche Grundlage schützt personenbezogene Daten, und wozu?",
    "<b>DSGVO</b>, ergänzend das <b>BDSG</b>. Sie schützt personenbezogene Daten vor unbefugter Erhebung, Verarbeitung, Veränderung und Weitergabe und gibt Betroffenen Rechte auf Auskunft, Berichtigung und Löschung.",
  ],
  [
    "sicherheit",
    "Was ist ein VPN, in einem Satz?",
    "Ein VPN baut über ein unsicheres Netz einen <b>verschlüsselten Tunnel</b> auf, sodass ein Client so arbeiten kann, als wäre er im Firmennetz.",
  ],

  [
    "netzwerk",
    "Welcher Befehl zeigt IP, Maske, Gateway, DNS und MAC — und welche OSI-Schichten belegt er damit?",
    "<code>ipconfig /all</code> (Windows) bzw. <code>ifconfig</code> / <code>ip addr</code> (Linux). Belegt Schicht <b>2</b> (MAC) und <b>3</b> (IP).",
  ],
  [
    "netzwerk",
    "Was beweist ein erfolgreicher <code>ping</code> — und was nicht?",
    "Er beweist Erreichbarkeit auf <b>Schicht 3</b>. Er beweist <b>nicht</b>, dass ein Dienst läuft oder die Namensauflösung funktioniert.",
  ],
  [
    "netzwerk",
    "Wofür ist <code>nslookup</code> da?",
    "Für die <b>Namensauflösung</b> über DNS — also OSI-Schicht 7. Typischer Test: <code>ping</code> auf die IP klappt, auf den Namen nicht → DNS-Problem.",
  ],
  [
    "netzwerk",
    "Erkläre die Aufgabe von ARP in einem Satz.",
    "ARP ermittelt zu einer bekannten <b>IP-Adresse</b> die zugehörige <b>MAC-Adresse</b> im lokalen Netz, damit das Paket auf Schicht 2 zugestellt werden kann.",
  ],
  [
    "netzwerk",
    "OSI-Schichten 1, 2, 3, 4 und 7 — Name, Adresse, typischer Fehler.",
    "<ul><li><b>7 Anwendung</b> — keine Adresse — Serverkonfiguration fehlerhaft</li><li><b>4 Transport</b> — Ports — Segment verloren</li><li><b>3 Vermittlung</b> — IP-Adressen — falsche IP oder Gateway</li><li><b>2 Sicherung</b> — MAC-Adressen — Netzwerkkarte defekt</li><li><b>1 Bitübertragung</b> — keine Adresse — Medium getrennt</li></ul>",
  ],
  [
    "netzwerk",
    "Ein PC zeigt 169.254.87.13, obwohl ein DHCP-Server läuft. Was bedeutet das?",
    "Die Adresse stammt aus dem <b>APIPA-Bereich 169.254.0.0/16</b>. Das System hat sie sich selbst vergeben, weil <b>kein DHCP-Server erreichbar</b> war. Ursachen: DHCP ausgefallen, Kabel nicht gesteckt, Dose nicht gepatcht, Adressbereich erschöpft.",
  ],
  [
    "netzwerk",
    "Welche IPv4-Bereiche sind privat?",
    "<code>10.0.0.0/8</code> · <code>172.16.0.0/12</code> · <code>192.168.0.0/16</code><br>Sie werden im Internet nicht geroutet und sind von außen nicht direkt erreichbar. Zugriff nach außen nur über NAT.",
  ],
  [
    "netzwerk",
    "Was sagt eine dauerhaft leuchtende gegenüber einer unregelmäßig blinkenden LED an der RJ-45-Buchse?",
    "Dauerhaft leuchtend = <b>physikalische Verbindung besteht</b> (Link). Unregelmäßig blinkend = <b>Datenverkehr</b>. Aus = kein Link, Kabel oder Gegenstelle prüfen.",
  ],
  [
    "netzwerk",
    "Eine ping-Statistik zeigt 0 % Verlust, aber 512 ms Mittelwert. Kritisch?",
    "Ja. Der kritische Wert ist die <b>Antwortzeit</b>. Folge: spürbare Verzögerungen, Timeouts bei Datenbankzugriffen, ruckelnde Übertragungen, abbrechende Sitzungen.",
  ],
  [
    "netzwerk",
    "Fehler → Überprüfung → Behebung: „Die Netzwerkdose ist nicht gepatcht.“",
    "<b>Überprüfung:</b> funktionierenden Rechner an der Dose anschließen oder Kabeltester/Network-Analyzer einsetzen, Patchfeld kontrollieren.<br><b>Behebung:</b> Dose im Patchfeld auflegen lassen oder eine andere Dose nutzen.",
  ],

  [
    "ipv6",
    "Wie lang ist eine IPv6-Adresse, und wie ist sie aufgebaut?",
    "<b>128 Bit</b>, hexadezimal in 8 Blöcken à 16 Bit, getrennt durch Doppelpunkte. Bei /64: erste 64 Bit Netz, letzte 64 Bit <b>Interface-Identifier</b>.",
  ],
  [
    "ipv6",
    "Kürzungsregeln für IPv6?",
    "Führende Nullen im Block weglassen. <b>Eine</b> zusammenhängende Folge von Nullblöcken durch <code>::</code> ersetzen — nur einmal pro Adresse.",
  ],
  [
    "ipv6",
    "Schreibe <code>2001:db8:4f1a:27::8a2</code> ungekürzt.",
    "<code>2001:0db8:4f1a:0027:0000:0000:0000:08a2</code>",
  ],
  [
    "ipv6",
    "Was ist <code>fe80::…</code> und woher kommt die Adresse?",
    "Eine <b>Link-Local-Adresse</b> aus <code>fe80::/10</code>. Jedes IPv6-fähige Interface erzeugt sie automatisch selbst (SLAAC). Sie gilt nur im lokalen Segment und wird nicht geroutet.",
  ],
  [
    "ipv6",
    "Zwei Wege, IPv4 und IPv6 parallel zu betreiben?",
    "<b>Dual-Stack:</b> Geräte haben gleichzeitig eine IPv4- und eine IPv6-Adresse.<br><b>Tunneling:</b> IPv6-Pakete werden in IPv4-Pakete gekapselt und über das bestehende Netz transportiert.",
  ],

  [
    "hardware",
    "Nenne drei Vorteile einer SSD gegenüber einer HDD.",
    "Kürzere Zugriffszeiten und höhere Datenrate · keine beweglichen Teile, unempfindlich gegen Erschütterungen · geringerer Energieverbrauch · geräuschlos · leichter und kompakter.",
  ],
  [
    "hardware",
    "Zwei DDR4-Riegel sollen im Dual-Channel laufen. Worauf achten?",
    "Im Handbuch die <b>Kanalbelegung</b> nachsehen (z. B. A1 und B1 oder A2 und B2) und die Riegel farblich passend paaren. Beide Riegel sollten <b>gleiche Größe</b> und Spezifikation haben.",
  ],
  [
    "hardware",
    "Ein Laptop hat DDR4-3200. Passt ein DDR5-6000-Riegel?",
    "Nein. <b>DDR5 ist mechanisch und elektrisch inkompatibel</b> zu DDR4-Slots. Ein DDR4-Riegel mit höherem Takt passt zwar, läuft aber nur mit dem niedrigeren Takt des Systems.",
  ],
  [
    "hardware",
    "PoE: Welche Leistung liefern 802.3af, 802.3at und 802.3bt?",
    "<code>802.3af</code> bis <b>15,4 W</b> · <code>802.3at</code> (PoE+) bis <b>30 W</b> · <code>802.3bt</code> Type 3 bis <b>60 W</b>, Type 4 bis <b>90 W</b>.",
  ],
  [
    "hardware",
    "Wie dimensionierst du ein Netzteil?",
    "Maximale Leistungsaufnahme aller Komponenten addieren, den geforderten <b>Puffer</b> aufschlagen (z. B. 10–15 %) und die <b>nächsthöhere</b> verfügbare Stufe wählen.",
  ],
  [
    "hardware",
    "Wozu dient Wärmeleitpaste zwischen CPU und Kühler?",
    "Sie gleicht kleine Unebenheiten der Kontaktflächen aus. Luft in diesen Spalten wäre ein schlechter Wärmeleiter — die Paste verbessert den Wärmeübergang.",
  ],

  [
    "projekt",
    "Vier Merkmale eines Projekts?",
    "Einmaligkeit · klare Zielvorgabe · zeitliche Begrenzung · begrenzte Ressourcen · eigene Projektorganisation · Komplexität.",
  ],
  [
    "projekt",
    "Wofür stehen die SMART-Kriterien?",
    "<b>S</b>pecific — spezifisch<br><b>M</b>easurable — messbar<br><b>A</b>ccepted / attainable — akzeptiert, erreichbar<br><b>R</b>easonable — realistisch<br><b>T</b>ime-bound — terminiert",
  ],
  [
    "projekt",
    "Lastenheft oder Pflichtenheft — wer schreibt was?",
    "Das <b>Lastenheft</b> schreibt der <b>Auftraggeber</b>: Anforderungen und Erwartungen, also das <b>„Was“</b>.<br>Das <b>Pflichtenheft</b> schreibt der <b>Auftragnehmer</b>: die technische Umsetzung, also das <b>„Wie“</b>.",
  ],
  [
    "projekt",
    "Fünf typische Inhalte eines Lastenhefts?",
    "Kurzvorstellung des Auftraggebers · Projektziel · Beschreibung der bestehenden IT-Infrastruktur · funktionale Anforderungen · Zeitrahmen · Anforderungen an IT-Sicherheit und Datenschutz · Abnahmekriterien.",
  ],
  [
    "projekt",
    "Gantt-Diagramm gegenüber Netzplan — je ein Vorteil?",
    "<b>Gantt:</b> zeigt den zeitlichen Ablauf als Balken sehr anschaulich, gut für die Terminplanung.<br><b>Netzplan:</b> zeigt <b>Abhängigkeiten</b>, Puffer und den kritischen Pfad.",
  ],
  [
    "projekt",
    "Wie erkennst du den kritischen Pfad?",
    "An allen Vorgängen mit <b>Gesamtpuffer GP = 0</b>. Eine Verzögerung dort verschiebt unmittelbar das Projektende.",
  ],

  [
    "recht",
    "Wann kommt ein Kaufvertrag zustande?",
    "Durch <b>zwei übereinstimmende Willenserklärungen</b> — Antrag und Annahme. Fehlt eine Auftragsbestätigung, gilt die Lieferung als Annahme durch schlüssiges Handeln.",
  ],
  [
    "recht",
    "Nenne zwei Kaufvertragsstörungen und je eine Gegenmaßnahme.",
    "<b>Lieferverzug</b> → Liefertermin vertraglich fixieren, Vertragsstrafe vereinbaren, mahnen.<br><b>Mangelhafte Lieferung</b> → Ware unverzüglich prüfen, Qualitätsanforderungen im Vertrag festhalten.",
  ],
  [
    "recht",
    "Welche Rechte hat ein Kunde bei Lieferverzug?",
    "Auf Lieferung bestehen · nach Fristsetzung vom Vertrag zurücktreten · <b>Schadensersatz</b> für den entstandenen Verzugsschaden verlangen.",
  ],
  [
    "recht",
    "Drei Vorteile der Beschaffung über Leasing?",
    "Planbare, gleichbleibende Kosten · keine hohe Anfangsinvestition, Liquidität bleibt erhalten · stets aktuelle Technik · Wartung oft im Vertrag enthalten · Raten als Betriebsausgaben absetzbar.",
  ],
  [
    "recht",
    "Dienstvertrag oder Werkvertrag — worin liegt der Unterschied?",
    "Beim <b>Dienstvertrag</b> wird das <b>Tätigwerden</b> geschuldet (z. B. Beratung nach Stunden).<br>Beim <b>Werkvertrag</b> wird ein <b>Ergebnis</b> geschuldet (z. B. ein fertig installiertes Netzwerk).",
  ],

  [
    "daten",
    "Was bedeuten die Kardinalitäten 1:1, 1:n und n:m?",
    "<b>1:1</b> — genau ein Datensatz je Seite.<br><b>1:n</b> — ein Datensatz auf der einen Seite, beliebig viele auf der anderen.<br><b>n:m</b> — viele zu vielen; wird über eine <b>Zwischentabelle</b> aufgelöst.",
  ],
  [
    "daten",
    "Wie kennzeichnest du Primär- und Fremdschlüssel im ERM?",
    "Der <b>Primärschlüssel</b> wird unterstrichen (oder mit PK markiert). Der <b>Fremdschlüssel</b> bekommt ein nachgestelltes Hash-Zeichen <code>#</code> (oder FK).",
  ],
  [
    "daten",
    "SQL: Anzahl der Aufträge je Status?",
    "<code>SELECT Status, COUNT(*) AS Anzahl<br>FROM Auftrag<br>GROUP BY Status;</code>",
  ],
  [
    "daten",
    "SQL: Summe aller Beträge mit Status „offen“?",
    "<code>SELECT SUM(Betrag)<br>FROM Auftrag<br>WHERE Status = 'offen';</code>",
  ],
  [
    "daten",
    "SQL: Anzahl verschiedener Kunden in der Tabelle Ticket?",
    "<code>SELECT COUNT(DISTINCT KundenID)<br>FROM Ticket;</code>",
  ],
  [
    "daten",
    "Was sind Redundanzen, und welches Problem entsteht daraus?",
    "Mehrfach gespeicherte identische Informationen. Hauptproblem ist die <b>Inkonsistenz</b>: Wird nur eine Stelle geändert, widersprechen sich die Datensätze und Auswertungen werden falsch. Dazu unnötiger Speicherbedarf und Pflegeaufwand.",
  ],
  [
    "daten",
    "Compiler oder Interpreter — wo liegt der Unterschied?",
    "Der <b>Compiler</b> übersetzt den gesamten Quelltext einmal vorab in Maschinencode; das Programm läuft danach eigenständig und schnell.<br>Der <b>Interpreter</b> übersetzt und führt zur Laufzeit Anweisung für Anweisung aus — flexibler, aber langsamer.",
  ],
  [
    "daten",
    "Wie gehst du einen Schreibtischtest an?",
    "Eine <b>Wertetabelle</b> anlegen und Zeile für Zeile durchgehen, jeden Zwischenwert notieren. Nicht im Kopf rechnen. Besonders auf <code>&gt;=</code> gegenüber <code>&gt;</code> und auf <code>SONST WENN</code> achten — dort greift nur <b>ein</b> Zweig.",
  ],
  [
    "daten",
    "Zwei Vorteile objektorientierter gegenüber prozeduraler Programmierung?",
    "Wiederverwendbarkeit durch Klassen und Vererbung · Kapselung schützt Daten vor unkontrolliertem Zugriff · bessere Wartbarkeit großer Programme · realitätsnähere Modellierung.",
  ],
].map((c, i) => ({ id: "c" + i, topic: c[0], q: c[1], a: c[2] }));
