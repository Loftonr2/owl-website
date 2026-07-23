import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** POST /api/admin/editorial/targets — upsert weekly publishing targets */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    const { data, error } = await sb
      .from("editorial_publishing_targets")
      .upsert(body, { onConflict: "week_start" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/admin/editorial/targets POST]", err);
    return NextResponse.json({ error: "Failed to save targets" }, { status: 500 });
  }
}
