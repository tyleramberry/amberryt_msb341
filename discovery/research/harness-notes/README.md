# Agent Harness Engineering — notes & starting kit

Research distilled from the DAIR.AI Academy *Harness Engineering* collection
(21 papers + 51 tools, compiled from YC Paper Club: Harness Edition, 26 Aug 2026).

| File | What it is |
|---|---|
| `harness-notes.html` | The visual notes. Open in a browser, or print to PDF. Nine components table, the 2019→2026 lineage, the minimal loop drawn, language choice, a five-rung build ladder, tool shortlist, traps. |
| `minimal_harness.py` | Runnable reference harness (~150 lines, stdlib only, any OpenAI-compatible provider). Four clearly separated functions: `build_messages`, `call_model`, `run_command`, `run`. |
| `research/papers.md` | All 21 papers in collection order with the collection's own annotations. |
| `research/tools.json` | All 51 tools with category, license, interface, provider support, features, fit, tradeoffs and repo stats. |

## The one-line version

A harness is everything between the model weights and the world, and on identical weights it is
the difference between 30% and 95.5% on ARC-AGI-3. Starve it to the minimum: a loop, a context
builder, one tool, an observation channel, and an exit condition that can only be satisfied by
real execution output.

## Run it

    cd ~/harness-notes
    python3 minimal_harness.py --selftest          # offline, no key needed
    export HARNESS_API_KEY=...
    export HARNESS_BASE_URL=https://api.x.ai/v1   # optional, default is OpenAI
    export HARNESS_MODEL=grok-4.6                 # optional
    python3 minimal_harness.py "count the python files here and their total lines"

The self-test proves the loop, the bash action, linear history growth and the exit condition
without touching the network.

## Where to go next

1. Read `mini-swe-agent` (~100 lines, MIT) end to end — the canonical minimal harness.
2. Rebuild `minimal_harness.py` yourself without looking at it.
3. Add a sandbox (swap `subprocess.run` for `docker exec`), an append-only transcript log, and a cost counter.
4. Build a 10-task eval *before* adding any feature.
5. Add skills, memory and subagents one at a time, re-measuring after each.
