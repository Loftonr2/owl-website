import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/newsletter/content-posts
 * Returns published blog and news posts for the newsletter content picker.
 */
export async function GET(_req: NextRequest) {
  try {
    const sb = supabaseServiceRole();
    const { data, error } = await sb
      .from("content_posts")
      .select("id, title, slug, category, content_type, featured_image, published_at")
      .eq("status", "published")
      .in("content_type", ["blog", "news"])
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[/api/admin/newsletter/content-posts GET]", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
