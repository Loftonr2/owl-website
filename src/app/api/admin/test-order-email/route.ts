import { NextResponse } from "next/server";
import { getSessionProfile, hasMinRole } from "@/lib/auth/roles";
import { sendEmail } from "@/lib/email/resend";
import { renderOrderConfirmationEmail } from "@/lib/email/order-confirmation-template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/test-order-email
 *
 * Admin-only safe test. Renders the real branded order-confirmation template
 * with sample data and sends it through Resend to the SIGNED-IN ADMIN'S OWN
 * email address only — never to a customer. Returns the Resend message id so
 * you can confirm delivery + rendering (HTML + plain-text) end to end.
 *
 * Visit it while logged into the Command Center as an admin/owner.
 */
export async function GET() {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json(
      { error: "Not signed in. Log into the Command Center first." },
      { status: 401 }
    );
  }
  if (!hasMinRole(profile.role, "admin")) {
    return NextResponse.json({ error: "Admin or owner role required." }, { status: 403 });
  }
  const to = profile.email;
  if (!to) {
    return NextResponse.json({ error: "No email on your admin profile." }, { status: 400 });
  }

  const rendered = renderOrderConfirmationEmail({
    orderId: "TEST-" + Date.now().toString(36).toUpperCase(),
    customerName: profile.full_name ?? "Rick",
    lineItems: [
      { name: "OWL Lullabies, Vol. 1 (CD)", sku: "owl-lullabies-cd", quantity: 1, unit_price: "14.00" },
      { name: "Little Singers Activity Book", sku: "activity-book", quantity: 2, unit_price: "9.50" },
    ],
    subtotalCents: 3300,
    shippingCents: 0,
    taxCents: 0,
    totalCents: 3300,
    currency: "USD",
    shippingAddress: {
      name: profile.full_name ?? "Rick (Test)",
      address1: "123 Songbird Lane",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "US",
    },
    accountUrl: "https://owlsingtogether.com/account",
  });

  try {
    const { id } = await sendEmail({
      to,
      subject: `[TEST] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
    });
    return NextResponse.json({
      ok: true,
      sentTo: to,
      messageId: id,
      note: "Sample confirmation sent to the signed-in admin only — no customer was emailed.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "send failed" },
      { status: 500 }
    );
  }
}
