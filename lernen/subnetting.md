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
| /31 | 255.255.255.254 | 2 | 2 (Sonderfall, s. u.) |
| /32 | 255.255.255.255 | 1 | 1 (Sonderfall, s. u.) |

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

## Sonderfälle /31 und /32 — hier gilt `2^h − 2` NICHT

Die Formel „nutzbare Hosts = 2^h − 2" setzt voraus, dass es eine eigene Netz- und eine eigene
Broadcastadresse gibt, die von den nutzbaren Hosts abgezogen werden. Bei den beiden kleinsten
Präfixen stimmt diese Annahme nicht mehr:

- **/31 (RFC 3021):** 1 Hostbit, Blockgröße 2. Die Formel würde `2^1 − 2 = 0` liefern — also gar
  keine nutzbare Adresse. Für **Punkt-zu-Punkt-Verbindungen** (z. B. die WAN-Strecke zwischen zwei
  Routern) definiert RFC 3021 deshalb einen Sonderfall: Es gibt **keine** eigene Netz- oder
  Broadcastadresse, **beide** Adressen des Blocks sind nutzbare Hostadressen. Nutzbare Hosts: **2**.
- **/32 (Hostroute):** 0 Hostbits, Blockgröße 1. Die Formel würde `2^0 − 2 = −1` liefern — negativ,
  also offensichtlich unsinnig. Eine /32-Maske adressiert **kein Subnetz**, sondern **genau einen
  einzelnen Host** (typisch in Routingtabellen als „Hostroute", z. B. `ip route 10.0.0.5
  255.255.255.255 …`). Es gibt keine Netz- oder Broadcastadresse, nutzbare Adressen: **1**.

Da bei beiden Präfixen weder Netz- noch Broadcast- noch „letzte nutzbare Hostadresse" existieren,
sind bei /31 und /32 in der Prüfung sinnvollerweise nur **Subnetzmaske** und **Anzahl nutzbarer
Hosts** gefragt — nicht Netz-/Broadcastadresse.

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
- Bei /31 die Formel `2^h − 2` blind angewendet (ergäbe 0 statt der korrekten 2 nutzbaren Hosts)
- Bei /32 nach einer Netz- oder Broadcastadresse gesucht, die es dort gar nicht gibt

## Merksatz

> **Blockgröße = 256 − Maske. Netz ist der Blockanfang, Broadcast das Blockende, dazwischen minus zwei — außer bei /31 (2 nutzbare Hosts, RFC 3021) und /32 (Hostroute, 1 Adresse).**
