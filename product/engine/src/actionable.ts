// The part of a result the person acts on (spec 001, "The actionable result"): which model to
// pick in the app they already use, and a short snippet of their own criteria to paste into that
// app's custom instructions. Pure functions, so the unit tests can run them without a Worker.

import { scrubPersonalInfo } from "./coach.ts";

// Chat apps whose own models are in a lineup, keyed by get_results' `app` input.
export const APP_VENDOR: Record<string, string> = { claude: "anthropic", chatgpt: "openai", gemini: "google" };
export const APP_NAME: Record<string, string> = { claude: "Claude", chatgpt: "ChatGPT", gemini: "Gemini" };

export const SNIPPET_LINES = 6;

const SNIPPET_WHERE: Record<string, string> = {
  chatgpt: "In ChatGPT, paste it into Settings, then Personalization, then Custom instructions.",
  claude: 'In Claude, paste it into Settings, then Profile, under "What personal preferences should Claude consider".',
  gemini: "In Gemini, paste it into Settings, then Saved info.",
};

type Row = { model: string };

// The model to pick in the person's app, and the in_your_app sentence. Rows are best first.
// `idOf` maps a model's display name to its OpenRouter id ("openai/gpt-...").
export function inYourApp(rows: Row[], idOf: (model: string) => string, app: string | null, claudeCode: boolean) {
  const top = rows[0]?.model ?? null;
  const vendor = app ? APP_VENDOR[app] : undefined;
  if (!top || !app || !vendor || claudeCode) return { use_model: top, line: null };
  const appName = APP_NAME[app];
  const i = rows.findIndex((r) => idOf(r.model).startsWith(vendor + "/"));
  if (i === 0) return { use_model: top, line: `${top} is made for ${appName}, the app you already use, so you can switch to it there without changing apps.` };
  if (i < 0) return { use_model: top, line: `None of these models run in ${appName}. To use ${top}, you'd need an app that can use it.` };
  return {
    use_model: rows[i].model,
    line:
      `${top} doesn't run in ${appName}. The best one you can use there is ${rows[i].model} (ranked ${i + 1}). ` +
      `To use ${top} you'd need to switch apps, or use an app that can run models from any company.`,
  };
}

// Up to SNIPPET_LINES of the person's own criteria: all rated tests' lines before any unrated
// one's, each group taken round-robin in task order so one long task doesn't crowd out the rest;
// repeats dropped.
export function pickCriteria(tests: { criteria: string[]; rated: boolean }[], max = SNIPPET_LINES) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of [tests.filter((t) => t.rated), tests.filter((t) => !t.rated)]) {
    const depth = Math.max(0, ...group.map((t) => t.criteria.length));
    for (let k = 0; k < depth; k++) {
      for (const t of group) {
        if (out.length >= max) return out;
        const c = t.criteria[k]?.replace(/\s+/g, " ").trim();
        if (!c) continue;
        const key = c.toLowerCase().replace(/[.!;:,\s]+$/, "");
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(scrubPersonalInfo(c).text);
      }
    }
  }
  return out;
}

export function instructionSnippet(o: { criteria: string[]; categories: string[]; model: string | null; month: string }) {
  if (!o.model) return "";
  const lines = [`How I like answers (from my own MySI blind test, ${o.month}):`, ...o.criteria.map((c) => `- ${c}`)];
  const cats = o.categories;
  const kinds = !cats.length ? "my kind of work" : cats.length === 1 ? cats[0] : `${cats.slice(0, -1).join(", ")} and ${cats[cats.length - 1]}`;
  lines.push(`For ${kinds}, I use ${o.model}.`);
  return lines.join("\n");
}

export function snippetWhere(app: string | null) {
  return (app && SNIPPET_WHERE[app]) ?? "Paste it into your app's custom instructions or memory, if it has them.";
}
