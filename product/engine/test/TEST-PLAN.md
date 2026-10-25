# MySI engine test plan

Run: `npm run test:all` (each server suite starts its own `wrangler dev`, on mock models with the
owner's log off even if a local `.env` has real keys) or `MCP_URL=https://<worker-url> npm run
test:protocol` to hit a deployed Worker. Last full run 2026-10-24: 73 tests, all passing. No test dependencies: Node's built-in runner plus plain `fetch` JSON-RPC.

## Layers

| Layer | What | Where |
|---|---|---|
| Protocol | initialize, stateless calls, notifications, parse errors, unknown method/tool, 406/405, CORS | `mcp.test.mjs` |
| Generic tool contract | every tool in `tools/list` has snake_case name, real description, object schema; new tools are covered automatically | `mcp.test.mjs` |
| Per-tool | every tool, refusals, blindness, limits, personal URLs, owner's log | `tools.test.mjs`, `limits.test.mjs`, `identity.test.mjs`, `admin.test.mjs` |
| Pure logic | bench.py port against the builder runs' `report.md`; tie-break, judge style counts and chat-app detection (decision 009); coaching and scrubbing | `bench.test.ts`, `golden.test.mjs`, `feedback.test.ts`, `coach.test.ts` |
| Tool flow | start_benchmark -> save_tests -> run_models -> check_run -> get_results, mock models | `flow.test.mjs` (`npm run test:flow`, needs a running dev server) |
| Judge eval | do the judges enforce "avoid" rules like no em dashes | `product/evals/judge-style-rules.json`, `npm run eval:judges` (real OpenRouter calls) |
| Manual (Tyler / wife) | add connector in Claude unaided; log every snag | done 2026-10-24, interview 06; ChatGPT not tried |

## Cases to add per upcoming tool

- `start_benchmark`: returns a long random run ID (unguessable, >= 128 bits), interview rules non-empty; two calls give different IDs.
- `save_tests`: rejects unknown run ID, empty set, malformed eval JSON, oversized input; idempotent re-save; text-mode only.
- `run_models`: returns immediately (< 5s) while work continues; rejects double-start; fewer than 3 or more than 5 models; one model failing does not fail the run.
- `check_run`: monotonic progress; rating link appears only when ready; unknown ID gives a plain error.
- `get_results`: judge-only fallback before ratings; ranking matches bench.py for the fixture runs; blind order never leaks model names before rating.
- `/r/<runId>`: 404 for unknown ID; page never contains model names before rating is submitted.
- Cross-cutting: errors are `isError` results in plain language (the chat model relays them to a non-technical person), no stack traces or secrets in output.

## Known observations (not bugs yet)

- ~~`POST /` returns 404.~~ Fixed: `POST /` serves MCP too (tested in `mcp.test.mjs`).

## From the UX spec (`ux/002-harness-ux.md`, draft)

### Automated, per tool once built
- Every tool result has `next_step`; `message_for_person` never contains "eval", "judge", "OpenRouter", "run ID" or raw JSON (vocabulary table).
- Read-only tools (`check_connection`, `get_task_ideas`, `check_run`, `get_answers`, `get_results`, `which_model`) set `readOnlyHint: true`; the others don't.
- `save_tests` coaching notes fire for each spec row: vague criterion, attachment mentioned but empty `context`, fewer than 2 criteria, single category, name/email/phone found (stripped), file-style answer.
- `run_models` refuses without `person_confirmed: true`; refuses over the cap (10 tasks x 5 models); returns the lineup by company only, no model names.
- Blindness, the core guarantee: `get_answers` never contains a model name or the label-to-model mapping; labels reshuffle per task; self-identification ("As ChatGPT", "I'm Claude", "Gemini here") is replaced with "[model name removed]"; judge scores are absent from every result until `get_results`; `submit_rating` and `check_run` leak neither.
- `submit_rating`: same letter for best and worst is rejected; best-only is accepted; unknown task or run ID gives a plain error; re-rating a task overwrites or is rejected, one or the other, consistently.
- `get_results` with zero ratings gives no ranking and asks the person to rate at least one test (spec 002: the person sees only their own picks); stopping early ranks on what was rated.
- Identity: `/mcp/u/<key>` keys are long and random; a profile written under one key is invisible under another; `which_model` for an unknown key says "not tested yet".
- Edge cases table: model call fails twice (min 2 answers still shown, results note it), add a task after running (only the new task runs), resume an unfinished run.

### Host behaviour (what code tests can't catch)
Whether Claude or ChatGPT shows answers word for word and stays blind is decided by the host model, not our code. Test it by driving a real host with a scripted person and checking the transcript.

Scripted probes, run on Claude.ai, ChatGPT and Claude Code, 3 runs each (host output varies):
1. Show answers verbatim: diff the host's displayed answers against the `get_answers` text. Fail on any trimming, reformatting, summary or quality comment.
2. "Which one is Claude?" mid-rating: pass only if the host declines and says it's revealed at the end.
3. Person says "A was way too long": host calls `submit_rating` with the right best, worst and note.
4. Person rates "they're all fine": best-only recorded.
5. Person says "that's enough, show me results" after 2 of 6 tasks.
6. Host never loops on `check_run` more than 3 times in one turn.
7. Interview: one question at a time, no "eval" or "criteria" said to the person, asks permission before saving to memory.
8. Interview with a person who says "I don't really use AI": host still gets to 5 tasks.
9. Long answers (over 400 words): host shows them in full and suggests the page.

Record per run: host, model, pass/fail per probe, transcript. A fail on probes 1 or 2 means the display rules in `next_step` need strengthening, or the widget/page becomes the main path.

### Manual, the wife test
Measure what the spec lists: connected alone and how long, interview minutes, tasks written, coaching notes fired, rated where (chat, widget, page), any blindness break, whether she picks a winner she'd use and saves it. Also watch whether she clicks "Always allow" and what she does at the first permission prompt.

## Standing risks to re-check each release
- Tool call time under about 60s on every tool (`run_models` returns at once).
- Setup page shows the exact connector URL for the current host and, after identity lands, the personal `/mcp/u/<key>` URL rather than a shared one.

## Against spec 001 (PR #1)

Built now (26 tests passing):
- `blindness.mjs`: `assertBlind(text, {allow})` scans any tool result or `/r/<run_id>` page source for model names, judge/cost/latency fields, dollar amounts and label maps. Self-tested in `blindness.test.mjs`. Every tool test should call it on the full result (text block and `structuredContent`) before `get_results`. Caveat: a real task answer can mention "Google" or "Meta" legitimately, so for `get_answers` scan the envelope fields and use `allow` for words that appear in the person's own test text.
- `golden.test.mjs`: `bench.py` reproduces `report.md` byte for byte for both builder runs today. When the TS port lands, swap `render()` to call it. The new cost column is the only allowed difference, so strip it before comparing.

Spec 001 cases not yet written (need the tools):
- Limits: 11 tests refused; field limits (title 80, prompt 4,000, context 8,000, criteria 1 to 7 at 200 each) name the test and field in the error; `run_models` twice returns the same status, never a second job; `save_tests` after the run leaves `draft` is refused; `submit_rating` after `get_results` is refused; re-rating overwrites; `best` equals `worst` is refused.
- Scrub: emails and phones become `[email]` and `[phone]` and are reported; "As ChatGPT", "I'm Claude", "Gemini here", "as an OpenAI model" become "[model name removed]" in display text while the raw text is kept for the report.
- Shape: every result has `next_step` in the text block and the same data in `structuredContent`.
- Failure modes (fake OpenRouter): one model failing twice still leaves the test ratable with 2+ answers; fewer than 2 models answering most tests fails the run with a plain reason; judge JSON that doesn't parse is retried once then skipped; estimated cost above the per-run cap is refused with a plain sentence.
- Abuse limits: per-IP cap on `start_benchmark` and `run_models`, global daily run counter.
- Page: `/r/<run_id>` unknown ID is 404; page source passes `assertBlind` until the reveal; `POST /r/<run_id>/rate` writes the same rating `check_run` sees.
- Cost: spec asks for a credit limit on the OpenRouter key before the URL is shared. Not testable in code; add it to Tyler's pre-launch checklist.

## Status against build PR #2 (merged into this branch)

`npm run test:all` runs unit + golden + blindness self-tests, the protocol suite and the tool suite, each starting its own local Worker with mock models and `MAX_RUNS_PER_DAY=1000`. `npm run test:flow` is the build thread's happy-path flow (needs a running dev server). Suites run one at a time because parallel `wrangler dev` starts collide.

Covered in `tools.test.mjs`: read-only annotations, `next_step` on every result, plain-language errors, run-ID entropy, save_tests limits and scrubbing and coaching, run_models refusals and company-only lineup, blindness of every tool result and of the rating-page source, stable label order, rating rules, judge-only results, rating closed after the reveal, page 404 and escaping, rerun_test stub; `limits.test.mjs` covers the daily cap.

Open bugs: none known. (POST /r/<id>/rate with a non-form body returned 500; fixed in 7d574f7, now 400.)
Identity (personal URLs, per-key isolation) is covered by `identity.test.mjs`.
Not covered yet: per-IP rate limit (not built), self-identification scrub end to end (mock answers never name a model; unit tests in `coach.test.ts` cover the function), judge disagreement, the real OpenRouter path.
