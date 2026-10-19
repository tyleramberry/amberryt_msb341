---
name: personal-bench
description: Build a personal AI benchmark from a guided conversation, then run it on Claude Haiku, Sonnet and Opus inside Claude Code. Interviews the person about the work they actually use AI for, turns it into 5 to 10 evals they approve, runs each eval on each model as a subagent, has a blind judge score the answers, has the person blind-rate them, and writes a ranking table to product/bench/runs/. Use when the user types /personal-bench, says "benchmark the models for me", "which model is best for my work", "run my personal evals", or "make my personal benchmark".
---

# Personal Bench

The Sprint 3 prototype of the personal benchmarking product, run inside Claude Code before it
becomes an app. One run goes: **describe your work → evals → run the models → grade → rank.**

The person being benchmarked may not be the builder (Sprint 3's test user is Tyler's wife). Talk
to whoever is at the keyboard in plain language. No jargon: say "test task", not "eval", until they
have seen one.

Models: `haiku`, `sonnet`, `opus` (the Agent tool's `model` values). The judge is `opus`.

## Files

Each run gets its own folder: `product/bench/runs/<YYYY-MM-DD>-<who>/`, where `<who>` is an
anonymous label the person picks or accepts (`tester-1`, `spouse`). Never a real name. The folder
holds `meta.json`, `evals.json`, `responses.json`, `blind.json`, `blind.md`, `judge.json`,
`human.json` and `report.md`. Their formats are in the docstring of `scripts/bench.py`.

`scripts/bench.py` (in this skill's folder) does the shuffling and the math. Never compute
rankings or pick the A/B/C order yourself.

## Steps

### 1. Set up

Tell them what is about to happen in three lines: a short conversation about their work, then
three Claude models each try their test tasks, then they pick the best answers without knowing
which model wrote which. It takes about 20 to 30 minutes.

Ask for the anonymous label, create the run folder, and write `meta.json`:
`{"who": "<label>", "date": "<YYYY-MM-DD>", "models": ["haiku", "sonnet", "opus"], "judge": "opus"}`.

### 2. Interview

Goal: 5 to 10 test tasks drawn from real work they do or would hand to an AI, spread over 2 to 4
categories (for example "writing", "planning", "research", "explaining").

How to run the conversation (the same rules as Sundae's onboarding engine, which broke when it
pattern-matched instead of listening):
- One question at a time. Short replies. No bullet-point interrogations.
- Start broad: "What do you use AI for now, or wish you could hand off?" Then ask for one real
  example per thing they name: "What's a recent time you did that? What did you ask, or what
  would you have asked?"
- For each example, ask what made a good answer good: "If the answer were perfect, what would
  it get right? What would annoy you?" Their words become the criteria.
- Ask for any context the task needs (a pasted email, a list, notes). Remove names, emails and
  phone numbers from anything pasted, and tell them you did.
- If they correct you, apply the correction. Don't record it as a new answer.
- If something is ambiguous, ask a short clarifying question instead of guessing.
- Never invent a task, a detail or a criterion they didn't give you.
- If they run dry before 5 tasks, offer a variation on one they gave ("same kind of email, but a
  harder situation?"). Don't make up unrelated tasks.

Turn each task into an eval:
- `id`: `e1`, `e2`, ...
- `category`: one of their 2 to 4 categories
- `title`: 3 to 6 words
- `prompt`: what they would actually type, in their voice
- `context`: pasted material, or `""`
- `criteria`: 2 to 5 checkable statements in their words ("Under 100 words", "Sounds like me,
  not a robot", "Gives a specific time, not 'sometime soon'")

### 3. Confirm the test set

Show every task in one summary: title, category, the prompt, and the criteria. Ask whether
anything should be added, cut or changed. Apply the edits, show the full summary again, and repeat
until they confirm with nothing left to change. This is the only confirmation step. Then write
`evals.json`.

### 4. Run the models

For every eval and every model, spawn a subagent with the Agent tool:
`subagent_type: "general-purpose"`, `model: <haiku|sonnet|opus>`, `run_in_background: false`.
Send one eval's three calls together in a single message so they run in parallel. Use exactly this
prompt, filling in the eval:

```
You are being tested as a plain assistant. Do not use any tools. Answer the task below directly
as your final message, with nothing before or after the answer. If something is unclear, make a
reasonable assumption rather than asking.

TASK:
<prompt>

CONTEXT:
<context, or "None">
```

From each result, copy the answer text exactly as returned (strip only the harness's indentation)
and `duration_ms` from the usage block. Append `{eval_id, model, text, duration_ms}` to
`responses.json`. Write the file after each eval, so a failure partway through loses nothing. If a
call errors or uses a tool, retry it once. If it fails again, tell them and continue.

Keep them company while it runs: one short line per eval ("Task 3 of 8 done").

Then run: `python3 <skill_dir>/scripts/bench.py blind <run_dir>`

### 5. Judge

Read `blind.md`. Never read `blind.json` before step 7. For each eval, spawn one `opus` subagent
(`run_in_background: false`; send several evals' judge calls in one message) with:

```
You are grading answers to a task for a specific person. Do not use any tools. The answers are
labelled by letter and their order is random; ignore length and order, and judge only against
the person's criteria.

TASK:
<prompt>

CONTEXT:
<context, or "None">

THE PERSON'S CRITERIA:
1. <criterion>
2. ...

<"RESPONSE A:\n<text>" for each label, in label order>

Return only JSON, no prose around it:
[{"label": "A", "criteria_scores": [<1-5 per criterion, in order>], "overall": <1-10>,
  "reason": "<one sentence>"}, ...]
```

Parse the JSON, add `eval_id` to each item, and write them all to `judge.json`. If the JSON doesn't
parse, re-ask that judge once.

### 6. Blind rating by the person

For each eval, use AskUserQuestion with two questions:
- "Task <n>: <title>. Which answer is best?" (header "Best")
- "Which answer is worst?" (header "Worst")

Each question's options are the labels (`Answer A`, `Answer B`, `Answer C`), and each option's
`preview` is that answer's full text. Put the prompt in the question text if it fits; otherwise
show the prompt in chat just before asking. Don't show judge scores or hint at which model is
which. If they pick the same answer for best and worst, or type a tie, ask that eval again.

Append `{eval_id, best, worst, note}` to `human.json` (`note` = anything they typed, or `""`).
Write after each eval. They can stop early; the report uses whatever is rated.

### 7. Report

Run `python3 <skill_dir>/scripts/bench.py report <run_dir>`. It writes `report.md` and prints it.

Show them the ranking table and say in two or three sentences what it means, in their terms:
which model won their kind of work, where the models were close, and whether the judge agreed with
them. Then reveal which model wrote each answer they picked as best. Run `open <run_dir>/report.md`.

### 8. Save

The run folder holds their real tasks. Ask before committing it. If they agree, commit the run
folder to `main` with the message `Personal bench run: <who> <date>` and push. If not, leave it
uncommitted and say where it is.

## Known limits (say so if asked)

- Subagents carry Claude Code's own setup instructions, so this tests the models inside a
  harness, not the raw API. That's acceptable for the prototype; the app will call the API
  directly.
- There's no cost column: subagent token counts include the harness, so they would mislead.
- One answer per model per eval. With 5 to 10 evals, small gaps are noise.
- The judge is a Claude model grading Claude models. The person's picks rank first.
