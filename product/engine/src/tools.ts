// The MCP server: tools, prompts and resources (specs/001-benchmark-engine-mcp.md "Tools",
// specs/002-harness-ux.md for wording). The host model is the front end, so every result
// carries next_step (instructions for the host) and, where useful, message_for_person.

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { z } from "zod";
import { DEFAULT_TESTS, LIMITS } from "./coach.ts";
import { CLAUDE_CODE_LINEUP, isMock, lineupFor, modelFromId, pickJudges, vendorOf, type Env } from "./models.ts";
import {
  ANSWERS_NEXT_STEP,
  CARD_FORMAT,
  CLAUDE_CODE_INSTRUCTIONS,
  RUN_PLAN_NEXT_STEP,
  INTERVIEW_GUIDE,
  INTRO,
  RESULTS_NEXT_STEP,
  SERVER_INSTRUCTIONS,
  TASK_IDEAS,
} from "./prompts.ts";
import type { PersonObject } from "./person.ts";
import type { DraftTest, RunView } from "./run.ts";

type Data = Record<string, unknown>;

function reply(data: Data) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data };
}

function refuse(error: string, next_step?: string) {
  const data = { error, next_step: next_step ?? "Tell the person in plain words, then do what the error says." };
  return { isError: true, content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data };
}

export function newRunId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16)); // 128 bits
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const RUN_ID = /^[A-Za-z0-9_-]{22}$/;

export function runStub(env: Env, runId: string) {
  return env.RUN.get(env.RUN.idFromName(runId));
}

async function openRun(env: Env, runId: string) {
  if (!RUN_ID.test(runId)) return null;
  const stub = runStub(env, runId);
  return (await stub.exists()) ? stub : null;
}

const NO_RUN = "There's no benchmark with that run_id. Use the run_id start_benchmark returned, or call start_benchmark.";

function card(t: { id: string; category: string; title: string; prompt: string; criteria: string[] }, n: number) {
  const cat = t.category.charAt(0).toUpperCase() + t.category.slice(1);
  return [`**Task ${n} · ${cat} · ${t.title}**`, `*What you'd type:* "${t.prompt}"`, "*A great answer:*", ...t.criteria.map((c) => `- ${c}`)].join("\n");
}

function companies(models: { company: string }[]) {
  const names = models.map((m) => m.company);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names.join("");
}

function progress(view: RunView) {
  const count = (s: string) => view.tests.filter((t) => t.status === s).length;
  return {
    total: view.tests.length,
    answered: count("ready_to_rate") + count("rated"),
    ready_to_rate: count("ready_to_rate"),
    rated: count("rated"),
    failed: count("failed"),
  };
}

const testInput = z.object({
  category: z.string().describe('Kind of work, one or two words, e.g. "writing", "planning".'),
  title: z.string().describe("3 to 6 words."),
  prompt: z.string().describe("What the person would type, in their voice."),
  context: z.string().default("").describe('Pasted material the task needs, or "".'),
  criteria: z.array(z.string()).describe("2 to 5 checkable statements, in the person's words."),
});

export const PERSON_KEY = /^[A-Za-z0-9_-]{22}$/;

export function personStub(env: Env, key: string) {
  return env.PERSON.get(env.PERSON.idFromName(key));
}

// Who is calling: clientName comes from an initialize request's clientInfo, userAgent from the
// HTTP header. The handler is stateless, so later tool calls carry only the user agent.
export type Caller = { clientName?: string; userAgent?: string };

// Claude Code plan mode is only for Claude Code (spec 002). Kept in one place so the check can
// change once we've seen what a real Claude Code connection sends.
export function isClaudeCode(caller: Caller) {
  return /claude[- ]?code|claude-cli/i.test(`${caller.clientName ?? ""} ${caller.userAgent ?? ""}`);
}

// A guess at the chat app from the client's name or user agent, used when the host doesn't say.
export function appOf(caller: Caller): string | undefined {
  const who = `${caller.clientName ?? ""} ${caller.userAgent ?? ""}`;
  if (/claude/i.test(who)) return "claude";
  if (/openai|chatgpt/i.test(who)) return "chatgpt";
  if (/gemini/i.test(who)) return "gemini";
  return undefined;
}

// person is set when the call came through a personal connector URL (/mcp/u/<key>, decision 008).
export function createServer(
  env: Env,
  origin: string,
  person: DurableObjectStub<PersonObject> | null = null,
  caller: Caller = {},
) {
  const claudeCode = isClaudeCode(caller);
  const server = new McpServer(
    { name: "mysi", title: "MySI", version: "0.3.0" },
    { instructions: SERVER_INSTRUCTIONS + (claudeCode ? CLAUDE_CODE_INSTRUCTIONS : "") },
  );
  const ratingUrl = (runId: string) => `${origin}/r/${runId}`;
  const readOnly = { readOnlyHint: true, openWorldHint: false };

  server.registerTool(
    "check_connection",
    {
      title: "Check MySI connection",
      description:
        "Check that the MySI connector is working. Call this when the person asks to test, check or try MySI " +
        "(or the Personal Bench connector).",
      inputSchema: z.object({}),
      annotations: readOnly,
    },
    async () =>
      reply({
        connected: true,
        server_time: new Date().toISOString(),
        mock_models: isMock(env),
        message_for_person: "MySI is connected. When you're ready, say *find my best AI model*.",
        next_step: "Pass message_for_person on as is.",
      }),
  );

  server.registerTool(
    "start_benchmark",
    {
      title: "Start a MySI benchmark",
      description:
        "Start MySI, a personal AI benchmark. Call this when the person wants to know which AI model is best for " +
        'their own work, asks "which AI should I use", "find my best model", "benchmark AI for me", or wants to ' +
        "continue a benchmark. Returns how to explain MySI and the interview guide to follow. Do not write test " +
        "tasks before calling this.",
      inputSchema: z.object({
        label: z.string().optional().describe('An anonymous label for this person, e.g. "tester-1". Never a real name.'),
        from_run: z.string().optional().describe("A previous run_id whose test tasks should be copied into this one."),
        fresh: z.boolean().optional().describe("True to start a new benchmark even though an unfinished one exists."),
      }),
    },
    async ({ label, from_run, fresh }) => {
      // Through a personal link, offer to pick up an unfinished benchmark instead of starting over.
      if (person && !from_run && !fresh) {
        for (const id of await person.runIds()) {
          const v = await runStub(env, id).view();
          if (v.status === "finished" || v.status === "failed") continue;
          const p = progress(v);
          return reply({
            resume: true,
            run_id: id,
            status: v.status,
            tests: v.tests.map((t) => ({ id: t.id, title: t.title, status: t.status })),
            progress: p,
            rating_url: ratingUrl(id),
            next_step:
              `The person has an unfinished benchmark (${v.status === "draft" ? `${v.tests.length} test tasks drafted` : `${p.rated} of ${p.total} tasks rated`}). ` +
              "Ask whether to pick up where they left off. If yes: " +
              (v.status === "draft"
                ? "show the saved tasks as cards (call save_tests with them to get the cards if needed) and continue the interview guide from there. "
                : "call check_run and carry on rating. ") +
              "If they want to start over, call start_benchmark again with fresh: true.",
          });
        }
      }
      let copied: DraftTest[] = [];
      if (from_run) {
        const old = await openRun(env, from_run);
        if (!old) return refuse(NO_RUN);
        copied = (await old.view()).tests.map(({ category, title, prompt, context, criteria }) => ({ category, title, prompt, context, criteria }));
      }
      const runId = newRunId();
      const view = await runStub(env, runId).init(runId, (label ?? "tester").slice(0, 40), copied);
      await env.REGISTRY.get(env.REGISTRY.idFromName("global")).addRun(runId);
      if (person) await person.addRun(runId);
      return reply({
        run_id: runId,
        rating_url: ratingUrl(runId),
        copied_tests: view.tests.length,
        message_for_person: INTRO.replace("{n}", String(lineupFor(env).length)),
        next_step:
          (copied.length
            ? `${copied.length} test tasks were copied from the earlier benchmark. Show them as cards and ask what to add or change; then follow the guide from the confirmation step.\n\n`
            : "") + INTERVIEW_GUIDE,
      });
    },
  );

  server.registerTool(
    "get_task_ideas",
    {
      title: "Get test task ideas",
      description:
        "Call this only during a MySI interview, when the person has run out of tasks to suggest. Returns idea " +
        "questions to ask them about, never tasks to save on their behalf.",
      inputSchema: z.object({
        about_person: z.string().describe("What you know so far: their role, and the tasks they've already named."),
      }),
      annotations: readOnly,
    },
    async () =>
      reply({
        ideas: TASK_IDEAS,
        next_step:
          "Pick the 2 or 3 ideas that fit what you know about the person, reword them to fit their life, and ask " +
          "them one at a time as questions. Only turn an idea into a test task if they give a real example and " +
          "say what a great answer gets right. Never save an idea as a task they didn't choose.",
      }),
  );

  server.registerTool(
    "save_tests",
    {
      title: "Save test tasks",
      description:
        "Save the MySI test tasks drafted so far. Call after every new or edited task during the interview, " +
        "always with the full set (it replaces what was saved). Returns the tasks as cards, coaching notes to " +
        "turn into one follow-up question, and whether the set is ready for the person to confirm.",
      inputSchema: z.object({
        run_id: z.string(),
        tests: z.array(testInput).describe(`The full set so far, 1 to ${LIMITS.maxTests}, in order.`),
        person_done: z.boolean().optional().describe("True if the person said they have no more tasks to add."),
      }),
    },
    async ({ run_id, tests, person_done }) => {
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      const saved = await run.saveTests(tests);
      if (!saved.ok) return refuse(saved.error);
      const n = saved.tests.length;
      const ready = (n >= DEFAULT_TESTS && saved.notes.length === 0) || Boolean(person_done);
      const steps: string[] = [];
      if (saved.scrubbed.length) steps.push(`Personal details were removed (${saved.scrubbed.join("; ")}). Tell the person you removed them.`);
      if (saved.notes.length) steps.push("Turn at most one coaching note into a single follow-up question (use its `ask`), then save again.");
      if (n === 1) steps.push(`Show the task as a card and say: "That's one test task. Two more like that." ${CARD_FORMAT}`);
      if (ready) {
        if (n < DEFAULT_TESTS) steps.push(`Say once that fewer than ${DEFAULT_TESTS} tasks makes the ranking noisier, and that it's their call.`);
        steps.push(
          'Show every task as a card (use `cards`) and ask: "Anything to add, cut or change?" Apply edits and call ' +
            "save_tests again. When they say it's good, call run_models with person_confirmed: true.",
        );
      } else if (!saved.notes.length && n > 1) {
        steps.push("Continue the interview for the next task, one question at a time.");
      }
      return reply({
        saved: n,
        tests: saved.tests,
        cards: saved.tests.map((t, i) => card(t, i + 1)).join("\n\n"),
        coaching_notes: saved.notes,
        scrubbed: saved.scrubbed,
        ready_to_confirm: ready,
        next_step: steps.join("\n"),
      });
    },
  );

  server.registerTool(
    "run_models",
    {
      title: "Run the AI models",
      description:
        "Start the AI models on the person's MySI test tasks. Call only after the person has seen every task as a " +
        "card and said it's good, with person_confirmed: true. Returns at once; the models work in the background, " +
        "so follow up with check_run.",
      inputSchema: z.object({
        run_id: z.string(),
        person_confirmed: z.boolean().describe("True only if the person approved the full set of test tasks."),
        models: z
          .array(z.string())
          .optional()
          .describe(`Builders only: ${LIMITS.minModels} to ${LIMITS.maxModels} OpenRouter model ids. Leave out for the standard lineup.`),
        runner: z
          .enum(["mysi", "claude_code"])
          .optional()
          .describe('Claude Code only: "claude_code" if the person chose to run on their own Claude plan. Leave out otherwise.'),
      }),
    },
    async ({ run_id, person_confirmed, models, runner }) => {
      if (!person_confirmed) {
        return refuse(
          "The person hasn't confirmed the test tasks.",
          'Show every task as a card and ask "Anything to add, cut or change?" Only call run_models with person_confirmed: true after they say it\'s good.',
        );
      }
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      if (runner === "claude_code") {
        if (!claudeCode) return refuse("Running on your own Claude plan only works inside Claude Code. Leave runner out to use MySI's lineup.");
        // No daily or spend cap: the answers come from the person's plan; only judging uses our key.
        const started = await run.start(CLAUDE_CODE_LINEUP, pickJudges(env, CLAUDE_CODE_LINEUP), "claude_code");
        if (!started.ok) return refuse(started.error);
        return reply({
          status: started.view.status,
          already_started: started.already,
          mode: "claude_code",
          models: ["haiku", "sonnet", "opus"],
          tests: started.view.tests.length,
          rating_url: ratingUrl(run_id),
          message_for_person:
            `I'll run Claude Haiku, Sonnet and Opus on your ${started.view.tests.length} test tasks here, on your own plan. ` +
            "You can start rating as soon as the first task is done; you won't see which answer is which model until the end.",
          next_step: "Pass message_for_person on, then call get_run_plan.",
        });
      }
      let lineup = lineupFor(env);
      if (models?.length) {
        const ids = [...new Set(models)];
        if (ids.length < LIMITS.minModels || ids.length > LIMITS.maxModels) {
          return refuse(`Use ${LIMITS.minModels} to ${LIMITS.maxModels} different models; got ${ids.length}.`);
        }
        lineup = ids.map((id) => modelFromId(env, id));
      }
      const judges = pickJudges(env, lineup);
      if (!judges.length) return refuse("No second-opinion model is available from a company outside this lineup. Change the lineup.");

      const before = await run.view();
      if (before.status === "draft") {
        const registry = env.REGISTRY.get(env.REGISTRY.idFromName("global"));
        const max = Number(env.MAX_RUNS_PER_DAY ?? "20");
        if (!(await registry.takeRunSlot(run_id, max))) {
          return refuse("MySI has reached today's limit of benchmarks. Try again tomorrow.");
        }
        await run.setMaxCost(Number(env.MAX_RUN_COST_USD ?? "2"));
      }
      const started = await run.start(lineup, judges);
      if (!started.ok) return refuse(started.error);
      const view = started.view;
      const minutes = Math.max(2, Math.ceil(view.tests.length * 0.6));
      return reply({
        status: view.status,
        already_started: started.already,
        lineup_companies: view.lineup.map((m) => m.company),
        tests: view.tests.length,
        estimate_minutes: minutes,
        cost_cap_usd: Number(env.MAX_RUN_COST_USD ?? "2"),
        rating_url: ratingUrl(run_id),
        message_for_person:
          `${view.lineup.length} AI models, one each from ${companies(view.lineup)}, are now trying your ${view.tests.length} test tasks. ` +
          `It takes about ${minutes} minutes in all, but you can start rating as soon as the first task is done, usually within a minute. ` +
          "You won't see which AI wrote which answer until the end.",
        next_step:
          "Pass message_for_person on. Name the companies only, never the model names. Then call check_run; " +
          "as soon as a task is ready_to_rate, call get_answers for it.",
      });
    },
  );

  server.registerTool(
    "get_run_plan",
    {
      title: "Get the sub-agent plan",
      description:
        "Claude Code only, after run_models with runner \"claude_code\": the sub-agents to run on the person's own " +
        "Claude plan, one slot per test task and model, each with the exact prompt to use.",
      inputSchema: z.object({ run_id: z.string() }),
      annotations: readOnly,
    },
    async ({ run_id }) => {
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      const plan = await run.plan();
      if (!plan.ok) return refuse(plan.error);
      const byTest = new Map<string, typeof plan.slots>();
      for (const s of plan.slots) byTest.set(s.test_id, [...(byTest.get(s.test_id) ?? []), s]);
      return reply({
        tests: [...byTest].map(([test_id, slots]) => ({
          test_id,
          slots: slots.map(({ slot_id, model, prompt }) => ({ slot_id, model, prompt })),
        })),
        remaining_slots: plan.slots.length,
        rating_url: ratingUrl(run_id),
        next_step: plan.slots.length ? RUN_PLAN_NEXT_STEP : "Every answer is in. Call check_run.",
      });
    },
  );

  server.registerTool(
    "submit_answers",
    {
      title: "Send sub-agent answers",
      description:
        "Claude Code only: send the answers your sub-agents wrote for one test task, by the slot ids from " +
        "get_run_plan. Call once per test task, right after its sub-agents finish.",
      inputSchema: z.object({
        run_id: z.string(),
        answers: z.array(
          z.object({
            slot_id: z.string(),
            text: z.string().optional().describe("The answer exactly as the sub-agent returned it."),
            duration_ms: z.number().optional().describe("From the sub-agent's usage block."),
            error: z.string().optional().describe("Only if the sub-agent failed twice: what went wrong."),
          }),
        ),
      }),
    },
    async ({ run_id, answers }) => {
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      const r = await run.submitAnswers(answers);
      if (!r.ok) return refuse(r.error);
      const p = progress(r.view);
      const remaining = r.view.tests.filter((t) => t.status === "queued" || t.status === "running").length;
      return reply({
        saved: r.saved,
        progress: p,
        next_step: remaining
          ? "Run the next test task's slots from get_run_plan. If this was the first task, tell the person they can start " +
            "rating now (offer the rating page) while the rest run."
          : "All answers are in. Call check_run, then rate with get_answers.",
      });
    },
  );

  server.registerTool(
    "check_run",
    {
      title: "Check benchmark progress",
      description:
        "Check how a MySI benchmark is going: which test tasks are still running, ready to rate, or rated. Call after " +
        'run_models, when the person says "check" or "ok", and before get_answers.',
      inputSchema: z.object({ run_id: z.string() }),
      annotations: readOnly,
    },
    async ({ run_id }) => {
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      const view = await run.view();
      const p = progress(view);
      const next = view.tests.find((t) => t.status === "ready_to_rate");
      const running = view.tests.findIndex((t) => t.status === "running" || t.status === "queued");
      let next_step: string;
      if (view.status === "draft") next_step = "The models haven't started. Finish the interview, get the person's yes, then call run_models.";
      else if (view.status === "failed" && !p.answered) next_step = `Tell the person: ${view.error} Offer to start again with start_benchmark.`;
      else if (view.status === "finished") next_step = "Results are already revealed. Call get_results to show them again.";
      else if (view.runner === "claude_code" && view.status === "running" && view.tests.some((t) => t.status === "queued" || t.status === "running") && !next)
        next_step = "Answers are still needed. Call get_run_plan and run the next test's sub-agents.";
      else if (next) next_step = `Call get_answers for ${next.id}.`;
      else if (view.status === "running")
        next_step =
          `Say one line, e.g. "Task ${running + 1} of ${p.total} is running." Wait for the person to say ok, then call ` +
          "check_run again. Don't call check_run more than 3 times in one turn.";
      else next_step = "Every task that could be rated is rated. Call get_results.";
      return reply({
        status: view.status,
        error: view.error,
        tests: view.tests.map((t) => ({ id: t.id, title: t.title, status: t.status })),
        progress: p,
        next_test_to_rate: next?.id ?? null,
        rating_url: ratingUrl(run_id),
        next_step,
      });
    },
  );

  server.registerTool(
    "get_answers",
    {
      title: "Get answers to rate",
      description:
        "Get one MySI test task and the AI models' answers to it, labelled A, B, C (more if the lineup is larger) with the authors hidden, for " +
        "the person to rate. Leave out test_id to get the next task that's ready. Show the answers word for word.",
      inputSchema: z.object({
        run_id: z.string(),
        test_id: z.string().optional().describe('e.g. "t1". Leave out for the next task ready to rate.'),
      }),
      annotations: readOnly,
    },
    async ({ run_id, test_id }) => {
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      const a = await run.answers(test_id);
      if (!a.ok) return refuse(a.error);
      const runner = await run.runner();
      return reply({
        test_id: a.test.id,
        position: `Task ${a.position} of ${a.total}`,
        title: a.test.title,
        category: a.test.category,
        prompt: a.test.prompt,
        context: a.test.context,
        criteria: a.test.criteria,
        answers: a.answers,
        already_rated: a.test.status === "rated",
        first_task: a.position === 1,
        rating_url: ratingUrl(run_id),
        next_step:
          ANSWERS_NEXT_STEP +
          (runner === "claude_code"
            ? "\nYou ran these models yourself, so: offer the rating page first (it keeps the order out of the chat), and " +
              "don't refer to any earlier tool output or sub-agent result when showing these answers."
            : ""),
      });
    },
  );

  server.registerTool(
    "submit_rating",
    {
      title: "Save the person's rating",
      description:
        "Save which answer the person picked as best (and worst, if they said) for one MySI test task. Call right " +
        'after they answer, e.g. "B best, C worst". Rating the same task again replaces the old rating.',
      inputSchema: z.object({
        run_id: z.string(),
        test_id: z.string(),
        best: z.string().describe('The letter they picked as best, e.g. "B".'),
        worst: z.string().optional().describe("The letter they picked as worst. Leave out if they said the rest were all fine."),
        note: z.string().optional().describe("Anything they said about the answers, in their words."),
      }),
    },
    async ({ run_id, test_id, best, worst, note }) => {
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      const r = await run.rate(test_id, best, worst ?? null, note ?? "", "chat");
      if (!r.ok) return refuse(r.error);
      const p = progress(r.view);
      const next = r.view.tests.find((t) => t.status === "ready_to_rate");
      const allDone = p.ready_to_rate === 0 && r.view.status !== "running";
      return reply({
        saved: true,
        progress: p,
        next_test_to_rate: next?.id ?? null,
        next_step: next
          ? `Say "Task ${r.view.tests.findIndex((t) => t.id === next.id) + 1} of ${p.total} next." and call get_answers for ${next.id}. The person can say "that's enough" at any time; then call get_results.`
          : allDone
            ? "That was the last task. Call get_results."
            : 'The next task is still running. Say so in one line, wait for the person to say ok, then call check_run.',
      });
    },
  );

  server.registerTool(
    "get_results",
    {
      title: "Show results",
      description:
        "Show the MySI results: which AI model did best on the person's own test tasks, and which AI wrote each " +
        "answer. Call when every task is rated, or when the person says to stop rating and show results. This " +
        "reveals the models and closes rating.",
      inputSchema: z.object({
        run_id: z.string(),
        app: z
          .enum(["claude", "chatgpt", "gemini", "other"])
          .optional()
          .describe("The chat app you are running in, so the results can say which model the person can use there."),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ run_id, app }) => {
      const run = await openRun(env, run_id);
      if (!run) return refuse(NO_RUN);
      const r = await run.results(true, app ?? appOf(caller));
      if (!r.ok) return refuse(r.error);
      const d = r.data;
      if (person && (await person.runIds()).includes(run_id)) {
        await person.saveResult({
          run_id,
          finished_at: new Date().toISOString(),
          winner: d.winner,
          by_category: d.all_categories.map(({ category, winner }) => ({ category, winner })),
          memory_line: d.memory_line,
          mode: d.mode,
        });
      }
      // The chat table is trimmed and in the person's words; the page keeps bench.py's full report.
      // Only the person's own picks show (decided 2026-10-25): no judge column. Equal scores are
      // ordered by cost and speed (decision 009), so both columns are shown.
      const num = (x: number | null, digits: number) => (x === null ? "–" : x.toFixed(digits));
      const table = [
        "| Rank | AI model | Your score (0–2) | Your picks for best | Time (s) | Cost per answer |",
        "|---|---|---|---|---|---|",
        ...d.rows.map((r, i) => `| ${i + 1} | ${r.model} | ${num(r.human, 2)} | ${r.wins} | ${num(r.median_s, 1)} | ${r.cost === null ? "–" : "$" + r.cost.toFixed(3)} |`),
      ].join("\n");
      return reply({
        headline: d.headline,
        in_your_app: d.in_your_app,
        ranking_table: table,
        by_category: d.by_category,
        reveal: d.reveal,
        trust: d.trust,
        memory_line: d.memory_line,
        report_url: ratingUrl(run_id),
        rated: `${d.rated} of ${d.total} tasks rated`,
        cost_usd: d.cost_usd,
        rows: d.rows.map(({ model, human, wins, median_s, cost }) => ({ model, your_score: human, your_picks_for_best: wins, median_s, cost })),
        next_step: RESULTS_NEXT_STEP,
      });
    },
  );

  server.registerTool(
    "which_model",
    {
      title: "Which AI model should I use?",
      description:
        'Answer "which AI should I use for this?" from the person\'s MySI results. Call in a later chat when they ' +
        "ask which model to use for a task, or ask to see their past MySI results.",
      inputSchema: z.object({
        task_description: z.string().optional().describe("What they want to do, in a sentence."),
        run_id: z.string().optional().describe("A finished benchmark's run_id, if you know it."),
      }),
      annotations: readOnly,
    },
    async ({ run_id }) => {
      const MATCH =
        "Match the task to the closest tested category and name that winner. If no category fits, say they haven't " +
        "tested this kind of work yet and offer to add a test task (start_benchmark with from_run).";
      if (person) {
        const profile = await person.profile();
        if (!profile.length) {
          return reply({
            found: false,
            next_step: 'Say they haven\'t finished a MySI benchmark yet, and offer to run one ("find my best AI model").',
          });
        }
        // Newest result wins for each kind of work.
        const byCategory = new Map<string, { winner: string | null; finished_at: string }>();
        for (const p of profile) {
          for (const c of p.by_category) if (!byCategory.has(c.category)) byCategory.set(c.category, { winner: c.winner, finished_at: p.finished_at });
        }
        return reply({
          found: true,
          overall_winner: profile[0].winner,
          by_category: [...byCategory].map(([category, v]) => ({ category, winner: v.winner, tested: v.finished_at.slice(0, 10) })),
          memory_line: profile[0].memory_line,
          past_benchmarks: profile.map((p) => ({ finished: p.finished_at.slice(0, 10), winner: p.winner, report_url: ratingUrl(p.run_id), run_id: p.run_id })),
          next_step: MATCH + " If they asked for their results, list past_benchmarks with their report links.",
        });
      }
      const run = run_id ? await openRun(env, run_id) : null;
      const view = run ? await run.view() : null;
      if (!run || view?.status !== "finished") {
        return reply({
          found: false,
          next_step:
            "Say this MySI connector link doesn't remember past results; the personal link from MySI's setup page " +
            "does. If the person saved a MySI line in memory or custom instructions, use that. Otherwise offer to run " +
            'a benchmark ("find my best AI model").',
        });
      }
      const r = await run.results(false);
      if (!r.ok) return refuse(r.error);
      return reply({
        found: true,
        overall_winner: r.data.winner,
        by_category: r.data.all_categories,
        tested_categories: [...new Set(view.tests.map((t) => t.category))],
        memory_line: r.data.memory_line,
        report_url: ratingUrl(run_id!),
        next_step: MATCH,
      });
    },
  );

  server.registerTool(
    "rerun_test",
    {
      title: "Re-run my test on a new model",
      description:
        "Call when the person wants their MySI test tasks re-run on a new AI model. Not built yet: records their " +
        "interest and says it's coming.",
      inputSchema: z.object({ run_id: z.string(), model: z.string().optional().describe("The new model they named.") }),
    },
    async ({ run_id, model }) => {
      if (RUN_ID.test(run_id)) await env.REGISTRY.get(env.REGISTRY.idFromName("global")).recordInterest(run_id, model ?? "");
      return reply({
        recorded: true,
        message_for_person: "Re-running your test on new models is coming soon. I've noted that you'd like it.",
        next_step: "Pass message_for_person on.",
      });
    },
  );

  // ---- prompts (shortcuts where the app shows them) ----------------------------------------------

  server.registerPrompt(
    "find_my_best_model",
    { title: "Find my best AI model", description: "Start a MySI benchmark on your own work." },
    async () => ({
      messages: [{ role: "user", content: { type: "text", text: "Find my best AI model. Use MySI's start_benchmark tool." } }],
    }),
  );
  server.registerPrompt(
    "rate_my_answers",
    { title: "Rate my answers", description: "Continue rating the answers on your open MySI benchmark." },
    async () => ({
      messages: [{ role: "user", content: { type: "text", text: "Let's keep rating my MySI answers. Use check_run, then get_answers." } }],
    }),
  );
  server.registerPrompt(
    "which_ai_for_this",
    {
      title: "Which AI should I use for this?",
      description: "Ask which model won your kind of work.",
      argsSchema: z.object({ task: z.string().describe("What you want to do.") }),
    },
    async ({ task }) => ({
      messages: [{ role: "user", content: { type: "text", text: `Which AI should I use for this: ${task}? Use MySI's which_model tool.` } }],
    }),
  );

  // ---- resources --------------------------------------------------------------------------------

  server.registerResource(
    "interview_guide",
    "mysi://guide/interview",
    { title: "MySI interview guide", mimeType: "text/plain", description: "How to interview the person for test tasks." },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/plain", text: INTERVIEW_GUIDE }] }),
  );
  server.registerResource(
    "run_report",
    new ResourceTemplate("mysi://runs/{run_id}/report", { list: undefined }),
    { title: "MySI report", mimeType: "text/markdown", description: "A finished benchmark's full report." },
    async (uri, vars) => {
      const run = await openRun(env, String(vars.run_id));
      const view = run ? await run.view() : null;
      const r = run && view?.status === "finished" ? await run.results(false) : null;
      const text = r?.ok ? r.data.markdown : "No finished benchmark with that run_id.";
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
    },
  );

  return server;
}

export { vendorOf };
