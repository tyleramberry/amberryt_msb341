# Problem Discovery Worksheet (Sprint 2)

**Date:** 2026-10-10 · **Updated:** 2026-10-12 · **Status:** Part 1 complete (3 problems described). Part 2 scored from the five student interviews and the AI interview.
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
([prompt](ai-interview-prompt.md)) ran on 2026-10-12; its scores are in
[AI interview scores](#ai-interview-scores-2026-10-12) below, with the gaps noted rather than
overwritten.

**AI interview conversation URL:** https://claude.ai/share/2c9fbc48-628a-4abe-9edc-f58770172f73

> Run in a Claude Code session on 2026-10-12, then reposted word for word to Claude.ai so it could be shared. Scores transcribed below.

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

### AI interview scores (2026-10-12)

The AI scored only from my answers in the interview plus its own knowledge. Where it differs from
my scores above, the gap is in the last column.

| Dimension | Problem 1 — Rubric check | Problem 2 — Deadline sprawl | Gap vs. my scores |
|---|---|---|---|
| Frequency | 4 (Weekly). About half my assignments are graded against a rubric or stated criteria | 4 (Weekly). 5 late discoveries in about 7 weeks; I maintain a shared Google Doc of due dates weekly | P2: mine 3. I told the AI about my own late finds; my scores above used only interview 03 |
| Intensity | 3 (Annoying). No observed case of lost points; "could be pretty bad" is imagined | 4 (Frustrating). Real consequence plus a hand-built workaround | P1: mine 4. P2: mine 2. The AI weighted my own Google Doc behavior; I did not mention interview 04/05 evidence |
| Willingness to Pay | 2 (Unlikely). I said WTP is very low given free tools | 2 (Unlikely) | P1: mine 3. I did not mention the $5–10 stated band<sup>[04]</sup> or the Claude Pro user<sup>[05]</sup> |
| Market Size | 4 (Large segment). Evidence is business writing only | 2 (Small niche, shrinking) | P2: mine 3 |
| **Opportunity total** | **13 / 20** | **12 / 20** | Mine: 15 vs 10 |
| Personal Pain | 1. I check by hand | 1. 5 late finds, the Google Doc | Same |
| Close Relationship | 1. Wife and brother | 0. They are all-Canvas; their pain is not the two-system split | Same |
| Moral Calling | 0. I called it an inefficiency | 0 | P1: mine 1. I did not raise the "AI that writes means no learning" argument |
| Unique Insight | 0. I said "not that much, I'm still not sure" | 0 | P1: mine 1. I did not raise the objective-vs-judged criteria split |
| **Conviction** | **2 / 4 — Moderate** | **1 / 4 — Low** | P1 mine: 4 |
| Data/API Access | 1. Student Canvas token only. Use no admin credentials | 1. Canvas plus Learning Suite calendar export | Same |
| Technology Readiness | 1. Calibration unproven; a false "you're fine" is the costly error, so an eval set is needed | 1. Easy, which is why it is already built | Same |
| No Blockers | 1. Only on the student's own token | 1 | Same |
| **Feasibility** | **3 / 3 — Clear path** | **3 / 3 — Clear path** | Same |
| Expands Agency | Yes | Yes | Same |
| Supports Becoming | Depends on design: questions = growth, scores = rubric-gaming | Neutral | P1: mine Yes |
| Deepens Connection | Leans negative if it replaces office hours or the TA | Neutral | Same direction |

**What the gap says.** Both sets rank Problem 1 ahead, but the AI's margin is much smaller (13 vs 12
on Opportunity, not 15 vs 10). Most of the gap is evidence I have on disk but did not say in the
interview: the WTP band, the Claude Pro user, the moral argument, and the research insight. The
gaps the AI interview found that my own scoring hid:

- **No observed point loss.** Problem 1's intensity rests on anxiety, not a named criterion that
  cost someone points. One such story would raise it.
- **Unique insight is thin when said out loud.** I could not name it unprompted.
- **My own deadline pain is real.** My scores above under-scored Problem 2's frequency and
  intensity because they used only interview 03.

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
