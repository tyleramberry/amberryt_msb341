# AGENTS.md

The single source of instructions for any coding agent working in this repo (Claude Code,
Codex, OpenCode, Pi, Hermes, etc.). `CLAUDE.md` just imports this file. Keep this one current.
It should let a brand new session act like a colleague who already knows what I am working on
and why.

## What I am working on

- **My role:** Solo founder: product, engineering, design, and go-to-market. Early sprints are
  heavy on product (validating the idea), then engineering (shipping), then product + GTM.
- **What it is:** Personal Bench (working name), a personal model benchmark. It turns the work a
  person actually uses AI for into test tasks, runs them on several models, and ranks the models
  for that person. Pivoted from Homeroom in Sprint 3 (`decisions/006-pivot-to-personal-benchmark.md`).
- **Why:** Each person should own their own personal superintelligence, and part of that is
  knowing which model to use for which task and being free to switch models and providers.
  Models come out faster than anyone can follow, and public leaderboards don't say which one is
  good at a given person's work.
- **Who it is for:** People who use AI for their own work and agents but can't keep up with model
  releases. The first outside user is my wife. Not yet validated with interviews.
- **Form factor:** A hosted engine reached through a remote MCP connector, plus one small page
  for blind rating (decision 006). The person's own chat app runs the interview; the engine saves
  the tests, runs 3 to 5 models from different vendors through OpenRouter, has a judge score the
  answers, and returns the ranking. Next scope after Sprint 3: re-run a person's tests when a new
  model ships. After that: a router endpoint.

## Current state

- **This sprint's goal (Sprint 3):** A working prototype of the personal benchmark: a live link,
  my wife builds her own tests through the product, and it ranks 3 to 5 models on them. See
  `sprints/sprint-3-plan.md`.
- **Where to see it:** No live app yet. The prototype is the `/personal-bench` skill in
  `.claude/skills/personal-bench/`; it runs inside Claude Code on Haiku, Sonnet and Opus only.
  Two runs on my own work (one test task each) are in `product/bench/runs/`.
- **Where the work lives:** `README.md` lists every repo and live link. Keep it current — it is what
  the graders use to find the work.
- **Biggest open risk:** Whether a non-technical person can add an MCP connector on her own. If
  she can't, the hosted page becomes the main way in. Second: whether blind ratings show real
  differences between models on personal tasks at all. If not, the product idea needs
  rethinking.
- **No spec yet.** Write `specs/` for the engine and MCP connector before building it.
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

- **Stack or tools:** Cloudflare Workers + Supabase (`decisions/003-v0-web-stack.md`), kept for the
  benchmark engine (decision 006). Models from other vendors go through OpenRouter. The
  prototype skill's `scripts/bench.py` does the shuffling and ranking math; port it, don't rewrite it.
- **How work ships:** Commits to `main` on GitHub (tyleramberry/amberryt_msb341). Visual pages
  may also be published as Claude artifacts and linked from the matching `.md`.
- **Testing and style:** Fill in once there's code. Any AI feature gets an eval set in
  `product/evals/`.

## Working with me

- Ask before large refactors or before adding a dependency.
- When I am wrong about something technical, say so directly and explain why.
- Show me the plan before executing anything that touches more than a couple of files.
- Plain language. Show proof that something works, not just that it compiled.

## Voice

Writing other people read (product copy, marketing, memos) sounds like: TODO: 2 or 3
adjectives plus one example line.
