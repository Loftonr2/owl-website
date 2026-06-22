import { NextResponse } from "next/server";

/**
 * POST /api/printify/create-order
 *
 * Manually creates a Printify order from order data.
 * Used as a fallback if the PayPal webhook fails.
 *
 * Body:
 *   { paypalOrderId, lineItems: [{ printifyProductId, variantId, quantity }], shippingAddress }
 *
 * Requires: PRINTIFY_API_KEY + PRINTIFY_SHOP_ID
 */
export async function POST(req: Request) {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    return NextResponse.json(
      {
        error: "Printify credentials not configured",
        required: { PRINTIFY_API_KEY: !apiKey, PRINTIFY_SHOP_ID: !shopId },
        setup: "Add these to Vercel Dashboard → Environment Variables",
      },
      { status: 503 }
    );
  }

  let body: {
    paypalOrderId: string;
    lineItems: Array<{ printifyProductId: string; variantId: number; quantity: number }>;
    shippingAddress: {
      firstName: string; lastName: string; email: string;
      address1: string; address2?: string; city: string;
      state: string; zip: string; country: string;
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { paypalOrderId, lineItems, shippingAddress: addr } = body;

  if (!paypalOrderId || !lineItems?.length || !addr) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const printifyPayload = {
    external_id: paypalOrderId,
    label: `OWL-${paypalOrderId.slice(-8).toUpperCase()}`,
    line_items: lineItems.map(item => ({
      product_id: item.printifyProductId,
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: addr.firstName,
      last_name: addr.lastName,
      email: addr.email,
      phone: "",
      country: addr.country || "US",
      region: addr.state,
      address1: addr.address1,
      address2: addr.address2 ?? "",
      city: addr.city,
      zip: addr.zip,
    },
  };

  const res = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/orders.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printifyPayload),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "Printify API error", details: err }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ success: true, printifyOrderId: data.id, data });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/printify/create-order",
    description: "Manually create a Printify order from a PayPal order ID",
    credentials: {
      PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY ? "✅ set" : "❌ missing",
      PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID ? "✅ set" : "❌ missing",
    },
  });
}
