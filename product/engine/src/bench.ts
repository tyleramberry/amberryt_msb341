// Blinding and ranking math, ported from .claude/skills/personal-bench/scripts/bench.py.
// Pure functions only, so the same inputs give the same report as the Python script.

export type Test = {
  id: string;
  category: string;
  title: string;
  prompt: string;
  context: string;
  criteria: string[];
};
export type Response = {
  eval_id: string;
  model: string;
  text: string;
  duration_ms: number;
  cost?: number | null; // US$, from the API; the skill's runs have none
};
export type Blind = Record<string, Record<string, string>>; // eval_id -> label -> model
export type Judgment = {
  eval_id: string;
  label: string;
  criteria_scores: number[];
  overall: number;
  reason: string;
};
// worst is optional in the engine ("they're all fine"); bench.py always had one.
export type Rating = { eval_id: string; best: string; worst?: string | null; note: string };
export type Meta = { who?: string; date?: string };

export type Row = {
  model: string;
  human: number | null;
  wins: number;
  judge: number | null;
  median_s: number | null;
  cost: number | null; // mean US$ per answer
};

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class BenchError extends Error {}

function cmp(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function responsesByEval(responses: Response[]) {
  const out = new Map<string, Map<string, Response>>();
  for (const r of responses) {
    const byModel = out.get(r.eval_id) ?? new Map<string, Response>();
    if (byModel.has(r.model)) throw new BenchError(`duplicate response for ${r.eval_id} / ${r.model}`);
    byModel.set(r.model, r);
    out.set(r.eval_id, byModel);
  }
  return out;
}

// Fisher-Yates with a caller-supplied random source (crypto in the Worker, seeded in tests).
export function blind(tests: Test[], responses: Response[], random: () => number): Blind {
  const byEval = responsesByEval(responses);
  const mapping: Blind = {};
  for (const t of tests) {
    const models = [...(byEval.get(t.id)?.keys() ?? [])].sort(cmp);
    if (!models.length) throw new BenchError(`no responses for eval ${t.id}`);
    for (let i = models.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [models[i], models[j]] = [models[j], models[i]];
    }
    mapping[t.id] = Object.fromEntries(models.map((m, i) => [LABELS[i], m]));
  }
  return mapping;
}

// Python's f"{x:.{d}f}" rounds exact ties to even (2.125 -> "2.12"); toFixed rounds them up.
export function pyFixed(x: number, digits: number): string {
  const exact = Math.abs(x).toFixed(Math.min(100, digits + 30));
  const tail = exact.slice(exact.length - 30);
  if (tail === "5" + "0".repeat(29)) {
    const head = exact.slice(0, exact.length - 30);
    const lastDigit = Number(head.replace(".", "").slice(-1));
    if (lastDigit % 2 === 0) {
      const s = head.endsWith(".") ? head.slice(0, -1) : head;
      return (x < 0 && Number(s) !== 0 ? "-" : "") + s;
    }
  }
  return x.toFixed(digits);
}

export function fmt(x: number | null | undefined, digits = 1) {
  return x === null || x === undefined ? "–" : pyFixed(x, digits);
}

function mean(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export type ReportInput = {
  tests: Test[];
  responses: Response[];
  blind: Blind;
  judge: Judgment[];
  human?: Rating[];
  meta?: Meta;
  // Replaces the last two "How much to trust this" bullets (judge and timing caveats).
  notes?: string[];
  // The engine's report for the person: no judge scores anywhere (decided 2026-10-25), ranked on
  // their picks alone, and "test task" instead of "eval". Off by default so the port still
  // matches bench.py.
  forPerson?: boolean;
};

export type Report = {
  markdown: string;
  rows: Row[];
  judgeAgreement: { matched: number; of: number } | null;
};

const DEFAULT_NOTES = [
  "The judge is a Claude model grading Claude models, blind and in shuffled order. " +
    "Your picks count more than the judge's.",
  "Time is wall-clock time for each subagent call. It includes harness overhead, so " +
    "compare models to each other, not to the API.",
];

export function report(input: ReportInput): Report {
  const { tests, blind: mapping, judge } = input;
  const human = input.human ?? [];
  const byEval = responsesByEval(input.responses);

  const modelFor = (evalId: string, label: string) => {
    const m = mapping[evalId]?.[label];
    if (m === undefined) throw new BenchError(`unknown label '${label}' for eval '${evalId}'`);
    return m;
  };

  const models = [...new Set([...byEval.values()].flatMap((e) => [...e.keys()]))].sort(cmp);
  const catOf = new Map(tests.map((t) => [t.id, t.category]));
  const titleOf = new Map(tests.map((t) => [t.id, t.title]));
  const categories = [...new Set(tests.map((t) => t.category))].sort(cmp);
  const key = (evalId: string, model: string) => `${evalId}\u0000${model}`;
  const split = (k: string) => k.split("\u0000") as [string, string];

  // Judge: overall 1-10 per (eval, model).
  const jscore = new Map<string, number>();
  for (const j of judge) jscore.set(key(j.eval_id, modelFor(j.eval_id, j.label)), j.overall);
  // Human: best = 2 points, worst = 0, everyone else = 1.
  const hpoints = new Map<string, number>();
  const hbest = new Map<string, string>();
  for (const h of human) {
    if (h.best === h.worst) throw new BenchError(`eval ${h.eval_id}: best and worst are the same label`);
    const best = modelFor(h.eval_id, h.best);
    hbest.set(h.eval_id, best);
    const worst = h.worst ? modelFor(h.eval_id, h.worst) : null;
    for (const m of Object.values(mapping[h.eval_id])) {
      hpoints.set(key(h.eval_id, m), m === best ? 2 : m === worst ? 0 : 1);
    }
  }

  const agg = (table: Map<string, number>, model: string, cat?: string) =>
    mean(
      [...table.entries()]
        .filter(([k]) => {
          const [eid, m] = split(k);
          return m === model && (cat === undefined || catOf.get(eid) === cat);
        })
        .map(([, v]) => v),
    );

  const rows: Row[] = models.map((m) => {
    const durations = [...byEval.values()].filter((e) => e.has(m)).map((e) => e.get(m)!.duration_ms);
    const med = median(durations);
    const costs = [...byEval.values()]
      .map((e) => e.get(m)?.cost)
      .filter((c): c is number => typeof c === "number");
    return {
      model: m,
      human: human.length ? agg(hpoints, m) : null,
      wins: [...hbest.values()].filter((b) => b === m).length,
      judge: agg(jscore, m),
      median_s: med === null ? null : med / 1000,
      cost: mean(costs),
    };
  });
  const forPerson = input.forPerson ?? false;
  const task = forPerson ? "test task" : "eval";
  rows.sort((a, b) =>
    forPerson
      ? (b.human ?? 0) - (a.human ?? 0)
      : (b.human ?? 0) - (a.human ?? 0) || (b.judge ?? 0) - (a.judge ?? 0),
  );

  // Did the judge's top pick match the human's best? Ties at the top count as a miss.
  const agree: boolean[] = [];
  for (const [eid, best] of hbest) {
    const scores = Object.values(mapping[eid]).map((m) => [m, jscore.get(key(eid, m))] as const);
    const top = Math.max(...scores.map(([, s]) => s ?? -Infinity));
    const tops = scores.filter(([, s]) => s === top).map(([m]) => m);
    agree.push(tops.length === 1 && tops[0] === best);
  }

  const out = ["# Personal benchmark", ""];
  const meta = input.meta ?? {};
  if (Object.keys(meta).length) {
    out.push(
      `**Who:** ${meta.who ?? "–"}  `,
      `**Date:** ${meta.date ?? "–"}  `,
      `**${forPerson ? "Test tasks" : "Evals"}:** ${tests.length} · **Models:** ${models.join(", ")}`,
      "",
    );
  }
  // The cost column is new in the engine; it appears only when answers carry a cost.
  const showCost = rows.some((r) => r.cost !== null);
  out.push(
    "## Ranking",
    "",
    "| Rank | Model | Your score (0–2) | Your picks for best |" +
      (forPerson ? "" : " Judge score (1–10) |") +
      " Median time (s) |" +
      (showCost ? " Cost per answer (US$) |" : ""),
    "|---|---|---|---|---|" + (forPerson ? "" : "---|") + (showCost ? "---|" : ""),
  );
  // For the person, equal scores share a rank: there is no judge to break the tie.
  const rankOf = (i: number) => (forPerson ? rows.findIndex((r) => r.human === rows[i].human) + 1 : i + 1);
  rows.forEach((r, i) => {
    out.push(
      `| ${rankOf(i)} | ${r.model} | ${fmt(r.human, 2)} | ${human.length ? r.wins : "–"} ` +
        (forPerson ? "|" : `| ${fmt(r.judge)} |`) +
        ` ${fmt(r.median_s)} |` +
        (showCost ? ` ${fmt(r.cost, 4)} |` : ""),
    );
  });
  out.push(
    "",
    `Your score: best answer = 2, worst = 0, the rest = 1, averaged over ${task}s. ` +
      (forPerson ? "Ranked by your score." : "Ranked by your score, judge breaks ties."),
    "",
  );

  out.push("## By category", "", "| Model | " + categories.join(" | ") + " |", "|---|" + "---|".repeat(categories.length));
  for (const r of rows) {
    const cells = categories.map((c) => {
      const h = human.length ? agg(hpoints, r.model, c) : null;
      return forPerson ? fmt(h, 2) : `${fmt(h, 2)} you · ${fmt(agg(jscore, r.model, c))} judge`;
    });
    out.push(`| ${r.model} | ` + cells.join(" | ") + " |");
  }
  out.push("");

  const judgeCols = forPerson ? [] : models;
  out.push(
    forPerson ? "## Each test task" : "## Each eval",
    "",
    "| " + [forPerson ? "Test task" : "Eval", "Category", "Your best", ...judgeCols.map((m) => `Judge: ${m}`)].join(" | ") + " |",
    "|---|---|---|" + "---|".repeat(judgeCols.length),
  );
  for (const t of tests) {
    const cells = [`${t.id}: ${titleOf.get(t.id)}`, t.category, hbest.get(t.id) ?? "–", ...judgeCols.map((m) => fmt(jscore.get(key(t.id, m)), 0))];
    out.push("| " + cells.join(" | ") + " |");
  }
  out.push("");

  out.push("## How much to trust this", "");
  const matched = agree.filter(Boolean).length;
  if (agree.length && !forPerson) {
    out.push(
      `- The judge's top pick matched yours on ${matched} of ${agree.length} evals ` +
        `(${pyFixed((100 * matched) / agree.length, 0)}%).`,
    );
  }
  const n = tests.length;
  out.push(
    `- ${n} ${task}${n !== 1 ? "s" : ""}, one answer per model each. Models vary run to run, so a small gap ` +
      "between two models may be luck.",
    ...(input.notes ?? DEFAULT_NOTES).map((s) => `- ${s}`),
    "",
  );

  return {
    markdown: out.join("\n"),
    rows,
    judgeAgreement: agree.length ? { matched, of: agree.length } : null,
  };
}
