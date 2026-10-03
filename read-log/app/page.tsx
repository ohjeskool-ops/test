"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ContentType, Item, ItemListEntry, ReadStatus } from "@/lib/types";

type View = "library" | "reader" | "chat";
const TYPE_LABEL: Record<ContentType, string> = { article: "Artikel", pdf: "PDF", youtube: "YouTube", podcast: "Podcast" };

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string; existingId?: string } }> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  const data = res.status === 204 ? ({} as T) : await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function Page() {
  const [view, setView] = useState<View>("library");
  const [chatOpen, setChatOpen] = useState(true);
  const [items, setItems] = useState<ItemListEntry[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<ContentType | "">("");
  const [status, setStatus] = useState<ReadStatus | "">("");
  const [tag, setTag] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; info?: boolean } | null>(null);
  const [current, setCurrent] = useState<Item | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const readerRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allTags = [...new Set(items.flatMap((i) => i.tags))].sort();

  const reload = useCallback(async () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (status) p.set("status", status);
    if (tag) p.set("tag", tag);
    const r = await api<{ items: ItemListEntry[] }>(`/api/items?${p}`);
    if (r.ok) setItems(r.data.items);
  }, [q, type, status, tag]);

  useEffect(() => {
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
  }, [reload]);

  async function open(id: string) {
    const r = await api<Item>(`/api/items/${id}`);
    if (!r.ok) return;
    setCurrent(r.data);
    setTagDraft(r.data.tags.join(", "));
    setView("reader");
  }

  // Leseposition wiederherstellen, sobald ein Dokument geöffnet wird.
  useEffect(() => {
    const el = readerRef.current;
    if (!el || !current) return;
    requestAnimationFrame(() => {
      el.scrollTop = (el.scrollHeight - el.clientHeight) * current.readPosition;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, view]);

  function onScroll() {
    const el = readerRef.current;
    if (!el || !current) return;
    const max = el.scrollHeight - el.clientHeight;
    const pos = max > 0 ? el.scrollTop / max : 0;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const id = current.id;
    saveTimer.current = setTimeout(() => api(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify({ readPosition: pos }) }), 600);
  }

  async function add() {
    if (!url.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await api<{ id: string; textStatus: string }>("/api/items", { method: "POST", body: JSON.stringify({ url: url.trim() }) });
    setBusy(false);
    if (r.ok) {
      setUrl("");
      setMsg({ text: r.data.textStatus === "ok" ? "Gespeichert." : "Gespeichert, aber ohne lesbaren Text (Seite lädt Inhalte per JavaScript oder ist geschützt).", info: true });
      await reload();
      open(r.data.id);
    } else {
      setMsg({ text: r.data.error ?? "Import fehlgeschlagen." });
      if (r.data.existingId) open(r.data.existingId);
    }
  }

  async function patch(body: object) {
    if (!current) return;
    const r = await api<Item>(`/api/items/${current.id}`, { method: "PATCH", body: JSON.stringify(body) });
    if (r.ok) {
      setCurrent((c) => (c ? { ...c, ...r.data, blocks: c.blocks } : c));
      reload();
    }
  }

  async function remove() {
    if (!current || !confirm(`„${current.title}“ endgültig löschen?`)) return;
    await api(`/api/items/${current.id}`, { method: "DELETE" });
    setCurrent(null);
    setView("library");
    reload();
  }

  const Filter = ({ label, on, set }: { label: string; on: boolean; set: () => void }) => (
    <button className={on ? "active" : ""} onClick={set}>{label}</button>
  );

  return (
    <div className="app">
      <header className="masthead">
        <h1>read-log</h1>
        <div className="right">
          <span>{items.length} Inhalte</span>
          <button className="txt-btn desktop-only" onClick={() => setChatOpen((o) => !o)}>{chatOpen ? "Chat ausblenden »" : "« Chat einblenden"}</button>
        </div>
      </header>

      <nav className="mobile-tabs">
        {(["library", "reader", "chat"] as View[]).map((v) => (
          <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
            {{ library: "Bibliothek", reader: "Lesen", chat: "Chat" }[v]}
          </button>
        ))}
      </nav>

      <main className={`layout ${chatOpen ? "chat-open" : "chat-closed"}`} data-view={view}>
        {/* ── Bibliothek ── */}
        <section className="pane pane-library">
          <div className="add-bar">
            <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Artikel-URL einfügen" inputMode="url" />
            <button className="btn" disabled={busy} onClick={add}>{busy ? "…" : "+ Neu"}</button>
          </div>
          {msg && <div className={`msg ${msg.info ? "info" : ""}`}>{msg.text}</div>}
          <div className="search"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Volltextsuche …" /></div>
          <div className="filters">
            <Filter label="Alle" on={!status} set={() => setStatus("")} />
            <Filter label="Ungelesen" on={status === "unread"} set={() => setStatus("unread")} />
            <Filter label="Gelesen" on={status === "read"} set={() => setStatus("read")} />
          </div>
          <div className="filters">
            <Filter label="Alle Typen" on={!type} set={() => setType("")} />
            {(Object.keys(TYPE_LABEL) as ContentType[]).map((t) => (
              <Filter key={t} label={TYPE_LABEL[t]} on={type === t} set={() => setType(t)} />
            ))}
          </div>
          {allTags.length > 0 && (
            <div className="tags" style={{ marginTop: 0, marginBottom: 8 }}>
              {allTags.map((t) => <button key={t} className={`tag ${tag === t ? "on" : ""}`} onClick={() => setTag(tag === t ? "" : t)}>{t}</button>)}
            </div>
          )}
          <div className="section-label">Bibliothek ({items.length})</div>
          <div className="pane-scroll">
            {items.length === 0 && <div className="empty-note">{q || type || status || tag ? "Keine Treffer." : "Noch nichts gespeichert. URL oben einfügen."}</div>}
            {items.map((i) => (
              <button key={i.id} className={`item ${i.status} ${current?.id === i.id ? "active" : ""}`} onClick={() => open(i.id)}>
                <div className="item-title">{i.status === "unread" && <span className="dot-unread" />}{i.title}</div>
                <div className="item-meta"><span>{i.source}</span><span>{TYPE_LABEL[i.type]}</span><span>{new Date(i.createdAt).toLocaleDateString("de-DE")}</span></div>
                {i.excerpt && <div className="item-excerpt">{i.excerpt}</div>}
                {i.tags.length > 0 && <div className="tags">{i.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
              </button>
            ))}
          </div>
        </section>

        {/* ── Lesansicht ── */}
        <section className="pane pane-reader">
          <div className="section-label">Lesen</div>
          <div className="pane-scroll" ref={readerRef} onScroll={onScroll}>
            {!current ? (
              <div className="empty-note">Inhalt in der Bibliothek auswählen.</div>
            ) : (
              <article className="reader">
                <h2>{current.title}</h2>
                <div className="reader-meta">
                  <span>{current.source}</span><span>{TYPE_LABEL[current.type]}</span>
                  <span>{new Date(current.createdAt).toLocaleDateString("de-DE")}</span>
                </div>
                <div className="reader-actions">
                  {current.url && <a href={current.url} target="_blank" rel="noopener noreferrer">Original öffnen ↗</a>}
                  <button className="btn-small" onClick={() => patch({ status: current.status === "read" ? "unread" : "read" })}>
                    {current.status === "read" ? "Als ungelesen markieren" : "Als gelesen markieren"}
                  </button>
                  <a href={`/api/items/${current.id}/export?format=md`}>Markdown</a>
                  <a href={`/api/items/${current.id}/export?format=json`}>JSON</a>
                  <button className="txt-btn del" onClick={remove}>Löschen</button>
                </div>
                <div className="tag-edit">
                  <input className="tag-input" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="Tags, durch Komma getrennt" />
                  <button className="btn-small" onClick={() => patch({ tags: tagDraft })}>Tags speichern</button>
                </div>
                {current.textStatus !== "ok" && (
                  <div className="note-box warn">Kein Text extrahiert. Bei dynamisch geladenen oder angemeldeten Seiten hilft später die Safari-Erweiterung.</div>
                )}
                {current.blocks.map((b, idx) => (
                  <p key={idx} id={`b${idx}`} className="block"><span className="block-no">{idx + 1}</span>{b}</p>
                ))}
              </article>
            )}
          </div>
        </section>

        {/* ── KI-Chat ── */}
        <aside className="pane pane-chat">
          <div className="section-label">KI-Chat</div>
          <div className="pane-scroll">
            <div className="coming">
              Zusammenfassung und Chat über das geöffnete Dokument folgen im nächsten Schritt.
              Der extrahierte Text ist bereits gespeichert; Absätze sind nummeriert, damit Antworten später auf Textstellen verweisen können.
            </div>
          </div>
        </aside>
      </main>

      <footer className="colophon"><span>Artikel · PDF · YouTube · Podcast</span><span>v0.1</span></footer>
    </div>
  );
}
