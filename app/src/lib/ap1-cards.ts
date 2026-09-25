/**
 * Wissenskarten aus dem Original-AP1-Trainer (1:1 portiert).
 * Jede Karte: [themen-key, frage-html, antwort-html], gefolgt von der
 * id-Ableitung c0, c1, ... wie im Original.
 */
import type { TaskVisual } from "./ap1-tasks";

export interface Card {
  id: string;
  topic: string;
  q: string;
  a: string;
  visual?: TaskVisual;
}

function visualFor(topic: string): TaskVisual | undefined {
  if (topic === "bab") {
    return {
      type: "illustration",
      data: { kind: "bab-flow" },
      alt: "BAB-Ablauf von Gemeinkosten zu Zuschlagssätzen",
    };
  }
  if (topic === "stufenleiter") {
    return {
      type: "illustration",
      data: { kind: "step-down" },
      alt: "Stufenweise Leistungsverrechnung zwischen Kostenstellen",
    };
  }
  if (topic === "erm") {
    return {
      type: "er",
      alt: "ER-Beispiel Kunde und Auftrag in einer 1:n-Beziehung",
      data: {
        entities: [
          {
            id: "kunde",
            name: "KUNDE",
            x: 30,
            y: 60,
            attributes: [{ name: "kunden_id", key: "primary" }, { name: "name" }],
          },
          {
            id: "auftrag",
            name: "AUFTRAG",
            x: 360,
            y: 60,
            attributes: [
              { name: "auftrag_id", key: "primary" },
              { name: "kunden_id", key: "foreign" },
            ],
          },
        ],
        relations: [
          {
            id: "erteilt",
            from: "kunde",
            to: "auftrag",
            label: "erteilt",
            fromCardinality: "1",
            toCardinality: "n",
          },
        ],
      },
    };
  }
  return undefined;
}

export const CARDS: Card[] = [
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
    "gantt",
    "Gantt-Diagramm gegenüber Netzplan — je ein Vorteil?",
    "<b>Gantt:</b> zeigt den zeitlichen Ablauf als Balken sehr anschaulich, gut für die Terminplanung.<br><b>Netzplan:</b> zeigt <b>Abhängigkeiten</b>, Puffer und den kritischen Pfad.",
  ],
  [
    "netzplan",
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
    "erm",
    "Was bedeuten die Kardinalitäten 1:1, 1:n und n:m?",
    "<b>1:1</b> — genau ein Datensatz je Seite.<br><b>1:n</b> — ein Datensatz auf der einen Seite, beliebig viele auf der anderen.<br><b>n:m</b> — viele zu vielen; wird über eine <b>Zwischentabelle</b> aufgelöst.",
  ],
  [
    "erm",
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
  [
    "bab",
    "Wie wird ein Gemeinkostenbetrag im BAB auf Kostenstellen verteilt?",
    "Gemeinkostenbetrag × Anteil des <b>Verteilungsschlüssels</b>. Alle Anteile einer Kostenart müssen zusammen 100 % ergeben.",
  ],
  [
    "bab",
    "Wie lautet die Formel für einen Gemeinkostenzuschlagssatz?",
    "<b>Gemeinkosten ÷ Zuschlagsgrundlage × 100</b>. Die passende Grundlage hängt von der Kostenstelle ab.",
  ],
  [
    "stufenleiter",
    "Was ist die zentrale Regel des Stufenleiterverfahrens?",
    "Eine abgerechnete Hilfskostenstelle ist <b>geschlossen</b>. Spätere Stellen verrechnen keine Leistung mehr an sie zurück.",
  ],
  [
    "stufenleiter",
    "Wie berechnest du den Verrechnungssatz einer Hilfskostenstelle?",
    "Aktuelle Kosten der Hilfskostenstelle ÷ an noch offene Kostenstellen abgegebene Leistungseinheiten.",
  ],

  // Import aus dem NotebookLM-Notebook "Archive of Examination Papers and Solutions
  // 1999-2012", 2026-09-25, KI-generiert. Nur ans Ende anhängen — die IDs (c<n>) werden
  // positional vergeben, ein Umsortieren würde gespeicherten Lernfortschritt verschieben.
  [
    "netzwerk",
    "Welchen Vorteil bietet das Protokoll UDP gegenüber TCP?",
    "Es hat einen geringeren Overhead und damit eine höhere Übertragungsgeschwindigkeit.",
  ],
  [
    "netzwerk",
    "Warum ist TCP für die Übertragung von Webseiten (HTTP) besser geeignet als UDP?",
    "TCP stellt durch Fehlerprüfung und Paketwiederholung eine vollständige und korrekte Datenübertragung sicher.",
  ],
  [
    "netzwerk",
    "Was ist die Hauptaufgabe von Network Address Translation (NAT)?",
    "Die Übersetzung von privaten IPv4-Adressen in eine öffentliche IP-Adresse zur Kommunikation mit dem Internet.",
  ],
  [
    "sicherheit",
    "Erläutere die Funktion von 'Stateful Packet Inspection' (SPI) bei einer Firewall.",
    "SPI überwacht den Zustand aktiver Verbindungen und lässt zugehörige Antwortpakete automatisch passieren.",
  ],
  [
    "netzwerk",
    "Welcher Standard-Port wird für verschlüsselte Webverbindungen via HTTPS verwendet?",
    "Port 443.",
  ],
  [
    "netzwerk",
    "Welchen Dienst stellt ein Server bereit, der auf Port 53 lauscht?",
    "DNS (Domain Name System) zur Namensauflösung.",
  ],
  [
    "subnetting",
    "Aufgabe: Berechne die Dezimalschreibweise der Subnetzmaske für ein Netzwerk mit dem Suffix /27.",
    "Formel: 255.255.255.(256 - 2^(32-n)); Rechnung: 32-27=5, 2^5=32, 256-32=224; Ergebnis: 255.255.255.224; Fehlerfalle: Falsche Berechnung der Bit-Wertigkeit im letzten Oktett.",
  ],
  [
    "subnetting",
    "Aufgabe: Berechne die Netz-ID für die IP-Adresse 203.0.113.180/27.",
    "Formel: Blockgröße = 32; Rechnung: 180 / 32 = 5,625, 5 × 32 = 160; Ergebnis: 203.0.113.160; Fehlerfalle: Host-Anteil nicht genullt oder falsche Blockgröße verwendet.",
  ],
  [
    "netzwerk",
    "Erläutere den Begriff 'VLAN' (Virtual Local Area Network).",
    "Die logische Trennung eines physischen Netzwerks in mehrere voneinander isolierte Broadcast-Domänen.",
  ],
  [
    "netzwerk",
    "Welcher WLAN-Standard nutzt das 5 GHz Band und erreicht Bruttodatenraten im Gbit/s-Bereich?",
    "IEEE 802.11ac.",
  ],
  [
    "raid",
    "Wie viele Festplatten dürfen bei einem RAID 5 Verbund maximal gleichzeitig ausfallen?",
    "Maximal eine Festplatte.",
  ],
  [
    "raid",
    "Welchen Vorteil bietet ein RAID 6 gegenüber einem RAID 5?",
    "Es bietet eine höhere Ausfallsicherheit, da bis zu zwei Festplatten gleichzeitig ausfallen dürfen.",
  ],
  [
    "raid",
    "Aufgabe: Berechne die Nettokapazität eines RAID 5 mit 6 Festplatten zu je 4 TiB.",
    "Formel: (n - 1) × Kapazität; Rechnung: (6 - 1) × 4 = 20; Ergebnis: 20 TiB; Fehlerfalle: Die Kapazität der Paritätsplatte (1 HDD) nicht abgezogen.",
  ],
  [
    "raid",
    "Aufgabe: Berechne die benötigte Anzahl an 4 TiB Festplatten für ein RAID 10 mit 20 TiB Nettokapazität.",
    "Formel: n = (Nettokapazität / HDD-Größe) × 2; Rechnung: (20 / 4) × 2 = 10; Ergebnis: 10 Festplatten; Fehlerfalle: Faktor 2 für die Spiegelung (Mirroring) vergessen.",
  ],
  [
    "raid",
    "Was versteht man unter einer 'Hot-Spare-Festplatte'?",
    "Eine im System eingebaute Reserveplatte, die im Falle eines HDD-Ausfalls automatisch den Platz der defekten Platte einnimmt.",
  ],
  [
    "sicherheit",
    "Nenne den Unterschied zwischen Anonymisierung und Pseudonymisierung laut DSGVO.",
    "Anonymisierung ist unumkehrbar, während bei der Pseudonymisierung ein Personenbezug mittels Zusatzinformationen wiederherstellbar bleibt.",
  ],
  [
    "sicherheit",
    "Welche Maßnahme muss ein Unternehmen ergreifen, wenn Unbefugte Zugriff auf eine Datenbank mit Kundendaten hatten?",
    "Die Meldung des Vorfalls an die zuständige Aufsichtsbehörde (innerhalb von 72 Stunden) und ggf. die Benachrichtigung der Betroffenen.",
  ],
  [
    "sicherheit",
    "Nenne ein Beispiel für eine technische Maßnahme (TOM) zur 'Zutrittskontrolle'.",
    "Einsatz von RFID-Chipkarten oder biometrischen Scannern an der Gebäudetür.",
  ],
  [
    "sicherheit",
    "Nenne ein Beispiel für eine technische Maßnahme (TOM) zur 'Zugriffskontrolle'.",
    "Implementierung eines Berechtigungskonzepts auf Dateiebene oder Datenbankebene.",
  ],
  [
    "sicherheit",
    "Was ist der Zweck einer unterbrechungsfreien Stromversorgung (USV)?",
    "Der Schutz vor Datenverlust und Hardwareschäden durch Überbrückung von Stromausfällen und Glättung von Spannungsspitzen.",
  ],
  [
    "sicherheit",
    "Welcher Verschlüsselungsalgorithmus gilt aktuell als sicher für die Speicherung sensibler Daten: AES-256 oder MD5?",
    "AES-256 (MD5 ist eine veraltete Hash-Funktion und gilt als unsicher).",
  ],
  [
    "sicherheit",
    "Welchen Vorteil hat ein On-Premises-Konzept gegenüber Cloud-Lösungen bezüglich des Datenschutzes?",
    "Die volle Kontrolle über die Daten und die Infrastruktur verbleibt physisch im eigenen Unternehmen.",
  ],
  [
    "sicherheit",
    "Warum sollte man beim Löschen von Datenträgern vor der Entsorgung eine spezielle Software nutzen statt nur zu formatieren?",
    "Weil beim einfachen Formatieren nur das Inhaltsverzeichnis gelöscht wird, die eigentlichen Daten aber rekonstruierbar bleiben.",
  ],
  [
    "daten",
    "Was bewirkt der SQL-Befehl 'ORDER BY Name DESC'?",
    "Er sortiert die Ergebnismenge alphabetisch absteigend nach der Spalte 'Name'.",
  ],
  [
    "daten",
    "Warum schlägt ein 'DELETE'-Statement fehl, wenn die Fehlermeldung 'foreign key constraint fails' erscheint?",
    "Weil der zu löschende Datensatz als Fremdschlüssel in einer anderen Tabelle noch referenziert wird.",
  ],
  [
    "uebertragung",
    "Aufgabe: Berechne den Bandbreitenbedarf für 100 Mitarbeiter, wenn jeder 50 Kbit/s für Telefonie benötigt.",
    "Formel: Teilnehmer × Bedarf; Rechnung: 100 × 50 = 5.000; Ergebnis: 5 Mbit/s; Fehlerfalle: Verwechslung von Kbit/s und Mbit/s (1.000 = 1).",
  ],
  [
    "daten",
    "Was beschreibt das 'Model' im Model-View-Controller (MVC) Entwurfsmuster?",
    "Die Datenhaltung, die Geschäftslogik und die Anwendungsdaten des Systems.",
  ],
  [
    "daten",
    "Welche Aufgabe übernimmt der 'Controller' im MVC-Pattern?",
    "Er nimmt Benutzereingaben entgegen, wertet sie aus und veranlasst Änderungen im Model oder in der View.",
  ],
  [
    "daten",
    "Welches Entwurfsmuster ermöglicht es, dass ein Objekt (Subject) mehrere abhängige Objekte (Observer) automatisch über Zustandsänderungen benachrichtigt?",
    "Observer-Pattern.",
  ],
  [
    "daten",
    "Was versteht man unter 'Datenkapselung' in der Programmierung?",
    "Das Verbergen von Attributen vor direktem Zugriff von außen, um die Datenintegrität durch Methoden (Getter/Setter) zu sichern.",
  ],
  [
    "datenmengen",
    "Erläutere das Prinzip der Lauflängenkodierung (RLE).",
    "Es ist eine verlustfreie Kompressionsmethode, bei der aufeinanderfolgende gleiche Zeichen durch das Zeichen und dessen Anzahl ersetzt werden.",
  ],
  [
    "netzwerk",
    "Welchen Vorteil bietet Glasfaser (LWL) gegenüber Kupferkabeln bei der Vernetzung?",
    "Höhere Übertragungsraten über deutlich größere Distanzen ohne Dämpfung durch elektromagnetische Störungen.",
  ],
  [
    "netzwerk",
    "Was ist der Zweck eines 'Standardgateways' in den Netzwerkeinstellungen?",
    "Die IP-Adresse des Routers, an den Pakete gesendet werden, die für Ziele außerhalb des eigenen Subnetzes bestimmt sind.",
  ],
  [
    "netzwerk",
    "Woran erkennt man im IPv4-Header, ob ein Paket bereits zu viele Router passiert hat?",
    "Am Feld TTL (Time To Live), das bei jedem Router-Hop dekrementiert wird.",
  ],
  [
    "erm",
    "In welcher Normalform befindet sich eine Relation, wenn alle Nicht-Schlüsselattribute vom Primärschlüssel voll funktional abhängig sind?",
    "Zweite Normalform (2NF).",
  ],
  [
    "erm",
    "Wann ist die Dritte Normalform (3NF) erreicht?",
    "Wenn die 2NF erfüllt ist und keine transitiven Abhängigkeiten der Nicht-Schlüsselattribute vom Primärschlüssel vorliegen.",
  ],
  ["netzwerk", "Welchen Port nutzt das Protokoll HTTP im Standard?", "Port 80."],
  [
    "netzwerk",
    "Welcher Dienst wird standardmäßig über Port 25 abgewickelt?",
    "SMTP für den E-Mail-Versand.",
  ],
  [
    "projekt",
    "Nenne zwei Vorteile eines firmeninternen 'Wikis' als Wissensmanagementsystem.",
    "Zentraler Zugriff auf Wissen für alle Mitarbeiter und einfacher Erhalt von Erfahrungswerten bei Personalwechseln.",
  ],
  [
    "projekt",
    "Was ist die Kernfunktion eines Content-Management-Systems (CMS)?",
    "Die gemeinschaftliche Erstellung, Bearbeitung und Organisation von Inhalten ohne Programmierkenntnisse.",
  ],
  [
    "raid",
    "Warum ist ein RAID 10 teurer in der Anschaffung als ein RAID 5 bei gleicher Nettokapazität?",
    "Da bei RAID 10 genau 50% der Bruttokapazität für die Spiegelung verloren gehen, während bei RAID 5 nur eine Platte für Parität benötigt wird.",
  ],
  [
    "sicherheit",
    "Was ist ein 'Full-Backup'?",
    "Eine vollständige Sicherung aller ausgewählten Daten zu einem bestimmten Zeitpunkt.",
  ],
  [
    "sicherheit",
    "Worin besteht der Unterschied zwischen inkrementeller und differenzieller Sicherung?",
    "Inkrementell sichert Änderungen seit der letzten Sicherung, differenziell sichert alle Änderungen seit dem letzten Full-Backup.",
  ],
  [
    "sicherheit",
    "Erläutere den Begriff 'Bring Your Own Device' (BYOD) aus Sicht der IT-Sicherheit.",
    "Die Nutzung privater Endgeräte für geschäftliche Zwecke, was erhöhte Sicherheitsrisiken durch unkontrollierte Software darstellt.",
  ],
  [
    "netzwerk",
    "Welche Hardwarekomponente ist für das Routing zwischen verschiedenen VLANs zuständig?",
    "Ein Layer-3-Switch oder ein Router.",
  ],
  [
    "erm",
    "Was beschreibt die 'Kardinalität' in einem Entity-Relationship-Modell (ERM)?",
    "Das Mengenverhältnis der beteiligten Entitäten in einer Beziehung (z. B. 1:n oder m:n).",
  ],
  [
    "netzwerk",
    "Warum nutzt man SSH anstelle von Telnet für den Remote-Zugriff auf Server?",
    "SSH überträgt Daten und Passwörter verschlüsselt, während Telnet sie im Klartext sendet.",
  ],
  [
    "raid",
    "Aufgabe: Ein NAS benötigt 15 TiB Nettospeicherplatz. Wie viele 3 TiB HDDs sind für ein RAID 5 nötig?",
    "Formel: n = (Nettokapazität / HDD-Kapazität) + 1; Rechnung: (15 / 3) + 1 = 6; Ergebnis: 6 Festplatten; Fehlerfalle: Die zusätzliche Paritätsplatte vergessen.",
  ],
  [
    "ipv6",
    "Wie berechnet man die Anzahl der möglichen Subnetze, wenn man einen IPv6 /48 Präfix auf /52 erweitert?",
    "Formel: 2^(Differenz); Rechnung: 52 - 48 = 4, 2^4 = 16; Ergebnis: 16 Subnetze; Fehlerfalle: Basis 10 statt Basis 2 verwendet.",
  ],
  [
    "sicherheit",
    "Was versteht man unter 'Georedundanz' bei der Datensicherung?",
    "Die Speicherung von Daten an räumlich weit voneinander entfernten Standorten zum Schutz vor Katastrophen am Hauptstandort.",
  ],
  [
    "netzwerk",
    "Welches Protokoll wird verwendet, um E-Mails von einem Server abzurufen, wobei sie auf dem Server verbleiben?",
    "IMAP.",
  ],
  [
    "netzwerk",
    "Was ist der Hauptzweck von DHCP?",
    "Die automatisierte Zuweisung von IP-Adressen und Netzwerkkonfigurationen an Clients in einem Netzwerk.",
  ],
  [
    "netzwerk",
    "Welche Portnummer nutzt das FTP-Protokoll standardmäßig für die Datenübertragung?",
    "Port 20 (Port 21 ist für die Steuerung).",
  ],
  [
    "sicherheit",
    "Welche Gefahr besteht beim Öffnen von E-Mail-Anhängen aus unbekannten Quellen?",
    "Die Infektion des Systems mit Schadsoftware (Malware) wie Viren, Trojanern oder Ransomware.",
  ],
  [
    "sicherheit",
    "Erläutere das Prinzip 'Privacy by Design'.",
    "Der Datenschutz wird bereits bei der Entwicklung von Systemen und Prozessen technisch und organisatorisch berücksichtigt.",
  ],
  [
    "hardware",
    "Welches Bauteil eines Computers führt Berechnungen aus und steuert andere Hardwarekomponenten?",
    "Die CPU (Central Processing Unit).",
  ],
].map(([topic, q, a], i): Card => {
  const visual = visualFor(topic!);
  return { id: "c" + i, topic: topic!, q: q!, a: a!, ...(visual ? { visual } : {}) };
});
