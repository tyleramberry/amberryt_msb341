// Per-tool, limits and blindness tests against a Worker running mock models (no OpenRouter key).
// Complements flow.test.mjs (the happy path) with refusals, limits and leak scans.
// Run: npm run test:tools   (MCP_URL=... to target an existing server)
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { startTarget, stopTarget, rpc } from "./helpers.mjs";
import { assertBlind, findLeaks } from "./blindness.mjs";

let base, rid = 100;
before(async () => { base = await startTarget(); });
after(() => stopTarget());

async function tool(name, args = {}) {
  const r = await rpc(base, { jsonrpc: "2.0", id: ++rid, method: "tools/call", params: { name, arguments: args } });
  if (r.body.error) return { rpcError: r.body.error };
  const res = r.body.result;
  return { isError: Boolean(res.isError), text: res.content.map((c) => c.text).join(""), data: res.structuredContent, res };
}

const T = (over = {}) => ({
  category: "writing", title: "Reschedule a client",
  prompt: "Write a quick text to a client moving Thursday's mowing to Friday because of rain.",
  context: "", criteria: ["Under 50 words", "Says Friday and a time window"], ...over,
});
const tests3 = () => [T(), T({ category: "planning", title: "Plan routes" }), T({ category: "explaining", title: "Explain aeration" })];

async function newRun(label) {
  const s = await tool("start_benchmark", { label });
  return { id: s.data.run_id, start: s };
}
async function runToReady(tests = tests3()) {
  const { id } = await newRun();
  const saved = await tool("save_tests", { run_id: id, tests });
  assert.equal(saved.isError, false, saved.text);
  const run = await tool("run_models", { run_id: id, person_confirmed: true });
  assert.equal(run.isError, false, run.text);
  for (let i = 0; i < 80; i++) {
    const c = await tool("check_run", { run_id: id });
    if (c.data.status === "ready") return id;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("run never became ready");
}
const COMPANIES = ["openai", "google", "anthropic", "meta"];

describe("every tool", () => {
  test("read-only tools are annotated, writing tools are not", async () => {
    const { body } = await rpc(base, { jsonrpc: "2.0", id: 1, method: "tools/list" });
    const ro = new Set(["check_connection", "get_task_ideas", "check_run", "get_answers", "get_results", "which_model"]);
    for (const t of body.result.tools) {
      assert.equal(t.annotations?.readOnlyHint === true, ro.has(t.name), `${t.name} readOnlyHint`);
    }
    assert.deepEqual(body.result.tools.map((t) => t.name).sort(),
      [...ro, "start_benchmark", "save_tests", "run_models", "submit_rating", "rerun_test"].sort());
  });

  test("every success result has next_step in the text block and structuredContent, in plain words", async () => {
    const id = await runToReady();
    const results = [
      await tool("check_connection"),
      await tool("start_benchmark", {}),
      await tool("check_run", { run_id: id }),
      await tool("get_answers", { run_id: id }),
      await tool("submit_rating", { run_id: id, test_id: "t1", best: "A", worst: "B" }),
      await tool("rerun_test", { run_id: id }),
    ];
    for (const r of results) {
      assert.equal(r.isError, false, r.text);
      assert.ok(r.data.next_step, "next_step missing in structuredContent");
      assert.ok(JSON.parse(r.text).next_step, "next_step missing in text block");
      if (r.data.message_for_person) {
        assert.doesNotMatch(r.data.message_for_person, /\b(eval|evals|judge|openrouter|run[ _]id|json)\b/i);
      }
    }
  });

  test("errors are plain sentences with no stack trace or internals", async () => {
    const bad = [
      await tool("save_tests", { run_id: "nope", tests: tests3() }),
      await tool("run_models", { run_id: "nope", person_confirmed: true }),
      await tool("check_run", { run_id: "nope" }),
      await tool("get_answers", { run_id: "nope" }),
      await tool("submit_rating", { run_id: "nope", test_id: "t1", best: "A" }),
      await tool("get_results", { run_id: "nope" }),
    ];
    for (const r of bad) {
      assert.equal(r.isError, true, "should be isError");
      assert.doesNotMatch(r.text, /\bat \w+ \(|\.ts:\d+|TypeError|undefined|Error:/);
      assert.ok(r.text.length < 400);
    }
  });
});

describe("start_benchmark", () => {
  test("run ids are 128-bit-ish URL-safe, unique, and give independent runs", async () => {
    const ids = new Set();
    for (let i = 0; i < 5; i++) ids.add((await newRun()).id);
    assert.equal(ids.size, 5);
    for (const id of ids) assert.match(id, /^[A-Za-z0-9_-]{22,}$/); // 22 base64url chars = 132 bits
  });

  test("returns the interview rules and says test task, not eval, to the person", async () => {
    const { start } = await newRun();
    assert.match(start.data.next_step, /One question at a time/);
    assert.doesNotMatch(start.data.message_for_person ?? "", /\beval/i);
  });
});

describe("save_tests", () => {
  test("11 tests is refused and 10 is accepted", async () => {
    const { id } = await newRun();
    const eleven = Array.from({ length: 11 }, (_, i) => T({ title: `Task ${i}` }));
    assert.equal((await tool("save_tests", { run_id: id, tests: eleven })).isError, true);
    assert.equal((await tool("save_tests", { run_id: id, tests: eleven.slice(0, 10) })).isError, false);
  });

  test("field limits are enforced and the error names the field", async () => {
    const { id } = await newRun();
    const cases = [
      [T({ title: "x".repeat(81) }), /title|80/i],
      [T({ prompt: "x".repeat(4001) }), /prompt/i],
      [T({ context: "x".repeat(8001) }), /context/i],
      [T({ criteria: ["x".repeat(201), "ok"] }), /great answer|criteri/i],
      [T({ criteria: Array.from({ length: 8 }, (_, i) => `c${i}`) }), /great answer|criteri/i],
    ];
    for (const [t, re] of cases) {
      const r = await tool("save_tests", { run_id: id, tests: [t] });
      assert.ok(r.isError || r.rpcError, "should be refused");
      assert.match(r.text ?? r.rpcError.message, re);
    }
  });

  test("emails and phones are scrubbed and reported; ids are t1..tn", async () => {
    const { id } = await newRun();
    const r = await tool("save_tests", { run_id: id, tests: [
      T({ prompt: "Reply to dana@example.com or call (801) 555-0199 about Friday." }), T({ title: "Two" })] });
    assert.equal(r.isError, false);
    assert.deepEqual(r.data.tests.map((t) => t.id), ["t1", "t2"]);
    assert.doesNotMatch(r.text, /dana@example\.com|555-0199/);
    assert.ok(r.data.scrubbed.length >= 2);
  });

  test("saving again replaces the whole set", async () => {
    const { id } = await newRun();
    await tool("save_tests", { run_id: id, tests: tests3() });
    const r = await tool("save_tests", { run_id: id, tests: [T()] });
    assert.equal(r.data.tests.length, 1);
  });

  test("coaching: file-style answer, missing pasted material, one category", async () => {
    const { id } = await newRun();
    const r = await tool("save_tests", { run_id: id, tests: [
      T({ prompt: "Build me a landing page for my lawn business." }),
      T({ prompt: "Summarize this email for my crew." }),
      T({ title: "Third" })] });
    const kinds = r.data.coaching_notes.map((n) => n.kind);
    for (const k of ["file_mode", "missing_context", "one_category"]) assert.ok(kinds.includes(k), `${k} in ${kinds}`);
  });
});

describe("run_models", () => {
  test("refuses an empty set and a missing confirmation, and never starts twice", async () => {
    const { id } = await newRun();
    assert.equal((await tool("run_models", { run_id: id, person_confirmed: true })).isError, true);
    await tool("save_tests", { run_id: id, tests: tests3() });
    assert.equal((await tool("run_models", { run_id: id, person_confirmed: false })).isError, true);
    const a = await tool("run_models", { run_id: id, person_confirmed: true });
    const b = await tool("run_models", { run_id: id, person_confirmed: true });
    assert.equal(a.isError, false);
    assert.equal(b.data.already_started, true);
  });

  test("model counts outside 3..5 are refused", async () => {
    const { id } = await newRun();
    await tool("save_tests", { run_id: id, tests: tests3() });
    for (const models of [["openai/a", "google/b"], ["a/1", "b/2", "c/3", "d/4", "e/5", "f/6"]]) {
      const r = await tool("run_models", { run_id: id, person_confirmed: true, models });
      assert.ok(r.isError || r.rpcError, `${models.length} models should be refused`);
    }
  });

  test("result shows the lineup by company only", async () => {
    const { id } = await newRun();
    await tool("save_tests", { run_id: id, tests: tests3() });
    const r = await tool("run_models", { run_id: id, person_confirmed: true });
    assertBlind(r.text, { allow: COMPANIES });
    assert.doesNotMatch(r.text, /gpt-?\d|gemini|claude|llama|sonnet|opus|\b(openai|google|anthropic|meta-llama)\//i);
  });
});

describe("blindness before get_results", () => {
  test("no tool result leaks model names, judge scores, cost or latency", async () => {
    const id = await runToReady();
    const seen = [];
    seen.push(await tool("check_run", { run_id: id }));
    for (const t of ["t1", "t2", "t3"]) seen.push(await tool("get_answers", { run_id: id, test_id: t }));
    seen.push(await tool("submit_rating", { run_id: id, test_id: "t1", best: "A", worst: "C" }));
    seen.push(await tool("check_run", { run_id: id }));
    seen.push(await tool("which_model", { run_id: id, task_description: "a client text" }));
    for (const r of seen) {
      assert.deepEqual(findLeaks(r.text, { allow: COMPANIES }), [], r.text.slice(0, 300));
      assert.deepEqual(findLeaks(JSON.stringify(r.res.structuredContent ?? {}), { allow: COMPANIES }), []);
    }
  });

  test("the rating page source is blind, in every view, until the reveal", async () => {
    const id = await runToReady();
    for (const url of [`${base}/r/${id}`, `${base}/r/${id}?t=t1`, `${base}/r/${id}?t=t2`]) {
      const html = await (await fetch(url)).text();
      // Strip inline <style>/<script> boilerplate words that aren't data, then scan the rest.
      assertBlind(html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<meta[^>]*>/g, ""));
    }
  });

  test("answer labels are A..C (3-model default), reshuffled per test, and fixed once written", async () => {
    const id = await runToReady();
    const first = await tool("get_answers", { run_id: id, test_id: "t1" });
    const again = await tool("get_answers", { run_id: id, test_id: "t1" });
    assert.deepEqual(first.data.answers, again.data.answers, "same task must show the same order each time");
    assert.deepEqual(first.data.answers.map((a) => a.label), ["A", "B", "C"]);
  });
});

describe("submit_rating", () => {
  test("rules: best=worst refused, unknown label refused, unknown task refused, re-rating overwrites", async () => {
    const id = await runToReady();
    assert.equal((await tool("submit_rating", { run_id: id, test_id: "t1", best: "A", worst: "A" })).isError, true);
    assert.equal((await tool("submit_rating", { run_id: id, test_id: "t1", best: "Q" })).isError, true);
    assert.equal((await tool("submit_rating", { run_id: id, test_id: "t99", best: "A" })).isError, true);
    assert.equal((await tool("submit_rating", { run_id: id, test_id: "t1", best: "A", worst: "B" })).isError, false);
    assert.equal((await tool("submit_rating", { run_id: id, test_id: "t1", best: "C", worst: "A", note: "redo" })).isError, false);
    const c = await tool("check_run", { run_id: id });
    assert.equal(c.data.tests.filter((t) => t.status === "rated").length, 1);
  });
});

describe("get_results", () => {
  test("with no ratings it is labelled as the second opinion only, not the person's picks", async () => {
    const id = await runToReady();
    const r = await tool("get_results", { run_id: id });
    assert.equal(r.isError, false, r.text);
    assert.match(r.data.headline, /second opinion only/i);
  });

  test("after the reveal, rating is closed and the page shows the report", async () => {
    const id = await runToReady();
    await tool("submit_rating", { run_id: id, test_id: "t1", best: "A", worst: "B" });
    const r = await tool("get_results", { run_id: id });
    assert.equal(r.isError, false);
    assert.ok(r.data.reveal.length >= 1);
    assert.equal((await tool("submit_rating", { run_id: id, test_id: "t2", best: "A" })).isError, true);
    const rated = await fetch(`${base}/r/${id}/rate`, { method: "POST", body: new URLSearchParams({ test_id: "t2", best: "A", worst: "B" }), redirect: "manual" });
    assert.ok(rated.status >= 300, `page rating after reveal should not succeed silently (got ${rated.status})`);
  });
});

describe("rating page", () => {
  test("unknown ids are 404; a bad form post does not 500", async () => {
    assert.equal((await fetch(`${base}/r/AAAAAAAAAAAAAAAAAAAAAA`)).status, 404);
    const id = await runToReady();
    const bad = await fetch(`${base}/r/${id}/rate`, { method: "POST", body: new URLSearchParams({ test_id: "t1", best: "Z" }), redirect: "manual" });
    assert.ok(bad.status < 500, `got ${bad.status}`);
  });

  test("a non-form POST body is a client error, not a 500", async () => {
    const id = await runToReady();
    for (const ct of ["text/plain", "application/json"]) {
      const r = await fetch(`${base}/r/${id}/rate`, { method: "POST", headers: { "content-type": ct }, body: "{}", redirect: "manual" });
      assert.ok(r.status < 500, `content-type ${ct} gave ${r.status}`);
    }
  });

  test("page HTML escapes test text (no script injection from a test task)", async () => {
    const { id } = await newRun();
    await tool("save_tests", { run_id: id, tests: [T({ title: "<script>alert(1)</script>", prompt: "x <img src=x onerror=alert(1)>" }), T(), T()] });
    await tool("run_models", { run_id: id, person_confirmed: true });
    for (let i = 0; i < 80; i++) { const c = await tool("check_run", { run_id: id }); if (c.data.next_test_to_rate) break; await new Promise((r) => setTimeout(r, 250)); }
    const html = await (await fetch(`${base}/r/${id}?t=t1`)).text();
    assert.doesNotMatch(html, /<script>alert\(1\)<\/script>|<img src=x onerror/);
  });
});

describe("stubs", () => {
  test("rerun_test says it is coming soon", async () => {
    const id = await runToReady();
    const r = await tool("rerun_test", { run_id: id });
    assert.equal(r.isError, false);
    assert.match(r.text, /soon/i);
  });
});
