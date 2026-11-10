# Sprint 4 Review

**Window:** 2026-10-28 to 2026-11-09 (14 days; the plan file was first committed Oct 28 and rewritten to the Herd goal on Nov 4)
**Sessions reviewed:** 92 across 36 projects (Claude Code 85, Codex 7; 886 sessions excluded at your request)
**Not visible to this review:** Hermes Agent sessions (you said you worked in Hermes "pretty much the whole time"), plus a few chats in Claude Code that are outside the confirmed folders.

## Where the work lives

| Output | Where | Commits in window | Shared with sdmurff |
|---|---|---|---|
| Herd, multiplayer plugin for Hermes Agent | https://github.com/tyleramberry/herd (public, MIT) | 68 commits on `main`, Nov 4 to Nov 9; 52 merged PRs | Yes (collaborator, and public) |
| Course repo (plan, review, README, MySI engine) | https://github.com/tyleramberry/amberryt_msb341 | 53 commits: 50 on Oct 29 to Oct 31 (all MySI), 3 on Nov 4 (Sprint 4 plan switch, README, AGENTS.md) | Yes |
| Hackathon catalog PR | https://github.com/NousResearch/hermes-agent/pull/150867 | Closed by you on Nov 7 ("will reopen with an updated pin"); no open PR found | n/a |
| Demo video on X, hackathon entry form | No link found in either repo | n/a | n/a |

## When you worked

Prompts you or your agents sent in the confirmed sessions, by day: Oct 28 (6), Nov 1 (1), Nov 2 (6), Nov 4 (3), Nov 5 (24), Nov 6 (16), Nov 7 (15), Nov 8 (10), Nov 9 (3). That is 9 of 14 days with activity. Nov 5 to Nov 8 is bunched: 65 of 84 prompts. The Herd repo's commits fall on Nov 4 (5), Nov 5 (17), Nov 6 (22), Nov 7 (23) and Nov 9 (1). The course repo's Oct 29 to Oct 31 commits are all MySI work from before the switch to Herd.

Most of the Nov 5 to Nov 8 prompts are written specs and QA briefs handed to other agents (S-numbered build specs, QA briefs, security-fix specs), not back-and-forth chat.

## Where you got stuck

Taken from the session prompts and Herd's git log and task board:

1. **Getting two real machines to sync.** The two-gateway milestone was due Nov 5 and passed Nov 6, one day late. The task board says the background sync loop had lost its secret scope and never synced on its own. A fix was merged and the two-Mac exchange then worked in both directions.
2. **QA and fix loops on the @mention autocomplete and the peer-link work (PRs #16, #19, #21).** Across Nov 5 and Nov 6, QA briefs were run against each PR, bugs went back to build agents, and #19 was merged without some fixes and followed up by #36. It ended with all of them on `main`.
3. **Security review findings and the catalog PR.** On Nov 7 five security findings were closed (S-19 to S-24, PR #56), including a peer key leaking on redirect. You closed the catalog PR the same day to make further changes. It had not been reopened as of this review.

## What took the most time

By prompt volume: the build-spec and QA-brief delegation on Nov 5 to Nov 7 (65 of the 84 prompts in the window), covering the S-8 to S-24 feature and fix specs plus the QA rounds against them. Session durations are not available from the scan. In the course repo the earlier part of the window (Oct 28 to Nov 2) was MySI work and a few unrelated chats.

## Axis

**Agentic Workflow.** The work was directing a team of agents: written specs, per-task worktrees, QA agents briefed against each PR, and a shared task board. Application Architecture (the plugin's sync and security design) was a close second.

## Against your plan

**Goal was:** Build Herd, a Hermes Agent plugin that makes Hermes multiplayer, and enter it in the Nous Research Hermes Agent plugin hackathon.

Two real Macs exchanged messages through the plugin in both directions on Nov 6, and the code is public at the planned URL. The three hackathon deliverables (catalog PR, X video, entry form) were not complete as of this review: the catalog PR is closed, and no X post or entry form is found. The deadline is Nov 11, 5:00 PM EST. The plan file's "code freeze target Nov 8" is out of date, since the freeze was cancelled on Nov 7, and the plan's Changes line records only the Nov 4 switch.

---

## Your retro

*The builder's own answers, recorded word for word.*

**Did you hit the goal?** yes

I hit the goal because I successfully built the Hermes agent plugin to the hackathon specifications. I have two Mac Hermes instances, separate Mac instances that are communicating with each other inside of one shared room with agents, with a demo video on X.

**What did the report show you?** The report showed that I got stuck on QA and fix loops, security review findings, and catalog PR, but I thought those were just routine fixings, so I wouldn't necessarily get stuck on those which was surprising

**If the plan changed, why?** Yeah, basically, I switched from MySI to testing, to building Herd, because Herd was a way higher ROI to switch to during this sprint. It was just a 1-week-long hackathon with a grand prize total of $20,000, and MySI can wait for sprint 5. The November 8th coase-free was canceled on November 7th because it was never meant to be a hard deadline. That was just what one of the agents said, and I just corrected that.

**Actual difficulty:** I think the difficulty was a 4. It took a lot of compute. I had to upgrade to the $100 plan, and it took a lot of context switching to manage all the agents building the software. It took a lot of vision and taste to make it feel right and work well. I had to learn a lot about agent runtimes, Hermes instances, and plugin architecture.

**What will you change next sprint?** Next sprint, I want to be more in the weeds with the agents and checking the work versus just trusting what the project manager agent told me.
