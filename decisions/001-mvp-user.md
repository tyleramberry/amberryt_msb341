# Decision 001: Students are Homeroom's MVP user

**Date:** 2026-09-28
**Status:** Active

## Context

The repo README and `AGENTS.md` named teachers as the end user and schools as the buyer. My
Sprint 1 research (`discovery/research/harnessresearch.md`), the PRD and the MVP spec were all
written for students. The MVP spec could not start F1 (the student context layer) until this
was settled.

## Options considered

1. **Students**: pros — I am one, so I can test it every day on my own courses; the research,
   PRD and spec already point here; the core loop (syllabus → tutor → rubric check) is a
   student workflow. Cons — students don't hold budgets; teachers may see it as a cheating
   tool and block it.
2. **Teachers**: pros — matches the B2B-to-schools story; teachers are closer to the buyer.
   Cons — I have no teacher access for daily testing; none of the research covers a teacher
   workflow; I would start discovery from zero with ~10 weeks to the Dec 10 final.
3. **Both at once** (teachers supply rubrics, students use it): pros — fits the long-term
   picture. Cons — two users means two onboarding flows and two sets of interviews, too much
   for the MVP.

## Decision

**Students are the user.** Deciding reason: I can put it in front of real students, starting
with myself, this sprint. That gives the fastest feedback loop before the final deadline.
Teachers stay in the picture only as the source of rubrics and as a check that the tool
teaches rather than cheats (validation plan in `specs/mvpspec.md`).

Who pays (students directly vs. schools) is not decided here.

## What would change our mind

- Fewer than 3 of the 5 students interviewed say they would use the rubric check on a real
  assignment this month.
- Teachers in the validation interviews say they would block it in their courses.
- The students who try it only use deadline tracking, which the LMS already covers.
