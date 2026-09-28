#!/usr/bin/env python3
"""
minimal_harness.py — a ~100-line agent harness, bash as the only tool.

Modeled on the design of mini-swe-agent (Princeton/Stanford, MIT):
  - no tool-calling API needed: the model emits a ```bash block, we run it
  - completely linear history: the trajectory IS the message list
  - every action is an independent `subprocess.run` (sandbox-friendly)

The four load-bearing parts of any harness are all here and clearly separated:
  1. LOOP                 -> run()
  2. CONTEXT ASSEMBLY     -> build_messages()
  3. ACTION SPACE (tools) -> run_command()
  4. FEEDBACK / EXIT      -> the observation we append, and the completion sentinel

Run it:
  export HARNESS_API_KEY=...           # any OpenAI-compatible key
  export HARNESS_BASE_URL=https://api.x.ai/v1   # optional (default: OpenAI)
  export HARNESS_MODEL=grok-4.6                 # optional
  python3 minimal_harness.py "list the python files here and count the lines"

Offline self-test (no network, no key):
  python3 minimal_harness.py --selftest
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.request

# --------------------------------------------------------------------------
# 1. ACTION SPACE — the only tool: bash
# --------------------------------------------------------------------------
COMMAND_RE = re.compile(r"```bash\s*\n(.*?)```", re.DOTALL)

# The sentinel the model must echo to declare victory. A harness without an
# exit condition burns tokens forever; this is the cheapest one that works.
DONE = "COMPLETE_TASK_AND_SUBMIT_FINAL_OUTPUT"


def run_command(command: str, timeout: int = 30) -> str:
    """No shell session is kept between steps: each action is independent.
    That is what makes swapping in `docker exec` (sandboxing) a one-liner."""
    try:
        p = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=timeout
        )
        out = (p.stdout or "") + (p.stderr or "")
    except subprocess.TimeoutExpired:
        return f"[timeout after {timeout}s]"
    return out.strip() or "[no output]"


# --------------------------------------------------------------------------
# 2. CONTEXT ASSEMBLY — the system prompt is the harness's real source code
# --------------------------------------------------------------------------
SYSTEM = f"""You are a helpful assistant operating in a bash shell.

You act by writing exactly one action per reply, in this format:

```bash
your command here
```

Rules:
- One command block per reply. Nothing else is executed.
- The output of your command is shown to you as the next message.
- When the task is finished, run: echo {DONE}
- Never invent command output. Wait for the observation."""


def build_messages(task: str, messages: list[dict]) -> list[dict]:
    """Context = system prompt + the linear history. In a harness this
    function is where compaction, retrieval and memory get injected —
    which is exactly the code Meta-Harness rewrites around a fixed model."""
    history = messages or [{"role": "user", "content": task}]
    return [{"role": "system", "content": SYSTEM}, *history]


# --------------------------------------------------------------------------
# 3. THE MODEL CALL — swap providers freely; the harness doesn't care
# --------------------------------------------------------------------------
def call_model(messages: list[dict]) -> str:
    base = os.environ.get("HARNESS_BASE_URL", "https://api.openai.com/v1")
    model = os.environ.get("HARNESS_MODEL", "gpt-4o-mini")
    key = os.environ.get("HARNESS_API_KEY")
    if not key:
        sys.exit("Set HARNESS_API_KEY (and optionally HARNESS_BASE_URL / HARNESS_MODEL).")
    req = urllib.request.Request(
        f"{base.rstrip('/')}/chat/completions",
        data=json.dumps({"model": model, "messages": messages, "temperature": 0}).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)["choices"][0]["message"]["content"]


# --------------------------------------------------------------------------
# 4. THE LOOP
# --------------------------------------------------------------------------
def run(task: str, model=call_model, max_steps: int = 25, verbose: bool = True) -> str:
    messages: list[dict] = []
    for step in range(1, max_steps + 1):
        reply = model(build_messages(task, messages))
        messages.append({"role": "assistant", "content": reply})

        m = COMMAND_RE.search(reply)
        if not m:
            messages.append({"role": "user", "content":
                             "No ```bash block found. Reply with exactly one bash command."})
            continue

        command = m.group(1).strip()
        if verbose:
            print(f"\n\033[1mstep {step}\033[0m $ {command}")
        observation = run_command(command)
        if verbose:
            print(observation[:2000])

        # EXIT CONDITION: the sentinel came back as an *observation*, so it is
        # real execution output and not something the model merely claimed.
        if DONE in observation:
            return observation
        messages.append({"role": "user", "content": f"<output>\n{observation}\n</output>"})
    return "[max steps reached]"


# --------------------------------------------------------------------------
# OFFLINE SELF-TEST — proves the loop, the parser and the exit condition work
# --------------------------------------------------------------------------
def selftest() -> None:
    replies = iter([
        "I'll look around first.\n```bash\nls -1 /etc | head -3\n```",
        "Counting now.\n```bash\necho total=$(ls -1 /etc | wc -l)\n```",
        f"Done.\n```bash\necho {DONE}\n```",
    ])
    seen = []

    def stub(messages):
        seen.append(len(messages))
        return next(replies)

    out = run("count entries in /etc", model=stub, verbose=True)
    assert DONE in out, out
    assert len(seen) == 3, f"expected 3 model calls, got {len(seen)}"
    # context grows linearly: [system, task] then +2 per step, never reordered
    assert seen == [2, 3, 5], seen
    print("\nOK: loop, bash action, linear history and exit condition all verified.")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
    elif len(sys.argv) > 1:
        print(run(" ".join(a for a in sys.argv[1:] if a != "--selftest")))
    else:
        sys.exit(__doc__)
