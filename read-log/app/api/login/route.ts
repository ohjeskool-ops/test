import { createHash, timingSafeEqual } from "node:crypto";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

const digest = (s: string) => createHash("sha256").update(s).digest();

/**
 * PIN-Anmeldung: Die PIN schützt nur den Zugang. Dahinter meldet der Server ein festes Konto
 * (E-Mail/Passwort aus den Umgebungsvariablen) bei Supabase an, damit die Zeilen-Sicherheit greift.
 */
export async function POST(req: Request) {
  if (!supabaseConfigured) return NextResponse.json({ error: "Anmeldung ist hier nicht aktiv." }, { status: 400 });

  const { APP_PIN, APP_USER_EMAIL, APP_USER_PASSWORD } = process.env;
  if (!APP_PIN || !APP_USER_EMAIL || !APP_USER_PASSWORD) {
    return NextResponse.json({ error: "Anmeldung ist noch nicht eingerichtet." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";
  if (!/^\d{4,12}$/.test(pin)) return NextResponse.json({ error: "Bitte die PIN eingeben." }, { status: 400 });

  // Jeder Versuch zählt: höchstens 5 pro 15 Minuten (Zähler in der Datenbank, serverübergreifend).
  const plain = createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data: allowed, error: limitError } = await plain.rpc("pin_check");
  if (limitError) return NextResponse.json({ error: "Anmeldung momentan nicht möglich." }, { status: 503 });
  if (!allowed) return NextResponse.json({ error: "Zu viele Versuche. Bitte in 15 Minuten erneut versuchen." }, { status: 429 });

  if (!timingSafeEqual(digest(pin), digest(APP_PIN))) {
    return NextResponse.json({ error: "Falsche PIN." }, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: APP_USER_EMAIL, password: APP_USER_PASSWORD });
  if (error) return NextResponse.json({ error: "Anmeldung momentan nicht möglich." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
