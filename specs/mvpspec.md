# Spec 001: Homeroom MVP

**Status:** Draft
**Date:** 2026-09-28 · **Updated:** 2026-10-12 from the Sprint 2 student interviews
**Built from:** [`agent-harness-prd.md`](agent-harness-prd.md), the Homeroom PRD (P0 scope only)

## Problem

A model can only help with what it can see. A college student's real context — five
syllabi, a dozen deadlines, the rubric for each assignment — sits in an LMS, in PDFs and in
their head. General chat tools answer in a vacuum, forget yesterday's session, and can't tell
whether a draft meets the rubric. Students either paste context in every time or get generic
help.

Evidence: five student interviews in Sprint 2, synthesized in
[`discovery/insights.md`](../discovery/insights.md). Students already run this check by hand:
they paste the rubric and their draft into a chatbot and ask what is missing<sup>[01] [04] [05]</sup>.
One has Claude pull the assignment and rubric from Canvas to grade them, and says the pull
"is not reliable"<sup>[05]</sup>. Not yet validated: see the Validation plan below.

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

1. **Set up.** The student builds their term: connect Canvas for the courses that are on it,
   and upload the syllabus or rubric (PDF or text) for any that are not. Homeroom writes
   courses, assignments, due dates and rubrics into markdown files it reads on every turn.
2. **Ask.** The student asks for help on an assignment. Homeroom already knows the course,
   the due date and the rubric, and tutors instead of handing over an answer.
3. **Check.** The student pastes a draft. Homeroom scores it against the rubric, criterion by
   criterion, and says what is missing and why.
4. **Revise.** The student fixes the draft and checks again.

### MVP features (all P0)

| # | Feature | What the student sees | Done when |
|---|---|---|---|
| F1 | Context layer (Canvas + upload) | A course list with every assignment, due date and rubric, built from Canvas where the course is there and from an uploaded syllabus or rubric where it is not | A real student's term imported from Canvas matches Canvas on every due date and rubric; for 5 uploaded syllabi, every graded assignment and due date is captured; and a stated coverage number: the share of a real student's courses Homeroom holds context for<sup>[03]</sup> |
| F2 | Lean core | A chat that already knows their courses and remembers the conversation after they close it and come back | In a fresh chat, asking about an assignment brings up its course, due date and rubric with zero pasting; a session resumes after restart with prior turns intact |
| F3 | Tutor persona | Help that explains and asks questions rather than writing the answer | 18 of 20 "just give me the answer" test prompts get teaching, not answers |
| F4 | Rubric check | A per-criterion score on a draft. Each criterion gets a gap, a question or a fix that points at a specific line of their draft ("you're weak here, you didn't cite this"<sup>[04]</sup>; "does this paragraph actually answer the prompt?"<sup>[03]</sup>). Never a rewritten draft or replacement sentences. Says "cannot verify" when a criterion depends on domain substance it can't check | The same draft scored twice gives the same result on objective criteria; 20 check runs produce zero replacement prose |

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
  sections, citations present and how many, due date met) and checked by a script, or
  **subjective** (argument quality) and scored by an LLM judge. Judged scores are labelled as
  such. The judge matches the draft to rubric criteria only. It does not rule on domain
  substance (whether the tax law is right) and says "cannot verify" instead, because a
  confidently wrong answer there is what students already distrust<sup>[04]</sup>. The check
  never produces prose for the student to paste in<sup>[01] [03] [04]</sup>.
- **Interface:** students won't use a terminal. For the MVP, a minimal web chat calling
  Homeroom in headless mode. In Sprint 2 it can run locally on my machine for demos.
- **Evals:** `product/evals/tutor.json` (20 prompts for F3), `product/evals/syllabi/` (5
  anonymized syllabi + expected dates for F1), a Canvas import check comparing the workspace
  files to Canvas's own due dates (F1), `product/evals/rubric.json` (drafts + expected
  scores for F4, plus a check that no run returns replacement prose). The syllabi and drafts
  come from the assignment shapes where students actually run the rubric check: a researched,
  cited memo (a tax memo<sup>[04]</sup>, an investment memo<sup>[03]</sup>) and a business
  reply<sup>[01]</sup>. Not generic essays.

Ask before adding Pi or any other dependency (per `AGENTS.md`).

## Out of scope

- Memory across sessions beyond resuming a conversation (F5), crons and daily briefs (F6),
  self-skillify (F7)
- Writing to Canvas in any way (submitting, posting, commenting)
- Learning Suite and other LMS sites without an API, including computer-use. Courses there
  are covered by manual syllabus and rubric upload instead. BYU is phasing out Learning Suite
  in favor of Canvas, so this gap shrinks on its own
  ([`decisions/005-learning-suite-by-upload.md`](../decisions/005-learning-suite-by-upload.md))
- Finding sources, checking whether a draft's domain substance is correct, and checking
  citation *format* against a style guide. Students name research and citations as their
  first pain<sup>[03] [04]</sup>, but these are separate products. Data-extraction busywork
  (10-K to spreadsheet)<sup>[03]</sup> is a deferred request
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

Questions to ask (the full script is
[`2026-10-07-interview-questions.md`](../discovery/interviews/2026-10-07-interview-questions.md)):

1. Walk me through the last assignment you used AI on. What did you paste in?
2. How do you keep track of deadlines across your courses today? Which LMS is each course on,
   and how many on each? Can you create a Canvas access token yourself? (Ask without assuming
   the school or the LMS<sup>[04]</sup>.)
3. Would a check against the rubric before you submit change how you work? What would make
   you trust it?
4. (Teachers) Would you allow a tool like this in your course? What would make you block it?
5. What would you pay for this, or what do you use now instead?

**Keep going if:** at least 4 of 5 students say they would use the rubric check on a real
assignment this month, and neither teacher would block it.

**Status after the first round (Oct 7–12): not yet validated.** Five student interviews are
filed, but one is a high-school student outside the ICP<sup>[02]</sup> and one is a household
pilot of the script<sup>[01]</sup>, so fewer than 4 of 5 count toward the bar. No professor
interviews have run yet (the [question set](../discovery/interviews/2026-10-08-professor-interview-questions.md)
is ready). The bar stays at 4 of 5; the next round fills it.
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
  in (OAuth through a developer key, or a Canvas export) — check before Sprint 3. One student
  has connected an AI to Canvas themselves<sup>[05]</sup>; their school isn't recorded yet.
- Should the rubric check also check citation format against a course's declared style? Two
  students ask for it<sup>[03] [04]</sup>, but parsing APA or Chicago reliably is a project of
  its own.
- Can objective rubric checks cover enough of a real rubric to be useful, or is it mostly
  subjective judgment?

[01]: ../discovery/interviews/2026-10-07-interview-01.md
[02]: ../discovery/interviews/2026-10-08-interview-02.md
[03]: ../discovery/interviews/2026-10-08-interview-03.md
[04]: ../discovery/interviews/2026-10-10-interview-04.md
[05]: ../discovery/interviews/2026-10-12-interview-05.md
