import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { signInWithMagicLink, signInWithPassword } from "./actions";

export const metadata = pageMetadata({
  title: "Sign in",
  path: "/login",
  noIndex: true,
});

/**
 * Sign-in — email + password (primary) with a magic-link fallback.
 *
 * On success the user lands on /account, the role router, which sends them to
 * the Command Center (staff), the educator portal (teacher), or the customer
 * portal. Confirmation + reset links route through /auth/callback.
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
            OWL Sing Together
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-owl-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-owl-mist">
            Sign in to your account, classroom, or the Command Center.
          </p>
        </div>

        {sp.error && (
          <p className="mt-6 rounded-owl-btn bg-owl-error/10 px-4 py-2 text-sm text-owl-error">
            {sp.error === "rate_limit"
              ? "Too many requests. Try again in a minute."
              : sp.error === "invalid"
                ? "We couldn't sign you in. Check your details and try again."
                : sp.error === "not_authorized"
                  ? "That account doesn't have Command Center access."
                  : sp.error}
          </p>
        )}

        {/* Primary: email + password */}
        <form action={signInWithPassword} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={sp.next ?? "/account"} />
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
          <label className="block">
            <span className="text-sm font-medium text-owl-ink">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-2 block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-owl-btn bg-owl-teal px-5 py-3 font-display font-semibold text-white shadow-sm transition-colors hover:bg-owl-teal-deep"
          >
            Sign in
          </button>
          <div className="flex items-center justify-between text-xs">
            <Link href="/signup" className="text-owl-teal hover:text-owl-teal-deep">
              Create an account
            </Link>
            <Link href="/forgot-password" className="text-owl-mist hover:text-owl-ink">
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Secondary: magic link */}
        <div className="mt-6 border-t border-owl-cream-deep pt-6">
          {sp.sent === "1" ? (
            <div className="rounded-owl-btn bg-owl-teal/10 p-4 text-center text-sm text-owl-teal-deep">
              ✓ Check your inbox for the sign-in link.
            </div>
          ) : (
            <form action={signInWithMagicLink} className="space-y-3">
              <input type="hidden" name="next" value={sp.next ?? "/account"} />
              <p className="text-center text-xs text-owl-mist">Prefer a one-tap link?</p>
              <label className="block">
                <span className="sr-only">Email for magic link</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@owlsingtogether.com"
                  className="block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-2.5 text-sm text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-owl-btn border border-owl-teal px-5 py-2.5 text-sm font-medium text-owl-teal transition-colors hover:bg-owl-teal/5"
              >
                Email me a sign-in link
              </button>
            </form>
          )}
        </div>

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
