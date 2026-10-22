# Decision 006: Pivot from Homeroom to a personal model benchmark, built as an engine reached through MCP

**Date:** 2026-10-21
**Status:** Active. Supersedes the product direction in [001](001-mvp-user.md),
[003](003-v0-web-stack.md) and [005](005-learning-suite-by-upload.md). Their records stay as history.

## Context

**The pivot.** Sprint 2 set out to validate Homeroom, and the problem didn't hold up as well as I
expected:

- Only 3 of 5 interviews describe the rubric-check behavior (01, 04, 05), and 01 is a household
  pilot. The bar was 4 of 5 ([sprint 2 review](../sprints/sprint-2-review.md)).
- Students' willingness to pay is low, and there are plenty of free tools. The problem Homeroom
  solves is smaller than I thought.
- I started Homeroom because an agent harness would look good in a portfolio, not because I
  believe in it.

The product I do believe in follows from a first principle: each person should own their own
personal super intelligence. Part of that is knowing which model to use for which task and being free to switch between models and providers to achieve the best efficiency. Models are released faster than anyone can follow, and public leaderboards don't tell a normal person which model is good at *their* work. A prototype already exists as the `/personal-bench` Claude Code skill. It has run twice on my own work (`product/bench/runs/2026-10-19-builder*`).

**The form factor.** I don't want to build just another app. The [Sprint 3
plan](../sprints/sprint-3-plan.md) needs a live link, 3 to 5 models, and one non-technical user (my
wife) going through the product herself, not a process I run by hand.

## Options considered

1. **Keep Homeroom and narrow it.** Uses the work I've already done / the validation was weak,
   willingness to pay is near zero, and I'm not motivated to build it.
2. **Pivot to the personal benchmark.** Matches what I believe and has a working prototype / a new market with no interviews yet. The Homeroom discovery work doesn't carry over.

Form factors for the benchmark:

3. **Claude Code skill or CLI (what exists today).** Already works / terminal only, so it fails
   the non-technical user. It can only run Claude models.
4. **Claude plugin only (skill + subagents inside Claude).** No backend to run / it can only test
   Claude models, because subagents are Claude. It can't compare GPT, Gemini or open models, and
   it only runs while someone has it open, so it can't alert anyone about new models.
5. **Standalone web app.** Easiest to explain / it's the "just another app" I want to avoid, and I
   would have to rebuild the guided interview that chat apps already do well.
6. **Browser extension that collects real ChatGPT prompts as tests.** No interview needed, and the
   tests come from real work / heavy privacy exposure, harder to build, and not something to
   attempt in one sprint.
7. **Router endpoint (an OpenAI-compatible URL that sends each request to the model that won that
   kind of task on your tests).** The most defensible version, because it turns the benchmark into
   a setting for your agents / built for builders, and it needs a working benchmark first.
   Later scope.
8. **Hosted engine reached through a remote MCP connector, plus one small page for blind
   rating.** The person's own chat app (Claude or ChatGPT) runs the interview. The engine saves the
   tests, runs 3 to 5 models from different vendors through one API (OpenRouter), has a judge score
   the answers, and returns the ranking. The rating page shows answers A, B and C so the person
   can't tell which model wrote which. The page is also the live link / adding a custom connector
   may be too hard for a non-technical user, and I pay the model costs.

## Decision

Pivot to the personal benchmark (option 2) and build it as option 8: a hosted engine, an MCP
connector as the way in, and one page for blind rating. The engine runs on the existing
Workers + Supabase stack ([003](003-v0-web-stack.md)). The skill's interview steps and
`bench.py`'s shuffling and scoring math are ported, not rewritten.

The deciding reason: the benchmark has to compare models across vendors and re-run when new
models come out, so it needs a backend whatever the front end is. MCP lets the person reach that
backend from the chat app they already use instead of learning a new one.

Re-running the tests when a new model is released ("Gemini 4 just beat your current model on 6
of 8 tests") is the reason people come back. It is the next scope after Sprint 3. The router
(option 7) comes after that.

## What would change our mind

- **My wife can't add the connector on her own**, or gives up during setup. Then the main way in
  becomes the hosted page, and MCP stays as an option for builders.
- **The blind ratings show no real difference between models on personal tasks.** If people pick
  answers from different models about equally, a personal benchmark doesn't tell them anything,
  and the product idea needs rethinking, not just a different form factor.
- **Model costs per run are too high to give away.** Then cap the number of models or tests, or
  have people bring their own API key.
