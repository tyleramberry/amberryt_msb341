// MCP protocol checks for the MySI engine. Run: npm test  (or MCP_URL=https://... npm test)
// Tool-specific tests live in the per-tool sections; generic checks loop over tools/list so new
// tools get covered automatically.
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { startTarget, stopTarget, rpc, call } from "./helpers.mjs";

let base;
before(async () => { base = await startTarget(); });
after(() => stopTarget());

const init = {
  jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "mysi-test", version: "1" } },
};
const text = (r) => r.body.result.content.map((c) => c.text).join("");

describe("setup page", () => {
  test("GET / serves HTML that shows this Worker's own /mcp URL", async () => {
    const res = await fetch(base + "/");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/html/);
    const html = await res.text();
    assert.ok(html.includes(`${base}/mcp`), "page should show the exact connector URL to paste");
    assert.match(html, /Add custom connector/);
    assert.match(html, /No authentication/);
  });

  test("unknown paths return 404", async () => {
    assert.equal((await fetch(base + "/nope")).status, 404);
  });
});

describe("protocol", () => {
  test("initialize returns server info and tools capability", async () => {
    const r = await rpc(base, init);
    assert.equal(r.status, 200);
    assert.equal(r.body.id, 1);
    assert.equal(r.body.result.serverInfo.name, "personal-bench");
    assert.ok(r.body.result.capabilities.tools);
    assert.ok(r.body.result.protocolVersion);
  });

  test("works statelessly: tools/list without initialize or session id", async () => {
    const r = await rpc(base, { jsonrpc: "2.0", id: 7, method: "tools/list" });
    assert.equal(r.status, 200);
    assert.equal(r.body.id, 7);
    assert.ok(Array.isArray(r.body.result.tools));
  });

  test("notifications get 202 and no body", async () => {
    const r = await rpc(base, { jsonrpc: "2.0", method: "notifications/initialized" });
    assert.equal(r.status, 202);
    assert.equal(r.body, null);
  });

  test("malformed JSON gives a JSON-RPC parse error (-32700)", async () => {
    const r = await rpc(base, "{bad");
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, -32700);
  });

  test("unknown method gives -32601", async () => {
    const r = await rpc(base, { jsonrpc: "2.0", id: 1, method: "does/not/exist" });
    assert.equal(r.body.error.code, -32601);
  });

  test("client that doesn't accept SSE gets 406, not a hang", async () => {
    const r = await rpc(base, { jsonrpc: "2.0", id: 1, method: "tools/list" },
      { "content-type": "application/json" });
    assert.equal(r.status, 406);
  });

  test("GET /mcp is 405 (no server-initiated stream needed)", async () => {
    assert.equal((await fetch(base + "/mcp")).status, 405);
  });

  test("CORS preflight succeeds and allows the MCP headers", async () => {
    const res = await fetch(base + "/mcp", { method: "OPTIONS" });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.match(res.headers.get("access-control-allow-headers"), /mcp-session-id/i);
  });

  test("two calls in a row both work (no per-connection state leaks)", async () => {
    const a = await call(base, "ping", { name: "A" }, 1);
    const b = await call(base, "ping", { name: "B" }, 2);
    assert.match(text(a), /, A\./);
    assert.match(text(b), /, B\./);
  });
});

describe("every tool (generic)", () => {
  test("has a name, a plain-language description, and an object input schema", async () => {
    const { body } = await rpc(base, { jsonrpc: "2.0", id: 1, method: "tools/list" });
    assert.ok(body.result.tools.length >= 1);
    const names = new Set();
    for (const t of body.result.tools) {
      assert.match(t.name, /^[a-z][a-z0-9_]*$/, `tool name ${t.name} should be snake_case`);
      assert.ok(!names.has(t.name), `duplicate tool ${t.name}`);
      names.add(t.name);
      assert.ok(t.description && t.description.length >= 30, `${t.name} needs a real description`);
      assert.equal(t.inputSchema.type, "object", `${t.name} inputSchema must be an object`);
    }
  });

  test("unknown tool is a JSON-RPC error", async () => {
    const r = await call(base, "zzz_not_a_tool");
    assert.equal(r.body.error.code, -32602);
    assert.match(r.body.error.message, /not found/i);
  });
});

describe("ping", () => {
  test("is listed with an optional string `name`", async () => {
    const { body } = await rpc(base, { jsonrpc: "2.0", id: 1, method: "tools/list" });
    const ping = body.result.tools.find((t) => t.name === "ping");
    assert.ok(ping, "ping missing");
    assert.equal(ping.inputSchema.properties.name.type, "string");
    assert.ok(!ping.inputSchema.required?.includes("name"));
  });

  test("works with no arguments", async () => {
    const r = await call(base, "ping");
    assert.ok(!r.body.result.isError);
    assert.match(text(r), /^Personal Bench is connected\. /);
  });

  test("greets the name it is given", async () => {
    const r = await call(base, "ping", { name: "Tyler" });
    assert.match(text(r), /^Personal Bench is connected, Tyler\. /);
  });

  test("reports a current ISO server time", async () => {
    const before = Date.now();
    const r = await call(base, "ping");
    const iso = text(r).match(/Server time: (\S+?)\./)?.[1];
    assert.ok(iso, "no timestamp in reply");
    const t = Date.parse(iso);
    assert.ok(Math.abs(t - before) < 60_000, `timestamp ${iso} is not near now`);
  });

  test("rejects a non-string name with isError, not a crash", async () => {
    const r = await call(base, "ping", { name: 5 });
    assert.equal(r.status, 200);
    assert.equal(r.body.result.isError, true);
    assert.match(text(r), /validation/i);
  });

  test("handles unicode and long names", async () => {
    const name = "Zoë 😀 " + "x".repeat(2000);
    const r = await call(base, "ping", { name });
    assert.ok(text(r).includes(name));
  });
});
