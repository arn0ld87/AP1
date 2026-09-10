# Netzwerkdiagnose, OSI-Modell und Konsolenbefehle

## Das musst du verstehen

Die Prüfung will eine **Systematik** sehen, keine Bastellösung: von unten nach oben durch das
OSI-Modell, und zu jedem vermuteten Fehler ein Befehl, der ihn beweist oder ausschließt.

## Das musst du auswendig wissen

### OSI-Tabelle (die geprüften Zeilen)

| Nr. | Schicht | Protokolle | Adressen | typischer Fehler |
|---:|---|---|---|---|
| 7 | Anwendung | HTTP, DNS, DHCP, SMTP, IMAP | – | Serverkonfiguration fehlerhaft |
| 4 | Transport | TCP, UDP | Ports | Verlust eines Segments, Port blockiert |
| 3 | Vermittlung | IPv4, IPv6, ICMP | IP-Adressen | falsche IP oder falsches Gateway |
| 2 | Sicherung | Ethernet, ARP | MAC-Adressen | Netzwerkkarte defekt, VLAN falsch |
| 1 | Bitübertragung | – | – | Kabel getrennt, Dose nicht gepatcht |

### Befehle und was sie beweisen

| Befehl | Zeigt | beweist Schicht |
|---|---|---|
| `ipconfig /all` (Windows) · `ifconfig` / `ip addr` (Linux) | IP, Maske, Gateway, DNS, MAC, DHCP-Status | 2 und 3 |
| `ping <IP>` | Erreichbarkeit, Antwortzeit, TTL, Paketverlust | 3 |
| `ping 127.0.0.1` bzw. `ping ::1` | eigener TCP/IP-Stack funktioniert | 3 |
| `arp -a` | Zuordnung IP → MAC im lokalen Netz | 2 |
| `nslookup <name>` | Namensauflösung über DNS | 7 |
| `tracert` / `traceroute` | Weg über die Router, wo es hängt | 3 |
| `getmac` | MAC-Adresse | 2 |
| LED an der RJ-45-Buchse | Link vorhanden / Datenverkehr | 1 |

**LED-Deutung:** leuchtet durchgehend = physikalische Verbindung besteht ·
blinkt unregelmäßig = Datenverkehr · aus = kein Link, Kabel oder Gegenstelle prüfen

### ARP in einem Satz
ARP ermittelt zu einer bekannten **IP-Adresse** die zugehörige **MAC-Adresse** im lokalen Netz,
damit das Paket auf Schicht 2 zugestellt werden kann.

### Auffällige Werte in einer ping-Ausgabe
- **Paketverlust > 0 %** → instabile Verbindung
- **sehr hohe oder stark schwankende Antwortzeit** (z. B. Mittelwert 466 ms) → Ruckeln,
  Verbindungsabbrüche, Timeouts
- **Zeitüberschreitung der Anforderung** → Ziel nicht erreichbar oder ICMP geblockt
- **TTL** gibt Hinweise auf die Anzahl der Router auf dem Weg

### Adressen richtig deuten
- **169.254.x.x** = APIPA → kein DHCP-Server erreicht
- **192.168.x.x / 10.x.x.x / 172.16–31.x.x** = privat, im Internet nicht routbar
- **fe80::…** = IPv6 Link-Local, wird immer automatisch vergeben

## Typische Prüfungsaufgabe

Füllen Sie die Tabelle: Nennen Sie zu jedem möglichen Fehler eine Überprüfung und eine Behebung.

| Möglicher Fehler | Mögliche Überprüfung | Fehlerbehebung |
|---|---|---|
| Gateway-Adresse ist falsch | Gateway mit `ipconfig /all` prüfen | korrekte Gateway-Adresse zuweisen (lassen) |
| Patchkabel defekt | LED an der Netzwerkbuchse prüfen | Netzwerkkabel austauschen |
| Netzwerkadresse liegt nicht in der richtigen Range | IP mit `ipconfig` prüfen und mit der Vorgabe abgleichen | korrekte Adresse zuweisen (lassen) |
| Netzwerkdose ist nicht gepatcht | funktionierenden Rechner an der Dose testen oder Kabeltester nutzen | Dose patchen lassen oder Dose wechseln |
| Namensauflösung funktioniert nicht | `ping` auf eine IP funktioniert, auf den Namen nicht; `nslookup` | DNS-Server prüfen, Ticket aufnehmen |

*(Originalaufgabe: Frühjahr 2026, Aufgabe 2b.)*

## Vorgehen bei „Beschreiben Sie Ihre Vorgehensweise"

Immer als nummerierte Schrittfolge, immer mit dem Befehl, der die Entscheidung trägt:

1. Patchkabel in die erste Buchse stecken und Rechner verbinden
2. Kommandozeile öffnen
3. `ipconfig` ausführen und die zugewiesene Adresse ablesen
4. Adresse mit dem vorgegebenen Netzbereich abgleichen
5. Passt sie, Buchse entsprechend beschriften
6. Passt sie nicht, in die zweite Buchse umstecken und ab Schritt 3 wiederholen
7. Beide Buchsen dauerhaft beschriften

*(Originalaufgabe: Herbst 2024, Aufgabe 1dc.)*

## Häufige Fehler

- Befehl genannt, aber nicht gesagt, **was** er beweist
- `ping` als Schicht-2-Werkzeug eingeordnet (es ist Schicht 3)
- MAC- und IP-Adresse in der Skizze vertauscht
- Bei der Fehlertabelle Überprüfung und Behebung in dieselbe Spalte geschrieben
- APIPA-Adresse als „vom DHCP vergeben" beschrieben — sie entsteht gerade **weil** kein DHCP antwortet

## Merksatz

> **Von unten nach oben: Kabel, MAC, IP, Port, Name. Zu jedem Verdacht ein Befehl, der ihn beweist.**
