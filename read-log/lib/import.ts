import { randomUUID } from "node:crypto";
import { extractArticle } from "./extract-article";
import { extractMeta } from "./meta";
import { hashText, normalizeUrl, parseTags } from "./normalize";
import { safeFetch } from "./safe-fetch";
import { isDuplicateError } from "./supabase-store";
import type { Item, Store } from "./types";

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

// Importe laufen nacheinander, damit die Duplikatprüfung bei gleichzeitigen Anfragen greift.
let importQueue: Promise<unknown> = Promise.resolve();

export function importArticle(store: Store, input: ImportInput): Promise<Item> {
  const run = importQueue.then(() => doImport(store, input), () => doImport(store, input));
  importQueue = run.catch(() => undefined);
  return run;
}

async function doImport(store: Store, input: ImportInput): Promise<Item> {
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

  try {
    return await store.create({
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
  } catch (e) {
    if (isDuplicateError(e)) {
      const existing = await store.findByUrl(normalized);
      throw new ImportError("Dieser Link ist schon in der Bibliothek.", 409, existing ?? undefined);
    }
    throw e;
  }
}

interface BookmarkInput {
  url?: string;
  html?: string;
  title?: string;
  tags?: unknown;
}

/** Speichert nur den Link mit Titel und Beschreibung, ohne Volltext (Ersatz für ein Lesezeichen-Tool). */
export function importBookmark(store: Store, input: BookmarkInput): Promise<Item> {
  const run = importQueue.then(() => doBookmark(store, input), () => doBookmark(store, input));
  importQueue = run.catch(() => undefined);
  return run;
}

async function doBookmark(store: Store, input: BookmarkInput): Promise<Item> {
  if (!input.url) throw new ImportError("Bitte eine URL angeben.");
  let normalized: string;
  try {
    normalized = normalizeUrl(input.url);
  } catch {
    throw new ImportError("Das ist keine gültige URL.");
  }
  const dup = await store.findByUrl(normalized);
  if (dup) throw new ImportError("Dieser Link ist schon in der Bibliothek.", 409, dup);

  const host = new URL(normalized).hostname.replace(/^www\./, "");
  let meta = { title: "", description: "" };
  try {
    const html = input.html ?? (await safeFetch(normalized)).body.toString("utf8");
    meta = extractMeta(html, normalized);
  } catch {
    // Viele Seiten blockieren automatische Abrufe. Das Lesezeichen wird trotzdem gespeichert.
  }

  const title = (input.title?.trim() || meta.title || host).slice(0, 300);
  const blocks = meta.description ? [meta.description] : [];
  try {
    return await store.create({
      id: randomUUID(),
      type: "bookmark",
      title,
      source: host,
      url: normalized,
      normalizedUrl: normalized,
      contentHash: hashText([`bookmark:${normalized}`]),
      createdAt: new Date().toISOString(),
      tags: parseTags(input.tags),
      status: "unread",
      textStatus: "ok",
      blocks,
      readPosition: 0,
      summary: null,
    });
  } catch (e) {
    if (isDuplicateError(e)) {
      const existing = await store.findByUrl(normalized);
      throw new ImportError("Dieser Link ist schon in der Bibliothek.", 409, existing ?? undefined);
    }
    throw e;
  }
}
