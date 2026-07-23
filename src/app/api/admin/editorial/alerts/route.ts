import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";
import { supabaseServer } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** POST /api/admin/editorial/alerts — generate / dismiss alerts */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { action: string; alertId?: number };

    if (body.action === "dismiss" && body.alertId) {
      const sb = await supabaseServer();
      const { data: { user } } = await sb.auth.getUser();
      const sbs = supabaseServiceRole();
      await sbs
        .from("editorial_alerts")
        .update({ dismissed_at: new Date().toISOString(), dismissed_by: user?.id ?? null })
        .eq("id", body.alertId);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "generate") {
      const sbs = supabaseServiceRole();
      const { data } = await sbs.rpc("fn_generate_editorial_alerts");
      return NextResponse.json({ ok: true, new_alerts: data });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("[/api/admin/editorial/alerts POST]", err);
    return NextResponse.json({ error: "Failed to process alert action" }, { status: 500 });
  }
}
