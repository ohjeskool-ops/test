"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Item, Summary } from "@/lib/types";

async function call<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T & { error?: string } }> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  const data = res.status === 204 ? ({} as T) : await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function SummaryText({ text }: { text: string }) {
  return (
    <div className="summary">
      {text.split("\n").map((line, i) => {
        const l = line.trim();
        if (!l) return null;
        if (l === "Überblick" || l === "Wichtigste Aussagen") return <h4 key={i}>{l}</h4>;
        if (l.startsWith("- ")) return <div key={i} className="sum-li">{l.slice(2)}</div>;
        return <p key={i}>{l}</p>;
      })}
    </div>
  );
}

const label = (s: number, e: number) => (s === e ? `${s + 1}` : `${s + 1}–${e + 1}`);

export function AiPanel({ item, onJump, onSummary }: { item: Item | null; onJump: (start: number, end: number) => void; onSummary: (s: Summary) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sumBusy, setSumBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const id = item?.id;

  useEffect(() => {
    setMessages([]);
    setError(null);
    if (!id) return;
    let alive = true;
    call<{ messages: ChatMessage[] }>(`/api/items/${id}/chat`).then((r) => alive && r.ok && setMessages(r.data.messages));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, sending]);

  if (!item) return <div className="empty-note">Zuerst einen Inhalt auswählen.</div>;
  const noText = item.blocks.length === 0;
  const stale = item.summary && item.summary.contentHash !== item.contentHash;

  async function summarize(force: boolean) {
    if (!item) return;
    setSumBusy(true);
    setError(null);
    const r = await call<{ summary: Summary }>(`/api/items/${item.id}/summary`, { method: "POST", body: JSON.stringify({ force }) });
    setSumBusy(false);
    if (r.ok) onSummary(r.data.summary);
    else setError(r.data.error ?? "Zusammenfassung fehlgeschlagen.");
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!item || !text || sending) return;
    setSending(true);
    setError(null);
    const r = await call<{ messages: ChatMessage[] }>(`/api/items/${item.id}/chat`, { method: "POST", body: JSON.stringify({ message: text }) });
    setSending(false);
    if (r.ok) {
      setMessages((m) => [...m, ...r.data.messages]);
      setInput("");
    } else setError(r.data.error ?? "Die Frage konnte nicht beantwortet werden.");
  }

  async function clear() {
    if (!item || !confirm("Chatverlauf zu diesem Dokument löschen?")) return;
    await call(`/api/items/${item.id}/chat`, { method: "DELETE" });
    setMessages([]);
  }

  return (
    <div className="ai">
      <div className="ai-block">
        <div className="ai-head">
          <b>Zusammenfassung</b>
          <button className="btn-small" disabled={sumBusy || noText} onClick={() => summarize(!!item.summary)}>
            {sumBusy ? "…" : item.summary ? "Neu erstellen" : "Zusammenfassen"}
          </button>
        </div>
        {item.summary ? <SummaryText text={item.summary.text} /> : <div className="empty-note">{noText ? "Kein Text vorhanden." : "Noch keine Zusammenfassung."}</div>}
        {stale && <div className="note-box warn">Der Inhalt hat sich seit der Zusammenfassung geändert. „Neu erstellen“ aktualisiert sie.</div>}
      </div>

      <div className="ai-block ai-chat">
        <div className="ai-head">
          <b>Fragen an dieses Dokument</b>
          {messages.length > 0 && <button className="txt-btn" onClick={clear}>Verlauf löschen</button>}
        </div>
        <div className="chat-list">
          {messages.length === 0 && <div className="empty-note">Antworten verweisen auf nummerierte Absätze der Quelle.</div>}
          {messages.map((m) => (
            <div key={m.id} className={`chat-msg ${m.role}`}>
              {m.role === "user" || !m.segments
                ? m.text
                : m.segments.map((s, i) => (
                    <span key={i}>
                      {s.text}
                      {s.cites.map((c, j) => (
                        <button key={j} className="cite" title={c.quote} onClick={() => onJump(c.start, c.end)}>
                          [{label(c.start, c.end)}]
                        </button>
                      ))}
                    </span>
                  ))}
            </div>
          ))}
          {sending && <div className="chat-msg assistant pending">Die KI liest das Dokument …</div>}
          <div ref={endRef} />
        </div>
        {error && <div className="msg">{error}</div>}
        <form className="chat-form" onSubmit={send}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={noText ? "Kein Text vorhanden" : "Frage stellen …"} disabled={noText || sending} maxLength={4000} />
          <button className="btn" disabled={noText || sending || !input.trim()}>Senden</button>
        </form>
      </div>
    </div>
  );
}
