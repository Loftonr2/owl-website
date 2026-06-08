#!/usr/bin/env node
/**
 * scripts/recover-printful-products.js
 *
 * Recovery script: lists ALL products in ALL Printful stores,
 * then matches them against the OWL product list by ID, external_id, or name.
 *
 * Usage:
 *   node scripts/recover-printful-products.js --dry-run
 *   node scripts/recover-printful-products.js --publish
 */

const fs = require("fs");
const path = require("path");

// Load .env.local
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
const isDryRun = process.argv.includes("--dry-run");
const isPublish = process.argv.includes("--publish");

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set. Add it to .env.local or run:\n   $env:PRINTFUL_API_KEY = \"your_key\"");
  process.exit(1);
}
if (!isDryRun && !isPublish) {
  console.error("Usage:\n  node scripts/recover-printful-products.js --dry-run\n  node scripts/recover-printful-products.js --publish");
  process.exit(1);
}

// OWL product list — matches against id, external_id, or name
const OWL_PRODUCTS = [
  { id: "4517696473", name: "OWL Cotton Kids T-Shirt",           category: "Apparel",            slug: "owl-cotton-kids-t-shirt" },
  { id: "4517694662", name: "OWL Throw Blanket",                 category: "Home & Accessories", slug: "owl-throw-blanket" },
  { id: "4517691576", name: "OWL Flat Bill Cap",                 category: "Headwear",           slug: "owl-flat-bill-cap" },
  { id: "4517687356", name: "OWL Teal Insulated Tumbler W/ Straw", category: "Drinkware",       slug: "owl-insulated-tumbler" },
  { id: "4517685872", name: "OWL Teal Wine Tumbler",             category: "Drinkware",          slug: "owl-wine-tumbler" },
  { id: "4517685153", name: "OWL Teal Enamel Mug",              category: "Drinkware",           slug: "owl-enamel-mug" },
  { id: "4517683038", name: "OWL Spiral Notebook",              category: "Home & Accessories",  slug: "owl-spiral-notebook" },
  { id: "4517610007", name: "OWL Insect Sticker Set II",        category: "Stickers",            slug: "owl-insect-sticker-set-ii" },
  { id: "4517608787", name: "OWL Insect Sticker Set",           category: "Stickers",            slug: "owl-insect-sticker-set" },
  { id: "4517605519", name: "OWL Animal Sticker Set III",       category: "Stickers",            slug: "owl-animal-sticker-set-iii" },
  { id: "4517603787", name: "OWL Animal Sticker Set II",        category: "Stickers",            slug: "owl-animal-sticker-set-ii" },
  { id: "4517602369", name: "OWL Counting Sticker Set",         category: "Stickers",            slug: "owl-counting-sticker-set" },
  { id: "4517600519", name: "OWL A+ Sticker Set",               category: "Stickers",            slug: "owl-aplus-sticker-set" },
  { id: "4517598855", name: "OWL Colors Sticker Set",           category: "Stickers",            slug: "owl-colors-sticker-set" },
  { id: "4517593458", name: "OWL Music Sticker Set",            category: "Stickers",            slug: "owl-music-sticker-set" },
  { id: "4517593209", name: "OWL Seasons Stickers Set",         category: "Stickers",            slug: "owl-seasons-sticker-set" },
  { id: "4517591892", name: "OWL Pre-School Sticker Set",       category: "Stickers",            slug: "owl-preschool-sticker-set" },
  { id: "4517587082", name: "OWL Holiday Sticker Set",          category: "Stickers",            slug: "owl-holiday-sticker-set" },
  { id: "4517501369", name: "OWL Animal Sticker Set",           category: "Stickers",            slug: "owl-animal-sticker-set" },
  { id: "4517499640", name: "OWL Numbers Sticker Set",          category: "Stickers",            slug: "owl-numbers-sticker-set" },
  { id: "4517496529", name: "OWL Baby Boy Sticker Set",         category: "Stickers",            slug: "owl-baby-boy-sticker-set" },
  { id: "4517494654", name: "OWL Baby Girl Sticker Set",        category: "Stickers",            slug: "owl-baby-girl-sticker-set" },
  { id: "4517393453", name: "OWL Holographic Stickers",         category: "Stickers",            slug: "owl-holographic-stickers" },
  { id: "4517390143", name: "OWL Mouse Pad",                    category: "Home & Accessories",  slug: "owl-mouse-pad" },
  { id: "4517069629", name: "OWL Stainless Steel Water Bottle", category: "Home & Accessories",  slug: "owl-water-bottle" },
  { id: "4517061382", name: "OWL Space Planets Duffle Bag",     category: "Home & Accessories",  slug: "owl-duffle-bag" },
  { id: "4517027775", name: "OWL Space Planet Backpack",        category: "Home & Accessories",  slug: "owl-backpack" },
  { id: "4516944689", name: "OWL Infant Bodysuit",              category: "Apparel",             slug: "owl-infant-bodysuit" },
  { id: "4516917473", name: "OWL Eco-Friendly Tote Bag",        category: "Home & Accessories",  slug: "owl-tote-bag" },
  { id: "4516915899", name: "White OWL Glossy Mug",             category: "Drinkware",           slug: "owl-glossy-mug" },
  { id: "4516906642", name: "OWL T-Shirt",                      category: "Apparel",             slug: "owl-t-shirt" },
  { id: "4516897484", name: "Embroidered Beanie",               category: "Headwear",            slug: "owl-embroidered-beanie" },
  { id: "4516880570", name: "OWL Sweatshirt",                   category: "Apparel",             slug: "owl-sweatshirt" },
  // N/A IDs — match by name only
  { id: "N/A",        name: "OWL ABC's Sticker Set",            category: "Stickers",            slug: "owl-abcs-sticker-set" },
];

async function api(endpoint, storeId = null) {
  const headers = { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" };
  if (storeId) headers["X-PF-Store-Id"] = String(storeId);
  const res = await fetch(`${BASE}${endpoint}`, { headers });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: false, status: res.status, data: { raw: text.slice(0, 300) } }; }
}

async function getAllProducts(storeId) {
  const products = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const r = await api(`/sync/products?limit=${limit}&offset=${offset}`, storeId);
    if (!r.ok || !r.data.result) break;
    const batch = r.data.result;
    products.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
    await new Promise(res => setTimeout(res, 200));
  }
  return products;
}

function matchProduct(printfulProduct, owlProducts) {
  const pfId = String(printfulProduct.id || "");
  const pfExtId = String(printfulProduct.external_id || "");
  const pfName = (printfulProduct.name || "").toLowerCase().trim();

  for (const owlP of owlProducts) {
    // Match by external_id (Printify IDs often stored here)
    if (owlP.id !== "N/A" && pfExtId === owlP.id) return { owlProduct: owlP, matchType: "external_id" };
    // Match by Printful internal id
    if (owlP.id !== "N/A" && pfId === owlP.id) return { owlProduct: owlP, matchType: "printful_id" };
    // Name match (fuzzy)
    const owlName = owlP.name.toLowerCase().replace(/^owl\s+/i, "").trim();
    const cleanPf = pfName.replace(/^owl\s+/i, "").trim();
    if (cleanPf === owlName || pfName.includes(owlName) || owlName.includes(cleanPf)) {
      return { owlProduct: owlP, matchType: "name" };
    }
  }
  return null;
}

async function main() {
  console.log("\n🦉 OWL Printful Recovery Tool");
  console.log("==========================================");
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "PUBLISH"}`);
  console.log(`OWL products to locate: ${OWL_PRODUCTS.length}\n`);

  // Step 1: Get all stores
  console.log("📋 Step 1: Fetching stores...");
  const storesR = await api("/stores");
  if (!storesR.ok) { console.error("❌ Failed:", storesR.data); process.exit(1); }
  const stores = storesR.data.result || [];
  console.log(`   Found ${stores.length} store(s):`);
  stores.forEach(s => console.log(`   • [${s.id}] ${s.name} — type: ${s.type}`));

  // Step 2: Fetch ALL products from ALL stores
  console.log("\n📦 Step 2: Fetching all products from all stores...");
  const allStoreProducts = []; // { storeId, storeName, product }

  for (const store of stores) {
    process.stdout.write(`   [${store.id}] ${store.name}... `);
    const prods = await getAllProducts(store.id);
    console.log(`${prods.length} products`);

    // Also try the /store/products endpoint
    if (prods.length === 0) {
      const r2 = await api(`/store/products?limit=100`, store.id);
      if (r2.ok && r2.data.result && r2.data.result.length > 0) {
        console.log(`   → Found ${r2.data.result.length} via /store/products`);
        r2.data.result.forEach(p => allStoreProducts.push({ storeId: store.id, storeName: store.name, product: p }));
        continue;
      }
    }
    prods.forEach(p => allStoreProducts.push({ storeId: store.id, storeName: store.name, product: p }));
  }

  console.log(`\n   Total Printful products found: ${allStoreProducts.length}`);

  if (allStoreProducts.length > 0) {
    console.log("\n   Sample products found:");
    allStoreProducts.slice(0, 10).forEach(({ storeId, storeName, product }) => {
      console.log(`   [${storeId}/${storeName}] id:${product.id} ext:${product.external_id || "none"} name:"${product.name}"`);
    });
  }

  // Step 3: Match OWL products against Printful inventory
  console.log("\n🔍 Step 3: Matching OWL products...\n");

  const found = [];
  const missing = [];
  const wrongStore = [];

  const TARGET_STORE_ID = process.env.PRINTFUL_STORE_ID || null;

  for (const owlP of OWL_PRODUCTS) {
    // Find all matches across all stores
    const matches = [];
    for (const { storeId, storeName, product } of allStoreProducts) {
      const m = matchProduct(product, [owlP]);
      if (m) matches.push({ storeId, storeName, product, matchType: m.matchType });
    }

    if (matches.length === 0) {
      console.log(`   ❌ NOT FOUND: ${owlP.name} [id:${owlP.id}]`);
      missing.push({ owlProduct: owlP, status: "NOT_FOUND", action: "Check Printful dashboard manually" });
    } else {
      const best = matches[0];
      const inTarget = TARGET_STORE_ID ? best.storeId === parseInt(TARGET_STORE_ID) : true;
      console.log(`   ✅ FOUND: ${owlP.name} → [${best.storeId}] ${best.storeName} (match: ${best.matchType}) pf_id:${best.product.id}`);
      found.push({
        owlProduct: owlP,
        printfulId: best.product.id,
        externalId: best.product.external_id,
        storeId: best.storeId,
        storeName: best.storeName,
        matchType: best.matchType,
        thumbnail: best.product.thumbnail_url || null,
        status: "FOUND",
        action: inTarget ? "Already in store" : "May need to move to target store",
      });
      if (!inTarget && TARGET_STORE_ID) {
        wrongStore.push({ owlProduct: owlP, foundIn: best.storeName });
      }
    }
  }

  // Step 4: Summary
  console.log("\n==========================================");
  console.log("📊 RECOVERY SUMMARY");
  console.log("==========================================");
  console.log(`✅ Found:    ${found.length}/${OWL_PRODUCTS.length}`);
  console.log(`❌ Missing:  ${missing.length}/${OWL_PRODUCTS.length}`);
  console.log(`⚠️  Wrong store: ${wrongStore.length}`);

  if (missing.length > 0) {
    console.log("\n❌ Products NOT found in ANY Printful store:");
    missing.forEach(m => console.log(`   - ${m.owlProduct.name} [${m.owlProduct.id}]`));
    console.log("\n💡 Possible reasons:");
    console.log("   1. These IDs may be from Printify (different platform)");
    console.log("   2. Products may exist but with different external IDs");
    console.log("   3. Products may not yet be synced to any connected store");
    console.log("   4. A different Printful account owns these products");
  }

  // Step 5: Save reports
  const report = {
    generatedAt: new Date().toISOString(),
    mode: isDryRun ? "dry-run" : "publish",
    stores: stores.map(s => ({ id: s.id, name: s.name, type: s.type })),
    totalPrintfulProducts: allStoreProducts.length,
    summary: { found: found.length, missing: missing.length, wrongStore: wrongStore.length },
    foundProducts: found,
    missingProducts: missing,
    wrongStoreProducts: wrongStore,
  };

  const jsonPath = path.join(__dirname, "../printful-recovery-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 JSON: printful-recovery-report.json`);

  const csvRows = [
    ["OWL Slug","Product Name","Excel ID","Status","Printful ID","External ID","Store ID","Store Name","Match Type","Action"].join(","),
    ...found.map(r => [
      r.owlProduct.slug, `"${r.owlProduct.name}"`, r.owlProduct.id,
      "FOUND", r.printfulId, r.externalId || "",
      r.storeId, `"${r.storeName}"`, r.matchType, `"${r.action}"`
    ].join(",")),
    ...missing.map(r => [
      r.owlProduct.slug, `"${r.owlProduct.name}"`, r.owlProduct.id,
      "NOT_FOUND", "", "", "", "", "", `"${r.action}"`
    ].join(",")),
  ];
  const csvPath = path.join(__dirname, "../printful-recovery-report.csv");
  fs.writeFileSync(csvPath, csvRows.join("\n"));
  console.log(`📄 CSV:  printful-recovery-report.csv`);

  if (isPublish && found.length > 0) {
    console.log("\n🚀 PUBLISH MODE: Printful products that are already synced are auto-published.");
    console.log("   For native store products, use the Printful Dashboard to publish to storefront.");
    console.log("   Direct publish API not available for all store types.");
  }

  console.log("\n==========================================");
  console.log(isDryRun ? "✅ Dry run complete." : "✅ Done.");
  console.log("==========================================\n");
}

main().catch(e => { console.error(e); process.exit(1); });
