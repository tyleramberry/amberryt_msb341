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
