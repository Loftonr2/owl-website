import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/editorial
 * Returns editorial calendar items (30-day window + 7 days back), alerts,
 * publishing targets for the current week, and quick stats.
 */
export async function GET(req: NextRequest) {
  try {
    const sb = supabaseServiceRole();
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from") ?? new Date().toISOString().split("T")[0];
    const days = Math.min(parseInt(searchParams.get("days") ?? "37"), 60);

    // Calendar items from v_editorial_calendar view
    const { data: calItems, error: calErr } = await sb
      .from("content_posts")
      .select([
        "id, content_type, title, slug, category, author, workflow_status, status,",
        "publish_date, target_pub_time, draft_deadline, approval_deadline,",
        "featured_image, primary_keyword, editorial_priority, newsletter_eligible,",
        "reviewer_name, reviewer_approved_at, publish_verified_at, publish_failed_at,",
        "publish_failure_reason, seo_title, seo_description, created_at, updated_at",
      ].join(" "))
      .gte("publish_date", new Date(new Date(fromDate).getTime() - 7 * 86400000).toISOString())
      .lte("publish_date", new Date(new Date(fromDate).getTime() + days * 86400000).toISOString())
      .neq("workflow_status", "archived")
      .order("publish_date", { ascending: true })
      .order("editorial_priority", { ascending: false });

    if (calErr) throw calErr;

    // Active (undismissed) alerts
    const { data: alerts } = await sb
      .from("editorial_alerts")
      .select("id, alert_type, severity, title, body, related_date, related_post, created_at")
      .is("dismissed_at", null)
      .order("severity", { ascending: true }) // error first
      .order("created_at", { ascending: false })
      .limit(20);

    // Current week targets
    const weekStart = new Date(fromDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const { data: target } = await sb
      .from("editorial_publishing_targets")
      .select("*")
      .eq("week_start", weekStartStr)
      .maybeSingle();

    // Published this week count
    const weekEndStr = new Date(weekStart.getTime() + 7 * 86400000).toISOString().split("T")[0];
    const { count: publishedThisWeek } = await sb
      .from("content_posts")
      .select("id", { count: "exact", head: true })
      .eq("workflow_status", "published")
      .gte("publish_date", weekStartStr)
      .lt("publish_date", weekEndStr);

    // Awaiting approval count
    const { count: awaitingApproval } = await sb
      .from("content_posts")
      .select("id", { count: "exact", head: true })
      .eq("workflow_status", "awaiting_approval");

    return NextResponse.json({
      items: calItems ?? [],
      alerts: alerts ?? [],
      target: target ?? { news_per_week: 3, blogs_per_week: 2 },
      stats: {
        published_this_week: publishedThisWeek ?? 0,
        awaiting_approval: awaitingApproval ?? 0,
      },
    });
  } catch (err) {
    console.error("[/api/admin/editorial GET]", err);
    return NextResponse.json({ error: "Failed to fetch editorial data" }, { status: 500 });
  }
}
