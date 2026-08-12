import { NextResponse } from "next/server";
import { getSessionProfile, hasMinRole } from "@/lib/auth/roles";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/admin/reports/:id — full detail for one archived weekly report. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!hasMinRole(profile.role, "admin")) {
    return NextResponse.json({ error: "Admin or owner role required." }, { status: 403 });
  }

  const { id } = await params;
  const sb = supabaseServiceRole();
  const { data, error } = await sb.from("executive_reports").select("*").eq("id", id).maybeSingle();

  if (error) return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  return NextResponse.json(data);
}
