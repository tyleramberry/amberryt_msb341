// Checks that every model id in wrangler.jsonc's LINEUP and JUDGE_POOL exists on OpenRouter,
// and prints its price. With OPENROUTER_API_KEY (env or .env) it also sends each judge one small
// judge prompt with the engine's settings and checks the reply parses, which catches judges that
// think away the whole token budget. Run: npm run check-models (needs network).
import { readFileSync } from "node:fs";
import { complete, parseJudgeJson } from "../src/models.ts";
import { judgePrompt } from "../src/prompts.ts";

const raw = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8").replace(/^\s*\/\/.*$/gm, "");
const vars = JSON.parse(raw).vars;
const wanted = [...JSON.parse(vars.LINEUP).map((m) => ["lineup", m]), ...JSON.parse(vars.JUDGE_POOL).map((m) => ["judge", m])];

const res = await fetch("https://openrouter.ai/api/v1/models");
const { data } = await res.json();
const byId = new Map(data.map((m) => [m.id, m]));
let missing = 0;
for (const [role, m] of wanted) {
  const found = byId.get(m.id);
  if (!found) {
    missing++;
    const close = data.filter((d) => d.id.startsWith(m.id.split("/")[0] + "/")).map((d) => d.id).slice(0, 8);
    console.log(`MISSING ${role} ${m.id}. Same vendor: ${close.join(", ")}`);
  } else {
    const per1M = (x) => (Number(x) * 1e6).toFixed(2);
    console.log(`ok      ${role} ${m.id}: $${per1M(found.pricing.prompt)} in / $${per1M(found.pricing.completion)} out per 1M tokens`);
  }
}

const dotenv = (() => { try { return readFileSync(new URL("../.env", import.meta.url), "utf8"); } catch { return ""; } })();
const key = process.env.OPENROUTER_API_KEY ?? dotenv.match(/^OPENROUTER_API_KEY=(.*)$/m)?.[1];
let broken = 0;
if (!key) {
  console.log("skip    judge calls: no OPENROUTER_API_KEY");
} else {
  const test = {
    id: "t1",
    category: "check",
    title: "Capital",
    prompt: "What is the capital of France? One word.",
    context: "",
    criteria: ["Correct", "One word"],
  };
  const prompt = judgePrompt(test, [["A", "Paris"], ["B", "Lyon, I think, though it may be Marseille."]]);
  for (const [role, m] of wanted) {
    if (role !== "judge" || !byId.has(m.id)) continue;
    try {
      // Same token budget as JUDGE_TOKENS in src/run.ts.
      const c = await complete({ OPENROUTER_API_KEY: key }, m.id, prompt, { maxTokens: 2000, reasoning: m.reasoning });
      const items = parseJudgeJson(c.text);
      if (!items.some((it) => it.label === "A")) throw new Error("reply has no score for A");
      console.log(`ok      judge ${m.id} answers a judge prompt ($${(c.cost ?? 0).toFixed(4)})`);
    } catch (e) {
      broken++;
      console.log(`BROKEN  judge ${m.id}: ${e.message}`);
    }
  }
}
process.exit(missing || broken ? 1 : 0);
