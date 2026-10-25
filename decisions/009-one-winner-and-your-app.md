# Decision 009: One winner (ties break on cost and speed), plus the best model in your own app

**Date:** 2026-10-25
**Status:** Active

## Context

The first outside user's run (`discovery/interviews/2026-10-24-interview-06.md`) ended in a
three-way tie: each model was her best on one test and her worst on another, or second twice. She
was left "stuck". She won't switch apps per task, though switching models inside one app is fine.
Tyler added that when two answers are about equally good, the faster and cheaper one should win.
Claude Sonnet 4.5 was the fastest and cheapest on both tests and would have won the tie.

## Options considered

1. **Ties stay ties (the old rule)**: honest, but leaves the person with no answer. That is the
   one thing she asked for.
2. **Break ties with the judge**: the judges disagreed with her on the math test (they scored the
   ASCII graph highest, and she ranked it last), and V1 shows only her picks.
3. **Break ties on cost and speed**: cost and time are measured, not judged, and they matter to
   her and to Tyler. Rule: each model's cost per answer and median time, as a multiple of the
   cheapest and the fastest, summed, with lower winning. The headline says why it won the tie.
4. **Fold cost and speed into the score itself**: this would let a cheap model beat one she
   clearly preferred, and her picks should come first.

For "one app": (a) ask which app she uses during the interview, (b) have the host pass `app` to
`get_results`, falling back to the client's name, or (c) build a router now.

## Decision

Option 3. Her picks rank first. Exact ties go to the cheaper, faster model, so there is always
one winner, and the table shows time and cost. For the app, option (b): `get_results` takes
`app` (claude, chatgpt or gemini) and adds `in_your_app`. That says whether the winner runs in
her app and, if not, names the best model that does and where it ranked. The host already knows
which app it is, so she isn't asked one more question. A router stays the long-term answer
(AGENTS.md, next scope).

The deciding reason: she needs an answer she can act on without leaving her app. That answer has
to come from things that were measured, not from a judge she disagreed with.

## What would change our mind

People pick the tie-broken winner and later say it was wrong for them. Or near-ties (not just
exact ones) turn out to be common enough that a margin is needed. Or most people use an app that
can run any model, which makes `in_your_app` moot.
