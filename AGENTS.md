# AGENTS.md

The single source of instructions for any coding agent working in this repo (Claude Code,
Codex, OpenCode, Pi, Hermes, etc.). `CLAUDE.md` just imports this file. Keep this one current.
It should let a brand new session act like a colleague who already knows what I am working on
and why.

## What I am working on

- **My role:** Solo founder: product, engineering, design, and go-to-market. On Herd (Sprint 4)
  I built with a co-founder.
- **Now (Sprint 5, from 2026-11-11): Switchboard**, one shared Home (`~/agent-home`) holding my
  memory, skills and a secrets manifest, with one MCP server every harness connects to.
  One-command setup in a new harness, handoff between agents without re-explaining, and secrets
  agents can use but never see. Code: https://github.com/tyleramberry/switchboard.
- **Why this sprint:** I switch back and forth between Claude, Grokbot, Hermes and Buzz. One
  plug-and-play setup makes the next projects (finishing MySI, Sundae Planner) much easier. See
  `sprints/sprint-5-plan.md`.
- **Herd (Sprint 4, reviewed):** the multiplayer Hermes plugin built for the Nous Research
  hackathon lives at https://github.com/tyleramberry/herd. Review and retro:
  `sprints/sprint-4-review.md`. The hackathon entry was incomplete as of that review.
- **On hold: MySI** ("my SI", short for my superintelligence), a personal model
  benchmark. It turns the work a person actually uses AI for into test tasks, runs them on
  several models, and ranks the models for that person. Pivoted from Homeroom in Sprint 3
  (`decisions/006-pivot-to-personal-benchmark.md`). Belief behind it: each person should own
  their own personal superintelligence, which includes knowing which model to use and being free
  to switch. Form factor: a hosted engine reached through a remote MCP connector, plus one small
  page for blind rating; 3 models from different vendors through OpenRouter by default (up to
  5), judges score internally, and the ranking comes only from the person's blind picks, with one
  winner (decision 009). One outside user so far (my wife, interview 06, 2026-10-24).

## Current state

- **This sprint's goal (Sprint 5):** the five "Done looks like" items in `sprints/sprint-5-plan.md`,
  plus the mid-sprint additions documented there. Status Nov 23: built and verified on both Macs
  (Air Nov 16, fresh Mac mini install Nov 19), red team 10/10 with all findings fixed, 92/92
  tests, plus localhost Web UI (`switchboard ui`), SQLite Decision Inbox (`switchboard inbox`),
  and nightly memory distillation (`npm run distill`). `WRITEUP.md` is finalized; the sprint
  review and retro are next.
- **Where Switchboard lives:** code, red-team results (`redteam/RESULTS.md`) and `WRITEUP.md` in
  the switchboard repo (public). Real data stays out of that repo: Home is `~/agent-home`, a
  local git repo on each Mac. Spec: `specs/004-agent-switchboard.md`.
- **Where the work lives:** `README.md` lists every repo and live link. Keep it current — it is what
  the graders use to find the work.
- **Sprint review note:** much of the Switchboard work happens in the switchboard repo and in
  Hermes sessions, which `/sprint-review` can't scan. Commit to `switchboard` often with clear
  messages; those commits are the sprint's timeline.
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
