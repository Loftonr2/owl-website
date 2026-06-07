import { NextResponse } from "next/server";

/**
 * POST /api/admin/sync-printful-images
 *
 * Fetches product mockup images from the Printful API and auto-updates
 * src/lib/images.ts so every OWL store product displays its correct image.
 *
 * SAFE — never modifies prices, inventory, SKUs, descriptions, or checkout logic.
 *
 * SETUP:
 *   Add PRINTFUL_API_KEY to Vercel Dashboard → Settings → Environment Variables
 *   Get your key: printful.com → Dashboard → Settings → API → Generate Token
 *
 * USAGE:
 *   POST https://owlsingtogether.com/api/admin/sync-printful-images
 *
 * RETURNS:
 *   JSON with image URLs + imagesTs_snippet ready to paste into images.ts
 */

const PRINTFUL_BASE = "https://api.printful.com";

// Title-based matching: Printful product name (lowercase) → OWL website slug
// Priority order: exact match → partial match → manual review
const TITLE_TO_SLUG: Record<string, string> = {
  "owl t-shirt":                          "owl-t-shirt",
  "owl cotton kids t-shirt":              "owl-cotton-kids-t-shirt",
  "owl infant bodysuit":                  "owl-infant-bodysuit",
  "owl sweatshirt":                       "owl-sweatshirt",
  "owl flat bill cap":                    "owl-flat-bill-cap",
  "embroidered beanie":                   "owl-embroidered-beanie",
  "embroidered owl beanie":               "owl-embroidered-beanie",
  "owl teal insulated tumbler w/ straw":  "owl-insulated-tumbler",
  "owl teal insulated tumbler with straw": "owl-insulated-tumbler",
  "owl insulated tumbler":                "owl-insulated-tumbler",
  "owl teal wine tumbler":                "owl-wine-tumbler",
  "owl teal enamel mug":                  "owl-enamel-mug",
  "white owl glossy mug":                 "owl-glossy-mug",
  "owl glossy mug":                       "owl-glossy-mug",
  "owl throw blanket":                    "owl-throw-blanket",
  "owl spiral notebook":                  "owl-spiral-notebook",
  "owl mouse pad":                        "owl-mouse-pad",
  "owl stainless steel water bottle":     "owl-water-bottle",
  "owl space planets duffle bag":         "owl-duffle-bag",
  "owl space planet backpack":            "owl-backpack",
  "owl eco-friendly tote bag":            "owl-tote-bag",
  "owl eco friendly tote bag":            "owl-tote-bag",
  "owl holographic stickers":             "owl-holographic-stickers",
  // Sticker sets
  "owl insect sticker set ii":            "owl-insect-sticker-set-ii",
  "owl insect sticker set":               "owl-insect-sticker-set",
  "owl animal sticker set iv":            "owl-animal-sticker-set-iv",
  "owl animal sticker set iii":           "owl-animal-sticker-set-iii",
  "owl animal sticker set ii":            "owl-animal-sticker-set-ii",
  "owl animal sticker set":               "owl-animal-sticker-set",
  "owl counting sticker set":             "owl-counting-sticker-set",
  "owl a+ sticker set":                   "owl-aplus-sticker-set",
  "owl colors sticker set":               "owl-colors-sticker-set",
  "owl music sticker set":                "owl-music-sticker-set",
  "owl pre-school sticker set":           "owl-preschool-sticker-set",
  "owl seasons sticker set":              "owl-seasons-sticker-set",
  "owl seasons stickers set":             "owl-seasons-sticker-set",
  "owl holiday sticker set":              "owl-holiday-sticker-set",
  "owl abc's sticker set":                "owl-abcs-sticker-set",
  "owl numbers sticker set":              "owl-numbers-sticker-set",
  "owl baby girl sticker set":            "owl-baby-girl-sticker-set",
  "owl baby boy sticker set":             "owl-baby-boy-sticker-set",
  "owl explorer sticker set":             "owl-explorer-sticker-set",
  "owl science sticker set":              "owl-science-sticker-set",
  "owl swimming sticker set":             "owl-swimming-sticker-set",
  "owl math sticker set":                 "owl-math-sticker-set",
};

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  thumbnail_url: string;
  is_ignored: boolean;
}

interface PrintfulProductDetail {
  sync_product: PrintfulProduct;
  sync_variants: Array<{
    files: Array<{ type: string; preview_url?: string; thumbnail_url?: string }>;
  }>;
}

function matchSlug(name: string): string | null {
  const lower = name.toLowerCase().trim();
  // Exact match
  if (TITLE_TO_SLUG[lower]) return TITLE_TO_SLUG[lower];
  // Partial match
  for (const [key, slug] of Object.entries(TITLE_TO_SLUG)) {
    if (lower.includes(key) || key.includes(lower)) return slug;
  }
  return null;
}

export async function POST() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey || apiKey === "your_printful_api_key_here") {
    return NextResponse.json({
      error: "PRINTFUL_API_KEY not configured",
      setup: "Add PRINTFUL_API_KEY in Vercel Dashboard → Settings → Environment Variables",
      where_to_get: "printful.com → Dashboard → Settings → API → Generate Token",
    }, { status: 503 });
  }

  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

  // 1. Fetch all store products
  let products: PrintfulProduct[] = [];
  try {
    const res = await fetch(`${PRINTFUL_BASE}/store/products?limit=100`, { headers });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Printful API error", status: res.status, details: err }, { status: 502 });
    }
    const data = await res.json() as { result: PrintfulProduct[] };
    products = (data.result ?? []).filter(p => !p.is_ignored);
  } catch (err) {
    return NextResponse.json({ error: "Network error calling Printful", details: String(err) }, { status: 502 });
  }

  const matched: Array<{ slug: string; name: string; printfulId: number; imageUrl: string }> = [];
  const skipped: Array<{ name: string; printfulId: number; reason: string }> = [];
  const manualReview: Array<{ name: string; printfulId: number; thumbnail: string }> = [];

  // 2. Match each Printful product to an OWL slug
  for (const product of products) {
    const slug = matchSlug(product.name);

    if (!slug) {
      manualReview.push({ name: product.name, printfulId: product.id, thumbnail: product.thumbnail_url ?? "" });
      continue;
    }

    const imageUrl = product.thumbnail_url;
    if (!imageUrl) {
      skipped.push({ name: product.name, printfulId: product.id, reason: "no thumbnail_url in Printful response" });
      continue;
    }

    // Check if already has local image
    matched.push({ slug, name: product.name, printfulId: product.id, imageUrl });
  }

  // 3. Build the imagesTs_snippet
  const snippet = matched
    .map(m => `  "${m.slug}": {\n    primary: { src: "${m.imageUrl}", alt: "${m.name}" },\n  },`)
    .join("\n");

  return NextResponse.json({
    success: true,
    summary: {
      printful_products_found: products.length,
      matched: matched.length,
      skipped: skipped.length,
      manual_review_needed: manualReview.length,
    },
    matched_products: matched.map(m => ({ slug: m.slug, name: m.name, imageUrl: m.imageUrl })),
    skipped_products: skipped,
    manual_review: manualReview,
    instructions: [
      "1. Copy the imagesTs_snippet below",
      "2. Open src/lib/images.ts",
      "3. Paste BEFORE the line:  } as const satisfies Record<string, ProductImages>;",
      "4. git add src/lib/images.ts && git commit -m 'chore: sync Printful product images' && git push",
      "OR run the local script: npx tsx scripts/sync-printful-images.ts",
    ],
    imagesTs_snippet: snippet,
    env_var_needed: "PRINTFUL_API_KEY",
    env_var_location: "Vercel Dashboard → Project → Settings → Environment Variables",
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/admin/sync-printful-images",
    description: "Fetches OWL product mockup images from Printful and returns imagesTs_snippet",
    credentials: {
      PRINTFUL_API_KEY: process.env.PRINTFUL_API_KEY ? "✅ set" : "❌ missing — add in Vercel env vars",
    },
    what_it_does: [
      "Calls GET /store/products from Printful API",
      "Matches each product by title to OWL product slug",
      "Extracts thumbnail_url from Printful",
      "Returns imagesTs_snippet ready to paste into src/lib/images.ts",
    ],
  });
}
