"use client";

import { useState } from "react";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      window.location.href = "/";
      return;
    }
    setPin("");
    setMsg(data.error ?? "Anmeldung fehlgeschlagen.");
  }

  return (
    <div className="app" style={{ maxWidth: 360, margin: "0 auto" }}>
      <header className="masthead"><h1>read-log</h1></header>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <div className="section-label">PIN</div>
        <input
          className="tag-input"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          pattern="[0-9]*"
          maxLength={12}
          placeholder="PIN eingeben"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          style={{ fontSize: 20, letterSpacing: "0.4em", textAlign: "center" }}
        />
        <button className="btn" disabled={busy || pin.length < 4}>{busy ? "…" : "Öffnen"}</button>
        {msg && <div className="msg">{msg}</div>}
      </form>
    </div>
  );
}
