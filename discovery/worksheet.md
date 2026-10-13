# Problem Discovery Worksheet (Sprint 2)

**Date:** 2026-10-10 · **Updated:** 2026-10-12 · **Status:** Part 1 complete (3 problems described). Part 2 scored from the five student interviews; the AI interview link is still to come.
**Source:** course Problem Discovery Worksheet + [Problem Discovery Framework](https://byu-strategy.github.io/product-management/94-problem-discovery-framework.html)

**Anonymization note.** The worksheet template asks for "a real person's name" in the **Who**
field. This repo's ground rule (`AGENTS.md`) forbids real names, so the committed copy carries an
anonymized descriptor. The real name belongs in the Google Sheet / submission doc, which stays
outside the repo.

---

## Part 1: Three problems described

### Problem 1 — Check the draft against the rubric before submitting

| Field | Entry |
|---|---|
| **Who** | The UVU accounting/tax student (interview 04) |
| **Frustration / Delight** | Frustration. A researched, cited memo is due; they paste the rubric into a chatbot and ask "here's my analysis section, am I missing anything?" They will not let it write their sentences — "if it writes my memo for me, I won't touch it, that's a risk to my degree." |
| **Customer's Job to be Done** | I'm trying to check my own draft against the professor's rubric before I submit, so I can turn it in without second-guessing it at midnight. |
| **Value Proposition** | We help students check their draft against the real rubric by pulling the criteria out of the course and scoring the draft criterion by criterion. |

**Evidence:** `interviews/2026-10-10-interview-04.md` (strongest signal: the rubric-paste loop, confirmed by a second independent student, unprompted) · `interviews/2026-10-07-interview-01.md` (first behavioral confirmation) · `icp.md` risk 3, the faculty split.

### Problem 2 — Every deadline lives on a different course page

| Field | Entry |
|---|---|
| **Who** | The BYU finance student (interview 03) |
| **Frustration / Delight** | Frustration. Four courses on Learning Suite and two on Canvas; due dates surface on whichever page they happen to check. They wrote the memo the night before it was due. |
| **Customer's Job to be Done** | I'm trying to see every due date across all my courses in one place, so I can stop finding out about an assignment the night before. |
| **Value Proposition** | We help students see every deadline across their courses by pulling assignments from the LMS into one weekly view. |

**Evidence:** `interviews/2026-10-08-interview-03.md` (LMS mix and procrastination) · chapter 03's worked example ("the due dates live in five different Canvas courses and syllabi") · `icp.md`, open question: *is the pain mainly the rubric or the deadlines? (If deadlines, rethink per the MVP spec.)*

### Problem 3 — Being able to prove the work is yours *(described, not scored this sprint)*

| Field | Entry |
|---|---|
| **Who** | The UVU accounting/tax student (interview 04) |
| **Frustration / Delight** | Frustration. They keep Google Docs version history specifically as **evidence of authorship**. 48% of students report fear of a cheating accusation. |
| **Customer's Job to be Done** | I'm trying to be able to show that the work was mine, so I can use AI help without putting my degree at risk. |
| **Value Proposition** | We help students keep a provable record of their own authorship by tracking how a draft evolved from their own words. |

**Evidence:** `interviews/2026-10-10-interview-04.md` ("nobody asked for a compliance feature; that is a student buying insurance against an accusation") · `jtbd.md`, the social layer · Pearson 2025, via `icp.md`.

**Why it is parked.** It is the same user at the same moment as Problem 1, and Homeroom's tutor-first framing already partly answers it. Scoring the two independent forks (rubric vs. deadlines) is the more useful decision this sprint.

---

## Part 2: Scores

Scored from what the five student interviews actually show, not from what I hope. Each score
links to the interview behind it (<sup>01</sup>–<sup>05</sup>). The AI interview
([prompt](ai-interview-prompt.md)) is still to run; if its scores differ from these, the gap gets
noted here rather than overwritten.

**AI interview conversation URL:**

> _pending: paste the share link here after the interview_

### Opportunity Score (1–5)

| Dimension | Problem 1 — Rubric check | Problem 2 — Deadline sprawl |
|---|---|---|
| Frequency | **4 (Weekly).** One student does it "for most" assignments<sup>[01]</sup>; others do it on every rubric-graded memo<sup>[04] [05]</sup> | **3 (Monthly).** Nobody described missing a deadline. The night-before memo was procrastination, not a missed date: they found the deadline when they checked<sup>[03]</sup> |
| Intensity | **4 (Frustrating).** "Am I actually hitting the rubric" anxiety is one of the two painful parts, and self-grading "only gets me so far"<sup>[04]</sup>; one student built their own Canvas-to-Claude workaround<sup>[05]</sup> | **2 (Minor annoyance).** No one raised deadlines unprompted. Canvas already shows assignments two weeks out<sup>[04]</sup> |
| Willingness to Pay | **3 (Might pay).** Stated band $5–10/mo for "a coach that checks my work against the rubric"<sup>[04]</sup>; one already pays for Claude Pro and uses it for this job<sup>[05]</sup>; one pays $0<sup>[01]</sup>. Stated, not yet paid for this product | **2 (Unlikely).** No one mentioned paying; the free Canvas to-do list and browser extensions already cover it (`icp.md`) |
| Market Size | **4 (Large segment).** Any college student with rubric-graded writing; 57% of students use AI weekly (`icp.md`, Gallup 2026) | **3 (Moderate, shrinking).** The pain is the split across two systems<sup>[03]</sup>, and BYU is retiring Learning Suite, so the split closes on its own |
| **Total (of 20)** | **15** | **10** |

### Conviction (0/1 each, sum of 4)

| Dimension | Problem 1 | Problem 2 |
|---|---|---|
| Personal Pain | 1 — I'm a student on rubric-graded courses and test on my own term ([decision 001](../decisions/001-mvp-user.md)) | 1 — I built a daily Canvas pull for my own deadlines (`specs/mvpspec.md`) |
| Close Relationship | 1 — someone in my household runs this loop by hand<sup>[01]</sup> | 0 — no one close to me named it |
| Moral Calling | 1 — AI that writes the work at the deadline means no learning happens; a check that teaches is the alternative<sup>[01]</sup> | 0 |
| Unique Insight or Skills | 1 — harness research, and the objective-vs-judged split for rubric criteria ([research](research/harnessresearch.md)) | 0 — I have the skills, but deadline aggregation is already solved by others |
| **Sum** | **4 — High** | **1 — Low (reconsider)** |

### Technical Feasibility (0/1 each, sum of 3)

| Dimension | Problem 1 | Problem 2 |
|---|---|---|
| Data/API Access | 1 — Canvas API for rubrics where tokens are allowed (one student already connected their own<sup>[05]</sup>), and syllabus/rubric upload for everything else ([decision 005](../decisions/005-learning-suite-by-upload.md)). Risk: schools blocking student tokens (`icp.md` risk 1) | 1 — same Canvas API plus upload |
| Technology Readiness | 1 — objective criteria are script-checked; subjective ones get a labelled LLM judge that says "cannot verify" on domain substance, because a confident wrong answer is what students already distrust<sup>[04]</sup> | 1 — a dated list is simple |
| No Hardware or Regulatory Blockers | 1 — read-only, the student's own data, nothing submitted | 1 |
| **Sum** | **3 — Clear path (with the token risk planned for)** | **3 — Clear path** |

### Gospel framework (directional)

| Check | Problem 1 | Problem 2 |
|---|---|---|
| Expands Agency | Yes — the student checks their own work and decides what to change; nothing is written for them | Yes — they see everything due and plan their own week |
| Supports Becoming | Yes — gaps and questions, never replacement sentences, so they learn to self-grade<sup>[03] [04]</sup> | Neutral |
| Deepens Connection | Watch — the trusted check today is a classmate or office hours<sup>[03] [04]</sup>. Homeroom should send them there with a sharper question, not replace them | Neutral |

---

## The decision

> **Problem 1: check the draft against the rubric.** It wins on every scored dimension except
> feasibility, where both are clear: Opportunity 15 vs 10, Conviction 4 vs 1. More importantly, it's
> the behavior students already do on their own: three students run the rubric-paste loop by
> hand<sup>[01] [04] [05]</sup> and one has already built a rough version with Claude and the
> Canvas API<sup>[05]</sup>. Problem 2 is a feature of Problem 1 (Homeroom knows the due dates
> because it knows the course), not a product of its own, and the Learning Suite retirement shrinks
> it further. The course's final test is which one I'm most excited to build; I confirm that in
> the AI interview.

[01]: interviews/2026-10-07-interview-01.md
[02]: interviews/2026-10-08-interview-02.md
[03]: interviews/2026-10-08-interview-03.md
[04]: interviews/2026-10-10-interview-04.md
[05]: interviews/2026-10-12-interview-05.md
