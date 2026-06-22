#!/usr/bin/env node
/**
 * scripts/push-to-etsy.js
 *
 * PREREQUISITE: Run scripts/reset-etsy-listings.js first to clear stale external_ids.
 *
 * Attempts to push all unpublished sync products to Etsy by:
 *   1. Listing all sync products with no external_id (not yet linked to Etsy)
 *   2. For each, fetching full product detail (variants, files, pricing)
 *   3. Attempting available Printful API push mechanisms
 *   4. Reporting which products need manual push from dashboard
 *
 * Usage:
 *   node scripts/push-to-etsy.js
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

async function pf(method, endpoint, body = null, storeId = ETSY_STORE) {
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type":  "application/json",
  };
  if (storeId) headers["X-PF-Store-Id"] = String(storeId);
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`https://api.printful.com${endpoint}`, opts);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

async function main() {
  console.log("\n🦉 OWL Sing Together — Push Products to Etsy");
  console.log("=============================================\n");

  // ── Step 1: Verify reset was run ────────────────────────────────────────────
  const resetReport = path.join(__dirname, "../etsy-reset-report.json");
  if (!fs.existsSync(resetReport)) {
    console.error("❌ etsy-reset-report.json not found.");
    console.error("   Run scripts/reset-etsy-listings.js first.\n");
    process.exit(1);
  }
  const resetData = JSON.parse(fs.readFileSync(resetReport, "utf-8"));
  console.log(`  ✅ Reset report found (${resetData.generatedAt})`);
  console.log(`     Products cleared: ${resetData.cleared}, already clear: ${resetData.alreadyClear}\n`);

  // ── Step 2: List all products, find unpublished (no external_id) ─────────────
  console.log("📋 Step 2: Finding unpublished products (no Etsy listing ID)...\n");

  const allProducts = [];
  let offset = 0;
  while (true) {
    const r = await pf("GET", `/sync/products?limit=100&offset=${offset}`);
    if (!r.ok) { console.error("  ❌ Cannot list products"); break; }
    const batch = r.data.result || [];
    const total = r.data.paging?.total || batch.length;
    allProducts.push(...batch);
    if (allProducts.length >= total || batch.length < 100) break;
    offset += 100;
    await sleep(300);
  }

  const unpublished = allProducts.filter(p => !p.external_id);
  const published   = allProducts.filter(p => p.external_id);

  console.log(`  Total products:   ${allProducts.length}`);
  console.log(`  Published:        ${published.length} (have Etsy listing IDs)`);
  console.log(`  Unpublished:      ${unpublished.length} (ready to push to Etsy)\n`);

  if (published.length > 0) {
    console.log(`  Already have external_ids (may be live on Etsy):`);
    published.forEach(p => console.log(`    ✅ ${p.name} → ${p.external_id}`));
    console.log();
  }

  if (unpublished.length === 0) {
    console.log("  ✅ All products already have Etsy listing IDs.");
    console.log("  If listings still aren't showing, check Etsy Shop Manager → Listings → All.\n");
    return;
  }

  // ── Step 3: Attempt API push for each unpublished product ──────────────────
  console.log("🚀 Step 3: Attempting to push unpublished products to Etsy...\n");
  console.log("  Note: Printful v1 API may not support programmatic push.");
  console.log("        If this step fails, see manual instructions below.\n");

  const pushed   = [];
  const needsManual = [];

  for (const prod of unpublished) {
    process.stdout.write(`  [${prod.name}] `);

    // Get full product detail
    const detail = await pf("GET", `/sync/products/${prod.id}`);
    await sleep(200);

    if (!detail.ok) {
      console.log(`❌ can't fetch detail (${detail.status})`);
      needsManual.push(prod.name);
      continue;
    }

    const sp       = detail.data.result?.sync_product   || {};
    const variants = detail.data.result?.sync_variants  || [];

    if (!variants.length) {
      console.log(`⚠️  no variants`);
      needsManual.push(prod.name);
      continue;
    }

    // Try: PATCH with is_ignored=false to trigger Printful's sync job
    // (Some Printful integrations re-push when you explicitly toggle is_ignored)
    const toggleOff = await pf("PATCH", `/sync/products/${prod.id}`, {
      sync_product: { is_ignored: true },
    });
    await sleep(200);

    const toggleOn = await pf("PATCH", `/sync/products/${prod.id}`, {
      sync_product: { is_ignored: false },
    });
    await sleep(300);

    if (toggleOn.ok) {
      // Check if Printful created an external_id (=Etsy listing was created)
      const check = await pf("GET", `/sync/products/${prod.id}`);
      await sleep(200);
      const newExtId = check.data?.result?.sync_product?.external_id;

      if (newExtId) {
        console.log(`✅ Pushed! New Etsy listing ID: ${newExtId}`);
        pushed.push({ name: prod.name, etsyListingId: newExtId });
      } else {
        console.log(`⏳ Toggle sent — Printful may sync async (check dashboard in 2 min)`);
        needsManual.push(prod.name);
      }
    } else {
      console.log(`❌ toggle failed (${toggleOn.status})`);
      needsManual.push(prod.name);
    }
  }

  // ── Step 4: Summary ──────────────────────────────────────────────────────────
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 PUSH RESULTS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ✅ Pushed via API:     ${pushed.length}`);
  console.log(`  ⏳ Need manual push:  ${needsManual.length}`);

  // ── Step 5: Manual instructions for remaining products ──────────────────────
  if (needsManual.length > 0) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📋 MANUAL PUSH REQUIRED (${needsManual.length} products)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    console.log(`  Printful Dashboard steps (do this once, covers all products):\n`);
    console.log(`  1. Open: https://www.printful.com/dashboard/default/stores`);
    console.log(`  2. Click "OwlSingTogetherStore" (shows as Etsy icon)`);
    console.log(`  3. In the left sidebar click "Products"`);
    console.log(`  4. You should see ${needsManual.length}+ products with a yellow "Not published" badge`);
    console.log(`  5. Click the checkbox at the top to SELECT ALL products`);
    console.log(`  6. Click "Actions" button → "Push to store"`);
    console.log(`     (or "Publish" / "Sync to Etsy" — button label varies by Printful version)`);
    console.log(`  7. Click "Confirm" — Printful will submit all products to Etsy`);
    console.log(`  8. Wait 2–5 minutes for Etsy to process`);
    console.log(`  9. Then go to: https://www.etsy.com/your/shops/OwlSingTogetherStore/tools/listings`);
    console.log(`  10. Select all draft listings → click "Publish"`);
    console.log(`\n  Products that need manual push:`);
    needsManual.forEach((name, i) => console.log(`    ${i + 1}. ${name}`));

    console.log(`\n  ⚡ FASTER ALTERNATIVE (individual product):`);
    console.log(`     Printful → OwlSingTogetherStore → Products → click any product → Edit`);
    console.log(`     → look for "Push to Etsy" button in the top-right corner`);
  }

  if (pushed.length > 0) {
    console.log(`\n  ✅ Products pushed via API — Etsy listing IDs:`);
    pushed.forEach(p => console.log(`     ${p.name}: listing ${p.etsyListingId}`));
    console.log(`\n  These listings may be in DRAFT state on Etsy.`);
    console.log(`  Go to Etsy → Shop Manager → Listings → select all → Publish`);
  }

  // ── Write report ─────────────────────────────────────────────────────────────
  const report = {
    generatedAt: new Date().toISOString(),
    pushedViaApi: pushed,
    needsManualPush: needsManual,
  };
  fs.writeFileSync(
    path.join(__dirname, "../etsy-push-report.json"),
    JSON.stringify(report, null, 2)
  );
  console.log(`\n  📄 Report saved to etsy-push-report.json\n`);

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  After all products are published on Etsy, run:`);
  console.log(`  node scripts/verify-etsy-listings.js`);
  console.log(`  to confirm all listings are live.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
