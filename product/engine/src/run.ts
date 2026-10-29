// One Durable Object per benchmark run (specs/001-benchmark-engine-mcp.md, "Background job" and
// "Data"). It owns the run's SQLite tables and works through the model calls with alarms, one
// small step per alarm, saving every answer as it returns so a retried alarm resumes.

import { DurableObject } from "cloudflare:workers";
import { blind, report, type Judgment, type Rating, type Response, type Test } from "./bench.ts";
import { coach, LIMITS, scrubPersonalInfo, scrubSelfId, type CoachingNote } from "./coach.ts";
import { complete, isMock, ModelError, parseJudgeJson, type Env, type ModelInfo } from "./models.ts";
import { CLAUDE_CODE_CAVEAT, judgePrompt, MODEL_SYSTEM, modelPrompt, subagentPrompt } from "./prompts.ts";

export type Runner = "openrouter" | "claude_code";
export type RunStatus = "draft" | "running" | "ready" | "finished" | "failed";
export type TestStatus = "queued" | "running" | "ready_to_rate" | "rated" | "failed";

export type DraftTest = Omit<Test, "id">;

type Fail = { ok: false; error: string };
type Ok<T> = { ok: true } & T;

// Chat apps whose own models are in a lineup, keyed by get_results' `app` input.
export const APP_VENDOR: Record<string, string> = { claude: "anthropic", chatgpt: "openai", gemini: "google" };
const APP_NAME: Record<string, string> = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini" };

const MAX_IN_FLIGHT = 4;
const ANSWER_TOKENS = 2000;
const JUDGE_TOKENS = 2000;
const RETRY_DELAYS_MS = [2000, 5000]; // two retries after the first try

const SCHEMA = `
CREATE TABLE IF NOT EXISTS run (k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY, pos INTEGER, category TEXT, title TEXT, prompt TEXT, context TEXT, criteria TEXT);
CREATE TABLE IF NOT EXISTS responses (
  test_id TEXT, model TEXT, raw_text TEXT, display_text TEXT, latency_ms INTEGER,
  tokens_in INTEGER, tokens_out INTEGER, cost_usd REAL, error TEXT, PRIMARY KEY (test_id, model));
CREATE TABLE IF NOT EXISTS labels (test_id TEXT, label TEXT, model TEXT, PRIMARY KEY (test_id, label));
CREATE TABLE IF NOT EXISTS judgments (
  test_id TEXT, judge TEXT, label TEXT, criteria_scores TEXT, overall REAL, reason TEXT,
  PRIMARY KEY (test_id, judge, label));
CREATE TABLE IF NOT EXISTS judge_calls (
  test_id TEXT, judge TEXT, cost_usd REAL, error TEXT, PRIMARY KEY (test_id, judge));
CREATE TABLE IF NOT EXISTS ratings (
  test_id TEXT PRIMARY KEY, best TEXT, worst TEXT, note TEXT, source TEXT, rated_at TEXT);
CREATE TABLE IF NOT EXISTS events (at TEXT, action TEXT, outcome TEXT);
CREATE TABLE IF NOT EXISTS slots (slot_id TEXT PRIMARY KEY, test_id TEXT, model TEXT, used INTEGER DEFAULT 0);
`;

export type TestView = {
  id: string;
  category: string;
  title: string;
  prompt: string;
  context: string;
  criteria: string[];
  status: TestStatus;
};

export type RunView = {
  run_id: string;
  label: string;
  status: RunStatus;
  error: string | null;
  created_at: string;
  started_at: string | null;
  lineup: ModelInfo[];
  judges: ModelInfo[];
  tests: TestView[];
  cost_usd: number;
  runner: Runner;
};

export class RunObject extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(SCHEMA);
  }

  // ---- small helpers -------------------------------------------------------------------------

  private get(k: string): string | null {
    const rows = this.sql.exec<{ v: string }>("SELECT v FROM run WHERE k = ?", k).toArray();
    return rows.length ? rows[0].v : null;
  }

  private set(k: string, v: string | null) {
    if (v === null) this.sql.exec("DELETE FROM run WHERE k = ?", k);
    else this.sql.exec("INSERT OR REPLACE INTO run (k, v) VALUES (?, ?)", k, v);
  }

  private json<T>(k: string, fallback: T): T {
    const v = this.get(k);
    return v === null ? fallback : (JSON.parse(v) as T);
  }

  private status(): RunStatus {
    return (this.get("status") as RunStatus) ?? "draft";
  }

  private tests(): Test[] {
    return this.sql
      .exec<{ id: string; category: string; title: string; prompt: string; context: string; criteria: string }>(
        "SELECT id, category, title, prompt, context, criteria FROM tests ORDER BY pos",
      )
      .toArray()
      .map((r) => ({ ...r, criteria: JSON.parse(r.criteria) as string[] }));
  }

  private labelsFor(testId: string): Record<string, string> {
    const rows = this.sql
      .exec<{ label: string; model: string }>("SELECT label, model FROM labels WHERE test_id = ? ORDER BY label", testId)
      .toArray();
    return Object.fromEntries(rows.map((r) => [r.label, r.model]));
  }

  private rating(testId: string) {
    const rows = this.sql
      .exec<{ best: string; worst: string | null; note: string; source: string }>(
        "SELECT best, worst, note, source FROM ratings WHERE test_id = ?",
        testId,
      )
      .toArray();
    return rows[0] ?? null;
  }

  private answered(testId: string) {
    return this.sql
      .exec<{ model: string; error: string | null }>("SELECT model, error FROM responses WHERE test_id = ?", testId)
      .toArray();
  }

  private totalCost(): number {
    const a = this.sql.exec<{ c: number | null }>("SELECT SUM(cost_usd) AS c FROM responses").one().c ?? 0;
    const b = this.sql.exec<{ c: number | null }>("SELECT SUM(cost_usd) AS c FROM judge_calls").one().c ?? 0;
    return a + b;
  }

  log(action: string, outcome: string) {
    this.sql.exec("INSERT INTO events (at, action, outcome) VALUES (?, ?, ?)", new Date().toISOString(), action, outcome);
  }

  private testStatus(t: Test, current: string | null): TestStatus {
    if (this.rating(t.id)) return "rated";
    if (Object.keys(this.labelsFor(t.id)).length) return "ready_to_rate";
    const lineup = this.json<ModelInfo[]>("lineup", []);
    const answers = this.answered(t.id);
    if (lineup.length && answers.length >= lineup.length) {
      return answers.filter((a) => !a.error).length < 2 ? "failed" : "running";
    }
    return current === t.id ? "running" : "queued";
  }

  // ---- RPC: lifecycle ------------------------------------------------------------------------

  init(runId: string, label: string, tests: DraftTest[] = []): RunView {
    if (!this.get("run_id")) {
      this.set("run_id", runId);
      this.set("label", label);
      this.set("status", "draft");
      this.set("created_at", new Date().toISOString());
      if (tests.length) this.replaceTests(tests);
      this.log("start_benchmark", "created");
    }
    return this.view();
  }

  exists(): boolean {
    return this.get("run_id") !== null;
  }

  view(): RunView {
    const current = this.get("current_test");
    return {
      run_id: this.get("run_id") ?? "",
      label: this.get("label") ?? "",
      status: this.status(),
      error: this.get("error"),
      created_at: this.get("created_at") ?? "",
      started_at: this.get("started_at"),
      lineup: this.json<ModelInfo[]>("lineup", []),
      judges: this.json<ModelInfo[]>("judges", []),
      tests: this.tests().map((t) => ({ ...t, status: this.testStatus(t, current) })),
      cost_usd: this.totalCost(),
      runner: this.runner(),
    };
  }

  private replaceTests(tests: DraftTest[]) {
    this.sql.exec("DELETE FROM tests");
    tests.forEach((t, i) => {
      this.sql.exec(
        "INSERT INTO tests (id, pos, category, title, prompt, context, criteria) VALUES (?, ?, ?, ?, ?, ?, ?)",
        `t${i + 1}`,
        i,
        t.category,
        t.title,
        t.prompt,
        t.context,
        JSON.stringify(t.criteria),
      );
    });
  }

  saveTests(drafts: DraftTest[]): Fail | Ok<{ tests: Test[]; notes: CoachingNote[]; scrubbed: string[] }> {
    if (this.status() !== "draft") {
      return { ok: false, error: "This benchmark has already started, so its test tasks can't change. Call check_run instead." };
    }
    if (drafts.length < 1 || drafts.length > LIMITS.maxTests) {
      return { ok: false, error: `A benchmark has 1 to ${LIMITS.maxTests} test tasks; this has ${drafts.length}.` };
    }
    const scrubbed: string[] = [];
    const clean: DraftTest[] = [];
    for (const [i, d] of drafts.entries()) {
      const n = i + 1;
      const tooLong = (field: string, value: string, max: number) =>
        value.length > max ? `Test task ${n}: ${field} is ${value.length} characters; the limit is ${max}.` : null;
      const err =
        (!d.title.trim() && `Test task ${n} has no title.`) ||
        (!d.prompt.trim() && `Test task ${n} has no prompt.`) ||
        (!d.category.trim() && `Test task ${n} has no category.`) ||
        tooLong("title", d.title, LIMITS.title) ||
        tooLong("prompt", d.prompt, LIMITS.prompt) ||
        tooLong("context", d.context, LIMITS.context) ||
        ((d.criteria.length < 1 || d.criteria.length > LIMITS.maxCriteria) &&
          `Test task ${n} needs 1 to ${LIMITS.maxCriteria} things a great answer gets right; it has ${d.criteria.length}.`) ||
        d.criteria.map((c, k) => tooLong(`criterion ${k + 1}`, c, LIMITS.criterion)).find(Boolean);
      if (err) return { ok: false, error: err };
      const prompt = scrubPersonalInfo(d.prompt.trim());
      const context = scrubPersonalInfo(d.context.trim());
      for (const f of [...prompt.found, ...context.found]) scrubbed.push(`Test task ${n}: removed an ${f}`);
      clean.push({
        category: d.category.trim().toLowerCase(),
        title: d.title.trim(),
        prompt: prompt.text,
        context: context.text,
        criteria: d.criteria.map((c) => c.trim()).filter(Boolean),
      });
    }
    this.replaceTests(clean);
    const tests = this.tests();
    this.log("save_tests", `${tests.length} tests`);
    return { ok: true, tests, notes: coach(tests), scrubbed };
  }

  // runner "claude_code": the host runs the models as sub-agents on the person's own plan and
  // sends the answers with submitAnswers; the engine still blinds, judges and ranks.
  async start(
    lineup: ModelInfo[],
    judges: ModelInfo[],
    runner: Runner = "openrouter",
  ): Promise<Fail | Ok<{ already: boolean; view: RunView }>> {
    const status = this.status();
    if (status !== "draft") return { ok: true, already: true, view: this.view() };
    if (!this.tests().length) return { ok: false, error: "There are no test tasks yet. Call save_tests first." };
    this.set("runner", runner);
    this.set("lineup", JSON.stringify(lineup));
    this.set("judges", JSON.stringify(judges));
    this.set("status", "running");
    this.set("started_at", new Date().toISOString());
    this.log("run_models", `started ${lineup.length} models, ${judges.length} judges`);
    await this.ctx.storage.setAlarm(Date.now());
    return { ok: true, already: false, view: this.view() };
  }

  // ---- background job ------------------------------------------------------------------------

  async alarm() {
    if (this.status() !== "running") return;
    try {
      const more = await this.step();
      if (more) await this.ctx.storage.setAlarm(Date.now());
    } catch (e) {
      // Let the platform retry the alarm; answers saved so far are kept.
      this.log("alarm", `error: ${(e as Error).message}`);
      throw e;
    }
  }

  // One unit of work, in test order: a test's answers, then its blind labels, then its judging.
  // Returns true while there is more to do.
  private async step(): Promise<boolean> {
    const lineup = this.json<ModelInfo[]>("lineup", []);
    const judges = this.json<ModelInfo[]>("judges", []);
    const maxCost = Number(this.get("max_cost_usd") ?? "2");
    if (this.totalCost() > maxCost) return this.fail(`Stopped: this benchmark reached its US$${maxCost} cost cap.`);

    for (const t of this.tests()) {
      const answers = this.answered(t.id);
      const missing = lineup.filter((m) => !answers.some((a) => a.model === m.id));
      if (missing.length) {
        this.set("current_test", t.id);
        if (this.runner() === "claude_code") return false; // wait for submitAnswers
        for (let i = 0; i < missing.length; i += MAX_IN_FLIGHT) {
          await Promise.all(missing.slice(i, i + MAX_IN_FLIGHT).map((m) => this.answer(t, m)));
        }
        return true;
      }
      const ok = answers.filter((a) => !a.error);
      if (ok.length < 2) continue; // failed test: shown as failed, left out of the ranking
      if (!Object.keys(this.labelsFor(t.id)).length) {
        this.writeLabels(t);
        return true;
      }
      const judged = this.sql
        .exec<{ judge: string }>("SELECT judge FROM judge_calls WHERE test_id = ?", t.id)
        .toArray()
        .map((r) => r.judge);
      const pending = judges.filter((j) => !judged.includes(j.id));
      if (pending.length) {
        this.set("current_test", t.id);
        await Promise.all(pending.map((j) => this.judge(t, j)));
        return true;
      }
    }

    this.set("current_test", null);
    const tests = this.tests();
    const ratable = tests.filter((t) => Object.keys(this.labelsFor(t.id)).length).length;
    if (ratable * 2 < tests.length || ratable === 0) {
      return this.fail("Fewer than 2 AI models answered most of the test tasks, so there is nothing fair to compare.");
    }
    this.set("status", "ready");
    this.log("job", "ready");
    return false;
  }

  private fail(reason: string): false {
    this.set("status", "failed");
    this.set("error", reason);
    this.set("current_test", null);
    this.log("job", `failed: ${reason}`);
    return false;
  }

  private async withRetries<T>(fn: () => Promise<T>): Promise<T> {
    let last: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        return await fn();
      } catch (e) {
        last = e;
        if (e instanceof ModelError && !e.retry) break; // trying again would fail the same way
        if (attempt < RETRY_DELAYS_MS.length && !isMock(this.env)) {
          await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        }
      }
    }
    throw last;
  }

  private async answer(t: Test, m: ModelInfo) {
    try {
      const c = await this.withRetries(() =>
        complete(this.env, m.id, modelPrompt(t), { system: MODEL_SYSTEM, maxTokens: ANSWER_TOKENS }),
      );
      this.sql.exec(
        `INSERT OR REPLACE INTO responses
           (test_id, model, raw_text, display_text, latency_ms, tokens_in, tokens_out, cost_usd, error)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        t.id,
        m.id,
        c.text,
        scrubSelfId(c.text, `${t.prompt}\n${t.context}`),
        c.duration_ms,
        c.tokens_in,
        c.tokens_out,
        c.cost,
      );
    } catch (e) {
      this.sql.exec(
        "INSERT OR REPLACE INTO responses (test_id, model, error) VALUES (?, ?, ?)",
        t.id,
        m.id,
        String((e as Error).message).slice(0, 300),
      );
      this.log("model_call", `${t.id} failed`);
    }
  }

  private writeLabels(t: Test) {
    const ok = this.sql
      .exec<{ model: string }>("SELECT model FROM responses WHERE test_id = ? AND error IS NULL", t.id)
      .toArray()
      .map((r) => ({ eval_id: t.id, model: r.model, text: "", duration_ms: 0 }));
    const random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const map = blind([t], ok, random)[t.id];
    for (const [label, model] of Object.entries(map)) {
      this.sql.exec("INSERT INTO labels (test_id, label, model) VALUES (?, ?, ?)", t.id, label, model);
    }
  }

  private blindAnswers(testId: string): [string, string][] {
    const labels = this.labelsFor(testId);
    return Object.entries(labels).map(([label, model]) => {
      const r = this.sql
        .exec<{ display_text: string }>("SELECT display_text FROM responses WHERE test_id = ? AND model = ?", testId, model)
        .one();
      return [label, r.display_text];
    });
  }

  private async judge(t: Test, j: ModelInfo) {
    const prompt = judgePrompt(t, this.blindAnswers(t.id));
    const labels = Object.keys(this.labelsFor(t.id));
    let cost = 0;
    try {
      // A reply that doesn't parse is re-asked once (spec: "retry once, then skip").
      let items: ReturnType<typeof parseJudgeJson> | null = null;
      for (let attempt = 0; attempt < 2 && !items; attempt++) {
        // Failed calls still bill; count them so the run's cost is real.
        const c = await this.withRetries(() =>
          complete(this.env, j.id, prompt, { maxTokens: JUDGE_TOKENS, reasoning: j.reasoning }).catch((e) => {
            if (e instanceof ModelError) cost += e.cost ?? 0;
            throw e;
          }),
        );
        cost += c.cost ?? 0;
        try {
          const parsed = parseJudgeJson(c.text).filter((it) => labels.includes(it.label));
          if (parsed.length) items = parsed;
        } catch {
          // fall through to the second attempt
        }
      }
      if (!items) throw new Error("judge reply did not parse");
      for (const it of items) {
        this.sql.exec(
          "INSERT OR REPLACE INTO judgments (test_id, judge, label, criteria_scores, overall, reason) VALUES (?, ?, ?, ?, ?, ?)",
          t.id,
          j.id,
          it.label,
          JSON.stringify(it.criteria_scores),
          it.overall,
          it.reason,
        );
      }
      this.sql.exec("INSERT OR REPLACE INTO judge_calls (test_id, judge, cost_usd, error) VALUES (?, ?, ?, NULL)", t.id, j.id, cost);
    } catch (e) {
      this.sql.exec(
        "INSERT OR REPLACE INTO judge_calls (test_id, judge, cost_usd, error) VALUES (?, ?, ?, ?)",
        t.id,
        j.id,
        cost,
        String((e as Error).message).slice(0, 300),
      );
      this.log("judge_call", `${t.id} failed`);
    }
  }

  runner(): Runner {
    return (this.get("runner") as Runner) ?? "openrouter";
  }

  // Claude Code plan mode: one slot per test x model still to answer, in test order. Slot ids are
  // opaque so the answers sent back can't be mislabelled by test or model name.
  plan(): Fail | Ok<{ slots: { slot_id: string; test_id: string; model: string; prompt: string }[] }> {
    if (this.runner() !== "claude_code") return { ok: false, error: "This benchmark runs on MySI's models; there's no plan to run. Call check_run." };
    if (this.status() !== "running") return { ok: false, error: "No answers are needed now. Call check_run." };
    const lineup = this.json<ModelInfo[]>("lineup", []);
    const slots: { slot_id: string; test_id: string; model: string; prompt: string }[] = [];
    for (const t of this.tests()) {
      const answered = this.answered(t.id).map((a) => a.model);
      for (const m of lineup.filter((m) => !answered.includes(m.id))) {
        let slot = this.sql
          .exec<{ slot_id: string }>("SELECT slot_id FROM slots WHERE test_id = ? AND model = ? AND used = 0", t.id, m.id)
          .toArray()[0]?.slot_id;
        if (!slot) {
          const bytes = crypto.getRandomValues(new Uint8Array(9));
          slot = "s_" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
          this.sql.exec("INSERT INTO slots (slot_id, test_id, model) VALUES (?, ?, ?)", slot, t.id, m.id);
        }
        slots.push({ slot_id: slot, test_id: t.id, model: m.id.replace("claude-code/", ""), prompt: subagentPrompt(t) });
      }
    }
    return { ok: true, slots };
  }

  async submitAnswers(
    answers: { slot_id: string; text?: string; duration_ms?: number; error?: string }[],
  ): Promise<Fail | Ok<{ saved: number; view: RunView }>> {
    if (this.runner() !== "claude_code") return { ok: false, error: "This benchmark runs on MySI's models; it doesn't take answers." };
    if (this.status() !== "running") return { ok: false, error: "This benchmark isn't waiting for answers. Call check_run." };
    const seen = new Set<string>();
    const rows: { test_id: string; model: string; a: (typeof answers)[number] }[] = [];
    for (const a of answers) {
      const slot = this.sql
        .exec<{ test_id: string; model: string; used: number }>("SELECT test_id, model, used FROM slots WHERE slot_id = ?", a.slot_id)
        .toArray()[0];
      if (!slot) return { ok: false, error: `Unknown slot_id ${a.slot_id}. Use the slot ids from get_run_plan.` };
      if (slot.used || seen.has(a.slot_id)) return { ok: false, error: `Slot ${a.slot_id} already has an answer.` };
      if (!a.error && !a.text?.trim()) return { ok: false, error: `Slot ${a.slot_id} has no answer text. Send the answer exactly as returned, or error if the sub-agent failed twice.` };
      seen.add(a.slot_id);
      rows.push({ test_id: slot.test_id, model: slot.model, a });
    }
    const tests = new Map(this.tests().map((t) => [t.id, t]));
    for (const { test_id, model, a } of rows) {
      const t = tests.get(test_id)!;
      if (a.error) {
        this.sql.exec("INSERT OR REPLACE INTO responses (test_id, model, error) VALUES (?, ?, ?)", test_id, model, a.error.slice(0, 300));
      } else {
        const text = a.text!.trim();
        this.sql.exec(
          `INSERT OR REPLACE INTO responses (test_id, model, raw_text, display_text, latency_ms, error) VALUES (?, ?, ?, ?, ?, NULL)`,
          test_id,
          model,
          text,
          scrubSelfId(text, `${t.prompt}\n${t.context}`),
          Math.max(0, Math.round(a.duration_ms ?? 0)),
        );
      }
      this.sql.exec("UPDATE slots SET used = 1 WHERE slot_id = ?", a.slot_id);
    }
    this.log("submit_answers", `${rows.length} answers`);
    await this.ctx.storage.setAlarm(Date.now()); // blind labels, then judging
    return { ok: true, saved: rows.length, view: this.view() };
  }

  setMaxCost(usd: number) {
    this.set("max_cost_usd", String(usd));
  }

  // ---- RPC: rating ---------------------------------------------------------------------------

  // The blind view of one test. Never includes model names, scores, cost or latency.
  answers(testId?: string): Fail | Ok<{
    test: TestView;
    answers: { label: string; text: string }[];
    rating: { best: string; worst: string | null; note: string } | null;
    position: number;
    total: number;
  }> {
    const view = this.view();
    const ready = view.tests.filter((t) => t.status === "ready_to_rate");
    const test = testId ? view.tests.find((t) => t.id === testId) : ready[0];
    if (!test) {
      if (testId) return { ok: false, error: `There is no test task ${testId}. Call check_run to see the tasks.` };
      return { ok: false, error: "No test task is ready to rate right now. Call check_run to see progress." };
    }
    if (test.status !== "ready_to_rate" && test.status !== "rated") {
      return { ok: false, error: `Test task ${test.id} isn't ready yet (${test.status}). Call check_run.` };
    }
    if (view.status === "finished") {
      return { ok: false, error: "This benchmark is finished and the results are revealed. Call get_results." };
    }
    return {
      ok: true,
      test,
      answers: this.blindAnswers(test.id).map(([label, text]) => ({ label, text })),
      rating: this.rating(test.id),
      position: view.tests.findIndex((t) => t.id === test.id) + 1,
      total: view.tests.length,
    };
  }

  rate(testId: string, best: string, worst: string | null, note: string, source: "chat" | "page"): Fail | Ok<{ view: RunView }> {
    if (this.status() === "finished") {
      return { ok: false, error: "The results are already revealed, so new ratings wouldn't be blind. Call get_results." };
    }
    const labels = this.labelsFor(testId);
    if (!Object.keys(labels).length) return { ok: false, error: `Test task ${testId} isn't ready to rate yet. Call check_run.` };
    const b = best.trim().toUpperCase();
    const w = worst?.trim().toUpperCase() || null;
    const valid = Object.keys(labels).join(", ");
    if (!labels[b]) return { ok: false, error: `"${best}" isn't one of the answers (${valid}). Ask again.` };
    if (w && !labels[w]) return { ok: false, error: `"${worst}" isn't one of the answers (${valid}). Ask again.` };
    if (w === b) return { ok: false, error: "The same answer can't be both best and worst. Ask the person again." };
    this.sql.exec(
      "INSERT OR REPLACE INTO ratings (test_id, best, worst, note, source, rated_at) VALUES (?, ?, ?, ?, ?, ?)",
      testId,
      b,
      w,
      note,
      source,
      new Date().toISOString(),
    );
    this.log("submit_rating", `${testId} via ${source}`);
    return { ok: true, view: this.view() };
  }

  // ---- RPC: results --------------------------------------------------------------------------

  // `app` is the chat app the person is in (see APP_VENDOR), saved for the results page.
  results(finish: boolean, app?: string): Fail | Ok<{ data: Results }> {
    if (app && APP_VENDOR[app]) this.set("app", app);
    const status = this.status();
    if (status === "draft") return { ok: false, error: "This benchmark hasn't run yet. Confirm the test tasks, then call run_models." };
    if (status === "running") {
      const done = this.view().tests.filter((t) => t.status === "ready_to_rate" || t.status === "rated").length;
      return {
        ok: false,
        error: `The AI models are still working (${done} of ${this.tests().length} test tasks answered). Results are ready when they finish; call check_run.`,
      };
    }
    if (status === "failed" && !this.sql.exec("SELECT 1 FROM labels LIMIT 1").toArray().length) {
      return { ok: false, error: this.get("error") ?? "This benchmark failed." };
    }
    // The ranking is the person's own (decided 2026-10-25), so with nothing rated there is none.
    if (!this.sql.exec("SELECT 1 FROM ratings LIMIT 1").toArray().length) {
      return { ok: false, error: "Nothing is rated yet. Rate at least one task and I'll show you how the models did." };
    }
    if (finish && status !== "finished") {
      this.set("status", "finished");
      this.set("finished_at", new Date().toISOString());
      this.log("get_results", "finished");
    }
    return { ok: true, data: this.buildResults() };
  }

  private buildResults(): Results {
    const lineup = this.json<ModelInfo[]>("lineup", []);
    const judges = this.json<ModelInfo[]>("judges", []);
    const nameOf = (id: string) => lineup.find((m) => m.id === id)?.name ?? id;
    const tests = this.tests().filter((t) => Object.keys(this.labelsFor(t.id)).length);

    const responses: Response[] = this.sql
      .exec<{ test_id: string; model: string; raw_text: string; latency_ms: number; cost_usd: number | null }>(
        "SELECT test_id, model, raw_text, latency_ms, cost_usd FROM responses WHERE error IS NULL",
      )
      .toArray()
      .filter((r) => tests.some((t) => t.id === r.test_id))
      .map((r) => ({ eval_id: r.test_id, model: nameOf(r.model), text: r.raw_text, duration_ms: r.latency_ms, cost: r.cost_usd }));

    const blindMap = Object.fromEntries(
      tests.map((t) => [t.id, Object.fromEntries(Object.entries(this.labelsFor(t.id)).map(([l, m]) => [l, nameOf(m)]))]),
    );

    // A model's judge score per test is the mean of the judges' overall scores.
    const judge: Judgment[] = this.sql
      .exec<{ test_id: string; label: string; overall: number }>(
        "SELECT test_id, label, AVG(overall) AS overall FROM judgments GROUP BY test_id, label",
      )
      .toArray()
      .filter((j) => blindMap[j.test_id]?.[j.label])
      .map((j) => ({ eval_id: j.test_id, label: j.label, overall: j.overall, criteria_scores: [], reason: "" }));

    const human: Rating[] = this.sql
      .exec<{ test_id: string; best: string; worst: string | null; note: string }>("SELECT test_id, best, worst, note FROM ratings")
      .toArray()
      .filter((r) => blindMap[r.test_id])
      .map((r) => ({ eval_id: r.test_id, best: r.best, worst: r.worst, note: r.note }));

    // Judges still run and are stored for Tyler's analysis, but nothing here shows their scores.
    void judges;
    const rep = report({
      tests,
      responses,
      blind: blindMap,
      judge,
      human,
      meta: { who: this.get("label") ?? "–", date: (this.get("created_at") ?? "").slice(0, 10) },
      notes: ["Time is the full round trip for each answer through OpenRouter, so compare models to each other."],
      forPerson: true,
    });

    // Rows arrive best first, with equal scores already ordered by cost and speed (decision 009),
    // so the winner is always one model. `tiedWith` names the models it beat only on the tiebreak.
    const lead = (rows: typeof rep.rows) => {
      const best = rows[0]?.human;
      if (best === null || best === undefined) return { winner: null, tiedWith: [] as typeof rows };
      return { winner: rows[0], tiedWith: rows.slice(1).filter((r) => r.human === best) };
    };

    const rated = human.length;
    const { winner, tiedWith } = lead(rep.rows);
    const top = winner?.model ?? null;
    const categories = [...new Set(tests.map((t) => t.category))].sort();
    const byCategory = categories.map((c) => {
      const catTests = tests.filter((t) => t.category === c);
      const sub = report({
        tests: catTests,
        responses: responses.filter((r) => catTests.some((t) => t.id === r.eval_id)),
        blind: Object.fromEntries(catTests.map((t) => [t.id, blindMap[t.id]])),
        judge: judge.filter((j) => catTests.some((t) => t.id === j.eval_id)),
        human: human.filter((h) => catTests.some((t) => t.id === h.eval_id)),
        forPerson: true,
      });
      const catHuman = human.some((h) => catTests.some((t) => t.id === h.eval_id));
      return { category: c, winner: catHuman ? (lead(sub.rows).winner?.model ?? null) : null, tests: catTests.length };
    });
    const rated_categories = byCategory.filter((c) => c.winner !== null);
    const differs = rated_categories.some((c) => c.winner !== top);

    const wins = (m: string) => rep.rows.find((r) => r.model === m)?.wins ?? 0;
    const tasks = `${rated} task${rated === 1 ? "" : "s"}`;
    const why = (() => {
      if (!winner || !tiedWith.length) return "";
      const group = [winner, ...tiedWith];
      // "Cheapest" or "fastest" only when the group actually differs on it, so equal costs
      // (such as $0 on mock models) don't get credited as a win.
      const leads = (v: (r: (typeof group)[number]) => number | null) => {
        const xs = group.map(v).filter((x): x is number => x !== null);
        const w = v(winner);
        return w !== null && xs.length > 1 && xs.every((x) => w <= x) && xs.some((x) => x !== w);
      };
      const cheapest = leads((r) => r.cost);
      const fastest = leads((r) => r.median_s);
      const how = cheapest && fastest ? "the cheapest and fastest" : cheapest ? "the cheapest" : fastest ? "the fastest" : "the best mix of cost and speed";
      return ` It tied with ${tiedWith.map((r) => r.model).join(" and ")} on your score, so it's listed first because it was ${how} of them.`;
    })();
    const headline = !top
      ? "There were no answers to compare."
      : wins(top)
        ? `For your work, **${top}** came out on top: you picked it as best on ${wins(top)} of ${tasks}.${why}`
        : // A tie can go to a model never picked as best (decision 009), so don't open with "0 of N".
          `For your work, **${top}** came out on top across ${tasks}, though you never picked it as best.${why}`;

    const inYourApp = (() => {
      const app = this.get("app");
      const vendor = app ? APP_VENDOR[app] : undefined;
      if (!app || !vendor || !top || this.runner() === "claude_code") return null;
      const appName = APP_NAME[app];
      const idOf = (model: string) => lineup.find((m) => m.name === model)?.id ?? model;
      const i = rep.rows.findIndex((r) => idOf(r.model).startsWith(vendor + "/"));
      if (i === 0) return `${top} is made for ${appName}, the app you already use, so you can switch to it there without changing apps.`;
      if (i < 0) return `None of these models run in ${appName}. To use ${top}, you'd need an app that can use it.`;
      return (
        `${top} doesn't run in ${appName}. The best one you can use there is ${rep.rows[i].model} (ranked ${i + 1}). ` +
        `To use ${top} you'd need to switch apps, or use an app that can run models from any company.`
      );
    })();

    const month = new Date(this.get("created_at") ?? Date.now()).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    const memoryLine = !top
      ? ""
      : differs
        ? rated_categories.map((c, i) => (i === 0 ? `For ${c.category} tasks I do best with ${c.winner}` : `for ${c.category}, ${c.winner}`)).join("; ") +
          ` (MySI benchmark, ${month}).`
        : `For my kind of work (${rated_categories.map((c) => c.category).join(", ")}), ${top} did best in my own blind test (MySI benchmark, ${month}).`;

    const reveal = tests.map((t) => {
      const r = human.find((h) => h.eval_id === t.id);
      return {
        test_id: t.id,
        title: t.title,
        labels: blindMap[t.id],
        your_best: r ? blindMap[t.id][r.best] : null,
        your_worst: r?.worst ? blindMap[t.id][r.worst] : null,
      };
    });

    const trust = [
      `${tests.length} test task${tests.length === 1 ? "" : "s"}, one answer per model each, so small gaps may be luck.` +
        (tests.length <= 3 ? " Treat this as a rough first read; adding more tasks makes it steadier." : ""),
    ];
    if (this.runner() === "claude_code") trust.push(CLAUDE_CODE_CAVEAT);
    if (rated < tests.length) trust.push(`You rated ${rated} of ${tests.length} tasks; the ranking uses only those.`);
    const failed = this.tests().length - tests.length;
    if (failed) trust.push(`${failed} test task${failed === 1 ? "" : "s"} had fewer than 2 answers and ${failed === 1 ? "was" : "were"} left out.`);

    return {
      headline,
      winner: top,
      in_your_app: inYourApp,
      mode: this.runner(),
      markdown: rep.markdown,
      rows: rep.rows,
      by_category: differs ? rated_categories : [],
      all_categories: rated_categories,
      reveal,
      trust,
      memory_line: memoryLine,
      cost_usd: Math.round(this.totalCost() * 10000) / 10000,
      rated,
      total: tests.length,
    };
  }

  events() {
    return this.sql.exec<{ at: string; action: string; outcome: string }>("SELECT at, action, outcome FROM events ORDER BY at").toArray();
  }

  // The owner's log (/admin only): the whole run, including which model wrote each answer and
  // the judges' scores. Never returned by a tool or the person's pages.
  dump() {
    const view = this.view();
    const responses = this.sql
      .exec<{ test_id: string; model: string; display_text: string | null; latency_ms: number | null; cost_usd: number | null; error: string | null }>(
        "SELECT test_id, model, display_text, latency_ms, cost_usd, error FROM responses",
      )
      .toArray();
    const judgments = this.sql
      .exec<{ test_id: string; judge: string; label: string; overall: number; reason: string }>(
        "SELECT test_id, judge, label, overall, reason FROM judgments",
      )
      .toArray();
    const judgeErrors = this.sql
      .exec<{ test_id: string; judge: string; error: string }>("SELECT test_id, judge, error FROM judge_calls WHERE error IS NOT NULL")
      .toArray();
    const finished = view.status === "finished" ? this.buildResults() : null;
    return {
      ...view,
      finished_at: this.get("finished_at"),
      winner: finished?.winner ?? null,
      tests: view.tests.map((t) => {
        const labels = this.labelsFor(t.id);
        const rating = this.rating(t.id);
        return {
          ...t,
          rating: rating && { ...rating, best_model: labels[rating.best] ?? null, worst_model: rating.worst ? (labels[rating.worst] ?? null) : null },
          answers: Object.entries(labels).map(([label, model]) => {
            const r = responses.find((x) => x.test_id === t.id && x.model === model);
            return {
              label,
              model,
              text: r?.display_text ?? null,
              latency_ms: r?.latency_ms ?? null,
              cost_usd: r?.cost_usd ?? null,
              judge_scores: judgments.filter((j) => j.test_id === t.id && j.label === label).map(({ judge, overall, reason }) => ({ judge, overall, reason })),
            };
          }),
          errors: responses.filter((x) => x.test_id === t.id && x.error).map(({ model, error }) => ({ model, error })),
          judge_errors: judgeErrors.filter((x) => x.test_id === t.id).map(({ judge, error }) => ({ judge, error })),
        };
      }),
      events: this.events(),
    };
  }
}

export type RunDump = ReturnType<RunObject["dump"]>;

export type Results = {
  headline: string;
  winner: string | null; // one model: ties break on cost and speed (decision 009)
  in_your_app: string | null; // the best model the person can use in the chat app they're in
  mode: Runner;
  markdown: string;
  rows: ReturnType<typeof report>["rows"];
  by_category: { category: string; winner: string | null; tests: number }[];
  all_categories: { category: string; winner: string | null; tests: number }[];
  reveal: { test_id: string; title: string; labels: Record<string, string>; your_best: string | null; your_worst: string | null }[];
  trust: string[];
  memory_line: string;
  cost_usd: number;
  rated: number;
  total: number;
};
