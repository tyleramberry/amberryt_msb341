# Agent Harness — Product Requirements Document

Tyler Amberry · 2026-09-28 · Live doc: https://claude.ai/code/artifact/1932d9e9-be7e-4bf7-b92e-51a1d7f8d8af

## Overview

The MVP is a lean, education-focused agent harness that turns a student's syllabi, deadlines and rubrics into context a frontier model can act on, then tutors and checks work against that rubric. It is built for MSB 341 (Product Management, BYU) and ships by the final product deadline, Thu Dec 10, 2026.

**The problem.** A model can only help with what it can see. Most of a student's world sits in an LMS, in PDFs and in their head, so general chat tools answer in a vacuum, forget yesterday's session, and have no way to tell whether a draft meets the rubric.

**The bet.** The hard parts of a harness (agent loop, tools, sessions, compaction) are solved and shared across Codex, OpenCode, Hermes, OpenClaw and Pi. The value is the domain layer on top: school context, a teaching persona, rubric-based checks, and memory that carries across sessions.

**Framing.** Nobody yet. It starts as a learning and portfolio project with students as the user (decision 001); teachers supply rubrics. Selling to schools is a later question.

## Goals and non-goals

The MVP proves one loop end to end: a student's course context goes in, and a rubric-checked, tutored draft comes out.

**Goals**

1. Ingest a student's syllabi, deadlines and rubrics into readable markdown the agent uses on every turn.
2. Tutor and challenge instead of handing over answers.
3. Check a draft against its rubric before the student submits, with specific, actionable feedback.
4. Remember corrections and where the student left off, across sessions.
5. Be used by real students by Dec 10, 2026, with evidence they came back.

**Non-goals for the MVP**

- Building a harness from scratch. Reuse an open-source core (Pi-style lean loop) and add the domain layer.
- Computer-use against LMS sites without an API, such as Learning Suite. Canvas is covered through its API in F1.
- `execute_code`, subagents, MCP, and software-factory self-improvement.
- A teacher or admin dashboard, billing, or district sales. Google Docs sync (the MVP uses markdown files).
- Writing graded work for the student. The harness assists and checks; it does not submit.

## Users and core use cases

The primary user is a college student juggling several courses; teachers are a secondary user who supply the rubrics that define good work.

| User | Role | What they need |
| --- | --- | --- |
| Student | End user, daily | One place that knows every course, deadline and rubric, and helps them do the work well |
| Teacher | Supplies rubrics and assignment specs | Confidence the tool teaches rather than cheats |
| School or district admin | Buyer (later) | Academic-integrity safeguards, privacy, a price per seat |

**Core use cases**

1. **Set up a semester.** A student drops in five syllabi; the harness builds `USER.md` plus a file per course with deadlines and rubrics.
2. **Daily brief.** Each morning the student gets what is due soon and what to work on first.
3. **Tutor a problem.** The student asks for help; the harness explains, asks checking questions, and adjusts to their level.
4. **Check a draft.** The student submits a draft; the harness scores it against the rubric and says what is missing and why.
5. **Pick up where they left off.** The next day, the harness knows the assignment, what was done, and what is next.

## Functional requirements

Seven capabilities make the MVP, ordered by what the rest depends on; P0 must ship, P1 ships if time allows, P2 is deferred.

| # | Requirement | Priority | Borrowed from | Acceptance check |
| --- | --- | --- | --- | --- |
| F1 | **Student context layer:** connect to Canvas to pull courses, assignments, due dates and rubrics, with syllabus upload (PDF or text) as a fallback, into `USER.md` and one markdown file per course | P0 | OpenClaw persona files | Canvas import for a real student's term matches Canvas on every due date; 5 uploaded syllabi match too |
| F2 | **Lean core:** agent loop with read, write, edit and bash tools, system prompt under 1,000 tokens, resumable sessions, context compaction | P0 | Pi | A session resumes after restart with prior turns intact |
| F3 | **Tutor persona:** `SOUL.md` tuned to explain, ask checking questions and push back rather than hand over answers | P0 | OpenClaw | On 20 test prompts asking for a finished answer, it teaches instead in 18+ |
| F4 | **Rubric evals:** turn a rubric into checks and run them against a draft, with feedback naming what failed and why | P0 | Closed feedback loop | Same draft scored twice gives the same result on objective criteria |
| F5 | **Memory:** corrections and session state persist in `MEMORY.md` | P1 | Hermes, OpenClaw | A correction made once is not needed again next session |
| F6 | **Crons:** daily brief and deadline reminders | P1 | OpenClaw heartbeat, Hermes | Brief arrives daily for 7 days with correct deadlines |
| F7 | **Self-skillify:** save a repeated workflow (lab report, case write-up) as a reusable skill | P1 | Hermes | After 2 similar tasks, a `SKILL.md` exists and is used on the third |
| F8 | `execute_code`, computer-use routing for LMS sites without an API, software-factory self-improvement | P2 | Hermes, own design | Not in MVP |

## Non-functional requirements

Academic integrity and student privacy decide whether a school ever buys this, so they rank above speed and features.

- **Academic integrity:** the harness never submits work and defaults to teaching over answering. The line between tutoring and doing the homework is written down in `SOUL.md` and tested in the F3 eval set.
- **Privacy:** student data stays on the student's machine or their own account. No real names, grades or emails in the repo or eval sets.
- **Transparency:** all instructions, memory, persona and skills are plain markdown a student or teacher can read and edit.
- **Reliability:** rubric checks are repeatable on objective criteria; subjective criteria are flagged as LLM-judged, not presented as certain.
- **Cost:** a typical tutoring turn stays cheap by keeping the core prompt under 1,000 tokens and routing to a larger model only when needed.
- **Portability:** works across model providers; uses the shared AGENTS.md and SKILL.md conventions.
- **Evals:** every AI feature has an eval set in `product/evals/` (about 20 real inputs plus what good looks like), run before any prompt change ships.

## Success metrics

Success by Dec 10 means real students use the harness more than once and say the rubric check changed their work. Targets below are proposed starting points, not validated.

| Metric | Target by Dec 10 | How measured |
| --- | --- | --- |
| User interviews completed | 10 (students and teachers) | Notes in `discovery/interviews/` |
| Students onboarded (syllabi ingested) | 10 | Count of `USER.md` setups |
| Weekly returning students | 5 | Sessions in two or more separate weeks |
| Drafts revised after a rubric check | 50% of checked drafts | Session logs |
| Tutor persona eval pass rate | 90% (18 of 20) | `product/evals/` run |
| Due-date extraction accuracy | 100% on 5 test syllabi | Eval against source PDFs |

The two weekly scorecard metrics for `metrics/weekly.md` are weekly returning students and drafts revised after a rubric check.

## Milestones, open questions and risks

The milestones follow the MSB 341 sprint deadlines; each sprint ends with something a user can touch.

1. **Sprint 2 (Oct 12):** write `specs/mvpspec.md` from this PRD, run 5 user interviews, and ship F2 (lean core) running locally.
2. **Sprint 3 (Nov 2):** ship F1 (context layer, including Canvas) and F3 (tutor persona) with its eval set; first 3 students onboarded.
3. **Sprint 4 (Nov 23):** ship F4 (rubric evals) and F5 (memory); 10 interviews done.
4. **Sprint 5 (Nov 30):** ship F6 (crons) and F7 (self-skillify) if time allows; polish for peer testing (Dec 7).
5. **Final product (Dec 10):** live, reachable by someone other than Tyler, with metrics filled in.

**Open questions**

- [x] Students or teachers as the MVP user? **Students** — see `decisions/001-mvp-user.md`.
- [x] B2B product for schools, or a learning and portfolio project? **Learning and portfolio project first**; teacher approval is still tested in validation.
- [ ] Which crons ship by default beyond the daily brief and deadline reminders?
- [ ] Can rubric checks be deterministic, or do subjective criteria need an LLM judge?
- [x] Markdown files or Google Docs for what students see and edit? **Markdown for the MVP**; Google Docs is later scope.
- [ ] Which model handles computer-use when F8 arrives (Opus 5.5 vs. "Astra")?

**Risks**

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Students not yet validated | Could build for a problem no one pays for | Interview 5 students before building F4 |
| Seen as a cheating tool | Schools and teachers block it | Tutor-first persona, no auto-submit, integrity eval set |
| Sprint 1 slipped | Only the scaffold and research exist today; the portfolio site is not live | Scope P0 only until Sprint 3; ship the portfolio site in Sprint 2 |
| Rubric evals unreliable | Wrong feedback erodes trust | Separate objective checks from LLM-judged ones and label them |
