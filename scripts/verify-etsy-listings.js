#!/usr/bin/env node
/**
 * scripts/verify-etsy-listings.js
 *
 * Verifies that all OWL products are live on Etsy by:
 *   1. Checking all Printful sync products for valid external_id (Etsy listing ID)
 *   2. Summarizing which are published vs. still needs pushing
 *
 * Usage:
 *   node scripts/verify-etsy-listings.js
 *
 * Requires: PRINTFUL_API_KEY in .env.local
 */

const fs   = require("fs");
const path = require("path");

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
const ETSY_STORE = 18286248;

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local");
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pf(endpoint) {
  const res = await fetch(`https://api.printful.com${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "X-PF-Store-Id": String(ETSY_STORE),
    },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

async function main() {
  console.log("\n🦉 OWL Sing Together — Etsy Listing Verification");
  console.log("=================================================\n");

  const allProducts = [];
  let offset = 0;
  while (true) {
    const r = await pf(`/sync/products?limit=100&offset=${offset}`);
    if (!r.ok) { console.error("  ❌ Cannot list products"); break; }
    const batch = r.data.result || [];
    const total = r.data.paging?.total || batch.length;
    allProducts.push(...batch);
    if (allProducts.length >= total || batch.length < 100) break;
    offset += 100;
    await sleep(300);
  }

  const live    = allProducts.filter(p => p.external_id);
  const notLive = allProducts.filter(p => !p.external_id);

  console.log(`  Total Printful sync products: ${allProducts.length}`);
  console.log(`  ✅ Live on Etsy (have listing ID): ${live.length}`);
  console.log(`  ❌ Not pushed to Etsy:             ${notLive.length}\n`);

  if (live.length > 0) {
    console.log(`  Live products:`);
    live.forEach(p => {
      const etsyUrl = `https://www.etsy.com/listing/${p.external_id}`;
      console.log(`    ✅ ${p.name}`);
      console.log(`       Listing: ${etsyUrl}`);
    });
  }

  if (notLive.length > 0) {
    console.log(`\n  Products NOT yet on Etsy:`);
    notLive.forEach(p => console.log(`    ❌ ${p.name} (Printful ID: ${p.id})`));
    console.log(`\n  → Run: node scripts/push-to-etsy.js`);
    console.log(`    OR push manually from Printful Dashboard → OwlSingTogetherStore → Products → Push to Etsy`);
  }

  if (live.length === allProducts.length) {
    console.log(`\n  🎉 ALL ${live.length} PRODUCTS ARE LIVE ON ETSY!`);
    console.log(`\n  Your Etsy store: https://www.etsy.com/shop/OwlSingTogetherStore`);
    console.log(`\n  Final check: visit the store URL above to confirm listings are visible to customers.`);
    console.log(`  If listings appear as "Draft", go to:`);
    console.log(`    Etsy → Shop Manager → Listings → select all → Publish`);
  }

  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });
