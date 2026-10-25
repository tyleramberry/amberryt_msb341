// HTML pages: the setup page at / and the rating page at /r/<run_id>.
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

const STYLE = `
  :root { color-scheme: light dark; --bg:#fbfaf7; --fg:#1d1d1b; --muted:#6b6a65; --card:#fff; --line:#e4e1d8; --accent:#2f5d50; --pick:#e6f0ec; --bad:#f6e7e4; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161614; --fg:#ecebe6; --muted:#a3a29b; --card:#1f1f1c; --line:#33322e; --accent:#7fb8a5; --pick:#22332d; --bad:#3a2723; } }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.55 system-ui, sans-serif; }
  main { max-width:1100px; margin:0 auto; padding:32px 16px 64px; }
  main.narrow { max-width:640px; }
  h1 { font-size:26px; margin:0 0 4px; } h2 { font-size:19px; margin:28px 0 8px; } h3,h4,h5,h6 { font-size:16px; margin:16px 0 6px; }
  p.lead, .muted { color:var(--muted); }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px; }
  .task { margin:16px 0 20px; }
  .answers { display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); }
  .answer h2 { margin:0 0 8px; font-size:17px; }
  .answer .body { overflow-wrap:anywhere; }
  .answer pre { white-space:pre-wrap; }
  .pick { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; border-top:1px solid var(--line); padding-top:10px; }
  .pick label { display:inline-flex; gap:6px; align-items:center; border:1px solid var(--line); border-radius:8px; padding:4px 10px; cursor:pointer; }
  .pick input:checked + span { font-weight:600; }
  .answer.best { background:var(--pick); } .answer.worst { background:var(--bad); }
  textarea { width:100%; min-height:60px; font:inherit; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--card); color:var(--fg); }
  button, .button { background:var(--accent); color:var(--bg); border:0; border-radius:8px; padding:8px 16px; font:inherit; cursor:pointer; text-decoration:none; display:inline-block; }
  nav.tasks { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0; }
  nav.tasks a { border:1px solid var(--line); border-radius:999px; padding:2px 10px; color:var(--fg); text-decoration:none; font-size:14px; }
  nav.tasks a.on { border-color:var(--accent); color:var(--accent); font-weight:600; }
  .table { overflow-x:auto; } table { border-collapse:collapse; width:100%; font-size:15px; }
  th, td { border-bottom:1px solid var(--line); padding:6px 8px; text-align:left; vertical-align:top; }
  .url { display:flex; gap:8px; background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 12px; }
  .url code { flex:1; overflow-wrap:anywhere; font-size:15px; }
  ol { padding-left:20px; } li { margin:4px 0; }
  .error { color:#b3261e; }
`;

function shell(title: string, body: string, extraHead = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>${extraHead}<style>${STYLE}</style></head>
<body>${body}</body></html>`;
}

// personalUrl is set right after "Get my link": the page shows that link once (decision 008).
export function setupPage(origin: string, personalUrl?: string) {
  const url = personalUrl ?? `${origin}/mcp`;
  const link = personalUrl
    ? `<p><strong>Here is your own MySI link.</strong> Copy it now and keep it private: it's how MySI remembers your
  results, and anyone with it can see them. This page won't show it again.</p>
  <div class="url"><code id="u">${esc(url)}</code><button onclick="navigator.clipboard.writeText(document.getElementById('u').textContent);this.textContent='Copied'">Copy</button></div>`
    : `<form method="post" action="/link"><button>Get my link</button></form>
  <p class="muted">Your own link lets MySI remember your results, so later you can ask "which AI should I use for this?"
  Or use the shared link, which works the same but remembers nothing: <code>${esc(url)}</code></p>`;
  return shell(
    "MySI",
    `<main class="narrow">
  <h1>MySI</h1>
  <p class="lead">Find out which AI model is best at <em>your</em> work. It runs inside the chat app you already use.</p>
  ${link}

  <h2>Add it to Claude</h2>
  <ol>
    <li>Open <strong>claude.ai</strong> → <strong>Settings</strong> → <strong>Connectors</strong>.</li>
    <li>Click <strong>Add custom connector</strong>.</li>
    <li>Name: <strong>MySI</strong>. URL: paste your link. Click <strong>Add</strong>.</li>
    <li>In a new chat, type: <em>"Find my best AI model."</em></li>
    <li>When Claude asks to use MySI's tools, choose <strong>Always allow</strong>, or it will ask at every step.</li>
  </ol>

  <h2>Add it to ChatGPT</h2>
  <ol>
    <li>Open <strong>Settings</strong> → <strong>Apps &amp; Connectors</strong> → <strong>Advanced</strong>, and turn on <strong>Developer mode</strong>.</li>
    <li>Back in <strong>Apps &amp; Connectors</strong>, click <strong>Create</strong>.</li>
    <li>Name: <strong>MySI</strong>. URL: paste your link. Authentication: <strong>No authentication</strong>. Create it.</li>
    <li>In a new chat, turn on MySI and type: <em>"Find my best AI model."</em></li>
  </ol>

  <h2>Claude Code</h2>
  <p><code>claude mcp add --transport http mysi ${personalUrl ? esc(url) : "&lt;your link&gt;"}</code></p>

  <p class="muted">Already added it before? Refresh or reconnect it after an update, since chat apps remember the old tool list.</p>
</main>`,
  );
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
  <h2>Which AI wrote what</h2><ol>${reveal}</ol>
  ${markdown(r.markdown.replace(/^# Personal benchmark\n/, ""))}
  <p class="muted">Cost of this benchmark: US$${r.cost_usd.toFixed(4)}.</p>
</main>`,
  );
}
