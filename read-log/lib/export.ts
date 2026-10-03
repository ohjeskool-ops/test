import type { Item } from "./types";

export function toMarkdown(item: Item): string {
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
  parts.push(`## Text\n\n${item.blocks.join("\n\n")}`);
  return parts.join("\n\n") + "\n";
}
