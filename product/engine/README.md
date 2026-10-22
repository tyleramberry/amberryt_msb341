# MySI engine

The Cloudflare Worker behind MySI. Spec: [`specs/001-benchmark-engine-mcp.md`](../../specs/) (engine)
and `specs/002-harness-ux.md` (what the person sees).

| Path | What |
|---|---|
| `/mcp` (and `POST /`) | Remote MCP server, no sign-in. 11 tools, 3 prompts, 2 resources. |
| `/` | Setup page: how to add the connector in Claude, ChatGPT and Claude Code. |
| `/r/<run_id>` | Blind rating page; after the reveal, the full report. |

## Files

| File | Does |
|---|---|
| `src/index.ts` | Routing. |
| `src/tools.ts` | The MCP tools, prompts and resources. Every result has `next_step` for the host model. |
| `src/run.ts` | `RunObject`: one Durable Object per run, with its SQLite tables and the alarm-driven background job (answers, blind labels, judging, test by test). |
| `src/registry.ts` | `RegistryObject`: one global object for the daily run cap, a run index, and re-run interest. |
| `src/bench.ts` | Blinding and ranking, ported line by line from `.claude/skills/personal-bench/scripts/bench.py`. |
| `src/coach.ts` | Coaching notes on drafted tasks, the email/phone backstop, and the model-name scrub. |
| `src/models.ts` | OpenRouter calls, lineup and judge config, and the mock used when there's no key. |
| `src/prompts.ts` | Every piece of text sent to the host, the tested models and the judges. |
| `src/page.ts` | The setup, rating and results pages. |

## Run it locally

```sh
npm install
npm run dev          # wrangler dev on http://localhost:8787, mock models (no key needed)
npm test             # unit tests: bench.py port vs. the committed runs, coaching rules, scrubbing
npm run test:flow    # full tool flow against the running dev server (FLOW_URL to point elsewhere)
npm run typecheck
```

With no `OPENROUTER_API_KEY`, every model and judge call is answered by a deterministic mock, so the
whole flow (interview to results) works offline. Put `MOCK_FAIL:<model id>` in a test prompt to
make that model fail on it.

## Before a real run

1. `npm run check-models` to confirm the lineup and judge ids in `wrangler.jsonc` still exist on
   OpenRouter (and see their prices). Update `LINEUP` / `JUDGE_POOL` there if not.
2. Create an OpenRouter key with a hard credit limit, then `npx wrangler secret put OPENROUTER_API_KEY`.
3. `npm run deploy`. The Durable Object migration (`v1`) runs on the first deploy.

Limits: 10 tests × 5 models per run, 2 judges, `MAX_RUNS_PER_DAY` (20) across everyone, and
`MAX_RUN_COST_USD` (2) per run, checked between steps.
