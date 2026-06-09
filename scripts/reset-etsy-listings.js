#!/usr/bin/env node
/**
 * scripts/reset-etsy-listings.js
 *
 * PROBLEM:
 *   All 42 OWL sync products in Printful's Etsy store (18286248) have external_id
 *   pointing to Etsy listing IDs that were deleted. Printful thinks they're already
 *   published, so it won't create new listings.
 *
 * SOLUTION:
 *   PATCH each sync product to clear external_id (""). This tells Printful the product
 *   is no longer linked to any Etsy listing, making it eligible to be pushed again.
 *
 *   After this script runs:
 *     Option A (recommended): Printful Dashboard → OwlSingTogetherStore → select all
 *                              products → "Push to Etsy" (bulk action)
 *     Option B: run scripts/push-to-etsy.js (next script) to trigger push via API
 *
 * Usage:
 *   node scripts/reset-etsy-listings.js
 *
 * Requires: PRINTFUL_API_KEY in .env.local
 */

const fs   = require("fs");
const path = require("path");

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
const ETSY_STORE = 18286248; // OwlSingTogetherStore

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local");
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pf(method, endpoint, body = null) {
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type":  "application/json",
    "X-PF-Store-Id": String(ETSY_STORE),
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`https://api.printful.com${endpoint}`, opts);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

async function main() {
  console.log("\n🦉 OWL Sing Together — Reset Etsy Listing Links");
  console.log("=================================================\n");
  console.log("This script clears stale Etsy listing IDs from Printful sync products.");
  console.log("After running, products will be shown as unpublished and can be re-pushed.\n");

  // ── Step 1: List all sync products ──────────────────────────────────────────
  console.log("📋 Step 1: Fetching all sync products from Etsy store...\n");

  const allProducts = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const r = await pf("GET", `/sync/products?limit=${limit}&offset=${offset}`);
    if (!r.ok) {
      console.error(`  ❌ Failed to list products: ${r.status} ${JSON.stringify(r.data).slice(0, 120)}`);
      process.exit(1);
    }
    const batch = r.data.result || [];
    const total = r.data.paging?.total || batch.length;
    allProducts.push(...batch);
    console.log(`  Fetched ${allProducts.length} / ${total} products`);
    if (allProducts.length >= total || batch.length < limit) break;
    offset += limit;
    await sleep(300);
  }

  console.log(`\n  Total sync products found: ${allProducts.length}\n`);

  // ── Step 2: For each product, check and clear external_id ───────────────────
  console.log("🔗 Step 2: Checking & clearing stale Etsy listing IDs...\n");

  const results = {
    cleared:    [],
    alreadyClear: [],
    failed:     [],
  };

  for (const prod of allProducts) {
    const name       = prod.name || "(unnamed)";
    const syncId     = prod.id;
    const externalId = prod.external_id;

    if (!externalId) {
      console.log(`  ✅ Already clear: ${name} (id: ${syncId})`);
      results.alreadyClear.push(name);
      continue;
    }

    process.stdout.write(`  🔗 ${name} → external_id: ${externalId} → clearing... `);

    const patch = await pf("PATCH", `/sync/products/${syncId}`, {
      sync_product: { external_id: "" },
    });
    await sleep(250);

    if (patch.ok) {
      // Verify it was cleared
      const verify = await pf("GET", `/sync/products/${syncId}`);
      await sleep(150);
      const newExtId = verify.data?.result?.sync_product?.external_id;
      if (!newExtId) {
        console.log("✅ cleared");
        results.cleared.push({ name, syncId, wasExternalId: externalId });
      } else {
        console.log(`⚠️  still shows external_id: ${newExtId}`);
        results.failed.push({ name, syncId, reason: "external_id not cleared" });
      }
    } else {
      const errMsg = patch.data?.error?.message || JSON.stringify(patch.data).slice(0, 80);
      console.log(`❌ PATCH failed (${patch.status}): ${errMsg}`);
      results.failed.push({ name, syncId, reason: `${patch.status}: ${errMsg}` });
    }
  }

  // ── Step 3: Summary ──────────────────────────────────────────────────────────
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 RESULTS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ✅ Cleared:       ${results.cleared.length}`);
  console.log(`  ✅ Already clear: ${results.alreadyClear.length}`);
  console.log(`  ❌ Failed:        ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log(`\n  Failed products:`);
    results.failed.forEach(f => console.log(`    ⚠️  ${f.name}: ${f.reason}`));
  }

  const total = results.cleared.length + results.alreadyClear.length;

  // ── Step 4: Save report ──────────────────────────────────────────────────────
  const report = {
    generatedAt:   new Date().toISOString(),
    totalProducts: allProducts.length,
    cleared:       results.cleared.length,
    alreadyClear:  results.alreadyClear.length,
    failed:        results.failed.length,
    details:       results,
  };
  const reportPath = path.join(__dirname, "../etsy-reset-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n  📄 Report written to etsy-reset-report.json`);

  // ── Step 5: Next steps ────────────────────────────────────────────────────────
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (total > 0) {
    console.log(`\n🚀 NEXT STEP: Push all ${total} products to Etsy`);
    console.log(`\n  OPTION A — Printful Dashboard (easiest):`);
    console.log(`    1. Go to: https://www.printful.com/dashboard/default/stores`);
    console.log(`    2. Click "OwlSingTogetherStore" (the Etsy store)`);
    console.log(`    3. Click "Products" in the sidebar`);
    console.log(`    4. Select all products (checkbox at top)`);
    console.log(`    5. Click "Actions" dropdown → "Push to Etsy"`);
    console.log(`    6. Confirm → Printful will create ${total} new Etsy draft listings`);
    console.log(`    7. Go to Etsy Shop Manager → Listings → select all → Publish`);
    console.log(`\n  OPTION B — Run next script:`);
    console.log(`    node scripts/push-to-etsy.js`);
    console.log(`    (attempts API-based push for each product)`);
  } else {
    console.log(`\n  No products to clear. Check the dashboard manually.`);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
