import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";
import { resolveNewsletterIssue } from "@/lib/newsletter-resolver";
import { generateNewsletterHtml } from "@/lib/email/newsletter-html";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/newsletter/test-send
 *
 * Sends a test email for a newsletter campaign to a single specified address.
 *
 * Safety guarantees:
 *  - Does NOT change campaign status (stays 'draft')
 *  - Does NOT increment sent/delivered counts
 *  - Does NOT consume any coupon entitlement
 *  - Subject is prefixed with "TEST — " so it's clearly labelled
 *  - Logs to newsletter_test_deliveries (separate from production logs)
 *
 * Body: { campaignId: string; to: string }
 *
 * Returns: { ok, to, subject, resendMessageId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { campaignId?: string; to?: string };
    const { campaignId, to } = body;

    if (!campaignId || !to) {
      return NextResponse.json(
        { error: "campaignId and to are required." },
        { status: 400 }
      );
    }

    // Fetch campaign (do NOT filter by status — test sends work on drafts)
    const sb = supabaseServiceRole();
    const { data: campaign, error } = await sb
      .from("newsletter_campaigns")
      .select("id, archive_slug, title, subject, issue_number")
      .eq("id", campaignId)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    const c = campaign as {
      id: string;
      archive_slug: string | null;
      title: string;
      subject: string | null;
      issue_number: number | null;
    };

    // Resolve newsletter data (uses archive_slug)
    const archiveSlug = c.archive_slug ?? c.id;
    const issueData = await resolveNewsletterIssue(archiveSlug);

    if (!issueData) {
      return NextResponse.json(
        {
          error:
            "Could not resolve newsletter issue data. Make sure archive_slug is set " +
            "and the campaign has note_body and tip_body content.",
        },
        { status: 422 }
      );
    }

    // Generate production-identical email HTML
    const html = generateNewsletterHtml(issueData);
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    // Use "TEST — " prefix so recipients can clearly identify test messages
    const issueLabel = c.issue_number ? `Issue #${c.issue_number}` : c.title;
    const baseSubject = c.subject ?? c.title;
    const testSubject = `TEST — ${baseSubject}`;

    // Send via Resend — throws if RESEND_API_KEY is missing
    let resendMessageId: string | null = null;
    let sendError: string | null = null;

    try {
      const result = await sendEmail({ to, subject: testSubject, html, text });
      resendMessageId = result.id;
    } catch (emailErr) {
      sendError = String(emailErr);
    }

    // Log to newsletter_test_deliveries regardless of outcome
    await sb.from("newsletter_test_deliveries").insert({
      campaign_id: c.id,
      recipient_email: to,
      subject: testSubject,
      resend_message_id: resendMessageId,
      status: sendError ? "failed" : "sent",
      error: sendError,
      template_version: `issue-${issueLabel}`,
    });

    if (sendError) {
      console.error("[/api/admin/newsletter/test-send POST] send failed:", sendError);
      return NextResponse.json(
        { ok: false, error: `Email send failed: ${sendError}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      to,
      subject: testSubject,
      resendMessageId,
    });
  } catch (err) {
    console.error("[/api/admin/newsletter/test-send POST]", err);
    return NextResponse.json({ error: "Test send failed." }, { status: 500 });
  }
}
