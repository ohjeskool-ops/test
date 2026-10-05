import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage, Item, ItemListEntry, ListQuery, Store } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const LIST_COLS = "id,type,title,source,url,normalized_url,content_hash,created_at,tags,status,text_status,read_position,summary,excerpt";

function toListEntry(r: any): ItemListEntry {
  return {
    id: r.id, type: r.type, title: r.title, source: r.source, url: r.url, normalizedUrl: r.normalized_url,
    contentHash: r.content_hash, createdAt: r.created_at, tags: r.tags, status: r.status, textStatus: r.text_status,
    readPosition: r.read_position, summary: r.summary, excerpt: r.excerpt ?? "",
  };
}
const toItem = (r: any): Item => {
  const { excerpt, ...entry } = toListEntry(r);
  void excerpt;
  return { ...entry, blocks: r.blocks ?? [] };
};

function fail(error: { message: string; code?: string } | null): void {
  if (error) throw Object.assign(new Error(error.message), { code: error.code });
}

const toMessage = (r: any): ChatMessage => ({
  id: r.id, itemId: r.item_id, role: r.role, text: r.text, segments: r.segments ?? null, createdAt: r.created_at,
});

export const isDuplicateError = (e: unknown) => (e as { code?: string })?.code === "23505";

export function createSupabaseStore(db: SupabaseClient): Store {
  return {
    async list(q: ListQuery) {
      let query = db.from("items").select(LIST_COLS).order("created_at", { ascending: false });
      if (q.type) query = query.eq("type", q.type);
      if (q.status) query = query.eq("status", q.status);
      if (q.tag) query = query.contains("tags", [q.tag.toLowerCase()]);
      for (const raw of (q.q ?? "").toLowerCase().split(/\s+/)) {
        const t = raw.replace(/[%_,()"\\*]/g, "");
        if (t) query = query.or(`title.ilike.*${t}*,source.ilike.*${t}*,body.ilike.*${t}*`);
      }
      const { data, error } = await query;
      fail(error);
      return (data ?? []).map(toListEntry);
    },
    async get(id) {
      const { data, error } = await db.from("items").select("*").eq("id", id).maybeSingle();
      fail(error);
      return data ? toItem(data) : null;
    },
    async findByUrl(u) {
      const { data, error } = await db.from("items").select("*").eq("normalized_url", u).maybeSingle();
      fail(error);
      return data ? toItem(data) : null;
    },
    async findByHash(h) {
      const { data, error } = await db.from("items").select("*").eq("content_hash", h).limit(1);
      fail(error);
      return data?.[0] ? toItem(data[0]) : null;
    },
    async create(item) {
      const { data, error } = await db
        .from("items")
        .insert({
          id: item.id, type: item.type, title: item.title, source: item.source, url: item.url,
          normalized_url: item.normalizedUrl, content_hash: item.contentHash, created_at: item.createdAt,
          tags: item.tags, status: item.status, text_status: item.textStatus, blocks: item.blocks,
          body: item.blocks.join("\n"), read_position: item.readPosition, summary: item.summary,
        })
        .select("*")
        .single();
      fail(error);
      return toItem(data);
    },
    async update(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.title !== undefined) row.title = patch.title;
      if (patch.tags !== undefined) row.tags = patch.tags;
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.readPosition !== undefined) row.read_position = patch.readPosition;
      if (patch.summary !== undefined) row.summary = patch.summary;
      const { data, error } = await db.from("items").update(row).eq("id", id).select("*").maybeSingle();
      fail(error);
      return data ? toItem(data) : null;
    },
    async remove(id) {
      const { data, error } = await db.from("items").delete().eq("id", id).select("id");
      fail(error);
      return (data?.length ?? 0) > 0;
    },
    async listMessages(itemId) {
      const { data, error } = await db.from("chat_messages").select("*").eq("item_id", itemId).order("created_at", { ascending: true });
      fail(error);
      return (data ?? []).map(toMessage);
    },
    async addMessages(messages) {
      if (messages.length === 0) return;
      const { error } = await db.from("chat_messages").insert(
        messages.map((m) => ({ id: m.id, item_id: m.itemId, role: m.role, text: m.text, segments: m.segments, created_at: m.createdAt })),
      );
      fail(error);
    },
    async clearMessages(itemId) {
      const { error } = await db.from("chat_messages").delete().eq("item_id", itemId);
      fail(error);
    },
  };
}
