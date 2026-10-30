# MySI

> Own your personal superintelligence. MySI ("my SI") is a personal model benchmark: it turns
> the work you actually use AI for into test tasks, runs them on several models, and tells you
> which model is best for *your* work.

**Where to see it:** https://personal-bench.homeroom-app.workers.dev: press "Get my MySI link"
to get your own connector link, then MySI interviews you, runs your tests on GPT-6.1 Sol,
Gemini 4 Argon and Claude Sonnet 5.5, and ranks them from your blind picks
([spec](specs/001-benchmark-engine-mcp.md)). The first outside user ran it on 2026-10-24
([interview 06](discovery/interviews/2026-10-24-interview-06.md)). The earlier prototype, the
`/personal-bench` Claude Code skill, is in [`product/bench/runs/`](product/bench/runs/).
**Built by:** Tyler Amberry, MSB 341 Product Management, BYU

This repo started as **Homeroom**, a study harness for college students. Sprint 2's validation
was weak, so Sprint 3 pivots to the personal benchmark
([decision 006](decisions/006-pivot-to-personal-benchmark.md)). The Homeroom work stays below as
history.

## Where the work lives

| Output | Where | Access |
|---|---|---|
| Course repo (this one) | https://github.com/tyleramberry/amberryt_msb341 | Private, shared with Professor Murff (`sdmurff`) |
| MySI engine and connector (MCP) | https://personal-bench.homeroom-app.workers.dev (connector URL: `/mcp`) | Public, no sign-in. "Get my MySI link" mints a personal connector URL (`/mcp/u/<key>`); rating pages at `/r/<run_id>`; owner log at `/admin` (password) |
| MySI engine code | [`product/engine/`](product/engine/) | In-repo |
| Personal benchmark prototype | [`.claude/skills/personal-bench/`](.claude/skills/personal-bench/) | In-repo; runs inside Claude Code |
| Benchmark runs | [`product/bench/runs/`](product/bench/runs/) | In-repo |
| Homeroom v0 chat UI (retired) | https://homeroom.homeroom-app.workers.dev | Public. Placeholder agent replies; no longer developed |
| Homeroom UI code (retired) | [`product/app/`](product/app/) | In-repo |
| AI interview conversation (Sprint 2 worksheet Part 2) | https://claude.ai/share/2c9fbc48-628a-4abe-9edc-f58770172f73 | Public link; scores in [`discovery/worksheet.md`](discovery/worksheet.md) |
| Sprint 2 reflection video | https://www.loom.com/share/c10c024c9abc4ecf94669d5471a5a845 | Loom |

No other repo holds this work.

## Sprint 3: Build a working personal benchmark (in progress)

Plan: [`sprints/sprint-3-plan.md`](sprints/sprint-3-plan.md). Status against its "Done looks like":

| Deliverable | Status | Where |
|---|---|---|
| Live app with a link, code in this repo | Done: live engine with the benchmark tools, personal links, blind rating page, judges, and one winner per run (ties go to the cheaper, faster model, [decision 009](decisions/009-one-winner-and-your-app.md)). Next: re-run a person's tests when a new model ships | [spec](specs/001-benchmark-engine-mcp.md) · [live](https://personal-bench.homeroom-app.workers.dev) · [`product/engine/`](product/engine/) |
| One other person (my wife) builds her own tests through the product | Done 2026-10-24: 2 tests (client email, math help), 3 models rated blind, ~15 min, $0.07 | [interview 06](discovery/interviews/2026-10-24-interview-06.md) |
| Tests 3 to 5 models and outputs her ranking table | Done: her run ranked GPT-5, Gemini 2.5 Pro and Claude Sonnet 4.5 (a 3-way tie, which led to decision 009). Lineup is now GPT-6.1 Sol, Gemini 4 Argon, Claude Sonnet 5.5 | [interview 06](discovery/interviews/2026-10-24-interview-06.md) · [decision 009](decisions/009-one-winner-and-your-app.md) |
| Pivot recorded: decision, README, AGENTS.md | Done | [decision 006](decisions/006-pivot-to-personal-benchmark.md) · this file · [`AGENTS.md`](AGENTS.md) |

## Sprint 2: Validate the problem (done; led to the pivot)

[Plan](sprints/sprint-2-plan.md) · [Review and retro](sprints/sprint-2-review.md). Status against
its "Done looks like":

| Deliverable | Status | Where |
|---|---|---|
| 5 student interviews | 5 done (one is a high-school student, outside the ICP; 05 is notes, not a recording) | [01](discovery/interviews/2026-10-07-interview-01.md) · [02](discovery/interviews/2026-10-08-interview-02.md) · [03](discovery/interviews/2026-10-08-interview-03.md) · [04](discovery/interviews/2026-10-10-interview-04.md) · [05](discovery/interviews/2026-10-12-interview-05.md) |
| Interview scripts | Done | [student](discovery/interviews/2026-10-07-interview-questions.md) · [professor](discovery/interviews/2026-10-08-professor-interview-questions.md) |
| 2 professor interviews | Dropped Oct 12; deferred past Sprint 2 (see plan Changes) | — |
| Problem Discovery Worksheet (3 described, 2 scored) | Done: 3 described, 2 scored from the interviews; Problem 1 (rubric check) chosen | [`discovery/worksheet.md`](discovery/worksheet.md) |
| AI interview | Done 2026-10-12; [conversation](https://claude.ai/share/2c9fbc48-628a-4abe-9edc-f58770172f73), scores in the worksheet | [`discovery/ai-interview-prompt.md`](discovery/ai-interview-prompt.md) |
| ICP, JTBD, value proposition | ICP and JTBD baseline v0; value proposition v1 from the interviews | [`discovery/icp.md`](discovery/icp.md) · [`discovery/jtbd.md`](discovery/jtbd.md) · [`discovery/value-prop.md`](discovery/value-prop.md) |
| Insights and persona | 10 beliefs from interviews 01–05; one persona (the rubric self-checker) | [`discovery/insights.md`](discovery/insights.md) · [`discovery/personas.md`](discovery/personas.md) |
| MVP spec updated from interviews | Done (Oct 12): context layer, rubric check, evals, validation status | [`specs/mvpspec.md`](specs/mvpspec.md) · [decision 005](decisions/005-learning-suite-by-upload.md) |
| UI redesign (Slack-style channels, DMs, inbox) | Shipped | live UI above · [mockup](design/mockups/homeroom-v2-slack.html) |

## Sprint 1: Learn harnesses, write the MVP spec (done)

[Plan](sprints/sprint-1-plan.md) · [Review and retro](sprints/sprint-1-review.md)

- **Research:** [harness notes](discovery/research/harnessresearch.md) ·
  [competitive comparison of Codex, OpenCode, Hermes, OpenClaw, Pi](discovery/research/agent-harness-comp.md) ·
  [harness-engineering reading (21 papers, 51 tools) and a minimal runnable harness](discovery/research/harness-notes/)
- **Specs:** [PRD](specs/agent-harness-prd.md) · [MVP spec](specs/mvpspec.md)
- **Decisions:** [001 students are the MVP user](decisions/001-mvp-user.md) ·
  [002 learning/portfolio project first](decisions/002-learning-portfolio-first.md) ·
  [003 v0 web stack](decisions/003-v0-web-stack.md)
- **Shipped:** Homeroom v0 UI on Cloudflare Workers + Supabase

## Context

- **My role:** Solo founder — product, engineering, design, and go-to-market. Early sprints
  heavy on product (validating ideas), then shifting to engineering (shipping features), then
  a mix of product and GTM (getting in front of users).
- **What I am working on:** a personal model benchmark. Each person should own their own
  personal superintelligence, and part of that is knowing which model to use for which task.
  Models come out faster than anyone can follow, and public leaderboards don't say which one is
  good at *your* work ([decision 006](decisions/006-pivot-to-personal-benchmark.md)).
- **Who it is for:** people who use AI for their own work and agents but can't keep up with
  model releases. One MySI user interview so far ([06](discovery/interviews/2026-10-24-interview-06.md)).
- **Who uses my work:** the first outside user is my wife (Sprint 3).

## What is in this repo

| Folder | What lives here |
|---|---|
| [`sprints/`](sprints/) | One plan and one review per sprint |
| [`decisions/`](decisions/) | Numbered records of what I decided and why |
| [`product/engine/`](product/engine/) | MySI engine: MCP server on Cloudflare Workers |
| [`product/bench/`](product/bench/) | Personal benchmark runs |
| [`product/app/`](product/app/) | Homeroom v0 UI code (retired) |
| [`discovery/`](discovery/) | Homeroom interviews, worksheet, ICP, JTBD, insights, research |
| [`specs/`](specs/) | [MySI engine spec](specs/001-benchmark-engine-mcp.md) and [chat UX spec](specs/002-harness-ux.md); Homeroom PRD and MVP spec, written before the work |
| [`design/`](design/) | Homeroom UI mockups |
| `.claude/skills/` | `/personal-bench` prototype, plus course skills (`/sprint-plan`, `/sprint-review`, `/sprint-coach`, `/learn`, `/eli5`) |

## Running it

**Personal benchmark prototype.** Open this repo in Claude Code and type `/personal-bench`. It
interviews you about your work, turns it into test tasks you approve, runs them on Claude Haiku,
Sonnet and Opus, has a blind judge score the answers, asks you to blind-rate them, and writes a
ranking to `product/bench/runs/<date>-<label>/report.md`. Takes about 20 to 30 minutes.

**MySI engine.** In `product/engine/`: a Cloudflare Worker serving the MCP server at `/mcp` and
`/mcp/u/<key>` (Cloudflare `agents` + `@modelcontextprotocol/server`), the setup page at `/`, rating
pages at `/r/<run_id>` and the owner's log at `/admin`. Each run and each person is a Durable Object
(decision 007). Models go through OpenRouter; with no key, a mock answers. Details:
[`product/engine/README.md`](product/engine/README.md).

```bash
cd product/engine
npm install
npm run dev       # local server on :8787, MCP at /mcp
npm run typecheck
npm run test:all  # unit, protocol and tool suites on mock models
npm run deploy    # wrangler deploy (needs `npx wrangler login` once)
```

**Homeroom v0 UI (retired).** In `product/app/`: Vite + React + TS, Supabase, deployed to
Cloudflare Workers static assets (`decisions/003-v0-web-stack.md`).

```bash
cd product/app
npm install
npm run dev       # local dev server
npm run build     # type-check, then build to dist/
npm run deploy    # build, then wrangler deploy (needs `npx wrangler login` once)
```

It runs against the Supabase project committed in `src/lib/supabase.ts` with no setup: each
browser signs in anonymously. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` override
that if you need a different project. Agent replies come from a database trigger, so what you
see in the UI is not a harness talking.

## Sprints

Each sprint:

```bash
/sprint-plan     # day one, then commit the plan
# ...do the work...
/sprint-review   # last day, then commit the report and write your retro
```

## Ground rules

- **Spec before work.** For anything non-trivial, the spec's commit should predate the
  work's commits.
- **Decisions get recorded.** When you make a real choice, write it in `decisions/` with the
  alternatives you rejected.
- **No real customer contact details anywhere in this repo.** Anonymize people in interview
  notes: "dental office manager, Provo" rather than a name and an email.
- **Keep `AGENTS.md` current.** It is what your agent knows about your work (`CLAUDE.md` just imports it). Stale context
  produces bad output.
