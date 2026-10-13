# Homeroom: Value Proposition

**Date:** 2026-10-12 · **Status:** v1, built from the five Sprint 2 student interviews. Companion to
[`icp.md`](icp.md) (who) and [`jtbd.md`](jtbd.md) (the job). Problem 1 in
[`worksheet.md`](worksheet.md) is the problem it answers.

## The statement

> **We help college students check their own draft against the real rubric before they submit,
> by pulling the criteria from their course and pointing at the exact lines that miss them,
> without ever writing their sentences for them.**

Shorter, for a landing page: *Know your draft hits the rubric before you submit, in your own words.*

## Customer side: what they're trying to do

| | What the interviews show |
|---|---|
| **Job** | Check a rubric-graded draft before submitting, without second-guessing it at midnight. They already do it by hand: paste the rubric and draft into a chatbot and ask what's missing<sup>[01] [04] [05]</sup> |
| **Pains** | Self-grading "only gets me so far"<sup>[04]</sup>. Re-pasting the rubric and assignment every time, or a home-built Canvas pull that "is not reliable"<sup>[05]</sup>. AI that's "confidently wrong" on the subject matter<sup>[04]</sup>. Not knowing where the professor's AI line is, and worrying about being flagged<sup>[01] [03] [04]</sup> |
| **Gains** | Targeted feedback on specific spots ("does this paragraph actually answer the prompt?"), not a full re-read<sup>[03]</sup>. Being able to say "the thinking and the words are mine"<sup>[04]</sup>. AI as "a thinking partner," use they could justify to a professor<sup>[05]</sup> |

## Product side: how Homeroom answers it

| | What Homeroom does ([`specs/mvpspec.md`](../specs/mvpspec.md)) |
|---|---|
| **Product** | A study assistant that knows the student's courses (F1), remembers past sessions (F2), tutors (F3), and checks drafts against the rubric (F4) |
| **Pain relievers** | Pulls the rubric and assignment from Canvas, or from an upload, once, so there's no re-pasting. Script-checks objective criteria and labels the AI-judged ones. Says "cannot verify" instead of guessing on domain substance |
| **Gain creators** | Feedback on each criterion that points at a line of their draft. Gaps and questions, never replacement sentences, so the work stays theirs. Sends them to a classmate or office hours with a sharper question when a person is the right check<sup>[03] [04]</sup> |

## Why this and not what they use now

| Today | What it misses |
|---|---|
| ChatGPT / Claude with the rubric pasted in<sup>[01] [04]</sup> | Doesn't know the course; re-paste every time; will happily rewrite the draft |
| Their own Claude + Canvas API setup<sup>[05]</sup> | Unreliable pull; only works for students who can build it |
| Grammarly (free or Premium)<sup>[03]</sup> | Grades grammar and tone, not the professor's rubric |
| A classmate or office hours<sup>[03] [04]</sup> | Trusted, but not there at midnight. Homeroom works alongside them, not instead of them |

## What it is not

- Not a writer. If it writes the memo, "I won't touch it. That's a risk to my degree"<sup>[04]</sup>.
- Not a research or citation-format tool. Students name these as a pain<sup>[03] [04]</sup>, and the
  spec keeps them out of the MVP.
- Not a deadline tracker on its own. Due dates come along because it knows the course
  ([worksheet](worksheet.md) Problem 2).

## Price signal

$5–10/mo is the stated impulse range, $15 is "think hard," and over $20 is a no<sup>[04]</sup>.
One student already pays for Claude Pro and uses it for this job<sup>[05]</sup>, and one pays
$15/mo for Grammarly Premium<sup>[03]</sup>. All of these are stated or adjacent spend, not
payment for Homeroom. For this portfolio project, usage is the measure, not revenue
([decision 002](../decisions/002-learning-portfolio-first.md)).

[01]: interviews/2026-10-07-interview-01.md
[03]: interviews/2026-10-08-interview-03.md
[04]: interviews/2026-10-10-interview-04.md
[05]: interviews/2026-10-12-interview-05.md
