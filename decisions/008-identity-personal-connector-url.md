# Decision 008: Recognize people by a personal connector URL, not accounts

**Date:** 2026-10-25
**Status:** Active

## Context

MySI has no accounts in Sprint 3 (spec 001, Out of scope). But three things need to know who is
calling: `which_model` in a later chat ("which AI should I use for this?"), resuming an unfinished
benchmark in a new chat, and next scope's re-runs when a new model ships. The chat app's model is
the front end, so whatever identifies the person has to work in every app without extra steps.

## Options considered

1. **Personal connector URL** (`/mcp/u/<key>`, made on the setup page). Nothing to type or
   remember, works in every chat app, and the key never appears in chat / anyone holding the URL
   sees that person's results, and losing it loses the profile.
2. **A spoken code** ("my MySI code is blue-otter-42") with one shared URL. Simpler setup / the
   person has to keep the code, the host model sees it, and it's easy to guess if short.
3. **No memory for Sprint 3.** Least to build / cuts `which_model` and resume, and re-runs would
   have no list of tests to run.
4. **OAuth.** The right answer eventually / too much setup for a non-technical first user and too
   much to build this sprint.

## Decision

Option 1. The deciding reason: it asks nothing extra of my wife beyond pasting one link, which she
has to do anyway to add the connector. Each key maps to a per-person Durable Object holding the
person's run IDs and profile. Plain `/mcp` keeps working without memory.

## What would change our mind

- People share or post their link and see each other's results. Then move to OAuth.
- People lose their link often (new device, new chat app) and lose their history. Then add a way
  to recover it, which probably means an email sign-in.
