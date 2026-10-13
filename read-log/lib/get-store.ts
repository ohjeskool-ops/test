import { fileStore } from "./file-store";
import { createClient, supabaseConfigured } from "./supabase/server";
import { createSupabaseStore } from "./supabase-store";
import type { Store } from "./types";

/**
 * Mit Supabase-Konfiguration: Daten des angemeldeten Nutzers (null = nicht angemeldet).
 * Ohne Konfiguration: lokale JSON-Datei für die Entwicklung.
 */
export async function getStore(): Promise<Store | null> {
  if (!supabaseConfigured) return fileStore;
  const db = await createClient();
  const { data } = await db.auth.getUser();
  return data.user ? createSupabaseStore(db) : null;
}

export const unauthorized = () => Response.json({ error: "Nicht angemeldet." }, { status: 401 });
