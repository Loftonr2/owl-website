#!/usr/bin/env node
/**
 * fetch-youtube-videos.mjs
 *
 * Pulls the public RSS feed for the OWL YouTube channel, extracts every
 * `videoId` + title + published date, and writes the result to
 *   `scripts/.youtube-channel-videos.json`
 *
 * **No YouTube API key required.** YouTube's RSS feed is anonymous + free.
 *
 * The output is a mapping table — the user reviews it and pastes the right
 * `youtubeId` into each `SEED_VIDEOS[*]` entry in `src/lib/seed/videos.ts`.
 * If the user prefers automatic wiring, pass `--write` and the script will
 * patch videos.ts directly (best-effort title-match).
 *
 * Usage
 *   node scripts/fetch-youtube-videos.mjs           # just write the JSON
 *   node scripts/fetch-youtube-videos.mjs --write   # also patch videos.ts
 *
 * Channel
 *   OWL Sing Together Channel
 *   https://www.youtube.com/@Owlsingtogetherchannel
 *   Channel ID: UCPeDZMf79CEO7dgpwJeCmMg
 */

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHANNEL_ID = "UCPeDZMf79CEO7dgpwJeCmMg";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const SHOULD_WRITE = process.argv.includes("--write");

// ── fetch ───────────────────────────────────────────────────────────────────
console.log(`[fetch-youtube-videos] Fetching ${FEED_URL} …`);
let xml;
try {
  const res = await fetch(FEED_URL);
  if (!res.ok) {
    console.error(`[fetch-youtube-videos] HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  xml = await res.text();
} catch (err) {
  console.error("[fetch-youtube-videos] Network error:", err.message);
  process.exit(1);
}

// ── parse — RSS feed structure ─────────────────────────────────────────────
//
// <entry>
//   <id>yt:video:VIDEO_ID</id>
//   <yt:videoId>VIDEO_ID</yt:videoId>
//   <title>Video title</title>
//   <published>2026-…</published>
//   <media:group>
//     <media:description>…</media:description>
//     <media:thumbnail url="…" />
//   </media:group>
// </entry>
//
// Regex parsing is acceptable here because YouTube's feed is stable +
// well-formed; we don't take node_modules churn for a 10-line parse.

const entries = [];
const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
const idRe = /<yt:videoId>([^<]+)<\/yt:videoId>/;
const titleRe = /<title>([\s\S]*?)<\/title>/;
const pubRe = /<published>([^<]+)<\/published>/;
const descRe = /<media:description>([\s\S]*?)<\/media:description>/;

let match;
while ((match = entryRe.exec(xml)) !== null) {
  const block = match[1];
  const videoId = block.match(idRe)?.[1];
  const title = block.match(titleRe)?.[1]?.trim();
  const published = block.match(pubRe)?.[1];
  const description = block.match(descRe)?.[1]?.trim().slice(0, 240);
  if (!videoId || !title) continue;
  entries.push({
    videoId,
    title,
    published,
    description,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  });
}

if (entries.length === 0) {
  console.error(
    "[fetch-youtube-videos] No video entries found. The channel may be brand-new " +
      "or the RSS feed format changed. Check the feed manually:\n  " +
      FEED_URL
  );
  process.exit(1);
}

console.log(`[fetch-youtube-videos] Parsed ${entries.length} video(s) from the feed.`);

// ── write the JSON manifest ─────────────────────────────────────────────────
const outPath = join(__dirname, ".youtube-channel-videos.json");
writeFileSync(
  outPath,
  JSON.stringify({ channelId: CHANNEL_ID, fetchedAt: new Date().toISOString(), entries }, null, 2),
  "utf8"
);
console.log(`[fetch-youtube-videos] Wrote ${outPath}`);

// ── optional: patch videos.ts by title match ────────────────────────────────
if (SHOULD_WRITE) {
  const seedPath = join(repoRoot, "src", "lib", "seed", "videos.ts");
  let seedSrc;
  try {
    seedSrc = readFileSync(seedPath, "utf8");
  } catch (err) {
    console.error("[fetch-youtube-videos] Could not read videos.ts:", err.message);
    process.exit(1);
  }

  // Find each seed entry's slug + title, then find the closest channel entry by
  // title. We use a simple lowercase-substring score — both sides containing
  // each other = perfect, one containing the other = strong, common word
  // overlap = weak. We only auto-write when the score is "strong" or better.
  const seedEntryRe = /\{\s*slug:\s*"([^"]+)"[^]*?title:\s*"([^"]+)"[^]*?youtubeId:\s*(null|"[^"]*")/g;
  const seeds = [];
  let m;
  while ((m = seedEntryRe.exec(seedSrc)) !== null) {
    seeds.push({ slug: m[1], title: m[2], offset: m.index, full: m[0], current: m[3] });
  }

  console.log(`[fetch-youtube-videos] Found ${seeds.length} seed entr${seeds.length === 1 ? "y" : "ies"}.`);
  console.log("\nProposed mapping (auto-patch will only fire on strong matches):\n");

  function score(a, b) {
    const A = a.toLowerCase();
    const B = b.toLowerCase();
    if (A === B) return 4;
    if (A.includes(B) || B.includes(A)) return 3;
    const aw = new Set(A.split(/\W+/).filter(Boolean));
    const bw = new Set(B.split(/\W+/).filter(Boolean));
    let common = 0;
    aw.forEach((w) => bw.has(w) && common++);
    if (common >= 3) return 2;
    if (common >= 1) return 1;
    return 0;
  }

  let patched = seedSrc;
  let writes = 0;
  for (const s of seeds) {
    const ranked = entries
      .map((e) => ({ ...e, _score: score(s.title, e.title) }))
      .sort((a, b) => b._score - a._score);
    const best = ranked[0];
    const verdict = best._score >= 3 ? "WRITE" : best._score >= 1 ? "review" : "no match";
    console.log(
      `  [${verdict.padEnd(8)}] slug="${s.slug}"\n      seed: ${s.title}\n      best: ${best.title} (${best.videoId})\n`
    );
    if (best._score >= 3) {
      // Replace `youtubeId: null` (or existing string) on this entry with the matched id.
      const replacement = s.full.replace(
        /youtubeId:\s*(null|"[^"]*")/,
        `youtubeId: "${best.videoId}"`
      );
      patched = patched.replace(s.full, replacement);
      writes++;
    }
  }

  if (writes > 0) {
    writeFileSync(seedPath, patched, "utf8");
    console.log(`[fetch-youtube-videos] Patched ${writes} youtubeId field${writes === 1 ? "" : "s"} in videos.ts`);
  } else {
    console.log(`[fetch-youtube-videos] No strong-match writes performed. Edit videos.ts manually.`);
  }
}

// ── print a manual-paste summary ────────────────────────────────────────────
console.log("\nManual-paste reference (copy into src/lib/seed/videos.ts as you map):\n");
for (const e of entries.slice(0, 30)) {
  console.log(`  // ${e.title}`);
  console.log(`  youtubeId: "${e.videoId}",`);
}
if (entries.length > 30) console.log(`  // ... ${entries.length - 30} more`);
console.log("");
