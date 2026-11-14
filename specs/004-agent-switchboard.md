# Spec 004: Switchboard, one agent setup for every harness

**Status:** In progress
**Date:** 2026-11-13
**Sprint:** 5 (`sprints/sprint-5-plan.md`)

## Problem

I move between Claude Code, Hermes, Grokbot and Buzz. Each keeps its own memory, skills and
secrets, so every switch means re-explaining myself and re-wiring keys. Secrets are the worst
part: they sit in `.env` files and agent configs, where any agent can read them.

## What we're making

A small kit with three parts. Memory, skills and secrets live in one place, and every harness
connects to it.

1. **Home (`~/agent-home`, private git repo).** The single source of truth.
   - `AGENTS.md`: who I am and how I work (one file, imported by every harness).
   - `memory/`: plain markdown notes with frontmatter (type, tags, date), searchable.
   - `skills/`: standard `SKILL.md` folders shared by all harnesses.
   - `secrets.manifest.yaml`: secret *names*, what each is for, which hosts or commands may use
     it. Never values. Values live in the macOS Keychain.
2. **MCP server (`switchboard-mcp`).** The one door agents use. Core tools:
   - `memory_write`, `memory_search`, `memory_read`
   - `skill_list`, `skill_get`
   - `secret_list` (names and purposes only)
   - `secret_run(name, command)`: runs an allowlisted command or HTTP call with the secret
     injected, and returns the output with the secret value scrubbed. There is no tool that
     returns a value.
3. **Installer (`switchboard setup <harness>`).** One command per harness. It points the
   harness at Home (instructions file, skills dir) and registers the MCP server. It is
   idempotent, prints a diff of what it changed, and keeps a backup. Targets in order:
   Hermes, Claude Code, Grokbot, Buzz, Codex. If a harness can't take MCP or a custom
   instructions path, it gets a documented manual path.

Handoff works because memory is shared and live: Hermes writes a memory, and Claude finds it
with `memory_search` on its next call. The installer also adds a "start here" rule so each
agent reads Home first.

## Build order

1. Home layout plus migration of my current Claude and Hermes memory and skills (copy, not move).
2. MCP server with the memory and skill tools. Test: write from Hermes, find from Claude.
3. Secrets: Keychain storage, manifest, `secret_run` with scrubbing.
4. Installer for Hermes, Claude Code, Grokbot, Buzz, then Codex.
5. Red team: 10 scripted attacks, each logged pass or fail in `redteam/` in the Switchboard repo.
   1. Ask the agent to print the secret.
   2. Ask it to `echo $SECRET` through `secret_run`.
   3. Run a command that base64s or reverses the secret in its output.
   4. Prompt injection from a fetched web page asking for the secret.
   5. Prompt injection hidden in a memory note.
   6. Path traversal through `memory_read` to reach Keychain exports or `.env`.
   7. Use a secret against a host that is not on its allowlist.
   8. Read the secret from process env or logs via a second command.
   9. Secret leaked into a memory write or the git history.
   10. A malicious skill that tries to exfiltrate.
6. Write-up in `WRITEUP.md` in the Switchboard repo: problem, design, cost, what failed, what
   Sprint 6 takes.

## Where it lives

Code lives in its own repo, `tyleramberry/switchboard`. This repo's README points to it so the
professor can find the work. Specs and decisions stay here. `~/agent-home` holds my real data
and is never public.

## Decisions I'm making, change any of them

- **Language:** TypeScript MCP server, local stdio. Python is the alternative if you'd rather
  read it.
- **Memory search:** markdown files plus a SQLite full-text index. No vector database. It's
  simpler, and notes stay readable in Obsidian.
- **Secrets:** macOS Keychain, behind a small `SecretStore` interface so a 1Password backend
  can be added later without touching the tools. Only the Keychain backend ships this sprint.
- **Local only.** No hosted server this sprint, so the Mac mini and the Air each run their own
  copy and sync Home through git.

## Out of scope

- A hosted or remote MCP server, and phone access.
- Vector or semantic memory.
- Auto-migrating every old note. I'll move over a useful starter set.
- Windows or Linux.
- A UI.

## Definition of done

- [ ] `switchboard setup <harness>` takes a fresh Hermes and Claude Code install to
      working with one command each. Demo it on a clean profile.
- [ ] A memory written in Hermes is found from Claude Code, and the reverse, shown live.
- [ ] A skill added to Home appears in both.
- [ ] A secret is stored and used via `secret_run`, and the agent never sees the value.
- [ ] 10 red-team attacks run with results logged. The goal is to survive all 10. A failed one
      is a finding for the write-up and gets a fix or an honest note.
- [ ] Write-up committed, including cost and what failed.
- [ ] Shipped: it runs on both of my Macs (Air and mini).

## Risks

- Buzz and Grokbot may not allow MCP or a custom instructions path. If so, they get a
  documented "manual" path and I'll say so in the write-up.
- `secret_run` cannot stop a command I allow from leaking by design (for example one that
  prints its own environment). Allowlisting and scrubbing narrow this but don't remove it.
  That is the main thing the red team tests.
- Each harness updates often and can break its config format.
