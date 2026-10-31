// The setup page at / (spec 003, mockup product/design/pages/setup.html). One button: mint a
// personal link (decision 008) and copy the connect prompt. Without JavaScript, or when the
// clipboard is refused, the form posts to /link and the page shows the prompt once
// (personalUrl set). The default page never holds a personal link or a link to /admin.

import type { ModelInfo } from "./models.ts";
import { APP_STEPS, connectPrompt, esc, hueOf, MARK, shell } from "./page.ts";

const CSS = `
  .narrow { max-width:760px; }
  .hero { display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, 1.1fr); gap:48px; align-items:center; padding-block:40px 72px; }
  .hero > * { min-width:0; }
  .eyebrow { font:500 12px/1 var(--mono); letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); margin:0 0 18px; }
  h1 { font:800 clamp(40px, 6vw, 68px)/0.98 var(--display); letter-spacing:-0.035em; margin:0 0 20px; text-wrap:balance; }
  h1 em { font-style:normal; background:linear-gradient(90deg, var(--a), var(--b) 55%, var(--c)); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .lead { font-size:18px; color:var(--muted); max-width:34em; margin:0 0 32px; }
  .lead strong { color:var(--fg); font-weight:500; }

  /* The one bold moment: the button sits inside a slowly turning A/B/C ring. */
  .cta-row { display:flex; flex-direction:column; gap:14px; align-items:flex-start; }
  .cta-row form { margin:0; }
  .ring { position:relative; border-radius:999px; padding:2px; background:conic-gradient(from var(--turn, 0deg), var(--a), var(--b), var(--c), var(--a)); animation:turn 6s linear infinite; }
  @property --turn { syntax:"<angle>"; inherits:false; initial-value:0deg; }
  @keyframes turn { to { --turn:360deg; } }
  .ring::after { content:""; position:absolute; inset:-10px; border-radius:inherit; background:inherit; filter:blur(22px); opacity:0.35; z-index:-1; }
  button.go { font:600 19px/1 var(--body); color:var(--cta-fg); background:var(--cta-bg); border:0; border-radius:999px; padding:20px 34px; cursor:pointer; display:inline-flex; align-items:center; gap:12px; }
  button.go:hover { filter:brightness(1.04); }
  button.go[disabled] { cursor:progress; }
  .under { font-size:14px; color:var(--muted); margin:0; max-width:30em; }
  .apps { display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; }
  .apps span { font:500 13px/1 var(--body); border:1px solid var(--line); border-radius:8px; padding:8px 12px; background:var(--panel); }

  /* Copied state */
  .copied { display:grid; gap:16px; width:100%; background:var(--panel); border:1px solid var(--line); border-radius:18px; padding:20px; }
  .copied h2 { font:700 22px/1.2 var(--display); margin:0; letter-spacing:-0.02em; }
  .copied p { margin:0; color:var(--muted); font-size:15px; }
  .track { list-style:none; padding:0; margin:0; display:grid; gap:10px; }
  .track li { display:grid; grid-template-columns:28px 1fr; gap:12px; align-items:start; }
  .track .n { width:28px; height:28px; border-radius:50%; display:grid; place-items:center; font:500 13px/1 var(--mono); border:1px solid var(--line); color:var(--muted); }
  .track li.done .n { background:var(--ok); border-color:var(--ok); color:var(--bg); }
  .track b { font-weight:600; }
  .say { font-family:var(--mono); font-size:14px; background:var(--panel-2); border:1px solid var(--line); border-radius:8px; padding:2px 8px; white-space:nowrap; }
  .peek { font:13px/1.5 var(--mono); color:var(--muted); background:var(--panel-2); border:1px dashed var(--line); border-radius:10px; padding:12px; max-height:92px; overflow:hidden; position:relative; white-space:pre-wrap; overflow-wrap:anywhere; }
  .peek::after { content:""; position:absolute; inset:auto 0 0; height:40px; background:linear-gradient(transparent, var(--panel-2)); }
  .peek .key { filter:blur(4px); }
  .copied label { font:500 12px/1 var(--mono); text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); }
  .copied textarea { width:100%; font:13px/1.5 var(--mono); color:var(--fg); background:var(--panel-2); border:1px solid var(--line); border-radius:10px; padding:12px; margin-top:8px; resize:vertical; }
  .small-btn { font:500 14px/1 var(--body); background:transparent; color:var(--fg); border:1px solid var(--line); border-radius:999px; padding:12px 18px; cursor:pointer; min-height:44px; }

  /* Live blind test */
  .lab { background:var(--panel); border:1px solid var(--line); border-radius:22px; padding:18px; box-shadow:0 30px 80px -40px rgba(0,0,0,0.6); }
  .lab-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
  .lab-head .live { display:inline-flex; align-items:center; gap:8px; font:500 12px/1 var(--mono); color:var(--muted); letter-spacing:0.06em; text-transform:uppercase; }
  .lab-head .cat { font:12px/1 var(--mono); color:var(--muted); }
  .pulse { width:8px; height:8px; border-radius:50%; background:var(--c); box-shadow:0 0 0 0 var(--c); animation:pulse 1.6s ease-out infinite; }
  @keyframes pulse { 70% { box-shadow:0 0 0 8px transparent; } 100% { box-shadow:0 0 0 0 transparent; } }
  .prompt { display:flex; gap:10px; align-items:flex-start; background:var(--panel-2); border-radius:14px; padding:12px 14px; margin-bottom:14px; min-height:72px; }
  .prompt .who { font:500 12px/1.9 var(--mono); color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; flex:none; }
  .prompt p { margin:0; font-size:15px; }
  .answers { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; }
  .ans { position:relative; border:1px solid var(--line); border-radius:14px; padding:12px; height:260px; display:flex; flex-direction:column; gap:8px; transition:border-color .3s, transform .3s, background .3s; }
  .ans .lbl { display:flex; align-items:center; justify-content:space-between; gap:6px; }
  .chip { font:600 12px/1 var(--mono); border-radius:6px; padding:5px 7px; color:var(--bg); }
  .ans[data-l="A"] .chip { background:var(--a); } .ans[data-l="B"] .chip { background:var(--b); } .ans[data-l="C"] .chip { background:var(--c); }
  .ans .who-is { font:500 12px/1.2 var(--mono); color:var(--muted); text-align:right; }
  .ans .txt { font-size:13px; line-height:1.5; color:var(--fg); overflow-wrap:anywhere; white-space:pre-line; overflow:hidden; flex:1; }
  .ans .txt .cursor { display:inline-block; width:7px; height:1em; vertical-align:-2px; background:var(--muted); margin-left:1px; animation:blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity:0; } }
  .ans.picked { transform:translateY(-3px); }
  .ans.picked[data-l="A"] { border-color:var(--a); } .ans.picked[data-l="B"] { border-color:var(--b); } .ans.picked[data-l="C"] { border-color:var(--c); }
  .ans .pick { position:absolute; top:-10px; left:12px; font:600 12px/1 var(--mono); letter-spacing:0.06em; text-transform:uppercase; background:var(--fg); color:var(--bg); border-radius:999px; padding:5px 9px; opacity:0; transition:opacity .3s; white-space:nowrap; }
  .ans.picked .pick { opacity:1; }
  .lab-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:14px; font-size:13px; color:var(--muted); flex-wrap:wrap; min-height:24px; }
  .lab-foot .step { font-family:var(--mono); }
  .dotsnav { display:flex; gap:2px; }
  .dotsnav button { width:30px; height:24px; border:0; padding:9px 4px; background:none; cursor:pointer; }
  .dotsnav button::before { content:""; display:block; height:6px; border-radius:3px; background:var(--line); }
  .dotsnav button[aria-current="true"]::before { background:var(--fg); }

  /* Bands */
  section.band { padding-block:72px; border-top:1px solid var(--line); }
  h2.sec { font:800 clamp(28px, 3.6vw, 40px)/1.05 var(--display); letter-spacing:-0.03em; margin:0 0 12px; text-wrap:balance; }
  .sec-lead { color:var(--muted); margin:0 0 36px; max-width:40em; }
  .steps { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:28px; }
  .steps li { display:grid; gap:10px; align-content:start; }
  .steps .num { font:500 13px/1 var(--mono); color:var(--muted); }
  .steps h3 { font:700 20px/1.2 var(--display); margin:0; letter-spacing:-0.015em; }
  .steps p { margin:0; color:var(--muted); font-size:15px; }
  .steps .bar { height:3px; border-radius:2px; }
  .steps li:nth-child(1) .bar { background:var(--a); } .steps li:nth-child(2) .bar { background:var(--b); } .steps li:nth-child(3) .bar { background:var(--c); }
  .versus { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:16px; }
  .vs { border:1px solid var(--line); border-radius:18px; padding:22px; display:grid; gap:14px; align-content:start; }
  .vs.you { background:var(--panel); }
  .vs h3 { font:600 13px/1 var(--mono); text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); margin:0; }
  .vs ul { margin:0; padding:0; list-style:none; display:grid; gap:10px; }
  .vs li { display:flex; gap:10px; align-items:baseline; font-size:15px; }
  .vs li::before { content:""; flex:none; width:6px; height:6px; border-radius:50%; background:var(--line); transform:translateY(-2px); }
  .vs.you li::before { background:var(--c); }

  /* Results preview */
  .result { background:var(--panel); border:1px solid var(--line); border-radius:22px; padding:24px; display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, 1fr); gap:28px; }
  .result > * { min-width:0; }
  .example { font:500 12px/1 var(--mono); text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); }
  .winner { font:800 clamp(30px, 4vw, 44px)/1 var(--display); letter-spacing:-0.03em; margin:10px 0 8px; }
  .result p { margin:0 0 10px; color:var(--muted); font-size:15px; }
  .result p strong { color:var(--fg); font-weight:600; }
  .tally { display:grid; gap:10px; align-content:start; }
  .tally .row { display:grid; grid-template-columns:140px minmax(0, 1fr) 40px; gap:10px; align-items:center; font-size:14px; }
  .tally .track2 { height:10px; background:var(--panel-2); border-radius:5px; overflow:hidden; }
  .tally .fill { height:100%; border-radius:5px; }
  .tally .v { font-family:var(--mono); color:var(--muted); text-align:right; font-variant-numeric:tabular-nums; }
  .snippet { font:13px/1.55 var(--mono); background:var(--panel-2); border-radius:12px; padding:14px; margin-top:6px; white-space:pre-wrap; color:var(--fg); }

  /* App setup tabs */
  .tabs { display:flex; gap:6px; border-bottom:1px solid var(--line); margin-bottom:20px; flex-wrap:wrap; }
  .tabs button { font:600 15px/1 var(--body); background:none; color:var(--muted); border:0; border-bottom:2px solid transparent; padding:14px; cursor:pointer; margin-bottom:-1px; }
  .tabs button[aria-selected="true"] { color:var(--fg); border-bottom-color:var(--fg); }
  .panel p { margin:0 0 12px; }
  .first { margin-top:24px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; color:var(--muted); }

  footer { border-top:1px solid var(--line); padding-block:32px 48px; color:var(--muted); font-size:14px; }
  footer p { margin:0 0 8px; max-width:46em; }

  @media (max-width:860px) {
    .hero { grid-template-columns:minmax(0, 1fr); gap:36px; padding-block:16px 48px; }
    .steps, .versus, .result { grid-template-columns:minmax(0, 1fr); }
  }
  @media (max-width:520px) {
    h1 { font-size:38px; }
    .lead { font-size:17px; margin-bottom:24px; }
    .answers { grid-template-columns:minmax(0, 1fr); }
    .ans { height:auto; }
    .ans .txt { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; min-height:4.5em; }
    .tally .row { grid-template-columns:110px minmax(0, 1fr) 32px; }
    button.go { padding:18px 26px; font-size:18px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ring, .pulse, .ans .txt .cursor { animation:none; }
    .ans, .ans .pick { transition:none; }
  }
`;

// Three example tasks for the hero demo. Each answer is written by one of the lineup's first
// three models (by position, so the names follow LINEUP), and a different model wins each task.
const DEMOS = [
  {
    cat: "Texting",
    ask: "Text my landlord that rent will be two days late. Short, and don't grovel.",
    a: "Hi, I wanted to reach out regarding this month's rent. Unfortunately, due to a delay with my paycheck, I will be approximately two days late. I sincerely apologize for any inconvenience this may cause.",
    b: "Hi, rent will be two days late this month. It'll be in by Friday. Thanks for understanding.",
    c: "Hey! Just a heads up 🙂 Rent is going to be a couple days late, so sorry!! Should be there by Friday at the latest!",
    pick: "B",
    who: [0, 2, 1],
  },
  {
    cat: "Spreadsheets",
    ask: 'Formula to total column C only for rows where column A says "Mowing".',
    a: '=SUMIF(A:A, "Mowing", C:C)\nIt adds every C value whose A cell says Mowing.',
    b: 'You can use SUMIFS, which supports multiple criteria: =SUMIFS(C:C, A:A, "Mowing"). Alternatively, a pivot table would let you',
    c: 'Try =SUM(FILTER(C:C, A:A="Mowing")). Note FILTER needs Excel 365 or Google Sheets.',
    pick: "A",
    who: [0, 2, 1],
  },
  {
    cat: "Teaching",
    ask: "A 10-minute warm-up on fractions for 4th graders, no worksheets.",
    a: "Objective: Students will be able to identify equivalent fractions. Materials: none. Procedure: 1. Introduce the concept of",
    b: "Fraction pizza: draw a circle, split it into 8. Ask who'd rather have 2/8 or 1/4. Let them argue, then",
    c: "Fraction line-up: give 6 kids a card (1/2, 1/4, 3/4, 2/8, 1/3, 2/3). The class orders them on the floor, out loud, and moves anyone who's wrong.",
    pick: "C",
    who: [2, 0, 1],
  },
];

// The demo script runs with no data from the server beyond the example tasks. Under reduced
// motion it shows each example's final state and never changes text on its own.
const DEMO_SCRIPT = `
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const els = { ask: document.getElementById("ask"), cat: document.getElementById("cat"), phase: document.getElementById("phase"), dots: document.getElementById("dots") };
const cards = [...document.querySelectorAll(".ans")];
let current = 0, timers = [];
demos.forEach((d, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("aria-label", "Example " + (i + 1) + ": " + d.cat);
  b.addEventListener("click", () => play(i));
  els.dots.append(b);
});
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
function settle(d) {
  cards.forEach((c) => { c.classList.remove("typing"); c.classList.toggle("picked", c.dataset.l === d.pick); c.querySelector(".who-is").textContent = d.names[c.dataset.l]; c.querySelector(".txt").textContent = d[c.dataset.l.toLowerCase()]; });
  els.phase.textContent = "You picked " + d.pick + ". It was " + d.names[d.pick] + ".";
}
function play(i) {
  timers.forEach(clearTimeout); timers = [];
  current = i; const d = demos[i];
  [...els.dots.children].forEach((b, j) => b.setAttribute("aria-current", j === i));
  els.ask.textContent = d.ask; els.cat.textContent = d.cat;
  if (reduce) return settle(d);
  els.phase.textContent = "Three models are answering…";
  cards.forEach((c) => { c.classList.remove("picked"); c.classList.add("typing"); c.querySelector(".who-is").textContent = "hidden"; c.querySelector(".txt").innerHTML = '<span class="cursor"></span>'; });
  const speeds = { A: 26, B: 38, C: 31 };
  let finished = 0;
  cards.forEach((c) => {
    const words = d[c.dataset.l.toLowerCase()].split(" "); const box = c.querySelector(".txt"); let n = 0;
    const tick = () => {
      n++; box.textContent = words.slice(0, n).join(" "); const cur = document.createElement("span"); cur.className = "cursor";
      if (n < words.length) { box.append(cur); later(tick, 1000 / speeds[c.dataset.l] * (2 + Math.random() * 3)); }
      else if (++finished === 3) {
        els.phase.textContent = "Which one would you send?";
        later(() => { cards.forEach((x) => x.classList.toggle("picked", x.dataset.l === d.pick)); els.phase.textContent = "You picked " + d.pick + ". Revealing…"; }, 1400);
        later(() => settle(d), 2600);
        later(() => play((current + 1) % demos.length), 7000);
      }
    };
    later(tick, 300 + Math.random() * 500);
  });
}
play(0);
`;

// The button: fetch the prompt and write it to the clipboard in the same click. A promise inside
// ClipboardItem keeps the click's permission while the link is made (Safari). The prompt stays in
// memory for "Copy again"; the page only ever shows it with the key blurred out of it.
const COPY_SCRIPT = `
const go = document.getElementById("go");
let prompt = null;
go.addEventListener("submit", (e) => {
  if (!navigator.clipboard || !window.ClipboardItem) return; // the form posts and shows the prompt instead
  e.preventDefault();
  go.querySelector("button").disabled = true;
  const got = fetch("/link", { method: "POST", headers: { accept: "application/json" } }).then((r) => r.json());
  const blob = got.then((j) => new Blob([j.prompt], { type: "text/plain" }));
  navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]).then(
    () => got.then((j) => { prompt = j.prompt; showCopied(); }),
    () => go.submit(),
  );
});
function showCopied() {
  const peek = document.getElementById("peek");
  const at = prompt.search(/\\/mcp\\/u\\//);
  const head = at < 0 ? prompt : prompt.slice(0, at + 7);
  const tail = at < 0 ? "" : prompt.slice(at + 7).replace(/^[A-Za-z0-9_-]+/, "");
  const key = document.createElement("span");
  key.className = "key";
  key.textContent = at < 0 ? "" : "••••••••••••••••••••••";
  peek.replaceChildren(head, key, tail);
  document.getElementById("cta").hidden = true;
  document.getElementById("copied").hidden = false;
  document.getElementById("copied-title").focus();
}
document.getElementById("again").addEventListener("click", (e) => {
  if (!prompt) return;
  navigator.clipboard.writeText(prompt).then(() => { e.target.textContent = "Copied again"; setTimeout(() => (e.target.textContent = "Copy again"), 1500); });
});
`;

// App tabs. All three panels stay in the HTML; without JavaScript a <noscript> style shows them all.
const TABS_SCRIPT = `
const tabs = [...document.querySelectorAll('[role="tab"]')];
const pickTab = (t) => tabs.forEach((x) => {
  const on = x === t;
  x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
  document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
});
tabs.forEach((t, i) => {
  t.addEventListener("click", () => pickTab(t));
  t.addEventListener("keydown", (e) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    pickTab(next); next.focus();
  });
});
`;

const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

function names(lineup: ModelInfo[]) {
  const fallback = ["Model one", "Model two", "Model three"];
  return [0, 1, 2].map((i) => lineup[i] ?? { id: "", name: fallback[i], company: "" });
}

function copiedCard(personalUrl?: string) {
  const steps = (first: string) => `<ol class="track">
          ${first}
          <li><span class="n">2</span><span><b>Paste it into Claude, ChatGPT or Gemini and send.</b> The app adds MySI or tells you the few clicks to do it.</span></li>
          <li><span class="n">3</span><span><b>Start a new chat and say</b> <span class="say">Find my best AI model</span></span></li>
        </ol>`;
  if (personalUrl) {
    return `<div class="copied" id="copied">
        <h2 id="copied-title">Copy this and paste it into your chat app.</h2>
        <p>It holds your own MySI link, so keep it private. This page won't show it again.</p>
        ${steps(`<li><span class="n">1</span><span><b>Copy the message below.</b> It's yours alone, so keep it private.</span></li>`)}
        <div><label for="p">Your connect message</label><textarea id="p" readonly rows="9">${esc(connectPrompt(personalUrl))}</textarea></div>
        <div><button class="small-btn" type="button" onclick="const t=document.getElementById('p');t.select();navigator.clipboard.writeText(t.value).then(()=>this.textContent='Copied')">Copy</button></div>
      </div>`;
  }
  return `<div class="copied" id="copied" hidden>
        <h2 id="copied-title" tabindex="-1">Copied. Now paste it into your chat app.</h2>
        ${steps(`<li class="done"><span class="n" aria-hidden="true">✓</span><span><b>Your link is on your clipboard.</b> It's yours alone, so keep it private.</span></li>`)}
        <div class="peek" id="peek" aria-label="What you copied, with your key hidden"></div>
        <div><button class="small-btn" type="button" id="again">Copy again</button></div>
      </div>`;
}

export function setupPage(origin: string, lineup: ModelInfo[], personalUrl?: string) {
  const [m1, m2, m3] = names(lineup);
  const demos = DEMOS.map(({ who, ...d }) => ({ ...d, names: { A: [m1, m2, m3][who[0]].name, B: [m1, m2, m3][who[1]].name, C: [m1, m2, m3][who[2]].name } }));
  const first = demos[0];
  // The example result: the third model wins, and the person's app is ChatGPT.
  const inChatGpt = lineup.find((m) => m.company.toLowerCase() === "openai") ?? m1;
  const tally = [
    { m: m3, n: 3 },
    { m: m1, n: 1 },
    { m: m2, n: 0 },
  ];
  const panels = APP_STEPS.map((a, i) => {
    const id = a.app.toLowerCase();
    return `<div class="panel" role="tabpanel" id="p-${id}" aria-labelledby="t-${id}"${i ? " hidden" : ""}><p><strong>${a.app}:</strong> ${esc(a.steps)}</p></div>`;
  }).join("\n      ");
  const tabs = APP_STEPS.map((a, i) => {
    const id = a.app.toLowerCase();
    return `<button type="button" role="tab" aria-selected="${i === 0}" aria-controls="p-${id}" id="t-${id}"${i ? ' tabindex="-1"' : ""}>${a.app}</button>`;
  }).join("");

  const body = `<header class="wrap top">
  <div class="mark">${MARK}</div>
  <span class="tag">Early prototype</span>
</header>

<main>
  <section class="wrap hero">
    <div>
      <p class="eyebrow">Your own model benchmark</p>
      <h1>Find the AI that's best at <em>your</em> work.</h1>
      <p class="lead">Leaderboards test math olympiads. MySI tests <strong>the things you actually ask AI to do</strong>, runs them on three top models from three different companies, and lets you pick the best answers blind. You leave with one winner.</p>

      <div class="cta-row" id="cta"${personalUrl ? " hidden" : ""}>
        <form method="post" action="/link" id="go">
          <div class="ring"><button class="go" type="submit">Get my MySI link</button></div>
        </form>
        <p class="under">Copies one message. Paste it into your chat app and it sets MySI up for you, or walks you through it in about a minute.</p>
        <div class="apps" aria-label="Works in"><span>Claude</span><span>ChatGPT</span><span>Gemini</span></div>
      </div>

      ${copiedCard(personalUrl)}
    </div>

    <div class="lab" role="region" aria-label="Example blind test">
      <div class="lab-head">
        <span class="live"><span class="pulse" aria-hidden="true"></span>Example blind test</span>
        <span class="cat" id="cat">${esc(first.cat)}</span>
      </div>
      <div class="prompt"><span class="who">You</span><p id="ask">${esc(first.ask)}</p></div>
      <div class="answers" id="answers">
        ${(["A", "B", "C"] as const)
          .map(
            (l) =>
              `<div class="ans${l === first.pick ? " picked" : ""}" data-l="${l}"><span class="pick">Your pick</span><div class="lbl"><span class="chip">${l}</span><span class="who-is">${esc(first.names[l])}</span></div><div class="txt">${esc(first[l.toLowerCase() as "a" | "b" | "c"])}</div></div>`,
          )
          .join("\n        ")}
      </div>
      <div class="lab-foot">
        <span class="step" id="phase" aria-live="off">You picked ${first.pick}. It was ${esc(first.names[first.pick as "A" | "B" | "C"])}.</span>
        <div class="dotsnav" id="dots"></div>
      </div>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <h2 class="sec">Three steps, all inside your chat app</h2>
      <p class="sec-lead">No new app to learn. MySI plugs into the chat you already use and does the heavy lifting there.</p>
      <ol class="steps">
        <li><div class="bar"></div><span class="num">Step 1 · about 5 minutes</span><h3>Tell it what you use AI for</h3><p>Your chat app asks a few questions and turns your real work into test tasks, each with what a great answer looks like to you.</p></li>
        <li><div class="bar"></div><span class="num">Step 2 · runs on its own</span><h3>Three models answer, blind</h3><p>${esc(m1.name)}, ${esc(m2.name)} and ${esc(m3.name)} each answer every task. You see them only as A, B and C, so the brand can't sway you.</p></li>
        <li><div class="bar"></div><span class="num">Step 3 · a click per task</span><h3>You pick, it names a winner</h3><p>Pick the best and worst answer for each task. Then the names are revealed and MySI tells you which model to use.</p></li>
      </ol>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <h2 class="sec">Why not just check a leaderboard?</h2>
      <p class="sec-lead">A new model ships every week, and each one claims the top spot on someone's chart. None of those charts were made from your work.</p>
      <div class="versus">
        <div class="vs"><h3>A public leaderboard</h3><ul><li>Scores competition math and coding puzzles</li><li>Graded by whoever made the test</li><li>One ranking for everyone on earth</li></ul></div>
        <div class="vs you"><h3>Your MySI benchmark</h3><ul><li>Tests the text to your landlord, the lesson plan, the spreadsheet formula</li><li>Graded by you, blind, against what you said a great answer needs</li><li>A ranking for one person: you</li></ul></div>
      </div>
    </div>
  </section>

  <section class="band">
    <div class="wrap">
      <h2 class="sec">What you leave with</h2>
      <p class="sec-lead">One winner you can act on today, even if you never switch apps.</p>
      <div class="result">
        <div>
          <span class="example">Example result</span>
          <div class="winner">${esc(m3.name)}</div>
          <p>You picked it as best on <strong>3 of 4 tasks</strong>, and it won both of your writing tasks.</p>
          <p><strong>In ChatGPT,</strong> your best option is <strong>${esc(inChatGpt.name)}</strong>. Pick it there, then paste this into your custom instructions so it answers the way you rated:</p>
          <div class="snippet">Keep replies short and plain. No em-dashes. Lead with the answer, then one line of reasoning.</div>
        </div>
        <div class="tally" role="group" aria-label="Example: your best picks by model">
          <span class="example">Your best picks</span>
          ${tally
            .map(
              ({ m, n }) =>
                `<div class="row"><span>${esc(m.name)}</span><div class="track2"><div class="fill" style="width:${Math.max(2, n * 25)}%;background:${hueOf(m.company)}"></div></div><span class="v">${n}</span></div>`,
            )
            .join("\n          ")}
          <p style="margin-top:8px">Later, ask your chat app "which AI should I use for this?" and MySI answers from your own results.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="band" id="setup">
    <div class="wrap narrow">
      <h2 class="sec">Adding it to your app</h2>
      <p class="sec-lead">The message you copy carries these steps, so your app can walk you through them. Here they are too.</p>
      <div class="tabs" role="tablist" aria-label="Chat app">${tabs}</div>
      ${panels}
      <div class="first">Then start a new chat and say <span class="say">Find my best AI model</span> In Gemini: <span class="say">@MySI find my best AI model</span></div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap narrow">
    <p>Your link lets MySI remember your results, so later you can ask "which AI should I use for this?"</p>
    <p>MySI is an early prototype: its maker can read your test tasks and picks to improve it.</p>
  </div>
</footer>
<noscript><style>.panel[hidden] { display:block !important; } .tabs { display:none; }</style></noscript>
<script>
const demos = ${json(demos)};
${DEMO_SCRIPT}
${TABS_SCRIPT}
${personalUrl ? "" : COPY_SCRIPT}
</script>`;
  return shell("MySI: find the AI that's best at your work", body, "", CSS);
}
