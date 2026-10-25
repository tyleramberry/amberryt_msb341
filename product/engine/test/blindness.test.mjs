// Self-tests for the leak scanner, so a green blindness check means something.
import { test } from "node:test";
import assert from "node:assert/strict";
import { findLeaks } from "./blindness.mjs";

test("clean answer text passes", () => {
  assert.deepEqual(findLeaks("Answer A\n\nHi Dana, moving Thursday to Friday 9-11am. Thanks!"), []);
});

test("catches model names, case-insensitively, as whole words", () => {
  assert.ok(findLeaks("Written by Claude").length);
  assert.ok(findLeaks("this was GPT-5").length);
  assert.deepEqual(findLeaks("Dr. Metaxa wrote an operatic haikuology"), []);
});

test("catches judge, cost and latency fields", () => {
  assert.ok(findLeaks('{"overall": 8}').length);
  assert.ok(findLeaks('{"cost_usd": 0.01}').length);
  assert.ok(findLeaks("answered in 850 ms").length);
  assert.ok(findLeaks("Cost: $0.0042").length);
});

test("catches a label map", () => {
  assert.ok(findLeaks("B was sonnet").length);
});

test("allow list lets the lineup by company through", () => {
  assert.deepEqual(findLeaks("one each from OpenAI, Google and Anthropic", { allow: ["openai", "google", "anthropic"] }), []);
});
