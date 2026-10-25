// MySI engine (specs/001-benchmark-engine-mcp.md): the MCP connector at /mcp (and POST /, for
// people who paste the bare URL), personal connector URLs at /mcp/u/<key> (decision 008), the
// setup page at /, and the rating page at /r/<run_id>.

import { createMcpHandler } from "agents/mcp/server";
import type { Env } from "./models.ts";
import { notFoundPage, ratingPage, resultsPage, setupPage } from "./page.ts";
import { createServer, newRunId, PERSON_KEY, personStub, runStub } from "./tools.ts";

export { RunObject } from "./run.ts";
export { RegistryObject } from "./registry.ts";
export { PersonObject } from "./person.ts";

const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

const redirect = (to: string) => new Response(null, { status: 303, headers: { location: to } });

async function ratingRoutes(request: Request, env: Env, url: URL): Promise<Response | null> {
  const m = /^\/r\/([A-Za-z0-9_-]{22})(\/rate|\/finish)?$/.exec(url.pathname);
  if (!m) return null;
  const [, runId, action] = m;
  const run = runStub(env, runId);
  if (!(await run.exists())) return html(notFoundPage(), 404);

  if (request.method === "POST" && action === "/rate") {
    const form = await request.formData().catch(() => null);
    if (!form) return new Response("Send the rating as a form.", { status: 400 });
    const testId = String(form.get("test_id") ?? "");
    const r = await run.rate(testId, String(form.get("best") ?? ""), String(form.get("worst") ?? "") || null, String(form.get("note") ?? ""), "page");
    if (!r.ok) return redirect(`/r/${runId}?t=${encodeURIComponent(testId)}`);
    const next = r.view.tests.find((t) => t.status === "ready_to_rate");
    return redirect(next ? `/r/${runId}?t=${next.id}` : `/r/${runId}`);
  }
  if (request.method === "POST" && action === "/finish") {
    await run.results(true);
    return redirect(`/r/${runId}`);
  }
  if (request.method !== "GET" || action) return new Response("Method not allowed", { status: 405 });

  const view = await run.view();
  if (view.status === "finished") {
    const r = await run.results(false);
    if (r.ok) return html(resultsPage(view, r.data));
  }
  const asked = url.searchParams.get("t");
  const pick = asked ?? view.tests.find((t) => t.status === "ready_to_rate")?.id;
  const a = pick ? await run.answers(pick) : null;
  return html(ratingPage(view, a?.ok ? { test: a.test, answers: a.answers, rating: a.rating } : null));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/" && request.method === "GET") return html(setupPage(url.origin));

    // "Get my link" on the setup page: mint a personal key. Same 128-bit format as run ids.
    if (url.pathname === "/link" && request.method === "POST") {
      const key = newRunId();
      await personStub(env, key).create();
      return html(setupPage(url.origin, `${url.origin}/mcp/u/${key}`));
    }

    const personal = /^\/mcp\/u\/([^/]+)$/.exec(url.pathname);
    if (personal) {
      const key = personal[1];
      const person = PERSON_KEY.test(key) ? personStub(env, key) : null;
      if (!person || !(await person.exists())) {
        return new Response("This MySI link isn't valid. Get a new one at " + url.origin, { status: 404 });
      }
      const mcp = createMcpHandler(() => createServer(env, url.origin, person));
      return mcp(new Request(new URL("/mcp", url), request), env, ctx);
    }

    const page = await ratingRoutes(request, env, url);
    if (page) return page;

    // A fresh MCP server per request: the handler is stateless; run state lives in Durable Objects.
    if (url.pathname === "/mcp" || url.pathname === "/") {
      const mcp = createMcpHandler(() => createServer(env, url.origin));
      const req = url.pathname === "/" ? new Request(new URL("/mcp", url), request) : request;
      return mcp(req, env, ctx);
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
