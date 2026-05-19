import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/clients/supabase-server";

/**
 * GET /auth/callback?code=...&next=/admin
 *
 * Supabase sends the user here from the magic-link email. We swap the code
 * for a session cookie via supabase.auth.exchangeCodeForSession and then
 * redirect to the original `next` path (defaults to /admin).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/admin"}`);
}
