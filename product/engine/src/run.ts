// One Durable Object per benchmark run (specs/001-benchmark-engine-mcp.md, "Background job" and
// "Data"). It owns the run's SQLite tables and works through the model calls with alarms, one
// small step per alarm, saving every answer as it returns so a retried alarm resumes.

import { DurableObject } from "cloudflare:workers";
import { blind, report, type Judgment, type Rating, type Response, type Test } from "./bench.ts";
import { coach, LIMITS, scrubPersonalInfo, scrubSelfId, type CoachingNote } from "./coach.ts";
import { complete, isMock, parseJudgeJson, type Env, type ModelInfo } from "./models.ts";
import { judgePrompt, MODEL_SYSTEM, modelPrompt } from "./prompts.ts";

export type RunStatus = "draft" | "running" | "ready" | "finished" | "failed";
export type TestStatus = "queued" | "running" | "ready_to_rate" | "rated" | "failed";

export type DraftTest = Omit<Test, "id">;

type Fail = { ok: false; error: string };
type Ok<T> = { ok: true } & T;

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

  async start(lineup: ModelInfo[], judges: ModelInfo[]): Promise<Fail | Ok<{ already: boolean; view: RunView }>> {
    const status = this.status();
    if (status !== "draft") return { ok: true, already: true, view: this.view() };
    if (!this.tests().length) return { ok: false, error: "There are no test tasks yet. Call save_tests first." };
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
        const c = await this.withRetries(() => complete(this.env, j.id, prompt, { maxTokens: JUDGE_TOKENS }));
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

  results(finish: boolean): Fail | Ok<{ data: Results }> {
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

    const judgeNames = judges.map((j) => j.name).join(" and ");
    const rep = report({
      tests,
      responses,
      blind: blindMap,
      judge,
      human,
      meta: { who: this.get("label") ?? "–", date: (this.get("created_at") ?? "").slice(0, 10) },
      notes: [
        `The second opinion is ${judgeNames || "no judge"}, from companies not in the test, grading blind and in shuffled order. ` +
          "Your picks count more than theirs.",
        "Time is the full round trip for each answer through OpenRouter, so compare models to each other.",
      ],
    });

    const rated = human.length;
    const top = rep.rows[0];
    const categories = [...new Set(tests.map((t) => t.category))].sort();
    const byCategory = categories.map((c) => {
      const catTests = tests.filter((t) => t.category === c);
      const sub = report({
        tests: catTests,
        responses: responses.filter((r) => catTests.some((t) => t.id === r.eval_id)),
        blind: Object.fromEntries(catTests.map((t) => [t.id, blindMap[t.id]])),
        judge: judge.filter((j) => catTests.some((t) => t.id === j.eval_id)),
        human: human.filter((h) => catTests.some((t) => t.id === h.eval_id)),
      });
      return { category: c, winner: sub.rows[0]?.model ?? null, tests: catTests.length };
    });
    const differs = byCategory.some((c) => c.winner !== top?.model);

    const headline = !top
      ? "There were no answers to compare."
      : rated
        ? `For your work, **${top.model}** came out on top: you picked it as best on ${top.wins} of ${rated} task${rated === 1 ? "" : "s"}.`
        : `You didn't rate any answers, so this is the second opinion only: **${top.model}** scored highest.`;

    const month = new Date(this.get("created_at") ?? Date.now()).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    const memoryLine = !top
      ? ""
      : differs
        ? byCategory.map((c, i) => (i === 0 ? `For ${c.category} tasks I do best with ${c.winner}` : `for ${c.category}, ${c.winner}`)).join("; ") +
          ` (MySI benchmark, ${month}).`
        : `For my kind of work (${categories.join(", ")}), ${top.model} did best in my own blind test (MySI benchmark, ${month}).`;

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
      `${tests.length} test task${tests.length === 1 ? "" : "s"}, one answer per model each, so small gaps may be luck.`,
      rep.judgeAgreement
        ? `The second opinion's top pick matched yours on ${rep.judgeAgreement.matched} of ${rep.judgeAgreement.of}.`
        : "No ratings from you, so this rests on the second opinion only.",
    ];
    const failed = this.tests().length - tests.length;
    if (failed) trust.push(`${failed} test task${failed === 1 ? "" : "s"} had fewer than 2 answers and ${failed === 1 ? "was" : "were"} left out.`);

    return {
      headline,
      markdown: rep.markdown,
      rows: rep.rows,
      by_category: differs ? byCategory : [],
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
}

export type Results = {
  headline: string;
  markdown: string;
  rows: ReturnType<typeof report>["rows"];
  by_category: { category: string; winner: string | null; tests: number }[];
  reveal: { test_id: string; title: string; labels: Record<string, string>; your_best: string | null; your_worst: string | null }[];
  trust: string[];
  memory_line: string;
  cost_usd: number;
  rated: number;
  total: number;
};
