# Spec 001: MySI engine, reached through an MCP connector

**Status:** In progress
**Date:** 2026-10-21 (first draft as `bench-mcp.md`), rewritten 2026-10-22

What the person sees and hears, step by step, is in [spec 002](002-harness-ux.md). This spec
covers what the engine does: the tools, the data, the model calls, the judging, the limits.
Where the two disagree, 002 wins on wording and flow, and this spec wins on what the server does.

## Problem

Models are released faster than anyone can follow, and public leaderboards don't say which model
is good at *your* work. The `/personal-bench` skill already answers that for one person (two runs
in `product/bench/runs/2026-10-19-builder*`), but it only runs in a terminal and can only test
Claude models. [Decision 006](../decisions/006-pivot-to-personal-benchmark.md) picks the form
factor: a hosted engine reached through a remote MCP connector, plus one page for blind rating.
Sprint 3's test user is a non-technical person (my wife) who has never written an eval, going
through it herself.

MySI lives inside the person's chat app (Claude, ChatGPT, or any MCP client), not in an app of
our own. The host app's model is the front end. The engine steers it only through tool
descriptions, server instructions and tool results, so those are product copy, not plumbing.

## What we're making

One Cloudflare Worker in `product/engine/` that serves, from one URL:

- **`/mcp`**: a remote MCP server (Streamable HTTP, no sign-in) the person adds as a custom
  connector. Their chat app runs the interview; the engine does everything else.
- **`/`**: the setup page with connector steps for each chat app (live today, to be renamed MySI).
- **`/r/<run_id>`**: the blind rating page and, after the reveal, the report. This is the live
  link.

### Where each part of the skill goes

| Skill part | Engine |
|---|---|
| Steps 1–3: set up, interview, confirm | Stays in the chat app. `start_benchmark` returns the interview guide (ported from SKILL.md, text in spec 002's appendix). `save_tests` coaches along the way. |
| `evals.json` | The input to `save_tests`. Same fields, text mode only. |
| Step 4: subagents | The engine calls 3 models from different vendors through OpenRouter, with the same "plain assistant" prompt. |
| `bench.py blind` / `report` | Ported to TypeScript, same math, tested against the existing run folders. |
| Step 5: judge | Server-side calls, two judges, same judge prompt. Stored for Tyler only; never shown to the person. |
| Step 6: blind rating | In chat (`get_answers` + `submit_rating`) or on the rating page. Same best/worst question. |
| Step 7: report | `get_results` returns the headline, table and reveal to the chat; the page keeps the full report. |

### Words

| Internal | What the person hears |
|---|---|
| test (the skill's "eval") | test task |
| criteria | what a great answer gets right |
| run | a benchmark |
| lineup | 4 AI models from different companies |

- A **run** is one pass of a lineup over a person's tests, with its judging and ratings. Its ID
  is long and random (at least 128 bits, URL-safe) and is the key to the run and its page.
- Test IDs are `t1`, `t2`… assigned by the engine in order.

### The flow, as tool calls

```
person: "find my best AI model"
  host → start_benchmark       ← run_id, intro, interview guide
  host interviews the person, one question at a time
  host → save_tests            (after every drafted task) ← cards, coaching notes
  host shows every card, person says it's good
  host → run_models {person_confirmed: true}   ← lineup by company, about N minutes
  host → check_run             ← t1 ready to rate, t2 running…
  host → get_answers           ← t1's answers A–D, display rules
  person: "B best, D worst"
  host → submit_rating         ← next test ready or not
  … repeat until all rated, or the person says "show me results"
  host → get_results           ← headline, table, reveal, memory line, report link
later chat: "which AI should I use for this email?"
  host → which_model           ← the winner for that kind of work
```

### Tools

| Tool | Input | Returns | Read-only |
|---|---|---|---|
| `check_connection` | none | "MySI is connected", and the first sentence to say. Renamed from `ping`. | yes |
| `start_benchmark` | `{label?, from_run?}` | `{run_id, rating_url}`, the intro and the interview guide; or, if this person has an unfinished run, its state so the host can resume. `from_run` copies an old run's tests. | no |
| `get_task_ideas` | `{about_person}`: role and tasks named so far | 3–5 ideas for the host to *ask about* and adapt, never to save as tasks. Fixed idea questions, no model call. | yes |
| `save_tests` | `{run_id, tests: [{category, title, prompt, context, criteria[]}], person_done?}` | The saved tests as Markdown cards, `coaching_notes` per test, `ready_to_confirm`, anything scrubbed. Replaces the whole set; allowed only while the run is `draft`. | no |
| `run_models` | `{run_id, person_confirmed: true, models?}` | The lineup **by company only**, an estimate in minutes, the cost cap. Starts the background job. Refuses without `person_confirmed`. A second call returns the same status, never a second job. | no |
| `check_run` | `{run_id}` | Run status (`draft`, `running`, `ready`, `finished`, `failed`) and each test's status (`queued`, `running`, `ready_to_rate`, `rated`), plus what to do next. | yes |
| `get_answers` | `{run_id, test_id?}` | One test's prompt, context, criteria and answers labelled A, B, C, D, with display rules and the page link. Omitted `test_id` = the next test ready to rate. | yes |
| `submit_rating` | `{run_id, test_id, best, worst?, note?}` | Saved; whether the next test is ready. Re-rating overwrites. `best` = `worst` is refused. | no |
| `get_results` | `{run_id}` | `{headline, markdown, rows, by_category, reveal, trust, memory_line, report_url, cost_usd}`. Ranks on whatever is rated; if nothing is rated, says so and asks the person to rate at least one test. Reveals every label and marks the run `finished`, so no more ratings. | yes* |
| `which_model` | `{task_description?, run_id?}` | The person's winner for the closest kind of work, or "you haven't tested this kind of work yet", and their past benchmarks with links. Called through a personal connector URL, it answers from all of that person's runs; through plain `/mcp`, it needs a `run_id` and answers from that run only. | yes |
| `rerun_test` | `{run_id, model?}` | Sprint 3 stub: says it's coming soon and records the interest. | no |

\* `get_results` changes the run's state, but only to close rating. It is marked read-only so hosts
don't ask permission for it; the reveal is what the person asked for.

Rules every tool follows:

- **Shape of a result.** Every result has `next_step` (instructions for the host: what to say,
  what to call next) and, where useful, `message_for_person` (plain words to pass on). Both are in
  the text content block, because some hosts ignore `structuredContent`, and repeated in
  `structuredContent` with an output schema.
- **Annotations.** Read-only tools set `readOnlyHint: true` so hosts ask fewer permission
  questions.
- **Blinding.** Before `get_results`, no result or page contains a model name, a company tied to a
  label, a judge score, a per-answer cost or latency, or the label map. A leak is a bug, and the
  testing thread checks for it. The A/B/C/D order is shuffled per test with a cryptographic random
  source and fixed once written (same as `bench.py blind`).
- **Self-identification scrub.** Before an answer is stored for display, phrases where a model
  names itself or its maker ("As ChatGPT…", "I'm Claude", "Gemini here", "as an OpenAI model")
  are replaced with "[model name removed]". The raw answer is kept for the report.
- **Errors explain themselves.** A bad call returns `isError: true` and a sentence the host can
  act on ("This benchmark already started; call check_run instead"), never a stack trace.
- **Descriptions are product copy.** Each says when to call the tool in the person's terms, and
  what not to do. Spec 002 owns the exact wording.
- **Logging.** Every tool call is logged with run ID, tool, timestamp and outcome (no test text),
  so the gaps between calls show where people stall.

Besides tools (all optional shortcuts, since support differs by app; the flow works with tools
alone):

- **Server instructions** at connect time (spec 002 has the text).
- **Prompts:** `find_my_best_model`, `rate_my_answers`, `which_ai_for_this`.
- **Resources:** `mysi://guide/interview`, `mysi://runs/{run_id}/report`. The `ui://mysi/rate`
  and `ui://mysi/results` widgets are version 2 (see Out of scope).

### `save_tests`: validation and coaching

Validation:

- 1 to 10 tests; the default the guide asks for is 3 (Tyler's call, 2026-10-25: short enough that
  a first-timer finishes). More is allowed up to the cap, and the results say once that 3 tests
  give a rough ranking, not a firm one.
- Each test: `category`, `title` (≤ 80 chars), `prompt` (≤ 4,000 chars), `context` (≤ 8,000
  chars, may be empty), `criteria` (1 to 7 items, each ≤ 200 chars). Over a limit returns an error
  that says which test and field.
- A backstop scrub replaces email addresses and phone numbers with `[email]` and `[phone]` and
  reports each replacement. The guide already asks the host to remove names, emails and phone
  numbers; this catches what it misses. Names can't be caught reliably by pattern, so the guide
  stays the main defence.

Coaching notes are deterministic rules, not a model call, so they're fast, free and testable:

| Rule | Note |
|---|---|
| A criterion is only a vague word ("good", "professional", "helpful", "clear") | ask what that means to them |
| The prompt mentions an email, attachment, list or notes, and `context` is empty | ask them to paste it |
| Fewer than 2 criteria | ask what would annoy them about a bad answer |
| 3 or more tests, all in one category | ask about a different kind of work |
| The prompt asks for a file (web page, spreadsheet, slides, code, a long document) | say it isn't supported yet; ask for a chat-sized version |

`ready_to_confirm` is true once there are 3 or more tests with no open notes, or the host passes
`person_done: true`.

### Model calls

- All through OpenRouter's chat completions API, one key held as a Worker secret.
- **Default lineup:** 3 models, one each from OpenAI, Anthropic and Google, each the vendor's
  current general model at a mid price. The person doesn't choose; the
  optional `models` input (3–5 OpenRouter IDs) is for builders. Exact IDs live in config and are
  copied onto each run, so a run always records what it tested.
- **Same prompt as the skill**, as the system message: "You are being tested as a plain
  assistant… make a reasonable assumption rather than asking." The task and context go in the
  user message. No tools, no web search, provider-default temperature, `max_tokens` 2,000.
- **Privacy:** request providers that don't train on or retain prompts (OpenRouter's
  `provider.data_collection: "deny"`). A model with no such provider is left out of the default
  lineup.
- **Order:** tests run in order (all of `t1`'s models, then `t1`'s judging, then `t2`…). A test is
  `ready_to_rate` as soon as its answers are in, before its judging finishes, so `t1` is usually
  ready within a minute and the person rates while the rest run. At most 4 calls in flight.
- Per answer, store the raw text, the scrubbed display text, latency, input and output tokens, and
  cost (OpenRouter returns cost per request).
- Each call times out at 120 s and is retried twice with backoff. If a model still fails, its
  answer is marked failed and the run carries on. A test is ratable with answers from at least 2
  models. A run fails, with a plain reason, if fewer than 2 models answered most tests.

### Judging (internal only)

Decided 2026-10-25 (spec 002): **the person sees only their own picks.** The judge still runs
and its scores are stored, so Tyler can check whether a judge agrees with people (decision 006's
second risk), but no tool result, page or report shown to the person includes them.


- Two judges from **vendors not in the lineup**, picked at run time from a configured pool and
  stored on the run. A judge from the same vendor as a contestant tends to favour it, and the
  lineup already covers the big vendors, so the pool is open-weight and smaller-vendor models.
  If the pool can't supply two outside judges for a custom lineup, use one and say so in the
  report.
- One call per judge per test with the skill's judge prompt (blind labels, shuffled order, "ignore
  length and order"), returning `[{label, criteria_scores[], overall, reason}]`. Ask for JSON with
  a schema where the provider supports it; if it doesn't parse, retry once, then skip that judge
  for that test.
- A model's judge score for a test is the mean of the judges' `overall`. Each judge's scores are
  stored separately so disagreement can be shown.
- Judge scores never appear in anything the person sees, before or after the reveal. They are read
  only by Tyler, from the run's storage (a builder-only export, not a tool).

### Ranking

A line-by-line port of `bench.py report`, so the same inputs give the same table:

- Your score: best = 2, worst = 0, the rest = 1, averaged over rated tests. If only `best` was
  given, best = 2 and the rest = 1. Ranked by your score; ties stay ties (shown as equal rank).
- Columns: rank, model, your score, your picks for best, median time, and a new **cost per
  answer** (the skill couldn't measure cost; the API can). No judge column. The chat table and the
  rating page show the same columns.
- Sections: ranking, by category, each test, how much to trust this (number of tests, the note
  that small gaps may be luck).
- This departs from `bench.py report`, which shows the judge. The port keeps the judge math so
  eval 1 can still match the builder runs' `report.md`, but the person-facing report drops those
  columns and the agreement line.
- `get_results` also builds the chat version from the same numbers: a one-sentence headline
  ("For your work, X came out on top: you picked it as best on 4 of 6 tasks"), a trimmed table,
  by-category only when the winner differs, the reveal per test, and a `memory_line` the host can
  offer to save ("For writing tasks I do best with X; for planning, Y. MySI benchmark, Oct 2026").

### Background job

`run_models` returns at once. Even 3 tests × 3 models plus judging takes a few minutes, and up to
10 × 5 takes much longer, longer than hosts wait
on a tool call (Claude allows 240 s; ChatGPT's limit is undocumented), and a Worker's `waitUntil`
dies 30 s after the response. So the job runs in **one Durable Object per run**: the object holds
the run's state and storage and uses alarms to work through the calls in small batches. Each
answer is saved as soon as it returns, so an alarm that fails and retries resumes instead of
starting over. Progress is what `check_run` reports. If a run ever needs more than an alarm's
15 minutes of wall clock without checkpointing, switch to Cloudflare Workflows. Research:
[stack recommendation](../discovery/research/2026-10-22-stack-recommendation.md).

### Data

Each run's Durable Object has its own SQLite database
([decision 007](../decisions/007-engine-storage-durable-objects.md), replacing Supabase):

| Table | Holds |
|---|---|
| `run` | id, label, status, lineup, judges, created/started/finished times, total cost, error |
| `tests` | id (`t1`…), position, category, title, prompt, context, criteria (JSON), status |
| `responses` | test_id, model, raw text, display text, latency_ms, tokens in/out, cost_usd, error |
| `labels` | test_id, label, model (the blind map) |
| `judgments` | test_id, judge, label, criteria_scores (JSON), overall, reason |
| `ratings` | test_id, best, worst, note, source (`chat` or `page`), rated_at |
| `events` | tool or page action, timestamp, outcome (for the stall log) |

Two kinds of shared object: one global counter for the daily run cap, and one object per person
(below).

### Identity: a personal connector URL

Decided 2026-10-25 ([decision 008](../decisions/008-identity-personal-connector-url.md)).
`which_model`, resuming an unfinished run in a new chat, and next scope's re-runs all need to know
who is calling, and Sprint 3 has no accounts. So the setup page
gives each person their own connector URL, `/mcp/u/<key>`, with a long random key. Requests to
that URL are tied to a per-person Durable Object holding their run IDs and their profile (winner
overall and per category, from each finished run). The key never appears in chat. Plain `/mcp`
keeps working, without memory. Anyone holding a person's URL can see their results, the same
trade-off the run link makes. The key is at least 128 bits, URL-safe, and is never written to logs.
The setup page shows it once, with a copy button and a note to keep the link private.

### Rating page: `/r/<run_id>`

- Before any test is ready: progress, refreshing itself.
- Then one test per screen: prompt and criteria at the top, answers A–D below, rendered as
  Markdown, side by side on wide screens and stacked on phones. Pick best and worst, optional
  note, next. `POST /r/<run_id>/rate` writes the same `ratings` rows as `submit_rating`, so
  `check_run` in the chat sees them.
- After `get_results` (or after every test is rated and the person taps "See results"): the full
  report, with model names revealed.
- No model name, judge score or cost appears anywhere on the page before the reveal, including in
  the page source.
- Works on a phone at 360 px wide, light and dark.

### Limits and cost

The connector is public and has no sign-in, so anyone with the URL can spend my OpenRouter money.

- At most 10 tests × 5 models per run, 2 judges.
- A hard credit limit on the OpenRouter key, set before the connector URL is shared (for example
  US$5 with a monthly reset). This is the real backstop.
- A global daily run cap: 20 runs a day across everyone. No per-IP limit: Claude.ai calls
  connectors from shared IPs, so one would throttle every Claude user at once.
- A per-run spend cap of US$2, checked between steps against the cost OpenRouter reports. When a
  run hits it, it stops and keeps what it has, and the host gets a plain sentence to pass on.
  (An up-front estimate was dropped: prices and answer lengths vary too much to estimate well.)
- Workers paid plan (US$5 a month): the free plan's 10 ms of CPU per request is too tight for JSON
  work on long answers.
- If abuse shows up anyway: a shared secret in the URL path (the personal URL already is one),
  then OAuth.
- Estimated cost per default run (3 tests × 3 models + 2 judges): a few cents. Measured from
  my wife's run and written into the sprint review.

### Evals (AGENTS.md: every AI feature gets one)

In `product/evals/`:

1. **Report port:** feed each `product/bench/runs/2026-10-19-builder*` folder into the TypeScript
   port and match its `report.md` (ignoring the new cost column).
2. **Interview guide:** 3 scripted personas (a small-business owner, a student, a parent planning
   the week) run the guide in Claude and ChatGPT. Pass if the host asks one question at a time,
   invents no task or criterion, removes names/emails/phones, shows the first card early, shows
   the full set and gets a yes before `run_models`.
3. **Display rules:** in Claude and ChatGPT, does the host show answers word for word, without
   commenting or guessing the model? Checked on the persona runs.
4. **Coaching notes:** a table of example tests with the notes each should and shouldn't trigger.
5. **Judge agreement (internal):** on the builder runs plus my wife's, how often the judges' top pick matches
   the person's best, and the rate of unparseable judge JSON (target 0 after retry).

## Decisions inside this spec

- **Judges:** two, from vendors outside the lineup, stored for analysis only; the ranking is the
  person's own picks.
- **Rating in chat first, with the page always offered.** Keeping the person in their chat app is
  the point of decision 006; the page is there for long answers and phones.
- **Rating starts before running ends.** Tests run in order so the person rates while the rest
  finish.
- **Results close rating.** Once models are revealed, later ratings wouldn't be blind.
- **Storage:** a Durable Object per run with SQLite instead of Supabase (decision 007).
- **Dependencies:** Cloudflare's `agents` package (its MCP handler), `@modelcontextprotocol/server`,
  and `zod`, all already installed. No OpenRouter SDK; plain `fetch`.
- **The skill stays** as the control group and for builders. Retire it only once the engine
  produces matching reports.

## Build order

1. ~~Hello-world connector, deployed.~~ Done: `ping` at
   https://personal-bench.homeroom-app.workers.dev/mcp. Still to do: my wife adds it herself.
   Decision 006 changes if she can't.
2. **Port `bench.py` to TypeScript** with tests (eval 1).
3. **Run storage** (Durable Object + SQLite) and the daily counter.
4. **Tools, end to end**, with `run_models` as the background job, tests in order.
5. **In-chat rating and the rating page** at `/r/<run_id>`.
6. **Personal connector URLs, the per-person object, and `which_model`.**
7. **Run it once myself, then my wife runs it hands-off.** Log every place she gets stuck.

## Out of scope

- File mode (HTML or document answers, long source files). Needs sandboxed previews; after Sprint 3.
- Accounts and OAuth.
- Re-running tests when a new model ships (next scope, per decision 006; `rerun_test` is a stub),
  and the router (after that).
- Inline widgets inside the chat (MCP Apps). Claude supports them and ChatGPT is rolling them out;
  they'd make rating nicer but add a bundle and per-client quirks. Version 2, once plain-text
  rating and the page both work.
- Choosing the lineup as a person, and several answers per model per test.

## Open questions

- Does my wife get through adding the connector alone? (Build step 1's real test.)
- Default lineup and judge pool: exact model IDs are in config but unverified, because OpenRouter
  was blocked from the build environment. `npm run check-models` checks them; run it before the
  first real run.
- ChatGPT needs Developer mode (web only, paid plans) for a custom connector, a bigger hurdle than
  Claude's "Add custom connector". Claude is the first supported app; ChatGPT is tested but not
  promised for Sprint 3.
- Both apps cache the tool list, so after each deploy the connector has to be refreshed; the setup
  page should say how.

## Definition of done

- [ ] My wife adds the connector, does the interview in her chat app, rates the answers, and gets
      a ranking of 3–5 models from different vendors on her own tests, without me touching
      anything.
- [ ] Shipped: the connector URL and rating page are live and listed in `README.md`.
- [ ] The TypeScript ranking matches `report.md` for both builder runs (eval 1).
- [ ] No tool result or page shows a model name, judge score or cost before the reveal (checked by
      the testing thread).
- [ ] Costs are capped: OpenRouter key limit set, daily run cap on, per-run spend cap
      enforced. Cost per run is recorded from her run.
- [ ] Every place she got stuck is written down in `sprints/`.
