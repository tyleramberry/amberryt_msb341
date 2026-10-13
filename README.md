# Homeroom

> Homeroom is an LLM harness that helps college students study: it knows their courses and checks drafts against the rubric.

**Where to see it:** the v0 chat UI, live at https://homeroom.homeroom-app.workers.dev — a
clickable prototype whose agent replies are placeholders. The harness core is not wired up yet,
and the problem itself is only partly validated.
**Built by:** Tyler Amberry, MSB 341 Product Management, BYU

## Where the work lives

| Output | Where | Access |
|---|---|---|
| Course repo (this one) | https://github.com/tyleramberry/amberryt_msb341 | Private, shared with Professor Murff (`sdmurff`) |
| Homeroom v0 chat UI | https://homeroom.homeroom-app.workers.dev | Public. Placeholder agent replies; no harness core yet |
| UI code | [`product/app/`](product/app/) | In-repo |
| AI interview conversation (worksheet Part 2) | https://claude.ai/share/2c9fbc48-628a-4abe-9edc-f58770172f73 | Public link; scores in [`discovery/worksheet.md`](discovery/worksheet.md) |
| Sprint 2 reflection video | https://www.loom.com/share/c10c024c9abc4ecf94669d5471a5a845 | Loom |

No other repo holds this work.

## Sprint 2: Validate the problem (in progress)

Plan: [`sprints/sprint-2-plan.md`](sprints/sprint-2-plan.md). Status against its "Done looks like":

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
- **What I am working on:** Homeroom, an education-focused LLM harness. See the
  [PRD](specs/agent-harness-prd.md) and [MVP spec](specs/mvpspec.md).
- **Who it is for:** College students taking several courses ([decision 001](decisions/001-mvp-user.md)).
  Starts as a learning and portfolio project ([decision 002](decisions/002-learning-portfolio-first.md)).
- **Who uses my work:** Students are the end users. Teachers supply rubrics and need to trust
  that it teaches rather than cheats.

## What is in this repo

| Folder | What lives here |
|---|---|
| [`sprints/`](sprints/) | One plan and one review per sprint |
| [`discovery/`](discovery/) | Interviews, worksheet, ICP, JTBD, insights, research |
| [`specs/`](specs/) | PRD and MVP spec, written before the work |
| [`decisions/`](decisions/) | Numbered records of what I decided and why |
| [`product/`](product/) | The v0 UI code |
| [`design/`](design/) | UI mockups |
| `.claude/skills/` | Course skills (`/sprint-plan`, `/sprint-review`, `/learn`, `/eli5`) |

## Running it

The v0 UI is in `product/app/` — Vite + React + TS, Supabase, deployed to Cloudflare Workers
static assets (`decisions/003-v0-web-stack.md`).

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
see in the UI is not a harness talking yet.

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
