# read-log

Private Lese-Bibliothek: Artikel, PDFs, YouTube und Podcasts speichern, zusammenfassen und per KI befragen.
Design nach job-log (Monospace, Papierton, Haarlinien).

## Stand (Schritt 1+2)
- Drei-Spalten-Layout (Bibliothek · Lesen · einklappbarer Chat), auf dem Handy getrennte Ansichten
- Artikel-Import per URL (Mozilla Readability), SSRF-Schutz, Größen- und Zeitlimit
- Duplikaterkennung über normalisierte URL und Inhalts-Hash
- Volltextsuche, Filter nach Typ/Tag/Lesestatus, Tags bearbeiten, löschen
- Leseposition pro Dokument gespeichert, Export als Markdown/JSON
- Import mit übergebenem HTML (`POST /api/items {url, html}`) als Basis für die Safari-Erweiterung

## Stand (Schritt 3: KI)
- Zusammenfassung auf Deutsch (Überblick + wichtigste Aussagen), gespeichert; neu erzeugt nur auf Knopfdruck, bei geändertem Inhalt wird ein Hinweis gezeigt
- Chat pro Dokument mit Verlauf in der Datenbank; Antworten tragen Verweise `[n]` auf nummerierte Absätze, ein Klick springt zur Stelle und hebt sie hervor
- Fehlt die Information, antwortet die KI mit „Die Quelle liefert dazu keine Antwort.“
- Technik: Anthropic-Zitate (`content_block_location`) über ein Dokument aus Absatz-Blöcken; Modell per `ANTHROPIC_MODEL` änderbar (Standard `claude-sonnet-5-5`)
- `READLOG_FAKE_AI=1` schaltet einen Testmodus ohne echte KI ein (nur lokal)

## Stand (Schritt 4: Leseansicht, Markierungen, Lesezeichen)
- Saubere Leseansicht: Serif-Schrift, schmale Spalte, A−/A+ und Serif/Mono, Fokusmodus ohne Seitenleisten (Einstellungen pro Gerät)
- Markierungen: Text auswählen und „Markieren“; auch über mehrere Absätze. Mit Notiz, in der Datenbank gespeichert, im Markdown- und JSON-Export enthalten
- Lesezeichen: Beim Hinzufügen zwischen „Lesen“ und „Lesezeichen“ wählen. Speichert Link, Titel und Beschreibung (Open Graph), mit Tags und eigenem Filter; wenn die Seite nicht abrufbar ist, wird trotzdem gespeichert

## Noch offen
PDF, YouTube, Podcasts (Deepgram austauschbar), OCR, Safari-Erweiterung,
Supabase-Store für den Sync (Schema: `supabase/schema.sql`), Anmeldung.

Hinweis: Gespeichert wird bisher in `data/library.json` (nur lokal). Ein Sync zwischen Mac, iPhone und iPad
braucht den Supabase-Store hinter der Schnittstelle `Store` in `lib/types.ts`.

## Anmeldung (online)
Die Seite ist per PIN geschützt. Der Server meldet dahinter ein festes Supabase-Konto an (Zeilen-Sicherheit bleibt aktiv).
Umgebungsvariablen bei Netlify: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`APP_USER_EMAIL`, `APP_USER_PASSWORD` (geheim), `APP_PIN` (geheim, 4–12 Ziffern). Erlaubt sind 5 Versuche pro 15 Minuten.
Hinweis: Variablen ändern sich bei Netlify erst mit dem nächsten Build.

## Entwickeln
```
npm install
npm run dev      # http://localhost:3100
npm test
npm run typecheck
```
