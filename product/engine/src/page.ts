// HTML pages: the shared look (spec 003) and the rating page at /r/<run_id>. The setup page at / is
// in setup.ts, the owner's log in admin.ts.
// The rating page is built only from the blind view until the run is finished, so no model
// name, score or cost is in the page source before the reveal.

import type { Results, RunView, TestView } from "./run.ts";

export function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inline(s: string) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

// Enough Markdown for model answers and the report: headings, lists, tables, paragraphs.
export function markdown(src: string) {
  const out: string[] = [];
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const body: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) body.push(lines[i]);
      i++;
      out.push(`<pre><code>${esc(body.join("\n"))}</code></pre>`);
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(6, h[1].length + 2);
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].trim().startsWith("|"); i++) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
        rows.push(cells);
      }
      const [head, ...body] = rows;
      out.push(
        `<div class="table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
          body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") +
          "</tbody></table></div>",
      );
      continue;
    }
    const list = /^\s*([-*+]|\d+[.)])\s+/;
    if (list.test(line)) {
      const ordered = /^\s*\d/.test(line);
      const items: string[] = [];
      for (; i < lines.length && list.test(lines[i]); i++) items.push(`<li>${inline(lines[i].replace(list, ""))}</li>`);
      out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }
    const para: string[] = [];
    for (; i < lines.length && lines[i].trim() && !list.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !lines[i].trim().startsWith("|"); i++) {
      para.push(inline(lines[i]));
    }
    out.push(`<p>${para.join("<br>")}</p>`);
  }
  return out.join("\n");
}

// Spec 003: one visual system for every page. Dark-first "lab at night" with a full light theme.
// Three hues are the only color: blind labels A, B, C on the person's pages, and the company of
// each model on the owner's log (OpenAI, Anthropic, Google; anyone else violet). Light-theme hues
// are a shade darker than the mockups so small text on them passes AA contrast.
const BASE = `
  :root {
    --bg:#0b0d12; --panel:#12151d; --panel-2:#181c26; --line:#242a39; --fg:#e9ecf3; --muted:#8a91a6;
    --a:#8ea8ff; --b:#ffa27e; --c:#6fdcc0; --other:#c9b6ff;
    --cta-fg:#0b0d12; --cta-bg:#f3f5fb; --ok:#6fdcc0; --warn:#f2c66d; --bad:#ff7b8a;
    --best-bg:#13241f; --worst-bg:#2a1519;
    --display:"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
    --body:"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    --mono:"Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    color-scheme:dark;
  }
  @media (prefers-color-scheme: light) {
    :root:not([data-theme="dark"]) {
      --bg:#f5f6fa; --panel:#ffffff; --panel-2:#eef0f6; --line:#dde1ec; --fg:#11131a; --muted:#5a6177;
      --a:#3f5fe0; --b:#b84a22; --c:#0f7a66; --other:#7a55d6; --cta-fg:#f5f6fa; --cta-bg:#11131a;
      --ok:#0f7a66; --warn:#8a5f0a; --bad:#c8304a; --best-bg:#e2f3ee; --worst-bg:#fbe6e9; color-scheme:light;
    }
  }
  :root[data-theme="light"] {
    --bg:#f5f6fa; --panel:#ffffff; --panel-2:#eef0f6; --line:#dde1ec; --fg:#11131a; --muted:#5a6177;
    --a:#3f5fe0; --b:#b84a22; --c:#0f7a66; --other:#7a55d6; --cta-fg:#f5f6fa; --cta-bg:#11131a;
    --ok:#0f7a66; --warn:#8a5f0a; --bad:#c8304a; --best-bg:#e2f3ee; --worst-bg:#fbe6e9; color-scheme:light;
  }
  :root { --openai:var(--a); --anthropic:var(--b); --google:var(--c); }
  * { box-sizing:border-box; }
  [hidden] { display:none !important; }
  body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.6 var(--body); -webkit-font-smoothing:antialiased; }
  a { color:inherit; }
  code, .mono { font-family:var(--mono); }
  .num { font-variant-numeric:tabular-nums; }
  .muted { color:var(--muted); }
  :focus-visible { outline:2px solid var(--a); outline-offset:3px; border-radius:6px; }
  .wrap { max-width:1120px; margin:0 auto; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); }
  .top { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-block:20px; flex-wrap:wrap; }
  .mark { display:flex; align-items:center; gap:10px; font:800 20px/1 var(--display); letter-spacing:-0.02em; color:var(--fg); text-decoration:none; }
  .mark .dots { display:inline-flex; gap:3px; }
  .mark .dots i { width:7px; height:7px; border-radius:50%; display:block; }
  .mark .dots i:nth-child(1) { background:var(--a); } .mark .dots i:nth-child(2) { background:var(--b); } .mark .dots i:nth-child(3) { background:var(--c); }
  .mark small { font:500 12px/1 var(--mono); color:var(--muted); letter-spacing:0.06em; text-transform:uppercase; margin-left:4px; }
  .tag { font:500 12px/1 var(--mono); letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); border:1px solid var(--line); border-radius:999px; padding:6px 10px; }
  .btn { font:500 13px/1 var(--body); color:var(--fg); background:var(--panel); border:1px solid var(--line); border-radius:999px; padding:9px 14px; text-decoration:none; display:inline-flex; gap:8px; align-items:center; cursor:pointer; }
  .btn:hover { border-color:var(--muted); }
  .sw { display:inline-block; width:8px; height:8px; border-radius:2px; margin-right:6px; flex:none; }
`;

// The rating and results pages keep their Sprint 3 layout and only take the new tokens.
const APP = `
  main { max-width:1100px; margin:0 auto; padding:32px 16px 64px; }
  main.narrow { max-width:640px; }
  h1 { font:800 32px/1.1 var(--display); letter-spacing:-0.03em; margin:0 0 8px; }
  h2 { font:700 20px/1.25 var(--display); letter-spacing:-0.015em; margin:28px 0 8px; } h3,h4,h5,h6 { font-size:16px; margin:16px 0 6px; }
  p.lead { color:var(--muted); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:16px; }
  .task { margin:16px 0 20px; }
  .answers { display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); }
  .answer h2 { margin:0 0 8px; font-size:17px; }
  .answer .body { overflow-wrap:anywhere; }
  .answer pre { white-space:pre-wrap; }
  .pick { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; border-top:1px solid var(--line); padding-top:10px; }
  .pick label { display:inline-flex; gap:6px; align-items:center; border:1px solid var(--line); border-radius:8px; padding:4px 10px; cursor:pointer; }
  .pick input:checked + span { font-weight:600; }
  .answer.best { background:var(--best-bg); border-color:var(--ok); } .answer.worst { background:var(--worst-bg); border-color:var(--bad); border-style:dashed; }
  textarea { width:100%; min-height:60px; font:14px/1.5 var(--mono); border:1px solid var(--line); border-radius:10px; padding:10px; background:var(--panel-2); color:var(--fg); }
  button, .button { background:var(--a); color:var(--bg); border:0; border-radius:999px; padding:10px 18px; font:600 15px/1 var(--body); cursor:pointer; text-decoration:none; display:inline-block; }
  nav.tasks { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0; }
  nav.tasks a { border:1px solid var(--line); border-radius:999px; padding:2px 10px; color:var(--fg); text-decoration:none; font-size:14px; }
  nav.tasks a.on { border-color:var(--a); color:var(--a); font-weight:600; }
  .table { overflow-x:auto; } table { border-collapse:collapse; width:100%; font-size:15px; }
  th, td { border-bottom:1px solid var(--line); padding:6px 8px; text-align:left; vertical-align:top; }
  ol { padding-left:20px; } li { margin:4px 0; }
  .error { color:var(--bad); }
  .done { background:var(--best-bg); border-radius:10px; padding:12px 14px; }
`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">`;

// `css` is the page's own stylesheet; the rating and results pages use the default.
export function shell(title: string, body: string, extraHead = "", css = APP) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>${FONTS}${extraHead}<style>${BASE}${css}</style></head>
<body>${body}</body></html>`;
}

// A model's hue on pages that show names: the color of its company.
export function hueOf(company: string | undefined) {
  const c = (company ?? "").toLowerCase();
  return c === "openai" ? "var(--openai)" : c === "anthropic" ? "var(--anthropic)" : c === "google" ? "var(--google)" : "var(--other)";
}

// The three-dot wordmark, shared by the setup page and the log.
export const MARK = `<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>MySI`;

// Short steps per chat app (spec 002, Step 0). The prompt carries them so the app can walk the
// person through, and the setup page shows the same lines. ChatGPT's menus moved during 2026, so
// its steps name the feature, not every menu; Gemini is unverified with a server that has no sign-in.
export const APP_STEPS = [
  {
    app: "Claude",
    steps: "In claude.ai or the Claude app: Settings, then Connectors, then Add custom connector. Name it MySI and paste your link.",
  },
  {
    app: "ChatGPT",
    steps:
      "On chatgpt.com, with a paid plan (Plus or higher): turn on Developer mode in Settings, then create a new app (or connector) named MySI, paste your link, and choose No authentication. " +
      "In a new chat, add MySI from the + menu. When ChatGPT asks you to approve a MySI step, choose to remember it for this chat, or it will ask at every step. ChatGPT moves these menus often, so the names may differ a little.",
  },
  {
    app: "Gemini",
    steps:
      "On gemini.google.com (US, 18 or older, personal Google account, Keep Activity on): Settings, then Connected Apps, then under Custom apps, Add a custom app. Paste your link and click Next. " +
      'Then start a new chat with exactly "@MySI find my best AI model" (Gemini only uses MySI when you name it with @). When Gemini asks about a MySI step, press Always allow.',
  },
];

// The text the "Get my MySI link" button copies. Claude Code can add the connector itself; a
// chat app can't change its own settings, so there the app walks the person through it.
export function connectPrompt(url: string) {
  return `Please add MySI to this chat app as a connector. MySI is a remote MCP server at this link, which is my personal key, so don't repeat it back or share it:

${url}

If you can add connectors yourself (in Claude Code: claude mcp add --transport http --scope user mysi <the link>), do it, then call MySI's check_connection tool to make sure it works. If you're running in a cloud session rather than on my own computer, don't add it there: tell me to open the app on my computer and paste this again.

If you can't, tell me how in a few short steps for the app I'm using. Here are the steps for each app:
${APP_STEPS.map((a) => `- ${a.app}: ${a.steps}`).join("\n")}

Then tell me to start a new chat and say "Find my best AI model." (In Gemini, it has to be exactly "@MySI find my best AI model".)`;
}

export function notFoundPage() {
  return shell("MySI", `<main class="narrow"><h1>Benchmark not found</h1><p>Check the link, or start a new benchmark in your chat app.</p></main>`);
}

function taskNav(runId: string, tests: TestView[], current: string | null) {
  const mark = (t: TestView) => (t.status === "rated" ? " ✓" : t.status === "ready_to_rate" ? "" : t.status === "failed" ? " ✕" : " …");
  return `<nav class="tasks">${tests
    .map((t, i) => `<a class="${t.id === current ? "on" : ""}" href="/r/${runId}?t=${t.id}">Task ${i + 1}${mark(t)}</a>`)
    .join("")}</nav>`;
}

export function ratingPage(
  view: RunView,
  current: { test: TestView; answers: { label: string; text: string }[]; rating: { best: string; worst: string | null; note: string } | null } | null,
) {
  const p = view.tests.filter((t) => t.status === "rated").length;
  const ready = view.tests.filter((t) => t.status === "ready_to_rate").length;
  const waiting = view.status === "running" && !current;
  const head = waiting ? '<meta http-equiv="refresh" content="10">' : "";
  const header = `<h1>Your MySI benchmark</h1>
  <p class="lead">Pick the best and worst answer for each task. You won't see which AI wrote which until the end.
  ${p} of ${view.tests.length} rated${view.status === "running" ? "; the AIs are still working on the rest" : ""}.</p>
  ${taskNav(view.run_id, view.tests, current?.test.id ?? null)}`;

  if (!current) {
    const allDone = view.status !== "running" && ready === 0;
    const body = waiting
      ? `<div class="card">The AI models are working on your first tasks. This page refreshes itself.</div>`
      : view.status === "draft"
        ? `<div class="card">This benchmark hasn't started yet. Finish setting up your test tasks in your chat app.</div>`
        : allDone
          ? `<div class="card"><p>Every task is rated.</p><form method="post" action="/r/${view.run_id}/finish"><button>See results</button></form></div>`
          : `<div class="card">Pick a task above.</div>`;
    return shell("MySI benchmark", `<main>${header}${body}</main>`, head);
  }

  const { test, answers, rating } = current;
  const n = view.tests.findIndex((t) => t.id === test.id) + 1;
  const radio = (name: string, label: string) =>
    `<label><input type="radio" name="${name}" value="${label}"${rating && (name === "best" ? rating.best : rating.worst) === label ? " checked" : ""}><span>${name === "best" ? "Best" : "Worst"}</span></label>`;
  return shell(
    "MySI benchmark",
    `<main>${header}
  <section class="card task">
    <div class="muted">Task ${n} of ${view.tests.length} · ${esc(test.category)}</div>
    <h2>${esc(test.title)}</h2>
    <p><strong>What you'd type:</strong> ${esc(test.prompt)}</p>
    ${test.context ? `<details><summary>Context</summary>${markdown(test.context)}</details>` : ""}
    <p><strong>A great answer:</strong></p><ul>${test.criteria.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
  </section>
  <form id="rate" method="post" action="/r/${view.run_id}/rate">
    <input type="hidden" name="test_id" value="${test.id}">
    <div class="answers">
      ${answers
        .map(
          (a) => `<article class="card answer" data-label="${a.label}"><h2>Answer ${a.label}</h2><div class="body">${markdown(a.text)}</div>
        <div class="pick">${radio("best", a.label)}${radio("worst", a.label)}</div></article>`,
        )
        .join("\n")}
    </div>
    <p><label>Anything you noticed? (optional)<br><textarea name="note">${esc(rating?.note ?? "")}</textarea></label></p>
    <p class="error" id="err"></p>
    <button>${rating ? "Update rating" : "Save and go to next"}</button>
  </form>
  <script>
    const form = document.getElementById('rate');
    const paint = () => document.querySelectorAll('.answer').forEach(el => {
      const l = el.dataset.label;
      el.classList.toggle('best', form.best.value === l);
      el.classList.toggle('worst', form.worst.value === l);
    });
    form.addEventListener('change', paint); paint();
    form.addEventListener('submit', (e) => {
      if (!form.best.value) { e.preventDefault(); document.getElementById('err').textContent = 'Pick a best answer first.'; }
      else if (form.best.value === form.worst.value) { e.preventDefault(); document.getElementById('err').textContent = 'Best and worst need to be different answers.'; }
    });
  </script>
</main>`,
  );
}

export function resultsPage(view: RunView, r: Results) {
  const reveal = r.reveal
    .map((t, i) => {
      const labels = Object.entries(t.labels)
        .map(([l, m]) => `${l}: ${esc(m)}`)
        .join(" · ");
      return `<li><strong>Task ${i + 1}: ${esc(t.title)}</strong> — your best: ${t.your_best ? esc(t.your_best) : "not rated"}<br><span class="muted">${labels}</span></li>`;
    })
    .join("");
  return shell(
    "MySI results",
    `<main class="narrow">
  <h1>Your MySI results</h1>
  <p class="lead">${inline(r.headline)}</p>
  ${r.in_your_app ? `<p>${esc(r.in_your_app)}</p>` : ""}
  ${
    r.instruction_snippet
      ? `<h2>Use it in your app</h2>
  <p>Pick <strong>${esc(r.use_model ?? "")}</strong>. Then paste this into your app so it answers the way you rated. ${esc(r.snippet_where)}</p>
  <textarea id="snippet" readonly rows="${r.instruction_snippet.split("\n").length + 1}">${esc(r.instruction_snippet)}</textarea>
  <p><button onclick="navigator.clipboard.writeText(document.getElementById('snippet').value);this.textContent='Copied'">Copy</button></p>`
      : ""
  }
  <h2>Which AI wrote what</h2><ol>${reveal}</ol>
  ${markdown(r.markdown.replace(/^# Personal benchmark\n/, ""))}
  <p class="muted">Cost of this benchmark: US$${r.cost_usd.toFixed(4)}.</p>
</main>`,
  );
}
