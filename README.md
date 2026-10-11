# Arabisch lernen – für Kinder

Ruhige Lern-App (Web-App/PWA) für iPad und Tablets, palästinensischer Dialekt. Kategorien: Farben, Zahlen, Tiere, Essen, Gefühle (weibliche Formen), Sinne.

## Reiter
- **Lernen**: eine große Karte pro Wort (Bild, Arabisch mit Vokalzeichen, Lautschrift, Deutsch). Antippen = anhören.
- **Finden**: Wort wird vorgesprochen, aus 3 Bildern das richtige antippen. Kein Zeitdruck, Sterne am Ende.
- **Spielen**: In jeder Kategorie dieselben vier Spiele, der Inhalt passt sich dem Thema an:
  - *Such mich!* – aus ~9 Bildern der Kategorie das genannte finden (5 Runden).
  - *Zähl mit!* – Dinge der Kategorie antippen, die App zählt auf Arabisch mit (1–10).
  - *Ausmalen* – Bild zum Thema, Farbe antippen (arabischer Farbname wird gesprochen), dann Flächen antippen.
  - *Finger-Malen* – dasselbe Bild, frei mit dem Finger malen; die Farbe bleibt in der Fläche, in der der Strich beginnt. Pinselgröße, Rückgängig und Löschen.
  - *Extra* nur wo es passt: *Gib mir …* (Zahlen: arabische Zahl hören, genau so viele Dinge antippen) und *Welcher Sinn?* (Sinne: Ding dem Körperteil zuordnen).
- **Elternbereich** (Zahnrad unten in der Seitenleiste, 2 Sekunden halten): Wörter mit eigener Stimme aufnehmen, Lautschrift ein/aus, Sterne zurücksetzen.

## Inhalte ändern
- Wörter: `data.js`
- Zeichnungen und Ausmalbilder (je Kategorie ein Bild in `SCENES`): `art.js`
- Spiele-Logik: `app.js` (Abschnitt „Spielen")

## Auf dem iPad nutzen
Die App wird über GitHub Pages veröffentlicht (Workflow `.github/workflows/pages.yml`, startet bei Push auf `main`).
1. In Safari öffnen → Teilen → „Zum Home-Bildschirm". Danach läuft die App offline und im Vollbild.
2. Für den Fokus: iOS-Einstellungen → Bedienungshilfen → „Geführter Zugriff" sperrt das iPad auf die App.

Lokal testen: `python3 -m http.server 8123` und `http://localhost:8123` öffnen.
