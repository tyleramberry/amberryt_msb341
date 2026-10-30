// Coaching notes and scrubbing are deterministic rules (spec 001, "save_tests: validation and coaching").
import { test } from "node:test";
import assert from "node:assert/strict";
import { coach, scrubPersonalInfo, scrubSelfId } from "../src/coach.ts";
import { parseJudgeJson } from "../src/models.ts";

const t = (over: Record<string, unknown>) => ({
  id: "t1",
  category: "writing",
  title: "A task",
  prompt: "Write a short thank-you note to a customer.",
  context: "",
  criteria: ["Under 80 words", "Mentions their garden"],
  ...over,
});
const kinds = (tests: ReturnType<typeof t>[]) => coach(tests as any).map((n) => n.kind);

test("a clear task gets no notes", () => {
  assert.deepEqual(kinds([t({})]), []);
});

test("each rule fires on its example and only there", () => {
  assert.deepEqual(kinds([t({ criteria: ["Professional", "Under 80 words"] })]), ["vague_criteria"]);
  assert.deepEqual(kinds([t({ criteria: ["Under 80 words"] })]), ["few_criteria"]);
  assert.deepEqual(kinds([t({ prompt: "Reply to this email from my landlord." })]), ["missing_context"]);
  assert.deepEqual(kinds([t({ prompt: "Reply to this email from my landlord.", context: "Hi, rent is going up." })]), []);
  assert.deepEqual(kinds([t({ prompt: "Build me a landing page for my lawn business." })]), ["file_mode"]);
  assert.deepEqual(kinds([t({ prompt: "Write a phone script for calling past customers." })]), []);
  assert.deepEqual(kinds([t({}), t({ id: "t2" }), t({ id: "t3" })]), ["one_category"]);
  assert.deepEqual(kinds([t({}), t({ id: "t2" }), t({ id: "t3", category: "planning" })]), []);
});

test("personal info backstop", () => {
  const r = scrubPersonalInfo("Email jo@example.com or call (801) 555-1234 or 801.555.9876 about the 2024 bid.");
  assert.equal(r.text, "Email [email] or call [phone] or [phone] about the 2024 bid.");
  assert.deepEqual(r.found, ["email address", "phone number", "phone number"]);
});

test("self-identification is scrubbed unless the person named the brand", () => {
  assert.equal(scrubSelfId("As ChatGPT, I think...", "Write a note"), "As [model name removed], I think...");
  assert.equal(scrubSelfId("I'm Claude, made by Anthropic.", "Write a note"), "I'm [model name removed], made by [model name removed].");
  assert.equal(scrubSelfId("Gemini 2.5 Pro here.", "x"), "[model name removed] here.");
  assert.equal(scrubSelfId("As GPT-6.1 Sol, I think so.", "x"), "As [model name removed], I think so.");
  assert.equal(scrubSelfId("Gemini 4 Argon here.", "x"), "[model name removed] here.");
  assert.equal(scrubSelfId("ChatGPT is better for this.", "Compare ChatGPT and Claude"), "ChatGPT is better for this.");
  assert.equal(scrubSelfId("I'm Llama 4 Maverick.", "x"), "I'm [model name removed].");
  assert.equal(scrubSelfId("Use a llama-shaped planter. Ask Kimi.", "x"), "Use a llama-shaped planter. Ask Kimi.");
  assert.equal(scrubSelfId("I'm a model from OpenAI.", "x"), "I'm a model from [model name removed].");
});

test("companies an answer is about are kept (live Gemini test, bug 10)", () => {
  const list = "- Anthropic (SF, NY): AI safety company that builds the Claude family of models. https://www.anthropic.com/careers\n- OpenAI (SF): makes ChatGPT.";
  assert.equal(scrubSelfId(list, "List AI companies hiring interns in San Francisco"), list);
  assert.equal(scrubSelfId("I'd apply to Google DeepMind first.", "x"), "I'd apply to Google DeepMind first.");
  assert.equal(scrubSelfId("Labs such as OpenAI, as well as Anthropic, hire interns.", "x"), "Labs such as OpenAI, as well as Anthropic, hire interns.");
});

test("judge JSON is found inside a code fence", () => {
  const items = parseJudgeJson('```json\n[{"label":"a","criteria_scores":[4,5],"overall":12,"reason":"ok"}]\n```');
  assert.deepEqual(items, [{ label: "A", criteria_scores: [4, 5], overall: 10, reason: "ok" }]);
  assert.throws(() => parseJudgeJson("no json"));
});
