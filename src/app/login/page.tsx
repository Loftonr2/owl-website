import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { signInWithMagicLink } from "./actions";

export const metadata = pageMetadata({
  title: "Sign in",
  path: "/login",
  noIndex: true,
});

/**
 * Magic-link sign-in.
 *
 * Flow:
 *   1. User enters email → submits the form (Server Action).
 *   2. Supabase emails a one-tap magic link.
 *   3. Link routes to /auth/callback, which exchanges the code for a
 *      session cookie and redirects to /admin (or ?next= target).
 *
 * OWL is invite-only: `enable_signup = false` in supabase/config.toml.
 * Only emails the admin has invited via the dashboard can sign in.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-owl-cream px-6">
      <div className="w-full max-w-md rounded-owl-card border border-owl-cream-deep bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-owl-teal">
            OWL Admin
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-owl-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-owl-mist">
            Enter your email and we&apos;ll send you a one-tap sign-in link.
          </p>
        </div>

        {sp.sent === "1" ? (
          <div className="mt-8 rounded-owl-btn bg-owl-teal/10 p-4 text-center text-sm text-owl-teal-deep">
            ✓ Check your inbox for the sign-in link.
          </div>
        ) : (
          <form action={signInWithMagicLink} className="mt-8 space-y-4">
            <input type="hidden" name="next" value={sp.next ?? "/admin"} />
            <label className="block">
              <span className="text-sm font-medium text-owl-ink">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@owlsingtogether.com"
                className="mt-2 block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
              />
            </label>

            {sp.error && (
              <p className="rounded-owl-btn bg-owl-error/10 px-4 py-2 text-sm text-owl-error">
                {sp.error === "rate_limit"
                  ? "Too many requests. Try again in a minute."
                  : sp.error === "invalid"
                    ? "We couldn't sign you in. Check the email and try again."
                    : sp.error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-owl-btn bg-owl-teal px-5 py-3 font-display font-semibold text-white shadow-sm transition-colors hover:bg-owl-teal-deep"
            >
              Send sign-in link
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-owl-mist">
          Trouble signing in?{" "}
          <Link href="/contact" className="text-owl-teal hover:text-owl-teal-deep">
            Contact us
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
