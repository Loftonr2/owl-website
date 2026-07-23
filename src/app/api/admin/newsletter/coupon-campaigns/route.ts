import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/admin/newsletter/coupon-campaigns — list all coupon campaigns */
export async function GET(_req: NextRequest) {
  try {
    const sb = supabaseServiceRole();
    const { data, error } = await sb
      .from("coupon_campaigns")
      .select("id, name, display_code, discount_value, discount_type, applies_to, " +
              "starts_at, expires_at, status, eligible_user_count, redeemed_count, " +
              "newsletter_campaign_id, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[/api/admin/newsletter/coupon-campaigns GET]", err);
    return NextResponse.json({ error: "Failed to fetch coupon campaigns" }, { status: 500 });
  }
}

/** POST /api/admin/newsletter/coupon-campaigns — create a coupon campaign */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    if (!body.name || !body.starts_at || !body.expires_at) {
      return NextResponse.json(
        { error: "name, starts_at, and expires_at are required." },
        { status: 400 }
      );
    }

    const { data, error } = await sb
      .from("coupon_campaigns")
      .insert({
        name: body.name,
        display_code: body.display_code ?? null,
        discount_type: body.discount_type ?? "percent",
        discount_value: body.discount_value ?? 15,
        applies_to: body.applies_to ?? "order",
        applies_to_slug: body.applies_to_slug ?? null,
        minimum_order_cents: body.minimum_order_cents ?? 0,
        allow_stacking: body.allow_stacking ?? false,
        starts_at: body.starts_at,
        expires_at: body.expires_at,
        status: "scheduled",
        newsletter_campaign_id: body.newsletter_campaign_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // If a newsletter campaign was linked, update its promo_discount_pct
    if (body.newsletter_campaign_id && body.discount_value) {
      await sb
        .from("newsletter_campaigns")
        .update({ promo_discount_pct: body.discount_value })
        .eq("id", body.newsletter_campaign_id);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/newsletter/coupon-campaigns POST]", err);
    return NextResponse.json({ error: "Failed to create coupon campaign" }, { status: 500 });
  }
}
