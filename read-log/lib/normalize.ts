import { createHash } from "node:crypto";

const TRACKING = /^(utm_|fbclid$|gclid$|mc_|ref$|ref_src$|igshid$)/i;

/** Vereinheitlicht eine URL, damit dieselbe Seite nicht doppelt gespeichert wird. */
export function normalizeUrl(input: string): string {
  const u = new URL(input.trim());
  u.hash = "";
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  if ((u.protocol === "http:" && u.port === "80") || (u.protocol === "https:" && u.port === "443")) u.port = "";
  const kept = [...u.searchParams.entries()].filter(([k]) => !TRACKING.test(k));
  kept.sort(([a], [b]) => a.localeCompare(b));
  u.search = "";
  for (const [k, v] of kept) u.searchParams.append(k, v);
  if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, "");
  return u.toString();
}

export function hashText(blocks: string[]): string {
  const norm = blocks.join("\n").replace(/\s+/g, " ").trim().toLowerCase();
  return createHash("sha256").update(norm).digest("hex");
}

export function parseTags(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  return [...new Set(list.map((t) => String(t).trim().toLowerCase()).filter(Boolean))];
}
