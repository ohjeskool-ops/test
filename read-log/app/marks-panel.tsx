"use client";

import { useState } from "react";
import type { Highlight } from "@/lib/types";

export function MarksPanel(props: {
  highlights: Highlight[];
  active: string | null;
  onJump: (block: number) => void;
  onNote: (id: string, note: string) => void;
  onRemove: (id: string) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  if (props.highlights.length === 0) {
    return <div className="empty-note">Noch keine Markierungen. Text im Artikel auswählen und auf „Markieren“ tippen.</div>;
  }
  return (
    <div className="marks">
      {props.highlights.map((h) => (
        <div key={h.id} id={`m-${h.id}`} className={`mark-item${props.active === h.id ? " active" : ""}`}>
          <button className="mark-quote" onClick={() => props.onJump(h.block)} title="Zur Stelle springen">
            {h.text}
          </button>
          <div className="mark-meta">
            <span>Absatz {h.block + 1}</span>
            <button className="txt-btn del" onClick={() => props.onRemove(h.id)}>Entfernen</button>
          </div>
          <textarea
            className="mark-note"
            rows={1}
            placeholder="Notiz …"
            value={drafts[h.id] ?? h.note}
            onChange={(e) => setDrafts((d) => ({ ...d, [h.id]: e.target.value }))}
            onBlur={() => {
              const v = drafts[h.id];
              if (v !== undefined && v !== h.note) props.onNote(h.id, v);
            }}
          />
        </div>
      ))}
    </div>
  );
}
