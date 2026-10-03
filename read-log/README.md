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

## Noch offen
Zusammenfassung und Chat (Anthropic), PDF, YouTube, Podcasts (Deepgram austauschbar), OCR, Safari-Erweiterung,
Supabase-Store für den Sync (Schema: `supabase/schema.sql`), Anmeldung.

Hinweis: Gespeichert wird bisher in `data/library.json` (nur lokal). Ein Sync zwischen Mac, iPhone und iPad
braucht den Supabase-Store hinter der Schnittstelle `Store` in `lib/types.ts`.

## Entwickeln
```
npm install
npm run dev      # http://localhost:3100
npm test
npm run typecheck
```
