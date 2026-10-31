// The owner's log at /admin (Basic auth, password = the ADMIN_TOKEN secret): every run, what
// the person asked, what they picked, and which model wrote each answer. Off until the secret
// is set. JSON export at /admin/export.json for analysis. Layout: spec 003, mockup
// product/design/pages/log.html.

import { agreement, judgesBest, logStatus, summary, type LogStatus } from "./logstats.ts";
import type { Env, ModelInfo } from "./models.ts";
import { esc, hueOf, MARK, markdown, shell } from "./page.ts";
import type { RunDump } from "./run.ts";
import { runStub } from "./tools.ts";

const RUN_ID = /^[A-Za-z0-9_-]{22}$/;

function authorized(request: Request, token: string) {
  const m = /^Basic (.+)$/.exec(request.headers.get("authorization") ?? "");
  const pass = m ? (atob(m[1]).split(":").slice(1).join(":")) : "";
  // Constant-time compare, so the password can't be guessed a character at a time.
  const a = new TextEncoder().encode(pass);
  const b = new TextEncoder().encode(token);
  return a.length === b.length && crypto.subtle.timingSafeEqual(a, b);
}

async function dumps(env: Env, limit = 200): Promise<RunDump[]> {
  const ids = await env.REGISTRY.get(env.REGISTRY.idFromName("global")).list();
  return Promise.all(ids.slice(0, limit).map((r) => runStub(env, r.run_id).dump() as Promise<RunDump>));
}

const modelOf = (d: RunDump, id: string | null): ModelInfo | undefined => (id ? [...d.lineup, ...d.judges].find((m) => m.id === id || m.name === id) : undefined);
const nameOf = (d: RunDump, id: string | null) => (id ? (modelOf(d, id)?.name ?? id) : "");
const swatch = (company: string | undefined) => `<i class="sw" style="background:${hueOf(company)}"></i>`;
const who = (d: RunDump, id: string | null) => `<span class="who">${swatch(modelOf(d, id)?.company)}${esc(nameOf(d, id))}</span>`;
const utc = (iso: string | null, len = 16) => esc((iso ?? "").slice(0, len).replace("T", " "));
const usd = (n: number, digits = 3) => `$${n.toFixed(digits)}`;
const html = (body: string) =>
  new Response(body, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });

const STATUS_TEXT: Record<LogStatus, string> = { running: "running", rating: "waiting on picks", finished: "finished", draft: "draft", failed: "failed" };
const pill = (s: LogStatus) => `<span class="pill ${s}">${STATUS_TEXT[s]}</span>`;

const CSS = `
  body { font-size:15px; line-height:1.55; }
  .wrap { max-width:1240px; }
  .top { padding-block:18px; border-bottom:1px solid var(--line); gap:12px; }
  .mark { font-size:18px; } .mark .dots i { width:6px; height:6px; }
  .top nav { display:flex; gap:8px; flex-wrap:wrap; }
  :focus-visible { outline-offset:2px; }
  h1 { font:800 clamp(26px, 3.2vw, 36px)/1.05 var(--display); letter-spacing:-0.03em; margin:0; text-wrap:balance; overflow-wrap:anywhere; }
  .sub { color:var(--muted); margin:6px 0 0; }
  .head { display:flex; justify-content:space-between; align-items:end; gap:16px; padding-block:28px 20px; flex-wrap:wrap; }
  .head > * { min-width:0; }

  /* Summary strip */
  .strip { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)) minmax(0, 2fr); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:16px; overflow:hidden; }
  .stat { background:var(--panel); padding:16px; display:grid; gap:6px; align-content:start; min-width:0; }
  .stat .k { font:500 12px/1.2 var(--mono); text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); }
  .stat .v { font:700 28px/1 var(--display); letter-spacing:-0.02em; }
  .stat .v small { font-size:18px; color:var(--muted); font-weight:700; }
  .stat .d { font-size:13px; color:var(--muted); }
  .stat .d b { color:var(--fg); }
  .stack { display:flex; height:12px; border-radius:6px; overflow:hidden; gap:2px; background:var(--panel-2); }
  .stack span { display:block; height:100%; }
  .legend { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:13px; color:var(--muted); }
  .legend b { color:var(--fg); font-weight:600; }

  /* Filters */
  .bar { display:flex; justify-content:space-between; gap:12px; align-items:center; padding-block:28px 12px; flex-wrap:wrap; }
  .filters { display:flex; gap:6px; flex-wrap:wrap; }
  .filters button { font:500 13px/1 var(--body); color:var(--muted); background:transparent; border:1px solid var(--line); border-radius:999px; padding:9px 12px; cursor:pointer; }
  .filters button[aria-pressed="true"] { color:var(--fg); border-color:var(--fg); }
  .filters .c { font-family:var(--mono); margin-left:6px; }
  input[type="search"] { font:14px var(--body); color:var(--fg); background:var(--panel); border:1px solid var(--line); border-radius:999px; padding:9px 14px; width:240px; max-width:100%; }
  input[type="search"]::placeholder { color:var(--muted); opacity:1; }

  /* Run list */
  .runs { display:grid; gap:8px; padding-bottom:64px; }
  .cols { display:grid; grid-template-columns:128px minmax(0, 1.4fr) 136px minmax(0, 1fr) minmax(0, 1fr) 90px 70px; gap:16px; }
  .run { align-items:center; background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:14px 16px; text-decoration:none; transition:border-color .15s, transform .15s; }
  .run:hover { border-color:var(--muted); transform:translateY(-1px); }
  .run > * { min-width:0; }
  .run .when { font:13px/1.3 var(--mono); color:var(--muted); }
  .run .label { font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .run .label small { display:block; font-weight:400; color:var(--muted); font-size:13px; }
  .pill { display:inline-flex; align-items:center; gap:6px; font:500 12px/1 var(--mono); border-radius:999px; padding:5px 9px; border:1px solid currentColor; white-space:nowrap; }
  .pill::before { content:""; width:6px; height:6px; border-radius:50%; background:currentColor; }
  .pill.finished { color:var(--ok); } .pill.running { color:var(--a); } .pill.running::before { animation:pulse 1.4s infinite; }
  .pill.rating { color:var(--warn); } .pill.draft { color:var(--muted); } .pill.failed { color:var(--bad); }
  @keyframes pulse { 50% { opacity:0.25; } }
  .segs { display:flex; gap:3px; } .segs i { flex:1; height:6px; border-radius:3px; background:var(--line); display:block; max-width:28px; }
  .segs i.on { background:var(--fg); } .segs i.err { background:var(--bad); }
  .segs-l { font:12px/1 var(--mono); color:var(--muted); margin-top:6px; display:block; }
  .who { display:inline-flex; align-items:center; gap:8px; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
  .who .sw { margin:0; width:10px; height:10px; border-radius:3px; }
  .on { font-size:13px; color:var(--muted); }
  .cost { font:13px/1 var(--mono); text-align:right; color:var(--muted); }
  .colhead { padding:0 17px 4px; font:500 12px/1 var(--mono); text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); }
  .colhead span:last-child { text-align:right; }
  .empty { background:var(--panel); border:1px dashed var(--line); border-radius:14px; padding:24px; color:var(--muted); }

  /* One run */
  .crumb { padding-block:20px 0; font-size:14px; }
  .crumb a { color:var(--muted); text-decoration:none; } .crumb a:hover { color:var(--fg); }
  .meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; align-items:center; }
  .meta .btn { cursor:default; }
  .meta .btn .sw { margin:0; }
  .won { text-align:right; }
  .won .v { font:700 26px/1.1 var(--display); letter-spacing:-0.02em; display:block; }
  .layout { display:grid; grid-template-columns:minmax(0, 1fr) 300px; gap:28px; padding-block:24px 64px; align-items:start; }
  .layout > * { min-width:0; }
  .task { background:var(--panel); border:1px solid var(--line); border-radius:18px; padding:20px; display:grid; gap:16px; margin-bottom:16px; }
  .task > * { min-width:0; }
  .task-top { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline; }
  .task-top .k { font:500 12px/1 var(--mono); color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; }
  .task h2 { font:700 21px/1.2 var(--display); letter-spacing:-0.015em; margin:0; overflow-wrap:anywhere; }
  .bubble { background:var(--panel-2); border-radius:14px 14px 14px 4px; padding:12px 14px; max-width:62ch; overflow-wrap:anywhere; }
  .bubble .k { font:500 12px/1 var(--mono); text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); display:block; margin-bottom:6px; }
  .crit { list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:6px; }
  .crit li { font-size:13px; border:1px solid var(--line); border-radius:8px; padding:5px 9px; }
  details summary { cursor:pointer; color:var(--muted); font-size:14px; }
  details pre { white-space:pre-wrap; overflow-wrap:anywhere; font:13px/1.5 var(--mono); background:var(--panel-2); border-radius:10px; padding:12px; }
  .verdict { display:grid; grid-template-columns:auto minmax(0, 1fr); gap:14px; align-items:start; border-left:2px solid var(--fg); padding:2px 0 2px 14px; }
  .verdict .k { font:500 12px/1.6 var(--mono); text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); }
  .verdict q { font-style:italic; color:var(--muted); overflow-wrap:anywhere; }
  .agree { font:500 12px/1 var(--mono); border-radius:6px; padding:5px 8px; background:var(--panel-2); }
  .agree.no { color:var(--warn); } .agree.yes { color:var(--ok); }
  .answers { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; }
  .ans { border:1px solid var(--line); border-radius:14px; padding:14px; display:grid; gap:10px; align-content:start; position:relative; background:var(--bg); min-width:0; }
  .ans.best { border:2px solid var(--ok); } .ans.worst { border:2px dashed var(--bad); }
  .ribbon { position:absolute; top:-10px; right:12px; font:600 12px/1 var(--mono); text-transform:uppercase; letter-spacing:0.06em; padding:4px 8px; border-radius:999px; color:var(--bg); }
  .best .ribbon { background:var(--ok); } .worst .ribbon { background:var(--bad); }
  .ans-h { display:flex; justify-content:space-between; gap:8px; align-items:center; min-width:0; }
  .lbl { font:600 12px/1 var(--mono); border:1px solid var(--line); border-radius:6px; padding:4px 6px; color:var(--muted); flex:none; }
  .facts { display:flex; gap:12px; font:12px/1 var(--mono); color:var(--muted); flex-wrap:wrap; }
  .judges { display:grid; gap:6px; }
  .judge { display:grid; grid-template-columns:96px minmax(0, 1fr) 34px; gap:8px; align-items:center; font-size:12px; color:var(--muted); }
  .judge > span:first-child { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .judge .t { height:6px; background:var(--panel-2); border-radius:3px; overflow:hidden; } .judge .t i { display:block; height:100%; background:var(--muted); border-radius:3px; }
  .judge .s { font-family:var(--mono); text-align:right; color:var(--fg); }
  .body { font-size:14px; line-height:1.55; overflow-wrap:anywhere; max-height:9.5em; overflow:hidden; position:relative; }
  .body.open { max-height:none; }
  .body:not(.open)::after { content:""; position:absolute; inset:auto 0 0; height:3em; background:linear-gradient(transparent, var(--bg)); }
  .body pre { white-space:pre-wrap; } .body p { margin:0 0 8px; } .body h3, .body h4, .body h5, .body h6 { font-size:14px; margin:8px 0 4px; }
  .body .table { overflow-x:auto; } .body table { border-collapse:collapse; font-size:13px; } .body th, .body td { border-bottom:1px solid var(--line); padding:4px 6px; text-align:left; }
  .more { justify-self:start; font:500 12px/1 var(--mono); color:var(--muted); background:none; border:0; padding:6px 0; cursor:pointer; text-decoration:underline; text-underline-offset:3px; }
  .err { border:1px solid var(--bad); color:var(--bad); border-radius:12px; padding:10px 12px; font-size:13px; margin:0; list-style:none; display:grid; gap:4px; }
  .err b { font-weight:600; }
  .stream { position:sticky; top:calc(env(safe-area-inset-top, 0px) + 16px); background:var(--panel); border:1px solid var(--line); border-radius:18px; padding:18px; }
  .stream h2 { font:500 12px/1 var(--mono); text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); margin:0 0 14px; }
  .ev { list-style:none; margin:0; padding:0; display:grid; }
  .ev li { display:grid; grid-template-columns:14px minmax(0, 1fr); gap:10px; padding-bottom:14px; position:relative; }
  .ev li::before { content:""; position:absolute; left:6px; top:14px; bottom:0; width:1px; background:var(--line); }
  .ev li:last-child::before { display:none; }
  .ev .dot { width:13px; height:13px; border-radius:50%; border:2px solid var(--muted); background:var(--panel); margin-top:3px; }
  .ev .dot.ok { border-color:var(--ok); } .ev .dot.bad { border-color:var(--bad); } .ev .dot.you { border-color:var(--fg); background:var(--fg); }
  .ev .a { font-size:13px; overflow-wrap:anywhere; } .ev .t { font:12px/1.4 var(--mono); color:var(--muted); }

  @media (max-width:1000px) {
    .strip { grid-template-columns:repeat(2, minmax(0, 1fr)); } .strip .wide { grid-column:1 / -1; }
    .colhead { display:none; }
    .run.cols { grid-template-columns:minmax(0, 1fr) auto; grid-template-areas:"label status" "when cost" "rated winner"; gap:8px 16px; }
    .run .label { grid-area:label; } .run .status { grid-area:status; justify-self:end; } .run .when { grid-area:when; } .run .cost { grid-area:cost; }
    .run .rated { grid-area:rated; } .run .winner { grid-area:winner; justify-self:end; } .run .on { display:none; }
    .layout { grid-template-columns:minmax(0, 1fr); } .stream { position:static; }
    .answers { grid-template-columns:minmax(0, 1fr); }
    .won { text-align:left; }
  }
  @media (max-width:520px) { .strip { grid-template-columns:minmax(0, 1fr); } input[type="search"] { width:100%; } .bar > * { width:100%; } }
  @media (prefers-reduced-motion: reduce) { .pill.running::before { animation:none; } .run { transition:none; } }
`;

function topBar() {
  return `<header class="wrap top">
  <a class="mark" href="/admin">${MARK} <small>Owner's log</small></a>
  <nav aria-label="Log"><a class="btn" href="/admin">All runs</a><a class="btn" href="/admin/export.json" download>Download all as JSON</a></nav>
</header>`;
}

// One row per run. data-status and data-label let the filter script hide rows; with no
// JavaScript every row shows.
function runRow(d: RunDump) {
  const s = logStatus(d);
  const rated = d.tests.filter((t) => t.rating).length;
  const segs = d.tests.map((t) => `<i class="${t.rating ? "on" : t.status === "failed" || s === "failed" ? "err" : ""}"></i>`).join("");
  const winner = d.winner ? who(d, d.winner) : '<span class="muted">—</span>';
  return `<a class="run cols" href="/admin/runs/${d.run_id}" data-status="${s}" data-label="${esc((d.label || "").toLowerCase())}">
      <span class="when num">${utc(d.created_at)}</span>
      <span class="label">${esc(d.label || "—")}${d.app ? `<small>in ${esc(d.app)}</small>` : ""}</span>
      <span class="status">${pill(s)}</span>
      <span class="rated">${d.tests.length ? `<span class="segs" aria-hidden="true">${segs}</span><span class="segs-l">${rated} of ${d.tests.length} rated</span>` : '<span class="segs-l">no tasks yet</span>'}</span>
      <span class="winner">${winner}</span>
      <span class="on">${d.runner === "claude_code" ? "Claude plan" : "OpenRouter"}</span>
      <span class="cost num">${usd(d.cost_usd)}</span>
    </a>`;
}

function strip(runs: RunDump[]) {
  const s = summary(runs);
  const models = new Map<string, ModelInfo>();
  for (const d of runs) for (const m of [...d.lineup, ...d.judges]) models.set(m.id, m);
  const picks = s.picks.map(([id, n]) => ({ m: models.get(id) ?? { id, name: id, company: "" }, n }));
  return `<div class="strip" role="region" aria-label="Summary across all runs">
      <div class="stat"><span class="k">Runs</span><span class="v num">${s.runs}</span><span class="d">${s.running} running now</span></div>
      <div class="stat"><span class="k">Finished</span><span class="v num">${s.finished}</span><span class="d">${s.runs ? Math.round((100 * s.finished) / s.runs) : 0}% of runs</span></div>
      <div class="stat"><span class="k">Tasks rated</span><span class="v num">${s.rated}<small> / ${s.tasks}</small></span><span class="d">by the person, blind</span></div>
      <div class="stat"><span class="k">Spend</span><span class="v num">${usd(s.spend, 2)}</span><span class="d">${usd(s.runs ? s.spend / s.runs : 0, 2)} per run</span></div>
      <div class="stat wide">
        <span class="k">Their best picks, by model</span>
        ${
          picks.length
            ? `<div class="stack" aria-hidden="true">${picks.map((p) => `<span style="flex:${p.n};background:${hueOf(p.m.company)}"></span>`).join("")}</div>
        <div class="legend">${picks.map((p) => `<span>${swatch(p.m.company)}${esc(p.m.name)} <b class="num">${p.n}</b></span>`).join("")}</div>`
            : '<span class="d">No picks yet.</span>'
        }
        <span class="d">${
          s.judged
            ? `Judges' top answer matched their pick on <b>${s.agreed} of ${s.judged}</b> task${s.judged === 1 ? "" : "s"}.`
            : "No rated tasks with judge scores yet."
        }</span>
      </div>
    </div>`;
}

const FILTERS: [string, string][] = [
  ["all", "All"],
  ["running", "Running"],
  ["rating", "Waiting on picks"],
  ["finished", "Finished"],
  ["draft", "Draft"],
  ["failed", "Failed"],
];

const FILTER_SCRIPT = `
const rows = [...document.querySelectorAll(".run[data-status]")];
const buttons = [...document.querySelectorAll(".filters button")];
const q = document.getElementById("q");
const none = document.getElementById("none");
let f = "all";
function apply() {
  const text = q.value.trim().toLowerCase();
  let shown = 0;
  rows.forEach((r) => { const on = (f === "all" || r.dataset.status === f) && r.dataset.label.includes(text); r.hidden = !on; shown += on; });
  if (none) none.hidden = shown > 0 || !rows.length;
}
buttons.forEach((b) => b.addEventListener("click", () => { f = b.dataset.f; buttons.forEach((x) => x.setAttribute("aria-pressed", x === b)); apply(); }));
q.addEventListener("input", apply);
`;

function listPage(runs: RunDump[]) {
  const counts = new Map<string, number>([["all", runs.length]]);
  for (const d of runs) counts.set(logStatus(d), (counts.get(logStatus(d)) ?? 0) + 1);
  const rows = runs.map(runRow).join("\n    ");
  return shell(
    "MySI log",
    `${topBar()}
<main class="wrap">
  <div class="head"><div><h1>Every benchmark, live</h1><p class="sub">Newest first. Times in UTC.</p></div></div>
  ${strip(runs)}
  <div class="bar">
    <div class="filters" role="group" aria-label="Filter by status">${FILTERS.map(
      ([k, label]) => `<button type="button" aria-pressed="${k === "all"}" data-f="${k}">${label}<span class="c">${counts.get(k) ?? 0}</span></button>`,
    ).join("")}</div>
    <input type="search" id="q" placeholder="Search labels" aria-label="Search labels">
  </div>
  <div class="colhead cols" aria-hidden="true"><span>Started</span><span>Label</span><span>Status</span><span>Rated</span><span>Their winner</span><span>Run on</span><span>Cost</span></div>
  <div class="runs" id="runs">
    ${rows || '<p class="empty">No runs yet. They show up here as soon as someone starts a benchmark.</p>'}
    <p class="empty" id="none" hidden>No runs match.</p>
  </div>
</main>
<script>${FILTER_SCRIPT}</script>`,
    "",
    CSS,
  );
}

// Timeline dots: grey for setup, green for the engine at work, red for errors, solid for the
// person's own picks.
const EVENT_TEXT: Record<string, string> = {
  start_benchmark: "Benchmark created",
  save_tests: "Saved test tasks",
  run_models: "Run started",
  alarm: "Engine",
  job: "Answers and judging",
  model_call: "Model call",
  judge_call: "Judge call",
  submit_answers: "Answers submitted",
  submit_rating: "Rated",
  get_results: "Results shown",
};
function eventRow(e: RunDump["events"][number]) {
  const bad = /fail|error|cut off/i.test(e.outcome);
  const kind = bad ? "bad" : e.action === "submit_rating" ? "you" : ["start_benchmark", "save_tests"].includes(e.action) ? "" : "ok";
  return `<li><span class="dot ${kind}"></span><div><div class="a">${esc(EVENT_TEXT[e.action] ?? e.action)}${e.outcome ? `: ${esc(e.outcome)}` : ""}</div><div class="t">${esc(e.at.slice(11, 19))}</div></div></li>`;
}

function taskCard(d: RunDump, t: RunDump["tests"][number], i: number) {
  const r = t.rating;
  const ag = agreement(t);
  const badge = !ag.counted
    ? ""
    : ag.matched
      ? '<span class="agree yes">Judges agreed</span>'
      : `<span class="agree no">${ag.top ? `Judges picked ${esc(ag.top)}` : `Judges tied on ${esc(judgesBest(t).join(", "))}`}, they picked ${esc(r!.best)}</span>`;
  const answers = t.answers
    .map((a) => {
      const kind = r?.best === a.label ? "best" : r?.worst === a.label ? "worst" : "";
      const judges = a.judge_scores
        .map((j) => `<div class="judge"><span>${esc(nameOf(d, j.judge))}</span><span class="t"><i style="width:${Math.max(0, Math.min(10, j.overall)) * 10}%"></i></span><span class="s">${j.overall}</span></div>`)
        .join("");
      return `<article class="ans ${kind}">${kind ? `<span class="ribbon">their ${kind}</span>` : ""}
          <div class="ans-h">${who(d, a.model)}<span class="lbl">${esc(a.label)}</span></div>
          <div class="facts">${a.latency_ms ? `<span>${(a.latency_ms / 1000).toFixed(1)}s</span>` : ""}${a.cost_usd != null ? `<span>$${a.cost_usd.toFixed(4)}</span>` : ""}</div>
          ${judges ? `<div class="judges">${judges}</div>` : ""}
          <div class="body">${a.text ? markdown(a.text) : "<p><em>no answer</em></p>"}</div>
          <button class="more" type="button" aria-expanded="false">Show all</button>
        </article>`;
    })
    .join("");
  const judgeCount = d.judges.length;
  const errors = [
    ...t.errors.map((e) => `<li><b>${esc(nameOf(d, e.model))}</b>: ${esc(e.error ?? "")}</li>`),
    ...t.judge_errors.map(
      (e) =>
        `<li><b>${esc(nameOf(d, e.judge))}</b> (judge): ${esc(e.error)}${judgeCount ? ` Scored by ${Math.max(0, judgeCount - t.judge_errors.length)} of ${judgeCount} judges.` : ""}</li>`,
    ),
  ].join("");
  const pick = r
    ? `Best <b>${esc(nameOf(d, r.best_model))}</b>${r.worst ? `, worst <b>${esc(nameOf(d, r.worst_model))}</b>` : ""} <span class="muted">(${r.source === "page" ? "on the page" : `in the ${esc(r.source)}`})</span>${r.note ? `<br><q>${esc(r.note)}</q>` : ""}`
    : '<span class="muted">Not rated yet.</span>';
  return `<section class="task">
        <div class="task-top"><span class="k">Task ${i + 1} · ${esc(t.category)} · ${esc(t.status.replace(/_/g, " "))}</span>${badge}</div>
        <h2>${esc(t.title)}</h2>
        <div class="bubble"><span class="k">What they'd type</span>${esc(t.prompt)}</div>
        ${t.criteria.length ? `<ul class="crit" aria-label="A great answer">${t.criteria.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        ${t.context.trim() ? `<details><summary>Context</summary><pre>${esc(t.context)}</pre></details>` : ""}
        <div class="verdict"><span class="k">Their pick</span><div>${pick}</div></div>
        ${errors ? `<ul class="err">${errors}</ul>` : ""}
        ${answers ? `<div class="answers">${answers}</div>` : ""}
      </section>`;
}

// "Show all" only where an answer is cut off; short answers lose the button and the fade.
const RUN_SCRIPT = `
document.querySelectorAll(".more").forEach((b) => {
  const body = b.previousElementSibling;
  if (body.scrollHeight <= body.clientHeight + 2) { body.classList.add("open"); b.remove(); }
});
document.querySelectorAll(".more").forEach((b) => b.addEventListener("click", () => {
  const body = b.previousElementSibling;
  const open = body.classList.toggle("open");
  b.textContent = open ? "Show less" : "Show all";
  b.setAttribute("aria-expanded", open);
}));
`;

function runPage(d: RunDump) {
  const s = logStatus(d);
  const start = d.started_at ?? d.created_at;
  const mins = d.finished_at && d.started_at ? Math.max(1, Math.round((Date.parse(d.finished_at) - Date.parse(d.started_at)) / 60000)) : null;
  const sub = [`Started ${utc(start)} UTC`, mins ? `finished in ${mins} min` : "", d.app ? `in ${esc(d.app)}` : ""].filter(Boolean).join(" · ");
  const wins = d.winner ? d.tests.filter((t) => t.rating && nameOf(d, t.rating.best_model) === nameOf(d, d.winner)).length : 0;
  const rated = d.tests.filter((t) => t.rating).length;
  return shell(
    "MySI run",
    `${topBar()}
<main class="wrap">
  <div class="crumb"><a href="/admin">← All runs</a></div>
  <div class="head" style="padding-bottom:0">
    <div>
      <h1>${esc(d.label || "Benchmark")}</h1>
      <p class="sub">${sub}</p>
      <div class="meta">${pill(s)}${d.lineup.map((m) => `<span class="btn">${swatch(m.company)}${esc(m.name)}</span>`).join("")}<span class="btn mono">$${d.cost_usd.toFixed(4)}</span></div>
    </div>
    ${d.winner ? `<div class="won stat" style="background:none;padding:0"><span class="k">Their winner</span><span class="v">${esc(nameOf(d, d.winner))}</span><span class="d">${wins} of ${rated} tasks</span></div>` : ""}
  </div>
  <div class="layout">
    <div>${d.tests.map((t, i) => taskCard(d, t, i)).join("") || '<p class="empty">No test tasks saved yet.</p>'}</div>
    <aside class="stream" aria-labelledby="tl"><h2 id="tl">Timeline</h2><ol class="ev">${d.events.map(eventRow).join("")}</ol></aside>
  </div>
</main>
<noscript><style>.body { max-height:none; } .body::after { display:none; } .more { display:none; }</style></noscript>
<script>${RUN_SCRIPT}</script>`,
    "",
    CSS,
  );
}

export async function adminRoutes(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) return null;
  if (!env.ADMIN_TOKEN) return new Response("Not found", { status: 404 });
  if (!authorized(request, env.ADMIN_TOKEN)) {
    return new Response("Sign in with any username and your admin password.", {
      status: 401,
      headers: { "www-authenticate": 'Basic realm="MySI log", charset="UTF-8"' },
    });
  }
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  if (url.pathname === "/admin") return html(listPage(await dumps(env)));
  if (url.pathname === "/admin/export.json") {
    return new Response(JSON.stringify({ exported_at: new Date().toISOString(), runs: await dumps(env, 1000) }, null, 2), {
      headers: { "content-type": "application/json", "content-disposition": 'attachment; filename="mysi-log.json"', "cache-control": "no-store" },
    });
  }
  const m = /^\/admin\/runs\/([^/]+)$/.exec(url.pathname);
  if (m && RUN_ID.test(m[1])) {
    const run = runStub(env, m[1]);
    if (await run.exists()) return html(runPage((await run.dump()) as RunDump));
  }
  return new Response("Not found", { status: 404 });
}
