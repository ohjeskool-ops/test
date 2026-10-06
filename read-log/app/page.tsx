"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AiPanel } from "./ai-panel";
import { MarksPanel } from "./marks-panel";
import { Reader, type Prefs } from "./reader";
import type { ContentType, Highlight, Item, ItemListEntry, ReadStatus, Summary } from "@/lib/types";

type View = "library" | "reader" | "chat";
type Side = "ai" | "marks";
const TYPE_LABEL: Record<ContentType, string> = { article: "Artikel", pdf: "PDF", youtube: "YouTube", podcast: "Podcast", bookmark: "Lesezeichen" };
const DEFAULT_PREFS: Prefs = { size: 18, serif: true };

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string; existingId?: string } }> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  const data = res.status === 204 ? ({} as T) : await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function Page() {
  const [view, setView] = useState<View>("library");
  const [side, setSide] = useState<Side>("ai");
  const [chatOpen, setChatOpen] = useState(true);
  const [focus, setFocus] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [items, setItems] = useState<ItemListEntry[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<ContentType | "">("");
  const [status, setStatus] = useState<ReadStatus | "">("");
  const [tag, setTag] = useState("");
  const [url, setUrl] = useState("");
  const [newTags, setNewTags] = useState("");
  const [mode, setMode] = useState<"read" | "bookmark">("read");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; info?: boolean; blocked?: boolean } | null>(null);
  const [current, setCurrent] = useState<Item | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeMark, setActiveMark] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [flash, setFlash] = useState<{ start: number; end: number } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allTags = [...new Set(items.flatMap((i) => i.tags))].sort();

  // Leseeinstellungen pro Gerät merken (nur Komfort, die App läuft auch ohne).
  useEffect(() => {
    try {
      const raw = localStorage.getItem("readlog-prefs");
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {}
  }, []);
  function changePrefs(p: Prefs) {
    setPrefs(p);
    try {
      localStorage.setItem("readlog-prefs", JSON.stringify(p));
    } catch {}
  }

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
    const id = new URLSearchParams(window.location.search).get("open");
    if (id) {
      open(id);
      window.history.replaceState(null, "", "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
  }, [reload]);

  async function open(id: string) {
    const [r, h] = await Promise.all([api<Item>(`/api/items/${id}`), api<{ highlights: Highlight[] }>(`/api/items/${id}/highlights`)]);
    if (!r.ok) return;
    setCurrent(r.data);
    setHighlights(h.ok ? h.data.highlights : []);
    setActiveMark(null);
    setTagDraft(r.data.tags.join(", "));
    setView("reader");
  }

  function savePosition(pos: number) {
    if (!current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const id = current.id;
    saveTimer.current = setTimeout(() => api(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify({ readPosition: pos }) }), 600);
  }

  async function add() {
    if (!url.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await api<{ id: string; textStatus: string }>("/api/items", {
      method: "POST",
      body: JSON.stringify({ url: url.trim(), kind: mode === "bookmark" ? "bookmark" : "article", tags: newTags }),
    });
    setBusy(false);
    if (r.ok) {
      setUrl("");
      setNewTags("");
      setMsg({ text: mode === "bookmark" ? "Lesezeichen gespeichert." : r.data.textStatus === "ok" ? "Gespeichert." : "Gespeichert, aber ohne lesbaren Text (Seite lädt Inhalte per JavaScript oder ist geschützt).", info: true });
      await reload();
      open(r.data.id);
    } else {
      setMsg({ text: r.data.error ?? "Import fehlgeschlagen.", blocked: r.status === 502 && mode === "read" });
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

  function jump(start: number, end: number) {
    setView("reader");
    setFlash({ start, end });
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`b${start}`)?.scrollIntoView({ block: "center", behavior: "smooth" })));
    setTimeout(() => setFlash(null), 6000);
  }

  function onMark(id: string) {
    setSide("marks");
    setChatOpen(true);
    setFocus(false);
    setActiveMark(id);
    if (window.matchMedia("(max-width: 760px)").matches) setView("chat");
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`m-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" })));
  }

  async function setNote(id: string, note: string) {
    if (!current) return;
    const r = await api(`/api/items/${current.id}/highlights/${id}`, { method: "PATCH", body: JSON.stringify({ note }) });
    if (r.ok) setHighlights((hs) => hs.map((h) => (h.id === id ? { ...h, note } : h)));
  }

  async function removeMark(id: string) {
    if (!current) return;
    const r = await api(`/api/items/${current.id}/highlights/${id}`, { method: "DELETE" });
    if (r.ok) setHighlights((hs) => hs.filter((h) => h.id !== id));
  }

  async function signOut() {
    const { createClient } = await import("@/lib/supabase/browser");
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  async function remove() {
    if (!current || !confirm(`„${current.title}“ endgültig löschen?`)) return;
    await api(`/api/items/${current.id}`, { method: "DELETE" });
    setCurrent(null);
    setHighlights([]);
    setView("library");
    reload();
  }

  const Filter = ({ label, on, set }: { label: string; on: boolean; set: () => void }) => (
    <button className={on ? "active" : ""} onClick={set}>{label}</button>
  );
  const isBookmark = current?.type === "bookmark";

  return (
    <div className="app">
      <header className="masthead">
        <h1>read-log</h1>
        <div className="right">
          <span>{items.length} Inhalte</span>
          {process.env.NEXT_PUBLIC_SUPABASE_URL && <button className="txt-btn" onClick={signOut}>Abmelden</button>}
          <button className="txt-btn desktop-only" onClick={() => setChatOpen((o) => !o)}>{chatOpen ? "Seitenleiste ausblenden »" : "« Seitenleiste einblenden"}</button>
        </div>
      </header>

      <nav className="mobile-tabs">
        {(["library", "reader", "chat"] as View[]).map((v) => (
          <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
            {{ library: "Bibliothek", reader: "Lesen", chat: "KI" }[v]}
          </button>
        ))}
      </nav>

      <main className={`layout ${chatOpen ? "chat-open" : "chat-closed"}${focus ? " focus" : ""}`} data-view={view}>
        {/* ── Bibliothek ── */}
        <section className="pane pane-library">
          <div className="mode-switch" role="tablist">
            <button className={mode === "read" ? "active" : ""} onClick={() => setMode("read")}>Lesen</button>
            <button className={mode === "bookmark" ? "active" : ""} onClick={() => setMode("bookmark")}>Lesezeichen</button>
          </div>
          <div className="add-bar">
            <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={mode === "bookmark" ? "Link als Lesezeichen speichern" : "Artikel-URL einfügen"} inputMode="url" />
            <button className="btn" disabled={busy} onClick={add}>{busy ? "…" : "+ Neu"}</button>
          </div>
          <div className="add-bar">
            <input value={newTags} onChange={(e) => setNewTags(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Tags (optional), z. B. tools" />
          </div>
          {msg && (
            <div className={`msg ${msg.info ? "info" : ""}`}>
              {msg.text}
              {msg.blocked && <> Alternative: <a href="/import" target="_blank" style={{ textDecoration: "underline" }}>Lesezeichen für den Import aus dem Browser</a>.</>}
            </div>
          )}
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
          <Reader
            item={current}
            highlights={highlights}
            prefs={prefs}
            onPrefs={changePrefs}
            focus={focus}
            onFocus={() => setFocus((f) => !f)}
            active={view === "reader"}
            flash={flash}
            tagDraft={tagDraft}
            onTagDraft={setTagDraft}
            onPatch={patch}
            onRemove={remove}
            onAddHighlights={(list) => setHighlights((hs) => [...hs, ...list].sort((a, b) => a.block - b.block || a.start - b.start))}
            onMark={onMark}
            onPosition={savePosition}
          />
        </section>

        {/* ── KI und Markierungen ── */}
        <aside className="pane pane-chat">
          <div className="side-tabs">
            <button className={side === "ai" ? "active" : ""} onClick={() => setSide("ai")}>KI</button>
            <button className={side === "marks" ? "active" : ""} onClick={() => setSide("marks")}>Markierungen{highlights.length > 0 ? ` (${highlights.length})` : ""}</button>
          </div>
          <div className="pane-scroll">
            {isBookmark ? (
              <div className="empty-note">Lesezeichen speichern nur den Link. KI und Markierungen gibt es für gespeicherte Texte.</div>
            ) : side === "ai" ? (
              <AiPanel item={current} onJump={jump} onSummary={(summary: Summary) => setCurrent((c) => (c ? { ...c, summary } : c))} />
            ) : current ? (
              <MarksPanel highlights={highlights} active={activeMark} onJump={(b) => jump(b, b)} onNote={setNote} onRemove={removeMark} />
            ) : (
              <div className="empty-note">Zuerst einen Inhalt auswählen.</div>
            )}
          </div>
        </aside>
      </main>

      <footer className="colophon"><span>Artikel · PDF · YouTube · Podcast · Lesezeichen</span><span>v0.2</span></footer>
    </div>
  );
}
