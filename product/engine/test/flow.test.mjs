// End-to-end tool flow against a running Worker with mock models (no OpenRouter key):
// start_benchmark -> save_tests -> run_models -> check_run -> get_answers -> submit_rating ->
// get_results, plus the rating page. Target: FLOW_URL, default a local `wrangler dev` on 8787.
import { test } from "node:test";
import assert from "node:assert/strict";

const base = (process.env.FLOW_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
let id = 0;

async function call(name, args = {}) {
  const res = await fetch(base + "/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method: "tools/call", params: { name, arguments: args } }),
  });
  const text = await res.text();
  const msg = text.includes("data: ") ? JSON.parse(/^data: (.*)$/m.exec(text)[1]) : JSON.parse(text);
  if (msg.error) throw new Error(JSON.stringify(msg.error));
  const r = msg.result;
  return { isError: Boolean(r.isError), data: JSON.parse(r.content[0].text), text: r.content[0].text };
}

const MODEL_NAMES = /GPT-5|Gemini|Claude|Llama|DeepSeek|Mistral|Grok|openai\/|google\/|anthropic\/|meta-llama\//;

const TESTS = [
  { category: "writing", title: "Reschedule a client", prompt: "Write a quick text to a client moving Thursday's mowing to Friday because of rain.", context: "", criteria: ["Under 50 words", "Says Friday and a time window", "Sounds friendly, not corporate"] },
  { category: "planning", title: "Plan the week's routes", prompt: "Plan my crew's mowing routes for the week.", context: "Six yards in Provo, four in Orem, two in Lehi. One truck.", criteria: ["Groups yards by city", "Fits in 4 days"] },
  { category: "explaining", title: "Explain aeration", prompt: "Explain to a customer why fall aeration is worth it. Call me at 801-555-1234.", context: "", criteria: ["good"] },
];

async function waitFor(runId, pred, tries = 60) {
  for (let i = 0; i < tries; i++) {
    const r = await call("check_run", { run_id: runId });
    if (pred(r.data)) return r.data;
    await new Promise((res) => setTimeout(res, 250));
  }
  throw new Error("timed out waiting on check_run");
}

test("full flow with mock models", async () => {
  const conn = await call("check_connection");
  assert.equal(conn.data.connected, true);

  const start = await call("start_benchmark", { label: "flow-test" });
  const runId = start.data.run_id;
  assert.match(runId, /^[A-Za-z0-9_-]{22}$/);
  assert.match(start.data.next_step, /One question at a time/);

  // Bad inputs come back as plain-language errors.
  assert.equal((await call("save_tests", { run_id: "nope", tests: TESTS })).isError, true);
  assert.equal((await call("run_models", { run_id: runId, person_confirmed: true })).isError, true, "no tests yet");

  const saved = await call("save_tests", { run_id: runId, tests: TESTS });
  assert.equal(saved.isError, false, saved.text);
  assert.deepEqual(saved.data.tests.map((t) => t.id), ["t1", "t2", "t3"]);
  assert.ok(saved.data.scrubbed.some((s) => s.includes("phone")), "phone number scrubbed");
  assert.ok(!saved.data.tests[2].prompt.includes("555"), "phone removed from prompt");
  const kinds = saved.data.coaching_notes.map((n) => n.kind);
  assert.ok(kinds.includes("vague_criteria") && kinds.includes("few_criteria"), kinds.join());
  assert.equal(saved.data.ready_to_confirm, false);

  assert.equal((await call("run_models", { run_id: runId, person_confirmed: false })).isError, true);
  const t0 = Date.now();
  const run = await call("run_models", { run_id: runId, person_confirmed: true });
  assert.equal(run.isError, false, run.text);
  assert.ok(Date.now() - t0 < 5000, "run_models returns at once");
  assert.deepEqual(run.data.lineup_companies, ["OpenAI", "Google", "Anthropic"]);
  assert.doesNotMatch(run.text, MODEL_NAMES, "lineup is by company only");
  const again = await call("run_models", { run_id: runId, person_confirmed: true });
  assert.equal(again.data.already_started, true, "second call doesn't start a second job");
  assert.equal((await call("save_tests", { run_id: runId, tests: TESTS })).isError, true, "tests locked after start");

  await waitFor(runId, (d) => d.next_test_to_rate === "t1");
  const ans = await call("get_answers", { run_id: runId });
  assert.equal(ans.data.test_id, "t1");
  assert.deepEqual(ans.data.answers.map((a) => a.label), ["A", "B", "C"]);
  assert.doesNotMatch(ans.text, MODEL_NAMES, "answers are blind");
  assert.match(ans.data.next_step, /exactly as given/);

  assert.equal((await call("submit_rating", { run_id: runId, test_id: "t1", best: "B", worst: "B" })).isError, true);
  assert.equal((await call("submit_rating", { run_id: runId, test_id: "t1", best: "Z" })).isError, true);
  const rated = await call("submit_rating", { run_id: runId, test_id: "t1", best: "b", worst: "C", note: "C too long" });
  assert.equal(rated.isError, false, rated.text);
  assert.doesNotMatch(rated.text, MODEL_NAMES);

  const done = await waitFor(runId, (d) => d.status === "ready");
  assert.deepEqual(done.tests.map((t) => t.status), ["rated", "ready_to_rate", "ready_to_rate"]);
  assert.doesNotMatch(JSON.stringify(done), MODEL_NAMES);

  // Rating page: blind before the reveal, rating through the form works.
  const page = await (await fetch(`${base}/r/${runId}?t=t2`)).text();
  assert.match(page, /Answer A/);
  assert.doesNotMatch(page, MODEL_NAMES, "page source is blind");
  const form = new URLSearchParams({ test_id: "t2", best: "A", worst: "C", note: "" });
  const post = await fetch(`${base}/r/${runId}/rate`, { method: "POST", body: form, redirect: "manual" });
  assert.equal(post.status, 303);
  const after = await call("check_run", { run_id: runId });
  assert.equal(after.data.tests[1].status, "rated", "page rating shows in chat");

  // Only best, no worst ("they're all fine").
  assert.equal((await call("submit_rating", { run_id: runId, test_id: "t3", best: "C" })).isError, false);

  const res = await call("get_results", { run_id: runId });
  assert.equal(res.isError, false, res.text);
  assert.match(res.data.headline, /came out on top: you picked it as best on \d of 3 tasks/);
  assert.match(res.data.ranking_table, /\| Rank \| AI model \|/);
  assert.equal(res.data.reveal.length, 3);
  assert.ok(res.data.memory_line.includes("MySI benchmark"));
  assert.match(res.text, MODEL_NAMES, "results reveal the models");

  // Results close rating.
  assert.equal((await call("submit_rating", { run_id: runId, test_id: "t1", best: "A" })).isError, true);
  const finalPage = await (await fetch(`${base}/r/${runId}`)).text();
  assert.match(finalPage, /Your MySI results/);

  const which = await call("which_model", { run_id: runId, task_description: "a client text" });
  assert.equal(which.data.found, true);

  const unknown = await fetch(`${base}/r/AAAAAAAAAAAAAAAAAAAAAA`);
  assert.equal(unknown.status, 404);
});

test("a model that fails is left out; the test is still ratable", async () => {
  const runId = (await call("start_benchmark", {})).data.run_id;
  const t = { ...TESTS[0], prompt: "MOCK_FAIL:openai/gpt-5 write the text" };
  await call("save_tests", { run_id: runId, tests: [t] });
  await call("run_models", { run_id: runId, person_confirmed: true });
  await waitFor(runId, (d) => d.status === "ready");
  const ans = await call("get_answers", { run_id: runId, test_id: "t1" });
  assert.deepEqual(ans.data.answers.map((a) => a.label), ["A", "B"]);
  const res = await call("get_results", { run_id: runId });
  assert.match(res.data.headline, /second opinion only/);
});

test("POST / works like /mcp for people who paste the bare URL", async () => {
  const res = await fetch(base + "/", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  assert.equal(res.status, 200);
  const text = await res.text();
  for (const name of ["check_connection", "start_benchmark", "save_tests", "run_models", "check_run", "get_answers", "submit_rating", "get_results", "which_model", "rerun_test", "get_task_ideas"]) {
    assert.ok(text.includes(`"${name}"`), name);
  }
});
