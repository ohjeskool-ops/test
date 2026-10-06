import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMessages, toSegments } from "../lib/ai.ts";
import type { ChatMessage, Item } from "../lib/types.ts";

const item = { id: "1", title: "T", blocks: ["a", "b", "c", "d"] } as unknown as Item;

test("toSegments: Absatzverweise werden 0-basiert mit inklusivem Ende übernommen", () => {
  const segs = toSegments(
    [
      { type: "text", text: "Antwort eins. ", citations: [{ type: "content_block_location", cited_text: "b", document_index: 0, document_title: "T", start_block_index: 1, end_block_index: 2, file_id: null }] },
      { type: "text", text: "Zwei.", citations: null },
    ] as never,
    4,
  );
  assert.deepEqual(segs, [
    { text: "Antwort eins. ", cites: [{ start: 1, end: 1, quote: "b" }] },
    { text: "Zwei.", cites: [] },
  ]);
});

test("toSegments: Dubletten und ungültige Bereiche fliegen raus, Bereiche werden begrenzt", () => {
  const cite = (s: number, e: number) => ({ type: "content_block_location", cited_text: "x", document_index: 0, document_title: null, start_block_index: s, end_block_index: e, file_id: null });
  const segs = toSegments([{ type: "text", text: "x", citations: [cite(0, 2), cite(0, 2), cite(3, 99), cite(9, 12)] }] as never, 4);
  assert.deepEqual(segs[0].cites.map((c) => [c.start, c.end]), [[0, 1], [3, 3]]);
});

test("toSegments: nicht unterstützte Zitatarten werden ignoriert", () => {
  const segs = toSegments([{ type: "text", text: "x", citations: [{ type: "page_location", cited_text: "x" }] }] as never, 4);
  assert.deepEqual(segs[0].cites, []);
});

test("buildMessages: Dokument nur in der ersten Nachricht, Verlauf als Text", () => {
  const history: ChatMessage[] = [
    { id: "a", itemId: "1", role: "user", text: "Frage 1", segments: null, createdAt: "" },
    { id: "b", itemId: "1", role: "assistant", text: "Antwort 1", segments: [], createdAt: "" },
  ];
  const msgs = buildMessages(item, item.blocks, history, "Frage 2");
  assert.equal(msgs.length, 3);
  assert.equal(Array.isArray(msgs[0].content) && (msgs[0].content as { type: string }[])[0].type, "document");
  assert.equal(msgs[1].content, "Antwort 1");
  assert.equal(msgs[2].content, "Frage 2");
});

test("buildMessages: ohne Verlauf enthält die einzige Nachricht Dokument und Frage", () => {
  const msgs = buildMessages(item, item.blocks, [], "Hallo?");
  assert.equal(msgs.length, 1);
  const c = msgs[0].content as { type: string; text?: string; citations?: { enabled: boolean } }[];
  assert.equal(c[0].type, "document");
  assert.equal(c[0].citations?.enabled, true);
  assert.equal(c[1].text, "Hallo?");
});
