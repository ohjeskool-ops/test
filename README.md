# Arabisch lernen – für Kinder

Ruhige Lern-App (Web-App/PWA) für iPad und Tablets. Kategorien: Farben, Zahlen, Tiere, Essen, Gefühle.

## Aufbau
- **Lernen**: eine große Karte pro Wort (Bild, Arabisch mit Vokalzeichen, Lautschrift, Deutsch). Antippen = anhören.
- **Zuhören & Finden**: 6 Runden, Wort wird vorgesprochen, aus 3 Bildern das richtige antippen. Falsche Antworten werden nur ausgegraut, kein Zeitdruck.
- **Elternbereich** (Zahnrad unten rechts, 2 Sekunden gedrückt halten): Wörter mit eigener Stimme aufnehmen, Lautschrift ein/aus, Sterne zurücksetzen.

## Inhalte ändern
Alle Wörter stehen in `data.js`.

## Auf dem iPad nutzen
1. Ordner über HTTPS bereitstellen (z. B. GitHub Pages oder Netlify).
2. In Safari öffnen → Teilen → „Zum Home-Bildschirm". Danach läuft die App offline und im Vollbild.
3. Für den Fokus: iOS-Einstellungen → Bedienungshilfen → „Geführter Zugriff" (dreimal Home-/Seitentaste) sperrt das iPad auf die App.

Lokal testen: `python3 -m http.server 8123` und `http://localhost:8123` öffnen.
