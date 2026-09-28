# Agent Harness Atlas

Competitive research on five open-source agent harnesses, done 2026-09-23 to learn what a
domain-specific harness needs.

- **Interactive version:** https://claude.ai/artifact/LHGVVjivGEtS3wvdo65P6N
- **Source file:** [`agent-harness-comp.html`](agent-harness-comp.html) (open locally in a browser)

## The five

| Harness | What it is | Repo |
|---|---|---|
| Codex | OpenAI's coding agent (Rust, Apache-2.0) | https://github.com/openai/codex |
| OpenCode | Coding agent built as a server, works with any model provider (TS, MIT) | https://github.com/anomalyco/opencode |
| Hermes Agent | Personal agent that learns from its own work (Python, MIT) | https://github.com/NousResearch/hermes-agent |
| OpenClaw | Personal assistant you reach from chat apps (TS, MIT) | https://github.com/openclaw/openclaw |
| Pi | Minimal coding agent you extend yourself (TS, MIT) | https://github.com/badlogic/pi-mono |

## What all five share (the core you can't skip)

1. The agent loop, where the model calls tools and gets the results back
2. Four basic tools: read, write, edit, bash
3. Project instructions in AGENTS.md
4. Skills that load only when needed (SKILL.md)
5. Sessions saved to disk that can be resumed
6. Context compaction (summarizing old turns when the context fills up)
7. Slash commands / prompt templates
8. A headless mode for running from scripts or other apps
9. Streaming output that you can interrupt mid-run

## What only some of them do

- **Codex:** OS-level sandbox (Seatbelt/Landlock); can run as an MCP server; `codex exec` for CI.
- **OpenCode:** client/server split; code errors from a language server (LSP) sent back to the model after each edit; 75+ providers.
- **Hermes:** writes its own skills after tasks and improves them; searches across past sessions; 7 places to run commands (local, Docker, cloud).
- **OpenClaw:** gateway to 20+ chat apps; SOUL.md / USER.md / MEMORY.md persona files; heartbeat and cron.
- **Pi:** 4 tools, a system prompt under 1k tokens, branching sessions; leaves out MCP, subagents and permission prompts on purpose.

## Suggested build order

Agent loop + tools → context files → sessions + compaction → provider layer → skills →
headless mode → approvals/sandbox → hooks/extensions → MCP + subagents → memory/channels/schedule.

Caveat: based on READMEs and docs as of 2026-09-23. These projects release weekly.
