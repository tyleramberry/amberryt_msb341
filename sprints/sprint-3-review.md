# Sprint 3 Review

**Window:** 2026-10-14 to 2026-10-26
**Sessions reviewed:** 26 across 2 projects (Claude Code 26, Codex 0; 640 sessions excluded at your request)
**Not visible to this review:** Hermes Agent: its session store has 2 sessions in the window, neither for this repo or MySI by working directory or title, so none were read.

## Where the work lives

- **Course repo** `tyleramberry/amberryt_msb341`: 58 commits in the window (44 non-merge, 14 merges of PRs from Claude cloud sessions), shared with sdmurff. Commits landed on 7 days: Oct 14 (1), Oct 19 (4), Oct 21 (6), Oct 22 (10), Oct 24 (12), Oct 25 (23), Oct 26 (2).
- **Live engine:** https://personal-bench.homeroom-app.workers.dev (connector at `/mcp`, rating pages at `/r/<run_id>`, owner log at `/admin`). Code in `product/engine/`.
- **Prototype skill:** `.claude/skills/personal-bench/`, runs in `product/bench/runs/`.
- **X research (discovery):** `research/model-picker-demand.md`, committed Oct 26.
- No other repo holds this work (per README).

## When you worked

Commits on 7 of 13 days, and the weight is late: 35 of 58 commits fall on Oct 24 and 25. Oct 14 was the plan only. Oct 19 to 22 was the skill prototype, the pivot decision and the first engine build. Oct 24 and 25 was the engine hardening and your wife's run. Oct 26 was your own code-review benchmark and a judge fix. Most of the Oct 24 to 25 commits came through PRs from Claude cloud sessions (branches `claude/project-thread-*`), so they appear as commits but not as prompts in the local sessions.

## Where you got stuck

1. **Reading the results of your own code-review run (Oct 26).** After rating the three models' reviews you wrote that you can't write code and had no idea what the outputs meant, and asked for a GPT judge agent to grade them. It ended with you choosing Opus as your code reviewer and saving that.
2. **Judge failures (Oct 26).** You asked whether the engine logged your run, then asked why the Mistral Large 4 judge failed on all three tests. It was traced and fixed the same day (reasoning off for Mistral, Kimi dropped, judge errors shown in `/admin`).
3. **Getting the run onto the MySI server (Oct 26).** The first attempt ran the older `/personal-bench` skill; you asked whether it was using the MySI MCP server, deleted the empty `builder-3` run folder, and repeated "find my best ai model" before the connector ran. Two responses also came back empty or cut off mid-stream.

## What took the most time

By prompt volume, Oct 26 was the heaviest day (about 27 prompts), followed by the Oct 19 skill prototype (16) and Oct 22 engine and spec work (12). By tool use across the sessions: Bash 317 calls, 26 subagent launches, 86 task-list updates. The longest-running work (engine, specs, docs) was done mostly in cloud sessions, so session time for it is not in the local sessions.

## Axis

**AI Systems.** The work was the model lineup, blind rating, LLM judges and their failure modes, and per-run cost and ranking, with Application Architecture (Workers, Durable Objects, MCP, personal URLs) a close second.

## Against your plan

**Goal was:** A working prototype of a B2C personal AGI model benchmarking product.

The work matches the goal on all four "Done looks like" items. A live link exists with code in the repo. Your wife ran the product on Oct 24 (`discovery/interviews/2026-10-24-interview-06.md`): 2 tests, 3 models, blind picks. Her blind picks were a three-way tie (each model first on one test and last or second on the other), which led to decision 009 (one winner). The result page listed Claude first, and she read it as "Sonnet 4.5 would be best for me"; Sonnet was also the fastest and cheapest on both tests and second on both. She said she would rather have one model.

---

## Your retro

*The builder's own answers, recorded word for word.*

**Did you hit the goal?** Yes i hit the goal entirely. I build a hosted mcp server that my wife accessed in her own claude desktop app, ran a test end to end. the product helped her choose 2 tasks, make evals, ran the 3 different models, then had her and a judge agent grade the output blindly to see which model handles the task the best. pivot shoudl be recorded as well as all the code is in the repo

**What did the report show you?** i expected all of this in the report. it needs to be updated because it says the x research is not seen although it is. It also says my wifes run ended in a tie although she saw that sonnet was her preference

**If the plan changed, why?** no the plan didn;t change besides the fact that the form factor isn;t an additional app, but an mcp that is used in an agent harness like claude

**Actual difficulty:** i think it was a 4 simply becasue i had never built an mcp server so it was a lot of time learning about how to do so on x. then a whole process of learning claude projects (beta) to do the work and doing all the testing

**What will you change next sprint?** next sprint I want to spend more time up front building and more time at the end doing iterations and research as opposed to thinking and research and only getting one version built duiring the sprint
