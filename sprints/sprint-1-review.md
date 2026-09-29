# Sprint 1 Review

**Window:** 2026-09-16 22:17 MT (plan commit) to 2026-09-28 21:09 MT
**Sessions reviewed:** 203 sessions across 2 projects (0 sessions excluded at your request). About 30 of the 192 prompts in the window were this sprint's work; the rest were other school, work, and personal tasks run from the same folders. Hermes Agent was checked separately: 12 conversations in the window, none containing harness research. The only sprint-related one (Sep 28) checked the GitHub repo connection and started a sprint review that you then asked to have undone; the rest were coursework and Hermes setup.

## When you worked

6 days active out of 12: 2 recorded in Claude Code and git, plus 4 you reported for reading and listening outside Claude. The recorded work was one long push at the end. The learning you reported was spread across the first 9 days.

- **Sep 18 to 19 (reported):** read the DAIR.AI *Harness Engineering* paper collection. This is where you learned the basic architecture of a harness.
- **Sep 21 (reported):** listened to the *Thoughtworks Technology Podcast*, "What is harness engineering?" You learned what harness engineering is as a field.
- **Sep 23 to 24 (recorded):** two short Claude Code sessions. You asked where to learn harness engineering, then kicked off the competitive research on Codex, OpenCode, Hermes, OpenClaw, and Pi.
- **Sep 25 (reported):** listened to *Fragmented*, "Harness Engineering - the hard part of AI coding." You learned what makes a harness good.
- **Sep 28, about 14:00 to 21:00 MT (recorded):** every commit in the sprint landed here (11 commits). That covered the research write-ups, the agent instructions file, PRD, MVP spec, three decision records, the Homeroom name, and a v0 app.

The repo went 12 days with nothing committed after the plan, so none of the reading shows up in git until Sep 28.

## Where you got stuck

1. **Which folder is the repo.** Three look-alike folders on the Desktop ("amberryt 341", "msb 341", and "harness research") left it unclear whether the research and the sprint plan were in the repo that's on GitHub. It took several prompts to sort out and ended with you approving a cleanup.
2. **Supabase setup.** You asked whether Supabase was connected, ran the setup command, checked again, and later got stuck on a Mac password (keychain) prompt during the Supabase login. It ended with you confirming it was working, and the v0 app was committed with a Supabase database setup file.

## What took the most time

The Sep 28 session, about 7 hours by prompt timestamps, with nearly all of the sprint's prompts. Inside it, the most prompts went to turning the raw notes into polished research files, then the PRD, MVP spec, and decision records. Setup for the app (Supabase, Cloudflare) came next. The research itself on Sep 24 took one long prompt, not an ongoing back-and-forth. The time spent reading and listening on Sep 18 to 25 is not recorded anywhere, so it is not counted here.

## Axis

**Discovery.** Most of the work was research and framing the problem: comparing five existing harnesses, deciding students are the MVP user, scoping the MVP, and naming the product. The v0 app came at the end and took a small share of the time.

## Against your plan

**Goal was:** Learn everything about LLM harnesses, and end the sprint with an MVP spec you can get in front of potential users to validate the idea.

- **Research compiled in markdown:** met. `discovery/research/harnessresearch.md`, `agent-harness-comp.md`, and `harness-notes/` are in the repo.
- **`mvpspec.md`:** met. `specs/mvpspec.md` exists, backed by a PRD and decisions 001 to 003.
- **Read the DAIR.AI harness engineering papers:** reported, not verified. You report reading the collection on Sep 18 to 19. `harness-notes/research/papers.md` lists all 21 papers, but it copies the collection's own notes word for word, so the repo does not yet show your own notes on them.
- **Validate the idea with potential users:** not started. `discovery/interviews/` holds only the template. Decision 002 also reframes Homeroom as a learning and portfolio project rather than a business, which moves away from the plan's validation framing.
- **Beyond the plan:** a v0 web app (chat UI, Supabase, Cloudflare) was committed on the last day.

## Sources

- **Recorded:** Claude Code session logs, Hermes Agent's session database, and the git history of this repo.
- **Reported by you, not independently timestamped:**
  - DAIR.AI Academy, Harness Engineering collection (Sep 18 to 19): https://academy.dair.ai/papers/collections/harness-engineering
  - *Thoughtworks Technology Podcast*, "What is harness engineering?" (Sep 21): https://open.spotify.com/episode/5hokMt4blKtXOFQ31ftvkJ
  - *Fragmented - AI Developer Podcast*, "Harness Engineering - the hard part of AI coding" (Sep 25): https://open.spotify.com/episode/150VMJDqUfLQ9GdhPjZfOO
