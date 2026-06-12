import { NextRequest, NextResponse } from "next/server";
import { findProductBySlug } from "@/lib/seed/products";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal-server";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CaptureResult {
  status?: string;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id?: string; status?: string }>;
    };
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

// ── Supabase order save ───────────────────────────────────────────────────────

async function saveOrderToSupabase(payload: SupabaseOrderPayload): Promise<void> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
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

// ── Resend confirmation email ─────────────────────────────────────────────────

async function sendConfirmationEmail(data: {
  customerEmail: string;
  customerName: string;
  productTitle: string;
  amount: string;
  paypalOrderId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[capture-order] RESEND_API_KEY not configured — confirmation email skipped.");
    return;
  }

  const firstName = data.customerName.split(" ")[0] || "friend";

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
          <div style="font-family: 'Georgia', serif; max-width: 580px; margin: 0 auto; padding: 40px 20px; background: #fffdf7; border-radius: 16px;">
            <img src="https://owlsingtogether.com/images/brand/circular-logo.png" alt="OWL Sing Together" width="72" style="display:block; margin: 0 auto 24px;" />
            <h1 style="color: #1c2b4a; font-size: 26px; text-align: center; margin-bottom: 8px;">
              Thank you, ${firstName}!
            </h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; text-align: center;">
              Your order has been received and is being prepared with care.
            </p>

            <div style="background: #f0faf7; border-radius: 12px; padding: 24px; margin: 28px 0; border: 1px solid #d1ede7;">
              <p style="margin: 0 0 8px; color: #15a589; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">Order Summary</p>
              <p style="margin: 0 0 4px; color: #1c2b4a; font-size: 17px; font-weight: bold;">${data.productTitle}</p>
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 15px;">$${data.amount} USD</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; font-family: monospace;">Order ID: ${data.paypalOrderId}</p>
            </div>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.7;">
              You will receive a shipping confirmation once your order is on its way.
              Have questions? Reply to this email or visit
              <a href="https://owlsingtogether.com" style="color: #15a589; text-decoration: none;">owlsingtogether.com</a>.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 20px;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              OWL Sing Together · Multicultural music for little learners
            </p>
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

// ── Main handler ──────────────────────────────────────────────────────────────

/**
 * POST /api/paypal/capture-order
 *
 * 1. Looks up the product from SEED_PRODUCTS to get the canonical price
 * 2. Fetches the PayPal order to verify the amount hasn't been tampered with
 * 3. Captures the payment via PayPal Orders API v2
 * 4. Saves the order to Supabase
 * 5. Sends a confirmation email via Resend
 * 6. Returns { success, orderId, captureId, customerEmail, customerName, productTitle, amount }
 *
 * Body: { orderID: string, slug: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderID?: string; slug?: string };
    const { orderID, slug } = body;

    if (!orderID || !slug) {
      return NextResponse.json(
        { error: "Missing orderID or slug" },
        { status: 400 }
      );
    }

    // ── Server-side price validation ──────────────────────────────────────────
    const product = findProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const expectedAmount = parseFloat(product.price.replace(/[^0-9.]/g, "")).toFixed(2);
    const accessToken = await getPayPalAccessToken();

    // ── Fetch order from PayPal to verify amount ──────────────────────────────
    const getRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!getRes.ok) {
      console.error("[capture-order] Could not retrieve PayPal order:", await getRes.text());
      return NextResponse.json(
        { error: "Could not retrieve PayPal order" },
        { status: 502 }
      );
    }

    const orderData = (await getRes.json()) as {
      purchase_units?: Array<{ amount?: { value?: string } }>;
      status?: string;
    };

    const paypalAmount = orderData.purchase_units?.[0]?.amount?.value;
    if (paypalAmount !== expectedAmount) {
      console.error(
        `[capture-order] Amount mismatch for order ${orderID}: ` +
          `expected $${expectedAmount}, PayPal reports $${paypalAmount}`
      );
      return NextResponse.json(
        { error: "Price mismatch — order rejected for security" },
        { status: 400 }
      );
    }

    // ── Capture the payment ───────────────────────────────────────────────────
    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

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
    const captureId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? "";
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
      `[capture-order] Payment captured: ${captureId} for ${product.title} ` +
        `($${expectedAmount}) — ${customerEmail}`
    );

    // ── Save to Supabase ──────────────────────────────────────────────────────
    const totalCents = Math.round(parseFloat(expectedAmount) * 100);

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
      line_items: [
        {
          sku: slug,
          name: product.title,
          quantity: 1,
          unit_price: expectedAmount,
        },
      ],
      placed_at: new Date().toISOString(),
      raw_payload: captureData,
    });

    // ── Send confirmation email ───────────────────────────────────────────────
    await sendConfirmationEmail({
      customerEmail,
      customerName,
      productTitle: product.title,
      amount: expectedAmount,
      paypalOrderId: orderID,
    });

    return NextResponse.json({
      success: true,
      orderId: orderID,
      captureId,
      customerEmail,
      customerName,
      productTitle: product.title,
      amount: expectedAmount,
    });
  } catch (err) {
    console.error("[capture-order] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
