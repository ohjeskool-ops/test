# Arabisch lernen – für Kinder

Ruhige Lern-App (Web-App/PWA) für iPad und Tablets, palästinensischer Dialekt. Kategorien: Farben, Zahlen, Tiere, Essen, Gefühle (weibliche Formen), Sinne, Bewegung (Tier-Sätze und Ich-Verben aus dem Arbeitsheft), Gegensätze (Paare: groß/klein, lang/kurz, neu/alt).

## Diese Woche (Start)
Die App startet auf „Diese Woche": der Buchstabe und das Thema der aktuellen Schulwoche, mit einem Tipp spielbar. Eine Woche ist eine Abfolge von Stationen (`units` in `school.js`):
- `letter:<id>` – Buchstabenseite → Nachspuren → „Such den Buchstaben" (neues Feld je Runde, Ablenker aus ähnlicher Gruppe und aus den bisher gelernten Schulbuchstaben)
- `category:<id>` – Lernen → Finden
- `game:<kategorie>/<spiel>` – ein einzelnes Spiel

Unbekannte Einheiten werden übersprungen. Fortschritt und Wochen-Sterne bleiben im Browser gespeichert. Frühere Wochen lassen sich zum Wiederholen öffnen.

**Neue Woche eintragen:** In `school.js` einen Eintrag oben in `LESSONS` ergänzen (und ggf. Fragen in `TALK`) – am `app.js` ändert sich nichts. Die Buchstaben aus `LESSONS` sind automatisch in den Alphabet-Übungen aktiv (im Elternbereich abschaltbar).

## Reiter
- **Lernen**: eine große Karte pro Wort (Bild, Arabisch mit Vokalzeichen, Lautschrift, Deutsch). Antippen = anhören.
- **Finden**: Wort wird vorgesprochen, aus 3 Bildern das richtige antippen. Kein Zeitdruck, Sterne am Ende.
- **Spielen**: In jeder Kategorie dieselben vier Spiele, der Inhalt passt sich dem Thema an:
  - *Such mich!* – aus ~9 Bildern der Kategorie das genannte finden (5 Runden).
  - *Zähl mit!* – Dinge der Kategorie antippen, die App zählt auf Arabisch mit (1–10).
  - *Malen* – ein Spiel im Vollbild mit zwei Phasen, je Thema ein eigenes Bild. **Auftrag:** eine Fläche blinkt, die Farbe wird auf Arabisch gesagt; Farbe antippen, dann die Fläche (fünf Aufträge, Sterne). **Frei:** mit dem Finger malen, der Strich bleibt in der Fläche, in der er beginnt; Pinselgröße, Rückgängig, Löschen. Die Farben sind die Wörter aus der Kategorie Farben.
  - *Extra* nur wo es passt: *Gib mir …* (Zahlen: arabische Zahl hören, genau so viele Dinge antippen), *Welcher Sinn?* (Sinne: Ding dem Körperteil zuordnen) und *Was ist anders?* (Gegensätze: ein Bild + Wort, das Gegenteil finden).
  - Bei den *Gegensätzen* gibt es nur *Such mich!* und *Was ist anders?* (Zählen und Malen passen nicht zu Paaren); Lernen zeigt beide Seiten eines Paares nebeneinander, Finden fragt „Wo ist das große?".
- **Alphabet**: die 28 Buchstaben von rechts nach links. Antippen zeigt die Buchstabenkarte (Name, Laut, Formen allein/Anfang/Mitte/Ende, Beispielwörter mit Zeichnung, erster Buchstabe farbig). Üben: *Hören & Finden* (Name hören, Buchstabe wählen), *Such den Buchstaben* (Feld voller Buchstaben) und *Nachspuren* (Buchstabe blass, mit dem Finger darüberfahren, ohne Prüfung).
- **Elternbereich** (Zahnrad unten in der Seitenleiste, 2 Sekunden halten), Bereiche *Schule* (Hausaufgaben-Checkliste, Gesprächsfragen mit Vorlesen/Aufnahme), *Buchstaben* (welche Buchstaben die Übungen abfragen) und *Aufnahmen*: Wörter und Buchstabennamen mit eigener Stimme aufnehmen, Lautschrift ein/aus, einstellen, welche Buchstaben die Alphabet-Spiele abfragen (z. B. die aus der Schule), Sterne zurücksetzen.

## Inhalte ändern
- Wörter: `data.js`
- Alphabet (Namen, Laute, Beispielwörter): `alphabet.js`
- Schulwochen und Gesprächsfragen: `school.js`
- Zeichnungen und Ausmalbilder (je Kategorie ein Bild in `SCENES`): `art.js`
- Spiele-Logik: `app.js` (Abschnitt „Spielen")

## Auf dem iPad nutzen
Die App wird über GitHub Pages veröffentlicht (Workflow `.github/workflows/pages.yml`, startet bei Push auf `main`).
1. In Safari öffnen → Teilen → „Zum Home-Bildschirm". Danach läuft die App offline und im Vollbild.
2. Für den Fokus: iOS-Einstellungen → Bedienungshilfen → „Geführter Zugriff" sperrt das iPad auf die App.

Lokal testen: `python3 -m http.server 8123` und `http://localhost:8123` öffnen.

## Khait (Prototyp) – `khait/`
Ein zweiter, neu gedachter Zugang unter `/khait/`: Jede Schulwoche ist ein Stickmotiv (Tatreez), fünf kurze Übungen sind fünf Fäden. Die Tagesgrenze (ein neuer Faden pro Tag) ist optional und standardmäßig aus.
- Inhalte der Schulwochen: `khait/lessons.js` (Buchstabe, Thema, Hausaufgaben, Gesprächsfragen, Motiv als 13×13-Raster).
- Nutzt `data.js`, `alphabet.js`, `art.js` und die Eltern-Aufnahmen der bestehenden App mit. Die bestehende App bleibt unverändert.
- Elternbereich: „Eltern“ oben rechts 1 Sekunde halten. Dort auch die Einstellungen.
