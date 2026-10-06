import { NextResponse } from "next/server";
import { toMarkdown } from "@/lib/export";
import { getStore, unauthorized } from "@/lib/get-store";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const store = await getStore();
  if (!store) return unauthorized();
  const item = await store.get((await params).id);
  if (!item) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  const slug = item.title.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "export";
  const json = new URL(req.url).searchParams.get("format") === "json";
  const highlights = await store.listHighlights(item.id);
  return new NextResponse(json ? JSON.stringify({ ...item, highlights }, null, 2) : toMarkdown(item, highlights), {
    headers: {
      "content-type": json ? "application/json; charset=utf-8" : "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.${json ? "json" : "md"}"`,
    },
  });
}
