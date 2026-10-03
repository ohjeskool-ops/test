"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === "up" && !data.session) return setMsg("Bestätigungs-Mail verschickt. Link anklicken, danach hier anmelden.");
    window.location.href = "/";
  }

  return (
    <div className="app" style={{ maxWidth: 420, margin: "0 auto" }}>
      <header className="masthead"><h1>read-log</h1></header>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <div className="section-label">{mode === "in" ? "Anmelden" : "Konto anlegen"}</div>
        <input className="tag-input" type="email" required autoComplete="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="tag-input" type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="Passwort (mind. 8 Zeichen)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" disabled={busy}>{busy ? "…" : mode === "in" ? "Anmelden" : "Konto anlegen"}</button>
        {msg && <div className="msg">{msg}</div>}
        <button type="button" className="txt-btn" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Noch kein Konto? Anlegen" : "Schon ein Konto? Anmelden"}
        </button>
      </form>
    </div>
  );
}
