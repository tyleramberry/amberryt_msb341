# AGENTS.md

The single source of instructions for any coding agent working in this repo (Claude Code,
Codex, OpenCode, Pi, Hermes, etc.). `CLAUDE.md` just imports this file. Keep this one current.
It should let a brand new session act like a colleague who already knows what I am working on
and why.

## What I am working on

- **My role:** Solo founder: product, engineering, design, and go-to-market. Early sprints are
  heavy on product (validating the idea), then engineering (shipping), then product + GTM.
- **What it is:** An education-focused LLM harness that knows a student's courses and checks
  drafts against the rubric. See `specs/agent-harness-prd.md` and `specs/mvpspec.md`.
- **Who it is for:** College students taking several courses (`decisions/001-mvp-user.md`).
  Teachers supply rubrics. Starts as a learning and portfolio project, not a product sold to
  schools (`decisions/002-learning-portfolio-first.md`). MVP connects to Canvas (read-only);
  workspace files are markdown, Google Docs is later scope.
- **Who uses my work:** Students.
- **Why they would use it:** Not validated yet. Comes from user interviews after the MVP spec.

## Current state

- **This sprint's goal (Sprint 1):** Learn how LLM harnesses work and how to build one, and
  finish with an MVP spec to take to potential users. See `sprints/sprint-1-plan.md`.
- **Where to see it:** Nothing shipped yet. Research lives in `discovery/research/`.
- **Biggest open risk:** Students not yet validated. The product could be built for a
  problem students don't feel strongly enough to use, or that teachers block as cheating.

## Where things go

| Work | Folder |
|---|---|
| Research, competitive analysis, reading notes | `discovery/research/` |
| Interviews (anonymized) | `discovery/interviews/` |
| Personas, insights | `discovery/personas.md`, `discovery/insights.md` |
| Specs, including the MVP spec (`specs/mvpspec.md`) | `specs/` |
| Decisions, numbered (`001-...md`) | `decisions/` |
| Code, prompts, eval sets (`product/evals/`) | `product/` |
| Sprint plans and reviews | `sprints/` |

Current research:
- `discovery/research/harnessresearch.md`: my Sprint 1 notes (what a harness should do for
  users, parts to steal)
- `discovery/research/agent-harness-comp.md` + `.html`: side-by-side of Codex, OpenCode,
  Hermes, OpenClaw, Pi
- `specs/agent-harness-prd.md`: the PRD (students as users, rubric checks, P0/P1 scope,
  sprint milestones). Source for `specs/mvpspec.md`.
- `discovery/research/harness-notes/`: background reading on harness engineering (DAIR.AI
  collection: 21 papers, 51 tools), visual notes, and a minimal runnable harness

## How this repo works

- Non-code work is committed as files, same as code.
- Specs go in `specs/` and are written before the work. When asked to build or produce
  something non-trivial, check for its spec first. If there is none, draft one and confirm it
  before starting.
- Meaningful choices get a numbered record in `decisions/`, written when the choice is made,
  including what was rejected and why.
- Sprint plans and reviews live in `sprints/`. The plan is committed on day one.
- Never put real names, emails, or phone numbers in this repo. Anonymize.
- Commit and push straight to `main`.

## Tools and conventions

- **Stack or tools:** Not chosen yet. Decide once the MVP spec is done.
- **How work ships:** Commits to `main` on GitHub (tyleramberry/amberryt_msb341). Visual pages
  may also be published as Claude artifacts and linked from the matching `.md`.
- **Testing and style:** Fill in once there's code. Any AI feature gets an eval set in
  `product/evals/`.

## Working with me

- Ask before large refactors or before adding a dependency.
- When I am wrong about something technical, say so directly and explain why.
- Show me the plan before executing anything that touches more than a couple of files.
- Plain language. Show proof that something works, not just that it compiled.

## Voice

Writing other people read (product copy, marketing, memos) sounds like: TODO: 2 or 3
adjectives plus one example line.
