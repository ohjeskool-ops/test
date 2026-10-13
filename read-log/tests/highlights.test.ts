import { test } from "node:test";
import assert from "node:assert/strict";
import { splitByHighlights } from "../lib/highlights.ts";
import { extractMeta } from "../lib/meta.ts";
import { toMarkdown } from "../lib/export.ts";
import type { Highlight, Item } from "../lib/types.ts";

test("splitByHighlights: Text vor, in und nach der Markierung", () => {
  assert.deepEqual(splitByHighlights("Hallo schöne Welt", [{ id: "a", start: 6, end: 12 }]), [
    { text: "Hallo ", hid: null },
    { text: "schöne", hid: "a" },
    { text: " Welt", hid: null },
  ]);
});

test("splitByHighlights: Überlappung wird abgeschnitten, Ende wird begrenzt", () => {
  const p = splitByHighlights("abcdefgh", [{ id: "a", start: 1, end: 5 }, { id: "b", start: 3, end: 99 }]);
  assert.deepEqual(p.map((x) => [x.text, x.hid]), [["a", null], ["bcde", "a"], ["fgh", "b"]]);
});

test("splitByHighlights: ohne Markierung bleibt der Text ganz", () => {
  assert.deepEqual(splitByHighlights("Text", []), [{ text: "Text", hid: null }]);
  assert.deepEqual(splitByHighlights("", []), [{ text: "", hid: null }]);
});

test("extractMeta bevorzugt Open Graph und fällt auf title und description zurück", () => {
  const og = extractMeta('<html><head><title>Alt</title><meta property="og:title" content="Neu  Titel"><meta name="description" content="Kurz"></head></html>', "https://x.org/");
  assert.deepEqual(og, { title: "Neu Titel", description: "Kurz" });
  const plain = extractMeta("<html><head><title> Nur Titel </title></head></html>", "https://x.org/");
  assert.deepEqual(plain, { title: "Nur Titel", description: "" });
});

test("toMarkdown enthält Markierungen mit Notiz und Absatznummer", () => {
  const item = { title: "T", source: "s", url: null, type: "article", createdAt: "x", status: "unread", tags: [], summary: null, blocks: ["Eins", "Zwei"] } as unknown as Item;
  const hs: Highlight[] = [{ id: "1", itemId: "i", block: 1, start: 0, end: 4, text: "Zwei", note: "wichtig", createdAt: "x" }];
  const md = toMarkdown(item, hs);
  assert.match(md, /## Markierungen/);
  assert.match(md, /> Zwei\n> — Absatz 2\n\nNotiz: wichtig/);
});
