# Spec: Personal benchmark engine, reached through MCP

**Status:** In progress
**Date:** 2026-10-21

## Problem

Models are released faster than anyone can follow, and public leaderboards don't say which model
is good at *your* work. The `/personal-bench` skill already answers that question for one person
(two runs in `product/bench/runs/2026-10-19-builder*`), but it only runs in a terminal and can only
test Claude models. [Decision 006](../decisions/006-pivot-to-personal-benchmark.md) picks the form
factor: a hosted engine reached through a remote MCP connector, plus one page for blind rating.
Sprint 3's test user is a non-technical person (my wife) going through it herself.

## What we're making

One Cloudflare Worker in `product/engine/` that serves two things from one URL:

- **`/mcp`**: a remote MCP server the person adds as a custom connector in Claude or ChatGPT.
  Their own chat app runs the interview; the engine does everything else.
- **`/r/<runId>`**: the blind rating page, which also shows the final report. This is the live
  link.

### Where each part of the skill goes

| Skill part | Engine |
|---|---|
| Interview (steps 1–3) | Stays in the chat app. `start_benchmark` returns the interview rules as its result. The rules are ported from SKILL.md. |
| `evals.json` | The input to `save_tests`. Same format, text mode only. |
| Step 4: subagents | The Worker calls 3–5 models from different vendors through OpenRouter, with the same "plain assistant" prompt. |
| `bench.py blind` / `report` | Ported to TypeScript, tested against the existing run folders. |
| Step 5: judge | A server-side call with the same judge prompt. |
| Step 6: AskUserQuestion rating | The rating page: prompt, answers A/B/C, pick best and worst. |
| Step 7: report | `get_results` returns the table to the chat; the page shows it too. |

### Tools

- `start_benchmark`: creates a run, returns its ID and the interview rules.
- `save_tests`: saves the confirmed tests for a run.
- `run_models`: starts the model calls and judging **in the background** and returns at once.
  8 tests × 4 models plus judging takes minutes, longer than a chat app waits on a tool call.
- `check_run`: progress, then the rating link when it is ready.
- `get_results`: the ranking table, once rated (or judge-only if she hasn't rated).

### Data (Supabase)

`runs`, `evals`, `responses`, `judgments`, `ratings`. The run ID is long and random and doubles as
the private link.

### Build order

1. **Hello-world connector, deployed.** A `ping` tool on a deployed Worker. Add it as a custom
   connector in Claude.ai and ChatGPT, then have my wife add it herself. Decision 006 changes if
   she can't, so this is tested before any engine code.
2. **Port `bench.py` to TypeScript** with tests: feed in `2026-10-19-builder-2`'s judge, human and
   blind files and match its `report.md`.
3. **Supabase tables.**
4. **Tools, end to end**, with `run_models` as a background job (Durable Object or Workflow).
5. **Rating page** at `/r/<runId>`.
6. **Run it once myself, then my wife runs it with me hands-off.** Log every place she gets stuck.

## Decisions inside this spec

- **Judge:** a Claude model grading GPT and Gemini isn't neutral. Use a judge from a vendor not in
  the lineup, or average two judges from different vendors. The person's own ratings rank first.
- **Dependencies:** Cloudflare's `agents` package (its MCP handler), `@modelcontextprotocol/sdk`,
  and `zod`.
- **The skill stays** as the control group and for builders. Retire it only once the engine
  produces matching reports.

## Out of scope

- File mode (HTML or document answers). Needs sandboxed previews; after Sprint 3.
- Accounts and OAuth. Anyone with a run link can see that run.
- Alerts when new models come out (next scope, per decision 006), and the router (after that).

## Definition of done

- [ ] My wife adds the connector, does the interview in her chat app, and gets a ranking of 3–5
      models on her own tests without me touching anything.
- [ ] Shipped: the connector URL and rating page are live and listed in `README.md`.
- [ ] Costs are capped: a hard spending limit on the OpenRouter key, and at most 10 tests × 5
      models per run. Cost per run is recorded from her run.
- [ ] Every place she got stuck is written down in `sprints/`.
