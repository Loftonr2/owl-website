#!/usr/bin/env node
/**
 * scripts/generate-printful-mockups.js
 *
 * For each physical OWL product, fetches the Printful catalog product thumbnail
 * (a generic, publicly-accessible product photo from Printful's CDN), downloads
 * it to public/images/products/, and wires it into src/lib/images.ts.
 *
 * These are the clean product-type photos (e.g. "Kids T-Shirt", "Throw Blanket")
 * showing what the item looks like. You can replace them later with OWL-branded
 * mockups once you export them from Printful's dashboard.
 *
 * Usage:
 *   node scripts/generate-printful-mockups.js
 *
 * Requires PRINTFUL_API_KEY in .env.local
 */

const fs    = require("fs");
const path  = require("path");
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

const API_KEY      = process.env.PRINTFUL_API_KEY;
const STORE_ID     = 18286248;
const PRODUCTS_DIR = path.join(__dirname, "../public/images/products");
const IMAGES_TS    = path.join(__dirname, "../src/lib/images.ts");

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local");
  process.exit(1);
}

// ── Physical products: slug → Printful sync ID + catalog product ID ─────────
// catalog_product_id confirmed from previous API run (6/8/2026)
const PHYSICAL_PRODUCTS = [
  { slug: "owl-cotton-kids-t-shirt",  printfulId: 436901241, catalogId: 476, name: "OWL Cotton Kids T-Shirt" },
  { slug: "owl-throw-blanket",        printfulId: 436902009, catalogId: 395, name: "OWL Throw Blanket" },
  { slug: "owl-flat-bill-cap",        printfulId: 436900911, catalogId: 91,  name: "OWL Flat Bill Cap" },
  { slug: "owl-insulated-tumbler",    printfulId: null,      catalogId: 742, name: "OWL Insulated Tumbler" },
  { slug: "owl-wine-tumbler",         printfulId: null,      catalogId: 632, name: "OWL Wine Tumbler" },
  { slug: "owl-enamel-mug",           printfulId: null,      catalogId: 407, name: "OWL Enamel Mug" },
  { slug: "owl-spiral-notebook",      printfulId: null,      catalogId: 474, name: "OWL Spiral Notebook" },
  { slug: "owl-holographic-stickers", printfulId: null,      catalogId: 673, name: "OWL Holographic Stickers" },
  { slug: "owl-mouse-pad",            printfulId: null,      catalogId: 518, name: "OWL Mouse Pad" },
  { slug: "owl-water-bottle",         printfulId: null,      catalogId: 382, name: "OWL Water Bottle" },
  { slug: "owl-duffle-bag",           printfulId: null,      catalogId: 465, name: "OWL Duffle Bag" },
  { slug: "owl-backpack",             printfulId: null,      catalogId: 279, name: "OWL Backpack" },
  { slug: "owl-infant-bodysuit",      printfulId: null,      catalogId: 234, name: "OWL Infant Bodysuit" },
  { slug: "owl-tote-bag",             printfulId: null,      catalogId: 367, name: "OWL Eco-Friendly Tote Bag" },
  { slug: "owl-glossy-mug",           printfulId: null,      catalogId: 19,  name: "OWL Glossy Mug" },
  { slug: "owl-sweatshirt",           printfulId: null,      catalogId: 493, name: "OWL Sweatshirt" },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pf(endpoint) {
  const res = await fetch(`https://api.printful.com${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "X-PF-Store-Id": String(STORE_ID),
    },
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, data: json };
}

function downloadPublicFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith("https") ? https : require("http");
    proto.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        downloadPublicFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function updateImagesTs(slug, localPath, altText) {
  let content = fs.readFileSync(IMAGES_TS, "utf-8");
  const pattern = new RegExp('\\s*"' + slug.replace(/-/g, "\\-") + '":\\s*\\{[^}]*\\},?\\n', "g");
  content = content.replace(pattern, "\n");
  const marker = "} as const satisfies Record<string, ProductImages>;";
  if (!content.includes(marker)) { console.error("  ❌ marker not found in images.ts"); return false; }
  const entry = `  "${slug}": {\n    primary: { src: "${localPath}", alt: "${altText}" },\n  },\n`;
  content = content.replace(marker, entry + marker);
  fs.writeFileSync(IMAGES_TS, content, "utf-8");
  return true;
}

// Fill in printfulId from recovery report for any nulls above
function loadRecovery() {
  const p = path.join(__dirname, "../printful-recovery-report.json");
  if (!fs.existsSync(p)) return new Map();
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const map = new Map();
  for (const prod of (data.foundProducts || [])) {
    map.set(prod.owlProduct.slug, prod.printfulId);
  }
  return map;
}

async function getCatalogImageUrl(catalogId) {
  // Fetch the Printful catalog product — its .image field is a public CDN URL
  const catalog = await pf(`/products/${catalogId}`);
  await sleep(150);
  if (!catalog.ok) {
    console.log(`\n    catalog fetch failed: ${catalog.status}`);
    return null;
  }
  const catProduct = catalog.data.result?.product || catalog.data.result || {};
  const imageUrl = catProduct.image || catProduct.thumbnail_url;
  if (imageUrl) return { url: imageUrl, source: `catalog/${catalogId}` };
  return null;
}

async function main() {
  console.log("\n🦉 Printful Product Image Fetcher\n");
  console.log("Strategy: sync_product.thumbnail → file.thumbnail_url → catalog product image\n");

  const recovery = loadRecovery();

  // Fill in any null printfulIds from recovery report
  for (const p of PHYSICAL_PRODUCTS) {
    if (!p.printfulId && recovery.has(p.slug)) {
      p.printfulId = recovery.get(p.slug);
    }
  }

  let updated = 0, errors = 0, skipped = 0;

  for (const prod of PHYSICAL_PRODUCTS) {
    const destPng = path.join(PRODUCTS_DIR, `${prod.slug}.png`);

    // Already downloaded and valid?
    if (fs.existsSync(destPng) && fs.statSync(destPng).size > 5000) {
      const localPath = `/images/products/${prod.slug}.png`;
      updateImagesTs(prod.slug, localPath, prod.name);
      console.log(`  ⏭  ${prod.slug} — already on disk, wiring`);
      skipped++; updated++;
      continue;
    }

    if (!prod.catalogId) {
      console.log(`  ⚠️  ${prod.slug} — no catalog ID, skipping`);
      errors++;
      continue;
    }

    process.stdout.write(`  [${prod.slug}] catalog/${prod.catalogId}... `);
    const result = await getCatalogImageUrl(prod.catalogId);

    if (!result) {
      console.log("❌ no image URL found");
      errors++;
      continue;
    }

    console.log(`\n    source: ${result.source}`);
    console.log(`    url:    ${result.url.slice(0, 80)}`);
    process.stdout.write(`    downloading... `);

    try {
      await downloadPublicFile(result.url, destPng);
      const size = fs.statSync(destPng).size;
      if (size < 500) throw new Error(`file too small: ${size} bytes`);

      const localPath = `/images/products/${prod.slug}.png`;
      updateImagesTs(prod.slug, localPath, prod.name);
      console.log(`✅ ${Math.round(size / 1024)}KB`);
      updated++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      if (fs.existsSync(destPng)) fs.unlinkSync(destPng);
      errors++;
    }

    await sleep(400);
  }

  console.log("\n==========================================");
  console.log(`✅ Updated: ${updated} | ⏭  Skipped: ${skipped} | ❌ Errors: ${errors}`);
  console.log("==========================================");

  if (updated > 0) {
    console.log("\n🚀 Next steps:");
    console.log("   git add public/images/products/ src/lib/images.ts");
    console.log('   git commit -m "feat: add product images from Printful catalog"');
    console.log("   git push");
  }
  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });
