export interface Piece {
  text: string;
  /** Id der Markierung, zu der dieses Stück gehört; null für normalen Text. */
  hid: string | null;
}

/** Zerlegt einen Absatz in Stücke mit und ohne Markierung. Überlappungen werden abgeschnitten. */
export function splitByHighlights(text: string, highlights: { id: string; start: number; end: number }[]): Piece[] {
  const sorted = [...highlights].sort((a, b) => a.start - b.start || a.end - b.end);
  const pieces: Piece[] = [];
  let cursor = 0;
  for (const h of sorted) {
    const start = Math.max(h.start, cursor);
    const end = Math.min(h.end, text.length);
    if (end <= start) continue;
    if (start > cursor) pieces.push({ text: text.slice(cursor, start), hid: null });
    pieces.push({ text: text.slice(start, end), hid: h.id });
    cursor = end;
  }
  if (cursor < text.length) pieces.push({ text: text.slice(cursor), hid: null });
  return pieces.length ? pieces : [{ text, hid: null }];
}
