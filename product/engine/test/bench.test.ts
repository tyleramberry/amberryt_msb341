// The TypeScript port must write the same report.md as bench.py for the committed runs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { blind, pyFixed, report } from "../src/bench.ts";

const runs = new URL("../../bench/runs/", import.meta.url);
const load = (run: string, name: string) => JSON.parse(readFileSync(new URL(`${run}/${name}`, runs), "utf8"));

for (const run of ["2026-10-19-builder", "2026-10-19-builder-2"]) {
  test(`report matches bench.py for ${run}`, () => {
    const { markdown } = report({
      tests: load(run, "evals.json"),
      responses: load(run, "responses.json"),
      blind: load(run, "blind.json"),
      judge: load(run, "judge.json"),
      human: load(run, "human.json"),
      meta: load(run, "meta.json"),
    });
    assert.equal(markdown, readFileSync(new URL(`${run}/report.md`, runs), "utf8"));
  });
}

test("judge-only report has no human columns filled", () => {
  const run = "2026-10-19-builder-2";
  const r = report({
    tests: load(run, "evals.json"),
    responses: load(run, "responses.json"),
    blind: load(run, "blind.json"),
    judge: load(run, "judge.json"),
  });
  assert.equal(r.rows[0].model, "haiku");
  assert.equal(r.rows[0].human, null);
  assert.equal(r.judgeAgreement, null);
});

test("blind gives every model one label and is a permutation", () => {
  const tests = [{ id: "e1", category: "c", title: "t", prompt: "p", context: "", criteria: ["x"] }];
  const responses = ["m1", "m2", "m3", "m4"].map((model) => ({ eval_id: "e1", model, text: model, duration_ms: 1 }));
  const seen = new Set<string>();
  for (let s = 0; s < 50; s++) {
    let seed = s + 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const map = blind(tests, responses, rand).e1;
    assert.deepEqual(Object.keys(map), ["A", "B", "C", "D"]);
    assert.deepEqual(Object.values(map).sort(), ["m1", "m2", "m3", "m4"]);
    seen.add(Object.values(map).join());
  }
  assert.ok(seen.size > 5, "shuffle should vary");
});

test("pyFixed rounds exact ties to even like Python", () => {
  assert.equal(pyFixed(2.125, 2), "2.12");
  assert.equal(pyFixed(0.375, 2), "0.38");
  assert.equal(pyFixed(0.5, 0), "0");
  assert.equal(pyFixed(1.5, 0), "2");
  assert.equal(pyFixed(62.5, 0), "62");
  assert.equal(pyFixed(1.25, 1), "1.2");
  assert.equal(pyFixed(7.15, 1), (7.15).toFixed(1));
  assert.equal(pyFixed(3.9, 1), "3.9");
});
