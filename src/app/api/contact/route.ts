import { NextResponse } from "next/server";
import { contactSubmitSchema } from "@/lib/validation/contact";

/**
 * POST /api/contact
 * Validates a contact submission. Phase 6 logs to console + returns ok.
 * Phase 7 inserts into Supabase `contact_messages` and triggers a Resend
 * notification email to the segment-appropriate inbox.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSubmitSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }
  if (parsed.data.hp) return NextResponse.json({ ok: true });

  // Phase 7: persist + email. Phase 6 just logs to the server console.
  console.log("[contact]", {
    segment: parsed.data.segment,
    email: parsed.data.email,
    name: parsed.data.name,
    organization: parsed.data.organization,
  });

  return NextResponse.json({ ok: true });
}
