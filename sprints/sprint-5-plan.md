# Sprint 5 Plan

**Goal:** At the end of this sprint I will have a shared agent setup that works across agents with my memory, skills, and secrets, and that lets me easily set up my own personal agent inside any harness. I will learn about memory, how to store secrets, and some basics of cybersecurity.

**Why this:** I switch back and forth a lot between agent platforms (Claude, Grokbot, Hermes, and now Buzz are my main ones). I want one setup that works for all of them, plug and play, so my next projects, like finishing MySI or Sundae Planner, are much easier.

**Done looks like:**
- **One command** sets up my agent in any new harness.
- **The handoff works across agents.** I can switch between Hermes and Claude without re-explaining. Both harnesses share memory and skills, live: a memory written by one can be found by the other.
- **Secrets are safe.** My agents store my secrets and can use them, but never read them, and they are not leaked. The setup survives 10 red-team breach attempts.
- **An MCP server** running the core tools.
- **Evidence and write-up:** a short write-up covering the problem, the design, what it cost, what it failed, and what Sprint 6 should take on.

**Predicted difficulty:** 4

## Changes and additions during the sprint

- **Local Web UI (`switchboard ui`, Nov 19 to 20):** originally listed as out of scope in Spec 004, built as a localhost-only vanilla HTML/CSS/JS control panel (per-launch token auth, Host/Origin/CSP guards, dark mode, Cmd+K palette, write-only secrets, dashboard, memory/handoffs/skills/harnesses views, and explicit git commits).
- **Decision Inbox and nightly distillation (Nov 21):** added a SQLite-backed `InboxStore`, zero-MCP `switchboard inbox` CLI (zero extra schema tokens), single-card focus Inbox UI with keyboard shortcuts, dictation, and embed mode, a `switchboard-inbox` skill, and `npm run distill` to turn resolved decisions/overrides into memory rules and flag contradictions.
- **Security hardening beyond baseline:** added `switchboard pin` (fail-closed sha256 manifest pinning), `switchboard doctor` (manifest linter catching unsafe allowlists), and an ad-hoc-signed Keychain helper binary to fix the F2 Keychain ACL finding.
- **Verified on both Macs:** completed a fresh install and verification on the Mac mini (Nov 19 to 20) in addition to the MacBook Air (Nov 16).
