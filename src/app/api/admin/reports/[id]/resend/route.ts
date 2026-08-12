import { NextResponse } from "next/server";
import { getSessionProfile, hasMinRole } from "@/lib/auth/roles";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reports/:id/resend — re-send an already-archived report.
 * Reuses the exact stored html/plain_text (never regenerates), so what gets
 * resent is byte-for-byte the same report that's archived. Defaults to the
 * report's originally configured recipients; pass { to: "someone@x.com" } in
 * the body to resend to a specific address instead.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!hasMinRole(profile.role, "admin")) {
    return NextResponse.json({ error: "Admin or owner role required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { to?: string };

  const sb = supabaseServiceRole();
  const { data: report, error } = await sb
    .from("executive_reports")
    .select("id, title, html, plain_text, recipients")
    .eq("id", id)
    .maybeSingle();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  const r = report as { id: string; title: string | null; html: string | null; plain_text: string | null; recipients: unknown };
  if (!r.html) {
    return NextResponse.json({ error: "This report has no stored HTML to resend." }, { status: 400 });
  }

  const to = body.to || (Array.isArray(r.recipients) ? (r.recipients as string[]) : []);
  if (!to || (Array.isArray(to) && to.length === 0)) {
    return NextResponse.json({ error: "No recipient available for this report." }, { status: 400 });
  }

  try {
    const { id: messageId } = await sendEmail({
      to,
      subject: r.title ?? "OWL Weekly Report",
      html: r.html,
      text: r.plain_text ?? "",
    });
    await sb
      .from("executive_reports")
      .update({
        email_message_id: messageId,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        delivery_status: "sent",
      })
      .eq("id", id);
    return NextResponse.json({ ok: true, messageId, sentTo: to });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "resend failed" },
      { status: 500 }
    );
  }
}
