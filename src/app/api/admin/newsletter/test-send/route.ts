import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@/lib/clients/supabase-server";
import { resolveNewsletterIssue } from "@/lib/newsletter-resolver";
import { generateNewsletterHtml } from "@/lib/email/newsletter-html";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/newsletter/test-send
 * Generates HTML for a campaign and sends a test email to the specified address.
 *
 * Body: { campaignId: string; to: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { campaignId, to } = await req.json() as { campaignId: string; to: string };

    if (!campaignId || !to) {
      return NextResponse.json(
        { error: "campaignId and to are required." },
        { status: 400 }
      );
    }

    // Fetch campaign
    const sb = supabaseServiceRole();
    const { data: campaign, error } = await sb
      .from("newsletter_campaigns")
      .select("archive_slug, title, subject")
      .eq("id", campaignId)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    // Resolve newsletter data (needs archive_slug)
    const archiveSlug = campaign.archive_slug ?? campaignId;
    const issueData = await resolveNewsletterIssue(archiveSlug);

    if (!issueData) {
      return NextResponse.json(
        { error: "Could not resolve newsletter issue data. Make sure archive_slug is set and the campaign has content." },
        { status: 422 }
      );
    }

    // Generate email HTML
    const html = generateNewsletterHtml(issueData);

    // Send via Resend
    // Strip HTML for plain text fallback
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    await sendEmail({
      to,
      subject: `[TEST] ${campaign.subject ?? campaign.title}`,
      html,
      text,
    });

    return NextResponse.json({ ok: true, to, subject: campaign.subject ?? campaign.title });
  } catch (err) {
    console.error("[/api/admin/newsletter/test-send POST]", err);
    return NextResponse.json({ error: "Test send failed." }, { status: 500 });
  }
}
