// Golden check: the existing Python bench.py reproduces the committed report.md for both builder
// runs. When the TypeScript port lands, point `render` at it; the expected files stay the same.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const runs = path.join(root, "product/bench/runs");
const script = path.join(root, ".claude/skills/personal-bench/scripts/bench.py");

function render(runName) {
  const dir = path.join(mkdtempSync(path.join(tmpdir(), "mysi-")), runName);
  cpSync(path.join(runs, runName), dir, { recursive: true });
  execFileSync("python3", [script, "report", dir]);
  return readFileSync(path.join(dir, "report.md"), "utf8");
}

for (const run of ["2026-10-19-builder", "2026-10-19-builder-2"]) {
  test(`report for ${run} matches committed report.md`, { skip: !existsSync(script) }, () => {
    assert.equal(render(run), readFileSync(path.join(runs, run, "report.md"), "utf8"));
  });
}
