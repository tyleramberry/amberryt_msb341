// complete() against a stubbed OpenRouter: the per-model reasoning setting, and a model that
// thinks away its whole budget (Mistral Large 4, 2026-10-26) failing without a retry.
import { test } from "node:test";
import assert from "node:assert/strict";
import { complete, ModelError, type Env } from "../src/models.ts";

const env = { OPENROUTER_API_KEY: "test" } as Env;

function stubFetch(reply: object) {
  const sent: any[] = [];
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    sent.push(JSON.parse(String(init.body)));
    return new Response(JSON.stringify(reply), { status: 200 });
  }) as typeof fetch;
  return sent;
}

const answer = { choices: [{ message: { content: "ok" }, finish_reason: "stop" }], usage: { cost: 0.001 } };

test("reasoning: false turns thinking off; unset sends nothing", async () => {
  const sent = stubFetch(answer);
  await complete(env, "mistralai/mistral-large-4-0", "hi", { maxTokens: 10, reasoning: false });
  await complete(env, "x-ai/grok-4.7", "hi", { maxTokens: 10 });
  assert.deepEqual(sent[0].reasoning, { enabled: false });
  assert.equal("reasoning" in sent[1], false);
});

test("an empty reply that hit the token limit is not retried and keeps its cost", async () => {
  stubFetch({ choices: [{ message: { content: null }, finish_reason: "length" }], usage: { cost: 0.01, completion_tokens: 2000 } });
  await assert.rejects(complete(env, "m", "hi", { maxTokens: 2000 }), (e: unknown) => {
    assert.ok(e instanceof ModelError);
    assert.equal(e.retry, false);
    assert.equal(e.cost, 0.01);
    assert.match(e.message, /ran out of tokens/);
    return true;
  });
});

test("any other empty reply can be retried", async () => {
  stubFetch({ choices: [{ message: { content: "" }, finish_reason: "stop" }], usage: {} });
  await assert.rejects(complete(env, "m", "hi", { maxTokens: 10 }), (e: unknown) => e instanceof ModelError && e.retry);
});
