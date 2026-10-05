import { promises as fs } from "node:fs";
import path from "node:path";
import type { ChatMessage, Item, ItemListEntry, ListQuery, Store } from "./types";

/**
 * Dev-Speicher: eine JSON-Datei. Austauschbar gegen eine Supabase-Implementierung
 * (Schema siehe supabase/schema.sql), die dieselbe Store-Schnittstelle erfüllt.
 */
const FILE = process.env.READLOG_DATA_FILE ?? path.join(process.cwd(), "data", "library.json");

const CHAT_FILE = FILE.replace(/\.json$/, "") + ".chat.json";

async function loadChat(): Promise<ChatMessage[]> {
  try {
    return JSON.parse(await fs.readFile(CHAT_FILE, "utf8")) as ChatMessage[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function saveChat(messages: ChatMessage[]): Promise<void> {
  await fs.mkdir(path.dirname(CHAT_FILE), { recursive: true });
  const tmp = `${CHAT_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(messages, null, 2));
  await fs.rename(tmp, CHAT_FILE);
}

let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function load(): Promise<Item[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Item[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function save(items: Item[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(items, null, 2));
  await fs.rename(tmp, FILE);
}

function toEntry(item: Item): ItemListEntry {
  const { blocks, ...rest } = item;
  return { ...rest, excerpt: blocks.join(" ").slice(0, 220) };
}

export function matches(item: Item, q: ListQuery): boolean {
  if (q.type && item.type !== q.type) return false;
  if (q.status && item.status !== q.status) return false;
  if (q.tag && !item.tags.includes(q.tag.toLowerCase())) return false;
  const terms = (q.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = `${item.title}\n${item.source}\n${item.tags.join(" ")}\n${item.blocks.join("\n")}`.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export const fileStore: Store = {
  list: async (query) =>
    (await load())
      .filter((i) => matches(i, query))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toEntry),
  get: async (id) => (await load()).find((i) => i.id === id) ?? null,
  findByUrl: async (u) => (await load()).find((i) => i.normalizedUrl === u) ?? null,
  findByHash: async (h) => (await load()).find((i) => i.contentHash === h) ?? null,
  create: (item) =>
    serial(async () => {
      const items = await load();
      items.push(item);
      await save(items);
      return item;
    }),
  update: (id, patch) =>
    serial(async () => {
      const items = await load();
      const item = items.find((i) => i.id === id);
      if (!item) return null;
      Object.assign(item, patch);
      await save(items);
      return item;
    }),
  remove: (id) =>
    serial(async () => {
      const items = await load();
      const next = items.filter((i) => i.id !== id);
      if (next.length === items.length) return false;
      await save(next);
      await saveChat((await loadChat()).filter((m) => m.itemId !== id));
      return true;
    }),
  listMessages: async (itemId) =>
    (await loadChat()).filter((m) => m.itemId === itemId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  addMessages: (messages) =>
    serial(async () => {
      await saveChat([...(await loadChat()), ...messages]);
    }),
  clearMessages: (itemId) =>
    serial(async () => {
      await saveChat((await loadChat()).filter((m) => m.itemId !== itemId));
    }),
};
