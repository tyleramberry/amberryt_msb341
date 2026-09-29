# Decision 002: Start as a learning and portfolio project

**Date:** 2026-09-28
**Status:** Active

## Context

The README described a harness sold B2B to school organizations. A Sep 28 note repositioned
it as a learning and portfolio project. With students chosen as the user
(`decisions/001-mvp-user.md`), the framing had to be settled because it changes what the MVP
needs: accounts, billing and school approval, or just a working tool real students use.

## Options considered

1. **Learning and portfolio project first**: pros — the goal is learning to build a harness and
   showing it working by Dec 10; no sales, contracts or school IT reviews in the way; free to
   use my own Canvas and courses as the test bed. Cons — no revenue signal; may need rework if
   it later becomes a school product.
2. **B2B product for schools from the start**: pros — a clear buyer and price. Cons — long
   school sales cycles, privacy and procurement reviews, and admin features that don't fit
   in one semester.

## Decision

**Learning and portfolio project first.** Deciding reason: it lets the MVP focus on one loop
(Canvas → tutor → rubric check) that real students can use this semester, with no buyer
requirements added.

Two things carry over from the B2B framing:

- **Teacher approval stays in validation.** The MVP spec keeps interviews with 2 teachers,
  because if teachers would block the tool, students can't use it openly.
- **Workspace files are markdown for the MVP.** Google Docs is later scope.

## What would change our mind

- Students or teachers in validation ask how to buy it for a whole course or department.
- A school or program offers to pilot it.
