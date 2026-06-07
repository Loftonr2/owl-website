#!/usr/bin/env node
/**
 * scripts/sync-printify-images.ts
 *
 * Fetches product mockup images from the Printify API and registers them
 * in src/lib/images.ts so they display on the OWL website store.
 *
 * SAFE RULES:
 *   - Never deletes products
 *   - Only updates the images section of images.ts
 *   - Skips products that already have images registered
 *   - Logs every matched, skipped, and failed product
 *
 * USAGE:
 *   1. Set PRINTIFY_API_KEY and PRINTIFY_SHOP_ID in .env.local
 *   2. Run:  npx tsx scripts/sync-printify-images.ts
 *   3. Review the log output
 *   4. git add src/lib/images.ts && git commit -m "chore: sync Printify product images"
 *
 * REQUIRES: tsx (already in devDependencies or install with: npm i -D tsx)
 */

import * as fs from "fs";
import * as path from "path";

const PRINTIFY_BASE = "https://api.printify.com/v1";

// Slug → Printify Product ID mapping (extracted from Printify dashboard)
const PRODUCT_MAP: Record<string, { printifyId: string; title: string }> = {
  "owl-holographic-stickers":  { printifyId: "4517393453", title: "OWL Holographic Stickers" },
  "owl-mouse-pad":             { printifyId: "4517390143", title: "OWL Mouse Pad" },
  "owl-water-bottle":          { printifyId: "4517069629", title: "OWL Stainless Steel Water Bottle" },
  "owl-duffle-bag":            { printifyId: "4517061382", title: "OWL Space Planets Duffle Bag" },
  "owl-backpack":              { printifyId: "4517027775", title: "OWL Space Planet Backpack" },
  "owl-infant-bodysuit":       { printifyId: "4516944689", title: "OWL Infant Bodysuit" },
  "owl-tote-bag":              { printifyId: "4516917473", title: "OWL Eco-Friendly Tote Bag" },
  "owl-glossy-mug":            { printifyId: "4516915899", title: "White OWL Glossy Mug" },
  "owl-t-shirt":               { printifyId: "4516906642", title: "OWL T-Shirt" },
  "owl-embroidered-beanie":    { printifyId: "4516897484", title: "Embroidered Beanie" },
  "owl-sweatshirt":            { printifyId: "4516880570", title: "OWL Sweatshirt" },
  "owl-throw-blanket":         { printifyId: "4517694662", title: "OWL Throw Blanket" },
  "owl-cotton-kids-t-shirt":   { printifyId: "4517696473", title: "OWL Cotton Kids T-Shirt" },
  "owl-flat-bill-cap":         { printifyId: "4517691576", title: "OWL Flat Bill Cap" },
  "owl-insulated-tumbler":     { printifyId: "4517687356", title: "OWL Teal Insulated Tumbler W/ Straw" },
  "owl-wine-tumbler":          { printifyId: "4517685872", title: "OWL Teal Wine Tumbler" },
  "owl-spiral-notebook":       { printifyId: "4517683038", title: "OWL Spiral Notebook" },
  "owl-enamel-mug":            { printifyId: "4517685153", title: "OWL Teal Enamel Mug" },
};

interface PrintifyImage {
  src: string;
  position: string;
  is_default: boolean;
  variant_ids: number[];
}

async function fetchProductImages(shopId: string, productId: string, apiKey: string): Promise<PrintifyImage[]> {
  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${shopId}/products/${productId}.json`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (!res.ok) {
    throw new Error(`Printify API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json() as { images: PrintifyImage[] };
  return data.images ?? [];
}

function getPrimaryImageUrl(images: PrintifyImage[]): string | null {
  // Priority: is_default → position "front" → first image
  const defaultImg = images.find(i => i.is_default);
  if (defaultImg) return defaultImg.src;
  const frontImg = images.find(i => i.position === "front");
  if (frontImg) return frontImg.src;
  return images[0]?.src ?? null;
}

function updateImagesTs(slug: string, imageUrl: string, altText: string): boolean {
  const imagesPath = path.join(process.cwd(), "src/lib/images.ts");
  let content = fs.readFileSync(imagesPath, "utf-8");

  // Check if already registered
  if (content.includes(`"${slug}":`)) {
    const entryMatch = content.match(new RegExp(`"${slug}":\s*\{[^}]+\}`));
    if (entryMatch && entryMatch[0].includes("printify.com")) {
      console.log(`  ⏭  SKIP   ${slug} — already has Printify image`);
      return false;
    }
    if (entryMatch && !entryMatch[0].includes("printify.com")) {
      console.log(`  ⏭  SKIP   ${slug} — already has local image (keeping local)`);
      return false;
    }
  }

  // Insert new entry before the closing of the products object
  const marker = "} as const satisfies Record<string, ProductImages>;";
  if (!content.includes(marker)) {
    console.error(`  ❌ ERROR  Could not find insert marker in images.ts`);
    return false;
  }

  const newEntry = `  "${slug}": {
    primary: {
      src: "${imageUrl}",
      alt: "${altText}",
    },
  },
`;

  content = content.replace(marker, newEntry + marker);
  fs.writeFileSync(imagesPath, content, "utf-8");
  return true;
}

async function main() {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    console.error("\n❌ Missing environment variables:");
    console.error("   PRINTIFY_API_KEY  — Printify Dashboard → My Account → API");
    console.error("   PRINTIFY_SHOP_ID  — Printify Dashboard → Stores → URL ID");
    console.error("\nAdd these to .env.local then run: npx tsx scripts/sync-printify-images.ts");
    process.exit(1);
  }

  console.log("\n🦉 OWL Printify Image Sync");
  console.log("================================");
  console.log(`Shop: ${shopId}`);
  console.log(`Products to sync: ${Object.keys(PRODUCT_MAP).length}\n`);

  const results = { synced: 0, skipped: 0, failed: 0 };
  const failedProducts: string[] = [];

  for (const [slug, { printifyId, title }] of Object.entries(PRODUCT_MAP)) {
    try {
      process.stdout.write(`  🔄 ${title}... `);
      const images = await fetchProductImages(shopId, printifyId, apiKey);
      const primaryUrl = getPrimaryImageUrl(images);

      if (!primaryUrl) {
        console.log("no images found");
        results.failed++;
        failedProducts.push(`${title} (${slug}) — no images in Printify`);
        continue;
      }

      const updated = updateImagesTs(slug, primaryUrl, title);
      if (updated) {
        console.log(`✅ ${primaryUrl.slice(0, 60)}...`);
        results.synced++;
      } else {
        results.skipped++;
      }
    } catch (err) {
      console.log(`❌ ${err instanceof Error ? err.message : String(err)}`);
      results.failed++;
      failedProducts.push(`${title} (${slug})`);
    }

    // Respect Printify rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log("\n================================");
  console.log(`✅ Synced:  ${results.synced}`);
  console.log(`⏭  Skipped: ${results.skipped} (already have images)`);
  console.log(`❌ Failed:  ${results.failed}`);

  if (failedProducts.length > 0) {
    console.log("\nFailed products (manual action needed):");
    failedProducts.forEach(p => console.log(`  - ${p}`));
  }

  if (results.synced > 0) {
    console.log("\n📁 images.ts updated.");
    console.log("Next steps:");
    console.log("  git add src/lib/images.ts");
    console.log('  git commit -m "chore: sync Printify product images"');
    console.log("  git push");
  }
}

main().catch(console.error);
