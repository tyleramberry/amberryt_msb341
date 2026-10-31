// The owner's log numbers (spec 003): judges' top answer, agreement, and the log's status.
import { test } from "node:test";
import assert from "node:assert/strict";
import { agreement, judgesTop, logStatus } from "../src/logstats.ts";

const ans = (label: string, ...scores: number[]) => ({ label, model: label, text: "", latency_ms: null, cost_usd: null, judge_scores: scores.map((overall, i) => ({ judge: `j${i}`, overall, reason: "" })) });
const task = (answers: any[], best: string | null) => ({ answers, rating: best ? { best, worst: null, note: "", source: "page" } : null, status: best ? "rated" : "ready_to_rate" }) as any;

test("the judges' top answer is the highest mean score, and a tie has none", () => {
  assert.equal(judgesTop(task([ans("A", 6, 8), ans("B", 9, 6), ans("C", 5, 5)], null)), "B");
  assert.equal(judgesTop(task([ans("A", 8), ans("B", 8), ans("C", 2)], null)), null);
  assert.equal(judgesTop(task([ans("A"), ans("B")], null)), null);
});

test("agreement counts only rated tasks with judge scores", () => {
  assert.deepEqual(agreement(task([ans("A", 9), ans("B", 4)], "A")), { counted: true, matched: true, top: "A" });
  assert.deepEqual(agreement(task([ans("A", 9), ans("B", 4)], "B")), { counted: true, matched: false, top: "A" });
  assert.equal(agreement(task([ans("A", 7), ans("B", 7)], "A")).matched, false, "a tie is no match");
  assert.equal(agreement(task([ans("A", 9)], null)).counted, false);
  assert.equal(agreement(task([ans("A"), ans("B")], "A")).counted, false);
});

test("a run with every answer in that still needs picks is waiting on picks", () => {
  assert.equal(logStatus({ status: "running", tests: [{ status: "rated" }, { status: "running" }] } as any), "running");
  assert.equal(logStatus({ status: "ready", tests: [{ status: "rated" }, { status: "ready_to_rate" }] } as any), "rating");
  assert.equal(logStatus({ status: "finished", tests: [] } as any), "finished");
  assert.equal(logStatus({ status: "ready", tests: [{ status: "rated" }, { status: "failed" }] } as any), "finished", "nothing left to rate");
});
