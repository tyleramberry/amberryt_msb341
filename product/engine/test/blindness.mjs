// Leak scanner for the blindness guarantee (spec 001: no model name, judge score, cost, latency
// or label map in any tool result or the /r/ page before get_results).
// Usage in tool tests: assertBlind(JSON.stringify(result)) or assertBlind(pageHtml).

export const MODEL_WORDS = [
  "gpt", "openai", "chatgpt", "o1", "o3", "claude", "anthropic", "haiku", "sonnet", "opus",
  "gemini", "google", "llama", "meta", "mistral", "qwen", "deepseek", "grok", "xai", "kimi",
  "openrouter",
];

// Field names and shapes that mean judge scores, cost or latency leaked.
const LEAK_PATTERNS = [
  [/"(judge|judges|judgments?|second_opinion|overall|criteria_scores)"\s*:/i, "judge data field"],
  [/"(cost|cost_usd|latency|latency_ms|tokens?_(in|out)|labels?_map|label_map|model|models|lineup_ids)"\s*:/i, "model/cost/latency field"],
  [/\$\s?\d+\.\d{2,}/, "dollar amount"],
  [/\b\d+(\.\d+)?\s?(ms|seconds? to answer)\b/i, "latency figure"],
  [/\b[A-D]\s*(=|->|→|was)\s*(gpt|claude|gemini|llama|haiku|sonnet|opus)/i, "label-to-model mapping"],
];

// Returns a list of problems; empty means clean. `allow` lists words that may appear, e.g. the
// lineup by company is allowed in run_models results but never tied to a label.
export function findLeaks(text, { allow = [] } = {}) {
  const problems = [];
  const lower = text.toLowerCase();
  for (const w of MODEL_WORDS) {
    if (allow.includes(w)) continue;
    if (new RegExp(`(^|[^a-z0-9])${w}([^a-z0-9]|$)`).test(lower)) problems.push(`model word "${w}"`);
  }
  for (const [re, label] of LEAK_PATTERNS) if (re.test(text)) problems.push(label);
  return problems;
}

import assert from "node:assert/strict";
export function assertBlind(text, opts) {
  const p = findLeaks(text, opts);
  assert.deepEqual(p, [], `blindness leak(s): ${p.join(", ")}`);
}
