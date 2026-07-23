import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/newsletter/coupon/apply
 * Validates and applies an account-bound coupon entitlement to an order.
 * This is called AFTER capture-order completes and the order ID is known.
 *
 * Body: { _token: string; orderId: string }
 *
 * Returns: { ok: true; discount_value: number; discount_type: string }
 *   or   : { ok: false; error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { _token, orderId } = await req.json() as { _token: string; orderId: string };

    if (!_token || !orderId) {
      return NextResponse.json({ ok: false, error: "Missing _token or orderId." }, { status: 400 });
    }

    // Authenticate the calling user
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
    }

    // Decode and verify the token
    let campaignId: string;
    let tokenUserId: string;
    try {
      const decoded = Buffer.from(_token, "base64url").toString("utf8");
      [campaignId, tokenUserId] = decoded.split(":");
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid token." }, { status: 400 });
    }

    if (tokenUserId !== user.id) {
      return NextResponse.json({ ok: false, error: "Token mismatch." }, { status: 403 });
    }

    // Call the atomic DB function
    const sbs = supabaseServiceRole();
    const { data, error } = await sbs.rpc("fn_redeem_coupon_entitlement", {
      p_campaign_id: campaignId,
      p_user_id: user.id,
      p_order_id: orderId,
    });

    if (error) {
      // DB function raises with a message code prefix
      const msg = error.message ?? "";
      const code = msg.split(":")[0].trim();
      const friendly: Record<string, string> = {
        COUPON_NOT_FOUND:   "No active coupon found for your account.",
        COUPON_NOT_ACTIVE:  "This coupon has already been used or expired.",
        CAMPAIGN_NOT_ACTIVE:"The coupon campaign is no longer active.",
        CAMPAIGN_NOT_STARTED:"The coupon period hasn't started yet.",
        CAMPAIGN_EXPIRED:   "The coupon campaign has expired.",
      };
      return NextResponse.json(
        { ok: false, error: friendly[code] ?? "Coupon could not be applied." },
        { status: 422 }
      );
    }

    // data is the discount_value returned by the function
    return NextResponse.json({ ok: true, discount_value: data, discount_type: "percent" });
  } catch (err) {
    console.error("[/api/newsletter/coupon/apply POST]", err);
    return NextResponse.json({ ok: false, error: "Coupon apply failed." }, { status: 500 });
  }
}
