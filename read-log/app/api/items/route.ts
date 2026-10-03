import { NextResponse } from "next/server";
import { ImportError, importArticle } from "@/lib/import";
import { store } from "@/lib/store";
import type { ContentType, ReadStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const items = await store.list({
    q: p.get("q") ?? undefined,
    type: (p.get("type") as ContentType) || undefined,
    tag: p.get("tag") ?? undefined,
    status: (p.get("status") as ReadStatus) || undefined,
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  try {
    const item = await importArticle({ url: body.url, html: body.html, tags: body.tags });
    return NextResponse.json({ id: item.id, textStatus: item.textStatus }, { status: 201 });
  } catch (e) {
    if (e instanceof ImportError) {
      return NextResponse.json({ error: e.message, existingId: e.existing?.id }, { status: e.status });
    }
    throw e;
  }
}
