#!/usr/bin/env node
/**
 * perf-budget.mjs
 *
 * Enforces the per-route JS size budget from OWL_BUILD_RULES §6:
 *   "Bundle audit on every PR: error if shared JS payload exceeds 200KB gzipped."
 *
 * How it works
 *   1. Reads `.next/app-build-manifest.json` (must run `next build` first).
 *   2. For each app route, sums the byte size of every JS chunk attributed
 *      to it. We measure raw size on disk and apply a gzip approximation
 *      (default 0.30 — Brotli would be closer to 0.25).
 *   3. Compares each route to the budget (default 200KB approximated gzip).
 *   4. Prints a table and exits 1 if any route is over budget.
 *
 * Why an approximation
 *   Running real gzip on every chunk is slow and adds a sharp dependency.
 *   The 0.30 ratio is conservative for typical webpack output; in practice
 *   real gzip is usually a hair smaller. If a route is borderline, refine
 *   with `npm run analyze` (Next's bundle analyzer).
 *
 * Usage
 *   npm run build && npm run perf:budget
 *   # CI: npm run perf:budget -- --max=200 --ratio=0.30
 *
 * Flags
 *   --max=<KB>     Budget in KB gzipped (default 200)
 *   --ratio=<n>    Raw → gzip approximation ratio (default 0.30)
 *   --json         Emit machine-readable JSON (no exit code on overflow)
 *   --verbose      Per-chunk breakdown for the worst route
 */

import { readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ── flags ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function flag(name, fallback) {
  const m = argv.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split("=")[1] : fallback;
}
const maxKb = Number(flag("max", "200"));
const ratio = Number(flag("ratio", "0.30"));
const asJson = argv.includes("--json");
const verbose = argv.includes("--verbose");

// ── locate the build manifest ────────────────────────────────────────────────
const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const manifestPath = join(root, ".next", "app-build-manifest.json");
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (err) {
  console.error(
    `[perf:budget] Could not read ${manifestPath}. Run \`npm run build\` first.`
  );
  console.error(err.message);
  process.exit(2);
}

// `pages` is App-Router-confusingly named; it maps route → chunk filenames.
const routes = manifest.pages || {};
const nextDir = join(root, ".next");

// ── measure ──────────────────────────────────────────────────────────────────
const results = [];
for (const [route, chunks] of Object.entries(routes)) {
  let total = 0;
  const chunkSizes = [];
  for (const chunk of chunks) {
    const p = join(nextDir, chunk);
    try {
      const s = statSync(p).size;
      total += s;
      chunkSizes.push({ chunk, bytes: s });
    } catch {
      // Chunk might be split across builds — skip silently.
    }
  }
  const approxGzip = total * ratio;
  results.push({
    route,
    rawBytes: total,
    approxGzipBytes: approxGzip,
    chunks: chunkSizes,
  });
}
results.sort((a, b) => b.approxGzipBytes - a.approxGzipBytes);

const budgetBytes = maxKb * 1024;
const overflows = results.filter((r) => r.approxGzipBytes > budgetBytes);

// ── output ───────────────────────────────────────────────────────────────────
if (asJson) {
  console.log(
    JSON.stringify({ maxKb, ratio, results, overflows }, null, 2)
  );
  process.exit(0);
}

const fmt = (b) => `${(b / 1024).toFixed(1)} KB`;
const status = (b) => (b > budgetBytes ? "OVER " : "  ok ");

console.log(
  `[perf:budget] Budget = ${maxKb} KB gzipped (ratio ${ratio} applied to raw on-disk size)\n`
);
console.log("status  route                                     raw          ~gzip");
console.log("------  ----------------------------------------- -----------  -----------");
for (const r of results) {
  const route = r.route.padEnd(41).slice(0, 41);
  console.log(
    `${status(r.approxGzipBytes)}  ${route} ${fmt(r.rawBytes).padStart(10)} ${fmt(
      r.approxGzipBytes
    ).padStart(13)}`
  );
}
console.log();

if (verbose && results[0]) {
  const worst = results[0];
  console.log(
    `[perf:budget] Worst route (${worst.route}) chunk breakdown:`
  );
  for (const c of worst.chunks.sort((a, b) => b.bytes - a.bytes).slice(0, 10)) {
    console.log(`   ${fmt(c.bytes).padStart(10)}  ${c.chunk}`);
  }
  console.log();
}

if (overflows.length > 0) {
  console.error(
    `[perf:budget] ${overflows.length} route(s) over the ${maxKb} KB budget:`
  );
  for (const o of overflows) {
    console.error(
      `   ${o.route}: ${fmt(o.approxGzipBytes)} (over by ${fmt(
        o.approxGzipBytes - budgetBytes
      )})`
    );
  }
  console.error(
    "\nFix: run `npm run analyze` (Next's bundle analyzer) to find the bloat, " +
      "or lazy-import the offending dep.\n"
  );
  process.exit(1);
}

console.log(`[perf:budget] All routes within budget. ✔︎`);
