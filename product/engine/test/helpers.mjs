// Test helpers: talk to the MySI Worker over plain HTTP, no extra dependencies.
// Target: MCP_URL (e.g. https://personal-bench.<account>.workers.dev), else a local `wrangler dev`
// that the runner starts on a free port.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const engineDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let child;

export async function startTarget() {
  if (process.env.MCP_URL) return process.env.MCP_URL.replace(/\/$/, "");
  const port = 8700 + Math.floor(Math.random() * 200);
  const base = `http://127.0.0.1:${port}`;
  child = spawn("npx", ["wrangler", "dev", "--port", String(port), "--ip", "127.0.0.1"], {
    cwd: engineDir,
    stdio: "ignore",
  });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base + "/")).ok) return base;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("wrangler dev did not start within 60s");
}

export function stopTarget() {
  child?.kill("SIGTERM");
}

const MCP_HEADERS = {
  "content-type": "application/json",
  accept: "application/json, text/event-stream",
};

// POST a JSON-RPC message to /mcp. Returns { status, headers, body } where body is the parsed
// JSON-RPC response (SSE or plain JSON), or an array for batches, or null for 202s.
export async function rpc(base, message, headers = MCP_HEADERS) {
  const res = await fetch(base + "/mcp", {
    method: "POST",
    headers,
    body: typeof message === "string" ? message : JSON.stringify(message),
  });
  const text = await res.text();
  let body = null;
  if ((res.headers.get("content-type") ?? "").includes("text/event-stream")) {
    const msgs = [...text.matchAll(/^data: (.*)$/gm)].map((m) => JSON.parse(m[1]));
    body = msgs.length > 1 ? msgs : (msgs[0] ?? null);
  } else if (text) {
    body = JSON.parse(text);
  }
  return { status: res.status, headers: res.headers, body };
}

export const call = (base, name, args = {}, id = 1) =>
  rpc(base, { jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } });
