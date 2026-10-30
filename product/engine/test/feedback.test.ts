// Changes from the first outside user's run (discovery/interviews/2026-10-24-interview-06.md,
// decision 009): ties break on cost and speed, judges see style-rule facts, the app is detected.
import { test } from "node:test";
import assert from "node:assert/strict";
import { report, type Response } from "../src/bench.ts";
import { readFileSync } from "node:fs";
import { answerFacts, asciiArtLines, enforceRules, judgePrompt } from "../src/prompts.ts";
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

const evalCases = JSON.parse(readFileSync(new URL("../../evals/judge-style-rules.json", import.meta.url), "utf8")).cases;
const evalCase = (id: string) => evalCases.find((c: { id: string }) => c.id === id);

test("judges are told which answer has ASCII art, and that it isn't 'visual' in a chat", () => {
  const { test: t, answers } = evalCase("ascii-art-math");
  assert.ok(asciiArtLines(answers.A) >= 5);
  assert.equal(asciiArtLines(answers.B), 0);
  const p = judgePrompt(t, Object.entries(answers));
  assert.match(p, /RESPONSE A \(\d+ words, 0 em dashes "—", \d+ lines of ASCII art\)/);
  assert.match(p, /RESPONSE B \(\d+ words, 0 em dashes "—"\)/);
  assert.match(p, /ASCII art .* does not make an answer\s+visual/);
});

test("markdown tables, rules and math lines aren't ASCII art", () => {
  assert.equal(asciiArtLines("| a | b |\n|---|:-:|\n| 1 | 2 |\n---\n2^(x+2) = 3\nx + 2 = log(3)\n- step one"), 0);
});

test("a judge that ignores the em dash rule is overruled in code", () => {
  const { test: t, answers } = evalCase("em-dash-rule");
  // What the judges did in interview 06: the em dash answer on top.
  const judged = [
    { label: "A", criteria_scores: [5, 5, 5, 4], overall: 9, reason: "" },
    { label: "B", criteria_scores: [5, 5, 5, 5], overall: 8, reason: "" },
  ];
  const [a, b] = enforceRules(t, Object.entries(answers), judged);
  assert.equal(a.overall, 5);
  assert.deepEqual(a.criteria_scores, [5, 5, 5, 1]);
  assert.equal(b.overall, 8);
  assert.ok(a.overall < b.overall);
  // No em dash rule in the criteria: scores are left alone.
  const free = { ...t, criteria: ["Warm"] };
  assert.equal(enforceRules(free, Object.entries(answers), judged)[0].overall, 9);
});

test("the chat app is guessed from the client", () => {
  assert.equal(appOf({ clientName: "claude-ai" }), "claude");
  assert.equal(appOf({ userAgent: "claude-code/2.1" }), "claude");
  assert.equal(appOf({ clientName: "openai-mcp" }), "chatgpt");
  assert.equal(appOf({ userAgent: "node" }), undefined);
});
