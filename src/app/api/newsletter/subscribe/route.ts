import { NextResponse } from "next/server";
import { newsletterSubscribeSchema } from "@/lib/validation/newsletter";
import { beehiivSubscribe } from "@/lib/clients/beehiiv";
import { resend, EMAIL_FROM } from "@/lib/clients/resend";
import WelcomeEmail from "@/lib/email/welcome";

/**
 * POST /api/newsletter/subscribe
 * Public endpoint. Used by every signup form (homepage, footer, printable
 * gate, blog, video page, shop).
 *
 * Flow:
 *  1. Validate via zod (newsletterSubscribeSchema).
 *  2. Subscribe to Beehiiv with segment + UTM data.
 *  3. Trigger Resend Welcome email (Day 0 of 5-email sequence).
 *  4. Return { ok: true } or { error } to the caller.
 *
 * Honeypot field `hp` blocks bots silently.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = newsletterSubscribeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Honeypot tripped — pretend success so bots don't probe further.
  if (parsed.data.hp) {
    return NextResponse.json({ ok: true });
  }

  // If integrations are not configured yet (Phase 1), succeed silently.
  // Phase 2 will make Beehiiv + Resend mandatory.
  const beehiivConfigured = !!process.env.BEEHIIV_API_KEY && !!process.env.BEEHIIV_PUBLICATION_ID;
  const resendConfigured = !!process.env.RESEND_API_KEY;

  try {
    if (beehiivConfigured) {
      await beehiivSubscribe({
        email: parsed.data.email,
        segments: parsed.data.segments,
        utm_source: parsed.data.utm_source,
        utm_medium: parsed.data.utm_medium,
        utm_campaign: parsed.data.utm_campaign,
      });
    }

    if (resendConfigured) {
      await resend().emails.send({
        from: EMAIL_FROM.hello,
        to: parsed.data.email,
        subject: "I'm so glad you're here today.",
        react: WelcomeEmail({}),
      });
    }

    return NextResponse.json({
      ok: true,
      beehiiv: beehiivConfigured ? "sent" : "skipped (env missing)",
      resend: resendConfigured ? "sent" : "skipped (env missing)",
    });
  } catch (err) {
    console.error("[newsletter/subscribe]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
