// Deterministic checks on drafted test tasks (coaching notes) and on model answers (scrubbing).
// No model calls here: the host model turns a note into one follow-up question.

import type { Test } from "./bench.ts";

export type CoachingNote = { test_id: string | null; kind: string; note: string; ask: string };

// specs/001-benchmark-engine-mcp.md, "save_tests: validation and coaching" and "Limits and cost".
// Default size, decided 2026-10-25: 3 test tasks on 3 models. LIMITS are the hard caps.
export const DEFAULT_TESTS = 3;

export const LIMITS = {
  maxTests: 10,
  minModels: 3,
  maxModels: 5,
  maxCriteria: 7,
  title: 80,
  prompt: 4000,
  context: 8000,
  criterion: 200,
};

const VAGUE = /^(good|great|nice|clear|helpful|professional|accurate|correct|well[- ]written|high[- ]quality|useful|better|perfect|ok|fine)\.?$/i;
const NEEDS_CONTEXT =
  /\b(this|the|my|attached|below|following|pasted|above)\s+(email|e-mail|message|text|list|notes?|document|doc|article|reading|report|draft|spreadsheet|transcript|thread|letter|essay|paper|chart|data)\b/i;
const FILE_ANSWER =
  /\b(web ?page|website|landing page|html|spreadsheet|slide ?deck|slides|powerpoint|presentation|pdf|word doc(ument)?|interactive|infographic|diagram)\b|\b(write|build|make|create|code)\s+(me\s+)?(an?\s+|the\s+)?(app|program|code)\b/i;

export function coach(tests: Test[]): CoachingNote[] {
  const notes: CoachingNote[] = [];
  for (const t of tests) {
    const add = (kind: string, note: string, ask: string) => notes.push({ test_id: t.id, kind, note, ask });
    const vague = t.criteria.filter((c) => VAGUE.test(c.trim()));
    if (vague.length) {
      add(
        "vague_criteria",
        `"${vague[0]}" is hard to check. Ask what it means to them.`,
        `What would make it feel ${vague[0].toLowerCase().replace(/\.$/, "")} to you? Shorter? A certain tone?`,
      );
    }
    if (t.criteria.length < 2) {
      add("few_criteria", "Fewer than 2 things a great answer gets right.", "What would annoy you about a bad answer?");
    }
    if (!t.context.trim() && NEEDS_CONTEXT.test(t.prompt)) {
      add("missing_context", "The task mentions material that isn't in context.", "Can you paste that in? The AIs will need it.");
    }
    if (FILE_ANSWER.test(t.prompt)) {
      add(
        "file_mode",
        "The answer may need to be a file (web page, deck, code). Only chat-sized answers are supported for now.",
        "That one needs a file as the answer. Could we make a version whose answer fits in a chat?",
      );
    }
  }
  if (tests.length >= 3 && new Set(tests.map((t) => t.category.toLowerCase())).size === 1) {
    notes.push({
      test_id: null,
      kind: "one_category",
      note: "Every task is the same kind of work.",
      ask: "Is there a different kind of thing you use AI for, like planning or explaining?",
    });
  }
  return notes;
}

// Backstop for what the host missed: email addresses and phone numbers become [email] and
// [phone]. Names can't be caught by pattern; the interview guide asks the host to remove them.
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?<![\w])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}(?![\w])/g;

export function scrubPersonalInfo(text: string): { text: string; found: string[] } {
  const found: string[] = [];
  const out = text
    .replace(EMAIL, () => (found.push("email address"), "[email]"))
    .replace(PHONE, () => (found.push("phone number"), "[phone]"));
  return { text: out, found };
}

// Model names an answer might use to identify itself, as [brand, pattern]. A brand the person
// named in their own task is kept, so "compare ChatGPT and Gemini" still reads right.
const SELF_ID: [string, string][] = [
  ["chatgpt", "ChatGPT"],
  ["gpt", "GPT-?\\d+(?:\\.\\d+)?(?:[- ]?(?:mini|nano|pro|turbo|sol|luna))*"],
  ["openai", "OpenAI"],
  ["claude", "Claude(?: (?:Opus|Sonnet|Haiku|Fable))?(?: \\d+(?:\\.\\d+)?)?"],
  ["anthropic", "Anthropic"],
  ["gemini", "Gemini(?: \\d+(?:\\.\\d+)?)?(?: (?:Pro|Flash|Ultra|Argon))?"],
  ["deepmind", "Google DeepMind"],
  ["llama", "Llama[- ]?\\d+(?:\\.\\d+)?(?: (?:Maverick|Scout|Behemoth))?"],
  ["meta ai", "Meta AI"],
  ["grok", "Grok(?: \\d+)?"],
  ["xai", "xAI"],
  ["mistral", "Mistral(?: AI)?"],
  ["le chat", "Le Chat"],
  ["deepseek", "DeepSeek(?:[- ]?V?\\d+(?:\\.\\d+)?)?"],
  ["qwen", "Qwen\\d*(?:\\.\\d+)?"],
  ["kimi", "Kimi[- ]K\\d+"],
  ["moonshot", "Moonshot AI"],
];

export const REMOVED = "[model name removed]";

export function scrubSelfId(answer: string, taskText: string): string {
  const task = taskText.toLowerCase();
  let out = answer;
  for (const [brand, pattern] of SELF_ID) {
    if (task.includes(brand)) continue;
    out = out.replace(new RegExp(`\\b${pattern}\\b`, "gi"), REMOVED);
  }
  return out;
}
