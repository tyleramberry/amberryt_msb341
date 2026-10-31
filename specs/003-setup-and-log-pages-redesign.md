# Spec 003: Redesign the setup page and the owner's log

**Status:** Draft (design done, build next)
**Date:** 2026-10-31

Mockups (open in a browser, both themes, phone and desktop):
- Setup page ("the prompt page"): `product/design/pages/setup.html`
- Owner's log ("the log page"): `product/design/pages/log.html` (`#run` shows one run)

## Problem

MySI has two web pages a person or Tyler looks at outside the chat app, and both are plain
system-font pages built for function in Sprint 3:

1. **The setup page** at `/` (`setupPage` in `product/engine/src/page.ts`). It's the first thing
   a stranger sees, and the button on it copies the connect prompt. Sprint 4 needs three
   non-family people to set MySI up on their own from just the link. Today the page explains
   *how* to connect but never sells *why*, so a cold visitor has no reason to do the
   riskiest step (connector setup, spec 002 Step 0).
2. **The owner's log** at `/admin` and `/admin/runs/<id>` (`product/engine/src/admin.ts`). Tyler
   reads it after every session. It's one wide table and a long scroll per run, so the
   questions he actually asks are slow to answer: who's stuck, did their picks differ by model, and
   did the judges agree with the person (decision 009).

Tyler, 2026-10-31: "completely revamped… super AI-native, super sick… super enticing."

## What we're making

A shared visual system and a full redesign of both pages. Same routes, same data, same
server-rendered HTML in the Worker. No framework, no build step.

### Visual system (both pages)

- **Dark-first** "lab at night", with a full light theme through `prefers-color-scheme`. Tokens
  are in the `:root` block of each mockup. Copy them into `STYLE` in `page.ts` as-is.
- **Three hues are the only color.** Periwinkle, salmon and mint. On the setup page they are the
  blind labels A, B and C. On the log, where names are shown, they follow the company: OpenAI
  periwinkle, Anthropic salmon, Google mint, anyone else violet (`--other`). Semantic colors
  (ok, warn, bad) only mark state.
- **Type:** Bricolage Grotesque (display, headings only), Geist (body), Geist Mono (labels,
  numbers, the things you'd type). Google Fonts, one `<link>`, with system fallbacks so the page
  is fine if the fonts don't load. This is a new external load, not an npm dependency. If Tyler
  says no, the system stack alone still works.
- **The one bold thing:** the setup button sits inside a slowly turning A/B/C ring with a soft
  glow. Nothing else on either page animates on its own except the hero demo and the "running"
  pulse.
- `prefers-reduced-motion`: the ring, pulse and cursor stop and the demo shows its final state.

### Setup page (`/`)

Order, top to bottom:

1. **Top bar:** three-dot MySI wordmark, "Early prototype" tag.
2. **Hero, two columns** (stacks on phones, button first):
   - Eyebrow "Your own model benchmark". H1 **"Find the AI that's best at *your* work."**
     (the word "your" in the A→B→C gradient).
   - Lead: "Leaderboards test math olympiads. MySI tests the things you actually ask AI to do,
     runs them on three top models from three different companies, and lets you pick the best
     answers blind. You leave with one winner."
   - The button, text exactly **"Get my MySI link"** (a test matches it). Under it: "Copies one
     message. Paste it into your chat app and it sets MySI up for you, or walks you through it in
     about a minute." Then plain chips: Claude, ChatGPT, Gemini.
   - **Right column, the live blind test.** One example task as a chat bubble, then three answer
     cards A, B, C that stream in word by word at different speeds with a blinking cursor. Then
     "Which one would you send?", a "Your pick" badge lands on one card, and the reveal fills in the
     model names. It loops through three example tasks (texting, a spreadsheet formula, a
     4th-grade warm-up), and **a different model wins each one**. That's the pitch: the best model
     depends on your work. Dots under it jump to an example. Labelled "Example blind test".
3. **Copied state** (replaces the button in place after the clipboard write): "Copied. Now paste
   it into your chat app." and a 3-step tracker. Step 1 is done (your link is on your clipboard,
   keep it private), step 2 is paste and send, step 3 is "Start a new chat and say *Find my best
   AI model*". A faded preview of the prompt with the key blurred, and "Copy again" (needs the
   prompt kept in memory from the `/link` JSON; never write it into the page source).
4. **"Three steps, all inside your chat app"**: a real sequence, so it's numbered. Tell it what
   you use AI for, three models answer blind, you pick and it names a winner. Each step has a
   colored rule (A, B, C). Fill in the model names from `LINEUP`, don't hard-code them.
5. **"Why not just check a leaderboard?"**: two cards, public leaderboard vs your MySI benchmark.
6. **"What you leave with"**: an example result card (winner, "In ChatGPT, use…" line,
   instruction snippet, picks-by-model bars), clearly marked "Example result". It mirrors what
   `resultsPage` really returns (decision 009 plus the Sprint 4 snippet).
7. **"Adding it to your app"**: tabs for Claude, ChatGPT and Gemini. **All three panels stay in
   the HTML** (hidden ones use `hidden`), each starting `<strong>App:</strong>` and built from
   `APP_STEPS`, because `mcp.test.mjs` checks for each app's steps, "Developer mode" and
   "Connected Apps". Under the tabs, the first thing to say, including the Gemini `@MySI` form.
8. **Footer:** the existing privacy lines, unchanged in meaning.

States to build:
- **Default:** as above.
- **Copied:** after a successful `ClipboardItem` write (keep today's Safari-safe promise trick).
- **No JavaScript or clipboard refused:** the form still posts to `/link`, and the server renders
  the page with the copied card showing the full prompt in a read-only textarea and a Copy button
  ("This page won't show it again."). No personal link in the default page's source (a test
  checks this).
- **Never link to `/admin`** from this page (a test checks this).

### Owner's log (`/admin`)

1. **Top bar:** wordmark plus "Owner's log", buttons "All runs" and "Download all as JSON"
   (`/admin/export.json`).
2. **Heading** "Every benchmark, live", then "Newest first. Times in UTC."
3. **Summary strip** (computed on the server from the same dumps): Runs (and how many running
   now), Finished, Tasks rated (rated / total), Spend (and per run). Then the wide cell:
   **their best picks by model** as a stacked bar with a legend, and **"Judges' top answer
   matched their pick on X of Y tasks"**. A task counts when it's rated and has judge scores.
   The judges' top answer is the label with the highest mean `overall`, and ties count as no match.
4. **Filter chips with counts:** All, Running, Waiting on picks, Finished, Draft, Failed, plus a
   label search. Client-side only: rows carry `data-status` and `data-label`, and a small script
   hides the ones that don't match. Without JS everything shows.
5. **Run rows** (each row is a link to the run): started time (mono), label with "in <app>" under
   it, a status pill (running pulses), a rated bar with one segment per task plus "n of m rated",
   their winner with a company color swatch, run on (OpenRouter or Claude plan), cost. On phones
   the row becomes a 2-column card. Keep the label text and `/admin/runs/<id>` hrefs in the HTML
   (admin.test checks them).

"Waiting on picks" means status is running or stopped, no tests are still being answered, and
at least one is `ready_to_rate`. Use whatever `RunView` states exist. Don't add new ones.

### One run (`/admin/runs/<id>`)

1. Breadcrumb "← All runs". H1 = label. A sub line with started time, how long it took (if
   finished), and the app. Chips: status pill, the lineup with company swatches, cost. On the
   right, "Their winner" big.
2. **Two columns:** tasks on the left, a sticky **timeline** on the right (stacks under the
   tasks on narrow screens). Timeline dots: grey for setup, green for the engine doing work, red for
   errors, solid for the person's own actions (ratings). It's built from `d.events`.
3. **Each task card:**
   - "Task n · category · status", and on the right an **agreement badge**: "Judges agreed"
     (ok) or "Judges picked B, they picked C" (warn). No badge before rating.
   - Title. "What they'd type" as a chat bubble. Criteria as small chips. Context stays in a
     `<details>`.
   - **Their pick** block: best and worst by model name, where they rated it (page or chat), and
     their note as a quote. Keep the words "their best" (admin.test matches them).
   - **Answers** in three columns: company swatch plus model name, the blind label, latency and
     cost, **one bar per judge** with the score, then the answer body clamped to about 6 lines
     with "Show all". Best gets a solid green border and a "their best" ribbon, worst a dashed red
     border and a "their worst" ribbon.
   - Errors (model or judge) as a red outlined callout, saying what it cost: "Scored by 1 of 2
     judges".

## Build notes

- Keep `shell()`, `esc()` and `markdown()`. Split `STYLE` into a base (tokens, type, buttons)
  shared by all pages, plus page-level CSS. The **rating and results pages pick up the new
  tokens for free.** Restyling them beyond that is out of scope here, but they must still look
  right with the new tokens (check both).
- The mockup's demo script is self-contained. Ship it inline on `/`. It needs no data.
- Mockups use example data. Everything on `/admin` comes from `RunDump`. No new storage.
- Don't put real names in example copy (the mockups use none).
- Tests that must keep passing: `mcp.test.mjs` "setup page" block, `admin.test.mjs`. Add one
  test that the summary strip's agreement line appears once a run has a rating and judge scores.

## Out of scope

- The rating page (`/r/<id>`) and results page layouts (they only inherit tokens).
- Any change to the connect prompt text, the tools, or the routes.
- Logos or brand marks for Claude, ChatGPT or Gemini (plain text chips only).
- Analytics or tracking on the setup page.
- A public, shareable results page.

## Definition of done

- [ ] `/` and `/admin` match the mockups in dark and light, at 390px and 1280px, with no
      sideways scroll.
- [ ] The button still copies the prompt in one click on Chrome and Safari, and the no-JS post
      to `/link` still shows the prompt.
- [ ] `npm run typecheck` and `npm run test:all` pass, plus the new agreement test.
- [ ] Deployed, and Tyler has opened both live pages.
- [ ] Usage check: in the three Sprint 4 sessions, note whether the person read past the hero
      before pressing the button (intervention log).
