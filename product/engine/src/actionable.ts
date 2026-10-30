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

// Capitalized words that are general preferences, not a task's names, places or titles.
const GENERAL_TERMS = new Set(
  "I AI ASCII CSV English HTML JSON LaTeX Markdown OK PDF SQL URL URLs YAML".split(" "),
);

// A line naming something from its task (a book, a person, a city, a column, a day) would steer
// every chat once pasted into custom instructions (bug 12), so the snippet keeps only lines with
// no capitalized word past each sentence's first, other than GENERAL_TERMS.
export function isGeneral(line: string) {
  return line
    .split(/(?<=[.!?:;])\s+|\s+-\s+/)
    .every((sentence) =>
      sentence
        .split(/\s+/)
        .slice(1)
        .map((w) => w.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "").replace(/['’](s|m|d|ll|re|ve)$/, ""))
        .every((w) => !/^\p{Lu}/u.test(w) || GENERAL_TERMS.has(w)),
    );
}

export type SnippetGroup = { category: string; model: string | null; tests: { criteria: string[] }[] };

const norm = (c: string) => c.replace(/\s+/g, " ").trim();
const keyOf = (c: string) => c.toLowerCase().replace(/[.!;:,\s]+$/, "");

// One task's criteria can be specific to that task ("Under 50 words"), so the snippet keeps each
// kind of work's lines under its own heading rather than one list for every chat (QA bug 8).
// Up to SNIPPET_LINES in all: kinds the person rated first (model set), then the rest; lines are
// taken one kind at a time, and within a kind one task at a time, so nothing crowds out the rest.
// Repeats are dropped.
export function snippetGroups(groups: SnippetGroup[], max = SNIPPET_LINES) {
  const ordered = [...groups.filter((g) => g.model), ...groups.filter((g) => !g.model)];
  const queues = ordered.map((g) => {
    const depth = Math.max(0, ...g.tests.map((t) => t.criteria.length));
    const q: string[] = [];
    for (let k = 0; k < depth; k++) for (const t of g.tests) if (t.criteria[k] && norm(t.criteria[k]) && isGeneral(norm(t.criteria[k]))) q.push(norm(t.criteria[k]));
    return q;
  });
  const picked: string[][] = ordered.map(() => []);
  const seen = new Set<string>();
  let total = 0;
  for (let more = true; more && total < max; ) {
    more = false;
    queues.forEach((q, gi) => {
      while (q.length && total < max) {
        const c = q.shift()!;
        if (seen.has(keyOf(c))) continue;
        seen.add(keyOf(c));
        picked[gi].push(scrubPersonalInfo(c).text);
        total++;
        more = true;
        break;
      }
      if (q.length) more = true;
    });
  }
  return ordered.map((g, gi) => ({ category: g.category, model: g.model, criteria: picked[gi] })).filter((g) => g.criteria.length || g.model);
}

export function instructionSnippet(o: { groups: SnippetGroup[]; month: string }) {
  const groups = snippetGroups(o.groups);
  if (!groups.some((g) => g.model)) return "";
  const lines = [`How I like answers (from my own MySI blind test, ${o.month}):`];
  for (const g of groups) {
    lines.push(`When I ask for help with ${g.category}${g.model ? ` (I use ${g.model})` : ""}:`);
    lines.push(...g.criteria.map((c) => `- ${c}`));
  }
  return lines.join("\n");
}

export function snippetWhere(app: string | null) {
  return (app && SNIPPET_WHERE[app]) ?? "Paste it into your app's custom instructions or memory, if it has them.";
}
