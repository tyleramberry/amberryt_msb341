// Personal benchmark engine (specs/bench-mcp.md).
// Step 1: a deployed MCP connector with one `ping` tool, to prove a person can add it.

import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

// A fresh server per request: the handler is stateless.
function createServer() {
  const server = new McpServer({ name: "personal-bench", version: "0.1.0" });

  server.registerTool(
    "ping",
    {
      description:
        "Check that the Personal Bench connector is working. Call this when the person asks to " +
        "test, check or try the Personal Bench connector.",
      inputSchema: z.object({
        name: z.string().optional().describe("What the person wants to be called, if they said."),
      }),
    },
    async ({ name }) => ({
      content: [
        {
          type: "text",
          text:
            `Personal Bench is connected${name ? `, ${name}` : ""}. ` +
            `Server time: ${new Date().toISOString()}. ` +
            "Soon this connector will build a personal benchmark from a short conversation about " +
            "your work and test several AI models on it.",
        },
      ],
    }),
  );

  return server;
}

function setupPage(origin: string) {
  const url = `${origin}/mcp`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Personal Bench</title>
<style>
  :root { color-scheme: light dark; --bg:#fbfaf7; --fg:#1d1d1b; --muted:#6b6a65; --card:#fff; --line:#e4e1d8; --accent:#2f5d50; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161614; --fg:#ecebe6; --muted:#a3a29b; --card:#1f1f1c; --line:#33322e; --accent:#7fb8a5; } }
  body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.55 system-ui, sans-serif; }
  main { max-width:640px; margin:0 auto; padding:40px 16px 64px; }
  h1 { font-size:28px; margin:0 0 4px; } h2 { font-size:18px; margin:32px 0 8px; }
  p.lead { color:var(--muted); margin:0 0 24px; }
  .url { display:flex; gap:8px; background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 12px; }
  .url code { flex:1; overflow-wrap:anywhere; font-size:15px; }
  button { background:var(--accent); color:var(--bg); border:0; border-radius:8px; padding:6px 12px; font:inherit; cursor:pointer; }
  ol { padding-left:20px; } li { margin:6px 0; }
</style></head>
<body><main>
  <h1>Personal Bench</h1>
  <p class="lead">Find out which AI model is best at <em>your</em> work. It runs inside the chat app you already use.</p>
  <div class="url"><code id="u">${url}</code><button onclick="navigator.clipboard.writeText(document.getElementById('u').textContent);this.textContent='Copied'">Copy</button></div>

  <h2>Add it to Claude</h2>
  <ol>
    <li>Open <strong>claude.ai</strong> → <strong>Settings</strong> → <strong>Connectors</strong>.</li>
    <li>Click <strong>Add custom connector</strong>.</li>
    <li>Name: <strong>Personal Bench</strong>. URL: paste the link above. Click <strong>Add</strong>.</li>
    <li>In a new chat, type: <em>"Test my Personal Bench connector."</em></li>
  </ol>

  <h2>Add it to ChatGPT</h2>
  <ol>
    <li>Open <strong>Settings</strong> → <strong>Apps &amp; Connectors</strong> → <strong>Advanced</strong>, and turn on <strong>Developer mode</strong>.</li>
    <li>Back in <strong>Apps &amp; Connectors</strong>, click <strong>Create</strong>.</li>
    <li>Name: <strong>Personal Bench</strong>. URL: paste the link above. Authentication: <strong>No authentication</strong>. Create it.</li>
    <li>In a new chat, turn on Personal Bench and type: <em>"Test my Personal Bench connector."</em></li>
  </ol>
</main></body></html>`;
}

const mcp = createMcpHandler(createServer);

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(setupPage(url.origin), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    return mcp(request, env, ctx);
  },
} satisfies ExportedHandler;
