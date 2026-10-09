# Homeroom — Faculty (Professor) Interview Questions

**Date:** 2026-10-08
**Status:** Script for the two professor interviews (Sprint 2, pre-product). Companion to the student round, `2026-10-07-interview-questions.md`.
**Purpose:** Test the two things a student interview cannot reach — (1) whether the rubric Homeroom would pull is a real artifact the professor actually grades against, and (2) whether a "check my draft against your rubric" tool survives faculty judgment. Not user discovery; see the framing note below.
**Source:** designed from `discovery/icp.md` (risk 3, the faculty split; risk 4, who pays) and `discovery/jtbd.md` (the social layer), run against Mom Test rules — behavior and specifics, never hypotheticals.

## What this round is and is not

Students are the ICP; professors are not users. These two interviews produce **no ICP evidence** and cannot confirm the job. They exist to test three hypotheses the student round cannot:

- **The F1 mechanic.** That the rubric exists as something a tool could read — a Canvas rubric, a handout, or only "I know it when I read it."
- **The social layer.** Whether draft-plus-rubric feedback is something faculty accept. That is the entire reason Homeroom tutors instead of writing: `icp.md` cites 45% of faculty calling draft-plus-rubric feedback legitimate against 11% for AI writing the first draft (Elon/AAC&U 2026).
- **The buyer path, secondarily.** `icp.md` risk 4 says the eventual buyer is probably a business school or online program, not the student.

Treat all three as hypotheses, and file these as faculty interviews, not as market validation. A professor is also the worst witness for student behavior — ask what they have seen, never what students would do.

## Ground rules

- Talk about their classroom and their grading, not Homeroom. Do not describe the product.
- Ask about the past and about things they have actually watched happen, never "would you…".
- Never ask a professor to predict what students would do — that is the same hypothetical the Mom Test bans, one step removed.
- Talk less than 20% of the time. Dig with "tell me more", "give me an example", "what did you do next".
- Record their words, not your interpretation.
- Faculty tend to be encouraging about student-facing tools. Treat warm agreement as a false positive until a condition or a real incident backs it.

## The six questions

### 1. Walk me through the last written assignment you graded — from the student hitting submit to the grade going in. Where did the rubric live in that?

Tests the F1 dependency from the faculty side, plus the real grading workflow. Disqualifier question, ask first: if the criteria are not written down anywhere a tool could read, Homeroom's core mechanic has nothing to pull for that course, and nothing after this question matters.
Strong: they describe a rubric built in Canvas's rubric tool, or a rubric file they grade against line by line.
Weak / disqualifier: "I just know it when I read it" — the criteria live only in their head. Note it and move on; that course can't be a Homeroom course.

### 2. Before students write, how do they find out what you're looking for — and what do they actually ask you when they're not sure?

Tests the "know it before I submit" premise, and whether the professor is already absorbing those questions by hand.
Strong: it shows up as recurring office-hours traffic ("does this need citations?"), or they publish a rubric/checklist in advance.
Weak: the criteria surface only with the grade, which would put the whole product after the deadline.

### 3. Tell me about the last time a student's work made you suspect they used AI. What did you notice, and what did you do?

Tests the integrity layer from the faculty side, on a real incident in the past tense.
Strong: a specific story with a specific tell and a specific consequence.
Weak: "I don't really police it" — which would mean student fear is running ahead of faculty practice. Useful either way; it belongs in the note.

### 4. What does your syllabus say about AI right now — and how did you land there?

Tests the actual acceptable-use line and how it formed (the 45%/34% faculty split). BYU's default is that silence means AI is not allowed, so a vague answer is itself data.
Strong: they allow editing, feedback, or idea-checking but not a written first draft — the exact seam Homeroom claims.
Weak: an outright ban or no policy at all. Both mean the framing has to change for that class.

### 5. What does your department or the college pay for right now that touches grading or feedback — and how did that decision get made?

Tests the buyer path and the procurement gatekeeper (`icp.md` risk 4; risk 1's Canvas developer-key approval makes the school's IT office a gate). Ask what already exists and who approves a new tool, not whether they'd buy Homeroom.
Strong: they name a real tool (a plagiarism checker, an LMS add-on, a grading platform) and describe who signs off.
Weak: "I just use what Canvas gives us and nobody decides anything" — which tells you a bottom-up, professor-champion route is the only one.

## Optional closing question (product-touching)

Ask **last**, only after the five behavior questions have run their course. This one breaks the ground rules above on purpose — it invites them to judge a solution — so record the answer as a bet, not as evidence.

### 6. You said your rubric is [their actual rubric / how they tell students the criteria]. What would have to be true about a tool that let a student check their own draft against your rubric before submitting, for you to be fine with it — and what would make you ban it from your class?

Source: closing question ("What would have to be true for something to be worth paying for?") from the MSB 341 chapter *Finding and Validating the Problem*, adapted to the faculty-acceptance risk instead of price.

Why it holds up: it asks for a condition, not an opinion, so it passes the chapter's test that good evidence is evidence that would look different if you were wrong. The second half — "what would make you ban it" — is the half that matters, because it is the disconfirming answer; a professor who names a dealbreaker is telling you where the product's framing breaks.

Strong: they name a specific condition ("flags what's missing but doesn't rewrite", "I can see a log of what it told them"), or tie it to a line already in their syllabus — or volunteer to tell their class about it, which is the endorsing-professor list in `icp.md`'s "where to find them".
Weak: "yeah, that sounds fine" with no condition and no caveat — the chapter's **false positive** (polite agreement), not validation.

## Close-out

- Ask permission to follow up in a week.
- "Who else teaches writing-heavy courses who'd have a strong opinion on this?" — faculty referrals satisfy the Access Test in the direction the student round can't.
- Fill in an interview note from `000-interview-template.md` the same day, while their words are fresh.
- Label each note as a faculty interview in its header, so it is not later read as ICP evidence.
