import { NextResponse } from "next/server";
import { getStore, unauthorized } from "@/lib/get-store";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string; hid: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const store = await getStore();
  if (!store) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (typeof body.note !== "string") return NextResponse.json({ error: "Notiz fehlt." }, { status: 400 });
  const ok = await store.updateHighlightNote((await params).hid, body.note.slice(0, 5000));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const store = await getStore();
  if (!store) return unauthorized();
  const ok = await store.removeHighlight((await params).hid);
  return ok ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
}
