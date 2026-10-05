"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AiPanel } from "./ai-panel";
import { MarksPanel } from "./marks-panel";
import { Reader, type Prefs } from "./reader";
import type { ContentType, Highlight, Item, ItemListEntry, ReadStatus, Summary } from "@/lib/types";

type View = "library" | "reader" | "chat";
type Side = "ai" | "marks";
const TYPE_LABEL: Record<ContentType, string> = { article: "Artikel", pdf: "PDF", youtube: "YouTube", podcast: "Podcast", bookmark: "Lesezeichen" };
const DEFAULT_PREFS: Prefs = { size: 14, serif: false };
const PREFS_KEY = "readlog-prefs-v2";

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string; existingId?: string } }> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  const data = res.status === 204 ? ({} as T) : await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function Page() {
  const [view, setView] = useState<View>("library");
  const [side, setSide] = useState<Side>("ai");
  const [chatOpen, setChatOpen] = useState(true);
  const [today, setToday] = useState("");
  const [sync, setSync] = useState<"loading" | "live" | "error">("loading");
  const [focus, setFocus] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [all, setAll] = useState<ItemListEntry[]>([]);
  const [found, setFound] = useState<ItemListEntry[] | null>(null);
  const [tab, setTab] = useState<"read" | "bookmark">("read");
  const [q, setQ] = useState("");
  const [type, setType] = useState<ContentType | "">("");
  const [status, setStatus] = useState<ReadStatus | "">("");
  const [tag, setTag] = useState("");
  const [url, setUrl] = useState("");
  const [newTags, setNewTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; info?: boolean; blocked?: boolean } | null>(null);
  const [current, setCurrent] = useState<Item | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeMark, setActiveMark] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [flash, setFlash] = useState<{ start: number; end: number } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    setToday(new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    if (window.innerWidth <= 1100) setChatOpen(false);
  }, []);

  // Leseeinstellungen pro Gerät merken (nur Komfort, die App läuft auch ohne).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {}
  }, []);
  function changePrefs(p: Prefs) {
    setPrefs(p);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    } catch {}
  }

  const reload = useCallback(async () => {
    setSync("loading");
    const a = await api<{ items: ItemListEntry[] }>("/api/items").catch(() => null);
    if (!a?.ok) return setSync("error");
    setAll(a.data.items);
    if (q.trim()) {
      const f = await api<{ items: ItemListEntry[] }>(`/api/items?q=${encodeURIComponent(q.trim())}`).catch(() => null);
      setFound(f?.ok ? f.data.items : []);
    } else setFound(null);
    setSync("live");
  }, [q]);

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

  async function toggleRead(id: string, status: ReadStatus) {
    const next: ReadStatus = status === "read" ? "unread" : "read";
    const r = await api<Item>(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    if (r.ok) {
      setCurrent((c) => (c && c.id === id ? { ...c, status: next } : c));
      reload();
    }
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
      body: JSON.stringify({ url: url.trim(), kind: tab === "bookmark" ? "bookmark" : "article", tags: newTags }),
    });
    setBusy(false);
    if (r.ok) {
      setUrl("");
      setNewTags("");
      setMsg({ text: tab === "bookmark" ? "Lesezeichen gespeichert." : r.data.textStatus === "ok" ? "Gespeichert." : "Gespeichert, aber ohne lesbaren Text (Seite lädt Inhalte per JavaScript oder ist geschützt).", info: true });
      await reload();
      open(r.data.id);
    } else {
      setMsg({ text: r.data.error ?? "Import fehlgeschlagen.", blocked: r.status === 502 && tab === "read" });
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

  async function removeItem(id: string, title: string) {
    if (!confirm(`„${title}“ endgültig löschen?`)) return;
    await api(`/api/items/${id}`, { method: "DELETE" });
    if (current?.id === id) {
      setCurrent(null);
      setHighlights([]);
    }
    reload();
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
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const inTab = (i: ItemListEntry) => (tab === "bookmark" ? i.type === "bookmark" : i.type !== "bookmark");
  const stat = {
    read: all.filter((i) => i.type !== "bookmark").length,
    bookmarks: all.filter((i) => i.type === "bookmark").length,
    unread: all.filter((i) => i.type !== "bookmark" && i.status === "unread").length,
    today: all.filter((i) => new Date(i.createdAt).getTime() >= startOfDay).length,
  };
  const base = (found ?? all).filter(inTab);
  const tags = [...new Set(base.flatMap((i) => i.tags))].sort();
  const items = base.filter((i) => (!status || i.status === status) && (!type || i.type === type) && (!tag || i.tags.includes(tag)));

  return (
    <div className={`app view-${view}`}>
      <header className="masthead">
        <h1>READ-LOG</h1>
        <div className="masthead-right">
          <button className="reload-btn" onClick={reload}>↻ Aktualisieren</button>
          {process.env.NEXT_PUBLIC_SUPABASE_URL && <button className="reload-btn" onClick={signOut}>Abmelden</button>}
          <button className="reload-btn desktop-only" onClick={() => setChatOpen((o) => !o)}>{chatOpen ? "Seitenleiste ausblenden »" : "« Seitenleiste"}</button>
          <span className="date">{today}</span>
        </div>
      </header>

      <div className="profile">Artikel · PDF · YouTube · Podcast · Lesezeichen — lesen, markieren, nachfragen</div>

      <div className="sync-bar">
        <div className={`sync-dot ${sync === "live" ? "live" : sync === "error" ? "error" : "loading"}`} />
        <span>{sync === "error" ? "Keine Verbindung" : sync === "loading" ? "Verbinde …" : `${stat.read} Inhalte · ${stat.bookmarks} Lesezeichen · Live`}</span>
      </div>

      <nav className="tabs">
        <button className={tab === "read" ? "active" : ""} onClick={() => { setTab("read"); setType(""); }}>Lesen<span className="tab-count">{stat.read}</span></button>
        <button className={tab === "bookmark" ? "active" : ""} onClick={() => { setTab("bookmark"); setType(""); }}>Lesezeichen<span className="tab-count">{stat.bookmarks}</span></button>
      </nav>

      <div className="market">
        <span className="m">Gesamt <b>{all.length}</b></span>
        <span className="m">Heute neu <b className="up">{stat.today}</b></span>
        <span className="m">Ungelesen <b>{stat.unread}</b></span>
        <span className="m">Markierungen <b>{highlights.length}</b></span>
      </div>

      <div className="add-bar">
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={tab === "bookmark" ? "Link als Lesezeichen speichern" : "Artikel-URL einfügen"} inputMode="url" />
        <input className="add-tags" value={newTags} onChange={(e) => setNewTags(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Tags, z. B. tools" />
        <button disabled={busy} onClick={add}>{busy ? "…" : "+ Hinzufügen"}</button>
      </div>
      {msg && (
        <div className={`msg ${msg.info ? "info" : ""}`}>
          {msg.text}
          {msg.blocked && <> Alternative: <a href="/import" target="_blank">Lesezeichen für den Import aus dem Browser</a>.</>}
        </div>
      )}

      <nav className="tabs mobile-tabs">
        {(["library", "reader", "chat"] as View[]).map((v) => (
          <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
            {{ library: "Bibliothek", reader: "Lesen", chat: "KI" }[v]}
          </button>
        ))}
      </nav>

      <main className={`layout ${chatOpen ? "chat-open" : "chat-closed"}${focus ? " focus" : ""}`} data-view={view}>
        {/* ── Bibliothek ── */}
        <section className="pane pane-library">
          <div className="section-label">{tab === "bookmark" ? "Lesezeichen" : "Bibliothek"} ({items.length})</div>
          <div className="filters">
            <Filter label="Alle" on={!status} set={() => setStatus("")} />
            <Filter label="Ungelesen" on={status === "unread"} set={() => setStatus("unread")} />
            <Filter label="Gelesen" on={status === "read"} set={() => setStatus("read")} />
          </div>
          {tab === "read" && (
            <div className="filters">
              <Filter label="Alle Typen" on={!type} set={() => setType("")} />
              {(["article", "pdf", "youtube", "podcast"] as ContentType[]).map((t) => (
                <Filter key={t} label={TYPE_LABEL[t]} on={type === t} set={() => setType(t)} />
              ))}
            </div>
          )}
          <div className="search-bar"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suche in Titel, Quelle, Text …" /></div>
          {tags.length > 0 && (
            <div className="feed-tags" style={{ marginTop: 0, marginBottom: 12 }}>
              {tags.map((t) => <button key={t} className={`tag ${tag === t ? "on" : ""}`} onClick={() => setTag(tag === t ? "" : t)}>{t}</button>)}
            </div>
          )}
          <div className="pane-scroll">
            {items.length === 0 && <div className="empty-note">{q || type || status || tag ? "Keine Treffer." : tab === "bookmark" ? "Noch keine Lesezeichen." : "Noch nichts gespeichert."}</div>}
            {items.map((i) => (
              <div
                key={i.id}
                role="button"
                tabIndex={0}
                className={`feed-item ${i.status} ${current?.id === i.id ? "active" : ""}`}
                onClick={() => open(i.id)}
                onKeyDown={(e) => e.key === "Enter" && open(i.id)}
              >
                <div className="feed-head">
                  <div>
                    <span className="feed-company">{i.source}</span>
                    {i.title.toLowerCase() !== i.source.toLowerCase() && <span className="feed-title">{i.title}</span>}
                  </div>
                  <div className="feed-icons">
                    <button
                      className={`icon-btn ${i.status === "read" ? "proc-active" : ""}`}
                      title={i.status === "read" ? "Als ungelesen markieren" : "Als gelesen markieren"}
                      aria-label={i.status === "read" ? "Als ungelesen markieren" : "Als gelesen markieren"}
                      onClick={(e) => { e.stopPropagation(); toggleRead(i.id, i.status); }}
                    >
                      ✓
                    </button>
                    <button
                      className="icon-btn del-btn"
                      title="Löschen"
                      aria-label="Löschen"
                      onClick={(e) => { e.stopPropagation(); removeItem(i.id, i.title); }}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="feed-meta">
                  <span>{TYPE_LABEL[i.type]}</span>
                  <span>{new Date(i.createdAt).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</span>
                  {i.status === "unread" && <span>ungelesen</span>}
                </div>
                {i.excerpt && <div className="feed-assessment">{i.excerpt}</div>}
                {i.tags.length > 0 && <div className="feed-tags">{i.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
              </div>
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
          <div className="tabs">
            <button className={side === "ai" ? "active" : ""} onClick={() => setSide("ai")}>KI</button>
            <button className={side === "marks" ? "active" : ""} onClick={() => setSide("marks")}>Markierungen{highlights.length > 0 && <span className="tab-count">{highlights.length}</span>}</button>
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

      <footer className="colophon"><span>Sync · Mac · iPhone · iPad</span><span></span></footer>
    </div>
  );
}
