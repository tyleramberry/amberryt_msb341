# Spec 002: MySI user experience inside the person's chat app

**Status:** Draft for review
**Date:** 2026-10-22
**Goes with:** the engine spec ([001](001-benchmark-engine-mcp.md)), [decision 006](../decisions/006-pivot-to-personal-benchmark.md)

## The one-line goal

Someone who has never heard the word "eval" opens the chat app they already use, says "find my
best AI model", and about 15 minutes later knows which model to use for their kind of work,
because they picked the best answers themselves without knowing who wrote them.

## The design constraint that shapes everything

MySI has no app UI of its own. It lives inside someone else's harness (Claude.ai, Claude Desktop,
ChatGPT, Claude Code, Cursor). That means:

1. **The host model is our front end.** It does the talking. We steer it only through tool
   descriptions, server instructions, and the text our tool results return. Every tool result
   therefore carries a `next_step` for the host: what to say and what to call next.
2. **Tools are the only thing every harness supports.** Prompts (slash commands), resources and
   inline UI widgets are supported unevenly. The whole flow must work with tools alone. Prompts,
   resources and the widget are shortcuts layered on top, never required.
3. **Tool calls are short.** Hosts give up on a tool call after roughly a minute, and the host can't
   wake itself up later. Long work runs in the background, and the flow has to give the person
   something to do (rating) while it runs.
4. **The host model is one of the contestants.** It must never see which model wrote which
   answer until the person has rated, and it must show answers word for word without commenting.
5. **We can't see the person.** No analytics on their screen. The engine logs every tool call
   and the gaps between them, so we can see where people stall.

## Vocabulary (what the person sees)

| Internal | What the host says to the person |
|---|---|
| eval | test task |
| criteria | what a great answer gets right |
| eval set | your test |
| run | a benchmark |
| judge | (not shown to the person in v1) |
| model | AI model (by brand name only at the reveal) |

The person never sees "eval", "judge model", "OpenRouter", "run ID" or JSON.

## The journey, end to end

```
0 Connect ──► 1 Kick off ──► 2 Interview ──► 3 Confirm test ──► 4 Models run
                                                                    │ (background, ~3–5 min)
                                                                    ▼
          7 Next time ◄── 6 Results + remember ◄── 5 Blind rating (starts as soon as task 1 is ready)
```

### Step 0: Connect (one time, the riskiest step)

The setup page (the Worker's `/`) is where a person starts. It already exists for `ping`.
Changes:

- **Rename to MySI** everywhere the person sees it (page, server name, connector name).
- **Give each person their own connector URL**, `https://<host>/mcp/u/<key>`, created when they
  click "Get my link". The key is long and random. This is how MySI remembers them across chats
  without accounts or OAuth (see "Identity" below).
- Steps per harness with screenshots: Claude.ai/Desktop, ChatGPT (developer mode), Claude Code
  (`claude mcp add --transport http mysi <url>`), Cursor (`mcp.json` snippet).
- **The first sentence to type is printed on the page**: "Find my best AI model." Tell them to
  click **Always allow** when the chat app asks permission for MySI's tools, or they'll get a
  permission pop-up on every step.
- The `ping` tool stays, renamed `check_connection`, and its result says: "MySI is connected.
  When you're ready, say *find my best AI model*."

What we watch: did they reach `check_connection` or `start_benchmark` at all. Decision 006 says
if Tyler's wife can't do this alone, the hosted page becomes the main way in.

### Step 1: Kick off

The person says something like "find my best AI model", "which AI should I use", or picks the
**Find my best AI model** prompt from the app's menu where prompts are supported. The host calls
`start_benchmark`.

The tool result gives the host the intro to say (three short lines, from the skill's step 1):

> Here's how this works. We'll talk for about 5 minutes about the work you use AI for, and I'll
> turn it into 3 test tasks. Then 3 AI models from different companies each try every task.
> You pick the best and worst answers without knowing which AI wrote them, and at the end you
> see which one is best for *your* work. About 15 minutes in all. Ready?

If the person has an unfinished benchmark, `start_benchmark` says so and the host offers to
pick up where they left off instead.

### Step 2: The interview (the host runs it; the engine coaches)

The interview rules are ported from the skill's step 2 and returned in full by `start_benchmark`
(exact text in the appendix). The key moves for a novice:

1. **Start from their life, not from AI.** "What do you use AI for now, or what would you hand
   off if you could?" If they say "I don't really use it", ask about their week: "What did you
   write, plan or figure out this week that took longer than it should have?"
2. **One real example per thing they name.** "What's a recent time you did that? What did you
   ask, or what would you have asked?"
3. **Their standard, in their words.** "If the answer were perfect, what would it get right?
   What would annoy you?" These become the criteria.
4. **Context.** Ask them to paste the email, list, or notes the task needs. The host strips
   names, emails and phone numbers and says it did.
5. **Show the first task back early.** After the first task is written, show it as a card (below)
   and say "That's one test task. Two more like that." This is the moment the person
   learns what an eval is, by seeing their own.
6. **Running dry.** Offer a variation on one they gave ("same kind of email, but a harder
   situation?"). If they still have nothing, call `get_task_ideas` with what we know about them
   (role, what they've named) and offer two or three ideas as questions, never as tasks they
   didn't choose.

The host saves drafts as it goes by calling `save_tests` after each new task. That way a closed
tab doesn't lose the interview, and the engine can coach while it's happening: `save_tests`
returns **coaching notes** on each task, which the host turns into one follow-up question.

| Engine notices | Host asks |
|---|---|
| A criterion is vague ("good", "professional", "helpful") | "What would make it feel professional to you? Shorter? A certain tone?" |
| The prompt mentions an attachment, email or list, but `context` is empty | "Can you paste that email in? The AIs will need it." |
| Fewer than 2 criteria | "What would annoy you about a bad answer?" |
| All tasks are in one category | "Is there a different kind of thing you use AI for, like planning or explaining?" |
| Looks like a name, email or phone number | (strips it, says so) |
| Answer would be a file (web page, long doc, code) | "That one needs a file as the answer. For now let's keep to answers that fit in a chat." (file mode is out of scope) |

Each note is a suggestion. The host asks one question at a time, never a list.

### Step 3: Confirm the test

The host shows the whole test as cards and asks "Anything to add, cut or change?" It repeats
until the person says it's good. This is the only confirmation. Card format, in plain Markdown
so it renders in every app:

> **Task 2 · Writing · Reschedule a client**
> *What you'd type:* "Write a quick text to a client moving Thursday's mowing to Friday because
> of rain."
> *A great answer:*
> - Under 50 words
> - Says Friday and a time window, not "later this week"
> - Sounds friendly, not corporate

When the person says yes, the host calls `run_models` with `person_confirmed: true`. The engine
refuses to run without it.

### Step 4: The models run

`run_models` starts the job and returns at once with:

- the lineup by company ("one model each from OpenAI, Google and Anthropic"), so the person
  knows it's a fair fight. Model names stay hidden until the reveal.
- an estimate ("about 3 minutes") and the cost cap.
- `next_step`: tell the person what's happening, then call `check_run`.

**Rating starts before running ends.** The engine runs tasks in order, so task 1's answers are
usually ready within 30 seconds. `check_run` lists which tasks are ready to rate. As soon as one
is, the host starts step 5 on it. The person reads and picks while the rest finish, so there is
no dead wait. If nothing is ready yet, the host says one line ("Task 1 of 3 is running") and the
person says "check" or "ok" to continue. The host never loops on `check_run` more than 3 times
in one turn.

### Step 5: Blind rating (in the chat, with a page as backup)

Blind rating is the product. It has three paths, in order of preference; the engine records the
same rating whichever is used.

**A. Inline widget (where the harness supports MCP Apps).** `get_answers` points at a
`ui://mysi/rate` resource. The widget shows the task, the answers as A/B/C/D side by side (stacked
on phone), and two taps: best, worst. It submits through `submit_rating` itself. The host only
sees "rated", never the mapping.

**B. In the chat (works everywhere).** `get_answers` returns the task and the answers as text,
with strict display rules in `next_step`:

- Show the task title and prompt, then each answer under **Answer A**, **Answer B**, ... exactly
  as returned. No summarizing, trimming, reformatting, or comments on quality.
- Then ask: "Which is best, and which is worst? (e.g. *B best, C worst*). Anything you noticed
  is welcome too."
- Don't guess or hint which AI wrote which. If asked, say it's revealed at the end.

The person replies "C best, A worst, A was way too long" and the host calls `submit_rating` with
`best: "C", worst: "A", note: "A was way too long"`. If they pick the same letter for both, or
only one, the host asks again. "They're all fine" is allowed: the host records best only and
notes it.

**C. The rating page (`/r/<runId>`).** Every `get_answers` result also includes the page link.
The host offers it once, at the first task: "If it's easier to compare side by side, open this
page." Best on phone, and for long answers. Ratings made there show up in the chat flow, because
`check_run` reports them.

**Keeping it blind:**
- Labels are shuffled per task by the ported `bench.py` logic. The engine never returns the
  label-to-model mapping before that task is rated.
- The engine scrubs self-identification from answers before showing them ("As ChatGPT...", "I'm
  Claude", "Gemini here") and replaces it with "[model name removed]".
- The person never sees judge scores (v1 shows only their own picks), so nothing can sway them.
- Answers longer than ~400 words: the chat shows them in full, and the host suggests the page.

**Fatigue.** The default is 3 tasks × 3 answers, 9 answers to read. The host says how many are left ("Task 2
of 3") and the person can stop any time: "That's enough, show me results" calls `get_results`,
which ranks on whatever was rated.

### Step 6: Results, the reveal, and remembering the winner

`get_results` returns:

1. **The headline**, one sentence: "For your work, **GPT-x** came out on top: you picked it as
   best on 2 of 3 tasks."
2. **The ranking table** (ported `report.md`, trimmed for chat): rank, model, your score, your
   best-picks. No judge column.
3. **By kind of work**, only if it differs: "For writing, Claude won. For planning, Gemini won."
4. **The reveal**: for each task, which model wrote the answer they picked as best. This is the
   fun part; the host gives it its own moment.
5. **How much to trust it**, one or two lines, not the full caveat list: number of tasks, and
   "small gaps may be luck".
6. **The report link** (`/r/<runId>`), which keeps the full table.

Then **remembering**, in three layers:

- **MySI remembers (automatic).** The result is saved to their profile under their personal key:
  winner overall and per category. `which_model` returns it in any later chat.
- **The chat app remembers (asked).** `get_results` returns a one-line note, for example *"For
  writing tasks, I do best with GPT-x; for planning, Gemini 2.x (MySI benchmark, Oct 2026)."* The
  host asks "Want me to remember that?" and, if yes, saves it with the app's own memory where
  the app has one. The host doesn't save without asking.
- **The person remembers (offered).** The same line, ready to paste into custom instructions or a
  note.

Last line from the host: "When a new model comes out, I can re-run your test on it. Just ask."
(Re-runs are next scope; until then `rerun_test` says it's coming soon and records the interest.)

### Step 7: Next time

In a later chat, any of these work:

- "Which AI should I use for this?" → `which_model` with a short description of the task. Returns
  the winner for the closest category, or "you haven't tested this kind of work yet; want to add
  a test task?"
- "Continue my benchmark" → `start_benchmark` finds the unfinished run and resumes at the right
  step.
- "Show my results" → `which_model` lists past benchmarks with report links.
- "Add a task to my test" → `start_benchmark` with `from_run`, which copies the old test so they
  only add the new task.

## Tools, prompts and resources

### Tools

All names are snake_case verbs. Every result has `message_for_person` (optional, plain words) and
`next_step` (instructions for the host), plus the data. Read-only tools set `readOnlyHint: true`
so ChatGPT and Claude ask fewer permission questions.

| Tool | When the host calls it | Inputs | Returns | Read-only |
|---|---|---|---|---|
| `check_connection` | Person says "test MySI" | — | connected message, first sentence to say | yes |
| `start_benchmark` | Person wants to find their best model, or resume | `label?`, `from_run?` | `run_id`, intro text, interview guide, or resume state | no |
| `get_task_ideas` | Person runs dry in the interview | `about_person` (role, tasks named so far) | 3–5 idea prompts to *ask about* | yes |
| `save_tests` | After each task drafted, and after each edit | `run_id`, `tests[]` (full set, replaces previous) | normalized cards, coaching notes per task, count, `ready_to_confirm` | no |
| `run_models` | Person confirmed the test | `run_id`, `person_confirmed: true` | lineup by company, ETA, cost cap | no |
| `check_run` | After `run_models`, and when the person says "check" | `run_id` | per-task status (running, ready to rate, rated), what to do next | yes |
| `get_answers` | A task is ready to rate | `run_id`, `test_id?` (omitted = next one ready to rate) | task, blind answers A–C (more if the lineup is larger), display rules, page link, widget ref | yes |
| `submit_rating` | Person picked best and worst | `run_id`, `test_id`, `best`, `worst?`, `note?` | saved, next task ready or not | no |
| `get_results` | All rated, or the person asks to stop | `run_id` | headline, table, by-category, reveal, trust lines, memory line, report link. Reveals all labels and closes rating on the run, since rating after a reveal is not blind | no |
| `which_model` | Later chats: "which AI for this?", "my results" | `task_description?` | best model for that kind of work, past benchmarks | yes |
| `rerun_test` | "Test the new model on my stuff" | `run_id`, `model?` | Sprint 3: "coming soon", records interest | no |
| `get_run_plan` | Claude Code plan mode only, after the person confirmed the test | `run_id` | one slot per test × model: `slot_id`, `model` (haiku, sonnet, opus), exact prompt to send | yes |
| `submit_answers` | Claude Code plan mode only, after each test's sub-agents finish | `run_id`, `answers[]` (`slot_id`, `text`, `duration_ms`) | saved, which tests are ready to rate | no |

Changes from the first engine draft (`bench-mcp.md`): adds `check_connection` (renamed `ping`),
`get_task_ideas`, `get_answers`, `submit_rating`, `which_model`, `rerun_test` (stub). `save_tests`
now accepts drafts and returns coaching notes.

**Tool descriptions matter more than anything else here**, because they're how the host decides
to call us at all. Example for `start_benchmark`:

> Start MySI, a personal AI benchmark. Call this when the person wants to know which AI model is
> best for their own work, asks "which AI should I use", "find my best model", "benchmark AI for
> me", or wants to continue a benchmark. Returns how to explain MySI and the interview guide to
> follow. Do not write test tasks before calling this.

### Server instructions

Sent at connect time (Claude Code and some apps show these to the model; others ignore them, so
nothing critical lives only here):

> MySI finds which AI model is best for this person's own work. Follow each tool result's
> `next_step`. Talk in plain words: "test task", not "eval". Never reveal or guess which model
> wrote an answer before the person has rated it, and show answers word for word.

### Prompts (shortcuts where the app shows them)

| Prompt | Shows as | Does |
|---|---|---|
| `find_my_best_model` | "Find my best AI model" | Calls `start_benchmark` and begins the interview |
| `rate_my_answers` | "Rate my answers" | Resumes rating on the open benchmark |
| `which_ai_for_this` | "Which AI should I use for this?" | Takes a task description, calls `which_model` |

### Resources

| Resource | Purpose |
|---|---|
| `ui://mysi/rate` | The inline rating widget (MCP Apps). Optional path A. |
| `ui://mysi/results` | Inline results card with the reveal. Optional. |
| `mysi://guide/interview` | The interview guide, for apps that let people attach resources |
| `mysi://runs/{run_id}/report` | The report as Markdown |

## Harness notes

| | Claude.ai / Desktop | ChatGPT (developer mode) | Claude Code | Cursor |
|---|---|---|---|---|
| Add connector | Settings → Connectors → Add custom | Settings → Apps → Developer mode → Create | `claude mcp add --transport http` | `mcp.json` |
| Tools | yes | yes | yes | yes |
| Prompts | yes ("+" menu) | treat as no | yes (`/mcp__mysi__...`) | yes |
| Inline widget | check (MCP Apps) | check (Apps SDK / MCP Apps) | no, use chat or page | no |
| Memory for the winner | Claude memory, if on | ChatGPT memory, if on | offer a line for `CLAUDE.md` | offer a Cursor rule |
| Run on own subscription | no | no | yes, Claude models only (see "Optional mode") | no |
| Target user? | **yes, primary** | yes | builders | builders |

"check" means the build thread should confirm support at build time; the flow doesn't depend
on it.

## Optional mode: use my Claude Code plan

**Decided 2026-10-25.** For builders who open MySI inside Claude Code and want to test on their
own Claude subscription instead of MySI's API key. MySI's hosted server can't spend the chat
app's usage, and a subscription login must never be put into the server (Anthropic's terms don't
allow subscription credentials in other apps). So in this mode **Claude Code runs the models
itself** with sub-agents, the way the `/personal-bench` skill does today, and MySI does
everything else: saving the test, shuffling, rating, results and remembering.

**When it's offered.** Only when the client identifies itself as Claude Code (the `clientInfo`
name sent when it connects). After the test is confirmed, the host asks once:

> Want to run this on your own Claude plan? It's free for MySI and uses your usage limits, but it
> can only test Claude models (Haiku, Sonnet, Opus). Or I can use MySI's lineup, one model each
> from OpenAI, Google and Anthropic.

Everywhere else, the mode doesn't exist and the person never hears about it.

**How it runs.**
1. The host calls `run_models` with `runner: "claude_code"` (and `person_confirmed: true`). The
   engine makes no model calls and returns `next_step` pointing to `get_run_plan`.
2. `get_run_plan` returns one slot per test × model: an opaque `slot_id`, the `model` alias for
   the Agent tool, and the exact "plain assistant" prompt from the skill's step 4.
3. For each test, the host launches that test's three sub-agents together, in parallel, then calls
   `submit_answers` with each answer's text, exactly as returned, and its `duration_ms`. One call
   per test, so a failure partway through loses nothing and rating can start after test 1.
4. From here it is the normal flow: `check_run`, `get_answers`, `submit_rating`, `get_results`.

**Keeping it as blind as possible.** The host launched the sub-agents, so it has seen which model
wrote what. That can't be fixed in this mode, only reduced:
- `get_answers` still shuffles labels on the server, and the `next_step` says not to refer to
  any earlier tool output when showing them.
- The host offers the rating page (`/r/<runId>`) first rather than as a backup, because the page
  hides the order from the chat entirely.
- The results say plainly: "Claude Code plan mode: Claude models only. Each answer also carried
  Claude Code's own setup instructions, so this tests the models inside Claude Code, not on
  their own."

**What it is for.** A free way for builders to try MySI, and the path that eventually replaces
the `/personal-bench` skill. It is not the main product: it can't compare vendors, which is the
point of MySI. `which_model` stores its result like any other, tagged with the mode.

## Identity (needed to remember the winner)

Decided 2026-10-25: option 1, the personal connector URL
([decision 008](../decisions/008-identity-personal-connector-url.md)). Sprint 3 has no accounts. Options were:

1. **Personal connector URL** (`/mcp/u/<key>`), made on the setup page. Recommended: nothing to
   type, works in every harness, and the key never appears in chat. Losing the URL means losing
   the profile, and anyone with it sees their results, the same trade-off the run link already
   makes.
2. **A short code the person says** ("my MySI code is blue-otter-42"). Works with one shared URL,
   but the person has to keep it and the host sees it.
3. **OAuth.** Right answer later; too much for Sprint 3.

## Lineup and judge (what the person experiences)

- 3 models, one each from OpenAI, Google and Anthropic, picked by MySI for Sprint 3 (no choosing; that's a builder feature).
  The lineup is in config so the next scope (new model re-runs) is a config change.
- **Decided 2026-10-25: the person sees only their own picks.** The ranking is theirs alone. The
  engine may still run the judge in the background and store its scores, so Tyler can check
  whether the judge agrees with people (the decision 006 risk), but no tool result, page or report
  shown to the person includes them.

## Edge cases

| Situation | What happens |
|---|---|
| Person closes the chat mid-interview | Drafts are saved. "Continue my benchmark" resumes with the cards shown back. |
| A model call fails twice | That task shows the answers that came back (min 2). The results note it. |
| Person wants to add a task after running | Allowed: `save_tests` + `run_models` again on just the new task. |
| Person pastes something private | Host strips names/emails/phones; engine flags any it still finds. |
| Person asks "which one is Claude?" during rating | "That's revealed at the end so it doesn't sway you." |
| Host summarizes answers instead of showing them | Engine can't stop it; the page link is the safety net. Watch for it in testing. |
| Person rates nothing and asks for results | No ranking yet: "Rate at least one task and I'll show you how the models did." |
| Cost cap hit | `run_models` refuses with a plain message; max 10 tasks × 5 models per run. |

## What to measure in the wife test

Log per tool call with timestamps. Then, by hand afterwards:

- Did she connect alone? How long?
- Minutes in interview; number of tasks; how many coaching notes fired.
- Did she understand what a test task was after the first card? (ask her)
- Did she rate in chat, widget or page?
- Did the host ever break blindness or summarize answers?
- Did she pick a winner she'd actually use? Did she save it to memory?

## Open questions for Tyler

1. ~~Identity~~ Decided 2026-10-25: personal connector URL (decision 008).
2. ~~Default size~~ Decided 2026-10-25: 3 test tasks and 3 models by default. A person can add more tasks (up to
   the cap of 10) for a steadier ranking; the results say that 3 tasks is a rough first read.
3. ~~Second opinion~~ Decided 2026-10-25: only the person's picks show. See "Lineup and judge".

## Appendix: text the tools return

### `start_benchmark` → interview guide (`next_step`)

```
You are running MySI's interview. Goal: 3 test tasks taken from real work this person does
or would hand to an AI, across 2 or 3 kinds of work (for example writing, planning, research,
explaining).

Say the intro in message_for_person, then ask the first question.

Rules:
- One question at a time. Short replies. No lists of questions.
- Start broad: "What do you use AI for now, or wish you could hand off?" If they don't use AI
  much, ask what they wrote, planned or figured out this week that took too long.
- For each thing they name, ask for one real example: "What's a recent time you did that? What
  did you ask, or what would you have asked?"
- For each example, ask what a great answer gets right and what would annoy them. Use their words
  as the criteria.
- Ask for any context the task needs (a pasted email, list, notes). Remove names, emails and
  phone numbers, and tell them you did.
- If they correct you, apply the correction.
- If something is unclear, ask a short question instead of guessing.
- Never invent a task, detail or criterion they didn't give you.
- If they run dry before 3 tasks, offer a variation on one they gave. If still stuck, call
  get_task_ideas and offer ideas as questions.
- Say "test task", never "eval". Say "what a great answer gets right", never "criteria".
- Answers must fit in a chat. If a task needs a file as its answer (web page, long document,
  code), say that's not supported yet and ask for a chat-sized version.

After each task, call save_tests with the full set so far. Each test: id (t1, t2...),
category, title (3-6 words), prompt (what they would type, in their voice), context (pasted
material or ""), criteria (2-5 checkable statements in their words). Turn at most one coaching
note into a follow-up question.

After the first task, show it as a card and say: "That's one test task. Two more like
that."

When there are 3 tasks (more only if they ask to add some), or they say they're done, show
every task as a card and ask:
"Anything to add, cut or change?" Apply edits, call save_tests, show all cards again, and repeat
until they say it's good. Only then call run_models with person_confirmed: true.
```

### `get_answers` → display rules (`next_step`)

```
Show the task title and what they'd type. Then show each answer under its heading (Answer A,
Answer B, ...) exactly as given: do not summarize, shorten, reformat, rank or comment on them.
Then ask: "Which is best, and which is worst? (e.g. 'B best, C worst'). Anything you noticed is
welcome too." If this is the first task, also offer the side-by-side page link once.
Do not say or guess which AI wrote which answer. If asked, say it's revealed at the end.
When they answer, call submit_rating.
```

### `get_results` → (`next_step`)

```
Say the headline first. Show the ranking table. If the winner differs by kind of work, say so in
one sentence. Then reveal, task by task, which AI wrote the answer they picked as best. Then the
trust lines, then the report link.
Then ask: "Want me to remember this?" If yes, and you have a memory feature, save memory_line.
If not, offer memory_line for them to copy. Finish with: "When a new model comes out, I can
re-run your test on it. Just ask."
```
