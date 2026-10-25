# AGENTS.md

The single source of instructions for any coding agent working in this repo (Claude Code,
Codex, OpenCode, Pi, Hermes, etc.). `CLAUDE.md` just imports this file. Keep this one current.
It should let a brand new session act like a colleague who already knows what I am working on
and why.

## What I am working on

- **My role:** Solo founder: product, engineering, design, and go-to-market. Early sprints are
  heavy on product (validating the idea), then engineering (shipping), then product + GTM.
- **What it is:** MySI ("my SI", short for my superintelligence; name chosen 2026-10-21, may
  change), a personal model benchmark. It turns the work a person actually uses AI for into test
  tasks, runs them on several models, and ranks the models
  for that person. Pivoted from Homeroom in Sprint 3 (`decisions/006-pivot-to-personal-benchmark.md`).
- **Why:** Each person should own their own personal superintelligence, and part of that is
  knowing which model to use for which task and being free to switch models and providers.
  Models come out faster than anyone can follow, and public leaderboards don't say which one is
  good at a given person's work.
- **Who it is for:** People who use AI for their own work and agents but can't keep up with model
  releases. The first outside user is my wife (interview 06, 2026-10-24). One MySI interview so
  far; not validated beyond her.
- **Form factor:** A hosted engine reached through a remote MCP connector, plus one small page
  for blind rating (decision 006). The person's own chat app runs the interview; the engine saves
  the tests, runs 3 models from different vendors through OpenRouter by default (up to 5), has
  judges score the answers internally, and returns a ranking built only from the person's own
  blind picks, with one winner (decision 009). Next scope after Sprint 3: re-run a person's tests when a new
  model ships. After that: a router endpoint.

## Current state

- **This sprint's goal (Sprint 3):** A working prototype of the personal benchmark: a live link,
  my wife builds her own tests through the product, and it ranks 3 to 5 models on them. See
  `sprints/sprint-3-plan.md`.
- **Where to see it:** https://personal-bench.homeroom-app.workers.dev. Press "Use it in Claude"
  for a personal connector link (decision 008). Engine code is `product/engine/`; lineup GPT-6.1
  Sol, Gemini 4 Argon, Claude Sonnet 5.5, judges from other vendors. Owner's log at `/admin`.
  My wife did the first outside run on 2026-10-24
  (`discovery/interviews/2026-10-24-interview-06.md`). The older `/personal-bench` skill
  (Claude models only) stays as the control group; its runs are in `product/bench/runs/`.
- **Where the work lives:** `README.md` lists every repo and live link. Keep it current — it is what
  the graders use to find the work.
- **Biggest open risk:** Whether people will switch apps to use the model that wins. My wife
  won't ("I would rather just have 1"), so results now also name the best model in the app the
  person already uses (decision 009), and the router matters more. Second: connector setup. She
  got through it with two small assists (moving off a cloud session, saying "confirm"), and the
  connect prompt now covers the first. Third: whether her blind picks differ from model to model.
  On her run they did, by task, but they added up to a tie.
- **Specs:** `specs/001-benchmark-engine-mcp.md` (the engine and its tools) and
  `specs/002-harness-ux.md` (what the person sees inside their chat app). Build to these.
- **Homeroom (retired):** the v0 UI at https://homeroom.homeroom-app.workers.dev (code in
  `product/app/`), its discovery work in `discovery/`, and its specs in `specs/` stay as history.
  Don't extend them.

## Where things go

| Work | Folder |
|---|---|
| Research, competitive analysis, reading notes | `discovery/research/` |
| Interviews (anonymized) | `discovery/interviews/` |
| Problem Discovery Worksheet, ICP, JTBD (Homeroom) | `discovery/worksheet.md`, `discovery/icp.md`, `discovery/jtbd.md` |
| Personas, insights | `discovery/personas.md`, `discovery/insights.md` |
| Specs | `specs/` |
| Decisions, numbered (`001-...md`) | `decisions/` |
| Benchmark prototype skill | `.claude/skills/personal-bench/` |
| Benchmark runs, one folder each | `product/bench/runs/` |
| Code, prompts, eval sets (`product/evals/`) | `product/` |
| Sprint plans and reviews | `sprints/` |

Background research (from the Homeroom sprints, still useful for agent and harness work):
- `discovery/research/harnessresearch.md`: Sprint 1 notes on what a harness should do
- `discovery/research/agent-harness-comp.md` + `.html`: side-by-side of Codex, OpenCode,
  Hermes, OpenClaw, Pi
- `discovery/research/harness-notes/`: harness engineering reading (DAIR.AI collection: 21
  papers, 51 tools), visual notes, and a minimal runnable harness

## How this repo works

- Non-code work is committed as files, same as code.
- Specs go in `specs/` and are written before the work. When asked to build or produce
  something non-trivial, check for its spec first. If there is none, draft one and confirm it
  before starting.
- Meaningful choices get a numbered record in `decisions/`, written when the choice is made,
  including what was rejected and why.
- Sprint plans and reviews live in `sprints/`. The plan is committed on day one.
- Never put real names, emails, or phone numbers in this repo. Anonymize.
- Commit and push straight to `main`.

## Tools and conventions

- **Stack or tools:** Cloudflare Workers, with each run stored in its own Durable Object
  (`decisions/007-engine-storage-durable-objects.md`; the engine doesn't use Supabase). Models
  from other vendors go through OpenRouter. The prototype skill's `scripts/bench.py` does the shuffling and ranking math; port it, don't rewrite it.
- **How work ships:** Commits to `main` on GitHub (tyleramberry/amberryt_msb341). Visual pages
  may also be published as Claude artifacts and linked from the matching `.md`.
- **Testing and style:** In `product/engine/`: `npm run typecheck` and `npm run test:all`
  (unit tests, then protocol and per-tool suites against a local `wrangler dev` on mock models)
  before deploying. `npm run check-models` before changing the lineup. Any AI feature gets an
  eval set in `product/evals/` (judge style rules: `judge-style-rules.json`, run by
  `npm run eval:judges`).

## Working with me

- Ask before large refactors or before adding a dependency.
- When I am wrong about something technical, say so directly and explain why.
- Show me the plan before executing anything that touches more than a couple of files.
- Plain language. Show proof that something works, not just that it compiled.

## Voice

Writing other people read (product copy, marketing, memos) sounds like: TODO: 2 or 3
adjectives plus one example line.
