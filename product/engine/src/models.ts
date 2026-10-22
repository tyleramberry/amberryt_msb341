// Model calls through OpenRouter's chat completions API, plus a mock for local runs and tests.
// With no OPENROUTER_API_KEY (or MOCK_MODELS = "1") every call is answered by the mock.

export type ModelInfo = { id: string; name: string; company: string };

import type { RegistryObject } from "./registry.ts";
import type { RunObject } from "./run.ts";

export type Env = {
  RUN: DurableObjectNamespace<RunObject>;
  REGISTRY: DurableObjectNamespace<RegistryObject>;
  OPENROUTER_API_KEY?: string;
  MOCK_MODELS?: string;
  LINEUP?: string; // JSON ModelInfo[]
  JUDGE_POOL?: string; // JSON ModelInfo[]
  MAX_RUNS_PER_DAY?: string;
  MAX_RUN_COST_USD?: string;
};

// Defaults if wrangler.jsonc doesn't set LINEUP / JUDGE_POOL. Check the ids against
// https://openrouter.ai/models with `npm run check-models` before a real run.
const DEFAULT_LINEUP: ModelInfo[] = [
  { id: "openai/gpt-5", name: "GPT-5", company: "OpenAI" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", company: "Google" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", company: "Anthropic" },
  { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", company: "Meta" },
];
const DEFAULT_JUDGES: ModelInfo[] = [
  { id: "deepseek/deepseek-chat-v3.1", name: "DeepSeek V3.1", company: "DeepSeek" },
  { id: "mistralai/mistral-medium-3.1", name: "Mistral Medium 3.1", company: "Mistral" },
  { id: "x-ai/grok-4", name: "Grok 4", company: "xAI" },
];

function parseList(raw: string | undefined, fallback: ModelInfo[]): ModelInfo[] {
  if (!raw) return fallback;
  const list = JSON.parse(raw) as ModelInfo[];
  return list.length ? list : fallback;
}

export const lineupFor = (env: Env) => parseList(env.LINEUP, DEFAULT_LINEUP);
export const judgePoolFor = (env: Env) => parseList(env.JUDGE_POOL, DEFAULT_JUDGES);

export const vendorOf = (id: string) => id.split("/")[0];

// A custom model id from run_models: named by its id, company from the vendor prefix.
export function modelFromId(env: Env, id: string): ModelInfo {
  const known = [...lineupFor(env), ...judgePoolFor(env)].find((m) => m.id === id);
  return known ?? { id, name: id.split("/").pop() ?? id, company: vendorOf(id) };
}

// Two judges whose vendors aren't in the lineup, so no model grades its own company's work.
export function pickJudges(env: Env, lineup: ModelInfo[]): ModelInfo[] {
  const vendors = new Set(lineup.map((m) => vendorOf(m.id)));
  return judgePoolFor(env)
    .filter((j) => !vendors.has(vendorOf(j.id)))
    .slice(0, 2);
}

export const isMock = (env: Env) => env.MOCK_MODELS === "1" || !env.OPENROUTER_API_KEY;

export type Completion = {
  text: string;
  duration_ms: number;
  cost: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
};

export async function complete(
  env: Env,
  model: string,
  prompt: string,
  opts: { maxTokens: number; system?: string; timeoutMs?: number },
): Promise<Completion> {
  const started = Date.now();
  if (isMock(env)) return mockComplete(model, prompt, started);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "content-type": "application/json",
      "x-title": "MySI",
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: prompt },
      ],
      max_tokens: opts.maxTokens,
      usage: { include: true },
      // Only providers that don't store or train on prompts: these are people's real tasks.
      provider: { data_collection: "deny" },
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
  });
  const body = (await res.json().catch(() => null)) as any;
  if (!res.ok || !body) {
    throw new Error(`OpenRouter ${res.status}: ${body?.error?.message ?? res.statusText}`);
  }
  if (body.error) throw new Error(`OpenRouter: ${body.error.message ?? "error"}`);
  const text = body.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("OpenRouter: empty answer");
  return {
    text: text.trim(),
    duration_ms: Date.now() - started,
    cost: body.usage?.cost ?? null,
    tokens_in: body.usage?.prompt_tokens ?? null,
    tokens_out: body.usage?.completion_tokens ?? null,
  };
}

// Deterministic stand-in answers, so the full flow runs with no key and no network.
async function mockComplete(model: string, prompt: string, started: number): Promise<Completion> {
  await new Promise((r) => setTimeout(r, 20));
  let h = 0;
  for (const ch of model + prompt) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  if (prompt.startsWith("You are grading")) {
    const labels = [...prompt.matchAll(/^RESPONSE ([A-Z]):/gm)].map((m) => m[1]);
    const nCriteria = [...prompt.matchAll(/^\d+\. /gm)].length;
    return {
      text: JSON.stringify(
        labels.map((label, i) => ({
          label,
          criteria_scores: Array.from({ length: nCriteria }, (_, k) => 1 + ((h >> (i + k)) % 5)),
          overall: 1 + ((h >> (i * 3)) % 10),
          reason: `Mock judgment of response ${label}.`,
        })),
      ),
      duration_ms: Date.now() - started,
      cost: 0,
      tokens_in: null,
      tokens_out: null,
    };
  }
  const task = /TASK:\n([\s\S]*?)\n\nCONTEXT:/.exec(prompt)?.[1] ?? "";
  if (task.includes(`MOCK_FAIL:${model}`)) throw new Error("mock failure");
  return {
    text: `Mock answer (${h % 1000}) to: ${task.slice(0, 80)}\n\n- Point one\n- Point two`,
    duration_ms: 1000 + (h % 4000),
    cost: 0,
    tokens_in: null,
    tokens_out: null,
  };
}

// Pull the JSON array out of a judge's reply, even if it wrapped it in a code fence.
export function parseJudgeJson(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error("judge reply has no JSON array");
  const items = JSON.parse(text.slice(start, end + 1)) as any[];
  return items.map((it) => {
    if (typeof it.label !== "string" || typeof it.overall !== "number") throw new Error("bad judge item");
    return {
      label: it.label.trim().toUpperCase(),
      criteria_scores: Array.isArray(it.criteria_scores) ? it.criteria_scores.map(Number) : [],
      overall: Math.max(1, Math.min(10, it.overall)),
      reason: String(it.reason ?? ""),
    };
  });
}
