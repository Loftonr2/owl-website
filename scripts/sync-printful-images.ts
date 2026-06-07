#!/usr/bin/env node
/**
 * scripts/sync-printful-images.ts
 *
 * Fetches product mockup images from the Printful API and automatically
 * updates src/lib/images.ts so every OWL store product shows the right image.
 *
 * SAFE RULES:
 *   - Never modifies prices, inventory, SKUs, or descriptions
 *   - Only updates the images section of images.ts
 *   - Skips products that already have images registered
 *   - Logs every matched, skipped, and failed product
 *
 * USAGE:
 *   1. Add PRINTFUL_API_KEY to .env.local
 *      (Get it: printful.com → Dashboard → Settings → API → Generate Token)
 *   2. Run:  npx tsx scripts/sync-printful-images.ts
 *   3. Review log output
 *   4. git add src/lib/images.ts && git commit -m "chore: sync Printful product images"
 */

import * as fs from "fs";
import * as path from "path";

const PRINTFUL_BASE = "https://api.printful.com";

const TITLE_TO_SLUG: Record<string, string> = {
  "owl t-shirt":                           "owl-t-shirt",
  "owl cotton kids t-shirt":               "owl-cotton-kids-t-shirt",
  "owl infant bodysuit":                   "owl-infant-bodysuit",
  "owl sweatshirt":                        "owl-sweatshirt",
  "owl flat bill cap":                     "owl-flat-bill-cap",
  "embroidered beanie":                    "owl-embroidered-beanie",
  "embroidered owl beanie":                "owl-embroidered-beanie",
  "owl teal insulated tumbler w/ straw":   "owl-insulated-tumbler",
  "owl teal insulated tumbler with straw": "owl-insulated-tumbler",
  "owl insulated tumbler":                 "owl-insulated-tumbler",
  "owl teal wine tumbler":                 "owl-wine-tumbler",
  "owl teal enamel mug":                   "owl-enamel-mug",
  "white owl glossy mug":                  "owl-glossy-mug",
  "owl throw blanket":                     "owl-throw-blanket",
  "owl spiral notebook":                   "owl-spiral-notebook",
  "owl mouse pad":                         "owl-mouse-pad",
  "owl stainless steel water bottle":      "owl-water-bottle",
  "owl space planets duffle bag":          "owl-duffle-bag",
  "owl space planet backpack":             "owl-backpack",
  "owl eco-friendly tote bag":             "owl-tote-bag",
  "owl eco friendly tote bag":             "owl-tote-bag",
  "owl holographic stickers":              "owl-holographic-stickers",
  "owl insect sticker set ii":             "owl-insect-sticker-set-ii",
  "owl insect sticker set":                "owl-insect-sticker-set",
  "owl animal sticker set iv":             "owl-animal-sticker-set-iv",
  "owl animal sticker set iii":            "owl-animal-sticker-set-iii",
  "owl animal sticker set ii":             "owl-animal-sticker-set-ii",
  "owl animal sticker set":                "owl-animal-sticker-set",
  "owl counting sticker set":              "owl-counting-sticker-set",
  "owl a+ sticker set":                    "owl-aplus-sticker-set",
  "owl colors sticker set":                "owl-colors-sticker-set",
  "owl music sticker set":                 "owl-music-sticker-set",
  "owl pre-school sticker set":            "owl-preschool-sticker-set",
  "owl seasons sticker set":               "owl-seasons-sticker-set",
  "owl seasons stickers set":              "owl-seasons-sticker-set",
  "owl holiday sticker set":               "owl-holiday-sticker-set",
  "owl abc's sticker set":                 "owl-abcs-sticker-set",
  "owl numbers sticker set":               "owl-numbers-sticker-set",
  "owl baby girl sticker set":             "owl-baby-girl-sticker-set",
  "owl baby boy sticker set":              "owl-baby-boy-sticker-set",
  "owl explorer sticker set":              "owl-explorer-sticker-set",
  "owl science sticker set":               "owl-science-sticker-set",
  "owl swimming sticker set":              "owl-swimming-sticker-set",
  "owl math sticker set":                  "owl-math-sticker-set",
};

function matchSlug(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (TITLE_TO_SLUG[lower]) return TITLE_TO_SLUG[lower];
  for (const [key, slug] of Object.entries(TITLE_TO_SLUG)) {
    if (lower.includes(key) || key.includes(lower)) return slug;
  }
  return null;
}

function slugAlreadyRegistered(slug: string, content: string): boolean {
  return content.includes(`"${slug}":`) && content.includes("files.cdn.printful.com");
}

function updateImagesTs(slug: string, imageUrl: string, altText: string): "updated" | "skipped" | "error" {
  const imagesPath = path.join(process.cwd(), "src/lib/images.ts");
  let content = fs.readFileSync(imagesPath, "utf-8");

  if (slugAlreadyRegistered(slug, content)) {
    return "skipped";
  }

  const marker = "} as const satisfies Record<string, ProductImages>;";
  if (!content.includes(marker)) {
    process.stderr.write(`ERROR: marker not found in images.ts\n`);
    return "error";
  }

  const newEntry = `  "${slug}": {\n    primary: { src: "${imageUrl}", alt: "${altText}" },\n  },\n`;
  content = content.replace(marker, newEntry + marker);
  fs.writeFileSync(imagesPath, content, "utf-8");
  return "updated";
}

async function main() {
  // Load env from .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
      const [k, ...rest] = line.split("=");
      if (k && rest.length > 0 && !process.env[k.trim()]) {
        process.env[k.trim()] = rest.join("=").trim();
      }
    }
  }

  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey || apiKey === "your_printful_api_key_here") {
    console.error("\n❌ PRINTFUL_API_KEY not set in .env.local");
    console.error("   Get your key: printful.com → Dashboard → Settings → API");
    process.exit(1);
  }

  console.log("\n🦉 OWL Printful Image Sync");
  console.log("================================\n");

  const headers = { Authorization: `Bearer ${apiKey}` };
  const res = await fetch(`${PRINTFUL_BASE}/store/products?limit=100`, { headers });
  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Printful API error ${res.status}: ${err}`);
    process.exit(1);
  }

  const data = await res.json() as { result: Array<{ id: number; name: string; thumbnail_url: string; is_ignored: boolean }> };
  const products = (data.result ?? []).filter(p => !p.is_ignored);
  console.log(`Found ${products.length} Printful products\n`);

  let updated = 0, skipped = 0, failed = 0;
  const manualReview: string[] = [];

  for (const product of products) {
    const slug = matchSlug(product.name);
    if (!slug) {
      console.log(`  ⚠️  NO MATCH  "${product.name}" — add to TITLE_TO_SLUG if needed`);
      manualReview.push(product.name);
      failed++;
      continue;
    }

    const imageUrl = product.thumbnail_url;
    if (!imageUrl) {
      console.log(`  ❌ NO IMAGE  "${product.name}" (${slug})`);
      failed++;
      continue;
    }

    const result = updateImagesTs(slug, imageUrl, product.name);
    if (result === "updated") {
      console.log(`  ✅ UPDATED   "${product.name}" → ${slug}`);
      updated++;
    } else if (result === "skipped") {
      console.log(`  ⏭  SKIPPED   "${product.name}" → ${slug} (already registered)`);
      skipped++;
    } else {
      console.log(`  ❌ ERROR     "${product.name}" → could not update images.ts`);
      failed++;
    }
  }

  console.log("\n================================");
  console.log(`✅ Updated:  ${updated}`);
  console.log(`⏭  Skipped:  ${skipped}`);
  console.log(`❌ Failed:   ${failed}`);

  if (manualReview.length > 0) {
    console.log("\n⚠️  Products needing manual review (no title match):");
    manualReview.forEach(n => console.log(`   - ${n}`));
    console.log("   → Add entries to TITLE_TO_SLUG in this script and re-run");
  }

  if (updated > 0) {
    console.log("\n📁 images.ts updated. Next:");
    console.log('   git add src/lib/images.ts');
    console.log('   git commit -m "chore: sync Printful product images"');
    console.log('   git push');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
