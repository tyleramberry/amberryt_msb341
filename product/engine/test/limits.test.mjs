// Daily run cap, on its own server so the cap is small and other suites are not affected.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTarget, stopTarget, rpc } from "./helpers.mjs";

let base;
before(async () => {
  if (process.env.MCP_URL) return; // can't set the cap on someone else's server
  base = await startTarget({ vars: { MAX_RUNS_PER_DAY: "2" } });
});
after(() => stopTarget());

const tool = async (name, args) => {
  const r = await rpc(base, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  return { isError: Boolean(r.body.result.isError), text: r.body.result.content[0].text, data: r.body.result.structuredContent };
};

test("the daily run cap refuses the third run_models with a plain sentence", { skip: !!process.env.MCP_URL }, async () => {
  const tests = [{ category: "w", title: "t", prompt: "Say hi.", context: "", criteria: ["short", "friendly"] }];
  const outcomes = [];
  for (let i = 0; i < 3; i++) {
    const { data } = await tool("start_benchmark", {});
    await tool("save_tests", { run_id: data.run_id, tests });
    outcomes.push(await tool("run_models", { run_id: data.run_id, person_confirmed: true }));
  }
  assert.deepEqual(outcomes.map((o) => o.isError), [false, false, true]);
  assert.match(outcomes[2].text, /limit/i);
  assert.doesNotMatch(outcomes[2].text, /\bat \w+ \(|\.ts:\d+/);
});
