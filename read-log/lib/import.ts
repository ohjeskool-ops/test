import { randomUUID } from "node:crypto";
import { extractArticle } from "./extract-article";
import { hashText, normalizeUrl, parseTags } from "./normalize";
import { safeFetch } from "./safe-fetch";
import { store } from "./store";
import type { Item } from "./types";

export class ImportError extends Error {
  constructor(message: string, public status = 400, public existing?: Item) {
    super(message);
  }
}

interface ImportInput {
  url?: string;
  /** Vom Browser (z. B. Safari-Erweiterung) übergebener Seiteninhalt. */
  html?: string;
  tags?: unknown;
}

export async function importArticle(input: ImportInput): Promise<Item> {
  if (!input.url) throw new ImportError("Bitte eine URL angeben.");
  let normalized: string;
  try {
    normalized = normalizeUrl(input.url);
  } catch {
    throw new ImportError("Das ist keine gültige URL.");
  }

  const dup = await store.findByUrl(normalized);
  if (dup) throw new ImportError("Dieser Link ist schon in der Bibliothek.", 409, dup);

  let html = input.html;
  if (!html) {
    try {
      const res = await safeFetch(normalized);
      if (/pdf/i.test(res.contentType) || /\.pdf($|\?)/i.test(normalized)) {
        throw new ImportError("PDF-Import folgt in einem späteren Schritt.", 501);
      }
      html = res.body.toString("utf8");
    } catch (e) {
      if (e instanceof ImportError) throw e;
      throw new ImportError(`Seite konnte nicht geladen werden: ${(e as Error).message}`, 502);
    }
  }

  const { title, source, blocks } = extractArticle(html, normalized);
  const contentHash = hashText(blocks);
  if (blocks.length > 0) {
    const same = await store.findByHash(contentHash);
    if (same) throw new ImportError("Derselbe Inhalt ist unter einer anderen URL schon gespeichert.", 409, same);
  }

  return store.create({
    id: randomUUID(),
    type: "article",
    title,
    source,
    url: normalized,
    normalizedUrl: normalized,
    contentHash,
    createdAt: new Date().toISOString(),
    tags: parseTags(input.tags),
    status: "unread",
    textStatus: blocks.length > 0 ? "ok" : "missing",
    blocks,
    readPosition: 0,
    summary: null,
  });
}
