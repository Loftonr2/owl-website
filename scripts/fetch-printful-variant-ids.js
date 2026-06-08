#!/usr/bin/env node
/**
 * scripts/fetch-printful-variant-ids.js
 *
 * Fetches the Printful sync_variant_id (the ID needed to place orders)
 * for every OWL product, then writes src/lib/printful-variants.ts
 * so the PayPal webhook can auto-fulfill Printful orders.
 *
 * Usage:
 *   node scripts/fetch-printful-variant-ids.js
 *
 * Requires PRINTFUL_API_KEY in .env.local
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

const API_KEY  = process.env.PRINTFUL_API_KEY;
const STORE_ID = 18286248; // OwlSingTogetherStore (Etsy)

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local");
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pf(endpoint) {
  const res = await fetch(`https://api.printful.com${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "X-PF-Store-Id": String(STORE_ID),
    },
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

// All 34 OWL products with their Printful sync product IDs
// (from printful-recovery-report.json)
const OWL_PRODUCTS = [
  { slug: "owl-cotton-kids-t-shirt",  printfulId: 436901241 },
  { slug: "owl-throw-blanket",        printfulId: 436902009 },
  { slug: "owl-flat-bill-cap",        printfulId: 436900911 },
  { slug: "owl-infant-bodysuit",      printfulId: null },
  { slug: "owl-sweatshirt",           printfulId: null },
  { slug: "owl-t-shirt",              printfulId: null },
  { slug: "owl-embroidered-beanie",   printfulId: null },
  { slug: "owl-insulated-tumbler",    printfulId: null },
  { slug: "owl-wine-tumbler",         printfulId: null },
  { slug: "owl-enamel-mug",           printfulId: null },
  { slug: "owl-glossy-mug",           printfulId: null },
  { slug: "owl-throw-blanket",        printfulId: null },
  { slug: "owl-spiral-notebook",      printfulId: null },
  { slug: "owl-mouse-pad",            printfulId: null },
  { slug: "owl-water-bottle",         printfulId: null },
  { slug: "owl-duffle-bag",           printfulId: null },
  { slug: "owl-backpack",             printfulId: null },
  { slug: "owl-tote-bag",             printfulId: null },
  { slug: "owl-holographic-stickers", printfulId: null },
  { slug: "owl-abcs-sticker-set",        printfulId: null },
  { slug: "owl-animal-sticker-set",      printfulId: null },
  { slug: "owl-animal-sticker-set-ii",   printfulId: null },
  { slug: "owl-animal-sticker-set-iii",  printfulId: null },
  { slug: "owl-animal-sticker-set-iv",   printfulId: null },
  { slug: "owl-aplus-sticker-set",       printfulId: null },
  { slug: "owl-baby-boy-sticker-set",    printfulId: null },
  { slug: "owl-baby-girl-sticker-set",   printfulId: null },
  { slug: "owl-colors-sticker-set",      printfulId: null },
  { slug: "owl-counting-sticker-set",    printfulId: null },
  { slug: "owl-explorer-sticker-set",    printfulId: null },
  { slug: "owl-holiday-sticker-set",     printfulId: null },
  { slug: "owl-insect-sticker-set",      printfulId: null },
  { slug: "owl-insect-sticker-set-ii",   printfulId: null },
  { slug: "owl-math-sticker-set",        printfulId: null },
  { slug: "owl-music-sticker-set",       printfulId: null },
  { slug: "owl-numbers-sticker-set",     printfulId: null },
  { slug: "owl-preschool-sticker-set",   printfulId: null },
  { slug: "owl-science-sticker-set",     printfulId: null },
  { slug: "owl-seasons-sticker-set",     printfulId: null },
  { slug: "owl-swimming-sticker-set",    printfulId: null },
];

// Fill in IDs from recovery report if available
function loadRecovery() {
  const p = path.join(__dirname, "../printful-recovery-report.json");
  if (!fs.existsSync(p)) return new Map();
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const m = new Map();
  for (const prod of (data.foundProducts || [])) {
    m.set(prod.owlProduct.slug, prod.printfulId);
  }
  return m;
}

async function main() {
  console.log("\n🦉 Printful Variant ID Fetcher\n");
  const recovery = loadRecovery();

  // Fill in any nulls from recovery report
  for (const p of OWL_PRODUCTS) {
    if (!p.printfulId && recovery.has(p.slug)) {
      p.printfulId = recovery.get(p.slug);
    }
  }

  // Deduplicate by printfulId
  const seen = new Set();
  const unique = OWL_PRODUCTS.filter(p => {
    if (!p.printfulId || seen.has(p.printfulId)) return false;
    seen.add(p.printfulId);
    return true;
  });

  const variantMap = {}; // slug → [{ variantId, name, size, color }]
  let found = 0, missing = 0;

  for (const prod of unique) {
    process.stdout.write(`  [${prod.slug}] `);

    const r = await pf(`/sync/products/${prod.printfulId}`);
    await sleep(200);

    if (!r.ok) {
      console.log(`❌ API error ${r.status}`);
      missing++;
      continue;
    }

    const variants = r.data.result?.sync_variants || [];
    if (!variants.length) {
      console.log("⚠️  no variants");
      missing++;
      continue;
    }

    variantMap[prod.slug] = variants.map(v => ({
      variantId:    v.id,           // sync_variant_id — use this for orders
      name:         v.name,
      sku:          v.sku,
      color:        v.color,
      size:         v.size,
      retailPrice:  v.retail_price,
      isEnabled:    v.is_enabled,
    }));

    const defaultVariant = variants.find(v => v.is_enabled) || variants[0];
    console.log(`✅ ${variants.length} variants (default: ${defaultVariant?.name || "?"})`);
    found++;
  }

  // ── Write printful-variants.ts ──
  const outPath = path.join(__dirname, "../src/lib/printful-variants.ts");

  const lines = [
    `/**`,
    ` * src/lib/printful-variants.ts`,
    ` * AUTO-GENERATED by scripts/fetch-printful-variant-ids.js`,
    ` * Generated: ${new Date().toISOString()}`,
    ` *`,
    ` * Maps product slug → Printful sync_variant_id (and metadata).`,
    ` * The webhook uses this to auto-create Printful orders when PayPal payment completes.`,
    ` *`,
    ` * To regenerate after adding products:`,
    ` *   node scripts/fetch-printful-variant-ids.js`,
    ` */`,
    ``,
    `export interface PrintfulVariant {`,
    `  variantId:   number;   // sync_variant_id — required for POST /orders`,
    `  name:        string;`,
    `  sku:         string;`,
    `  color:       string;`,
    `  size:        string;`,
    `  retailPrice: string;`,
    `  isEnabled:   boolean;`,
    `}`,
    ``,
    `/** Map of product slug → available sync variants (ordered by Printful default) */`,
    `export const PRINTFUL_VARIANTS: Record<string, PrintfulVariant[]> = ${JSON.stringify(variantMap, null, 2)};`,
    ``,
    `/**`,
    ` * Returns the best default variant for a product:`,
    ` * 1. First enabled variant`,
    ` * 2. First variant of any status`,
    ` * 3. null if product not found`,
    ` */`,
    `export function getDefaultVariant(slug: string): PrintfulVariant | null {`,
    `  const variants = PRINTFUL_VARIANTS[slug];`,
    `  if (!variants?.length) return null;`,
    `  return variants.find(v => v.isEnabled) ?? variants[0];`,
    `}`,
    ``,
    `/**`,
    ` * Returns sync_variant_id for a product slug, or null if not found.`,
    ` * Used by the PayPal webhook to create Printful fulfillment orders.`,
    ` */`,
    `export function getPrintfulVariantId(slug: string): number | null {`,
    `  return getDefaultVariant(slug)?.variantId ?? null;`,
    `}`,
    ``,
  ];

  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");

  // Also write a JSON report
  const reportPath = path.join(__dirname, "../printful-variants-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), found, missing, variants: variantMap }, null, 2));

  console.log(`\n==========================================`);
  console.log(`✅ Found: ${found} | ⚠️  Missing: ${missing}`);
  console.log(`==========================================`);
  console.log(`\n📄 Written: src/lib/printful-variants.ts`);
  console.log(`📄 Written: printful-variants-report.json`);
  console.log(`\n🚀 Next steps:`);
  console.log(`   git add src/lib/printful-variants.ts`);
  console.log(`   git commit -m "feat: add Printful variant ID map for order fulfillment"`);
  console.log(`   git push`);
  console.log(`   Then add PRINTFUL_API_KEY to Vercel env vars.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
