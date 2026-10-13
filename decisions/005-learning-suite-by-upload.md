# Decision 005: Learning Suite courses are covered by upload, not automation

**Date:** 2026-10-12
**Status:** Active

## Context

The MVP spec's context layer (F1) was Canvas-first, with syllabus upload as a fallback. The only
BYU student interviewed keeps four of six courses on Learning Suite, including every course in
their major ([interview 03](../discovery/interviews/2026-10-08-interview-03.md)). Learning Suite has
no student API, so a Canvas-only F1 would miss most of that student's term. The other college
students interviewed are mostly or entirely on Canvas
([01](../discovery/interviews/2026-10-07-interview-01.md),
[04](../discovery/interviews/2026-10-10-interview-04.md),
[05](../discovery/interviews/2026-10-12-interview-05.md)). BYU is phasing out Learning Suite in
favor of Canvas over the coming semesters.

## Options considered

1. **Automate Learning Suite with computer-use (drive the website):** covers BYU courses today /
   fragile, slow, needs the student's BYU login, and the work is thrown away once Learning Suite
   is retired.
2. **Drop Learning Suite courses entirely:** simplest / Homeroom would know only a minority of
   some BYU students' courses, which breaks "it knows your courses."
3. **Manual upload of the syllabus and rubric, as a first-class path next to Canvas:** works
   for any course at any school, no login handling / the student does a few minutes of setup per
   course, and nothing re-syncs on its own.

## Decision

Option 3. Upload is a first-class path, not a fallback, and Canvas stays the main path. The
deciding reason: Learning Suite is being retired, so automating it would be throwaway work, while
upload covers the gap until it closes and also covers schools without Canvas.

## What would change our mind

The Learning Suite retirement slips by more than a year, or students in the next round won't do
the per-course upload. Either one would show up as a low coverage number in F1's done-when.
