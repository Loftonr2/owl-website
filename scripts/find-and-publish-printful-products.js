#!/usr/bin/env node
/**
 * scripts/find-and-publish-printful-products.js
 *
 * Discovers Printful products across all stores and generates a report.
 * Reads product IDs from the embedded list (from OWL_Printful_Products_Profit_Tracker.xlsx).
 *
 * Usage:
 *   node scripts/find-and-publish-printful-products.js --dry-run
 *   node scripts/find-and-publish-printful-products.js --publish
 *
 * Requires: PRINTFUL_API_KEY in .env.local or environment
 */

const fs = require("fs");
const path = require("path");

// ── Load env from .env.local ──────────────────────────────────────────────
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...rest] = line.split("=");
    if (k && rest.length > 0 && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join("=").trim();
    }
  }
}

// ── Config ────────────────────────────────────────────────────────────────
const API_KEY = process.env.PRINTFUL_API_KEY;
const BASE_URL = "https://api.printful.com";
const isDryRun = process.argv.includes("--dry-run");
const isPublish = process.argv.includes("--publish");

if (!API_KEY || API_KEY === "your_printful_api_key_here") {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local or environment");
  console.error("   Get yours at: printful.com → Dashboard → Settings → API → Generate Token");
  process.exit(1);
}

if (!isDryRun && !isPublish) {
  console.error("Usage: node scripts/find-and-publish-printful-products.js --dry-run");
  console.error("       node scripts/find-and-publish-printful-products.js --publish");
  process.exit(1);
}

// ── Product list from OWL_Printful_Products_Profit_Tracker.xlsx ──────────
// IDs confirmed from the Excel file and Printful dashboard
const PRODUCTS_BY_ID = [
  { id: "4517696473", name: "OWL Cotton Kids T-Shirt",           category: "Apparel" },
  { id: "4517694662", name: "OWL Throw Blanket",                 category: "Home & Accessories" },
  { id: "4517691576", name: "OWL Flat Bill Cap",                 category: "Headwear" },
  { id: "4517687356", name: "OWL Teal Insulated Tumbler W/ Straw", category: "Drinkware" },
  { id: "4517685872", name: "OWL Teal Wine Tumbler",             category: "Drinkware" },
  { id: "4517685153", name: "OWL Teal Enamel Mug",              category: "Drinkware" },
  { id: "4517683038", name: "OWL Spiral Notebook",              category: "Home & Accessories" },
  { id: "4517610007", name: "OWL Insect Sticker Set II",        category: "Stickers" },
  { id: "4517608787", name: "OWL Insect Sticker Set",           category: "Stickers" },
  { id: "4517605519", name: "OWL Animal Sticker Set III",       category: "Stickers" },
  { id: "4517603787", name: "OWL Animal Sticker Set II",        category: "Stickers" },
  { id: "4517602369", name: "OWL Counting Sticker Set",         category: "Stickers" },
  { id: "4517600519", name: "OWL A+ Sticker Set",               category: "Stickers" },
  { id: "4517598855", name: "OWL Colors Sticker Set",           category: "Stickers" },
  { id: "4517593458", name: "OWL Music Sticker Set",            category: "Stickers" },
  { id: "4517593209", name: "OWL Seasons Stickers Set",         category: "Stickers" },
  { id: "4517591892", name: "OWL Pre-School Sticker Set",       category: "Stickers" },
  { id: "4517587082", name: "OWL Holiday Sticker Set",          category: "Stickers" },
  { id: "4517501369", name: "OWL Animal Sticker Set",           category: "Stickers" },
  { id: "4517499640", name: "OWL Numbers Sticker Set",          category: "Stickers" },
  { id: "4517496529", name: "OWL Baby Boy Sticker Set",         category: "Stickers" },
  { id: "4517494654", name: "OWL Baby Girl Sticker Set",        category: "Stickers" },
  { id: "4517393453", name: "OWL Holographic Stickers",         category: "Stickers" },
  { id: "4517390143", name: "OWL Mouse Pad",                    category: "Home & Accessories" },
  { id: "4517069629", name: "OWL Stainless Steel Water Bottle", category: "Home & Accessories" },
  { id: "4517061382", name: "OWL Space Planets Duffle Bag",     category: "Home & Accessories" },
  { id: "4517027775", name: "OWL Space Planet Backpack",        category: "Home & Accessories" },
  { id: "4516944689", name: "OWL Infant Bodysuit",              category: "Apparel" },
  { id: "4516917473", name: "OWL Eco-Friendly Tote Bag",        category: "Home & Accessories" },
  { id: "4516915899", name: "White OWL Glossy Mug",             category: "Drinkware" },
  { id: "4516906642", name: "OWL T-Shirt",                      category: "Apparel" },
  { id: "4516897484", name: "Embroidered Beanie",               category: "Headwear" },
  { id: "4516880570", name: "OWL Sweatshirt",                   category: "Apparel" },
];

// Products with N/A IDs — search by name
const PRODUCTS_BY_NAME = [
  { id: "N/A", name: "OWL Throw Blanket",      category: "Home & Accessories" },
  { id: "N/A", name: "OWL ABC's Sticker Set",  category: "Stickers" },
  { id: "N/A", name: "OWL Infant Bodysuit",    category: "Apparel" },
];

// ── API helpers ───────────────────────────────────────────────────────────
async function apiFetch(endpoint, storeId = null) {
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
  if (storeId) headers["X-PF-Store-Id"] = String(storeId);

  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: { raw: text.slice(0, 300) } };
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🦉 OWL Printful Product Discovery Tool");
  console.log("==========================================");
  console.log(`Mode: ${isDryRun ? "DRY RUN (no changes)" : "PUBLISH MODE"}`);
  console.log(`Products to check: ${PRODUCTS_BY_ID.length} by ID + ${PRODUCTS_BY_NAME.length} by name\n`);

  // ── 1. List all stores ──────────────────────────────────────────────────
  console.log("📋 Step 1: Fetching all Printful stores...");
  const storesResult = await apiFetch("/stores");
  if (!storesResult.ok) {
    console.error("❌ Failed to fetch stores:", storesResult.data);
    process.exit(1);
  }
  const stores = storesResult.data.result || [];
  console.log(`   Found ${stores.length} store(s):\n`);
  for (const s of stores) {
    console.log(`   • [${s.id}] ${s.name} (type: ${s.type || "unknown"})`);
  }

  // ── 2. For each product ID, check all stores ────────────────────────────
  console.log("\n📦 Step 2: Checking product IDs across all stores...\n");

  const report = [];
  const matched = [];
  const unmatched = [];
  const duplicates = [];
  const nameSearchResults = [];

  for (const product of PRODUCTS_BY_ID) {
    process.stdout.write(`   Checking [${product.id}] ${product.name}...`);
    const foundInStores = [];

    for (const store of stores) {
      // Try direct sync product lookup by ID
      const r = await apiFetch(`/sync/products/${product.id}`, store.id);
      await sleep(100); // rate limit

      if (r.ok && r.data.result) {
        const syncProduct = r.data.result.sync_product || r.data.result;
        foundInStores.push({
          storeId: store.id,
          storeName: store.name,
          syncProductId: syncProduct.id,
          syncProductName: syncProduct.name || product.name,
          status: syncProduct.is_ignored ? "ignored" : "active",
          thumbnailUrl: syncProduct.thumbnail_url || null,
        });
      }
    }

    let status, action;
    if (foundInStores.length === 0) {
      status = "NOT_FOUND";
      action = "Manual check needed — ID may not exist in any connected store";
      unmatched.push(product.name);
      process.stdout.write(" ❌ not found\n");
    } else if (foundInStores.length > 1) {
      status = "DUPLICATE";
      action = "Found in multiple stores — confirm target store before publishing";
      duplicates.push({ product: product.name, stores: foundInStores.map(s => s.storeName) });
      process.stdout.write(` ⚠️  in ${foundInStores.length} stores\n`);
    } else {
      status = "FOUND";
      action = foundInStores[0].status === "ignored" ? "Product is ignored — enable in Printful dashboard" : "Found and active";
      matched.push(product.name);
      process.stdout.write(` ✅ in [${foundInStores[0].storeId}] ${foundInStores[0].storeName}\n`);
    }

    report.push({
      productId: product.id,
      productName: product.name,
      category: product.category,
      status,
      action,
      foundInStores,
      printfulDashboardUrl: foundInStores.length > 0
        ? `https://www.printful.com/dashboard/default/products`
        : `https://www.printful.com/dashboard/default/products`,
    });
  }

  // ── 3. Name search for N/A products ────────────────────────────────────
  console.log("\n🔍 Step 3: Searching N/A products by name...\n");
  for (const product of PRODUCTS_BY_NAME) {
    process.stdout.write(`   Searching for "${product.name}"...`);
    const nameMatches = [];

    for (const store of stores) {
      // Get all products and search by name
      const r = await apiFetch(`/sync/products?limit=100`, store.id);
      await sleep(150);

      if (r.ok && r.data.result) {
        const matches = r.data.result.filter(p =>
          p.name && p.name.toLowerCase().includes(product.name.toLowerCase().replace("owl ", "").toLowerCase())
        );
        for (const m of matches) {
          nameMatches.push({
            storeId: store.id,
            storeName: store.name,
            syncProductId: m.id,
            syncProductName: m.name,
            thumbnailUrl: m.thumbnail_url || null,
          });
        }
      }
    }

    const status = nameMatches.length === 0 ? "NOT_FOUND_BY_NAME"
                 : nameMatches.length > 1 ? "AMBIGUOUS_NAME_MATCH"
                 : "FOUND_BY_NAME";

    if (nameMatches.length > 0) {
      process.stdout.write(` ✅ found ${nameMatches.length} match(es)\n`);
    } else {
      process.stdout.write(" ❌ not found\n");
    }

    nameSearchResults.push({
      productId: "N/A",
      productName: product.name,
      category: product.category,
      status,
      action: nameMatches.length === 1
        ? "Confirm match before publishing"
        : nameMatches.length > 1
        ? "Multiple matches — manual review needed"
        : "Not found by name — may need to be created in Printful",
      foundInStores: nameMatches,
    });
  }

  const fullReport = [...report, ...nameSearchResults];

  // ── 4. Print summary ────────────────────────────────────────────────────
  console.log("\n==========================================");
  console.log("📊 DISCOVERY SUMMARY");
  console.log("==========================================");
  console.log(`\n✅ Matched by ID:     ${matched.length}/${PRODUCTS_BY_ID.length}`);
  console.log(`❌ Not found by ID:   ${unmatched.length}/${PRODUCTS_BY_ID.length}`);
  console.log(`⚠️  Duplicates:        ${duplicates.length}`);
  console.log(`🔍 N/A ID searches:   ${nameSearchResults.length}`);

  if (unmatched.length > 0) {
    console.log("\n❌ Products NOT found in any store:");
    unmatched.forEach(n => console.log(`   - ${n}`));
    console.log("\n💡 These products may:");
    console.log("   1. Have different IDs in Printful (ID format mismatch)");
    console.log("   2. Not be synced to any connected store");
    console.log("   3. Exist as order-only products, not store products");
    console.log("   4. Be in a DIFFERENT Printful account than the API key");
  }

  if (duplicates.length > 0) {
    console.log("\n⚠️  Duplicate matches:");
    duplicates.forEach(d => console.log(`   - ${d.product}: [${d.stores.join(", ")}]`));
  }

  // ── 5. Save JSON report ─────────────────────────────────────────────────
  const reportPath = path.join(__dirname, "../printful-product-discovery-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    mode: isDryRun ? "dry-run" : "publish",
    stores: stores.map(s => ({ id: s.id, name: s.name, type: s.type })),
    summary: {
      totalChecked: PRODUCTS_BY_ID.length + PRODUCTS_BY_NAME.length,
      matched: matched.length,
      unmatched: unmatched.length,
      duplicates: duplicates.length,
    },
    products: fullReport,
  }, null, 2));
  console.log(`\n📄 JSON report saved: printful-product-discovery-report.json`);

  // ── 6. Save CSV report ──────────────────────────────────────────────────
  const csvPath = path.join(__dirname, "../printful-product-discovery-report.csv");
  const csvRows = [
    ["Product ID", "Product Name", "Category", "Status", "Store ID", "Store Name", "Action", "Dashboard URL"].join(","),
    ...fullReport.map(r => [
      r.productId,
      `"${r.productName}"`,
      r.category,
      r.status,
      r.foundInStores.length > 0 ? r.foundInStores[0].storeId : "",
      r.foundInStores.length > 0 ? `"${r.foundInStores[0].storeName}"` : "",
      `"${r.action}"`,
      `"${r.printfulDashboardUrl}"`,
    ].join(","))
  ];
  fs.writeFileSync(csvPath, csvRows.join("\n"));
  console.log(`📄 CSV report saved:  printful-product-discovery-report.csv`);

  // ── 7. Publish mode (only if --publish AND products found) ──────────────
  if (isPublish) {
    console.log("\n🚀 PUBLISH MODE");
    const toPublish = fullReport.filter(r => r.status === "FOUND" && r.foundInStores.length === 1);
    if (toPublish.length === 0) {
      console.log("   No products in a publishable state (must be FOUND in exactly 1 store).");
      console.log("   Run --dry-run first and resolve duplicates/not-found items.");
    } else {
      console.log(`   ${toPublish.length} products eligible for publishing.`);
      console.log("   NOTE: Printful manages publishing via the dashboard for API-connected stores.");
      console.log("   Products synced via API are already 'published' when they exist in a store.");
      console.log("\n   Products found and active (no publish action needed via API):");
      toPublish.forEach(p => {
        console.log(`   ✅ [${p.foundInStores[0].storeId}] ${p.productName}`);
      });
    }
  }

  console.log("\n==========================================");
  if (isDryRun) {
    console.log("✅ Dry run complete. Review the reports before running --publish.");
  } else {
    console.log("✅ Done.");
  }
  console.log("==========================================\n");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
