import { NextRequest, NextResponse } from "next/server";
import { findProductBySlug } from "@/lib/seed/products";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal-server";
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
  }>;
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
    const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[capture-order] Supabase save failed:", await res.text());
    } else {
      console.log("[capture-order] Order saved to Supabase:", payload.paypal_order_id);
    }
  } catch (err) {
    console.error("[capture-order] Supabase error:", err);
  }
}

async function sendConfirmationEmail(data: {
  customerEmail: string;
  customerName: string;
  lineItems: Array<{ name: string; quantity: number; unitPrice: string }>;
  totalAmount: string;
  paypalOrderId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[capture-order] RESEND_API_KEY not configured — confirmation email skipped.");
    return;
  }

  const firstName = data.customerName.split(" ")[0] || "friend";

  // Build item rows for the email
  const itemRows = data.lineItems
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;color:#1c2b4a;font-size:15px;">${i.name}</td>
          <td style="padding:8px 0;color:#6b7280;font-size:15px;text-align:center;">&times;${i.quantity}</td>
          <td style="padding:8px 0;color:#1c2b4a;font-size:15px;text-align:right;">$${(parseFloat(i.unitPrice) * i.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "OWL Sing Together <store@owlsingtogether.com>",
        to: [data.customerEmail],
        subject: "Your OWL order is confirmed!",
        html: `
          <div style="font-family:'Georgia',serif;max-width:580px;margin:0 auto;padding:40px 20px;background:#fffdf7;border-radius:16px;">
            <img src="https://owlsingtogether.com/images/brand/circular-logo.png" alt="OWL Sing Together" width="72" style="display:block;margin:0 auto 24px;" />
            <h1 style="color:#1c2b4a;font-size:26px;text-align:center;margin-bottom:8px;">Thank you, ${firstName}!</h1>
            <p style="color:#4b5563;font-size:16px;line-height:1.7;text-align:center;">Your order has been received and is being prepared with care.</p>
            <div style="background:#f0faf7;border-radius:12px;padding:24px;margin:28px 0;border:1px solid #d1ede7;">
              <p style="margin:0 0 12px;color:#15a589;font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Order Summary</p>
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid #d1ede7;">
                    <th style="padding:0 0 8px;color:#9ca3af;font-size:11px;text-align:left;font-weight:normal;">Item</th>
                    <th style="padding:0 0 8px;color:#9ca3af;font-size:11px;text-align:center;font-weight:normal;">Qty</th>
                    <th style="padding:0 0 8px;color:#9ca3af;font-size:11px;text-align:right;font-weight:normal;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                  <tr style="border-top:1px solid #d1ede7;">
                    <td colspan="2" style="padding:12px 0 0;color:#1c2b4a;font-size:15px;font-weight:bold;">Order total</td>
                    <td style="padding:12px 0 0;color:#15a589;font-size:17px;font-weight:bold;text-align:right;">$${data.totalAmount} USD</td>
                  </tr>
                </tfoot>
              </table>
              <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;font-family:monospace;">Order ID: ${data.paypalOrderId}</p>
            </div>
            <p style="color:#4b5563;font-size:15px;line-height:1.7;">
              You will receive a shipping confirmation once your order is on its way.
              Have questions? Reply to this email or visit
              <a href="https://owlsingtogether.com" style="color:#15a589;text-decoration:none;">owlsingtogether.com</a>.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 20px;" />
            <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">OWL Sing Together &middot; Multicultural music for little learners</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      console.error("[capture-order] Resend error:", await res.text());
    } else {
      console.log("[capture-order] Confirmation email sent to:", data.customerEmail);
    }
  } catch (err) {
    console.error("[capture-order] Email send error:", err);
  }
}

// -- Main handler ---------------------------------------------------------------

/**
 * POST /api/paypal/capture-order
 *
 * 1. Re-validates every item's price from SEED_PRODUCTS by slug
 * 2. Verifies the PayPal order amount matches the server-computed total
 * 3. Captures the payment
 * 4. Saves the order to Supabase with full line items
 * 5. Sends a confirmation email with the full item list
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
          `expected $${expectedTotalStr}, PayPal reports $${paypalAmount}`
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
        `${lineEntries.length} item(s) — $${expectedTotalStr} — ${customerEmail}`
    );

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
      line_items: lineEntries.map((e) => ({
        sku: e.slug,
        name: e.name,
        quantity: e.quantity,
        unit_price: e.unitAmount,
      })),
      placed_at: new Date().toISOString(),
      raw_payload: captureData,
    });

    // -- Send confirmation email ------------------------------------------------
    await sendConfirmationEmail({
      customerEmail,
      customerName,
      lineItems: lineEntries.map((e) => ({
        name: e.name,
        quantity: e.quantity,
        unitPrice: e.unitAmount,
      })),
      totalAmount: expectedTotalStr,
      paypalOrderId: orderID,
    });

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
