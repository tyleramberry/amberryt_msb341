# MySI stack recommendation (2026-10-22)

**Verdict:** Keep Cloudflare Workers + OpenRouter on the existing `agents` + `@modelcontextprotocol/server` base. Drop Supabase for the prototype: use **one Durable Object per run (built-in SQLite) with an alarm** for the background model calls, as the build thread proposed. Workflows is the fallback if alarms prove awkward. Rating inside the chat (MCP Apps) is a stretch goal, not the base path.

## What I checked

| Question | Finding | Source |
|---|---|---|
| Claude transport and auth | Streamable HTTP recommended. Authless, OAuth and static-header all supported. Anyone can add a custom connector by URL. | claude.com/docs/connectors/building |
| Claude tool-call timeout | 240 s per call on claude.ai/Desktop. Result cap about 150k characters. | same |
| ChatGPT transport and auth | SSE and streaming HTTP. "No authentication" is an option. Needs Developer mode (Settings > Apps > Advanced), on web, Plus/Pro/Business/Enterprise/Edu. Apps appear as Drafts. | developers.openai.com/api/docs/guides/developer-mode |
| ChatGPT timeout | Not documented. Assume it is shorter than Claude's and design for tool calls that return in seconds. | same |
| Worker limits (paid) | HTTP request CPU up to 5 min (30 s default), CPU excludes time waiting on `fetch`. 10,000 subrequests. 6 simultaneous outbound connections. `waitUntil` only gets 30 s after the response. | developers.cloudflare.com/workers/platform/limits |
| Workflows limits | Per step: wall-clock unlimited, CPU 30 s (up to 5 min paid). 1,024 steps free, 10,000 paid. 1 MiB per step result. Automatic retries. | developers.cloudflare.com/workflows/reference/limits |
| OpenRouter | Per-key spending cap via `limit` field (and `limit_reset`). One API for all vendors. | openrouter.ai/docs/api/reference/limits |

## Decisions

1. **MCP server: Worker, stateless, authless, Streamable HTTP at `/mcp`.** Already deployed and matches both clients. Authless is the only option a non-technical user can set up alone, and it matches the spec's "run link is the secret" model. Risk: anyone with the connector URL can call tools, so protect cost (see 5) and keep run IDs long and random.
2. **Background work: Durable Object alarm (or Workflows).** `waitUntil` dies 30 s after the response, so it cannot run 8 tests x 4 models + judging. `run_models` should start work in a DO alarm (15 min wall clock, retried on failure) and return at once; `check_run` reads progress. Workflows is the alternative (per-step retries, unlimited step wall clock, 1 MiB step result) and is the better choice if one run ever exceeds 15 min. Either way: save each model response as soon as it returns so a retry resumes rather than restarts, and cap parallelism at 5 (6 outbound connections per invocation). Do not rely on one long tool call: Claude allows 240 s but ChatGPT's limit is undocumented.
3. **Polling tool is the contract.** `check_run` returns progress and then the rating link. This works in every harness.
4. **Storage: DO SQLite per run, behind a small interface.** No extra account, keys or network hop, and the run ID maps straight to a DO (`idFromName`). Supabase adds a vendor and secrets for five small tables with no auth need (decision 003 picked it for Homeroom's per-user auth). Limits to know: the rating page and any global counter need a lookup, so keep one global DO for the daily run counter. Cross-run queries (e.g. "all my runs" for the future re-run feature) are awkward in per-run DOs; that is the point to add D1 or Supabase. Fine to defer.
5. **Models and cost: OpenRouter with a hard key cap.** Set the key `limit` (e.g. $5 with reset) before sharing the connector, and enforce the spec's 10 tests x 5 models cap in `save_tests`. Add a global daily run counter in one global DO, since the connector is public. Budget is the real defence on a no-auth connector: the OpenRouter key cap bounds the worst case, and the per-run caps bound a single abuser. If abuse shows up, add a shared secret in the connector URL path or switch to OAuth later.
6. **Rating page:** served by the same Worker at `/r/<runId>`. No separate stack.
7. **Judge:** pick a vendor not in the lineup, through OpenRouter. No stack impact.

## Risks to test early

- ChatGPT: confirm the authless connector can be created and tools list correctly. Developer mode is the biggest setup hurdle for your wife; Claude is the easier first path.
- Both clients cache tool lists. Refresh the app after each deploy.
- Tool descriptions and the `start_benchmark` result carry the whole UX (the harness model runs the interview), so they need the most testing, not the infrastructure.
- Workers free plan gives 10 ms CPU per request; waiting on fetch does not count, but parsing and JSON work might. A Workers paid plan ($5/mo) removes the worry; budget for it.

## MCP Apps (in-chat rating UI)

Claude (web and desktop) and ChatGPT (rolling out) support MCP Apps: a tool sets `_meta.ui.resourceUri` to a `ui://` resource, and the host renders the server's HTML in a sandboxed iframe, with JSON-RPC over `postMessage`. The iframe cannot make arbitrary network requests, so the rating widget would call back through MCP tools (e.g. `submit_rating`). It would be a good in-chat blind rating experience, but it adds a bundle, per-client quirks and (for ChatGPT) rollout uncertainty. Recommendation: ship the `/r/<runId>` page first, since it is client-independent, then add an MCP App as a v2. Not verified end to end; I read one secondary source (WorkOS, Jan 2026), so check the spec and each client's docs before building.

## Not verified

I could not deploy or run anything (read-only). OpenRouter's credit-purchase fee was not on the pages I fetched, so I have not quoted one. Model prices change often; look up per-run cost from real usage data after the first run.
