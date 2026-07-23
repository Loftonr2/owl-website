import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

interface CouponCampaignRow {
  discount_type: string;
  discount_value: number;
  applies_to: string;
  applies_to_slug: string | null;
  minimum_order_cents: number;
  allow_stacking: boolean;
  starts_at: string;
  expires_at: string;
  status: string;
  display_code: string | null;
  newsletter_campaign_id: string | null;
}

interface NewsletterCampaignRow {
  promo_headline: string | null;
  promo_product_slug: string | null;
  title: string;
  issue_number: number | null;
}

/**
 * GET /api/newsletter/coupon/check
 * Returns the current user's active coupon entitlement, if any.
 */
export async function GET(_req: NextRequest) {
  try {
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      return NextResponse.json({ entitlement: null });
    }

    const sbs = supabaseServiceRole();
    const now = new Date().toISOString();

    // Fetch the active entitlement row
    const entRes = await sbs
      .from("coupon_entitlements")
      .select("id, status, campaign_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const ent = entRes.data as { id: string; status: string; campaign_id: string } | null;
    if (!ent) return NextResponse.json({ entitlement: null });

    // Fetch the coupon campaign (table added in migration 0015 — cast via unknown)
    const ccRes = await sbs
      .from("coupon_campaigns")
      .select("discount_type, discount_value, applies_to, applies_to_slug, " +
              "minimum_order_cents, allow_stacking, starts_at, expires_at, status, display_code, " +
              "newsletter_campaign_id")
      .eq("id", ent.campaign_id)
      .maybeSingle();

    const cc = ccRes.data as unknown as CouponCampaignRow | null;
    if (!cc) return NextResponse.json({ entitlement: null });

    // Validate timing server-side
    if (cc.status !== "active" && cc.status !== "scheduled") return NextResponse.json({ entitlement: null });
    if (cc.starts_at > now || cc.expires_at <= now) return NextResponse.json({ entitlement: null });

    // Fetch the newsletter campaign for promo details
    let promo_headline: string | null = null;
    let promo_product_slug: string | null = null;
    let issue_number: number | null = null;
    let issue_title: string | null = null;

    if (cc.newsletter_campaign_id) {
      const ncRes = await sbs
        .from("newsletter_campaigns")
        .select("promo_headline, promo_product_slug, title, issue_number")
        .eq("id", cc.newsletter_campaign_id)
        .maybeSingle();
      const nc = ncRes.data as unknown as NewsletterCampaignRow | null;
      if (nc) {
        promo_headline = nc.promo_headline;
        promo_product_slug = nc.promo_product_slug;
        issue_number = nc.issue_number;
        issue_title = nc.title;
      }
    }

    return NextResponse.json({
      entitlement: {
        display_code: cc.display_code,
        discount_type: cc.discount_type,
        discount_value: cc.discount_value,
        applies_to: cc.applies_to,
        applies_to_slug: cc.applies_to_slug,
        minimum_order_cents: cc.minimum_order_cents,
        allow_stacking: cc.allow_stacking,
        expires_at: cc.expires_at,
        promo_headline,
        promo_product_slug,
        issue_title,
        issue_number,
        _token: Buffer.from(`${ent.campaign_id}:${user.id}`).toString("base64url"),
      },
    });
  } catch (err) {
    console.error("[/api/newsletter/coupon/check GET]", err);
    return NextResponse.json({ entitlement: null });
  }
}
