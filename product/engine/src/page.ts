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
  button.big { font-size:18px; padding:14px 28px; margin:20px 0 8px; }
  .done { background:var(--pick); border-radius:10px; padding:12px 14px; }
`;

export function shell(title: string, body: string, extraHead = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>${extraHead}<style>${STYLE}</style></head>
<body>${body}</body></html>`;
}

// The text the "Use it in Claude" button copies. Claude Code can add the connector itself; a
// chat app can't change its own settings, so there Claude walks the person through it.
export function connectPrompt(url: string) {
  return `Please add MySI to my Claude as a connector. MySI is a remote MCP server at this link, which is my personal key, so don't repeat it back or share it:

${url}

If you can add connectors yourself (in Claude Code: claude mcp add --transport http --scope user mysi <the link>), do it, then call MySI's check_connection tool to make sure it works. If you're running in a cloud session rather than on my own computer, don't add it there: tell me to open Claude on my computer and paste this again.

If you can't, tell me how in a few short steps for the app I'm using. In claude.ai or the Claude app that's: Settings, then Connectors, then Add custom connector, name it MySI, and paste the link from this message. Then tell me to start a new chat and say "Find my best AI model."`;
}

// One button: mint a personal link (decision 008) and copy the connect prompt. Without
// JavaScript the form posts to /link and the page shows the prompt once (personalUrl set).
export function setupPage(origin: string, personalUrl?: string) {
  const prompt = personalUrl ? connectPrompt(personalUrl) : "";
  const body = personalUrl
    ? `<p><strong>Copy this and paste it into Claude.</strong> It holds your own MySI link, so keep it private.
  This page won't show it again.</p>
  <textarea id="p" readonly rows="9">${esc(prompt)}</textarea>
  <p><button onclick="navigator.clipboard.writeText(document.getElementById('p').value);this.textContent='Copied'">Copy</button></p>`
    : `<form method="post" action="/link" id="go"><button class="big">Use it in Claude</button></form>
  <p id="done" class="done" hidden><strong>Copied.</strong> Paste it into Claude and send it. Claude will add MySI for you, or walk you through it in about 30 seconds.</p>
  <script>
  document.getElementById("go").addEventListener("submit", (e) => {
    if (!navigator.clipboard || !window.ClipboardItem) return; // the form posts and shows the prompt instead
    e.preventDefault();
    const text = fetch("/link", { method: "POST", headers: { accept: "application/json" } })
      .then((r) => r.json())
      .then((j) => new Blob([j.prompt], { type: "text/plain" }));
    // A promise inside ClipboardItem keeps the click's permission while the link is made (Safari).
    navigator.clipboard.write([new ClipboardItem({ "text/plain": text })]).then(
      () => { e.target.hidden = true; document.getElementById("done").hidden = false; },
      () => e.target.submit(),
    );
  });
  </script>`;
  return shell(
    "MySI",
    `<main class="narrow">
  <h1>MySI</h1>
  <p class="lead">Find out which AI model is best at <em>your</em> work. It runs inside Claude, in the chat you already use.</p>
  ${body}
  <p class="muted">Your link lets MySI remember your results, so later you can ask "which AI should I use for this?"
  MySI is an early prototype: its maker can read your test tasks and picks to improve it.</p>
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
