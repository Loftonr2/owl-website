import { NextRequest, NextResponse } from "next/server";
import { findProductBySlug } from "@/lib/seed/products";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal-server";
import type { CartOrderItem } from "@/types/cart";

/**
 * POST /api/paypal/create-order
 *
 * Creates a PayPal Orders API v2 order with server-validated prices.
 * The client NEVER sends prices — we look them up from SEED_PRODUCTS by slug.
 *
 * Body (cart flow):   { items: Array<{ slug: string; quantity: number }> }
 * Body (legacy):      { slug: string }  — single item, qty 1
 *
 * Returns: { id: string }  — PayPal order ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      items?: CartOrderItem[];
      slug?: string; // legacy single-product flow
    };

    // Normalise to CartOrderItem[]
    let orderItems: CartOrderItem[];
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      orderItems = body.items;
    } else if (body.slug) {
      orderItems = [{ slug: body.slug, quantity: 1 }];
    } else {
      return NextResponse.json({ error: "Missing items or slug" }, { status: 400 });
    }

    // Server-side price validation
    type LineEntry = {
      slug: string;
      name: string;
      quantity: number;
      unitAmount: string;
      isDigital: boolean;
    };

    const lineEntries: LineEntry[] = [];
    let grandTotal = 0;

    for (const item of orderItems) {
      const product = findProductBySlug(item.slug);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.slug}` },
          { status: 404 }
        );
      }
      if (product.isComingSoon) {
        return NextResponse.json(
          { error: `Product not yet available: ${item.slug}` },
          { status: 400 }
        );
      }
      const unitAmount = parseFloat(product.price.replace(/[^0-9.]/g, "")).toFixed(2);
      const lineTotal = parseFloat(unitAmount) * item.quantity;
      grandTotal += lineTotal;
      lineEntries.push({
        slug: item.slug,
        name: product.title,
        quantity: item.quantity,
        unitAmount,
        isDigital: product.category === "Digital",
      });
    }

    const grandTotalStr = grandTotal.toFixed(2);
    const itemTotalStr = grandTotalStr; // no shipping/tax at this stage

    // Encode cart for webhook: "slug1:qty1,slug2:qty2"
    const customId = lineEntries
      .map((e) => `${e.slug}:${e.quantity}`)
      .join(",");

    // Build PayPal order payload
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
            custom_id: customId,
            description:
              lineEntries.length === 1
                ? lineEntries[0].name
                : `OWL Sing Together — ${lineEntries.length} items`,
            amount: {
              currency_code: "USD",
              value: grandTotalStr,
              breakdown: {
                item_total: { currency_code: "USD", value: itemTotalStr },
              },
            },
            items: lineEntries.map((e) => ({
              name: e.name,
              sku: e.slug,
              unit_amount: { currency_code: "USD", value: e.unitAmount },
              quantity: String(e.quantity),
              category: e.isDigital ? "DIGITAL_GOODS" : "PHYSICAL_GOODS",
            })),
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
    console.log(
      `[create-order] Created order ${order.id} — ` +
        `${lineEntries.length} item(s) — $${grandTotalStr}`
    );
    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error("[create-order] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
