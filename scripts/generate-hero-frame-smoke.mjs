#!/usr/bin/env node
/**
 * generate-hero-frame-smoke.mjs
 *
 * Writes 6 clearly-labeled SVG dev fixtures into
 *   public/images/hero-frames/_dev-smoke/frame-001.svg … frame-006.svg
 *
 * Purpose: exercise the `<HeroFrameSequence>` runtime end-to-end **without
 * commissioning art**. Each SVG includes large "DEV FIXTURE — REPLACE WITH
 * COMMISSIONED ART" text so it can never be mistaken for production art if
 * one accidentally leaks into a build.
 *
 * NEVER use these frames in a real route. The slug `_dev-smoke` lives in the
 * `heroFrames` manifest only for QA via `/dev/showcase`.
 *
 * Usage:
 *   node scripts/generate-hero-frame-smoke.mjs
 *   # or via npm script:
 *   npm run generate:hero-frame-smoke
 *
 * The output folder is .gitignored at `public/images/hero-frames/_dev-smoke/`.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images", "hero-frames", "_dev-smoke");
mkdirSync(outDir, { recursive: true });

const FRAME_COUNT = 6;
const W = 1600;
const H = 900;

// Six tonal stops sweeping the OWL palette — keeps the scrub visually obvious.
const TONES = [
  { bg: "#FBF6EC", text: "#1C2B4A", accent: "#1A9994" }, // cream / ink / teal
  { bg: "#F3EBDA", text: "#1C2B4A", accent: "#137070" }, // cream-deep / ink / teal-deep
  { bg: "#F8C975", text: "#1C2B4A", accent: "#F5A623" }, // amber-soft / ink / amber
  { bg: "#F5A623", text: "#FBF6EC", accent: "#1C2B4A" }, // amber / cream / ink
  { bg: "#2D4A3A", text: "#FBF6EC", accent: "#F8C975" }, // forest / cream / amber-soft
  { bg: "#1A9994", text: "#FBF6EC", accent: "#F5A623" }, // teal / cream / amber
];

function buildFrame(index) {
  const t = TONES[index - 1];
  const pct = Math.round(((index - 1) / (FRAME_COUNT - 1)) * 100);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <!-- DEV FIXTURE — REPLACE WITH COMMISSIONED ART -->
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  <!-- diagonal warning stripe -->
  <g opacity="0.10">
    ${Array.from({ length: 24 })
      .map((_, i) => {
        const x = i * 80 - H;
        return `<rect x="${x}" y="0" width="40" height="${H}" fill="${t.accent}" transform="skewX(-30)"/>`;
      })
      .join("\n    ")}
  </g>
  <!-- frame badge -->
  <g transform="translate(80,80)">
    <rect width="220" height="80" rx="40" fill="${t.accent}"/>
    <text x="110" y="52" font-family="ui-sans-serif, system-ui, sans-serif"
          font-size="36" font-weight="800" fill="${t.bg}" text-anchor="middle">
      FRAME ${String(index).padStart(2, "0")}
    </text>
  </g>
  <!-- progress bar -->
  <g transform="translate(80,${H - 120})">
    <rect width="${W - 160}" height="12" rx="6" fill="${t.text}" opacity="0.15"/>
    <rect width="${((W - 160) * pct) / 100}" height="12" rx="6" fill="${t.accent}"/>
  </g>
  <!-- centered label -->
  <g text-anchor="middle">
    <text x="${W / 2}" y="${H / 2 - 30}"
          font-family="ui-sans-serif, system-ui, sans-serif"
          font-size="92" font-weight="900" fill="${t.text}">
      DEV FIXTURE
    </text>
    <text x="${W / 2}" y="${H / 2 + 40}"
          font-family="ui-sans-serif, system-ui, sans-serif"
          font-size="38" font-weight="600" fill="${t.text}" opacity="0.8">
      Replace with commissioned art
    </text>
    <text x="${W / 2}" y="${H / 2 + 100}"
          font-family="ui-monospace, SFMono-Regular, monospace"
          font-size="22" font-weight="500" fill="${t.text}" opacity="0.5">
      scroll-progress: ${pct}%
    </text>
  </g>
</svg>`;
}

let written = 0;
for (let i = 1; i <= FRAME_COUNT; i++) {
  const idx = String(i).padStart(3, "0");
  const path = join(outDir, `frame-${idx}.svg`);
  writeFileSync(path, buildFrame(i), "utf8");
  written++;
}

console.log(
  `Wrote ${written} smoke-test frame${written === 1 ? "" : "s"} to ` +
    `public/images/hero-frames/_dev-smoke/`
);
console.log("Mount via <HeroFrameSequence slug=\"_dev-smoke\" /> in /dev/showcase to verify.");
