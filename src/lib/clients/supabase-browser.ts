"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (Client Components only).
 * Reads from public env vars — never expose service role keys here.
 *
 * Note: Supabase keys traditionally use NEXT_PUBLIC_* in the browser. We keep
 * the canonical name from TECH_STACK.md (SUPABASE_URL / SUPABASE_ANON_KEY) and
 * expose them via Next.js env at the build step.
 */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? ""
  );
}
