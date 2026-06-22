/**
 * Branded OWL Sing Together order-confirmation email — HTML + plain-text.
 *
 * Pure rendering: no I/O, no secrets. Given normalized order data it returns
 * { subject, html, text }. Tone is warm, educational, and family-friendly.
 */

import { SUPPORT_EMAIL } from "./resend";

export interface OrderEmailLineItem {
  name: string;
  sku?: string;
  quantity: number;
  /** Per-unit price as a string ("12.00") or number. */
  unit_price?: string | number;
}

export interface OrderEmailShippingAddress {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface OrderConfirmationData {
  /** Human-facing order reference (PayPal order id / external id). */
  orderId: string;
  customerName?: string | null;
  lineItems: OrderEmailLineItem[];
  totalCents: number;
  subtotalCents?: number | null;
  shippingCents?: number | null;
  taxCents?: number | null;
  currency?: string | null;
  shippingAddress?: OrderEmailShippingAddress | null;
  /** Link back to the customer's account / order area. */
  accountUrl?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// -- Brand tokens (mirrors the site palette) -----------------------------------
const INK = "#1c2b4a";
const TEAL = "#15a589";
const CREAM = "#fffdf7";
const MUTED = "#6b7280";
const LOGO_URL = "https://owlsingtogether.com/images/brand/circular-logo.png";

export const ORDER_CONFIRMATION_SUBJECT = "Thank you for your OWL Sing Together order";

// -- Helpers -------------------------------------------------------------------

function money(cents: number | null | undefined, currency = "USD"): string {
  const value = (cents ?? 0) / 100;
  try {
    return value.toLocaleString("en-US", { style: "currency", currency });
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function unitToNumber(unit?: string | number): number {
  if (typeof unit === "number") return unit;
  if (typeof unit === "string") return parseFloat(unit.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

function firstNameOf(name?: string | null): string {
  const n = (name ?? "").trim();
  if (!n) return "friend";
  return n.split(/\s+/)[0];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAddress(a?: OrderEmailShippingAddress | null): string[] {
  if (!a) return [];
  const lines: string[] = [];
  if (a.name) lines.push(a.name);
  if (a.address1) lines.push(a.address1);
  if (a.address2) lines.push(a.address2);
  const cityLine = [a.city, a.state, a.zip].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);
  if (a.country) lines.push(a.country);
  return lines;
}

// -- Renderer ------------------------------------------------------------------

export function renderOrderConfirmationEmail(data: OrderConfirmationData): RenderedEmail {
  const currency = data.currency ?? "USD";
  const firstName = firstNameOf(data.customerName);
  const accountUrl = data.accountUrl ?? "https://owlsingtogether.com/account";
  const addressLines = formatAddress(data.shippingAddress);

  const lineTotalCents = (i: OrderEmailLineItem) =>
    Math.round(unitToNumber(i.unit_price) * i.quantity * 100);

  // ---- HTML ----
  const itemRows = data.lineItems
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;color:${INK};font-size:15px;border-bottom:1px solid #eee7d6;">${escapeHtml(i.name)}</td>
          <td style="padding:10px 0;color:${MUTED};font-size:15px;text-align:center;border-bottom:1px solid #eee7d6;">&times;${i.quantity}</td>
          <td style="padding:10px 0;color:${INK};font-size:15px;text-align:right;border-bottom:1px solid #eee7d6;">${money(lineTotalCents(i), currency)}</td>
        </tr>`
    )
    .join("");

  const totalsRows: string[] = [];
  if (data.subtotalCents != null) {
    totalsRows.push(
      `<tr><td colspan="2" style="padding:4px 0;color:${MUTED};font-size:14px;">Subtotal</td><td style="padding:4px 0;color:${INK};font-size:14px;text-align:right;">${money(data.subtotalCents, currency)}</td></tr>`
    );
  }
  if (data.shippingCents != null) {
    totalsRows.push(
      `<tr><td colspan="2" style="padding:4px 0;color:${MUTED};font-size:14px;">Shipping</td><td style="padding:4px 0;color:${INK};font-size:14px;text-align:right;">${data.shippingCents === 0 ? "Free" : money(data.shippingCents, currency)}</td></tr>`
    );
  }
  if (data.taxCents != null && data.taxCents > 0) {
    totalsRows.push(
      `<tr><td colspan="2" style="padding:4px 0;color:${MUTED};font-size:14px;">Tax</td><td style="padding:4px 0;color:${INK};font-size:14px;text-align:right;">${money(data.taxCents, currency)}</td></tr>`
    );
  }

  const addressBlock = addressLines.length
    ? `<div style="margin:24px 0;">
         <p style="margin:0 0 6px;color:${TEAL};font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Shipping to</p>
         <p style="margin:0;color:${INK};font-size:15px;line-height:1.6;">${addressLines.map(escapeHtml).join("<br />")}</p>
       </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(ORDER_CONFIRMATION_SUBJECT)}</title></head>
<body style="margin:0;padding:0;background:#f4f1e8;">
  <div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;padding:40px 24px;background:${CREAM};">
    <img src="${LOGO_URL}" alt="OWL Sing Together" width="72" height="72" style="display:block;margin:0 auto 20px;" />
    <h1 style="color:${INK};font-size:26px;text-align:center;margin:0 0 8px;">Thank you, ${escapeHtml(firstName)}!</h1>
    <p style="color:#4b5563;font-size:16px;line-height:1.7;text-align:center;margin:0 0 4px;">Your order is confirmed and we're preparing it with care.</p>
    <p style="color:${MUTED};font-size:13px;text-align:center;margin:0 0 28px;font-family:Arial,sans-serif;">Order <strong style="color:${INK};">${escapeHtml(data.orderId)}</strong></p>

    <div style="background:#f0faf7;border-radius:12px;padding:24px;margin:0 0 8px;border:1px solid #d1ede7;">
      <p style="margin:0 0 12px;color:${TEAL};font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">Order summary</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="padding:0 0 8px;color:#9ca3af;font-size:11px;text-align:left;font-weight:normal;">Item</th>
          <th style="padding:0 0 8px;color:#9ca3af;font-size:11px;text-align:center;font-weight:normal;">Qty</th>
          <th style="padding:0 0 8px;color:#9ca3af;font-size:11px;text-align:right;font-weight:normal;">Total</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:14px;">
        ${totalsRows.join("")}
        <tr>
          <td colspan="2" style="padding:12px 0 0;color:${INK};font-size:16px;font-weight:bold;">Total</td>
          <td style="padding:12px 0 0;color:${TEAL};font-size:18px;font-weight:bold;text-align:right;">${money(data.totalCents, currency)}</td>
        </tr>
      </table>
    </div>

    ${addressBlock}

    <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:24px 0;">
      Your songs and goodies are on their way to little ears and big hearts. We'll send a shipping note with tracking as soon as your order leaves our hands — usually within a few business days.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${accountUrl}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:8px;">View your account</a>
    </div>

    <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:24px 0 0;">
      Questions about your order? Just reply to this email or reach us at
      <a href="mailto:${SUPPORT_EMAIL}" style="color:${TEAL};text-decoration:none;">${SUPPORT_EMAIL}</a> — a real person will help.
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 20px;" />
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;font-family:Arial,sans-serif;">OWL Sing Together &middot; Multicultural music for little learners<br />Sing together. Grow together.</p>
  </div>
</body></html>`;

  // ---- Plain text fallback ----
  const textLines: string[] = [];
  textLines.push(`Thank you, ${firstName}!`);
  textLines.push("");
  textLines.push("Your OWL Sing Together order is confirmed and we're preparing it with care.");
  textLines.push("");
  textLines.push(`Order: ${data.orderId}`);
  textLines.push("");
  textLines.push("Order summary");
  textLines.push("-------------");
  for (const i of data.lineItems) {
    textLines.push(`  ${i.name}  x${i.quantity}   ${money(lineTotalCents(i), currency)}`);
  }
  if (data.subtotalCents != null) textLines.push(`  Subtotal: ${money(data.subtotalCents, currency)}`);
  if (data.shippingCents != null)
    textLines.push(`  Shipping: ${data.shippingCents === 0 ? "Free" : money(data.shippingCents, currency)}`);
  if (data.taxCents != null && data.taxCents > 0) textLines.push(`  Tax: ${money(data.taxCents, currency)}`);
  textLines.push(`  TOTAL: ${money(data.totalCents, currency)}`);
  if (addressLines.length) {
    textLines.push("");
    textLines.push("Shipping to:");
    for (const l of addressLines) textLines.push(`  ${l}`);
  }
  textLines.push("");
  textLines.push(
    "Your songs and goodies are on their way. We'll send a shipping note with tracking as soon as your order leaves our hands — usually within a few business days."
  );
  textLines.push("");
  textLines.push(`View your account: ${accountUrl}`);
  textLines.push("");
  textLines.push(`Questions? Reply to this email or write to ${SUPPORT_EMAIL}.`);
  textLines.push("");
  textLines.push("OWL Sing Together — Multicultural music for little learners");

  return { subject: ORDER_CONFIRMATION_SUBJECT, html, text: textLines.join("\n") };
}
