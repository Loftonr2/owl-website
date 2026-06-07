import { NextResponse } from "next/server";

/**
 * POST /api/webhooks/paypal
 *
 * Receives PayPal order completion webhooks and automatically creates
 * the corresponding Printify order for fulfillment.
 *
 * Setup in PayPal Developer Dashboard:
 *   1. Go to developer.paypal.com → My Apps → Your App → Webhooks
 *   2. Add webhook URL: https://owlsingtogether.com/api/webhooks/paypal
 *   3. Subscribe to: CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED
 *
 * Requires env vars:
 *   PAYPAL_WEBHOOK_ID      — from PayPal Developer Dashboard → Webhooks
 *   PRINTIFY_API_KEY       — from Printify Dashboard → My Account → API
 *   PRINTIFY_SHOP_ID       — from Printify Dashboard → Stores
 */

interface PayPalWebhookEvent {
  event_type: string;
  resource: {
    id: string;
    status: string;
    purchase_units?: Array<{
      description?: string;
      amount: { value: string; currency_code: string };
      shipping?: {
        name?: { full_name?: string };
        address?: {
          address_line_1?: string;
          address_line_2?: string;
          admin_area_2?: string;
          admin_area_1?: string;
          postal_code?: string;
          country_code?: string;
        };
      };
      items?: Array<{
        name: string;
        unit_amount: { value: string };
        quantity: string;
        sku?: string;
      }>;
    }>;
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    console.warn("[PayPal Webhook] Missing Printify credentials — order logged but not forwarded");
  }

  let event: PayPalWebhookEvent;
  try {
    event = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[PayPal Webhook] Event received:", event.event_type, event.resource?.id);

  // Only process completed payments
  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED" && event.event_type !== "CHECKOUT.ORDER.APPROVED") {
    return NextResponse.json({ received: true, action: "ignored", reason: "Event type not processed" });
  }

  const unit = event.resource?.purchase_units?.[0];
  if (!unit) {
    return NextResponse.json({ received: true, action: "ignored", reason: "No purchase units" });
  }

  const shipping = unit.shipping;
  const addr = shipping?.address;

  // Build Printify order payload
  // NOTE: printify_product_id and variant_id must be added to each product
  // in the seed once you have them from the Printify dashboard.
  // Until then, orders are logged and must be manually fulfilled.
  const printifyOrder = {
    external_id: event.resource.id,
    label: `OWL-${event.resource.id.slice(-8).toUpperCase()}`,
    line_items: (unit.items ?? []).map(item => ({
      // These fields require the Printify Product ID and Variant ID
      // to be stored in your product seed or database.
      // Format: { product_id: "12345678", variant_id: 12345, quantity: 1 }
      print_provider_id: null,
      product_id: null,  // <-- add from Printify Dashboard → Products → ID
      variant_id: null,  // <-- add from Printify Dashboard → Products → Variants
      quantity: parseInt(item.quantity, 10),
      _item_name: item.name,
      _item_sku: item.sku ?? "",
    })),
    shipping_method: 1, // Standard shipping
    send_shipping_notification: true,
    address_to: {
      first_name: shipping?.name?.full_name?.split(" ")[0] ?? "Customer",
      last_name: shipping?.name?.full_name?.split(" ").slice(1).join(" ") ?? "",
      email: "", // PayPal doesn"t always send email in webhook — handle in checkout flow
      phone: "",
      country: addr?.country_code ?? "US",
      region: addr?.admin_area_1 ?? "",
      address1: addr?.address_line_1 ?? "",
      address2: addr?.address_line_2 ?? "",
      city: addr?.admin_area_2 ?? "",
      zip: addr?.postal_code ?? "",
    },
  };

  // Check if we have valid Printify product IDs
  const hasProductIds = printifyOrder.line_items.every(
    item => item.product_id !== null && item.variant_id !== null
  );

  if (!hasProductIds || !apiKey || !shopId) {
    // Log the order for manual processing
    console.log("[PayPal Webhook] Order needs manual Printify fulfillment:", JSON.stringify({
      paypalOrderId: event.resource.id,
      items: printifyOrder.line_items.map(i => ({ name: i._item_name, qty: i.quantity })),
      shipTo: printifyOrder.address_to,
    }, null, 2));

    return NextResponse.json({
      received: true,
      action: "logged",
      message: "Order logged. Add PRINTIFY_API_KEY + Product IDs to enable auto-fulfillment.",
      orderId: event.resource.id,
    });
  }

  // Forward to Printify
  const printifyRes = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/orders.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printifyOrder),
    }
  );

  if (!printifyRes.ok) {
    const err = await printifyRes.text();
    console.error("[PayPal Webhook] Printify order creation failed:", err);
    return NextResponse.json(
      { error: "Printify order failed", details: err },
      { status: 500 }
    );
  }

  const printifyData = await printifyRes.json();
  console.log("[PayPal Webhook] Printify order created:", printifyData.id);

  return NextResponse.json({
    received: true,
    action: "fulfilled",
    paypalOrderId: event.resource.id,
    printifyOrderId: printifyData.id,
  });
}

export async function GET() {
  return NextResponse.json({
    status: "PayPal webhook endpoint active",
    url: "/api/webhooks/paypal",
    register_at: "https://developer.paypal.com/dashboard → My Apps → Webhooks",
    events: ["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.APPROVED"],
    credentials: {
      PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID ? "✅ set" : "❌ missing",
      PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY ? "✅ set" : "❌ missing",
      PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID ? "✅ set" : "❌ missing",
    },
  });
}
