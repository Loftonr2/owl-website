import { NextResponse } from "next/server";
import { SEED_PRODUCTS } from "@/lib/seed/products";

/**
 * POST /api/webhooks/paypal
 *
 * Handles PayPal webhook events for the OWL store.
 * When payment completes → auto-creates Printify order (if IDs present)
 * or logs for manual review.
 *
 * ── SETUP STEPS (do once in PayPal Developer Dashboard) ──────────────────
 * 1. developer.paypal.com → My Apps → Your App → Webhooks → Add Webhook
 * 2. URL: https://owlsingtogether.com/api/webhooks/paypal
 * 3. Events to subscribe:
 *      CHECKOUT.ORDER.APPROVED
 *      PAYMENT.CAPTURE.COMPLETED
 *      PAYMENT.CAPTURE.DENIED
 *      PAYMENT.CAPTURE.REFUNDED
 * 4. Copy the Webhook ID and add it to Vercel env vars as PAYPAL_WEBHOOK_ID
 *
 * ── ENV VARS REQUIRED ────────────────────────────────────────────────────
 *   PAYPAL_WEBHOOK_ID       — from PayPal Developer Dashboard → Webhooks
 *   NEXT_PUBLIC_PAYPAL_CLIENT_ID — PayPal app client ID
 *   PRINTIFY_API_KEY        — Printify Dashboard → My Account → API
 *   PRINTIFY_SHOP_ID        — Printify Dashboard → Stores (numeric URL ID)
 *   NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY — for order storage
 */

// ── In-memory idempotency guard (resets on cold start, Supabase is source of truth) ──
const processedEvents = new Set<string>();

// ── Types ────────────────────────────────────────────────────────────────────
interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: {
    id: string;
    status?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
    purchase_units?: Array<{
      description?: string;
      custom_id?: string;
      amount: { value: string; currency_code: string };
      payee?: { email_address?: string };
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
        description?: string;
      }>;
    }>;
    payer?: {
      email_address?: string;
      name?: { given_name?: string; surname?: string };
    };
  };
}

interface OrderRecord {
  paypal_event_id: string;
  paypal_order_id: string;
  event_type: string;
  status: "paid" | "denied" | "refunded" | "submitted_to_printify" | "manual_review_required" | "fulfillment_failed";
  customer_email: string;
  shipping_name: string;
  shipping_address: Record<string, string>;
  line_items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unit_price: string;
    printify_product_id: string | null;
    printify_variant_id: number | null;
    fulfillment_ready: boolean;
  }>;
  printify_order_id?: string;
  manual_review_reason?: string;
  total_amount: string;
  currency: string;
  raw_event: unknown;
  created_at: string;
}

// ── PayPal signature verification ────────────────────────────────────────────
async function verifyPayPalSignature(req: Request, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // Skip verification in dev if PAYPAL_WEBHOOK_ID not set
    console.warn("[PayPal Webhook] PAYPAL_WEBHOOK_ID not set — skipping signature verification");
    return true;
  }

  // PayPal signature headers
  const transmissionId = req.headers.get("paypal-transmission-id") ?? "";
  const transmissionTime = req.headers.get("paypal-transmission-time") ?? "";
  const certUrl = req.headers.get("paypal-cert-url") ?? "";
  const transmissionSig = req.headers.get("paypal-transmission-sig") ?? "";
  const authAlgo = req.headers.get("paypal-auth-algo") ?? "";

  if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig) {
    console.error("[PayPal Webhook] Missing signature headers");
    return false;
  }

  try {
    // Use PayPal's webhook verification API
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";

    // Get access token
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      console.warn("[PayPal Webhook] Could not get access token for verification — allowing through");
      return true;
    }

    const { access_token } = await tokenRes.json() as { access_token: string };

    // Verify webhook signature
    const verifyRes = await fetch("https://api-m.paypal.com/v1/notifications/verify-webhook-signature", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    });

    if (!verifyRes.ok) {
      console.error("[PayPal Webhook] Signature verification API error");
      return false;
    }

    const { verification_status } = await verifyRes.json() as { verification_status: string };
    return verification_status === "SUCCESS";
  } catch (err) {
    console.error("[PayPal Webhook] Signature verification failed:", err);
    // Fail open in case of network error — log and continue
    return true;
  }
}

// ── Save order to Supabase (if connected) ────────────────────────────────────
async function saveOrderToSupabase(order: OrderRecord): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("[PayPal Webhook] Supabase not configured — order not persisted to DB");
    return;
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        external_id: order.paypal_order_id,
        source: "paypal",
        customer_email: order.customer_email,
        total_cents: Math.round(parseFloat(order.total_amount) * 100),
        currency: order.currency,
        status: order.status === "paid" ? "paid" : order.status === "submitted_to_printify" ? "fulfilled" : "pending",
        line_items: order.line_items,
        placed_at: order.created_at,
        raw_payload: order.raw_event,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[PayPal Webhook] Supabase save failed:", err);
    } else {
      console.log("[PayPal Webhook] Order saved to Supabase:", order.paypal_order_id);
    }
  } catch (err) {
    console.error("[PayPal Webhook] Supabase save error:", err);
  }
}

// ── Lookup product by SKU or name (seed fallback) ────────────────────────────
function findProductBySku(sku: string, name: string) {
  const bySlug = SEED_PRODUCTS.find(p => p.slug === sku);
  if (bySlug) return bySlug;
  const nameLower = name.toLowerCase();
  return SEED_PRODUCTS.find(p => p.title.toLowerCase().includes(nameLower.slice(0, 10)));
}

// ── Lookup Printify IDs from Supabase (admin-entered IDs take priority over seed) ──
// This allows admins to enter IDs via /admin/products without a code deploy.
async function lookupPrintifyIdsFromSupabase(slug: string): Promise<{ printifyProductId: string | null; printifyVariantId: number | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { printifyProductId: null, printifyVariantId: null };
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=printify_product_id,printify_variant_id`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    if (!res.ok) return { printifyProductId: null, printifyVariantId: null };
    const rows = await res.json() as Array<{ printify_product_id?: string | null; printify_variant_id?: number | null }>;
    if (!rows.length) return { printifyProductId: null, printifyVariantId: null };
    return {
      printifyProductId: rows[0].printify_product_id ?? null,
      printifyVariantId: rows[0].printify_variant_id ?? null,
    };
  } catch {
    return { printifyProductId: null, printifyVariantId: null };
  }
}

// ── Main webhook handler ──────────────────────────────────────────────────────
export async function POST(req: Request) {
  // Clone request so we can read body twice (for signature + JSON parse)
  const rawBody = await req.text();
  let event: PayPalWebhookEvent;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = event.id ?? "";
  console.log("[PayPal Webhook] Received:", event.event_type, "| Event ID:", eventId);

  // ── Idempotency: skip already-processed events ──
  if (processedEvents.has(eventId)) {
    console.log("[PayPal Webhook] Duplicate event ignored:", eventId);
    return NextResponse.json({ received: true, action: "duplicate_ignored", eventId });
  }

  // ── Signature verification ──
  const reqClone = new Request(req.url, {
    method: req.method,
    headers: req.headers,
    body: rawBody,
  });
  const signatureValid = await verifyPayPalSignature(reqClone, rawBody);
  if (!signatureValid) {
    console.error("[PayPal Webhook] Invalid signature — rejecting event:", eventId);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  processedEvents.add(eventId);
  // Prevent unbounded growth (keep last 500 event IDs)
  if (processedEvents.size > 500) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }

  // ── Handle PAYMENT.CAPTURE.DENIED ──
  if (event.event_type === "PAYMENT.CAPTURE.DENIED") {
    console.log("[PayPal Webhook] Payment denied:", event.resource.id);
    return NextResponse.json({
      received: true,
      action: "payment_denied",
      message: "Payment was denied. No order created.",
      captureId: event.resource.id,
    });
  }

  // ── Handle PAYMENT.CAPTURE.REFUNDED ──
  if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
    console.log("[PayPal Webhook] Refund received:", event.resource.id);
    return NextResponse.json({
      received: true,
      action: "refunded",
      message: "Refund recorded. Cancel Printify order manually if already submitted.",
      captureId: event.resource.id,
    });
  }

  // ── Handle CHECKOUT.ORDER.APPROVED (order approved, capture may still be pending) ──
  if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
    console.log("[PayPal Webhook] Order approved (awaiting capture):", event.resource.id);
    return NextResponse.json({
      received: true,
      action: "order_approved_awaiting_capture",
      orderId: event.resource.id,
    });
  }

  // ── Handle PAYMENT.CAPTURE.COMPLETED — the main fulfillment trigger ──
  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true, action: "ignored", reason: "Event type not handled" });
  }

  const unit = event.resource?.purchase_units?.[0];
  const payer = event.resource?.payer;
  const shipping = unit?.shipping;
  const addr = shipping?.address;

  const customerEmail = payer?.email_address ?? "";
  const shippingName = shipping?.name?.full_name ?? `${payer?.name?.given_name ?? ""} ${payer?.name?.surname ?? ""}`.trim();
  const orderId = event.resource.supplementary_data?.related_ids?.order_id ?? event.resource.id;
  const totalAmount = unit?.amount?.value ?? "0";
  const currency = unit?.amount?.currency_code ?? "USD";

  // ── Build line items — check Supabase first (admin-entered IDs), then seed ──
  const lineItems = await Promise.all((unit?.items ?? []).map(async item => {
    const product = findProductBySku(item.sku ?? "", item.name);
    const slug = item.sku ?? product?.slug ?? "";

    // 1. Try Supabase (IDs entered via /admin/products)
    const { printifyProductId: dbPid, printifyVariantId: dbVid } = await lookupPrintifyIdsFromSupabase(slug);

    // 2. Fall back to seed data
    const seedPid = (product as { printifyProductId?: string | null })?.printifyProductId ?? null;
    const seedVid = (product as { printifyVariantId?: number | null })?.printifyVariantId ?? null;

    const printifyProductId = dbPid ?? seedPid;
    const printifyVariantId = dbVid ?? seedVid;
    const fulfillmentReady = !!(printifyProductId && printifyVariantId);

    return {
      name: item.name,
      sku: item.sku ?? product?.slug ?? "",
      quantity: parseInt(item.quantity, 10),
      unit_price: item.unit_amount?.value ?? "0",
      printify_product_id: printifyProductId,
      printify_variant_id: printifyVariantId,
      fulfillment_ready: fulfillmentReady,
    };
  }));

  const allReady = lineItems.length > 0 && lineItems.every(i => i.fulfillment_ready);
  const missingIds = lineItems.filter(i => !i.fulfillment_ready);

  const orderRecord: OrderRecord = {
    paypal_event_id: eventId,
    paypal_order_id: orderId,
    event_type: event.event_type,
    status: "paid",
    customer_email: customerEmail,
    shipping_name: shippingName,
    shipping_address: {
      address1: addr?.address_line_1 ?? "",
      address2: addr?.address_line_2 ?? "",
      city: addr?.admin_area_2 ?? "",
      state: addr?.admin_area_1 ?? "",
      zip: addr?.postal_code ?? "",
      country: addr?.country_code ?? "US",
    },
    line_items: lineItems,
    total_amount: totalAmount,
    currency,
    raw_event: event,
    created_at: new Date().toISOString(),
  };

  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  // ── Manual review path (missing IDs or credentials) ──
  if (!allReady || !apiKey || !shopId) {
    const reasons: string[] = [];
    if (!apiKey) reasons.push("PRINTIFY_API_KEY not configured");
    if (!shopId) reasons.push("PRINTIFY_SHOP_ID not configured");
    if (missingIds.length > 0) {
      reasons.push(`Missing Printify Product ID for: ${missingIds.map(i => i.name).join(", ")}`);
    }

    orderRecord.status = "manual_review_required";
    orderRecord.manual_review_reason = reasons.join("; ");

    console.warn("[PayPal Webhook] ⚠️  MANUAL REVIEW REQUIRED:", JSON.stringify({
      orderId,
      customer: customerEmail,
      shippingTo: shippingName,
      reasons,
      items: lineItems.map(i => ({ name: i.name, qty: i.quantity, ready: i.fulfillment_ready })),
      address: orderRecord.shipping_address,
    }, null, 2));

    await saveOrderToSupabase(orderRecord);

    return NextResponse.json({
      received: true,
      action: "manual_review_required",
      orderId,
      customer: customerEmail,
      reasons,
      items: lineItems.map(i => ({ name: i.name, qty: i.quantity, fulfillment_ready: i.fulfillment_ready })),
      next_steps: [
        "Log into /admin/products and add Printify Product IDs",
        "Add PRINTIFY_API_KEY and PRINTIFY_SHOP_ID to Vercel env vars",
        "Manually submit order to Printify at api.printify.com",
      ],
    });
  }

  // ── Auto-fulfillment path ──
  const printifyPayload = {
    external_id: orderId,
    label: `OWL-${orderId.slice(-8).toUpperCase()}`,
    line_items: lineItems.map(i => ({
      product_id: i.printify_product_id,
      variant_id: i.printify_variant_id,
      quantity: i.quantity,
    })),
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: shippingName.split(" ")[0] ?? "Customer",
      last_name: shippingName.split(" ").slice(1).join(" ") ?? "",
      email: customerEmail,
      phone: "",
      country: addr?.country_code ?? "US",
      region: addr?.admin_area_1 ?? "",
      address1: addr?.address_line_1 ?? "",
      address2: addr?.address_line_2 ?? "",
      city: addr?.admin_area_2 ?? "",
      zip: addr?.postal_code ?? "",
    },
  };

  try {
    const printifyRes = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/orders.json`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(printifyPayload),
      }
    );

    if (!printifyRes.ok) {
      const err = await printifyRes.text();
      console.error("[PayPal Webhook] Printify order creation FAILED:", err);
      orderRecord.status = "fulfillment_failed";
      orderRecord.manual_review_reason = `Printify API error: ${err.slice(0, 200)}`;
      await saveOrderToSupabase(orderRecord);
      return NextResponse.json({ error: "Printify order failed", details: err }, { status: 500 });
    }

    const printifyData = await printifyRes.json() as { id: string };
    console.log("[PayPal Webhook] ✅ Printify order created:", printifyData.id);

    orderRecord.status = "submitted_to_printify";
    orderRecord.printify_order_id = printifyData.id;
    await saveOrderToSupabase(orderRecord);

    return NextResponse.json({
      received: true,
      action: "auto_fulfilled",
      orderId,
      printifyOrderId: printifyData.id,
      customer: customerEmail,
      items: lineItems.map(i => ({ name: i.name, qty: i.quantity })),
    });
  } catch (err) {
    console.error("[PayPal Webhook] Unexpected error during Printify submission:", err);
    orderRecord.status = "fulfillment_failed";
    orderRecord.manual_review_reason = String(err);
    await saveOrderToSupabase(orderRecord);
    return NextResponse.json({ error: "Unexpected fulfillment error", details: String(err) }, { status: 500 });
  }
}

// GET - credential + readiness check
export async function GET() {
  const productsMissingIds = SEED_PRODUCTS.filter(p => {
    const src = (p as { productSource?: string }).productSource;
    const pid = (p as { printifyProductId?: string | null }).printifyProductId;
    return src === 'printify' && !pid;
  }).length;

  return NextResponse.json({
    status: 'PayPal webhook endpoint active',
    url: 'https://owlsingtogether.com/api/webhooks/paypal',
    setup_instructions: {
      step_1: 'developer.paypal.com -> My Apps -> [App] -> Webhooks -> Add Webhook',
      step_2: 'URL: https://owlsingtogether.com/api/webhooks/paypal',
      step_3: 'Events: CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED',
      step_4: 'Copy Webhook ID -> add to Vercel as PAYPAL_WEBHOOK_ID',
    },
    credentials: {
      PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID ? 'set' : 'missing',
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 'set' : 'missing',
      PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY ? 'set' : 'missing',
      PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID ? 'set' : 'missing',
      SUPABASE: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) ? 'set' : 'missing',
    },
    supabase_id_lookup: 'Enabled - IDs entered via /admin/products take priority over seed',
    fulfillment_readiness: {
      products_missing_printify_id: productsMissingIds,
      auto_fulfillment_possible: productsMissingIds === 0,
      tip: 'Enter Printify IDs at /admin/products - activates auto-fulfillment with no code deploy',
    },
  });
}
