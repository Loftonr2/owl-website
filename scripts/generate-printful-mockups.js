#!/usr/bin/env node
/**
 * scripts/generate-printful-mockups.js
 *
 * For each physical OWL product (t-shirt, mug, bag, etc.):
 *   1. Fetch the sync product detail to get the catalog variant_id
 *   2. Discover the mockup style for that product type
 *   3. Submit a mockup generation task to Printful
 *   4. Poll until complete, then download the result
 *   5. Save to public/images/products/{slug}.png
 *   6. Update src/lib/images.ts with the local path
 *
 * Usage:
 *   node scripts/generate-printful-mockups.js
 *
 * Requires PRINTFUL_API_KEY in .env.local
 */

const fs    = require("fs");
const path  = require("path");
const https = require("https");

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
const STORE_ID      = 18286248;
const PRODUCTS_DIR  = path.join(__dirname, "../public/images/products");
const IMAGES_TS     = path.join(__dirname, "../src/lib/images.ts");

if (!API_KEY || API_KEY.includes("your_")) {
  console.error("❌ PRINTFUL_API_KEY not set in .env.local");
  process.exit(1);
}

// Recovery report has: { owlProduct: { slug }, printfulId, storeId }
function loadRecovery() {
  const p = path.join(__dirname, "../printful-recovery-report.json");
  if (!fs.existsSync(p)) { console.error("❌ printful-recovery-report.json not found"); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const map = new Map();
  for (const prod of (data.foundProducts || [])) {
    map.set(prod.owlProduct.slug, { printfulId: prod.printfulId, name: prod.owlProduct.name });
  }
  return map;
}

const PHYSICAL_SLUGS = [
  "owl-cotton-kids-t-shirt",
  "owl-throw-blanket",
  "owl-flat-bill-cap",
  "owl-insulated-tumbler",
  "owl-wine-tumbler",
  "owl-enamel-mug",
  "owl-spiral-notebook",
  "owl-holographic-stickers",
  "owl-mouse-pad",
  "owl-water-bottle",
  "owl-duffle-bag",
  "owl-backpack",
  "owl-infant-bodysuit",
  "owl-tote-bag",
  "owl-glossy-mug",
  "owl-sweatshirt",
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pf(method, endpoint, body = null) {
  const opts = {
    method,
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "X-PF-Store-Id": String(STORE_ID),
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.printful.com${endpoint}`, opts);
  const json = await res.json();
  return { ok: res.ok, status: res.status, data: json };
}

function downloadPublicFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        downloadPublicFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function updateImagesTs(slug, localPath, altText) {
  let content = fs.readFileSync(IMAGES_TS, "utf-8");
  const pattern = new RegExp('\\s*"' + slug.replace(/-/g, "\\-") + '":\\s*\\{[^}]*\\},?\\n', "g");
  content = content.replace(pattern, "\n");
  const marker = "} as const satisfies Record<string, ProductImages>;";
  if (!content.includes(marker)) { console.error("  ❌ marker not found"); return false; }
  const entry = `  "${slug}": {\n    primary: { src: "${localPath}", alt: "${altText}" },\n  },\n`;
  content = content.replace(marker, entry + marker);
  fs.writeFileSync(IMAGES_TS, content, "utf-8");
  return true;
}

async function generateMockup(slug, printfulId) {
  // 1. Fetch sync product to get catalog product info
  const detail = await pf("GET", `/sync/products/${printfulId}`);
  await sleep(200);

  if (!detail.ok || !detail.data.result) {
    return { ok: false, error: `sync product fetch failed: ${detail.status}` };
  }

  const syncProduct = detail.data.result.sync_product;
  const variants    = detail.data.result.sync_variants || [];

  // thumbnail_url on the sync product is the best bet
  if (syncProduct.thumbnail_url) {
    console.log(`  → Using sync product thumbnail_url`);
    return { ok: true, imageUrl: syncProduct.thumbnail_url, source: "thumbnail" };
  }

  // Get catalog product_id from first variant
  const firstVariant = variants[0];
  if (!firstVariant) return { ok: false, error: "no variants" };

  const catalogProductId = firstVariant.product?.product_id;
  if (!catalogProductId) {
    // dump variant for debugging
    console.log(`  ℹ️  variant keys: ${Object.keys(firstVariant).join(", ")}`);
    return { ok: false, error: "no catalog product_id in variant" };
  }

  console.log(`  → catalog_product_id: ${catalogProductId}`);

  // 2. Get mockup styles for this catalog product
  const stylesRes = await pf("GET", `/mockup-generator/styles/${catalogProductId}`);
  await sleep(200);

  if (!stylesRes.ok || !stylesRes.data.result) {
    return { ok: false, error: `mockup styles fetch failed: ${stylesRes.status}` };
  }

  const styles = stylesRes.data.result;
  const style  = styles[0]; // use first available style
  if (!style) return { ok: false, error: "no mockup styles available" };

  console.log(`  → mockup style: ${style.id} (${style.name || "unnamed"})`);

  // 3. Get variant IDs for the task
  const variantIds = variants.slice(0, 1).map(v => v.variant_id);

  // 4. Submit mockup generation task
  const taskBody = {
    variant_ids: variantIds,
    format: "png",
    extra: [],
  };

  const taskRes = await pf("POST", `/mockup-generator/create-task/${catalogProductId}`, taskBody);
  await sleep(300);

  if (!taskRes.ok) {
    return { ok: false, error: `create task failed: ${taskRes.status} ${JSON.stringify(taskRes.data).slice(0, 200)}` };
  }

  const taskKey = taskRes.data.result?.task_key;
  if (!taskKey) return { ok: false, error: "no task_key in response" };

  console.log(`  → task submitted, polling (key: ${taskKey.slice(0, 20)}...)`);

  // 5. Poll for completion
  for (let i = 0; i < 20; i++) {
    await sleep(3000);
    const poll = await pf("GET", `/mockup-generator/task?task_key=${encodeURIComponent(taskKey)}`);
    const result = poll.data?.result;
    if (!result) continue;

    if (result.status === "completed") {
      const mockups = result.mockups || [];
      const mockup  = mockups[0];
      const imgUrl  = mockup?.mockup_url || mockup?.url;
      if (imgUrl) {
        console.log(`  → mockup ready: ${imgUrl.slice(0, 60)}...`);
        return { ok: true, imageUrl: imgUrl, source: "mockup-generator" };
      }
      return { ok: false, error: "task completed but no mockup_url" };
    }

    if (result.status === "failed") {
      return { ok: false, error: `task failed: ${result.error || "unknown"}` };
    }

    process.stdout.write(".");
  }

  return { ok: false, error: "mockup generation timed out after 60s" };
}

async function main() {
  console.log("\n🦉 Printful Mockup Generator\n");

  const recovery = loadRecovery();
  let updated = 0, errors = 0, skipped = 0;

  for (const slug of PHYSICAL_SLUGS) {
    const destPng = path.join(PRODUCTS_DIR, `${slug}.png`);

    if (fs.existsSync(destPng) && fs.statSync(destPng).size > 5000) {
      const localPath = `/images/products/${slug}.png`;
      const altText   = recovery.get(slug)?.name || slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      updateImagesTs(slug, localPath, altText);
      console.log(`  ⏭  ${slug} — already on disk`);
      skipped++; updated++;
      continue;
    }

    const rec = recovery.get(slug);
    if (!rec) {
      console.log(`  ⚠️  ${slug} — not in recovery report`);
      errors++;
      continue;
    }

    process.stdout.write(`  [${slug}] `);
    const result = await generateMockup(slug, rec.printfulId);

    if (!result.ok) {
      console.log(`\n  ❌ ${result.error}`);
      errors++;
      continue;
    }

    // Download the image
    try {
      await downloadPublicFile(result.imageUrl, destPng);
      const size = fs.statSync(destPng).size;
      if (size < 1000) throw new Error(`tiny file (${size} bytes)`);

      const localPath = `/images/products/${slug}.png`;
      const altText   = rec.name || slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      updateImagesTs(slug, localPath, altText);
      console.log(`\n  ✅ saved ${Math.round(size/1024)}KB → ${localPath}`);
      updated++;
    } catch (err) {
      console.log(`\n  ❌ download failed: ${err.message}`);
      if (fs.existsSync(destPng)) fs.unlinkSync(destPng);
      errors++;
    }

    await sleep(500);
  }

  console.log("\n==========================================");
  console.log(`✅ Updated: ${updated} | ❌ Errors: ${errors} | ⏭  Skipped: ${skipped}`);
  console.log("==========================================");

  if (updated > 0) {
    console.log("\n🚀 Run to deploy:");
    console.log("   git add public/images/products/ src/lib/images.ts");
    console.log('   git commit -m "feat: add Printful product mockup images"');
    console.log("   git push");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
