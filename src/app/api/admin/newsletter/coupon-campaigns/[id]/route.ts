import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/** PATCH /api/admin/newsletter/coupon-campaigns/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;
    const sb = supabaseServiceRole();

    const ALLOWED = [
      "name", "display_code", "discount_type", "discount_value",
      "applies_to", "applies_to_slug", "minimum_order_cents",
      "allow_stacking", "starts_at", "expires_at", "status",
    ] as const;

    const patch: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        patch[key] = body[key];
      }
    }

    const { data, error } = await sb
      .from("coupon_campaigns")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/admin/newsletter/coupon-campaigns/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update coupon campaign" }, { status: 500 });
  }
}
