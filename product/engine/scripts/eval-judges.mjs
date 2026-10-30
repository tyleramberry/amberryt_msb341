// Runs product/evals/judge-style-rules.json against the configured judge pool on OpenRouter and
// prints pass/fail per case and judge, scoring the way the engine does (judge reply, then the
// rules the engine enforces in code). Needs OPENROUTER_API_KEY (read from .env if not set).
import { readFileSync } from "node:fs";
import { enforceRules, judgePrompt } from "../src/prompts.ts";
import { parseJudgeJson } from "../src/models.ts";

const env = Object.fromEntries(
  (() => { try { return readFileSync(new URL("../.env", import.meta.url), "utf8"); } catch { return ""; } })()
    .split("\n").map((l) => l.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const key = process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY;
if (!key) throw new Error("Set OPENROUTER_API_KEY or put it in product/engine/.env");
const raw = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8").replace(/^\s*\/\/.*$/gm, "");
const judges = JSON.parse(JSON.parse(raw).vars.JUDGE_POOL);
const { cases } = JSON.parse(readFileSync(new URL("../../evals/judge-style-rules.json", import.meta.url), "utf8"));

let failed = 0;
for (const c of cases) {
  for (const { id: judge, reasoning } of judges) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: judge, max_tokens: 2000, ...(reasoning === false ? { reasoning: { enabled: false } } : {}), messages: [{ role: "user", content: judgePrompt(c.test, Object.entries(c.answers)) }] }),
    });
    const body = await res.json();
    let scores;
    const answers = Object.entries(c.answers);
    try { scores = Object.fromEntries(enforceRules(c.test, answers, parseJudgeJson(body.choices[0].message.content)).map((s) => [s.label, s.overall])); }
    catch (e) { console.log(`ERROR ${c.id} ${judge}: ${body.error?.message ?? e.message}`); failed++; continue; }
    const ok = scores[c.expect.lower] < scores[c.expect.than] &&
      Object.entries(c.expect.max_overall ?? {}).every(([l, max]) => scores[l] <= max);
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"} ${c.id} ${judge} ${JSON.stringify(scores)}`);
  }
}
process.exitCode = failed ? 1 : 0;
