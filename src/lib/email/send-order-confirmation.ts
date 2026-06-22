/**
 * Idempotent order-confirmation email orchestrator — SERVER ONLY.
 *
 * Both the PayPal capture route and the PAYMENT.CAPTURE.COMPLETED webhook call
 * `sendOrderConfirmationOnce(externalId)` after the order row is persisted. The
 * atomic `claim_order_confirmation_email` RPC guarantees the customer is emailed
 * exactly once even if both fire or PayPal retries the webhook — only the caller
 * that flips confirmation_email_sent_at from NULL to now() actually sends.
 *
 * It never throws: order fulfillment must not be blocked by an email failure.
 * On send failure the claim is released (sent_at reset to NULL) so a later
 * webhook retry or an admin retry can try again, and the error is recorded.
 */

import { supabaseServiceRole } from "@/lib/clients/supabase-server";
import { sendEmail, SUPPORT_EMAIL } from "./resend";
import {
  renderOrderConfirmationEmail,
  type OrderConfirmationData,
  type OrderEmailLineItem,
  type OrderEmailShippingAddress,
} from "./order-confirmation-template";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://owlsingtogether.com").replace(/\/$/, "");

export type SendOutcome =
  | { status: "sent"; messageId: string }
  | { status: "skipped_already_sent" }
  | { status: "skipped_no_email" }
  | { status: "error"; error: string };

interface ClaimedOrderRow {
  id: string;
  external_id: string;
  customer_email: string | null;
  customer_name: string | null;
  line_items: unknown;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  tax_cents: number | null;
  total_cents: number | null;
  currency: string | null;
  shipping_address: Record<string, unknown> | null;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  coupon_code: string | null;
  placed_at: string | null;
}

function normalizeLineItems(raw: unknown): OrderEmailLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const o = (entry ?? {}) as Record<string, unknown>;
    return {
      name: String(o.name ?? o.title ?? "Item"),
      sku: o.sku != null ? String(o.sku) : undefined,
      quantity: Number(o.quantity ?? 1) || 1,
      unit_price:
        o.unit_price != null ? String(o.unit_price) : o.unitPrice != null ? String(o.unitPrice) : undefined,
    };
  });
}

function normalizeShipping(raw: Record<string, unknown> | null): OrderEmailShippingAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const g = (k: string) => (raw[k] != null ? String(raw[k]) : undefined);
  const addr: OrderEmailShippingAddress = {
    name: g("name") ?? g("full_name"),
    address1: g("address1") ?? g("address_line_1"),
    address2: g("address2") ?? g("address_line_2"),
    city: g("city") ?? g("admin_area_2"),
    state: g("state") ?? g("admin_area_1"),
    zip: g("zip") ?? g("postal_code"),
    country: g("country") ?? g("country_code"),
  };
  if (!addr.address1 && !addr.city) return null;
  return addr;
}

/**
 * Send the confirmation email for an order, exactly once.
 * @param externalId the order's external_id (= PayPal order id).
 */
export async function sendOrderConfirmationOnce(externalId: string): Promise<SendOutcome> {
  if (!externalId) return { status: "error", error: "missing externalId" };

  let supabase: ReturnType<typeof supabaseServiceRole>;
  try {
    supabase = supabaseServiceRole();
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : "service-role client unavailable" };
  }

  // Atomically claim — only the winning caller receives the row.
  const { data: claimedRows, error: claimErr } = await supabase.rpc("claim_order_confirmation_email", {
    p_external_id: externalId,
  });

  if (claimErr) {
    return { status: "error", error: `claim failed: ${claimErr.message}` };
  }

  const order = (claimedRows as ClaimedOrderRow[] | null)?.[0];
  if (!order) {
    // Already sent/claimed by another invocation, or the row isn't present yet.
    return { status: "skipped_already_sent" };
  }

  const email = (order.customer_email ?? "").trim();
  if (!email) {
    await supabase
      .from("orders")
      .update({ confirmation_email_sent_at: null, confirmation_email_error: "no customer email on order" })
      .eq("external_id", externalId);
    return { status: "skipped_no_email" };
  }

  const data: OrderConfirmationData = {
    orderId: order.paypal_order_id ?? order.external_id,
    customerName: order.customer_name,
    lineItems: normalizeLineItems(order.line_items),
    totalCents: order.total_cents ?? 0,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    taxCents: order.tax_cents,
    currency: order.currency ?? "USD",
    shippingAddress: normalizeShipping(order.shipping_address),
    accountUrl: `${SITE_URL}/account`,
  };

  const rendered = renderOrderConfirmationEmail(data);

  try {
    const { id } = await sendEmail({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      replyTo: SUPPORT_EMAIL,
    });
    await supabase
      .from("orders")
      .update({ confirmation_email_message_id: id, confirmation_email_error: null })
      .eq("external_id", externalId);
    return { status: "sent", messageId: id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "email send failed";
    // Release the claim so a webhook retry / admin retry can try again.
    await supabase
      .from("orders")
      .update({ confirmation_email_sent_at: null, confirmation_email_error: msg })
      .eq("external_id", externalId);
    return { status: "error", error: msg };
  }
}
