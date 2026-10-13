# Sprint 2 Review

**Window:** 2026-09-28 (plan committed 21:30) to 2026-10-12
**Sessions reviewed:** 12 across 2 tools (Claude Code 6 in this repo, Hermes Agent 6 desktop sessions about Homeroom; 14 automated Hermes cron runs that mention Homeroom not counted)
**Not visible to this review:** You named Hermes Agent as the only other tool. The interviews themselves (calls, in person, one by written notes) happened outside any tool.

## Where the work lives

- **Course repo:** https://github.com/tyleramberry/amberryt_msb341. 27 commits in the window, on 7 days. Shared with `sdmurff`.
- **Homeroom v0 UI:** https://homeroom.homeroom-app.workers.dev (code in `product/app/`; redesign deployed Sep 30)
- **AI interview:** https://claude.ai/share/2c9fbc48-628a-4abe-9edc-f58770172f73
- **Reflection video:** https://www.loom.com/share/c10c024c9abc4ecf94669d5471a5a845

## When you worked

Commits on 7 of 15 days: Sep 28, Sep 30, Oct 3, 7, 8, 10, 12. Agent sessions on 5 of them: Sep 30, Oct 7, 8, 10, 12.

The shape is back-loaded. 12 of the 27 commits, and every Claude Code session, landed on Oct 12, the last day. Oct 10 was the second-heaviest day (5 commits, two Hermes sessions). In the first week, the only work besides the Oct 3 desk-research ICP and JTBD was one UI session.

## Where you got stuck

1. **The UI redesign, Sep 30.** In Hermes, the Slack-style redesign was rejected as looking "vibe coded." The same retry prompt was sent five times in about eight minutes, and the model was switched twice. It ended when a version looked better and was pushed and deployed (commit 19:34).
2. **Finding out what was missing, Oct 10.** The same "compare the repo to my Sprint 2 goal" audit ran twice, three hours apart, in two Hermes sessions. In between, the agent labeled a real interview as simulated. It ended with that label removed, the README and AGENTS updated, and an insights draft.
3. **Getting a shareable AI interview link, Oct 12.** The interview ran in Claude Code, which has no share link. The built-in browser wasn't signed in to Claude.ai, Chrome wasn't connected, and the first link back was a scorecard artifact, not the conversation. It ended with a manual repost to Claude.ai and a share link at 22:57.

## What took the most time

- **Sep 30 UI session (Hermes):** about 3 hours of prompts inside a 6-hour span, 108 tool calls. This was the longest single session of the sprint.
- **Oct 10 (two Hermes sessions):** about 3.5 hours combined, 119 tool calls. Repo audits, interview 03 and 04 write-ups, the worksheet and AI interview prompt, the README and AGENTS fixes.
- **Oct 12 evening (Claude Code):** 24 prompts across 6 sessions. Plan change, MVP spec, worksheet scoring, the AI interview, the Loom, the README.
- **Smaller sessions:** interview questions (Oct 7, ~1.3 hours) and transcript-to-markdown (Oct 8, a few prompts).

## Axis

**Discovery.** Most commits and session time went to interviews, the worksheet, insights, the ICP, JTBD and value prop. The one large exception was the Sep 30 UI session, which was Design.

## Against your plan

**Goal was:** Homeroom validated with 5 students through recorded interviews, backed by a scored Problem Discovery Worksheet and an AI interview, and my ICP (with JTBD and value prop) committed.

| Done looks like | What the repo shows |
|---|---|
| 5 recorded student interviews, anonymized | 5 interview files. Interview 05 is written notes, not a recording. |
| At least 4 of 5 validate the problem | By `discovery/insights.md`, 3 of 5 describe the rubric-check behavior (01, 04, 05), and 01 is a household pilot. 02 (high school) and 03 (citations) point elsewhere. The bar was not met as written. |
| Worksheet: 3 problems described, 2 scored | Done (Oct 10 and Oct 12) |
| Shared AI interview URL | Done Oct 12. The interview ran in Claude Code and was reposted word for word to get a link. |
| JTBD, value prop, ICP committed | Done. The ICP and JTBD came from desk research on Oct 3, before any interview. The value prop is from Oct 12. |
| 2-minute Loom | Done Oct 12 |
| Research written up, MVP spec updated | Done Oct 12 |

The plan changed on Oct 12, the last day: the professor interviews were dropped and building moved to Sprint 3. The Sep 30 UI redesign was building work in a sprint whose goal was to validate before building more.

---

## Your retro

*The builder's own answers, recorded word for word in step 7.*

**Did you hit the goal?** I hit my goal. Yes, I was able to write all the documents and do all the interviews that I needed to. The app wasn't necessarily validated, but I did hit the goal of doing the interviews and getting the documentation.

**What did the report show you?** The report was actually incredibly useful in helping me realize insights from the interviews. I thought the interviews helped validate it, but the report actually helped open my eyes to the fact that, because the willingness to pay is so low and the amount of free tools is so high, students are likely to not pay for this (because the problems that it solves are not as big of a deal as I thought).

**If the plan changed, why?** Yes, the plan changed a little bit through the sprint. I decided not to interview professors because I realized that I wasn't building this for professors to use. Validating with professors whether they would like their students to be using this, I think, can wait for a later phase if I continue to build.

**Actual difficulty:** I think it was about a 3 or 4. It was harder than I thought to get in front of students, and it took a fair amount of effort to draw insights from all that and to make decisions based on those. I think it was harder than I thought because this is actually something that I've never done, but I learned a lot along the way.

**What will you change next sprint?** During the next sprint, I want to pivot and start looking into something that I believe in and want to build, and that is a more valid build. I originally started building Homeroom because I thought it would look good on a portfolio to have built an agent harness, but I don't feel passionate about it. I don't think there's a huge need for it right now. I think I would like to pivot to helping normal people eval new model releases so that they can use them in their personal agents. It's a problem that I think is very aligned with my beliefs.
