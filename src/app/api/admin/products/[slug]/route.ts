import { NextResponse } from "next/server";

/**
 * PATCH /api/admin/products/[slug]
 *
 * Updates a product's Printify Product ID and Variant ID in Supabase.
 * Called from the Admin CRM when an admin enters IDs in the browser.
 *
 * Once saved, the PayPal webhook automatically uses these IDs for
 * order fulfillment without requiring a code deploy.
 *
 * Body: { printifyProductId: string; printifyVariantId: number }
 *
 * Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        error: "Supabase not configured",
        message: "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.",
        required: {
          SUPABASE_URL: !process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      },
      { status: 503 }
    );
  }

  let body: { printifyProductId?: string; printifyVariantId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { printifyProductId, printifyVariantId } = body;

  if (!printifyProductId && printifyVariantId === undefined) {
    return NextResponse.json(
      { error: "Provide printifyProductId and/or printifyVariantId" },
      { status: 400 }
    );
  }

  // Build update payload — only set fields that were provided
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (printifyProductId !== undefined) {
    updatePayload.printify_product_id = printifyProductId || null;
  }
  if (printifyVariantId !== undefined) {
    updatePayload.printify_variant_id = printifyVariantId || null;
  }

  // Upsert: try to update existing row first, insert if not found
  // First, try update (products might already be in Supabase from sync)
  const updateRes = await fetch(
    `${supabaseUrl}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updatePayload),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.text();
    console.error("[Admin Products API] Supabase update failed:", err);
    return NextResponse.json(
      { error: "Supabase update failed", details: err },
      { status: 500 }
    );
  }

  const updated = await updateRes.json() as unknown[];

  // If no rows were updated, the product doesn't exist in Supabase yet
  // Insert a minimal record with the IDs
  if (!updated || updated.length === 0) {
    const insertPayload = {
      slug,
      title: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      price_cents: 0,
      channel: "printify",
      product_source: "printify",
      status: "live",
      ...updatePayload,
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(insertPayload),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error("[Admin Products API] Supabase insert failed:", err);
      return NextResponse.json(
        { error: "Could not create product record in Supabase", details: err },
        { status: 500 }
      );
    }

    const inserted = await insertRes.json() as unknown[];
    return NextResponse.json({
      success: true,
      action: "inserted",
      slug,
      printifyProductId: printifyProductId ?? null,
      printifyVariantId: printifyVariantId ?? null,
      record: inserted[0],
      message: "Printify IDs saved. Auto-fulfillment will activate when both Product ID and Variant ID are set.",
    });
  }

  const fulfillmentReady = !!(printifyProductId && printifyVariantId);
  console.log(
    `[Admin Products API] Updated ${slug}:`,
    `printifyProductId=${printifyProductId ?? "cleared"}`,
    `printifyVariantId=${printifyVariantId ?? "cleared"}`,
    `auto-fulfillment: ${fulfillmentReady ? "ENABLED" : "not yet ready"}`
  );

  return NextResponse.json({
    success: true,
    action: "updated",
    slug,
    printifyProductId: printifyProductId ?? null,
    printifyVariantId: printifyVariantId ?? null,
    autoFulfillmentEnabled: fulfillmentReady,
    message: fulfillmentReady
      ? "✅ Auto-fulfillment enabled for this product."
      : "IDs saved. Add both Product ID and Variant ID to enable auto-fulfillment.",
  });
}

/**
 * GET /api/admin/products/[slug]
 * Returns the Supabase record for a product (if it exists).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=*`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  const data = await res.json() as unknown[];
  return NextResponse.json({
    found: data.length > 0,
    product: data[0] ?? null,
  });
}
