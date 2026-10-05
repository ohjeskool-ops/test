import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStore, unauthorized } from "@/lib/get-store";
import type { Highlight } from "@/lib/types";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const store = await getStore();
  if (!store) return unauthorized();
  return NextResponse.json({ highlights: await store.listHighlights((await params).id) });
}

/** Legt Markierungen an. Der Text kommt immer aus dem gespeicherten Absatz, nie vom Client. */
export async function POST(req: Request, { params }: Ctx) {
  const store = await getStore();
  if (!store) return unauthorized();
  const id = (await params).id;
  const item = await store.get(id);
  if (!item) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const raw: unknown[] = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const created: Highlight[] = [];
  for (const r of raw as { block?: unknown; start?: unknown; end?: unknown }[]) {
    const { block, start, end } = r;
    if (!Number.isInteger(block) || !Number.isInteger(start) || !Number.isInteger(end)) continue;
    const text = item.blocks[block as number];
    if (text === undefined || (start as number) < 0 || (end as number) > text.length || (end as number) <= (start as number)) continue;
    const quote = text.slice(start as number, end as number);
    if (!quote.trim()) continue;
    created.push({ id: randomUUID(), itemId: id, block: block as number, start: start as number, end: end as number, text: quote, note: "", createdAt: new Date().toISOString() });
  }
  if (created.length === 0) return NextResponse.json({ error: "Keine gültige Auswahl." }, { status: 400 });
  await store.addHighlights(created);
  return NextResponse.json({ highlights: created }, { status: 201 });
}
