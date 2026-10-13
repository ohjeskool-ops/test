"use client";

import { useEffect, useRef, useState } from "react";

type State = { kind: "wait" } | { kind: "busy" } | { kind: "ok"; id: string; text: boolean } | { kind: "err"; text: string; id?: string };

export default function ImportPage() {
  const [state, setState] = useState<State>({ kind: "wait" });
  const [bookmarklet, setBookmarklet] = useState("");
  const handled = useRef(false);
  const hasOpener = typeof window !== "undefined" && !!window.opener;

  useEffect(() => {
    const O = window.location.origin;
    // Läuft im Browser der Quellseite: öffnet read-log und übergibt den sichtbaren Seiteninhalt.
    const code = `(()=>{const O=${JSON.stringify(O)};const w=window.open(O+'/import','readlog');addEventListener('message',e=>{if(e.origin===O&&e.data==='readlog-ready'){w.postMessage({html:document.documentElement.outerHTML,url:location.href},O)}})})()`;
    setBookmarklet("javascript:" + encodeURIComponent(code));

    if (!window.opener) return;
    async function onMessage(e: MessageEvent) {
      if (e.source !== window.opener || !e.data?.html || !e.data?.url || handled.current) return;
      handled.current = true;
      setState({ kind: "busy" });
      const res = await fetch("/api/items", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: e.data.url, html: e.data.html }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState({ kind: "ok", id: data.id, text: data.textStatus === "ok" });
      else setState({ kind: "err", text: data.error ?? "Import fehlgeschlagen.", id: data.existingId });
    }
    window.addEventListener("message", onMessage);
    window.opener.postMessage("readlog-ready", "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="app" style={{ maxWidth: 640, margin: "0 auto" }}>
      <header className="masthead"><h1>read-log · Import aus dem Browser</h1></header>
      {hasOpener ? (
        <div className="note-box">
          {state.kind === "wait" && "Warte auf Seiteninhalt …"}
          {state.kind === "busy" && "Speichere …"}
          {state.kind === "ok" && (<>{state.text ? "Gespeichert." : "Gespeichert, aber ohne lesbaren Text."} <a href={`/?open=${state.id}`}>In der Bibliothek öffnen →</a></>)}
          {state.kind === "err" && (<>{state.text} {state.id && <a href={`/?open=${state.id}`}>Vorhandenen Eintrag öffnen →</a>}</>)}
        </div>
      ) : (
        <div className="reader">
          <p className="block">Manche Seiten (z. B. Zeitungen) blockieren den automatischen Abruf oder laden Inhalte erst im Browser. Mit diesem Lesezeichen übernimmst du die Seite, die du gerade selbst offen hast.</p>
          <p className="block"><b>1.</b> Ziehe diesen Button in die Lesezeichen-Leiste deines Browsers:</p>
          <p className="block">
            {bookmarklet ? <a className="btn" style={{ display: "inline-block", textDecoration: "none" }} href={bookmarklet} onClick={(e) => e.preventDefault()} ref={(el) => el?.setAttribute("href", bookmarklet)}>+ read-log</a> : null}
          </p>
          <p className="block"><b>2.</b> Öffne einen Artikel, bei dem du angemeldet bist oder der sich normal lädt, und klicke das Lesezeichen. Ein kleines Fenster speichert die Seite.</p>
          <p className="block"><a href="/">← zurück zur Bibliothek</a></p>
          <p className="note-box">Es wird nur übernommen, was dein Browser tatsächlich anzeigt. Bezahlschranken werden nicht umgangen.</p>
        </div>
      )}
    </div>
  );
}
