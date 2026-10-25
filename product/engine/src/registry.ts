// One global Durable Object: the daily run cap (the connector has no sign-in, so this bounds
// spend across everyone), an index of run ids for next scope's re-runs, and rerun_test interest.

import { DurableObject } from "cloudflare:workers";
import type { Env } from "./models.ts";

export class RegistryObject extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS daily (day TEXT PRIMARY KEY, runs INTEGER);
      CREATE TABLE IF NOT EXISTS runs (run_id TEXT PRIMARY KEY, created_at TEXT, started_at TEXT);
      CREATE TABLE IF NOT EXISTS interest (run_id TEXT, model TEXT, at TEXT);
    `);
  }

  addRun(runId: string) {
    this.sql.exec("INSERT OR IGNORE INTO runs (run_id, created_at) VALUES (?, ?)", runId, new Date().toISOString());
  }

  // Counts a started run against today's cap. Returns false (and counts nothing) when full.
  takeRunSlot(runId: string, maxPerDay: number): boolean {
    const day = new Date().toISOString().slice(0, 10);
    const used = this.sql.exec<{ runs: number }>("SELECT runs FROM daily WHERE day = ?", day).toArray()[0]?.runs ?? 0;
    if (used >= maxPerDay) return false;
    this.sql.exec("INSERT OR REPLACE INTO daily (day, runs) VALUES (?, ?)", day, used + 1);
    this.sql.exec("UPDATE runs SET started_at = ? WHERE run_id = ?", new Date().toISOString(), runId);
    return true;
  }

  // Newest first, for the owner's log (/admin).
  list(): { run_id: string; created_at: string; started_at: string | null }[] {
    return this.sql
      .exec<{ run_id: string; created_at: string; started_at: string | null }>("SELECT run_id, created_at, started_at FROM runs ORDER BY created_at DESC")
      .toArray();
  }

  recordInterest(runId: string, model: string) {
    this.sql.exec("INSERT INTO interest (run_id, model, at) VALUES (?, ?, ?)", runId, model, new Date().toISOString());
  }
}
