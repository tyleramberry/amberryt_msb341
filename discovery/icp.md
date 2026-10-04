# Homeroom: Ideal Customer Profile (baseline v0)

**Date:** 2026-10-03 · **Status:** Hypothesis. No customer data yet. Built from desk research on the PRD and MVP spec. Sprint 2 interviews will confirm or kill each line.

## The ICP in one sentence

A **BYU Marriott (business) junior or senior** who is taking 4–6 courses, most of them **on Canvas**. They already use ChatGPT or Gemini **every week** for school but don't pay for it. They care about their GPA for program admission and recruiting, and they have a **rubric-graded written assignment due in the next two weeks**.

## Who they are

| Attribute | ICP | Why |
|---|---|---|
| School / LMS | A Canvas school. At BYU, that means courses on Canvas (BYU Online, much of Marriott) | Learning Suite has no API, so Homeroom can't read those courses |
| Major | Business first; nursing, education and humanities next | Business and tech majors use AI the most (Gallup 2026), and business deans are the most AI-permissive (BestColleges) |
| Year | Juniors and seniors in professional programs | They get the most rubric-graded writing (cases, memos, reports) and have the most riding on their GPA |
| Load | 4–6 courses at once, often working or married | Deadlines spread across several courses is the core problem (inferred; no good US data yet) |
| AI habit | Uses AI weekly; already pastes the syllabus or rubric into a chatbot | 57% of students use AI weekly (Gallup 2026). Pasting the rubric is advice schools already give |
| Spend | Pays $0 now; Plus at $20/mo feels too expensive | A realistic consumer ceiling is $5–10/mo, and big AI companies give students free plans |
| Tech | Will click "connect Canvas"; won't use a terminal | Existing Canvas-to-Claude connectors have 0–4 stars because setup is too hard |

## Job to be done

> "When I have a rubric-graded assignment due, I want to know my draft hits every criterion **before** I submit, without re-pasting my course into a chatbot or putting myself on the wrong side of my professor's AI policy."

- **Pains today:**
  - Generic AI answers that don't know the course.
  - Re-pasting context every session.
  - Fear of a cheating accusation (48% of students, Pearson 2025).
  - Unclear rules. BYU's default is that if the professor hasn't said anything, assume AI is not allowed.
- **Current workarounds:**
  - ChatGPT or Gemini with the rubric pasted in.
  - Grammarly's AI Grader, where you upload the rubric yourself and the free tier is capped.
  - The Canvas to-do list.
- **When they go looking:**
  - The first big paper of the semester.
  - A weak grade that comes back with rubric comments.
  - Midterms, which are now.
  - Finals, weeks 13–15.

## Why Homeroom wins with them

No competitor does all three of these:

1. Pulls the **real Canvas rubric**.
2. Scores the draft **criterion by criterion**, labelling which scores are script-checked and which are AI-judged.
3. **Tutors** across sessions.

Grammarly grades but doesn't know the course. Chrome extensions know the deadlines but don't tutor or grade. Claude, ChatGPT Edu and IgniteAI need the school to buy or switch them on. Not writing for the student keeps Homeroom on the side faculty accept:

- 45% of faculty call draft-plus-rubric feedback legitimate. Only 11% say that about AI writing the first draft (Elon/AAC&U 2026).
- This also matches BYU leadership's message that AI should support learning, not replace it.

## Not the ICP (disqualifiers)

- Most of their courses are on Learning Suite, or their professor bans AI outright.
- They want answers written for them (the Chegg crowd). The tutor persona will frustrate them, and they're an integrity risk.
- Graduate students, who need committee approval for AI use at BYU.
- Problem-set-only STEM course loads. The tutor fits, but the rubric check doesn't. Secondary segment.
- **Good beta testers, not the ICP:** CS students and AI-club members. They're 38.6% of Claude's student users and will tolerate rough setup, but they aren't typical.

## Where to find them (10 weeks, solo, no budget)

- Your own MSB 341 cohort and Marriott clubs.
- The BYU AI Association and the CS AI Club, for technical testers.
- One "connect Canvas to an AI tutor" workshop, possibly with BYU's Claude Campus ambassador.
- 2–3 Marriott professors who endorse it as checking before you submit, not cheating.

## Risks that could change this ICP

1. **Canvas access (biggest).**
   - Instructure's developer docs say apps built on student personal tokens get blocked.
   - After the May 2026 breach, Instructure revoked all access tokens. Since then, OSU and UW-Madison block student tokens, and BYU-Idaho makes students request one.
   - BYU Provo's rule is unknown. **Test it on your own account this week.**
   - A permanent product probably needs an OAuth developer key approved by the school, which makes the school's IT office a gatekeeper.
2. **BYU coverage.** Learning Suite may hold a large share of a typical student's courses.
3. **Faculty split.** On rubric feedback, faculty split 45% legitimate, 34% cheating. Framing matters: "explains and checks, never rewrites."
4. **Who pays.** Students likely won't, and the eventual buyer is probably a business school or online program. Fine for a portfolio project; measure usage, not revenue.

## Validate in Sprint 2 interviews

- [ ] What share of their courses is on Canvas vs Learning Suite?
- [ ] Can they create a Canvas access token?
- [ ] Have they pasted a rubric into AI in the last month?
- [ ] Would they run a rubric check on a real assignment this month? (Target: 3 of 5.)
- [ ] Is the pain mainly the rubric or the deadlines? (If deadlines, rethink per the MVP spec.)
- [ ] Would either professor block it?
- [ ] What do they pay for study tools today?

**Key sources:**
- [Gallup/Lumina 2026](https://news.gallup.com/poll/704090/routine-college-students-despite-campus-limits.aspx)
- [Pearson Student AI Tracker 2025](https://plc.pearson.com/sites/pearson-corp/files/2025-05/student-ai-tracker-spring-25-short-version-for-external-sharing.pdf)
- [Elon/AAC&U faculty survey 2026](https://imaginingthedigitalfuture.org/wp-content/uploads/2026/01/Elon-AACU-faculty-AI-survey-full-report-1-21-26.pdf)
- [BYU GenAI academic integrity](https://genai.byu.edu/academic-integrity-for-students)
- [BYU LMS overview](https://teachanywhere.byu.edu/technology-media/learning-management-systems-lms)
- [BYU-I token process](https://td.byui.edu/TDClient/79/ITHelpCenter/KB/Article/18367)
- [OSU token change](https://it.osu.edu/news/2026/08/11/carmencanvas-personal-access-tokens)
- [Canvas OAuth docs](https://canvas.wisc.edu/doc/api/file.oauth.html)
- [Grammarly AI Grader](https://www.businesswire.com/news/home/20250818186419/en/Grammarly-Launches-Specialized-AI-Agents-and-Writing-Surface-for-Students-and-Professionals)
- [Anthropic education report](https://anthropic.com/news/anthropic-education-report-how-university-students-use-claude)
