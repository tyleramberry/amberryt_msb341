# Decision 007: Store each benchmark run in its own Durable Object, not Supabase

**Date:** 2026-10-22
**Status:** Active. Changes the storage half of [003](003-v0-web-stack.md) as carried into
[006](006-pivot-to-personal-benchmark.md). Cloudflare Workers and OpenRouter stay.

## Context

Decision 006 kept the Homeroom stack (Workers + Supabase) for the MySI engine. Building it showed
two needs Supabase doesn't help with:

- `run_models` has to keep working for several minutes after the tool call returns. A Worker's
  `waitUntil` stops 30 seconds after the response, so the work needs somewhere durable to live
  anyway.
- A run is five or six small tables that only that run reads. There are no accounts, so
  Supabase's main reason for being picked in 003 (per-user auth) doesn't apply.

The [stack research](../discovery/research/2026-10-22-stack-recommendation.md) and the build thread
reached the same answer independently.

## Options considered

1. **Supabase (as in 003).** Familiar, easy to query across runs / another vendor, a service-role
   secret in the Worker, a network hop per write, and it still needs a separate background job.
2. **D1 (Cloudflare's SQL database).** One database for everything, cross-run queries are easy /
   still needs a separate background job, and every run shares one database.
3. **A Durable Object per run with its built-in SQLite, using alarms for the background work.**
   State and the job live together, no extra account or secret, the run ID maps straight to its
   object / no query across runs, and alarms have a 15-minute wall clock per invocation.
4. **Cloudflare Workflows for the job, plus any of the above for storage.** Per-step retries and
   no wall-clock limit / one more moving part for a job that fits in an alarm.

## Decision

Option 3. The run's storage and its background job are the same thing, and keeping them together
removes a vendor, a secret and a class of half-written runs. Storage sits behind a small
interface so D1 or Supabase can come back.

## What would change our mind

- **Re-running people's tests when a new model ships** (next scope) needs a list of runs across
  people. A per-person object (spec 001, Identity) or D1 as a registry is the fix; if those get
  awkward, move to D1.
- **A run outgrows an alarm**, failing to finish without many retries. Then move the job to
  Workflows and keep the storage.
- **I need to look at many runs at once** for the sprint review or analytics, and exporting from
  each object is too painful.
