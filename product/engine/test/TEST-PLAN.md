# MySI engine test plan

Run: `npm test` (starts `wrangler dev` itself) or `MCP_URL=https://<worker-url> npm test` to hit a
deployed Worker. No test dependencies: Node's built-in runner plus plain `fetch` JSON-RPC.

## Layers

| Layer | What | Where |
|---|---|---|
| Protocol | initialize, stateless calls, notifications, parse errors, unknown method/tool, 406/405, CORS | `mcp.test.mjs` |
| Generic tool contract | every tool in `tools/list` has snake_case name, real description, object schema; new tools are covered automatically | `mcp.test.mjs` |
| Per-tool | `ping` today; one `describe` block per tool as the build lands | `mcp.test.mjs` |
| Pure logic (next) | bench.py port: feed `product/bench/runs/2026-10-19-builder-2` judge/human/blind files, expect its `report.md` | add when the port lands |
| Tool flow (next) | start_benchmark -> save_tests -> run_models -> check_run -> get_results, with OpenRouter and Supabase faked | add with the build PR |
| Manual (Tyler / wife) | add connector in Claude.ai and ChatGPT unaided; log every snag | spec build step 6 |

## Cases to add per upcoming tool

- `start_benchmark`: returns a long random run ID (unguessable, >= 128 bits), interview rules non-empty; two calls give different IDs.
- `save_tests`: rejects unknown run ID, empty set, malformed eval JSON, oversized input; idempotent re-save; text-mode only.
- `run_models`: returns immediately (< 5s) while work continues; rejects double-start; fewer than 3 or more than 5 models; one model failing does not fail the run.
- `check_run`: monotonic progress; rating link appears only when ready; unknown ID gives a plain error.
- `get_results`: judge-only fallback before ratings; ranking matches bench.py for the fixture runs; blind order never leaks model names before rating.
- `/r/<runId>`: 404 for unknown ID; page never contains model names before rating is submitted.
- Cross-cutting: errors are `isError` results in plain language (the chat model relays them to a non-technical person), no stack traces or secrets in output.

## Known observations (not bugs yet)

- `POST /` returns 404. If a person pastes the bare Worker URL (no `/mcp`) into a connector dialog it will fail. Consider routing `/` POST to the MCP handler or making the setup page's URL copy button more prominent. Matters for the biggest open risk (non-technical connector setup).

## From the UX spec (`ux/002-harness-ux.md`, draft)

### Automated, per tool once built
- Every tool result has `next_step`; `message_for_person` never contains "eval", "judge", "OpenRouter", "run ID" or raw JSON (vocabulary table).
- Read-only tools (`check_connection`, `get_task_ideas`, `check_run`, `get_answers`, `get_results`, `which_model`) set `readOnlyHint: true`; the others don't.
- `save_tests` coaching notes fire for each spec row: vague criterion, attachment mentioned but empty `context`, fewer than 2 criteria, single category, name/email/phone found (stripped), file-style answer.
- `run_models` refuses without `person_confirmed: true`; refuses over the cap (10 tasks x 5 models); returns the lineup by company only, no model names.
- Blindness, the core guarantee: `get_answers` never contains a model name or the label-to-model mapping; labels reshuffle per task; self-identification ("As ChatGPT", "I'm Claude", "Gemini here") is replaced with "[model name removed]"; judge scores are absent from every result until `get_results`; `submit_rating` and `check_run` leak neither.
- `submit_rating`: same letter for best and worst is rejected; best-only is accepted; unknown task or run ID gives a plain error; re-rating a task overwrites or is rejected, one or the other, consistently.
- `get_results` with zero ratings is labelled judge-only and says it is not the person's picks; stopping early ranks on what was rated.
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
