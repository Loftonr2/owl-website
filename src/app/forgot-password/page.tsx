import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { requestPasswordReset } from "./actions";

export const metadata = pageMetadata({ title: "Reset password", path: "/forgot-password", noIndex: true });

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-owl-cream px-6">
      <div className="w-full max-w-md rounded-owl-card border border-owl-cream-deep bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-owl-ink">Reset your password</h1>
          <p className="mt-2 text-sm text-owl-mist">
            Enter your email and we&apos;ll send a secure reset link.
          </p>
        </div>

        {sp.sent === "1" ? (
          <div className="mt-8 rounded-owl-btn bg-owl-teal/10 p-4 text-center text-sm text-owl-teal-deep">
            ✓ If that email has an account, a reset link is on its way.
          </div>
        ) : (
          <form action={requestPasswordReset} className="mt-8 space-y-4">
            {sp.error && (
              <p className="rounded-owl-btn bg-owl-error/10 px-4 py-2 text-sm text-owl-error">
                Please enter a valid email.
              </p>
            )}
            <label className="block">
              <span className="text-sm font-medium text-owl-ink">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="mt-2 block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-owl-btn bg-owl-teal px-5 py-3 font-display font-semibold text-white shadow-sm transition-colors hover:bg-owl-teal-deep"
            >
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-owl-mist">
          <Link href="/login" className="text-owl-teal hover:text-owl-teal-deep">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
