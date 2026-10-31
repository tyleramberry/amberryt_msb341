// Numbers for the owner's log (spec 003), computed from run dumps. No storage of their own.

import type { RunDump } from "./run.ts";

type DumpTest = RunDump["tests"][number];

// The answer the judges liked most: the label with the highest mean overall score. A tie, or a
// task with no judge scores, has no top answer.
export function judgesTop(t: DumpTest): string | null {
  const best = judgesBest(t);
  return best.length === 1 ? best[0] : null;
}

// Every label that shares the highest mean score (more than one on a tie).
export function judgesBest(t: DumpTest): string[] {
  const means = t.answers
    .filter((a) => a.judge_scores.length)
    .map((a) => ({ label: a.label, mean: a.judge_scores.reduce((s, j) => s + j.overall, 0) / a.judge_scores.length }))
    .sort((x, y) => y.mean - x.mean);
  return means.filter((m) => m.mean === means[0]?.mean).map((m) => m.label);
}

// A rated task with judge scores counts. It matches when the judges' top answer is their best.
export function agreement(t: DumpTest): { counted: boolean; matched: boolean; top: string | null } {
  const counted = Boolean(t.rating) && t.answers.some((a) => a.judge_scores.length);
  const top = counted ? judgesTop(t) : null;
  return { counted, matched: counted && top !== null && top === t.rating?.best, top };
}

// The status the log shows. "rating" (waiting on picks) is a run whose answers are all in and
// that still needs the person, built from the run's own states.
export type LogStatus = "running" | "rating" | "finished" | "draft" | "failed";
export function logStatus(d: Pick<RunDump, "status" | "tests">): LogStatus {
  if (d.status === "finished" || d.status === "draft" || d.status === "failed") return d.status;
  const working = d.tests.some((t) => t.status === "queued" || t.status === "running");
  return working || !d.tests.length ? "running" : "rating";
}

export function summary(runs: RunDump[]) {
  const tests = runs.flatMap((d) => d.tests);
  const picks = new Map<string, number>();
  for (const d of runs) {
    for (const t of d.tests) if (t.rating?.best_model) picks.set(t.rating.best_model, (picks.get(t.rating.best_model) ?? 0) + 1);
  }
  const agree = tests.map(agreement).filter((a) => a.counted);
  return {
    runs: runs.length,
    running: runs.filter((d) => logStatus(d) === "running").length,
    finished: runs.filter((d) => d.status === "finished").length,
    rated: tests.filter((t) => t.rating).length,
    tasks: tests.length,
    spend: runs.reduce((s, d) => s + d.cost_usd, 0),
    picks: [...picks].sort((a, b) => b[1] - a[1]),
    agreed: agree.filter((a) => a.matched).length,
    judged: agree.length,
  };
}
