// Checks that every model id in wrangler.jsonc's LINEUP and JUDGE_POOL exists on OpenRouter,
// and prints its price. Run: npm run check-models (needs network; no key needed).
import { readFileSync } from "node:fs";

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
process.exit(missing ? 1 : 0);
