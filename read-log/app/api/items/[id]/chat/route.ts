import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { AiError, ask } from "@/lib/ai";
import { getStore, unauthorized } from "@/lib/get-store";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const store = await getStore();
  if (!store) return unauthorized();
  return NextResponse.json({ messages: await store.listMessages((await params).id) });
}

export async function POST(req: Request, { params }: Ctx) {
  const store = await getStore();
  if (!store) return unauthorized();
  const id = (await params).id;
  const item = await store.get(id);
  if (!item) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const question = typeof body.message === "string" ? body.message.trim() : "";
  if (!question) return NextResponse.json({ error: "Bitte eine Frage eingeben." }, { status: 400 });
  if (question.length > 4000) return NextResponse.json({ error: "Die Frage ist zu lang." }, { status: 400 });

  try {
    const history = await store.listMessages(id);
    const answer = await ask(item, history, question);
    const now = Date.now();
    const messages: ChatMessage[] = [
      { id: randomUUID(), itemId: id, role: "user", text: question, segments: null, createdAt: new Date(now).toISOString() },
      { id: randomUUID(), itemId: id, role: "assistant", text: answer.text, segments: answer.segments, createdAt: new Date(now + 1).toISOString() },
    ];
    await store.addMessages(messages);
    return NextResponse.json({ messages });
  } catch (e) {
    if (e instanceof AiError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const store = await getStore();
  if (!store) return unauthorized();
  await store.clearMessages((await params).id);
  return new NextResponse(null, { status: 204 });
}
