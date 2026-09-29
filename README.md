# Study harness for students

> A domain-specific harness for LLMs that helps college students study: it knows their courses and checks drafts against the rubric.

**Where to see it:** Not yet — product and domain still being validated
**Built by:** Tyler Amberry, MSB 341 Product Management, BYU

## Context

Fill this in during Sprint 1 and keep it current. Every sprint is read against it.

- **My role:** Solo founder — product, engineering, design, and go-to-market. Early sprints
  heavy on product (validating ideas), then shifting to engineering (shipping features), then
  a mix of product and GTM (getting in front of users).
- **What I am working on:** An education-focused LLM harness. See `specs/agent-harness-prd.md`
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

[If your work includes code: how to run it locally. Delete this section if it does not.]

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
