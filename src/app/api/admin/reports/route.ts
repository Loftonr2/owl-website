import { NextResponse } from "next/server";
import { getSessionProfile, hasMinRole } from "@/lib/auth/roles";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reports — list the weekly report archive (executive_reports),
 * newest first. Admin/owner only — this can include revenue and subscriber
 * figures, so it is not exposed to editor/support roles.
 */
export async function GET() {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!hasMinRole(profile.role, "admin")) {
    return NextResponse.json({ error: "Admin or owner role required." }, { status: 403 });
  }

  const sb = supabaseServiceRole();
  const { data, error } = await sb
    .from("executive_reports")
    .select(
      "id, title, period_start, period_end, generated_at, status, delivery_status, recipients, sent_at, email_message_id"
    )
    .order("period_start", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
