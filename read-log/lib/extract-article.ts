import { JSDOM, VirtualConsole } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface Extracted {
  title: string;
  source: string;
  blocks: string[];
}

/** Zieht bereinigten Artikeltext aus HTML (vom Server geladen oder aus dem Browser übergeben). */
export function extractArticle(html: string, url: string): Extracted {
  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() });
  const doc = dom.window.document;
  const article = new Readability(doc).parse();
  if (!article?.content) return { title: doc.title || url, source: new URL(url).hostname.replace(/^www\./, ""), blocks: [] };

  const body = new JSDOM(article.content).window.document;
  const blocks: string[] = [];
  body.querySelectorAll("h1,h2,h3,h4,p,li,blockquote,pre").forEach((el) => {
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text.length > 0) blocks.push(text);
  });
  if (blocks.length === 0 && article.textContent) {
    blocks.push(...article.textContent.split(/\n{2,}/).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean));
  }
  return {
    title: (article.title || doc.title || url).trim(),
    source: (article.siteName || new URL(url).hostname.replace(/^www\./, "")).trim(),
    blocks,
  };
}
