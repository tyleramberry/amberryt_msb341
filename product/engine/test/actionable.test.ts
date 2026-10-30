// The actionable result (spec 001, "The actionable result"): the model to pick in the person's
// own app, and a snippet of their own criteria to paste into its custom instructions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { inYourApp, instructionSnippet, snippetGroups, SNIPPET_LINES, snippetWhere } from "../src/actionable.ts";

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

test("criteria stay under their own kind of work: rated kinds first, one line per kind in turn, repeats dropped", () => {
  const got = snippetGroups([
    { category: "explaining", model: null, tests: [{ criteria: ["Unrated one", "Unrated two"] }] },
    { category: "writing", model: "W", tests: [{ criteria: ["No em dashes", "Under 150 words", "Sounds like me"] }, { criteria: ["no em dashes.", "Ends with a question"] }] },
    { category: "math", model: "M", tests: [{ criteria: ["Shows the steps", "No ASCII art"] }] },
  ]);
  assert.deepEqual(got, [
    { category: "writing", model: "W", criteria: ["No em dashes", "Under 150 words"] },
    { category: "math", model: "M", criteria: ["Shows the steps", "No ASCII art"] },
    { category: "explaining", model: null, criteria: ["Unrated one", "Unrated two"] },
  ]);
  assert.equal(got.flatMap((g) => g.criteria).length, SNIPPET_LINES);
});

test("criteria are scrubbed of emails and phone numbers", () => {
  assert.deepEqual(snippetGroups([{ category: "writing", model: "W", tests: [{ criteria: ["Signs off as me (jo@example.com, 801-555-0100)"] }] }])[0].criteria, [
    "Signs off as me ([email], [phone])",
  ]);
});

test("the snippet puts each kind of work's own lines under it, with the model to use for that kind", () => {
  const s = instructionSnippet({
    groups: [
      { category: "writing", model: "Claude Sonnet 5.5", tests: [{ criteria: ["Under 50 words", "Friendly, not corporate"] }] },
      { category: "planning", model: "GPT-6.1 Sol", tests: [{ criteria: ["Fits in 4 days"] }] },
    ],
    month: "Oct 2026",
  });
  assert.equal(
    s,
    [
      "How I like answers (from my own MySI blind test, Oct 2026):",
      "When I ask for help with writing (I use Claude Sonnet 5.5):",
      "- Under 50 words",
      "- Friendly, not corporate",
      "When I ask for help with planning (I use GPT-6.1 Sol):",
      "- Fits in 4 days",
    ].join("\n"),
  );
  assert.equal(instructionSnippet({ groups: [{ category: "writing", model: null, tests: [{ criteria: ["x"] }] }], month: "Oct 2026" }), "", "nothing rated, no snippet");
});

test("snippet_where names the right place for each app", () => {
  assert.match(snippetWhere("chatgpt"), /Custom instructions/);
  assert.match(snippetWhere("claude"), /personal preferences/);
  assert.match(snippetWhere("gemini"), /Saved info/);
  assert.match(snippetWhere(null), /custom instructions or memory/);
  assert.match(snippetWhere("other"), /custom instructions or memory/);
});
