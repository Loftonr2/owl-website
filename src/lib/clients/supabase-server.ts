import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Shape of the cookies @supabase/ssr passes to `setAll`. */
type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Server-side Supabase client (Server Components, Server Actions, Route Handlers).
 * Used for auth checks, user data reads/writes, and admin-only operations.
 *
 * Two factories are exported:
 *  - supabaseServer()       → uses the anon key + user cookies (RLS-protected)
 *  - supabaseServiceRole()  → uses the service role key (BYPASSES RLS — admin only)
 */

export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies; ignore.
          }
        },
      },
    }
  );
}

/**
 * Service-role client. Bypasses Row-Level Security. NEVER expose to the browser.
 * Use only in trusted server contexts (cron jobs, admin actions, webhooks).
 */
export function supabaseServiceRole() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "supabaseServiceRole() requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createServerClient(url, serviceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });
}
