import { NextResponse } from "next/server";

/**
 * POST /api/admin/sync-printify
 *
 * Pulls all products from the Printify API and upserts them into the
 * Supabase `products` table.
 *
 * Requirements:
 *   PRINTIFY_API_KEY     — from Printify Dashboard → My Account → API
 *   PRINTIFY_SHOP_ID     — from Printify Dashboard → Stores (numeric ID)
 *   SUPABASE_URL         — from Supabase Dashboard → Settings → API
 *   SUPABASE_SERVICE_ROLE_KEY — from Supabase Dashboard → Settings → API
 *
 * Usage:
 *   curl -X POST https://owlsingtogether.com/api/admin/sync-printify \
 *        -H "Authorization: Bearer <SYNC_SECRET>"
 *
 * Protect with SYNC_SECRET in .env.local to prevent unauthorized syncs.
 */

const PRINTIFY_BASE = "https://api.printify.com/v1";

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: { src: string; is_default: boolean }[];
  variants: { price: number; cost?: number; is_enabled: boolean }[];
}

export async function POST(req: Request) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const syncSecret = process.env.SYNC_SECRET;
  if (syncSecret && authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    return NextResponse.json(
      {
        error: "Missing credentials",
        required: ["PRINTIFY_API_KEY", "PRINTIFY_SHOP_ID"],
        message:
          "Add these to your .env.local file. Find them in Printify Dashboard → My Account → API and → Stores.",
      },
      { status: 503 }
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        error: "Missing Supabase credentials",
        required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
      },
      { status: 503 }
    );
  }

  try {
    // 1. Fetch all products from Printify
    const printifyRes = await fetch(
      `${PRINTIFY_BASE}/shops/${shopId}/products.json?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!printifyRes.ok) {
      const err = await printifyRes.text();
      return NextResponse.json(
        { error: "Printify API error", details: err },
        { status: printifyRes.status }
      );
    }

    const { data: printifyProducts }: { data: PrintifyProduct[] } =
      await printifyRes.json();

    // 2. Transform each Printify product into a Supabase row
    const rows = printifyProducts.map((p) => {
      const enabledVariants = p.variants.filter((v) => v.is_enabled);
      const prices = enabledVariants.map((v) => v.price);
      const minPrice = Math.min(...prices);

      const defaultImage = p.images.find((img) => img.is_default) ?? p.images[0];

      // Derive a slug from the title
      const slug = p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return {
        printify_product_id: p.id,
        title: p.title,
        slug,
        description: p.description,
        price_cents: minPrice,
        category: "Apparel", // Default — admin can update in CRM
        channel: "printify",
        product_source: "printify",
        status: "coming_soon",
        coming_soon: true,
        featured: false,
        images: p.images.map((img) => ({
          src: img.src,
          is_default: img.is_default,
        })),
        tags: p.tags,
        seo_title: p.title,
        // Default image stored as first in images array
        ...(defaultImage ? { _default_image: defaultImage.src } : {}),
      };
    });

    // 3. Upsert into Supabase via REST API
    // Using service role key to bypass RLS for admin operations
    const upsertRes = await fetch(
      `${supabaseUrl}/rest/v1/products?on_conflict=printify_product_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(rows),
      }
    );

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      return NextResponse.json(
        { error: "Supabase upsert failed", details: err },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      synced: rows.length,
      products: rows.map((r) => ({ slug: r.slug, title: r.title })),
      message: `Synced ${rows.length} products from Printify → Supabase. Review in /admin/products.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Sync failed", details: String(err) },
      { status: 500 }
    );
  }
}

// Also expose GET to check sync status / credentials
export async function GET() {
  const hasApiKey = !!process.env.PRINTIFY_API_KEY;
  const hasShopId = !!process.env.PRINTIFY_SHOP_ID;
  const hasSupabase =
    !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

  return NextResponse.json({
    ready: hasApiKey && hasShopId && hasSupabase,
    credentials: {
      PRINTIFY_API_KEY: hasApiKey ? "✅ set" : "❌ missing",
      PRINTIFY_SHOP_ID: hasShopId ? "✅ set" : "❌ missing",
      SUPABASE: hasSupabase ? "✅ set" : "❌ missing",
    },
    usage: "POST /api/admin/sync-printify with Authorization: Bearer <SYNC_SECRET>",
  });
}
