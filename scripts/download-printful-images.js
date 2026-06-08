#!/usr/bin/env node
/**
 * scripts/download-printful-images.js
 *
 * Fixes product images for the OWL store in two ways:
 *
 *   1. STICKERS with local PNGs already in public/images/products/
 *      → Writes /images/products/{slug}.png into images.ts (no download needed)
 *
 *   2. PHYSICAL PRODUCTS (apparel, drinkware, accessories) with private Printful URLs
 *      → Downloads the image using the Printful API Bearer token
 *      → Saves to public/images/products/{slug}.png
 *      → Writes /images/products/{slug}.png into images.ts
 *
 * Usage:
 *   node scripts/download-printful-images.js
 *
 * Requires: PRINTFUL_API_KEY in .env.local
 */

const fs   = require("fs");
const path = require("path");
const https = require("https");

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...rest] = line.split("=");
    if (k && rest.length > 0 && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

const API_KEY    = process.env.PRINTFUL_API_KEY;
const STORE_ID   = 18286248; // OwlSingTogetherStore (Etsy)
const PRODUCTS_DIR = path.join(__dirname, "../public/images/products");
const IMAGES_TS    = path.join(__dirname, "../src/lib/images.ts");

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local");
  process.exit(1);
}

// ── Slug → local file mapping (stickers already on disk) ────────────────────
// These all exist as public/images/products/{slug}.png
const LOCAL_ONLY_SLUGS = new Set([
  "owl-abcs-sticker-set",
  "owl-animal-sticker-set",
  "owl-animal-sticker-set-ii",
  "owl-animal-sticker-set-iii",
  "owl-animal-sticker-set-iv",
  "owl-aplus-sticker-set",
  "owl-baby-boy-sticker-set",
  "owl-baby-girl-sticker-set",
  "owl-colors-sticker-set",
  "owl-counting-sticker-set",
  "owl-explorer-sticker-set",
  "owl-holiday-sticker-set",
  "owl-insect-sticker-set",
  "owl-insect-sticker-set-ii",
  "owl-math-sticker-set",
  "owl-music-sticker-set",
  "owl-numbers-sticker-set",
  "owl-preschool-sticker-set",
  "owl-science-sticker-set",
  "owl-seasons-sticker-set",
  "owl-swimming-sticker-set",
]);

// ── Slugs to download from Printful (using printful-image-sync-results.json) ─
// If the JSON isn't present, we'll call the API fresh for each.
const PHYSICAL_SLUGS = [
  "owl-cotton-kids-t-shirt",
  "owl-throw-blanket",
  "owl-flat-bill-cap",
  "owl-insulated-tumbler",
  "owl-wine-tumbler",
  "owl-enamel-mug",
  "owl-spiral-notebook",
  "owl-holographic-stickers",
  "owl-mouse-pad",
  "owl-water-bottle",
  "owl-duffle-bag",
  "owl-backpack",
  "owl-infant-bodysuit",
  "owl-tote-bag",
  "owl-glossy-mug",
  "owl-sweatshirt",
  // t-shirt + beanie have no Printful file yet — handled below
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function downloadFile(url, dest, authHeader) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = { headers: {} };
    if (authHeader) options.headers["Authorization"] = authHeader;

    const request = https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        file.close();
        fs.unlinkSync(dest);
        downloadFile(response.headers.location, dest, null)
          .then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    });
    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function printfulGet(endpoint) {
  const res = await fetch(`https://api.printful.com${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "X-PF-Store-Id": String(STORE_ID),
    },
  });
  const json = await res.json();
  return { ok: res.ok, data: json };
}

function updateImagesTs(slug, localPath, altText) {
  let content = fs.readFileSync(IMAGES_TS, "utf-8");

  // Remove existing entry for this slug (whether Printful CDN or local)
  const existingPattern = new RegExp(`\\s*"${slug.replace(/-/g, "\\-")}":\\s*\\{[^}]*\\},?\\n`, "g");
  content = content.replace(existingPattern, "\n");

  const marker = "} as const satisfies Record<string, ProductImages>;";
  if (!content.includes(marker)) {
    console.error(`  ❌ marker not found in images.ts`);
    return false;
  }

  const newEntry = `  "${slug}": {\n    primary: { src: "${localPath}", alt: "${altText}" },\n  },\n`;
  content = content.replace(marker, newEntry + marker);
  fs.writeFileSync(IMAGES_TS, content, "utf-8");
  return true;
}

// ── Load sync results for Printful IDs ──────────────────────────────────────
function loadSyncResults() {
  const p = path.join(__dirname, "../printful-image-sync-results.json");
  if (!fs.existsSync(p)) return new Map();
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const map = new Map();
  for (const prod of (data.products || [])) {
    map.set(prod.slug, { printfulId: prod.printfulId, imageUrl: prod.imageUrl });
  }
  return map;
}

function loadRecoveryReport() {
  const p = path.join(__dirname, "../printful-recovery-report.json");
  if (!fs.existsSync(p)) return new Map();
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const map = new Map();
  for (const prod of (data.foundProducts || [])) {
    map.set(prod.owlProduct.slug, { printfulId: prod.printfulId, name: prod.owlProduct.name });
  }
  return map;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🦉 OWL Product Image Downloader\n");

  const syncMap     = loadSyncResults();
  const recoveryMap = loadRecoveryReport();

  let updated = 0;
  let downloaded = 0;
  let skipped = 0;
  let errors = 0;

  // ── 1. LOCAL-ONLY slugs ──────────────────────────────────────────────────
  console.log("📁 Step 1: Wiring local sticker images into images.ts\n");

  for (const slug of LOCAL_ONLY_SLUGS) {
    const pngPath = path.join(PRODUCTS_DIR, `${slug}.png`);
    const jpgPath = path.join(PRODUCTS_DIR, `${slug}.jpg`);
    const exists  = fs.existsSync(pngPath) || fs.existsSync(jpgPath);
    const ext     = fs.existsSync(pngPath) ? "png" : "jpg";

    if (!exists) {
      console.log(`  ⚠️  ${slug} — no local file found, skipping`);
      skipped++;
      continue;
    }

    const localPath = `/images/products/${slug}.${ext}`;
    const altText   = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const ok = updateImagesTs(slug, localPath, altText);
    if (ok) {
      console.log(`  ✅ ${slug} → ${localPath}`);
      updated++;
    } else {
      errors++;
    }
  }

  // ── 2. PHYSICAL products — download from Printful ────────────────────────
  console.log("\n📦 Step 2: Downloading physical product images from Printful\n");

  for (const slug of PHYSICAL_SLUGS) {
    const destPng = path.join(PRODUCTS_DIR, `${slug}.png`);
    const destJpg = path.join(PRODUCTS_DIR, `${slug}.jpg`);

    // Already downloaded?
    if (fs.existsSync(destPng) || fs.existsSync(destJpg)) {
      const ext = fs.existsSync(destPng) ? "png" : "jpg";
      const localPath = `/images/products/${slug}.${ext}`;
      const altText   = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      updateImagesTs(slug, localPath, altText);
      console.log(`  ⏭  ${slug} — already on disk, wiring`);
      updated++;
      skipped++;
      continue;
    }

    process.stdout.write(`  [${slug}] downloading... `);

    // Get the image URL — from sync results first, then live API
    let imageUrl = null;
    let altText  = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    const cached = syncMap.get(slug);
    if (cached?.imageUrl) {
      imageUrl = cached.imageUrl;
    } else {
      // Fetch fresh from Printful API
      const rec = recoveryMap.get(slug);
      if (rec?.printfulId) {
        const r = await printfulGet(`/sync/products/${rec.printfulId}`);
        await sleep(200);
        if (r.ok && r.data.result) {
          const sp = r.data.result.sync_product || {};
          const variants = r.data.result.sync_variants || [];
          imageUrl = sp.thumbnail_url;
          if (!imageUrl) {
            for (const v of variants) {
              for (const f of (v.files || [])) {
                if (f.preview_url || f.thumbnail_url) {
                  imageUrl = f.preview_url || f.thumbnail_url;
                  break;
                }
              }
              if (imageUrl) break;
            }
          }
          if (rec.name) altText = rec.name;
        }
      }
    }

    if (!imageUrl) {
      console.log("⚠️  no image URL available");
      errors++;
      continue;
    }

    // Download the image (private URLs need the auth header)
    const isPrivatePrintful = imageUrl.includes("files.cdn.printful.com") ||
                              imageUrl.includes("printful.com");
    const authHeader = isPrivatePrintful ? `Bearer ${API_KEY}` : null;
    const destFile   = destPng; // save as .png regardless

    try {
      await downloadFile(imageUrl, destFile, authHeader);
      const stat = fs.statSync(destFile);
      if (stat.size < 1000) {
        fs.unlinkSync(destFile);
        throw new Error(`file too small (${stat.size} bytes) — likely an error page`);
      }
      console.log(`✅ saved (${Math.round(stat.size / 1024)}KB)`);

      const localPath = `/images/products/${slug}.png`;
      updateImagesTs(slug, localPath, altText);
      updated++;
      downloaded++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      if (fs.existsSync(destFile)) fs.unlinkSync(destFile);
      errors++;
    }

    await sleep(300); // polite rate limiting
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n==========================================");
  console.log("📊 RESULTS");
  console.log("==========================================");
  console.log(`✅ images.ts entries updated: ${updated}`);
  console.log(`⬇️  images downloaded:         ${downloaded}`);
  console.log(`⏭  already on disk:            ${skipped}`);
  console.log(`❌ errors:                     ${errors}`);
  console.log("==========================================");

  if (errors === 0 || updated > 0) {
    console.log("\n🚀 Next steps:");
    console.log("   git add public/images/products/ src/lib/images.ts");
    console.log('   git commit -m "chore: download and wire local Printful product images"');
    console.log("   git push");
  }
  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });
