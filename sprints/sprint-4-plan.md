# Sprint 4 Plan

**Goal:** A person who isn't family sets up MySI on their own, runs their own tests, and leaves with one winner they can act on in the app they already use. Three people do this.

**Why this:** Right now the MCP needs to work well on its first capability. If I can close the core loop, I can keep building features from there. If I can get that core loop in front of people, I can validate it and continue building from there. I would rather have a good MVP of the core loop validated first than keep building other parts of it.

**Done looks like:**
- **The result is actionable.** Every run ends with one winner, the best model in the person's own app, and a short instruction snippet built from their own criteria. Checked by running a real test on the live engine.
- **The judge fix is checked.** `npm run eval:judges` passes on the interview 06 cases (the em-dash rule and the ASCII-art math answer).
- **Three people outside my household use it.** Each one connects and finishes a run with 2 or more tests, with no help beyond the link and the connect prompt. Any intervention is logged and means the run doesn't count as no-help. Each is recorded and written up as an anonymized interview in `discovery/interviews/`. At least one uses ChatGPT or Gemini, not Claude.
- **For each person I can answer:** did they finish unassisted; did their blind picks differ by task; what would they do with the result (switch, change a setting, or ignore it); would they pay or come back.
- **The write-up is done.** `insights.md` is updated, and a decision record says what I do next (router, tiebreaker change, or a different direction). `README.md` and `AGENTS.md` match what exists.

**Caveats:**
- Three users shows where setup breaks and whether the result is usable. It does not show whether people want it.
- Recruiting is the likeliest slip, so I name the three people, or the channel I'll use to find them, by the end of week one.
- Re-running a person's tests on a new model is deferred to a later sprint.

**Predicted difficulty:** 3
