import { NextResponse } from "next/server";
import { getSessionProfile, hasMinRole } from "@/lib/auth/roles";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";
import { sendTestExecutiveReport } from "@/lib/cron/jobs/executive-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The only address controlled test sends are allowed to reach. */
const TEST_RECIPIENT = "rickoflv@gmail.com";

/**
 * GET /api/admin/test-executive-report
 *
 * Admin-only controlled test. Generates the same canonical weekly report
 * object the Monday cron would produce for the trailing 7 days, archives it
 * in executive_reports (delivery_status = "test_sent"), and emails it ONLY
 * to rickoflv@gmail.com via Resend — never the real recipient list. Use this
 * to validate rendering/content before the report goes to the full admin
 * list on its normal schedule.
 */
export async function GET() {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json(
      { error: "Not signed in. Log into the Command Center first." },
      { status: 401 }
    );
  }
  if (!hasMinRole(profile.role, "admin")) {
    return NextResponse.json({ error: "Admin or owner role required." }, { status: 403 });
  }

  try {
    const db = supabaseServiceRole();
    const result = await sendTestExecutiveReport(db as never, TEST_RECIPIENT);
    return NextResponse.json({
      ok: true,
      reportId: result.reportId,
      title: result.title,
      messageId: result.messageId,
      sentTo: result.sentTo,
      note: "Test weekly report sent to rickoflv@gmail.com only — no other admins were emailed.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "send failed" },
      { status: 500 }
    );
  }
}
