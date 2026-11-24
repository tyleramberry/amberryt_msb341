# Sprint 5 Review

**Window:** 2026-11-11 to 2026-11-23
**Sessions reviewed:** 42 across 3 projects (Claude Code 42, Codex 0; 1081 sessions excluded at your request)
**Active session time:** about 0.0 hours (gaps under 15 minutes)
**Not visible to this review:** Hermes Agent (used for the whole sprint).

## Where the work lives

| Output | Where | Commits in window | Shared with sdmurff |
|---|---|---|---|
| Course repo (this one: plan, spec, README, AGENTS.md) | https://github.com/tyleramberry/amberryt_msb341 | 6 commits (Nov 11, Nov 14, Nov 19, Nov 23) | Yes (private, shared with `sdmurff`) |
| Switchboard (shared memory, skills, secrets, Web UI, Decision Inbox) | https://github.com/tyleramberry/switchboard | 22 commits (Nov 14: 8, Nov 16: 3, Nov 19: 5, Nov 21: 5, Nov 23: 1) | Yes (public) |
| Herd (Sprint 4 plugin, listed in README) | https://github.com/tyleramberry/herd | 1 commit (Nov 12: docs update to Get started) | Yes (public) |
| MySI engine and connector | https://personal-bench.homeroom-app.workers.dev | 0 commits in window | Public |

## When you worked

Commits across `amberryt_msb341` and `switchboard` fell on 6 days out of 12 (Nov 11, Nov 14, Nov 16, Nov 19, Nov 21, Nov 23), with 2 Claude Code prompts and 1 docs commit in `herd` on Nov 12:

- **Nov 11:** 1 commit in `amberryt_msb341` (Sprint 5 plan).
- **Nov 12:** 2 Claude Code prompts (migrating course skills to Hermes); 1 docs commit in `herd`.
- **Nov 14:** 1 commit in `amberryt_msb341` (Spec 004 and README link); 8 commits in `switchboard` (initial TypeScript skeleton, Home layout, MCP server, installers, two-process handoff proof, red-team hardening, first 10-attack red-team pass, initial write-up).
- **Nov 16:** 1 Claude Code prompt (live handoff test); 3 commits in `switchboard` (F1/F2/F3 security fixes, `switchboard pin`, `switchboard doctor`, real-Home install on the MacBook Air, live model-driven handoff evidence).
- **Nov 19:** 2 commits in `amberryt_msb341` (README and AGENTS.md sync); 5 commits in `switchboard` (UI v1 groundwork, localhost API server, vanilla HTML/CSS/JS frontend, UI tests, UI docs).
- **Nov 21:** 5 commits in `switchboard` (SQLite `InboxStore`, zero-MCP `switchboard inbox` CLI, single-card Inbox UI, `switchboard-inbox` skill, nightly memory distillation script).
- **Nov 23:** 2 commits in `amberryt_msb341` (mid-sprint plan updates, Spec 004 DoD check-off, README/AGENTS sync, course skills refresh); 1 commit in `switchboard` (final `WRITEUP.md`).

The work was spread across four focused build days (Nov 14, Nov 16, Nov 19, Nov 21) plus planning on Nov 11 and wrap-up on Nov 23. Note that while `sprint_scan.py` matched 42 Claude Code session files modified on Nov 16, only 3 prompts inside those files occurred in the Sprint 5 window (2 on Nov 12, 1 on Nov 16); the other 166 prompts were from earlier sprints (Oct 12 to Nov 5).

## Where you got stuck

Because the main build work ran in Hermes Agent (not visible to `sprint_scan.py`), this section comes from the git history and red-team records:

1. **Red-team findings F1, F2, and F3 (Nov 14 to Nov 16).** The initial Nov 14 red-team run passed 8 of 10 attacks and exposed unknown encodings under an interpreter allowlist (F1), macOS Keychain ACLs trusting `/usr/bin/security` (F2), and manifest tampering (F3). All three were resolved on Nov 16 by adding rot13 scrubbing and `switchboard doctor` linting, fail-closed manifest pinning (`switchboard pin`), and an ad-hoc-signed Keychain helper binary, bringing the suite to 10 of 10. A same-user residual on the Keychain helper remains documented for Sprint 6.
2. **Moving UI v1 work between Macs (Nov 19).** UI v1 began on the MacBook Air (`WIP: UI v1 groundwork ... from Air session`) before continuing on the Mac mini alongside a fresh Switchboard install, then finished in four commits on Nov 19.
3. **Live-testing the remaining harnesses.** Hermes and Claude Code were installed and verified on both Macs, but Codex and Grokbot installers remained unit-tested on temporary configs only, and Buzz remained a manual path.

## What took the most time

Session durations and prompt volumes from Hermes Agent are not available to the scan, and only 3 Claude Code prompts fell inside the Sprint 5 window. By git commit volume and delivered scope, the bulk of the work was building and hardening `switchboard` (22 commits):

- **Core Home, MCP server, Keychain secrets, and red-team fixes:** 11 commits across Nov 14 and Nov 16.
- **Local Web UI v1 (`switchboard ui`):** 5 commits on Nov 19.
- **Decision Inbox and nightly distillation:** 5 commits on Nov 21.
- **Docs and repo sync:** 1 commit in `switchboard` and 6 commits in `amberryt_msb341`.

## Builder tools you used

The counts below come from `sprint_scan.py` across the 42 confirmed Claude Code session files (note: those files include earlier-sprint turns whose files were touched on Nov 16; Hermes Agent tool usage is not visible to this scan).

| Building block | What it is | What you used this sprint |
|---|---|---|
| Skills you wrote | Custom skills you created outside the course set | `cloudflare:agents-sdk` (1), `personal-bench` (1) |
| Course skills | Skills provided by the class template | `sprint-plan` (3), `eli5` (1), `sprint-review` (1) |
| Plugins | Skills or subagents loaded from a plugin | `cloudflare` (1) |
| Slash commands | Explicit `/command` invocations | `sprint-review` (2), `personal-bench` (1), `sprint-plan` (1) |
| Hooks | Lifecycle hooks that ran or blocked actions | `SessionStart:startup` (5); blocked: none |
| Subagents | Named custom subagents and Claude Code's built-in subagents | Named: none.<br>Built-in: `general-purpose` (26) |
| Messages to other sessions | Direct messages sent to subagents or other sessions | not used |
| Plan mode | Plan tool calls and turns spent in plan mode | not used |
| Permission mode | Permission modes active across turns | `bypassPermissions` (178), `auto` (26) |
| Permission prompts and denials | Prompts approved/declined and calls blocked by rules or safety checks | Approved at a prompt (29), blocked by auto mode (9), blocked by a built-in safety check (1) |
| Where sessions ran | Surfaces where the sessions executed | Claude desktop app (41), non-interactive (`claude -p` or Agent SDK) (1) |
| Worktrees | Git worktrees created for parallel work | not used |
| Memory and instructions | Context files loaded and memory/instruction edits | Loaded: `User: CLAUDE.md` (42), `Project: CLAUDE.md` (41), `Project: AGENTS.md` (37), `AutoMem: MEMORY.md` (18), `User: AGENTS.md` (1). Edited: `MEMORY.md` (2), `merge-prs-autonomously.md` (2), `code-review-model-opus.md` (1), `judge-pool.md` (1) |
| Reaching outside the repo | Service CLIs, MCP servers/connectors, and direct API calls | Service CLIs: `gh` (45), `wrangler` (5), `supabase` (1). MCP servers: `ccd_turn` (136), `mysi` (29), `hearthbot` (21), `Claude_Browser` (19), `claude-code-remote` (15), `ef11be23-b6a3-4afa-851f-abb3a9b0b285` (5), `f1435ec5-1488-45e2-a365-f98c00ad1aeb` (4), `claude-in-chrome` (3), `mcp-registry` (2), `ccd_session_mgmt` (2). Direct API calls: `curl` (34) |

Not used this sprint: named subagents, messages to other sessions, plan mode, worktrees.

Scan version: 2026-10-16

## Users this sprint

No outside users this sprint.

## Learning sessions

None logged this sprint.

No `/learn` sessions were logged this sprint; the sprint's work advanced Application Architecture.

## Axis

**Application Architecture.** Most of the sprint was designing, building, testing, and security-hardening a local MCP server, a macOS Keychain secret store with a signed helper binary, SQLite storage (FTS5 memory and Decision Inbox), and a localhost Web UI with token, Host, Origin, and CSP checks.

## Against your plan

**Goal was:** At the end of this sprint I will have a shared agent setup that works across agents with my memory, skills, and secrets, and that lets me easily set up my own personal agent inside any harness. I will learn about memory, how to store secrets, and some basics of cybersecurity.

The work matches the goal and adds two operational layers on top of it. All five items in "Done looks like" were delivered: `switchboard setup` installs Hermes and Claude Code on both the MacBook Air and Mac mini, live cross-agent handoff ran between Hermes and Claude Code, the 7-tool MCP server passes 92 of 92 tests, the red-team suite passes 10 of 10 attacks after fixing F1, F2, and F3, and `WRITEUP.md` is committed. Documented gaps remain: Codex and Grokbot installers are unit-tested only (not verified on live installs), Buzz is manual, and the Keychain helper has a documented same-user residual deferred to a Sprint 6 1Password CLI backend. Two unplanned additions (the local Web UI and the SQLite Decision Inbox with nightly distillation) were shipped on Nov 19 and Nov 21 and recorded in `sprints/sprint-5-plan.md` on Nov 23.

---

## Your retro

*The builder's own answers, recorded word for word in step 7.*

**Did you hit the goal?** yes my goal was to have a shared agent setup that works across agents with my memory skills and secrets and that lets me easily set it up inside any harness. All that is done. The switchboard is working with memory skills and secrets with a one-line command install

**Hours, your estimate:** 6

**If the plan changed, why?** I actually added an agent request triage inbox to help me filter through walls of text and a web app UI for Switchboard in order to make it more useful and easy for me to use (and because I had a little extra time)

**Actual difficulty:** 3. It was easier than I expected to build and I had more than enough time so I added a couple features. I just found myself spending less time wrestling with agents. I was really trying to do that. I got a lot better at managing my agents and giving them the right amount of autonomy with the right amount of verification to make sure that the products actually worked well. And I think that's why it was easier.

**What will you change next sprint?** Next sprint I'm going to keep trying to work on my agentic management and making sure that I'm not letting agents just build things with no oversight. I think the agent triage inbox inside Switchboard is going to help a lot with this. I'm also going to try to get more outside users using Switchboard. I think it's a very useful tool. I think other people will find it useful, especially people that are moving between multiple different agent platforms or have multiple different agents running on their machine. So I'm going to focus on distribution and user testing next sprint.
