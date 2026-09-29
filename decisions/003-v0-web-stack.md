# Decision 003: v0 web stack (Vite + React, Supabase, Cloudflare)

**Date:** 2026-09-28
**Status:** Active

## Context

The MVP spec says students won't use a terminal and need "a minimal web chat". I wanted a
clickable UI to show in user interviews before the harness core (Pi or another) is chosen:
group chats with several agents, 1:1 chats, and a workspace screen for skills, cron jobs,
context files and settings. It has to be reachable at a public URL.

## Options considered

1. **Vite + React + TypeScript, static build**: small, fast, and it matches Pi's TypeScript core. The one
   runtime dependency is `@supabase/supabase-js`.
2. **Plain HTML/JS, no build**: zero dependencies, but it gets messy as soon as there are three screens.
3. **Next.js**: more framework than a static chat UI needs, and it needs an adapter to run on Cloudflare.

Backend: **Supabase** (Postgres + row-level security + anonymous auth) vs. writing a custom
API. Hosting: **Cloudflare Workers static assets** vs. Vercel.

## Decision

Vite + React + TS, served by Cloudflare Workers static assets, with Supabase for storage. The deciding reason:
it gets a real, shareable URL with per-student data today, and nothing in it locks in the harness core.

Scope of v0:
- **No login.** Each browser gets an anonymous Supabase user and is seeded with a starter
  workspace (a study group, a Tutor chat, 3 skills, 3 crons, USER.md / SOUL.md / a course file).
- **Placeholder agent replies.** A database trigger writes each agent's canned reply. It is
  swapped for an Edge Function calling the model once decision 004 (harness core) is made.
- Cron jobs are saved but do not run (F6 is P1).

## What would change our mind

- If students need the same workspace on two devices, add real sign-in (magic link) and link anonymous users.
- If the harness core has to run server-side with tools (read/write/bash), host it outside
  Supabase (e.g. a Worker or a small server) rather than in Edge Functions.
