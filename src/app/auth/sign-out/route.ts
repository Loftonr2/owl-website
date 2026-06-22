import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/clients/supabase-server";

/**
 * POST /auth/sign-out — clears the Supabase session cookies and bounces home.
 * Wire to a small <form method="POST" action="/auth/sign-out"> button in the
 * admin shell (Phase 7).
 */
export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
