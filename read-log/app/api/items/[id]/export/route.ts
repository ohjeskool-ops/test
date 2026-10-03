import { NextResponse } from "next/server";
import { toMarkdown } from "@/lib/export";
import { store } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const item = await store.get((await params).id);
  if (!item) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  const slug = item.title.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "export";
  const json = new URL(req.url).searchParams.get("format") === "json";
  return new NextResponse(json ? JSON.stringify(item, null, 2) : toMarkdown(item), {
    headers: {
      "content-type": json ? "application/json; charset=utf-8" : "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.${json ? "json" : "md"}"`,
    },
  });
}
