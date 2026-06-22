import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Shape of the cookies @supabase/ssr passes to `setAll`.
 * Mirrors the upstream `CookieMethodsServer["setAll"]` parameter so we don't
 * leak implicit `any` through the destructure.
 */
type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Session refresh helper used by src/middleware.ts on every request.
 * Reads + writes the Supabase auth cookies so subsequent Server Components
 * see the user without re-hitting Supabase.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If Supabase isn't configured yet (Phase 2 pre-provisioning), pass through.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { response, user: null };

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }: CookieToSet) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
