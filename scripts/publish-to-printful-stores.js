#!/usr/bin/env node
/**
 * scripts/publish-to-printful-stores.js
 *
 * Does three things:
 *
 *   1. ETSY STORE (18286248 — OwlSingTogetherStore)
 *      Lists all 34 sync products and checks their publish status.
 *      Sets is_ignored = false on any that are inactive, ensuring they're
 *      eligible to appear on Etsy.
 *
 *   2. NATIVE PRINTFUL STORE (18296796 — OWL Sing Together)
 *      Lists products already in the native store.
 *      For each OWL product NOT in the native store, creates it by cloning
 *      the sync product data from the Etsy store.
 *
 *   3. POP-UP STORE CHECK
 *      Checks whether a Printful-hosted Pop-Up Store exists.
 *      If not, prints the URL to create one in 2 clicks.
 *
 * Usage:
 *   node scripts/publish-to-printful-stores.js
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

const API_KEY       = process.env.PRINTFUL_API_KEY;
const ETSY_STORE    = 18286248;   // OwlSingTogetherStore (Etsy-connected)
const NATIVE_STORE  = 18296796;   // OWL Sing Together (direct / native)

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local");
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pf(method, endpoint, storeId, body = null) {
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type":  "application/json",
  };
  if (storeId) headers["X-PF-Store-Id"] = String(storeId);
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.printful.com${endpoint}`, opts);
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

// ── 1. ETSY STORE — check & activate all sync products ──────────────────────
async function auditEtsyStore() {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦 STEP 1: Etsy Store (${ETSY_STORE}) — OwlSingTogetherStore`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Get all sync products (up to 100)
  const r = await pf("GET", "/sync/products?limit=100", ETSY_STORE);
  if (!r.ok) {
    console.log(`  ❌ Could not list products: ${r.status} ${JSON.stringify(r.data).slice(0, 100)}`);
    return [];
  }

  const products = r.data.result || [];
  console.log(`  Found ${products.length} sync products\n`);

  const active = [], ignored = [], fixed = [];

  for (const p of products) {
    if (p.is_ignored) {
      process.stdout.write(`  ⚠️  IGNORED: ${p.name} (id: ${p.id}) — activating... `);
      // Un-ignore the product so it syncs to Etsy
      const patch = await pf("PATCH", `/sync/products/${p.id}`, ETSY_STORE, { is_ignored: false });
      await sleep(200);
      if (patch.ok) {
        console.log("✅ activated");
        fixed.push(p.name);
      } else {
        console.log(`❌ failed (${patch.status})`);
      }
      ignored.push(p.name);
    } else {
      console.log(`  ✅ ACTIVE:   ${p.name}`);
      active.push(p);
    }
  }

  console.log(`\n  Summary: ${active.length} active, ${ignored.length} were ignored (${fixed.length} fixed)`);

  if (ignored.length > 0 && fixed.length < ignored.length) {
    console.log(`\n  ⚠️  Some products couldn't be activated via API.`);
    console.log(`  Manual step: Printful Dashboard → Stores → OwlSingTogetherStore`);
    console.log(`  → click each product → ensure "Publish to Etsy" is on`);
  }

  if (products.length > 0) {
    console.log(`\n  📋 To activate Etsy listings (draft → active):`);
    console.log(`     1. Go to etsy.com → Shop Manager → Listings`);
    console.log(`     2. Select all listings → click "Publish"`);
    console.log(`     OR: Printful → OwlSingTogetherStore → Products → "Push to Etsy"`);
  }

  return active;
}

// ── 2. NATIVE STORE — check what's there, add missing products ───────────────
async function auditNativeStore(etsyProducts) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🏪 STEP 2: Native Printful Store (${NATIVE_STORE}) — OWL Sing Together`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Get store info
  const storeInfo = await pf("GET", `/stores/${NATIVE_STORE}`, null);
  if (!storeInfo.ok) {
    console.log(`  ❌ Could not access native store: ${storeInfo.status}`);
    console.log(`  This might be the Printful Pop-Up Store — check below.`);
    return;
  }

  const store = storeInfo.data.result || {};
  console.log(`  Store name: ${store.name}`);
  console.log(`  Type: ${store.type}`);
  console.log(`  Status: ${store.status || "unknown"}\n`);

  // List products in native store
  const nativeProds = await pf("GET", "/store/products?limit=100", NATIVE_STORE);
  const nativeList  = nativeProds.data?.result || [];
  console.log(`  Products in native store: ${nativeList.length}`);
  nativeList.forEach(p => console.log(`    ✅ ${p.name}`));

  // Check which Etsy products are missing from native store
  const nativeNames = new Set(nativeList.map(p => p.name.toLowerCase()));
  const missing = etsyProducts.filter(p => !nativeNames.has(p.name.toLowerCase()));

  if (missing.length === 0) {
    console.log(`\n  ✅ All products are already in the native store!`);
    return;
  }

  console.log(`\n  Missing from native store: ${missing.length} products`);
  missing.forEach(p => console.log(`    ⚠️  ${p.name}`));

  console.log(`\n  Attempting to sync missing products to native store...`);

  let synced = 0, failed = 0;

  for (const etsyProd of missing) {
    process.stdout.write(`  → ${etsyProd.name}... `);

    // Get full product detail from Etsy store
    const detail = await pf("GET", `/sync/products/${etsyProd.id}`, ETSY_STORE);
    await sleep(300);

    if (!detail.ok || !detail.data.result) {
      console.log(`❌ couldn't fetch detail`);
      failed++;
      continue;
    }

    const sp       = detail.data.result.sync_product;
    const variants = detail.data.result.sync_variants || [];

    if (!variants.length) {
      console.log(`⚠️  no variants`);
      failed++;
      continue;
    }

    // Build a product creation payload for the native store
    // Each variant needs a catalog variant_id + the design file
    const items = variants.slice(0, 1).map(v => {
      const file = (v.files || []).find(f => f.type === "default" || f.type === "front") || v.files?.[0];
      return {
        variant_id: v.product?.variant_id || v.catalog_variant_id,
        files: file ? [{ url: file.url || file.preview_url, type: file.type || "default" }] : [],
      };
    }).filter(i => i.variant_id && i.files.length > 0);

    if (!items.length) {
      console.log(`⚠️  no usable variant/file data`);
      failed++;
      continue;
    }

    const payload = {
      sync_product: {
        name:          sp.name,
        thumbnail:     sp.thumbnail_url || "",
        is_ignored:    false,
      },
      sync_variants: items,
    };

    const create = await pf("POST", "/sync/products", NATIVE_STORE, payload);
    await sleep(400);

    if (create.ok) {
      console.log(`✅ created`);
      synced++;
    } else {
      console.log(`❌ ${create.status}: ${JSON.stringify(create.data.error || create.data).slice(0, 80)}`);
      failed++;
    }
  }

  console.log(`\n  Sync result: ${synced} created, ${failed} failed`);

  if (failed > 0) {
    console.log(`\n  For failed products, add manually:`);
    console.log(`  Printful Dashboard → Stores → OWL Sing Together → Add product`);
  }
}

// ── 3. POP-UP STORE CHECK ────────────────────────────────────────────────────
async function checkPopUpStore() {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🛍️  STEP 3: Printful Pop-Up / Hosted Store`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const r = await pf("GET", "/stores", null);
  const stores = r.data?.result || [];

  console.log(`  All connected stores:`);
  stores.forEach(s => {
    console.log(`    ${s.id === ETSY_STORE ? "Etsy" : s.id === NATIVE_STORE ? "Native" : "Other"} | ${s.id} | ${s.name} | type: ${s.type}`);
  });

  const popUp = stores.find(s => s.type === "printful" || s.type === "manual");
  if (popUp) {
    console.log(`\n  ✅ Pop-Up Store found: "${popUp.name}" (ID: ${popUp.id})`);
    console.log(`  Share link: https://www.printful.com/store/${popUp.id}`);
  } else {
    console.log(`\n  ℹ️  No Printful-hosted Pop-Up Store found.`);
    console.log(`  To create one (free, 2 minutes):`);
    console.log(`  1. Go to: https://www.printful.com/dashboard/default/stores`);
    console.log(`  2. Click "Add new store"`);
    console.log(`  3. Choose "Printful Store" (the star icon)`);
    console.log(`  4. Name it "OWL Sing Together"`);
    console.log(`  5. Add all 34 products`);
    console.log(`  6. You get a public URL like: printful.com/store/your-name`);
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🦉 OWL Sing Together — Printful Store Publisher");
  console.log("================================================\n");

  const etsyProducts = await auditEtsyStore();
  await auditNativeStore(etsyProducts);
  await checkPopUpStore();

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Done. Review output above for any manual steps.`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  console.log(`📋 QUICK REFERENCE — Manual steps if API couldn't do it:`);
  console.log(`\n  ETSY (publish draft listings):`);
  console.log(`    etsy.com → Shop Manager → Listings → Select all → Publish`);
  console.log(`\n  PRINTFUL DASHBOARD (push to Etsy):`);
  console.log(`    printful.com → Stores → OwlSingTogetherStore → any product → "Push to Etsy"`);
  console.log(`\n  POP-UP STORE (create if needed):`);
  console.log(`    printful.com → Stores → Add new store → Printful Store`);
  console.log(`    Add all products → set prices → publish → share the link`);
}

main().catch(e => { console.error(e); process.exit(1); });
