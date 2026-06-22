import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/clients/supabase-middleware";

/**
 * Middleware — runs on every non-static request.
 *
 *  1. Refresh the Supabase session cookie.
 *  2. If the request targets /admin or /studio and there's no session,
 *     redirect to /login?next=<original-path>.
 *  3. If the request is /login and the user is already authed, send them
 *     straight to /admin.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/account");
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authed users hitting /login or /signup go to the role router, which sends
  // them to the right home (Command Center / educator portal / customer portal).
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = "/account";
    accountUrl.searchParams.delete("next");
    return NextResponse.redirect(accountUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     *  - /api (handled by route handlers; they manage their own auth)
     *  - /_next/static, /_next/image (build assets)
     *  - /favicon.ico, /sitemap.xml, /robots.txt (root files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
