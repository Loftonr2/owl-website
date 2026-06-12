import { NextRequest, NextResponse } from "next/server";
import { findProductBySlug } from "@/lib/seed/products";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal-server";

/**
 * POST /api/paypal/create-order
 *
 * Creates a PayPal Orders API v2 order with server-validated price.
 * The client NEVER sends the price — we look it up from SEED_PRODUCTS.
 *
 * Body: { slug: string }
 * Returns: { id: string }  — PayPal order ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { slug?: string };
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: "Missing product slug" }, { status: 400 });
    }

    // ── Server-side price lookup ──────────────────────────────────────────────
    // The client never touches the price. We read it from the TypeScript seed.
    const product = findProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.isComingSoon) {
      return NextResponse.json({ error: "Product not yet available for purchase" }, { status: 400 });
    }

    const amount = parseFloat(product.price.replace(/[^0-9.]/g, "")).toFixed(2);
    const isDigital = product.category === "Digital";

    // ── Create PayPal order ───────────────────────────────────────────────────
    const accessToken = await getPayPalAccessToken();

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: slug,
            description: product.title,
            amount: {
              currency_code: "USD",
              value: amount,
              breakdown: {
                item_total: { currency_code: "USD", value: amount },
              },
            },
            items: [
              {
                name: product.title,
                sku: slug,
                unit_amount: { currency_code: "USD", value: amount },
                quantity: "1",
                category: isDigital ? "DIGITAL_GOODS" : "PHYSICAL_GOODS",
              },
            ],
          },
        ],
      }),
      cache: "no-store",
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error("[create-order] PayPal error:", errText);
      return NextResponse.json(
        { error: "PayPal order creation failed" },
        { status: 502 }
      );
    }

    const order = (await orderRes.json()) as { id: string };
    console.log(`[create-order] Created order ${order.id} for ${product.title} ($${amount})`);
    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("[create-order] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
