// The actionable result (spec 001, "The actionable result"): the model to pick in the person's
// own app, and a snippet of their own criteria to paste into its custom instructions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { inYourApp, instructionSnippet, pickCriteria, SNIPPET_LINES, snippetWhere } from "../src/actionable.ts";

const ids: Record<string, string> = {
  "GPT-6.1 Sol": "openai/gpt-6.1-sol",
  "Gemini 4 Argon": "google/gemini-4-argon",
  "Claude Sonnet 5.5": "anthropic/claude-sonnet-5.5",
};
const idOf = (m: string) => ids[m] ?? m;
const rows = [{ model: "GPT-6.1 Sol" }, { model: "Gemini 4 Argon" }, { model: "Claude Sonnet 5.5" }];

test("the winner runs in the person's app: use the winner", () => {
  const r = inYourApp(rows, idOf, "chatgpt", false);
  assert.equal(r.use_model, "GPT-6.1 Sol");
  assert.match(r.line!, /made for ChatGPT/);
});

test("the winner doesn't run in the person's app: use the best one that does", () => {
  const r = inYourApp(rows, idOf, "claude", false);
  assert.equal(r.use_model, "Claude Sonnet 5.5");
  assert.match(r.line!, /The best one you can use there is Claude Sonnet 5\.5 \(ranked 3\)/);
});

test("no app known, an unknown app, or Claude Code: use the winner and say nothing about the app", () => {
  for (const [app, cc] of [[null, false], ["other", false], ["claude", true]] as const) {
    const r = inYourApp(rows, idOf, app, cc);
    assert.equal(r.use_model, "GPT-6.1 Sol");
    assert.equal(r.line, null);
  }
});

test("nothing to rank: no model", () => {
  assert.deepEqual(inYourApp([], idOf, "chatgpt", false), { use_model: null, line: null });
});

test("criteria come from rated tasks first, round-robin, with repeats dropped", () => {
  const got = pickCriteria([
    { criteria: ["Unrated one", "Unrated two"], rated: false },
    { criteria: ["No em dashes", "Under 150 words", "Sounds like me", "Ends with a question"], rated: true },
    { criteria: ["no em dashes.", "Shows the steps"], rated: true },
  ]);
  assert.deepEqual(got, ["No em dashes", "Under 150 words", "Shows the steps", "Sounds like me", "Ends with a question", "Unrated one"]);
  assert.equal(got.length, SNIPPET_LINES);
});

test("criteria are scrubbed of emails and phone numbers", () => {
  assert.deepEqual(pickCriteria([{ criteria: ["Signs off as me (jo@example.com, 801-555-0100)"], rated: true }]), [
    "Signs off as me ([email], [phone])",
  ]);
});

test("the snippet is the header, the person's own lines, and the model to use", () => {
  const s = instructionSnippet({ criteria: ["No em dashes", "Under 150 words"], categories: ["writing", "math", "planning"], model: "Claude Sonnet 5.5", month: "Oct 2026" });
  assert.equal(
    s,
    "How I like answers (from my own MySI blind test, Oct 2026):\n- No em dashes\n- Under 150 words\nFor writing, math and planning, I use Claude Sonnet 5.5.",
  );
  assert.equal(instructionSnippet({ criteria: ["x"], categories: [], model: null, month: "Oct 2026" }), "");
  assert.match(instructionSnippet({ criteria: [], categories: [], model: "M", month: "Oct 2026" }), /For my kind of work, I use M\./);
});

test("snippet_where names the right place for each app", () => {
  assert.match(snippetWhere("chatgpt"), /Custom instructions/);
  assert.match(snippetWhere("claude"), /personal preferences/);
  assert.match(snippetWhere("gemini"), /Saved info/);
  assert.match(snippetWhere(null), /custom instructions or memory/);
  assert.match(snippetWhere("other"), /custom instructions or memory/);
});
