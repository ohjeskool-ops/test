import { NextResponse } from "next/server";
import { parseTags } from "@/lib/normalize";
import { store } from "@/lib/store";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const item = await store.get((await params).id);
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json().catch(() => ({}));
  const patch: Parameters<typeof store.update>[1] = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (body.tags !== undefined) patch.tags = parseTags(body.tags);
  if (body.status === "read" || body.status === "unread") patch.status = body.status;
  if (typeof body.readPosition === "number") patch.readPosition = Math.min(1, Math.max(0, body.readPosition));
  const item = await store.update((await params).id, patch);
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const ok = await store.remove((await params).id);
  return ok ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
}
