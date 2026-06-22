#!/usr/bin/env node
/**
 * scripts/sync-images-from-printful.js
 *
 * Reads printful-recovery-report.json, fetches each product's detail
 * from Printful to get thumbnail/preview URLs, then updates src/lib/images.ts.
 *
 * Run AFTER recover-printful-products.js --dry-run has completed.
 *
 * Usage:
 *   node scripts/sync-images-from-printful.js
 */

const fs = require("fs");
const path = require("path");

// Load env
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...rest] = line.split("=");
    if (k && rest.length > 0 && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join("=").trim();
    }
  }
}

const API_KEY = process.env.PRINTFUL_API_KEY;
const BASE = "https://api.printful.com";
const STORE_ID = 18286248; // OwlSingTogetherStore (Etsy) — where products were found

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ Set PRINTFUL_API_KEY first:\n   $env:PRINTFUL_API_KEY = \"your_key\"");
  process.exit(1);
}

// Read recovery report
const reportPath = path.join(__dirname, "../printful-recovery-report.json");
if (!fs.existsSync(reportPath)) {
  console.error("❌ printful-recovery-report.json not found. Run recover-printful-products.js --dry-run first.");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
const foundProducts = report.foundProducts || [];
console.log(`\n🦉 Printful Image Sync from Recovery Report`);
console.log(`   Products to sync: ${foundProducts.length}\n`);

async function api(endpoint, storeId = null) {
  const headers = { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" };
  if (storeId) headers["X-PF-Store-Id"] = String(storeId);
  const res = await fetch(`${BASE}${endpoint}`, { headers });
  const text = await res.text();
  try { return { ok: res.ok, data: JSON.parse(text) }; }
  catch { return { ok: false, data: {} }; }
}

function updateImagesTs(slug, imageUrl, altText) {
  const imagesPath = path.join(__dirname, "../src/lib/images.ts");
  let content = fs.readFileSync(imagesPath, "utf-8");

  // Skip if already has a Printful CDN URL
  if (content.includes(`"${slug}":`) && content.includes("cdn.printful.com")) {
    const entryMatch = content.match(new RegExp(`"${slug}":\\s*\\{[^}]+\\}`));
    if (entryMatch && entryMatch[0].includes("cdn.printful.com")) {
      return "skipped";
    }
  }

  const marker = "} as const satisfies Record<string, ProductImages>;";
  if (!content.includes(marker)) return "error";

  // Remove existing entry if present (to avoid duplicates)
  const existingPattern = new RegExp(`\\s*"${slug}":\\s*\\{[^}]*\\},?\\n`, "g");
  content = content.replace(existingPattern, "\n");

  const newEntry = `  "${slug}": {\n    primary: { src: "${imageUrl}", alt: "${altText}" },\n  },\n`;
  content = content.replace(marker, newEntry + marker);
  fs.writeFileSync(imagesPath, content, "utf-8");
  return "updated";
}

async function main() {
  const results = { updated: 0, skipped: 0, noImage: 0, errors: 0 };
  const imageMap = [];

  for (const found of foundProducts) {
    const slug = found.owlProduct.slug;
    const printfulId = found.printfulId;
    const name = found.owlProduct.name;

    process.stdout.write(`   [${printfulId}] ${name}... `);

    // Fetch product detail to get preview image
    const r = await api(`/sync/products/${printfulId}`, STORE_ID);
    await new Promise(res => setTimeout(res, 150));

    let imageUrl = null;

    if (r.ok && r.data.result) {
      const syncProduct = r.data.result.sync_product || {};
      const variants = r.data.result.sync_variants || [];

      // Try thumbnail_url first
      imageUrl = syncProduct.thumbnail_url;

      // Try first variant's files for a preview
      if (!imageUrl && variants.length > 0) {
        for (const variant of variants) {
          const files = variant.files || [];
          const preview = files.find(f => f.type === "preview" || f.type === "default");
          if (preview && (preview.preview_url || preview.thumbnail_url)) {
            imageUrl = preview.preview_url || preview.thumbnail_url;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      console.log("⚠️  no image URL");
      results.noImage++;
      imageMap.push({ slug, name, printfulId, imageUrl: null, status: "no_image" });
      continue;
    }

    const status = updateImagesTs(slug, imageUrl, name);
    if (status === "updated") {
      console.log(`✅ ${imageUrl.slice(0, 60)}...`);
      results.updated++;
      imageMap.push({ slug, name, printfulId, imageUrl, status: "updated" });
    } else if (status === "skipped") {
      console.log("⏭  already synced");
      results.skipped++;
      imageMap.push({ slug, name, printfulId, imageUrl, status: "skipped" });
    } else {
      console.log("❌ error updating images.ts");
      results.errors++;
    }
  }

  console.log("\n==========================================");
  console.log("📊 RESULTS");
  console.log("==========================================");
  console.log(`✅ Updated:  ${results.updated}`);
  console.log(`⏭  Skipped:  ${results.skipped} (already synced)`);
  console.log(`⚠️  No image: ${results.noImage}`);
  console.log(`❌ Errors:   ${results.errors}`);

  // Save image map
  const mapPath = path.join(__dirname, "../printful-image-sync-results.json");
  fs.writeFileSync(mapPath, JSON.stringify({ generatedAt: new Date().toISOString(), results, products: imageMap }, null, 2));
  console.log(`\n📄 Results saved: printful-image-sync-results.json`);

  if (results.updated > 0) {
    console.log("\n🚀 Next steps:");
    console.log("   git add src/lib/images.ts");
    console.log('   git commit -m "chore: sync Printful product images"');
    console.log("   git push");
  }
  console.log("==========================================\n");
}

main().catch(e => { console.error(e); process.exit(1); });
