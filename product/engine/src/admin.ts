// The owner's log at /admin (Basic auth, password = the ADMIN_TOKEN secret): every run, what
// the person asked, what they picked, and which model wrote each answer. Off until the secret
// is set. JSON export at /admin/export.json for analysis.

import type { Env } from "./models.ts";
import { esc, markdown, shell } from "./page.ts";
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

const nameOf = (d: RunDump, id: string | null) => (id ? (d.lineup.find((m) => m.id === id)?.name ?? id) : "");
const html = (body: string) =>
  new Response(body, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });

function listPage(runs: RunDump[]) {
  const rows = runs
    .map((d) => {
      const rated = d.tests.filter((t) => t.rating).length;
      return `<tr><td><a href="/admin/runs/${d.run_id}">${esc(d.created_at.slice(0, 16).replace("T", " "))}</a></td>
      <td>${esc(d.label || "—")}</td><td>${esc(d.status)}</td><td>${rated} / ${d.tests.length}</td>
      <td>${esc(d.winner ?? "")}</td><td>${d.runner === "claude_code" ? "Claude plan" : "OpenRouter"}</td><td>$${d.cost_usd.toFixed(3)}</td></tr>`;
    })
    .join("");
  return shell(
    "MySI log",
    `<main><h1>MySI log</h1>
  <p class="lead">Every benchmark, newest first (times in UTC). <a href="/admin/export.json">Download all as JSON</a>.</p>
  <div class="table"><table><thead><tr><th>Started</th><th>Label</th><th>Status</th><th>Rated</th><th>Their winner</th><th>Run on</th><th>Cost</th></tr></thead>
  <tbody>${rows || `<tr><td colspan="7">No runs yet.</td></tr>`}</tbody></table></div></main>`,
  );
}

function runPage(d: RunDump) {
  const tests = d.tests
    .map((t, i) => {
      const r = t.rating;
      const answers = t.answers
        .map((a) => {
          const tag = r?.best === a.label ? " · <strong>their best</strong>" : r?.worst === a.label ? " · <strong>their worst</strong>" : "";
          const judges = a.judge_scores.map((j) => `${esc(j.judge)}: ${j.overall}/10`).join(", ");
          return `<div class="card answer${r?.best === a.label ? " best" : r?.worst === a.label ? " worst" : ""}">
          <h2>Answer ${a.label} · ${esc(nameOf(d, a.model))}${tag}</h2>
          <div class="muted">${a.latency_ms ? `${(a.latency_ms / 1000).toFixed(1)}s` : ""}${a.cost_usd != null ? ` · $${a.cost_usd.toFixed(4)}` : ""}${judges ? ` · judges ${judges}` : ""}</div>
          <div class="body">${a.text ? markdown(a.text) : "<em>no answer</em>"}</div></div>`;
        })
        .join("");
      const errors = t.errors.map((e) => `<li>${esc(nameOf(d, e.model))}: ${esc(e.error ?? "")}</li>`).join("");
      return `<section class="card task">
      <div class="muted">Task ${i + 1} · ${esc(t.category)} · ${esc(t.status)}</div>
      <h2>${esc(t.title)}</h2>
      <p><em>What they'd type:</em> ${esc(t.prompt)}</p>
      ${t.context.trim() ? `<details><summary>Context</summary><pre>${esc(t.context)}</pre></details>` : ""}
      <p><em>A great answer:</em></p><ul>${t.criteria.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
      <p><strong>Their pick:</strong> ${r ? `best ${esc(nameOf(d, r.best_model))}${r.worst ? `, worst ${esc(nameOf(d, r.worst_model))}` : ""} (on the ${esc(r.source)})` : "not rated yet"}
      ${r?.note ? `<br><strong>Their note:</strong> ${esc(r.note)}` : ""}</p>
      ${errors ? `<ul class="error">${errors}</ul>` : ""}
      <div class="answers">${answers}</div></section>`;
    })
    .join("");
  const events = d.events.map((e) => `<tr><td>${esc(e.at.slice(0, 19).replace("T", " "))}</td><td>${esc(e.action)}</td><td>${esc(e.outcome)}</td></tr>`).join("");
  return shell(
    "MySI run",
    `<main><p><a href="/admin">← All runs</a></p>
  <h1>${esc(d.label || "Benchmark")}</h1>
  <p class="lead">${esc(d.status)} · started ${esc((d.started_at ?? d.created_at).slice(0, 16).replace("T", " "))} UTC ·
  ${d.lineup.map((m) => esc(m.name)).join(", ")} · $${d.cost_usd.toFixed(4)}${d.winner ? ` · their winner: <strong>${esc(d.winner)}</strong>` : ""}</p>
  ${tests || "<p>No test tasks saved yet.</p>"}
  <h2>Timeline</h2><div class="table"><table><tbody>${events}</tbody></table></div></main>`,
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
