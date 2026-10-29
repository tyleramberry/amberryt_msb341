// Text the engine sends: to the host model (next_step), to the person (message_for_person),
// and to the tested models and judges. UX source: specs/002-harness-ux.md appendix.
// Model and judge prompts are ported from .claude/skills/personal-bench/SKILL.md steps 4 and 5.

import type { Test } from "./bench.ts";

export const SERVER_INSTRUCTIONS =
  "MySI finds which AI model is best for this person's own work. Follow each tool result's " +
  'next_step. Talk in plain words: "test task", not "eval". Never reveal or guess which model ' +
  "wrote an answer before the person has rated it, and show answers word for word.";

// Added to the server instructions only when the client says it's Claude Code (spec 002,
// "Optional mode: use my Claude Code plan").
export const CLAUDE_CODE_INSTRUCTIONS =
  " You are Claude Code, so MySI can also run on the person's own Claude plan. After the person " +
  'confirms the test tasks, ask once: "Want to run this on your own Claude plan? It\'s free for MySI ' +
  "and uses your usage limits, but it can only test Claude models (Haiku, Sonnet, Opus). Or I can use " +
  'MySI\'s lineup, one model each from OpenAI, Google and Anthropic." If they pick their plan, call ' +
  'run_models with runner: "claude_code", then follow get_run_plan.';

export const RUN_PLAN_NEXT_STEP = `Run the slots one test at a time, in order. For each test, launch that test's sub-agents together in
one message with the Agent tool (subagent_type "general-purpose", model = the slot's model,
run_in_background false), each with its slot's prompt exactly. When they finish, call submit_answers
with each slot_id, the answer text exactly as returned (strip only indentation the harness added),
and duration_ms from the usage block. If a sub-agent errors or uses a tool, retry it once; if it
fails again, send that slot with error instead of text. After the first test's answers are in, the
person can start rating: tell them, offer the rating page, and keep running the rest.
Don't comment on the answers or say which model wrote which.`;

export const INTRO =
  "Here's how this works. We'll talk for about 5 minutes about the work you use AI for, and I'll " +
  "turn it into 3 test tasks. Then {n} AI models from different companies each try every task. " +
  "You pick the best and worst answers without knowing which AI wrote them, and at the end you " +
  "see which one is best for *your* work. About 15 minutes in all. Ready?";

export const INTERVIEW_GUIDE = `You are running MySI's interview. Goal: 3 test tasks taken from real work this person does
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

After each task, call save_tests with the full set so far. Each test: category, title (3-6
words), prompt (what they would type, in their voice), context (pasted material or ""),
criteria (2-5 checkable statements in their words). The engine numbers them t1, t2, ... in the
order you send them. Turn at most one coaching note into a follow-up question.

After the first task, show it as a card and say: "That's one test task. Two more like
that."

When there are 3 tasks (more only if they ask to add some), or they say they're done, show
every task as a card and ask:
"Anything to add, cut or change?" Apply edits, call save_tests, show all cards again, and repeat
until they say it's good. Only then call run_models with person_confirmed: true.`;

export const CARD_FORMAT =
  "Show each task as a card in plain Markdown:\n" +
  "**Task <n> · <Category> · <Title>**\n*What you'd type:* \"<prompt>\"\n*A great answer:*\n- <criterion>\n- ...";

export const ANSWERS_NEXT_STEP = `Show the task title and what they'd type. Then show each answer under its heading (Answer A,
Answer B, ...) exactly as given: do not summarize, shorten, reformat, rank or comment on them.
Then ask: "Which is best, and which is worst? (e.g. 'B best, C worst'). Anything you noticed is
welcome too." If this is the first task, also offer the side-by-side page link once.
Do not say or guess which AI wrote which answer. If asked, say it's revealed at the end.
When they answer, call submit_rating.`;

export const RESULTS_NEXT_STEP = `Say the headline first, then in_your_app if it is set. Show the ranking table. If the winner
differs by kind of work, say so in one sentence. Then reveal, task by task, which AI wrote the answer they picked as best. Then the
trust lines.
Then "Use it in your app": say "Pick use_model in this app." Show instruction_snippet exactly as given, in a code block, and say
snippet_where. Don't rewrite the snippet. Then the report link.
Then ask: "Want me to remember this?" If yes, and you have a memory feature, save memory_line.
If not, offer memory_line for them to copy. Finish with: "When a new model comes out, I can
re-run your test on it. Just ask."`;

// Same prompt for every tested model: the skill's "plain assistant" prompt, minus tool rules.
export const MODEL_SYSTEM =
  "You are being tested as a plain assistant. Answer the task below directly, with nothing " +
  "before or after the answer. If something is unclear, make a reasonable assumption rather than asking.";

// Claude Code plan mode (spec 002): the host runs each model as a sub-agent, with the skill's
// step 4 prompt exactly.
export function subagentPrompt(t: Test) {
  return (
    "You are being tested as a plain assistant. Do not use any tools. Answer the task below directly\n" +
    "as your final message, with nothing before or after the answer. If something is unclear, make a\n" +
    "reasonable assumption rather than asking.\n\n" +
    modelPrompt(t)
  );
}

export const CLAUDE_CODE_CAVEAT =
  "Claude Code plan mode: Claude models only. Each answer also carried Claude Code's own setup " +
  "instructions, so this tests the models inside Claude Code, not on their own.";

export function modelPrompt(t: Test) {
  return `TASK:\n${t.prompt}\n\nCONTEXT:\n${t.context.trim() || "None"}`;
}

// Counted, not judged, so a judge can't miss them: models skim past em dashes and length.
export function answerFacts(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const dashes = (text.match(/\u2014/g) ?? []).length;
  return `(${words} words, ${dashes} em dash${dashes === 1 ? "" : "es"} "\u2014")`;
}

export function judgePrompt(t: Test, answers: [label: string, text: string][]) {
  return [
    "You are grading answers to a task for a specific person. The answers are labelled by letter " +
      "and their order is random; ignore order, and judge only against the person's criteria, in the " +
      "person's own meaning, not by what you think makes a good answer in general.",
    "A criterion that says what to avoid (for example \"no em dashes\", \"not too long\", \"no big words\") " +
      "is a hard rule: an answer that breaks it scores 1 on that criterion and at most 5 overall. " +
      "Each answer's word and em dash counts are given; trust them over your own reading.",
    "",
    `TASK:\n${t.prompt}`,
    "",
    `CONTEXT:\n${t.context.trim() || "None"}`,
    "",
    "THE PERSON'S CRITERIA:",
    ...t.criteria.map((c, i) => `${i + 1}. ${c}`),
    "",
    ...answers.flatMap(([label, text]) => [`RESPONSE ${label} ${answerFacts(text)}:\n${text}`, ""]),
    "Return only JSON, no prose around it:",
    '[{"label": "A", "criteria_scores": [<1-5 per criterion, in order>], "overall": <1-10>,',
    '  "reason": "<one sentence>"}, ...]',
  ].join("\n");
}

export const TASK_IDEAS = [
  { kind: "writing", ask: "Is there an email or text you send often that you'd like to get right faster?" },
  { kind: "writing", ask: "Have you had to write something awkward lately, like saying no or asking for money?" },
  { kind: "planning", ask: "What's something coming up that needs a plan: a week, a trip, an event, a project?" },
  { kind: "explaining", ask: "Is there something you had to explain to someone recently, or wanted explained to you?" },
  { kind: "research", ask: "What did you last look up or compare before deciding something?" },
  { kind: "summarizing", ask: "Is there something long you had to read and pull the main points out of?" },
  { kind: "ideas", ask: "Where do you get stuck coming up with ideas: names, gifts, meals, posts?" },
];
