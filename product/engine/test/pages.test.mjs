// The person's setup page (/) and the owner's log (/admin) in a real headless browser: what the
// redesign must keep. Checks behaviour, not markup, so it holds across a new look: the main button
// still mints a link and copies the connect prompt (and works with no JavaScript), the log still
// shows every run, mobile and desktop layouts don't break, basic accessibility, and load speed.
// The rating and results pages share the stylesheet, so a short smoke test covers them too.
//
// Run: npm run test:pages. Needs Playwright with Chromium (preinstalled in Claude cloud
// containers; elsewhere `npm i -g playwright && npx playwright install chromium`). Skips if absent.
// Optional: AXE=<path to axe-core/axe.min.js> adds a full axe-core scan on top of the hand checks.
// SHOTS=<dir> saves a screenshot of every page at every size, for design review.
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { startTarget, stopTarget } from "./helpers.mjs";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  const roots = [undefined, "/opt/node-tools/node_modules"];
  try { roots.push(execSync("npm root -g", { encoding: "utf8" }).trim()); } catch {}
  for (const root of roots) {
    try { return require(root ? require.resolve("playwright", { paths: [root] }) : "playwright"); } catch {}
  }
  return null;
}
const pw = loadPlaywright();
const skip = pw ? false : "Playwright is not installed";

const TOKEN = "test-admin-password-123";
// Spec 003 sizes: 390px phone (740px tall, so the fold is conservative) and 1280px desktop,
// plus a 360px phone for sideways scroll only.
const SIZES = { small: { width: 360, height: 640 }, mobile: { width: 390, height: 740 }, desktop: { width: 1280, height: 800 } };
const MODEL_NAMES = /GPT-|Gemini \d|Claude Sonnet|DeepSeek|Mistral|Grok|openai\/|google\/|anthropic\//;
const LINK = /\/mcp\/u\/[A-Za-z0-9_-]{22}/;
// Hosts a page may load from besides its own. Anything else is a privacy and speed problem.
const ALLOWED_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const AXE = process.env.AXE ? readFileSync(process.env.AXE, "utf8") : null;

let base, browser;
const runs = {};

async function tool(name, args = {}) {
  const res = await fetch(base + "/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
  });
  const text = await res.text();
  const msg = JSON.parse(/^data: (.*)$/m.exec(text)?.[1] ?? text);
  return { isError: Boolean(msg.result?.isError), data: msg.result?.structuredContent, text: msg.result?.content?.[0]?.text };
}

async function seedRun(label, tests) {
  const runId = (await tool("start_benchmark", { label })).data.run_id;
  await tool("save_tests", { run_id: runId, tests });
  await tool("run_models", { run_id: runId, person_confirmed: true });
  for (let i = 0; i < 60; i++) {
    if ((await tool("check_run", { run_id: runId })).data?.status !== "running") break;
    await new Promise((r) => setTimeout(r, 500));
  }
  return runId;
}

const TASK = (title, prompt) => ({ category: "writing", title, prompt, context: "", criteria: ["Under 50 words", "Says Friday"] });

// A page plus everything that went wrong while it loaded.
async function open(url, { size = "desktop", js = true, auth = false, clipboard = true, dark = false, reducedMotion } = {}) {
  const context = await browser.newContext({
    viewport: SIZES[size],
    isMobile: size !== "desktop",
    hasTouch: size !== "desktop",
    javaScriptEnabled: js,
    colorScheme: dark ? "dark" : "light",
    reducedMotion,
    acceptDownloads: true,
    ...(auth ? { httpCredentials: { username: "tyler", password: TOKEN } } : {}),
  });
  if (clipboard) await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const problems = [];
  const foreign = [];
  const fromFontHost = (m) => { try { return ALLOWED_HOSTS.includes(new URL(m.location().url).hostname); } catch { return false; } };
  page.on("console", (m) => m.type() === "error" && !fromFontHost(m) && problems.push("console: " + m.text()));
  page.on("pageerror", (e) => problems.push("page error: " + e.message));
  // Font hosts can be unreachable (offline, or a locked-down network); the page must work without them.
  page.on("requestfailed", (r) => ALLOWED_HOSTS.includes(new URL(r.url()).hostname) || problems.push(`failed request: ${r.url()} (${r.failure()?.errorText})`));
  page.on("request", (r) => {
    const host = new URL(r.url()).hostname;
    if (r.url().startsWith("http") && !r.url().startsWith(base) && !ALLOWED_HOSTS.includes(host)) foreign.push(r.url());
  });
  const response = await page.goto(base + url, { waitUntil: "load" });
  return { page, context, response, problems, foreign, close: () => context.close() };
}

async function shot(page, name) {
  if (!process.env.SHOTS) return;
  mkdirSync(process.env.SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(process.env.SHOTS, name + ".png"), fullPage: true });
}

// Runs inside the page: layout and accessibility problems a person would hit.
function audit() {
  const out = [];
  const visible = (el) => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.visibility !== "hidden" && s.display !== "none" && r.width > 0 && r.height > 0;
  };
  const describe = (el) => `<${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}> "${(el.textContent || el.value || "").trim().slice(0, 40)}"`;
  const nameOf = (el) =>
    (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || el.value || el.querySelector?.("img[alt]")?.alt || "").trim() ||
    (el.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join("").trim();

  if (!document.documentElement.lang) out.push("<html> has no lang");
  if (!document.title.trim()) out.push("page has no <title>");
  const h1s = [...document.querySelectorAll("h1")].filter(visible);
  if (h1s.length !== 1) out.push(`expected one visible <h1>, found ${h1s.length}`);
  if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px wide in a ${innerWidth}px window)`);

  for (const img of document.querySelectorAll("img")) if (!img.hasAttribute("alt")) out.push("image without alt: " + img.src);
  for (const el of document.querySelectorAll("button, a[href], [role=button]")) if (visible(el) && !nameOf(el)) out.push("control with no name: " + el.outerHTML.slice(0, 80));
  for (const el of document.querySelectorAll("input:not([type=hidden]), textarea, select")) {
    if (!visible(el) && el.type !== "radio" && el.type !== "checkbox") continue;
    const labelled = el.labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title");
    if (!labelled) out.push("form field with no label: " + describe(el));
  }

  // Text contrast (WCAG AA): 4.5:1, or 3:1 for large text. Skips text over images or gradients.
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => [r, g, b].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage !== "none") return null;
      const c = rgb(s.backgroundColor);
      if (c.length >= 3 && (c[3] ?? 1) >= 0.99) return c;
      if (c.length >= 3 && (c[3] ?? 1) > 0.05) return null; // translucent layer: can't judge simply
    }
    return [255, 255, 255];
  };
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode()); ) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el || seen.has(el) || !visible(el) || el.closest("script,style,noscript")) continue;
    seen.add(el);
    const s = getComputedStyle(el);
    const fg = rgb(s.color), bg = bgOf(el);
    if (!bg || (fg[3] ?? 1) < 0.99 || parseFloat(s.opacity) < 1) continue;
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) out.push(`low contrast ${ratio.toFixed(2)}:1 (needs ${need}) on ${describe(el)}`);
    if (size < 12) out.push(`text smaller than 12px (${size}px) on ${describe(el)}`);
  }
  return out;
}

async function auditPage(page) {
  const found = await page.evaluate(audit);
  if (AXE) {
    await page.addScriptTag({ content: AXE });
    const r = await page.evaluate(() => window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] }));
    for (const v of r.violations) found.push(`axe ${v.id}: ${v.help} (${v.nodes.length}x, e.g. ${v.nodes[0]?.target})`);
  }
  return found;
}

// Load speed, from the browser's own timing. Local wrangler dev, so these are generous ceilings
// for page weight and work, not a network test.
async function speed(page) {
  return page.evaluate(async () => {
    let cls = 0, lcp = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) cls += e.value; })).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { lcp = Math.max(lcp, e.startTime); })).observe({ type: "largest-contentful-paint", buffered: true });
    await new Promise((r) => setTimeout(r, 1000));
    const nav = performance.getEntriesByType("navigation")[0];
    const res = performance.getEntriesByType("resource");
    return {
      domReady: nav.domContentLoadedEventEnd,
      htmlKB: nav.transferSize / 1024 || nav.decodedBodySize / 1024,
      totalKB: (nav.decodedBodySize + res.reduce((a, r) => a + (r.decodedBodySize || r.transferSize || 0), 0)) / 1024,
      requests: res.length + 1,
      cls,
      lcp,
    };
  });
}

function assertFast(s, label) {
  assert.ok(s.domReady < 1500, `${label}: DOM ready in ${s.domReady.toFixed(0)}ms (limit 1500)`);
  assert.ok(s.lcp < 2500, `${label}: largest paint at ${s.lcp.toFixed(0)}ms (limit 2500)`);
  assert.ok(s.cls < 0.1, `${label}: layout shift ${s.cls.toFixed(3)} (limit 0.1)`);
  assert.ok(s.totalKB < 600, `${label}: ${s.totalKB.toFixed(0)}KB loaded (limit 600)`);
  assert.ok(s.requests <= 15, `${label}: ${s.requests} requests (limit 15)`);
}

// Spec 003 fixes the text as "Get my MySI link".
const endlessAnimations = (page) =>
  page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getTiming().iterations === Infinity && Number(a.effect.getTiming().duration) > 10).length,
  );

const mainButton = (page) => page.getByRole("button", { name: /get my mysi link/i }).first();

before(async () => {
  if (skip) return;
  base = await startTarget({ vars: { ADMIN_TOKEN: TOKEN, MOCK_MODELS: "1" } });
  browser = await pw.chromium.launch();
  // The empty log, before anything is seeded.
  const p = await open("/admin", { auth: true });
  runs.emptyLog = await p.page.locator("body").innerText();
  await p.close();
  runs.rated = await seedRun("browser-log-check", [TASK("Reschedule a client", "Write a text moving Thursday to Friday.")]);
  await tool("submit_rating", { run_id: runs.rated, test_id: "t1", best: "A", worst: "B", note: "B was stiff" });
  runs.xss = await seedRun(`<img src=x onerror="window.__xss=1">`, [TASK(`<script>window.__xss=2</script>`, "Say hi <b onmouseover=x>")]);
  runs.blind = await seedRun("rating-page-check", [TASK("First task", "Write a text moving Thursday to Friday."), TASK("Second task", "Plan the week.")]);
});
after(async () => {
  await browser?.close();
  stopTarget();
});

describe("setup page (/)", { skip }, () => {
  test("loads clean: no errors, no outside requests, nothing private on it", async () => {
    const p = await open("/");
    assert.equal(p.response.status(), 200);
    const html = await p.page.content();
    assert.doesNotMatch(html, /\/admin/, "never links to the owner's log");
    assert.doesNotMatch(html, LINK, "no personal link before the person asks for one");
    assert.deepEqual(p.problems, []);
    assert.deepEqual(p.foreign, [], "loads nothing from other sites (fonts excepted)");
    await p.close();
  });

  test("the main button mints a personal link and copies the whole connect prompt", async () => {
    const p = await open("/");
    await mainButton(p.page).click();
    await p.page.getByText(/copied/i).first().waitFor({ state: "visible", timeout: 5000 });
    const copied = await p.page.evaluate(() => navigator.clipboard.readText());
    assert.match(copied, LINK);
    assert.match(copied, /check_connection/);
    assert.match(copied, /Find my best AI model/);
    assert.match(copied, /Claude[\s\S]*ChatGPT[\s\S]*Gemini/, "steps for all three apps");
    assert.doesNotMatch(await p.page.content(), LINK, "the key is copied, not printed on the page");
    // The copied link is a live connector.
    const url = copied.match(new RegExp("https?://\\S+" + LINK.source.slice(1)))[0];
    const init = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "pages-test", version: "1" } } }),
    });
    assert.equal(init.status, 200, "the copied link answers as an MCP server");
    assert.deepEqual(p.problems, []);
    await p.close();
  });

  test("two people get two different links", async () => {
    const links = [];
    for (let i = 0; i < 2; i++) {
      const p = await open("/");
      await mainButton(p.page).click();
      await p.page.getByText(/copied/i).first().waitFor({ state: "visible", timeout: 5000 });
      links.push((await p.page.evaluate(() => navigator.clipboard.readText())).match(LINK)[0]);
      await p.close();
    }
    assert.notEqual(links[0], links[1]);
  });

  test("with no clipboard access the person still gets the prompt on screen", async () => {
    const p = await open("/", { clipboard: false });
    await p.page.evaluate(() => { delete window.ClipboardItem; });
    await mainButton(p.page).click();
    await p.page.waitForLoadState("load");
    const field = p.page.locator("textarea, pre, code").filter({ hasText: LINK }).first();
    await field.waitFor({ timeout: 5000 });
    assert.match((await field.inputValue().catch(() => field.innerText())), /Find my best AI model/);
    await p.close();
  });

  test("works with JavaScript off: the button shows the prompt and a Copy button", async () => {
    const p = await open("/", { js: false });
    await mainButton(p.page).click();
    await p.page.waitForLoadState("load");
    const text = await p.page.locator("textarea").first().inputValue();
    assert.match(text, LINK);
    assert.match(text, /Find my best AI model/);
    assert.ok(await p.page.getByRole("button", { name: /copy/i }).count(), "a Copy button");
    await p.close();
  });

  test("still tells people how to add it in Claude, ChatGPT and Gemini", async () => {
    const p = await open("/");
    const text = await p.page.locator("body").textContent();
    for (const app of ["Claude", "ChatGPT", "Gemini"]) assert.match(text, new RegExp(app));
    assert.match(text, /Find my best AI model/i);
    assert.match(text, /@MySI/);
    assert.match(text, /prototype|maker can read/i, "the privacy note stays");
    // Each app's steps can be brought on screen (spec 003 puts them behind tabs).
    for (const [app, phrase] of [["ChatGPT", /Developer mode/], ["Gemini", /Connected Apps/], ["Claude", /Add custom connector/]]) {
      const tab = p.page.getByRole("tab", { name: new RegExp(`^\\s*${app}\\s*$`) });
      if (await tab.count()) await tab.first().click();
      assert.ok(await p.page.getByText(phrase).first().isVisible(), `${app} steps are visible after picking ${app}`);
    }
    await p.close();
  });

  test("Copy again puts the same prompt back on the clipboard", async () => {
    const p = await open("/");
    await mainButton(p.page).click();
    await p.page.getByText(/copied/i).first().waitFor({ state: "visible", timeout: 5000 });
    const first = await p.page.evaluate(() => navigator.clipboard.readText());
    await p.page.evaluate(() => navigator.clipboard.writeText(""));
    await p.page.getByRole("button", { name: /copy again/i }).click();
    await p.page.waitForFunction(async () => (await navigator.clipboard.readText()).length > 0, null, { timeout: 3000 });
    assert.equal(await p.page.evaluate(() => navigator.clipboard.readText()), first);
    assert.doesNotMatch(await p.page.content(), LINK, "the preview never writes the key into the page");
    await p.close();
  });

  for (const size of ["mobile", "desktop"]) {
    test(`${size}: no sideways scroll, button above the fold and easy to tap, accessible`, async () => {
      for (const dark of [false, true]) {
        const p = await open("/", { size, dark });
        await shot(p.page, `setup-${size}${dark ? "-dark" : ""}`);
        const box = await mainButton(p.page).boundingBox();
        assert.ok(box, "main button is visible");
        assert.ok(box.y + box.height <= SIZES[size].height, `main button is above the fold (bottom at ${Math.round(box.y + box.height)}px)`);
        if (size === "mobile") assert.ok(box.height >= 44 && box.width >= 44, `main button is at least 44x44 (is ${Math.round(box.width)}x${Math.round(box.height)})`);
        assert.deepEqual(await auditPage(p.page), [], `${size}${dark ? " dark" : ""}`);
        await p.close();
      }
    });
  }

  test("after the click (no JavaScript), the prompt page is accessible too", async () => {
    const p = await open("/", { js: false, size: "mobile" });
    await mainButton(p.page).click();
    await p.page.waitForLoadState("load");
    await shot(p.page, "setup-prompt-mobile");
    const html = await p.page.content();
    await p.close();
    // Audit the same HTML with JavaScript on, so axe can run.
    const q = await open("/", { size: "mobile" });
    await q.page.setContent(html, { waitUntil: "load" });
    assert.deepEqual(await auditPage(q.page), []);
    await q.close();
  });

  test("keyboard: Tab reaches the main button with a visible focus ring, Enter works", async () => {
    const p = await open("/");
    let focused = false;
    for (let i = 0; i < 15 && !focused; i++) {
      await p.page.keyboard.press("Tab");
      focused = await mainButton(p.page).evaluate((el) => el === document.activeElement);
    }
    assert.ok(focused, "main button is reachable by Tab");
    const ring = await mainButton(p.page).evaluate((el) => {
      const s = getComputedStyle(el);
      return (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
    });
    assert.ok(ring, "focused button shows a focus ring");
    await p.page.keyboard.press("Enter");
    await p.page.getByText(/copied/i).first().waitFor({ state: "visible", timeout: 5000 });
    await p.close();
  });

  test("motion stops when the person asks for reduced motion", async () => {
    const p = await open("/", { reducedMotion: "reduce" });
    assert.equal(await endlessAnimations(p.page), 0, "no endless animations under prefers-reduced-motion");
    // The demo's text must also stop changing (it's driven by a script, not CSS).
    const before = await p.page.locator("body").innerText();
    await p.page.waitForTimeout(1500);
    assert.equal(await p.page.locator("body").innerText(), before, "nothing on the page keeps typing itself");
    await p.close();
  });

  test("360px phone: no sideways scroll", async () => {
    const p = await open("/", { size: "small" });
    assert.deepEqual((await p.page.evaluate(audit)).filter((x) => /sideways/.test(x)), []);
    await p.close();
  });

  test("loads fast", async () => {
    for (const size of ["mobile", "desktop"]) {
      const p = await open("/", { size });
      assertFast(await speed(p.page), `setup ${size}`);
      await p.close();
    }
  });
});

describe("owner's log (/admin)", { skip }, () => {
  test("asks for the password in the browser", async () => {
    const p = await open("/admin");
    assert.equal(p.response.status(), 401);
    await p.close();
  });

  test("empty log says so", () => {
    assert.match(runs.emptyLog, /no (runs|benchmarks)/i);
  });

  test("lists every run, opens one, and goes back", async () => {
    const p = await open("/admin", { auth: true });
    assert.equal(p.response.status(), 200);
    const list = await p.page.locator("body").innerText();
    assert.match(list, /browser-log-check/);
    assert.match(list, /rating-page-check/);
    assert.deepEqual(p.problems, []);
    assert.deepEqual(p.foreign, []);
    await p.page.locator(`a[href="/admin/runs/${runs.rated}"]`).first().click();
    await p.page.waitForURL(`**/admin/runs/${runs.rated}`);
    const run = await p.page.locator("body").innerText();
    assert.match(run, /Write a text moving Thursday to Friday/, "what they asked");
    assert.match(run, /B was stiff/, "their note");
    assert.match(run, /their best/i, "their pick");
    assert.match(run, /GPT-6.1 Sol|Gemini 4 Argon|Claude Sonnet 5.5/, "which model wrote each answer");
    assert.match(run, /Timeline/i);
    assert.deepEqual(p.problems, []);
    await p.page.getByRole("link", { name: /all runs|back/i }).first().click();
    await p.page.waitForURL(/\/admin\/?$/);
    await p.close();
  });

  test("the JSON download still works from the page", async () => {
    const p = await open("/admin", { auth: true });
    const [download] = await Promise.all([p.page.waitForEvent("download"), p.page.getByRole("link", { name: /json|download|export/i }).first().click()]);
    const json = JSON.parse(readFileSync(await download.path(), "utf8"));
    assert.ok(json.runs.some((r) => r.run_id === runs.rated && r.tests[0].rating.note === "B was stiff"));
    await p.close();
  });

  test("a run's label, task and prompt can't run code in the log", async () => {
    for (const url of ["/admin", `/admin/runs/${runs.xss}`]) {
      const p = await open(url, { auth: true });
      await p.page.mouse.move(10, 10);
      assert.equal(await p.page.evaluate(() => window.__xss), undefined, url);
      assert.match(await p.page.locator("body").innerText(), /<img src=x|<script>/, `${url} shows the text as typed`);
      await p.close();
    }
  });

  for (const size of ["mobile", "desktop"]) {
    test(`${size}: list and run pages don't scroll sideways and pass the accessibility checks`, async () => {
      for (const [name, url] of [["list", "/admin"], ["run", `/admin/runs/${runs.rated}`]]) {
        for (const dark of [false, true]) {
          const p = await open(url, { size, auth: true, dark });
          await shot(p.page, `log-${name}-${size}${dark ? "-dark" : ""}`);
          assert.deepEqual(await auditPage(p.page), [], `${name} ${size}${dark ? " dark" : ""}`);
          await p.close();
        }
      }
    });
  }

  test("search and filter chips narrow the list, and everything shows with JavaScript off", async () => {
    const rows = (page) => page.locator("[data-status]");
    const p = await open("/admin", { auth: true });
    const total = await rows(p.page).count();
    assert.ok(total >= 3, `rows carry data-status (found ${total})`);
    await p.page.getByRole("searchbox").or(p.page.getByPlaceholder(/search|label/i)).first().fill("browser-log-check");
    await p.page.waitForTimeout(200);
    const shown = await rows(p.page).filter({ visible: true }).allInnerTexts();
    assert.equal(shown.length, 1, "search leaves one run");
    assert.match(shown[0], /browser-log-check/);
    await p.page.getByRole("searchbox").or(p.page.getByPlaceholder(/search|label/i)).first().fill("");
    await p.page.getByRole("button", { name: /^\s*finished/i }).first().click();
    await p.page.waitForTimeout(200);
    for (const st of await rows(p.page).filter({ visible: true }).evaluateAll((els) => els.map((e) => e.dataset.status))) assert.match(st, /finish/);
    await p.page.getByRole("button", { name: /^\s*all/i }).first().click();
    await p.page.waitForTimeout(200);
    assert.equal(await rows(p.page).filter({ visible: true }).count(), total, "All brings every run back");
    await p.close();
    const q = await open("/admin", { auth: true, js: false });
    assert.equal(await rows(q.page).filter({ visible: true }).count(), total, "no JavaScript: every run shows");
    await q.close();
  });

  test("the summary says how often the judges matched the person's picks", async () => {
    const p = await open("/admin", { auth: true });
    assert.match(await p.page.locator("body").innerText(), /matched their pick on \d+ of \d+/i);
    await p.close();
  });

  test("a run shows the agreement badge, a timeline, and Show all opens a clamped answer", async () => {
    const p = await open(`/admin/runs/${runs.rated}`, { auth: true });
    const text = await p.page.locator("body").innerText();
    assert.match(text, /Judges agreed|Judges picked [A-E], they picked [A-E]/);
    assert.match(text, /their worst/i);
    const more = p.page.getByRole("button", { name: /show all/i }).or(p.page.getByText(/show all/i));
    const clamped = () => p.page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => !["none", ""].includes(getComputedStyle(e).webkitLineClamp) || (getComputedStyle(e).maxHeight !== "none" && e.scrollHeight > e.clientHeight + 2)).length);
    if (await more.count()) {
      const before = await clamped();
      await more.first().click();
      await p.page.waitForTimeout(300);
      assert.ok((await clamped()) < before, "Show all unclamps an answer");
    }
    assert.equal(await endlessAnimations(p.page), 0, "nothing loops forever on a finished run");
    await p.close();
  });

  test("360px phone: list and run pages don't scroll sideways", async () => {
    for (const url of ["/admin", `/admin/runs/${runs.rated}`]) {
      const p = await open(url, { size: "small", auth: true });
      assert.deepEqual((await p.page.evaluate(audit)).filter((x) => /sideways/.test(x)), [], url);
      await p.close();
    }
  });

  test("loads fast", async () => {
    for (const url of ["/admin", `/admin/runs/${runs.rated}`]) {
      const p = await open(url, { auth: true });
      assertFast(await speed(p.page), url);
      await p.close();
    }
  });
});

// Shares the stylesheet with the two pages above, so a restyle must not break rating.
describe("rating and results pages still work", { skip }, () => {
  test("rate both tasks, catch a bad pick, then see results", async () => {
    const p = await open(`/r/${runs.blind}`, { size: "mobile" });
    assert.doesNotMatch(await p.page.content(), MODEL_NAMES, "blind until the end");
    assert.equal(await p.page.locator("[data-label], .answer").count() >= 3, true, "three answers");
    await shot(p.page, "rating-mobile");
    assert.deepEqual(await auditPage(p.page), []);

    const pick = async (kind, label) => p.page.locator(`input[name=${kind}][value=${label}]`).check({ force: true });
    await pick("best", "A");
    await pick("worst", "A");
    await p.page.getByRole("button", { name: /save|next|update/i }).click();
    await p.page.getByText(/different answers/i).waitFor({ timeout: 3000 });

    for (let i = 0; i < 2; i++) {
      await pick("best", "A");
      await pick("worst", "B");
      await Promise.all([p.page.waitForNavigation(), p.page.getByRole("button", { name: /save|next|update/i }).click()]);
    }
    await Promise.all([p.page.waitForNavigation(), p.page.getByRole("button", { name: /results/i }).click()]);
    const text = await p.page.locator("body").innerText();
    assert.match(text, /Which AI wrote what/i);
    assert.match(text, MODEL_NAMES, "names revealed at the end");
    await shot(p.page, "results-mobile");
    assert.deepEqual(p.problems, []);
    await p.close();
  });
});
