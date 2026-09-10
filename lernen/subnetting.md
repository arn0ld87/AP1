# Subnetting und IPv4-Adressierung

## Das musst du verstehen

Eine IPv4-Adresse hat 32 Bit. Der Präfix (`/26`) sagt, wie viele davon zum **Netz** gehören.
Der Rest sind **Hostbits**. Aus den Hostbits folgt alles Weitere: Blockgröße, Netzadresse, Broadcast, Anzahl Hosts.

## Das musst du auswendig wissen

| Präfix | Subnetzmaske | Blockgröße | nutzbare Hosts |
|---|---|---:|---:|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 |

**Adressbereiche:**
- privat (nicht im Internet routbar): 10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16
- **APIPA: 169.254.0.0/16** — Gerät hat keinen DHCP-Server erreicht
- Loopback: 127.0.0.1

## Formeln

```
Hostbits h        = 32 − Präfix
nutzbare Hosts    = 2^h − 2        (Netz- und Broadcastadresse fallen weg)
Anzahl Subnetze   = 2^s            (s = zusätzlich geliehene Bits)
Blockgröße        = 256 − letzter Oktettwert der Maske
Netzadresse       = größtes Vielfaches der Blockgröße, das ≤ dem Oktett der IP ist
Broadcastadresse  = Netzadresse + Blockgröße − 1
erster Host       = Netzadresse + 1
letzter Host      = Broadcastadresse − 1
```

## Typische Prüfungsaufgabe

Der Netzwerkadministrator gibt Ihnen für die erste Kamera die Adresse **192.168.16.52/25** vor.
Ermitteln Sie Subnetzmaske, Anzahl nutzbarer IP-Adressen, Netzadresse und Broadcast-Adresse.

## Lösungsschritte

1. /25 → 25 Netzbits, **7 Hostbits**
2. Maske: 255.255.255.**128**
3. Blockgröße: 256 − 128 = **128**
4. Blöcke im letzten Oktett: 0–127 und 128–255. Die .52 liegt im ersten Block.
5. **Netzadresse 192.168.16.0**
6. **Broadcast 192.168.16.127**
7. Hosts: 2⁷ − 2 = **126**

*(Originalaufgabe: Frühjahr 2026, Aufgabe 2a.)*

**Zweites Beispiel (Frühjahr 2025, 1d):** Netz 192.168.100.0/26.
Hostbereich .1 bis .62, Broadcast .63. Das Gateway nutzt die letzte nutzbare Adresse (.62),
also ist die vorletzte **192.168.100.61**.

## Häufige Fehler

- `2^h` statt `2^h − 2` bei der Hostanzahl
- Blockgröße falsch bestimmt und dadurch im falschen Block gelandet
- Broadcast als „letzte Hostadresse" angegeben
- Bei /25 und größer vergessen, dass das dritte Oktett unverändert bleibt
- APIPA-Adresse für eine gültige Konfiguration gehalten

## Merksatz

> **Blockgröße = 256 − Maske. Netz ist der Blockanfang, Broadcast das Blockende, dazwischen minus zwei.**
