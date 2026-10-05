"use client";

import { useEffect, useRef, useState } from "react";
import { splitByHighlights } from "@/lib/highlights";
import type { ContentType, Highlight, Item } from "@/lib/types";

export interface Prefs {
  size: number;
  serif: boolean;
}

interface Sel {
  block: number;
  start: number;
  end: number;
}

const TYPE_LABEL: Record<ContentType, string> = { article: "Artikel", pdf: "PDF", youtube: "YouTube", podcast: "Podcast", bookmark: "Lesezeichen" };

function offsetIn(el: Element, node: Node, offset: number): number {
  const r = document.createRange();
  r.selectNodeContents(el);
  r.setEnd(node, offset);
  return r.toString().length;
}

/** Ermittelt, welche Absätze und Zeichenbereiche gerade markiert sind (ohne Randleerzeichen). */
function readSelection(root: HTMLElement): Sel[] {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return [];
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return [];
  const out: Sel[] = [];
  root.querySelectorAll<HTMLElement>(".block-text").forEach((el) => {
    if (!range.intersectsNode(el)) return;
    const text = el.textContent ?? "";
    let start = el.contains(range.startContainer) ? offsetIn(el, range.startContainer, range.startOffset) : 0;
    let end = el.contains(range.endContainer) ? offsetIn(el, range.endContainer, range.endOffset) : text.length;
    while (start < end && /\s/.test(text[start])) start++;
    while (end > start && /\s/.test(text[end - 1])) end--;
    if (end > start) out.push({ block: Number(el.dataset.b), start, end });
  });
  return out;
}

export function Reader(props: {
  item: Item | null;
  highlights: Highlight[];
  prefs: Prefs;
  onPrefs: (p: Prefs) => void;
  focus: boolean;
  onFocus: () => void;
  active: boolean;
  flash: { start: number; end: number } | null;
  tagDraft: string;
  onTagDraft: (v: string) => void;
  onPatch: (body: object) => void;
  onRemove: () => void;
  onAddHighlights: (list: Highlight[]) => void;
  onMark: (id: string) => void;
  onPosition: (pos: number) => void;
}) {
  const { item, highlights, prefs, flash } = props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Sel[]>([]);
  const [saving, setSaving] = useState(false);

  // Leseposition wiederherstellen, wenn ein Dokument geöffnet oder die Ansicht eingeblendet wird.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !item || !props.active) return;
    requestAnimationFrame(() => {
      el.scrollTop = (el.scrollHeight - el.clientHeight) * item.readPosition;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, props.active]);

  useEffect(() => {
    const onSel = () => {
      const root = scrollRef.current;
      setSel(root ? readSelection(root) : []);
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    props.onPosition(max > 0 ? el.scrollTop / max : 0);
  }

  async function mark() {
    if (!item || sel.length === 0 || saving) return;
    setSaving(true);
    const res = await fetch(`/api/items/${item.id}/highlights`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: sel }) });
    setSaving(false);
    if (res.ok) {
      const data = (await res.json()) as { highlights: Highlight[] };
      props.onAddHighlights(data.highlights);
      document.getSelection()?.removeAllRanges();
      setSel([]);
    }
  }

  const byBlock = new Map<number, Highlight[]>();
  for (const h of highlights) byBlock.set(h.block, [...(byBlock.get(h.block) ?? []), h]);
  const isBookmark = item?.type === "bookmark";

  return (
    <>
      <div className="reader-bar">
        <span className="section-label">Lesen</span>
        <button title="Schrift kleiner" onClick={() => props.onPrefs({ ...prefs, size: Math.max(12, prefs.size - 1) })}>A−</button>
        <button title="Schrift größer" onClick={() => props.onPrefs({ ...prefs, size: Math.min(22, prefs.size + 1) })}>A+</button>
        <button title="Schriftart wechseln" onClick={() => props.onPrefs({ ...prefs, serif: !prefs.serif })}>{prefs.serif ? "Serif" : "Mono"}</button>
        <button className="desktop-only" title="Bibliothek und Seitenleiste ausblenden" onClick={props.onFocus}>{props.focus ? "Fokus aus" : "Fokus"}</button>
      </div>

      <div className="pane-scroll" ref={scrollRef} onScroll={onScroll}>
        {!item ? (
          <div className="empty-note">Inhalt in der Bibliothek auswählen.</div>
        ) : (
          <div className="reader-wrap"><article className={`reader ${prefs.serif ? "serif" : "mono"}`} style={{ ["--rs" as string]: `${prefs.size}px` }}>
            <h2>{item.title}</h2>
            <div className="reader-meta">
              <span>{item.source}</span>
              <span>{TYPE_LABEL[item.type]}</span>
              <span>{new Date(item.createdAt).toLocaleDateString("de-DE")}</span>
              {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Original ↗</a>}
            </div>

            {isBookmark ? (
              <div className="bookmark-card">
                {item.blocks[0] && <p>{item.blocks[0]}</p>}
                {item.url && <a className="btn-small" href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", textDecoration: "none" }}>Seite öffnen ↗</a>}
              </div>
            ) : (
              <>
                {item.textStatus !== "ok" && <div className="note-box warn">Kein Text extrahiert. Bei dynamisch geladenen oder angemeldeten Seiten hilft das Lesezeichen für den Import aus dem Browser.</div>}
                {item.blocks.map((b, idx) => {
                  const hs = byBlock.get(idx) ?? [];
                  const pieces = splitByHighlights(b, hs.map((h) => ({ id: h.id, start: h.start, end: h.end })));
                  const flashed = flash && idx >= flash.start && idx <= flash.end;
                  const notes = hs.filter((h) => h.note.trim());
                  return (
                    <div key={idx} className="para">
                      <p id={`b${idx}`} className={`block${flashed ? " hl" : ""}`}>
                        <span className="block-no">{idx + 1}</span>
                        <span className="block-text" data-b={idx}>
                          {pieces.map((p, i) =>
                            p.hid ? (
                              <mark key={i} className="mg-hl" onClick={() => props.onMark(p.hid!)}>{p.text}</mark>
                            ) : (
                              <span key={i}>{p.text}</span>
                            ),
                          )}
                        </span>
                      </p>
                      {notes.length > 0 && (
                        <div>
                          {notes.map((h) => (
                            <div key={h.id} className="mg-note" onClick={() => props.onMark(h.id)}>{h.note}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            <details className="reader-details">
              <summary>Details</summary>
              <div className="reader-actions">
                <button className="btn-small" onClick={() => props.onPatch({ status: item.status === "read" ? "unread" : "read" })}>
                  {item.status === "read" ? "Als ungelesen markieren" : "Als gelesen markieren"}
                </button>
                <a href={`/api/items/${item.id}/export?format=md`}>Markdown</a>
                <a href={`/api/items/${item.id}/export?format=json`}>JSON</a>
                <button className="txt-btn del" onClick={props.onRemove}>Löschen</button>
              </div>
              <div className="tag-edit">
                <input className="tag-input" value={props.tagDraft} onChange={(e) => props.onTagDraft(e.target.value)} placeholder="Tags, durch Komma getrennt" />
                <button className="btn-small" onClick={() => props.onPatch({ tags: props.tagDraft })}>Tags speichern</button>
              </div>
            </details>
          </article></div>
        )}
      </div>

      {sel.length > 0 && !isBookmark && (
        <div className="sel-bar" onMouseDown={(e) => e.preventDefault()}>
          <button className="btn-small" onClick={mark} disabled={saving}>{saving ? "…" : "Markieren"}</button>
        </div>
      )}
    </>
  );
}
