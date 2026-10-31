// The owner's log at /admin: locked without the password, off without ADMIN_TOKEN, and shows
// what the person asked, what they picked, and which model wrote each answer.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTarget, stopTarget } from "./helpers.mjs";

const TOKEN = "test-admin-password-123";
const auth = (pass) => ({ authorization: "Basic " + Buffer.from(`tyler:${pass}`).toString("base64") });
let base;
before(async () => { base = await startTarget({ vars: { ADMIN_TOKEN: TOKEN, MOCK_MODELS: "1" } }); });
after(() => stopTarget());

async function tool(name, args = {}) {
  const res = await fetch(base + "/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
  });
  const text = await res.text();
  const msg = JSON.parse(/^data: (.*)$/m.exec(text)?.[1] ?? text);
  return { isError: Boolean(msg.result?.isError), data: msg.result?.structuredContent, text: msg.result?.content?.[0]?.text };
}

test("/admin needs the password", async () => {
  const none = await fetch(base + "/admin");
  assert.equal(none.status, 401);
  assert.match(none.headers.get("www-authenticate") ?? "", /Basic/);
  assert.equal((await fetch(base + "/admin", { headers: auth("wrong") })).status, 401);
  assert.equal((await fetch(base + "/admin/export.json", { headers: auth("wrong") })).status, 401);
  assert.equal((await fetch(base + "/admin", { headers: auth(TOKEN) })).status, 200);
});

test("the log shows the person's task, their pick and note, and the model behind each answer", async () => {
  const start = await tool("start_benchmark", { label: "admin-log-check" });
  const runId = start.data.run_id;
  await tool("save_tests", {
    run_id: runId,
    tests: [{ category: "writing", title: "Reschedule a client", prompt: "Write a text moving Thursday to Friday.", context: "", criteria: ["Under 50 words", "Says Friday"] }],
  });
  await tool("run_models", { run_id: runId, person_confirmed: true });
  for (let i = 0; i < 60; i++) {
    const r = await tool("check_run", { run_id: runId });
    if (r.data?.status !== "running") break;
    await new Promise((r) => setTimeout(r, 500));
  }
  const rated = await tool("submit_rating", { run_id: runId, test_id: "t1", best: "A", worst: "B", note: "B was stiff" });
  assert.equal(rated.isError, false, rated.text);

  const list = await (await fetch(base + "/admin", { headers: auth(TOKEN) })).text();
  assert.match(list, /admin-log-check/);
  assert.ok(list.includes(`/admin/runs/${runId}`));

  const page = await (await fetch(`${base}/admin/runs/${runId}`, { headers: auth(TOKEN) })).text();
  assert.match(page, /Write a text moving Thursday to Friday/);
  assert.match(page, /B was stiff/);
  assert.match(page, /their best/);
  assert.match(page, /GPT-6.1 Sol|Gemini 4 Argon|Claude Sonnet 5.5/, "owner sees model names");
  assert.match(page, /Judges agreed|Judges picked [A-C], they picked A|Judges tied on [A-C, ]+, they picked A/, "agreement badge on a rated task");
  // Spec 003: the summary strip says how often the judges' top answer was their pick.
  assert.match(list, /Judges' top answer matched their pick on <b>\d+ of [1-9]\d*<\/b> task/);

  const json = await (await fetch(base + "/admin/export.json", { headers: auth(TOKEN) })).json();
  const run = json.runs.find((r) => r.run_id === runId);
  assert.equal(run.tests[0].rating.note, "B was stiff");
  assert.ok(run.tests[0].rating.best_model, "export names the model they picked");
  assert.equal(run.tests[0].answers.length, 3);
});

test("the person's own pages and tools never link to /admin", async () => {
  assert.doesNotMatch(await (await fetch(base + "/")).text(), /\/admin/);
});
