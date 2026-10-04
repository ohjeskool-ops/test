# Arabisch lernen – für Kinder

Ruhige Lern-App (Web-App/PWA) für iPad und Tablets, palästinensischer Dialekt. Kategorien: Farben, Zahlen, Tiere, Essen, Gefühle (weibliche Formen).

## Reiter
- **Lernen**: eine große Karte pro Wort (Bild, Arabisch mit Vokalzeichen, Lautschrift, Deutsch). Antippen = anhören.
- **Finden**: Wort wird vorgesprochen, aus 3 Bildern das richtige antippen. Kein Zeitdruck, Sterne am Ende.
- **Spielen**:
  - *Such mich!* – Suchspiel: aus ~9 Bildern das genannte finden (5 Runden), in der gewählten Kategorie.
  - *Zähl mit!* – jedes Ding antippen, die App zählt auf Arabisch mit (1–10).
  - *Gib mir …* – eine Zahl wird arabisch genannt, genau so viele Dinge antippen und „Fertig".
  - *Ausmalen* – Farbe antippen (arabischer Farbname wird gesprochen), dann Flächen im Bild ausmalen.
- **Elternbereich** (Zahnrad unten in der Seitenleiste, 2 Sekunden halten): Wörter mit eigener Stimme aufnehmen, Lautschrift ein/aus, Sterne zurücksetzen.

## Inhalte ändern
- Wörter: `data.js`
- Zeichnungen und Ausmal-Bild: `art.js`
- Spiele-Logik: `app.js` (Abschnitt „Spielen")

## Auf dem iPad nutzen
Die App wird über GitHub Pages veröffentlicht (Workflow `.github/workflows/pages.yml`, startet bei Push auf `main`).
1. In Safari öffnen → Teilen → „Zum Home-Bildschirm". Danach läuft die App offline und im Vollbild.
2. Für den Fokus: iOS-Einstellungen → Bedienungshilfen → „Geführter Zugriff" sperrt das iPad auf die App.

Lokal testen: `python3 -m http.server 8123` und `http://localhost:8123` öffnen.
