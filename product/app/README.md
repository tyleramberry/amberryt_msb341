# Homeroom app (v0)

iMessage-style web UI for Homeroom. Live: https://homeroom.homeroom-app.workers.dev

- **Groups** tab: group chats where several agents (Tutor, Rubric Checker, Planner, Researcher) reply
- **Chats** tab: 1:1 chat with one agent
- **Workspace** tab: skills, cron jobs, context files (USER.md, SOUL.md, courses), agents, settings

Stack and scope: [`decisions/003-v0-web-stack.md`](../../decisions/003-v0-web-stack.md).
Agent replies are placeholders for now (a database trigger). No login: each browser is an anonymous Supabase user.

## Run locally

```bash
npm install
npm run dev
```

## Deploy (Cloudflare Workers static assets)

```bash
npm run deploy
```

Requires `npx wrangler login` once.

## Backend

Supabase project `homeroom` (ref `xwmlglizgmvvvpxkltjy`). Schema, RLS policies, the seed trigger, and the
placeholder-reply trigger live in `supabase/migrations/`. Auth settings (anonymous sign-in on) live in
`supabase/config.toml` and are pushed with `supabase config push --project-ref xwmlglizgmvvvpxkltjy`.

The publishable key in `src/lib/supabase.ts` is meant to be public; row-level security limits every
student to their own rows. Never commit the service-role key.
