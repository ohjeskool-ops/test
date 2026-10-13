import { test } from "node:test";
import assert from "node:assert/strict";
import { hashText, normalizeUrl, parseTags } from "../lib/normalize.ts";

test("normalizeUrl entfernt Tracking, www, Hash und Slash", () => {
  assert.equal(
    normalizeUrl("https://WWW.Example.com/a/?utm_source=x&b=2&a=1#top"),
    "https://example.com/a?a=1&b=2",
  );
  assert.equal(normalizeUrl("https://example.com/a"), normalizeUrl("https://example.com/a/?fbclid=zzz"));
});

test("hashText ignoriert Whitespace und Groß-/Kleinschreibung", () => {
  assert.equal(hashText(["Hallo  Welt", "x"]), hashText(["hallo welt", "X"]));
  assert.notEqual(hashText(["a"]), hashText(["b"]));
});

test("parseTags dedupliziert und normalisiert", () => {
  assert.deepEqual(parseTags(" KI, ki ,Politik,"), ["ki", "politik"]);
});
