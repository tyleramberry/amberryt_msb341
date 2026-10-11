# Homeroom — Pre-Product User Interview Questions

**Date:** 2026-10-07 · **Revised:** 2026-10-08 (Q4 split into coverage + token; intent text restored)
**Status:** Script for discovery interviews (Sprint 2, pre-product)
**Purpose:** Test the problem, not the idea. No feature talk, no pitching Homeroom.
**Source:** designed from `discovery/icp.md` + `discovery/jtbd.md` validate-lists, run against Mom Test rules (behavior and specifics, never hypotheticals).

## Ground rules

- Talk about their life, not Homeroom. Do not describe the product.
- Ask about the past, never "would you use…" / "would you pay for…".
- Talk less than 20% of the time. Dig with "tell me more", "give me an example".
- Record their words, not your interpretation.

## Run order

- **Q4 early.** It is the disqualifier. If recruiting is running K-12 heavy, ask it before the behavior
  questions so you don't spend twenty minutes on a non-ICP respondent.
- **Q4 and Q5 stay apart.** They were one question for interviews 01 and 02, and the token half ate the
  coverage half both times. Two questions, with a breath in between.
- **Q6 is the spend question, not an opinion poll.** Never ask "would you pay for this"; ask what they
  already pay.
- **Q7 is product-touching and goes last**, only after the behavior questions have run their course.
  Record the answer as a bet, not as evidence.
- If a question lands a weak answer, mark it weak in the note and move on. Do not re-ask until it lands
  strong — a substituted answer is the most expensive kind of false positive.

## The six behavior questions

### 1. Walk me through the last written assignment you had to turn in — what did the process look like from finding out about it to hitting submit?

Tests frequency + intensity of the rubric-graded paper loop. The whole problem statement rests on this
being a recurring, painful ritual.
**Strong:** they narrate a specific paper unprompted, and remember the late-night uncertainty.
**Weak:** they can't recall one, or it was over in an hour with no friction. (Interview 02 was weak
here — a term-long handout, no rubric, no crunch.)

### 2. What did you do when you weren't sure your draft hit the criteria — did you paste anything into ChatGPT or Gemini, or ask someone?

Tests the current workaround and the re-pasting pain (the JTBD's functional layer). Get screenshot-level
detail: where they paste, what they typed, what they got back, **whether it knew their course.** This
tells you if "generic AI that doesn't know the course" is real or an assumption.
**Strong:** they name the rubric itself as the thing they paste. **Weak:** "I just ask AI if it's good" —
generic review, no criteria, which is what interview 02 gave.

### 3. When you've used AI on schoolwork, have you ever worried about how a professor would take it? What did you do about that?

Tests the social / integrity layer — the JTBD calls it the thing that separates this from "make my essay
better," and it's the whole reason for the tutor persona.
**Strong:** it comes up unprompted (the JTBD file lists that as the key signal).
**Weak:** they shrug — which would mean the integrity angle is weaker than the PRD assumes and the
tutor-first design is costing users for nothing. **Watch for the third shape** interview 02 produced:
detection worry resolved by *disengaging* from AI ("you might as well use your own brain"). That is a
problem for the tutor thesis too, in the other direction.

### 4. Which of your courses this term are on Canvas, and which are on Learning Suite? Where does the graded writing actually get submitted — Canvas, email, paper?

The disqualifier. The ICP disqualifies Learning Suite-heavy students, so ask it early. It also needs the
third bucket the first two interviews kept surfacing: **paper-only courses**, which are a bigger hole
than Learning Suite for anything that touches the submission.
**Strong:** a clear Canvas / Learning Suite / paper split you can count per course, plus where the
written work lands.
**Weak:** a vague "most of them, I think." Push until you have a per-course list — this is the one
question where guessing costs more than asking again.

### 5. Have you ever tried to get an access token or connect anything to Canvas — or do you know anyone who has?

The second half of the biggest listed risk: whether student token access actually works. **Ask it as its
own question** — bundled into Q4 it never gets answered (interviews 01 and 02 both slid), and if most
courses are Learning Suite *or* the token path is closed, the F1 dependency is broken and the MVP is
built for a person who doesn't exist.
**Strong:** "yes, here's the token / here's exactly what broke," or a concrete secondhand account you can
follow up on. Secondhand is a lead, not evidence — get the referrer's name.
**Weak:** "never tried" from an ICP respondent. That is a real onboarding-friction finding, not a dead end.

### 6. What are you paying for to help you with school right now — and what did the last thing you paid for actually get you?

Tests willingness to pay from real spend, not a hypothetical number. The ICP says $0 today with a $5–10
ceiling; the answer either confirms that or shows where money already moves (tutoring, Chegg, Grammarly
premium). Never ask "would you pay for this" — ask what they already pay.
**Also capture who pays.** Interview 02 found spend that exists but sits with the school district, not
the student. If the buyer and the user are different people, that is an ICP boundary, not a WTP data point.

## Optional closing question (product-touching)

Ask **last**, only after the six behavior questions have run their course. This one breaks the ground rules
above on purpose — it invites them to picture a solution — so record the answer as a bet, not as evidence.

### 7. You said you [their actual workaround]. What would have to be true about the thing that fixed that for you to be worth paying for — and what would make you decide not to?

Source: closing question ("What would have to be true for something to be worth paying for?") from the
MSB 341 chapter *Finding and Validating the Problem*, adapted to Homeroom's workaround.

Why it holds up: it asks for a condition, not an opinion, so it passes the chapter's test that good
evidence is evidence that would look different if you were wrong. Anchor it to the spend question above,
since the chapter says real WTP is what the problem already costs them (workaround price, hours lost, the
substitute they buy), not a number they invent.

**Strong:** they name a specific condition and a number unprompted, or benchmark it against something they
already pay for (the Grammarly AI Grader free-tier cap, a tutor, a textbook).
**Weak:** "yeah, I'd probably pay for that", or a condition so vague it can't be falsified — that is the
chapter's **false positive** (polite agreement), not validation.

Two of two interviews have answered this with a **format** request (show the work, visuals, video) rather
than a feature. Log it; it is a bet from a product-touching question, so it does not build scope yet.

## Close-out

- Ask permission to follow up in a week (that is the beta-tester list).
- "Who else do you know who has this problem?" — referrals satisfy the Access Test.
- Fill in an interview note from `000-interview-template.md` the same day, while their words are fresh.
- If the respondent turns out to be off-ICP, say so at the top of the note and keep their data out of
  ICP-level claims (as interview 02 does).
