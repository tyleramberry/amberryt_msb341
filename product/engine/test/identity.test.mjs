// Personal connector URLs (/mcp/u/<key>): keys are unique, profiles are isolated per key, and
// the plain /mcp URL has no memory.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTarget, stopTarget, rpc } from "./helpers.mjs";

let base;
before(async () => { base = await startTarget(); });
after(() => stopTarget());

async function mintKey() {
  const html = await (await fetch(`${base}/link`, { method: "POST" })).text();
  const m = html.match(new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/mcp/u/([A-Za-z0-9_-]{22})`));
  assert.ok(m, "Get my link should show a personal URL");
  return m[1];
}
async function tool(path, name, args = {}) {
  const res = await fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
  });
  const text = await res.text();
  const msg = JSON.parse(/^data: (.*)$/m.exec(text)?.[1] ?? text);
  return { status: res.status, isError: Boolean(msg.result?.isError), data: msg.result?.structuredContent, text: msg.result?.content?.[0]?.text };
}
const TESTS = [
  { category: "writing", title: "Reschedule a client", prompt: "Write a text moving Thursday to Friday.", context: "", criteria: ["Under 50 words", "Says Friday"] },
];

test("each click of Get my link makes a different 128-bit key", async () => {
  const keys = new Set([await mintKey(), await mintKey(), await mintKey()]);
  assert.equal(keys.size, 3);
});

test("a well-formed but unknown key is 404 and says how to get a link", async () => {
  const r = await fetch(`${base}/mcp/u/AAAAAAAAAAAAAAAAAAAAAA`, { method: "POST" });
  assert.equal(r.status, 404);
  assert.match(await r.text(), /isn't valid/);
});

test("malformed keys are 404, never 500", async () => {
  for (const k of ["short", "x".repeat(200), "%00", "a%2Fb", "<script>"]) {
    const r = await fetch(`${base}/mcp/u/${k}`, { method: "POST" });
    assert.equal(r.status, 404, `key ${k} gave ${r.status}`);
  }
});

test("a personal URL works as an MCP server", async () => {
  const key = await mintKey();
  const r = await tool(`/mcp/u/${key}`, "check_connection");
  assert.equal(r.status, 200);
  assert.equal(r.data.connected, true);
});

test("which_model with no finished benchmarks says nothing is tested yet, and never errors", async () => {
  const key = await mintKey();
  const r = await tool(`/mcp/u/${key}`, "which_model", { task_description: "a client text" });
  assert.equal(r.isError, false, r.text);
  assert.equal(r.data.found, false);
});

test("a run started on one personal URL is not listed for another person", async () => {
  const a = await mintKey();
  const b = await mintKey();
  const run = await tool(`/mcp/u/${a}`, "start_benchmark", { label: "mine" });
  await tool(`/mcp/u/${a}`, "save_tests", { run_id: run.data.run_id, tests: TESTS });
  const aAgain = await tool(`/mcp/u/${a}`, "start_benchmark", {});
  assert.match(aAgain.text, new RegExp(run.data.run_id), "control: person A is offered their own unfinished run");
  const bStart = await tool(`/mcp/u/${b}`, "start_benchmark", {});
  assert.notEqual(bStart.data.run_id, run.data.run_id);
  assert.doesNotMatch(bStart.text, new RegExp(run.data.run_id), "person B must not be offered person A's run");
  assert.doesNotMatch(bStart.text, /mine/);
});
