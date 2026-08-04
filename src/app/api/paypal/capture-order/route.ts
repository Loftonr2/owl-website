import { NextRequest, NextResponse } from "next/server";
import { findProductBySlug } from "@/lib/seed/products";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal-server";
import { sendOrderConfirmationOnce } from "@/lib/email/send-order-confirmation";
import type { CartOrderItem } from "@/types/cart";

// -- Types -----------------------------------------------------------------------

interface CaptureResult {
  id?: string;
  status?: string;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { value?: string };
    payments?: {
      captures?: Array<{ id?: string; status?: string }>;
    };
    items?: Array<{
      name?: string;
      sku?: string;
      unit_amount?: { value?: string };
      quantity?: string;
    }>;
    shipping?: {
      name?: { full_name?: string };
      address?: {
        address_line_1?: string;
        address_line_2?: string;
        admin_area_2?: string;  // city
        admin_area_1?: string;  // state/region
        postal_code?: string;
        country_code?: string;
      };
    };
  }>;
}

interface ShippingAddress {
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
}

interface SupabaseOrderPayload {
  external_id: string;
  source: "paypal";
  customer_email: string;
  customer_name: string;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  currency: string;
  status: "paid";
  payment_status: "completed";
  fulfillment_status: "unfulfilled";
  paypal_order_id: string;
  paypal_capture_id: string;
  shipping_address: ShippingAddress | null;
  line_items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unit_price: string;
  }>;
  placed_at: string;
  raw_payload: unknown;
}

// -- Helpers --------------------------------------------------------------------

async function saveOrderToSupabase(payload: SupabaseOrderPayload): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "[capture-order] Supabase not configured — order not persisted. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel."
    );
    return;
  }

  try {
    // Upsert on external_id so the capture route and the PayPal webhook converge
    // on a single order row (whichever arrives second enriches it) instead of
    // colliding on the unique external_id constraint.
    const res = await fetch(
      `${supabaseUrl}/rest/v1/orders?on_conflict=external_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error("[capture-order] Supabase save failed:", await res.text());
    } else {
      console.log("[capture-order] Order saved to Supabase:", payload.paypal_order_id);
    }
  } catch (err) {
    console.error("[capture-order] Supabase error:", err);
  }
}

// -- Main handler ---------------------------------------------------------------

/**
 * POST /api/paypal/capture-order
 *
 * 1. Re-validates every item's price from SEED_PRODUCTS by slug
 * 2. Verifies the PayPal order amount matches the server-computed total
 * 3. Captures the payment
 * 4. Upserts the order to Supabase with full line items
 * 5. Sends the branded confirmation email exactly once (idempotent claim shared
 *    with the PayPal webhook — see src/lib/email/send-order-confirmation.ts)
 * 6. Returns { success, orderId, captureId, customerEmail, customerName, totalAmount }
 *
 * Body: { orderID: string; items: Array<{ slug: string; quantity: number }> }
 *
 * Legacy body: { orderID: string; slug: string }  -- still supported
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      orderID?: string;
      items?: CartOrderItem[];
      slug?: string; // legacy
    };

    const { orderID } = body;
    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    // Normalise items
    let orderItems: CartOrderItem[];
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      orderItems = body.items;
    } else if (body.slug) {
      orderItems = [{ slug: body.slug, quantity: 1 }];
    } else {
      return NextResponse.json({ error: "Missing items or slug" }, { status: 400 });
    }

    // -- Server-side price validation ------------------------------------------
    type LineEntry = {
      slug: string;
      name: string;
      quantity: number;
      unitAmount: string;
    };

    const lineEntries: LineEntry[] = [];
    let expectedTotal = 0;

    for (const item of orderItems) {
      const product = findProductBySlug(item.slug);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.slug}` }, { status: 404 });
      }
      const unitAmount = parseFloat(product.price.replace(/[^0-9.]/g, "")).toFixed(2);
      const lineTotal = parseFloat(unitAmount) * item.quantity;
      expectedTotal += lineTotal;
      lineEntries.push({
        slug: item.slug,
        name: product.title,
        quantity: item.quantity,
        unitAmount,
      });
    }

    const expectedTotalStr = expectedTotal.toFixed(2);
    const accessToken = await getPayPalAccessToken();

    // -- Fetch PayPal order to verify amount -----------------------------------
    const getRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!getRes.ok) {
      console.error("[capture-order] Could not retrieve PayPal order:", await getRes.text());
      return NextResponse.json({ error: "Could not retrieve PayPal order" }, { status: 502 });
    }

    const orderData = (await getRes.json()) as {
      purchase_units?: Array<{ amount?: { value?: string } }>;
      status?: string;
    };

    const paypalAmount = orderData.purchase_units?.[0]?.amount?.value;
    if (paypalAmount !== expectedTotalStr) {
      console.error(
        `[capture-order] Amount mismatch for order ${orderID}: ` +
          `expected ${expectedTotalStr}, PayPal reports ${paypalAmount}`
      );
      return NextResponse.json(
        { error: "Price mismatch — order rejected for security" },
        { status: 400 }
      );
    }

    // -- Capture ---------------------------------------------------------------
    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!captureRes.ok) {
      const errText = await captureRes.text();
      console.error("[capture-order] PayPal capture failed:", errText);
      return NextResponse.json(
        { error: "Payment capture failed — please try again" },
        { status: 502 }
      );
    }

    const captureData = (await captureRes.json()) as CaptureResult;
    const captureStatus = captureData.status ?? "";
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? "";
    const payer = captureData.payer;
    const customerEmail = payer?.email_address ?? "";
    const customerName =
      `${payer?.name?.given_name ?? ""} ${payer?.name?.surname ?? ""}`.trim();

    if (captureStatus !== "COMPLETED") {
      console.error("[capture-order] Capture not COMPLETED:", captureStatus);
      return NextResponse.json(
        { error: `Payment not completed (status: ${captureStatus})` },
        { status: 402 }
      );
    }

    console.log(
      `[capture-order] Payment captured: ${captureId} — ` +
        `${lineEntries.length} item(s) — ${expectedTotalStr} — ${customerEmail}`
    );

    // -- Extract shipping address (never logged) --------------------------------
    const shippingUnit = captureData.purchase_units?.[0]?.shipping;
    const shippingAddress: ShippingAddress | null = shippingUnit?.address
      ? {
          name: shippingUnit.name?.full_name ?? customerName,
          address_line_1: shippingUnit.address.address_line_1 ?? "",
          address_line_2: shippingUnit.address.address_line_2 ?? "",
          city: shippingUnit.address.admin_area_2 ?? "",
          state: shippingUnit.address.admin_area_1 ?? "",
          postal_code: shippingUnit.address.postal_code ?? "",
          country_code: shippingUnit.address.country_code ?? "",
        }
      : null;

    // -- Save to Supabase -------------------------------------------------------
    const totalCents = Math.round(expectedTotal * 100);

    await saveOrderToSupabase({
      external_id: orderID,
      source: "paypal",
      customer_email: customerEmail,
      customer_name: customerName,
      total_cents: totalCents,
      subtotal_cents: totalCents,
      shipping_cents: 0,
      tax_cents: 0,
      currency: "USD",
      status: "paid",
      payment_status: "completed",
      fulfillment_status: "unfulfilled",
      paypal_order_id: orderID,
      paypal_capture_id: captureId,
      shipping_address: shippingAddress,
      line_items: lineEntries.map((e) => ({
        sku: e.slug,
        name: e.name,
        quantity: e.quantity,
        unit_price: e.unitAmount,
      })),
      placed_at: new Date().toISOString(),
      raw_payload: captureData,
    });

    // -- Send confirmation email (idempotent — never blocks the response) -------
    // The webhook may also call this; the atomic DB claim ensures exactly one send.
    try {
      const outcome = await sendOrderConfirmationOnce(orderID);
      console.log("[capture-order] Confirmation email:", outcome.status, "—", customerEmail);
    } catch (emailErr) {
      // Defensive: the helper never throws, but a thrown error must not fail the order.
      console.error("[capture-order] Confirmation email unexpected error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      orderId: orderID,
      captureId,
      customerEmail,
      customerName,
      totalAmount: expectedTotalStr,
      // Include item summary for the confirmation page
      itemCount: lineEntries.reduce((s, e) => s + e.quantity, 0),
      firstItemName: lineEntries[0]?.name ?? "",
    });
  } catch (err) {
    console.error("[capture-order] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
