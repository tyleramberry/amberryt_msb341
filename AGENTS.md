# AGENTS.md

The single source of instructions for any coding agent working in this repo (Claude Code,
Codex, OpenCode, Pi, Hermes, etc.). `CLAUDE.md` just imports this file. Keep this one current.
It should let a brand new session act like a colleague who already knows what I am working on
and why.

## What I am working on

- **My role:** Solo founder: product, engineering, design, and go-to-market. On Herd I build with
  a co-founder.
- **Now (Sprint 4, from 2026-11-04): Herd**, a Hermes Agent plugin that makes Hermes
  multiplayer, built for the Nous Research Hermes Agent plugin hackathon ($1,000 prize). It puts
  my personal Hermes instance and me, and my co-founder's personal Hermes instance and him, into
  shared channels with a Slack-like interface, inside the Hermes desktop app, across machines.
  The agents talk to each other, the two of us can DM, and we work alongside our agents and can
  jump into the agent-to-agent conversation.
- **Why the switch:** MySI works decently, but recruiting testers over SMS was harder than
  expected, because few people are technical enough to see the need. The hackathon prize made
  Herd worth the time. See the Changes line in `sprints/sprint-4-plan.md`.
- **On hold until Sprint 5: MySI** ("my SI", short for my superintelligence), a personal model
  benchmark. It turns the work a person actually uses AI for into test tasks, runs them on
  several models, and ranks the models for that person. Pivoted from Homeroom in Sprint 3
  (`decisions/006-pivot-to-personal-benchmark.md`). Belief behind it: each person should own
  their own personal superintelligence, which includes knowing which model to use and being free
  to switch. Form factor: a hosted engine reached through a remote MCP connector, plus one small
  page for blind rating; 3 models from different vendors through OpenRouter by default (up to
  5), judges score internally, and the ranking comes only from the person's blind picks, with one
  winner (decision 009). One outside user so far (my wife, interview 06, 2026-10-24).

## Current state

- **This sprint's goal (Sprint 4):** Herd works (two separate Hermes instances message each other
  in one shared space, in a cohesive, polished UI) and the hackathon entry is in. See
  `sprints/sprint-4-plan.md`.
- **Herd deadlines:** code freeze target Nov 8. Due 5:00 PM EST, Tuesday Nov 11: (1) a PR adding
  Herd to the Hermes plugin catalog repo, (2) a demo video on X under 90 seconds, tagged
  @NousResearch, recorded on a working build, (3) the entry form with both links.
- **Where Herd lives:** https://github.com/tyleramberry/herd (public, MIT; `sdmurff` invited as a
  collaborator). Herd code, architecture docs (`docs/`) and its agent task board live there, not
  in this repo. This repo holds the sprint plan, the review, and the README links.
- **Where the work lives:** `README.md` lists every repo and live link. Keep it current — it is what
  the graders use to find the work. Add the catalog PR and the X video there when they exist.
- **Sprint review note:** much of the Herd work happens inside Hermes Agent, which
  `/sprint-review` can't scan. Commit to `herd` often with clear messages; those commits are the
  sprint's timeline.
- **MySI (paused):** live at https://personal-bench.homeroom-app.workers.dev ("Get my MySI link"
  for a personal connector link, decision 008). Engine code is `product/engine/`; lineup GPT-6.1
  Sol, Gemini 4 Argon, Claude Sonnet 5.5; owner's log at `/admin`. Specs:
  `specs/001-benchmark-engine-mcp.md` and `specs/002-harness-ux.md`. Open risks when it resumes:
  whether people will switch apps to use the winning model (my wife won't, hence decision 009
  and the router), connector setup, and whether blind picks differ enough to name a winner. Next
  scope: re-run a person's tests when a new model ships, then a router endpoint. The
  `/personal-bench` skill (Claude models only) stays as the control group; runs in
  `product/bench/runs/`. Don't extend MySI this sprint unless asked.
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
- **Testing and style (MySI):** In `product/engine/`: `npm run typecheck` and `npm run test:all`
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
