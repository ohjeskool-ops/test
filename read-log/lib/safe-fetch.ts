import { lookup } from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 8 * 1024 * 1024;

function isPrivate(ip: string): boolean {
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    return l === "::1" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:127.") || l.startsWith("::ffff:10.") || l.startsWith("::ffff:192.168.");
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

/** Lädt eine öffentliche URL. Blockiert interne Adressen (SSRF) und begrenzt Größe und Dauer. */
export async function safeFetch(url: string, hops = 5): Promise<{ finalUrl: string; contentType: string; body: Buffer }> {
  let current = url;
  for (let i = 0; i <= hops; i++) {
    const u = new URL(current);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Nur http(s)-Links werden unterstützt.");
    const addrs = await lookup(u.hostname, { all: true });
    if (addrs.some((a) => isPrivate(a.address))) throw new Error("Interne Adressen sind nicht erlaubt.");
    const res = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; ReadLog/0.1)", accept: "text/html,application/pdf,*/*;q=0.8" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = new URL(res.headers.get("location")!, current).toString();
      continue;
    }
    if (!res.ok) throw new Error(`Die Seite antwortet mit Status ${res.status}.`);
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) throw new Error("Die Seite ist zu groß (über 8 MB).");
      chunks.push(value);
    }
    return { finalUrl: current, contentType: res.headers.get("content-type") ?? "", body: Buffer.concat(chunks) };
  }
  throw new Error("Zu viele Weiterleitungen.");
}
