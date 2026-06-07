import { NextResponse } from "next/server";

/**
 * POST /api/admin/sync-printify-images
 *
 * Fetches product mockup images from Printify and returns the image URLs
 * to be registered in images.ts. Safe — never modifies products or prices.
 *
 * Usage from admin panel or curl:
 *   curl -X POST https://owlsingtogether.com/api/admin/sync-printify-images
 *
 * Requires: PRINTIFY_API_KEY + PRINTIFY_SHOP_ID in Vercel env vars.
 */

const PRINTIFY_BASE = "https://api.printify.com/v1";

const PRODUCT_MAP: Record<string, { printifyId: string; title: string; slug: string }> = {
  "4517393453": { printifyId: "4517393453", title: "OWL Holographic Stickers",           slug: "owl-holographic-stickers" },
  "4517390143": { printifyId: "4517390143", title: "OWL Mouse Pad",                      slug: "owl-mouse-pad" },
  "4517069629": { printifyId: "4517069629", title: "OWL Stainless Steel Water Bottle",   slug: "owl-water-bottle" },
  "4517061382": { printifyId: "4517061382", title: "OWL Space Planets Duffle Bag",       slug: "owl-duffle-bag" },
  "4517027775": { printifyId: "4517027775", title: "OWL Space Planet Backpack",          slug: "owl-backpack" },
  "4516944689": { printifyId: "4516944689", title: "OWL Infant Bodysuit",                slug: "owl-infant-bodysuit" },
  "4516917473": { printifyId: "4516917473", title: "OWL Eco-Friendly Tote Bag",          slug: "owl-tote-bag" },
  "4516915899": { printifyId: "4516915899", title: "White OWL Glossy Mug",               slug: "owl-glossy-mug" },
  "4516906642": { printifyId: "4516906642", title: "OWL T-Shirt",                        slug: "owl-t-shirt" },
  "4516897484": { printifyId: "4516897484", title: "Embroidered Beanie",                 slug: "owl-embroidered-beanie" },
  "4516880570": { printifyId: "4516880570", title: "OWL Sweatshirt",                     slug: "owl-sweatshirt" },
  "4517694662": { printifyId: "4517694662", title: "OWL Throw Blanket",                  slug: "owl-throw-blanket" },
  "4517696473": { printifyId: "4517696473", title: "OWL Cotton Kids T-Shirt",            slug: "owl-cotton-kids-t-shirt" },
  "4517691576": { printifyId: "4517691576", title: "OWL Flat Bill Cap",                  slug: "owl-flat-bill-cap" },
  "4517687356": { printifyId: "4517687356", title: "OWL Teal Insulated Tumbler W/ Straw", slug: "owl-insulated-tumbler" },
  "4517685872": { printifyId: "4517685872", title: "OWL Teal Wine Tumbler",              slug: "owl-wine-tumbler" },
  "4517683038": { printifyId: "4517683038", title: "OWL Spiral Notebook",                slug: "owl-spiral-notebook" },
  "4517685153": { printifyId: "4517685153", title: "OWL Teal Enamel Mug",                slug: "owl-enamel-mug" },
};

interface PrintifyImage {
  src: string;
  position: string;
  is_default: boolean;
}

function getPrimaryImageUrl(images: PrintifyImage[]): string | null {
  const defaultImg = images.find(i => i.is_default);
  if (defaultImg) return defaultImg.src;
  const frontImg = images.find(i => i.position === "front");
  if (frontImg) return frontImg.src;
  return images[0]?.src ?? null;
}

export async function POST() {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    return NextResponse.json({
      error: "Missing credentials",
      required: ["PRINTIFY_API_KEY", "PRINTIFY_SHOP_ID"],
      setup: "Add these in Vercel Dashboard → Settings → Environment Variables",
    }, { status: 503 });
  }

  const results: Array<{
    slug: string;
    title: string;
    printifyId: string;
    imageUrl: string | null;
    status: "synced" | "no_image" | "error";
    error?: string;
  }> = [];

  for (const product of Object.values(PRODUCT_MAP)) {
    try {
      const res = await fetch(
        `${PRINTIFY_BASE}/shops/${shopId}/products/${product.printifyId}.json`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      if (!res.ok) {
        results.push({
          ...product,
          imageUrl: null,
          status: "error",
          error: `API ${res.status}`,
        });
        continue;
      }

      const data = await res.json() as { images: PrintifyImage[] };
      const imageUrl = getPrimaryImageUrl(data.images ?? []);

      results.push({
        ...product,
        imageUrl,
        status: imageUrl ? "synced" : "no_image",
      });

      // Rate limit
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      results.push({
        ...product,
        imageUrl: null,
        status: "error",
        error: String(err),
      });
    }
  }

  const synced = results.filter(r => r.status === "synced");
  const failed = results.filter(r => r.status !== "synced");

  return NextResponse.json({
    summary: {
      total: results.length,
      synced: synced.length,
      failed: failed.length,
    },
    products: results,
    instructions: synced.length > 0
      ? "Copy the imageUrl values below into src/lib/images.ts for each slug, then redeploy."
      : "No images retrieved — check PRINTIFY_API_KEY and PRINTIFY_SHOP_ID.",
    imagesTs_snippet: synced
      .map(p => `  "${p.slug}": { primary: { src: "${p.imageUrl}", alt: "${p.title}" } },`)
      .join("\n"),
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/admin/sync-printify-images",
    description: "Fetches Printify product mockup image URLs for all 18 physical products",
    credentials: {
      PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY ? "set" : "missing",
      PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID ? "set" : "missing",
    },
    products_to_sync: Object.values(PRODUCT_MAP).map(p => ({ slug: p.slug, title: p.title, printifyId: p.printifyId })),
  });
}
