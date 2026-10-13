import { NextResponse } from "next/server";
import { AiError, summarize } from "@/lib/ai";
import { getStore, unauthorized } from "@/lib/get-store";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Liefert die gespeicherte Zusammenfassung; neu erzeugt wird nur auf Wunsch oder bei geändertem Inhalt. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const store = await getStore();
  if (!store) return unauthorized();
  const item = await store.get((await params).id);
  if (!item) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const current = item.summary && item.summary.contentHash === item.contentHash;
  if (current && body.force !== true) return NextResponse.json({ summary: item.summary, generated: false });

  try {
    const text = await summarize(item);
    const summary = { text, contentHash: item.contentHash, createdAt: new Date().toISOString() };
    await store.update(item.id, { summary });
    return NextResponse.json({ summary, generated: true });
  } catch (e) {
    if (e instanceof AiError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
