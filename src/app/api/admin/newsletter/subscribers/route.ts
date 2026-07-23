import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/admin/newsletter/subscribers — active subscriber count */
export async function GET(_req: NextRequest) {
  try {
    const sb = supabaseServiceRole();
    const { count, error } = await sb
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed");

    if (error) throw error;
    return NextResponse.json({ count: count ?? 0 });
  } catch (err) {
    console.error("[/api/admin/newsletter/subscribers GET]", err);
    return NextResponse.json({ count: 0 });
  }
}
