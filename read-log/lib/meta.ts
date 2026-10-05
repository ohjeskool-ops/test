import { JSDOM, VirtualConsole } from "jsdom";

export interface PageMeta {
  title: string;
  description: string;
}

/** Liest Titel und Beschreibung einer Seite (Open Graph bevorzugt). */
export function extractMeta(html: string, url: string): PageMeta {
  const doc = new JSDOM(html, { url, virtualConsole: new VirtualConsole() }).window.document;
  const meta = (sel: string) => doc.querySelector(sel)?.getAttribute("content")?.replace(/\s+/g, " ").trim() ?? "";
  const title = meta('meta[property="og:title"]') || doc.title.replace(/\s+/g, " ").trim();
  const description = meta('meta[property="og:description"]') || meta('meta[name="description"]');
  return { title, description };
}
