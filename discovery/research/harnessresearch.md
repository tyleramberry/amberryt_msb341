---
title: Harness Research — Sprint 1
date: 2026-09-28
sprint: 1
tags: [research, harness-engineering, sprint-1, msb341]
related: "[[agent-harness-comp]]"
---

# Harness Research — Sprint 1

**The question:** What can a harness do to make frontier models better *for students*, and what can I take from existing open-source harnesses instead of building from scratch?

This file holds three things from Sprint 1:

1. **Product vision:** what I want the harness to do for students
2. **Harness engineering learnings:** the principles that make a harness work
3. **Parts to steal:** specific patterns from open-source harnesses I want to reuse

It feeds directly into `mvpspec.md`. For the side-by-side of the five harnesses I studied
(Codex, OpenCode, Hermes, OpenClaw, Pi), see [[agent-harness-comp]].

---

## 1. Product vision

### Why study open-source harnesses

The goal isn't to invent a harness from zero. It's to learn how the good ones work, then work
out **how to modify them for students.** Most of the hard parts (agent loop, tools, sessions,
compaction) are solved and shared across every harness I looked at. What's left is the
domain layer: what makes a harness good at *school*.

### What the harness should do for students

| Role | What it means |
|---|---|
| **Knowledge work** | Help with the actual work of school: reading, research, writing, problem sets. |
| **Tutor** | Teach, don't just answer. Explain, check understanding, adjust to where the student is. |
| **Critical thinking partner** | Push back, ask questions, and make the student defend their reasoning instead of handing over conclusions. |
| **Make student life AI-legible** | Get the student's world (syllabi, deadlines, rubrics, notes, grades) into a form the model can read and act on. |

The last one matters most. A model can only help with what it can see. Most of a student's
context sits in an LMS, PDFs, and their head. A harness that turns that into structured,
readable context is what makes the other three roles work.

---

## 2. Harness engineering learnings

### A closed feedback loop is the core

An agent gets better when it can tell it was wrong and fix itself without a human pointing it out. That takes a closed loop:

1. **Tests and evals decide what's right or wrong.** Without a definition of "correct," the
   agent can't judge its own output.
2. **Tests let the agent notice failure and self-correct.** Failing → fix → re-run → passing,
   with no human in the middle.
3. **The agent has to know when and how to run the tests.** A test suite does nothing if the
   agent never calls it. The harness must make running checks part of the workflow.
4. **Test output must be clear enough to act on.** "Failed" isn't enough. The output has to say
   *what* failed and *why* so the agent knows what to change.

**For students:** the "tests" are the **syllabus and the rubric.** They already say what good
work looks like, so the harness can turn them into checks (see §3).

### Memory = don't repeat mistakes, pick up where you left off

Memory has two jobs:

- **Avoid past mistakes.** If the agent was corrected once, it shouldn't need correcting again.
- **Continuity.** A student comes back tomorrow and the agent knows where they left off:
  which assignment, what was done, what's next.

### Self-improving

The harness should get better the more it's used. After it solves something new, it writes
that into a reusable **skill** ("self-skillify") and refines the skill over time. Hermes does
this today (see §3).

### Everything is markdown

Instructions, skills, memory, persona, and plans all live as plain markdown files. That makes
them:

- readable and editable by the student, not just the model
- versionable in git
- portable across models and harnesses (AGENTS.md and SKILL.md are already shared conventions)
- Would students prefer google docs instead of markdown?

---

## 3. Parts to steal from open source

| Pattern | Source | What it is | Why it matters for students |
|---|---|---|---|
| **`execute_code`** | Hermes | The model writes Python that calls tools, finishing multi-step work in one turn instead of many round trips. | Faster, cheaper multi-step tasks, e.g. pull every due date from five syllabi in one step. |
| **Persona files** | OpenClaw | `SOUL.md`, `IDENTITY.md`, `USER.md`, `MEMORY.md`: who the agent is, who the user is, and what it remembers. | A student's `USER.md` (major, courses, goals, how they learn) makes every answer personal. |
| **Built-in crons** | OpenClaw (heartbeat + cron), Hermes | Scheduled jobs the agent runs by itself. | Daily brief, deadline reminders, weekly review, all without the student asking. *Open: which crons ship by default?* |
| **Token-slim core** | Pi | 4 tools and a system prompt under 1,000 tokens. | Leaves more of the context window for the student's actual material; cheaper per turn. |
| **Self-skillify** | Hermes | Writes its own skills after tasks and improves them over time. | The harness learns each student's recurring workflows (lab reports, case write-ups). |
| **Everything markdown** | All five (AGENTS.md, SKILL.md) | Plain-text config and knowledge. | Transparent to students and teachers; no black box. |
| **Deterministic evals from syllabus/rubric** | My idea, built on the closed-loop principle | Agents read a syllabus or rubric and generate checks that grade work the same way every time. | Closes the feedback loop for school work: the agent can check a draft against the rubric before the student submits. |
| **Software-factory improvements** | Software factory pattern | Agents propose changes as PRs, and a separate agent judges them before merge. | The harness improves its own skills and prompts safely, with a reviewer in the loop. |
| **Computer-use routing** | My design | Send computer-use tasks (driving an LMS, filling a portal) to the model best at it: Claude Opus 5.5 or Astra. | Lets the agent act on sites with no API, like Canvas/Learning Suite, and pay for the strong model only when needed. |

---

## 4. Draft MVP feature list

Pulled from the above to seed `mvpspec.md`. Not final. Ordered by what the rest depends on.

1. **Student context layer:** ingest syllabi, deadlines, and rubrics into markdown (`USER.md`, per-course files)
2. **Lean core:** Pi-style minimal toolset and short system prompt
3. **Tutor / critical-thinking persona:** `SOUL.md` tuned to teach and challenge, not just answer
4. **Rubric evals:** generate checks from a rubric and run them against a draft
5. **Memory:** corrections and session state carry over between sessions
6. **Crons:** daily brief and deadline reminders
7. **Self-skillify:** save repeated workflows as skills
8. *Later:* `execute_code`, computer-use routing, software-factory self-improvement

---

## 5. Open questions

- **Students or teachers?** These notes are written for **students**. The repo README says
  the user is **teachers**, sold B2B to schools. Pick one for the MVP, or define how both fit
  (e.g. teachers supply rubrics, students use the harness), and update the README.
- **Which crons are built in?** Daily brief and deadline reminders are obvious. What else?
- **Computer-use model:** confirm "Astra" and when to route to it vs. Opus 5.5.
- **Academic integrity:** where does "tutor / critical thinking partner" end and "does the
  homework" begin? This will decide whether schools buy it.
- **Eval reliability:** can rubric-generated evals really be deterministic, or do subjective
  criteria need an LLM judge?

## 6. Next steps

- [ ] Finish the harness engineering papers: https://academy.dair.ai/papers/collections/harness-engineering
- [ ] Settle students vs. teachers and log it in `decisions/`
- [ ] Write `mvpspec.md` from §4
- [ ] Take the spec to potential users to validate
