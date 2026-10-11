# Arabisch lernen – für Kinder

Ruhige Lern-App (Web-App/PWA) für iPad und Tablets, palästinensischer Dialekt. Kategorien: Farben, Zahlen, Tiere, Essen, Gefühle (weibliche Formen), Sinne, Bewegung (Sätze aus dem Arbeitsheft).

## Reiter
- **Lernen**: eine große Karte pro Wort (Bild, Arabisch mit Vokalzeichen, Lautschrift, Deutsch). Antippen = anhören.
- **Finden**: Wort wird vorgesprochen, aus 3 Bildern das richtige antippen. Kein Zeitdruck, Sterne am Ende.
- **Spielen**: In jeder Kategorie dieselben vier Spiele, der Inhalt passt sich dem Thema an:
  - *Such mich!* – aus ~9 Bildern der Kategorie das genannte finden (5 Runden).
  - *Zähl mit!* – Dinge der Kategorie antippen, die App zählt auf Arabisch mit (1–10).
  - *Ausmalen* – Bild zum Thema, Farbe antippen (arabischer Farbname wird gesprochen), dann Flächen antippen.
  - *Finger-Malen* – dasselbe Bild, frei mit dem Finger malen; die Farbe bleibt in der Fläche, in der der Strich beginnt. Pinselgröße, Rückgängig und Löschen.
  - *Extra* nur wo es passt: *Gib mir …* (Zahlen: arabische Zahl hören, genau so viele Dinge antippen) und *Welcher Sinn?* (Sinne: Ding dem Körperteil zuordnen).
- **Alphabet**: die 28 Buchstaben von rechts nach links. Antippen zeigt die Buchstabenkarte (Name, Laut, Formen allein/Anfang/Mitte/Ende, Beispielwörter mit Zeichnung, erster Buchstabe farbig). Üben: *Hören & Finden* (Name hören, Buchstabe wählen), *Such den Buchstaben* (Feld voller Buchstaben) und *Nachspuren* (Buchstabe blass, mit dem Finger darüberfahren, ohne Prüfung).
- **Elternbereich** (Zahnrad unten in der Seitenleiste, 2 Sekunden halten): Wörter und Buchstabennamen mit eigener Stimme aufnehmen, Lautschrift ein/aus, einstellen, welche Buchstaben die Alphabet-Spiele abfragen (z. B. die aus der Schule), Sterne zurücksetzen.

## Inhalte ändern
- Wörter: `data.js`
- Alphabet (Namen, Laute, Beispielwörter): `alphabet.js`
- Zeichnungen und Ausmalbilder (je Kategorie ein Bild in `SCENES`): `art.js`
- Spiele-Logik: `app.js` (Abschnitt „Spielen")

## Auf dem iPad nutzen
Die App wird über GitHub Pages veröffentlicht (Workflow `.github/workflows/pages.yml`, startet bei Push auf `main`).
1. In Safari öffnen → Teilen → „Zum Home-Bildschirm". Danach läuft die App offline und im Vollbild.
2. Für den Fokus: iOS-Einstellungen → Bedienungshilfen → „Geführter Zugriff" sperrt das iPad auf die App.

Lokal testen: `python3 -m http.server 8123` und `http://localhost:8123` öffnen.
