# Spec 001: Homeroom MVP

**Status:** Draft
**Date:** 2026-09-28
**Built from:** [`agent-harness-prd.md`](agent-harness-prd.md), the Homeroom PRD (P0 scope only)

## Problem

A model can only help with what it can see. A college student's real context — five
syllabi, a dozen deadlines, the rubric for each assignment — sits in an LMS, in PDFs and in
their head. General chat tools answer in a vacuum, forget yesterday's session, and can't tell
whether a draft meets the rubric. Students either paste context in every time or get generic
help.

Evidence: none yet beyond my own experience as a student (`discovery/research/harnessresearch.md`).
This spec exists to take to users and find out whether they feel this problem.

## Who it's for

**College students taking several courses.** Teachers matter only as the source of rubrics.

Decided in [`decisions/001-mvp-user.md`](../decisions/001-mvp-user.md). The project starts as a
learning and portfolio project, not a product sold to schools
([`decisions/002-learning-portfolio-first.md`](../decisions/002-learning-portfolio-first.md)).
Teacher approval is still tested in validation, because it decides whether students can use it
openly.

## What we're making

Homeroom is a study assistant built on an open-source harness core. It knows a student's courses and
checks their drafts against the rubric before they submit. It does one loop end to end:

1. **Set up.** The student connects Canvas. Homeroom pulls their courses, assignments, due
   dates and rubrics, and writes them into markdown files it reads on every turn. Syllabi that
   are not in Canvas can be uploaded as PDF or text.
2. **Ask.** The student asks for help on an assignment. Homeroom already knows the course,
   the due date and the rubric, and tutors instead of handing over an answer.
3. **Check.** The student pastes a draft. Homeroom scores it against the rubric, criterion by
   criterion, and says what is missing and why.
4. **Revise.** The student fixes the draft and checks again.

### MVP features (all P0)

| # | Feature | What the student sees | Done when |
|---|---|---|---|
| F1 | Canvas connection + context layer | Connect Canvas once → a course list with every assignment, due date and rubric; syllabus upload (PDF or text) as a fallback | A real student's term imported from Canvas matches Canvas on every due date and rubric; 5 uploaded syllabi match their source |
| F2 | Lean core | A chat that remembers the conversation after they close it and come back | A session resumes after restart with prior turns intact |
| F3 | Tutor persona | Help that explains and asks questions rather than writing the answer | 18 of 20 "just give me the answer" test prompts get teaching, not answers |
| F4 | Rubric check | A per-criterion score on a draft, each with a one-line reason and a fix | The same draft scored twice gives the same result on objective criteria |

### Student workspace (what Homeroom writes)

Everything is plain markdown the student can open and edit:

```
workspace/
  USER.md              # major, courses this term, how they like to learn
  SOUL.md              # tutor persona: teach, question, never submit work
  courses/
    msb341.md          # from Canvas: assignments, due dates, grading weights
  rubrics/
    msb341-sprint-2.md # Canvas rubric turned into checkable criteria
  sessions/            # saved conversations (F2)
```

### How it's built (proposal — needs a decision record)

- **Core:** start from Pi (TypeScript, MIT): 4 tools, a system prompt under 1,000 tokens,
  sessions saved to disk. Add the domain layer (F1, F3, F4) as prompts, skills and small
  scripts on top, rather than forking deeply.
- **Canvas connection:** the Canvas REST API with the student's own access token (Canvas →
  Account → Settings → New access token). Pull courses, assignments with due dates and
  rubrics, and syllabus text. Read-only: Homeroom never posts or submits to Canvas. The
  token lives in a local `.env` on the student's machine, never in the repo or workspace
  files. Re-sync on demand. My second-brain Canvas radar script already does a daily pull
  and is the starting point.
- **Rubric check:** each rubric criterion is marked either **objective** (length, required
  sections, citations present, due date met) and checked by a script, or **subjective**
  (argument quality) and scored by an LLM judge. Judged scores are labelled as such.
- **Interface:** students won't use a terminal. For the MVP, a minimal web chat calling
  Homeroom in headless mode. In Sprint 2 it can run locally on my machine for demos.
- **Evals:** `product/evals/tutor.json` (20 prompts for F3), `product/evals/syllabi/` (5
  anonymized syllabi + expected dates for F1), a Canvas import check comparing the workspace
  files to Canvas's own due dates (F1), `product/evals/rubric.json` (drafts + expected
  scores for F4).

Ask before adding Pi or any other dependency (per `AGENTS.md`).

## Out of scope

- Memory across sessions beyond resuming a conversation (F5), crons and daily briefs (F6),
  self-skillify (F7)
- Writing to Canvas in any way (submitting, posting, commenting)
- Learning Suite and other LMS sites without an API, including computer-use
- Google Docs as the workspace format; the MVP uses markdown files, Google Docs is later scope
- `execute_code`, subagents, MCP
- A teacher dashboard, accounts for schools, billing
- Submitting anything on the student's behalf, ever
- Mobile app or polished UI

## Validation plan

Before building F3 and F4, show this spec (and the F2 demo) to **5 students and 2 teachers**.
The teacher interviews stay even though this is a portfolio project: if teachers would block
it, students can't use it openly.
Anonymize the notes in `discovery/interviews/`.

Questions to ask:

1. Walk me through the last assignment you used AI on. What did you paste in?
2. How do you keep track of deadlines across your courses today?
3. Would a check against the rubric before you submit change how you work? What would make
   you trust it?
4. (Teachers) Would you allow a tool like this in your course? What would make you block it?
5. What would you pay for this, or what do you use now instead?

**Keep going if:** at least 3 of 5 students say they would use the rubric check on a real
assignment this month, and neither teacher would block it.
**Rethink if:** students only want deadline tracking (already served by the LMS), or teachers
see it as a cheating tool.

## Definition of done

- [ ] F1–F4 pass their "done when" checks above, with eval results committed in `product/evals/`
- [ ] Shipped: 3 students other than me have connected their own Canvas and checked a real draft
- [ ] Usage is tracked: sessions per student per week and drafts revised after a check,
      reported in `metrics/weekly.md`
- [x] `decisions/001-mvp-user.md` (students vs. teachers) is written
- [x] `decisions/002-learning-portfolio-first.md` (project framing) is written
- [x] `decisions/003-v0-web-stack.md` (web UI, Supabase, Cloudflare) is written
- [ ] `decisions/004-harness-core.md` (Pi or another core) is written

## Open questions

- Does BYU's Canvas let students create their own access tokens? If not, F1 needs another way
  in (OAuth through a developer key, or a Canvas export) — check before Sprint 3.
- Can objective rubric checks cover enough of a real rubric to be useful, or is it mostly
  subjective judgment?
