# Running Insights

> Synthesis, not a diary. Keep it to the 5–10 things you currently believe about
> your market, each with evidence. Revise beliefs in place; note the date of last change.

## MySI (current, Sprint 3)

One outside user so far ([06](interviews/2026-10-24-interview-06.md), my wife: a cake business
owner and math student). Every belief below rests on that one run, so all of them are bets to test
on the next users, not findings.

| # | Belief | Confidence | Evidence | Last updated |
|---|--------|------------|----------|--------------|
| M1 | People won't switch apps or vendors per task, even when the benchmark says a different model wins each task. They want one harness: "I would rather just have 1." Switching models is fine only if it happens inside the app they already use. This is the biggest risk to a per-task ranking, and it makes the router (one harness that can call any model) more important than the ranking. | Low (n=1), high impact | 06 | 2026-10-24 |
| M2 | The person's own rubric is personal, and model judges miss it. The judges scored GPT-5's ASCII graph 9 and 10 on math; she ranked it worst ("visual" means clean layout to her, not ASCII art). They also ignored her stated "no em dashes" rule on the email test. Her blind picks, not judge scores, have to drive the result ([decision 009](../decisions/009-one-winner-and-your-app.md)). | Med (direct run data, but one person) | 06 run detail | 2026-10-24 |
| M3 | Picks differ by task, not by model overall. GPT-5 was her best on email and her worst on math; Gemini the reverse. Across two tests that summed to a three-way tie, so an "overall winner" is noisy on a small test set and needs a tiebreaker. | Low (2 tests) | 06 | 2026-10-24 |
| M4 | When answers are close in quality, speed and cost should decide. Claude Sonnet 4.5 was second on both tests and the fastest and cheapest on both. This came from my suggestion, which she agreed with, so it is a prompted answer. | Low (prompted) | 06 | 2026-10-24 |
| M5 | Which app someone uses depends on how much usage they get and how the app looks, not on which model is smartest. She uses Claude because she gets more usage there, though "ChatGPT gives it to me a lot more simply," and she said an answer "looks better in ChatGPT." The app's formatting is part of what she is judging. | Low | 06 | 2026-10-24 |
| M6 | People would rather rate by talking than by clicking. Asked about checkboxes: "No, I like to say." | Low | 06 | 2026-10-24 |
| M7 | Setting up a remote MCP connector is doable for a non-technical user, with light help. She needed two assists (leaving a cloud session, being told to say "confirm"); the connect prompt now covers the first. | Low | 06 | 2026-10-24 |

**Notes on the evidence.**

- **Household, not a stranger.** 06 is my wife and I was in the room, so her "this is sick, honey"
  is a polite signal, not demand. The run data (her picks against judge scores, time, cost) is
  stronger evidence than anything she said about the product.
- **No willingness-to-pay evidence for MySI yet.** The only price in 06 is $20 to $30 a month for
  Wispr Flow, a different product. Don't read it as a MySI price.
- **Old lineup.** Her run used GPT-5, Gemini 2.5 Pro and Claude Sonnet 4.5, not the current
  frontier lineup, so M3 and M4 may shift on the new models.

## Homeroom (retired, Sprint 2)

Kept as history. These beliefs were about the Homeroom study harness, which the pivot retired
([decision 006](../decisions/006-pivot-to-personal-benchmark.md)). Not revised after 2026-10-12.

| # | Belief | Confidence | Evidence | Last updated |
|---|--------|------------|----------|--------------|
| 1 | Students already hand-run the rubric check: paste the rubric plus their own draft into a chatbot and ask "am I missing anything?" The behavior Homeroom automates exists today, unprompted. One student has gone further and has Claude pull the assignment and rubric through the Canvas API to grade them, and says that pull "is not reliable." | Med | [01](interviews/2026-10-07-interview-01.md), [04](interviews/2026-10-10-interview-04.md), [05](interviews/2026-10-12-interview-05.md) | 2026-10-12 |
| 2 | The loop shows up on researched, cited, rubric-graded writing (a business reply, a tax memo) — not on unrubricked papers or daily in-class quizzes, where there is no rubric and nothing to check against. | Low–Med | 01, 04; contrast [02](interviews/2026-10-08-interview-02.md) | 2026-10-12 |
| 3 | The binding constraint is "never generate my sentences," not price. They enforce it by hand today: rewriting AI-assisted drafts back into their own voice, keeping Google Docs version history as proof of authorship. A fourth frames the same line as using AI as "a thinking partner not a slave," use they could justify to a professor. | Med | 01, 03, 04, 05 | 2026-10-12 |
| 4 | Nearest real spend on school tools is $0 for three of five. Two pay: Grammarly Premium ~$15/mo, and a general Claude Pro subscription (plus an agent subscription) that the student already uses for the rubric check. Stated ceiling: $5–10/mo impulse, $15 "think hard," >$20 no. | Med–Low | 01/02/04 $0; 03 $15/mo; 05 Claude Pro; 04 band | 2026-10-12 |
| 5 | The BYU/Canvas coverage assumption behind the ICP is still unmeasured — the only confirmed BYU student keeps a majority of courses on Learning Suite (4 of 6), while the other college students are mostly or all on Canvas ("All canvas this semester"). The gap is time-limited: BYU is retiring Learning Suite in coming semesters, so uploads cover it until then ([decision 005](../decisions/005-learning-suite-by-upload.md)). | Low (n=1 at BYU), still the biggest live risk to the ICP | 03; contrast 01, 04, 05 | 2026-10-12 |
| 6 | ChatGPT's teaching is named as the failure ("explains it like you already know"); what they say they'd pay for is shown work — graphs, images, a video. | Low — both answers came from product-touching closing questions, so they are bets | 01, 02 | 2026-10-12 |
| 7 | When a draft is uncertain, the trust tiebreaker is a human working the same problem (a cohort classmate, office hours), not the AI. | Low | 03, 04 | 2026-10-12 |
| 8 | The pain they name first is research and citation correctness — which the rubric check does not touch. | Low–Med | 04 (research slog), 03 (citations, data extraction) | 2026-10-12 |
| 9 | The same loop reappears in K-12 in a cheaper form — school-managed accounts, a block on AI, no student spend — so high schoolers may be a real second segment, but there the district is the buyer, not the student. | Low | 02 | 2026-10-12 |
| 10 | The most technical students are already building the automation themselves (an AI connected to Canvas through a token they made), and it breaks. Reliability of the course pull, not the idea of it, may be the edge. | Low (n=1) | 05 | 2026-10-12 |

**Notes on the evidence.**

- **Coverage of the five interviews.** 01 — college student, business writing, household (pilot of the
  script, not outside evidence). 02 — high school student entering freshman year; kept in the table
  on purpose: the same check-the-work behavior appears in a K-12 shape, so the college-only
  assumption in `icp.md` is something to revisit rather than a disqualifier. 03 — finance major.
  04 — accounting student. 05 — college student, all Canvas, the most technical respondent so far;
  written notes rather than a recording, so answers are paraphrased and the closing question (Q7)
  wasn't asked. Nothing here has established what share of a real BYU student's courses run on
  Canvas rather than Learning Suite — that gap is belief 5.
- **Bets, not evidence.** Belief 10 rests on one technical student and may not generalize past
  people who can make their own Canvas token. Beliefs 6 and 7 come from the product-touching closing question, which the
  course treats as a condition question answered to be polite. Belief 9 rests on a single K-12
  interview and one secondhand workaround ("my friends connect their AI to Canvas").
- **Why confidence stays low.** Two of the five are not outside-ICP respondents, the recruitment
  channel for 02, 04 and 05 wasn't recorded, and the rubric-paste loop has three students behind it
  (one of them the household pilot), not a round of them. Revise in place as the professor
  interviews and the next student round land.
