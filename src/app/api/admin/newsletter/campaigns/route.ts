import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/admin/newsletter/campaigns — list all newsletter campaigns */
export async function GET(_req: NextRequest) {
  try {
    const sb = supabaseServiceRole();
    const { data, error } = await sb
      .from("newsletter_campaigns")
      .select(
        "id, issue_number, title, archive_slug, status, publication_date, scheduled_for, " +
        "recipients_count, open_count, click_count, " +
        "promo_headline, promo_discount_pct, note_title, note_body, " +
        "tip_title, tip_body, tip_age_range, tip_takeaway, " +
        "health_alert_title, health_alert_body, health_alert_url, " +
        "health_alert_product_name, health_alert_brand, health_alert_recall_date, health_alert_source_name, " +
        "promo_product_slug, promo_button_label, promo_button_url, promo_subheading, " +
        "promo_starts_at, promo_expires_at, news_mode, blog_mode"
      )
      .order("issue_number", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[/api/admin/newsletter/campaigns GET]", err);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

/** POST /api/admin/newsletter/campaigns — create a new newsletter campaign / issue */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    // slug is required; issue_number and archive_slug are optional
    const { data, error } = await sb
      .from("newsletter_campaigns")
      .insert({
        title: body.title ?? "Untitled Issue",
        slug: body.slug ?? `issue-${Date.now()}`,
        archive_slug: body.archive_slug ?? null,
        issue_number: body.issue_number ?? null,
        status: body.status ?? "draft",
        note_title: body.note_title ?? "A Note from OWL",
        note_body: body.note_body ?? null,
        promo_discount_pct: body.promo_discount_pct ?? 15,
        promo_button_label: body.promo_button_label ?? "Shop the Store",
        promo_button_url: body.promo_button_url ?? "/shop",
        news_mode: body.news_mode ?? "auto",
        blog_mode: body.blog_mode ?? "auto",
        publication_date: body.publication_date ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/newsletter/campaigns POST]", err);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
