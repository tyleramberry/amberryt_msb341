# Homeroom

> Homeroom is an LLM harness that helps college students study: it knows their courses and checks drafts against the rubric.

**Where to see it:** the v0 chat UI, live at https://homeroom.homeroom-app.workers.dev — a
clickable prototype whose agent replies are placeholders. The harness core is not wired up yet,
and the problem itself is only partly validated.
**Built by:** Tyler Amberry, MSB 341 Product Management, BYU

## Where the work lives

Everything needed to check this sprint's output, in one place.

| Output | Where | Access |
|---|---|---|
| Course repo (this one) | https://github.com/tyleramberry/amberryt_msb341 | Private, shared with Professor Murff (`sdmurff`) |
| Homeroom v0 chat UI | https://homeroom.homeroom-app.workers.dev | Public. Placeholder agent replies; no harness core yet |
| Discovery interviews, synthesis, ICP | `discovery/` — `interviews/`, `worksheet.md`, `insights.md`, `icp.md`, `jtbd.md` | In-repo, names removed |
| Sprint plans and reviews | `sprints/sprint-N-plan.md`, `sprints/sprint-N-review.md` | In-repo |
| AI interview conversation (worksheet Part 2) | linked from `discovery/worksheet.md` | Public share link |
| Sprint 2 demo | 60–90 second Loom | Recorded Mon, Oct 12 — link added here when it exists |

No other repo holds this work.

## Context

Every sprint is read against this. Revise it when it changes and note what changed.

- **My role:** Solo founder — product, engineering, design, and go-to-market. Early sprints
  heavy on product (validating ideas), then shifting to engineering (shipping features), then
  a mix of product and GTM (getting in front of users).
- **What I am working on:** Homeroom, an education-focused LLM harness. See `specs/agent-harness-prd.md`
  and `specs/mvpspec.md`.
- **Who it is for:** College students taking several courses (`decisions/001-mvp-user.md`).
  Starts as a learning and portfolio project (`decisions/002-learning-portfolio-first.md`).
- **Who uses my work:** Students are the end users. Teachers supply rubrics and need to trust
  that it teaches rather than cheats.

If your situation changes, revise this and note what changed. That is normal; a silent
mismatch between this file and your work is not.

## What is in this repo

| Folder | What lives here |
|---|---|
| `sprints/` | One plan and one review per sprint |
| `discovery/` | Interviews, personas, what you learned about your user |
| `design/` | Flows, screens, usability test notes |
| `product/` | The work itself: code, a pricing model, a copy deck, an automation |
| `specs/` | One spec per piece of work, written before you make it |
| `gtm/` | Launch, channels, copy, experiments |
| `metrics/` | What you measure and what it says |
| `decisions/` | Numbered records of what you decided and why |

Not everyone in this course ships software. An interview, a pricing model, a landing page
draft, and a usability finding are all artifacts, and they get committed like anything else.
Use the folders that fit your role and ignore the rest.

If you build an AI feature, put its eval set in `product/evals/`. A test set is how you know
whether a change to a prompt helped or hurt.

## Running it

The v0 UI is in `product/app/` — Vite + React + TS, Supabase, deployed to Cloudflare Workers
static assets (`decisions/003-v0-web-stack.md`).

```bash
cd product/app
npm install
npm run dev       # local dev server
npm run build     # type-check, then build to dist/
npm run deploy    # build, then wrangler deploy (needs `npx wrangler login` once)
```

It runs against the Supabase project committed in `src/lib/supabase.ts` with no setup: each
browser signs in anonymously. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` override
that if you need a different project. Agent replies come from a database trigger, so what you
see in the UI is not a harness talking yet.

## Sprints

Each sprint:

```bash
/sprint-plan     # day one, then commit the plan
# ...do the work...
/sprint-review   # last day, then commit the report and write your retro
```

## Ground rules

- **Spec before work.** For anything non-trivial, the spec's commit should predate the
  work's commits.
- **Decisions get recorded.** When you make a real choice, write it in `decisions/` with the
  alternatives you rejected.
- **No real customer contact details anywhere in this repo.** Anonymize people in interview
  notes: "dental office manager, Provo" rather than a name and an email.
- **Keep `AGENTS.md` current.** It is what your agent knows about your work (`CLAUDE.md` just imports it). Stale context
  produces bad output.
