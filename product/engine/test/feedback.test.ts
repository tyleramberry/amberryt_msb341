// Changes from the first outside user's run (discovery/interviews/2026-10-24-interview-06.md,
// decision 009): ties break on cost and speed, judges see style-rule facts, the app is detected.
import { test } from "node:test";
import assert from "node:assert/strict";
import { report, type Response } from "../src/bench.ts";
import { answerFacts, judgePrompt } from "../src/prompts.ts";
import { appOf } from "../src/tools.ts";

// Her real run: two tests, a three-way tie on her picks (each model scored 1.0).
const tests = [
  { id: "t1", category: "writing", title: "Follow-up after tasting pickup", prompt: "p", context: "", criteria: ["No em dashes"] },
  { id: "t2", category: "math", title: "Intercepts", prompt: "p", context: "", criteria: ["Visual"] },
];
const r = (eval_id: string, model: string, s: number, cost: number): Response => ({ eval_id, model, text: "x", duration_ms: s * 1000, cost });
const responses = [
  r("t1", "Claude Sonnet 4.5", 4.9, 0.006), r("t1", "Gemini 2.5 Pro", 10.1, 0.01), r("t1", "GPT-5", 27.7, 0.014),
  r("t2", "GPT-5", 9.7, 0.011), r("t2", "Gemini 2.5 Pro", 15.0, 0.016), r("t2", "Claude Sonnet 4.5", 6.2, 0.005),
];
const blind = {
  t1: { A: "Claude Sonnet 4.5", B: "Gemini 2.5 Pro", C: "GPT-5" },
  t2: { A: "GPT-5", B: "Gemini 2.5 Pro", C: "Claude Sonnet 4.5" },
};
const human = [
  { eval_id: "t1", best: "C", worst: "B", note: "" },
  { eval_id: "t2", best: "B", worst: "A", note: "" },
];

test("her three-way tie breaks toward the cheaper, faster model, and ranks are 1, 2, 3", () => {
  const rep = report({ tests, responses, blind, judge: [], human, forPerson: true });
  assert.deepEqual(rep.rows.map((x) => x.human), [1, 1, 1]);
  assert.equal(rep.rows[0].model, "Claude Sonnet 4.5");
  assert.match(rep.markdown, /\| 1 \| Claude Sonnet 4\.5 \|/);
  assert.match(rep.markdown, /\| 3 \| /);
  assert.match(rep.markdown, /equal scores go to the cheaper, faster model/);
});

test("a clear winner on her picks still wins even if it is the slowest and priciest", () => {
  const rep = report({ tests, responses, blind, judge: [], human: [{ eval_id: "t1", best: "C", worst: "A", note: "" }, { eval_id: "t2", best: "A", worst: "C", note: "" }], forPerson: true });
  assert.equal(rep.rows[0].model, "GPT-5");
});

test("judges get word and em dash counts, and avoid-rules are hard rules", () => {
  assert.equal(answerFacts("Hi there — thanks — see you"), '(7 words, 2 em dashes "—")');
  const p = judgePrompt(tests[0], [["A", "Thanks — see you."], ["B", "Thanks, see you."]]);
  assert.match(p, /hard rule/);
  assert.match(p, /RESPONSE A \(4 words, 1 em dash/);
  assert.match(p, /RESPONSE B \(3 words, 0 em dashes/);
});

test("the chat app is guessed from the client", () => {
  assert.equal(appOf({ clientName: "claude-ai" }), "claude");
  assert.equal(appOf({ userAgent: "claude-code/2.1" }), "claude");
  assert.equal(appOf({ clientName: "openai-mcp" }), "chatgpt");
  assert.equal(appOf({ userAgent: "node" }), undefined);
});
