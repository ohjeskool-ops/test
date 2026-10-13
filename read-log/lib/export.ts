import type { Highlight, Item } from "./types";

export function toMarkdown(item: Item, highlights: Highlight[] = []): string {
  const meta = [
    `- Quelle: ${item.source}`,
    item.url ? `- Original: ${item.url}` : null,
    `- Typ: ${item.type}`,
    `- Gespeichert: ${item.createdAt}`,
    `- Status: ${item.status === "read" ? "gelesen" : "ungelesen"}`,
    item.tags.length ? `- Tags: ${item.tags.join(", ")}` : null,
  ].filter(Boolean);
  const parts = [`# ${item.title}`, meta.join("\n")];
  if (item.summary) parts.push(`## Zusammenfassung\n\n${item.summary.text}`);
  if (highlights.length > 0) {
    const lines = highlights.map((h) => `> ${h.text.replace(/\n+/g, " ")}\n> — Absatz ${h.block + 1}${h.note ? `\n\nNotiz: ${h.note}` : ""}`);
    parts.push(`## Markierungen\n\n${lines.join("\n\n")}`);
  }
  if (item.blocks.length > 0) parts.push(`## ${item.type === "bookmark" ? "Beschreibung" : "Text"}\n\n${item.blocks.join("\n\n")}`);
  return parts.join("\n\n") + "\n";
}
