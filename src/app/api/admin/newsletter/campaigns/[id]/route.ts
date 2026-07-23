import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** PATCH /api/admin/newsletter/campaigns/[id] — update a newsletter campaign */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    // Whitelist updatable fields (never allow id, created_at to be overwritten)
    const ALLOWED = [
      "title", "slug", "archive_slug", "issue_number", "status",
      "publication_date", "scheduled_for",
      "subject", "preheader",
      "note_title", "note_body", "note_image_url", "note_button_label", "note_button_url",
      "tip_title", "tip_body", "tip_age_range",
      "health_alert_title", "health_alert_body", "health_alert_url",
      "promo_headline", "promo_subheading", "promo_product_slug",
      "promo_discount_pct", "promo_button_label", "promo_button_url",
      "promo_starts_at", "promo_expires_at",
      "news_mode", "blog_mode",
    ] as const;

    const patch: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        patch[key] = body[key];
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided." }, { status: 400 });
    }

    const { data, error } = await sb
      .from("newsletter_campaigns")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/admin/newsletter/campaigns/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}
