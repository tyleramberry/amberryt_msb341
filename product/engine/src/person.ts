// One Durable Object per person, reached through their personal connector URL /mcp/u/<key>
// (decision 008). It holds their run ids and, for each finished run, the winners, so
// which_model and resume work in a later chat. The key is the object's name; never log it.

import { DurableObject } from "cloudflare:workers";
import type { Env } from "./models.ts";

export type ProfileEntry = {
  run_id: string;
  finished_at: string;
  winner: string | null;
  by_category: { category: string; winner: string | null }[];
  memory_line: string;
  mode: string; // "openrouter" or "claude_code"
};

export class PersonObject extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS person (k TEXT PRIMARY KEY, v TEXT);
      CREATE TABLE IF NOT EXISTS runs (run_id TEXT PRIMARY KEY, created_at TEXT);
      CREATE TABLE IF NOT EXISTS results (
        run_id TEXT PRIMARY KEY, finished_at TEXT, winner TEXT, by_category TEXT, memory_line TEXT, mode TEXT);
    `);
  }

  // Only keys minted on the setup page work, so a typo in the URL doesn't start a blank profile.
  create() {
    this.sql.exec("INSERT OR IGNORE INTO person (k, v) VALUES ('created_at', ?)", new Date().toISOString());
  }

  exists(): boolean {
    return this.sql.exec("SELECT 1 FROM person WHERE k = 'created_at'").toArray().length > 0;
  }

  addRun(runId: string) {
    this.sql.exec("INSERT OR IGNORE INTO runs (run_id, created_at) VALUES (?, ?)", runId, new Date().toISOString());
  }

  // Newest first.
  runIds(): string[] {
    return this.sql
      .exec<{ run_id: string }>("SELECT run_id FROM runs ORDER BY created_at DESC")
      .toArray()
      .map((r) => r.run_id);
  }

  saveResult(entry: ProfileEntry) {
    this.sql.exec(
      "INSERT OR REPLACE INTO results (run_id, finished_at, winner, by_category, memory_line, mode) VALUES (?, ?, ?, ?, ?, ?)",
      entry.run_id,
      entry.finished_at,
      entry.winner,
      JSON.stringify(entry.by_category),
      entry.memory_line,
      entry.mode,
    );
  }

  // Newest first.
  profile(): ProfileEntry[] {
    return this.sql
      .exec<{ run_id: string; finished_at: string; winner: string | null; by_category: string; memory_line: string; mode: string }>(
        "SELECT run_id, finished_at, winner, by_category, memory_line, mode FROM results ORDER BY finished_at DESC",
      )
      .toArray()
      .map((r) => ({ ...r, by_category: JSON.parse(r.by_category) }));
  }
}
