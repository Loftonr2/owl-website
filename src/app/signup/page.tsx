import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { signUp } from "./actions";

export const metadata = pageMetadata({ title: "Create account", path: "/signup", noIndex: true });

const inputClass =
  "mt-2 block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-owl-cream px-6 py-12">
      <div className="w-full max-w-md rounded-owl-card border border-owl-cream-deep bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-owl-teal">
            OWL Sing Together
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-owl-ink">Create your account</h1>
          <p className="mt-2 text-sm text-owl-mist">
            Join to track orders, download purchases, and save favorites.
          </p>
        </div>

        {sp.check === "1" ? (
          <div className="mt-8 rounded-owl-btn bg-owl-teal/10 p-4 text-center text-sm text-owl-teal-deep">
            ✓ Almost there — check your inbox to confirm your email, then sign in.
          </div>
        ) : (
          <>
            {sp.error && (
              <p className="mt-6 rounded-owl-btn bg-owl-error/10 px-4 py-2 text-sm text-owl-error">
                {sp.error === "rate_limit"
                  ? "Too many attempts. Try again in a minute."
                  : sp.error === "invalid"
                    ? "Please check your details and try again."
                    : sp.error}
              </p>
            )}

            <form action={signUp} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-owl-ink">Full name</span>
                <input name="full_name" type="text" autoComplete="name" placeholder="Your name" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-owl-ink">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-owl-ink">Password</span>
                <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className={inputClass} />
              </label>

              <fieldset className="rounded-owl-btn border border-owl-cream-deep p-3">
                <legend className="px-1 text-xs font-medium uppercase tracking-wider text-owl-mist">Account type</legend>
                <label className="flex items-start gap-2 py-1">
                  <input type="radio" name="account_type" value="customer" defaultChecked className="mt-1 accent-owl-teal" />
                  <span className="text-sm text-owl-ink">
                    <span className="font-medium">Parent / Customer</span>
                    <span className="block text-xs text-owl-mist">Shop, downloads, wishlist, rewards.</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 py-1">
                  <input type="radio" name="account_type" value="teacher" className="mt-1 accent-owl-teal" />
                  <span className="text-sm text-owl-ink">
                    <span className="font-medium">Educator / Teacher</span>
                    <span className="block text-xs text-owl-mist">
                      Request classroom resources — approved by the OWL team.
                    </span>
                  </span>
                </label>
              </fieldset>

              <label className="block">
                <span className="text-sm font-medium text-owl-ink">
                  School <span className="text-owl-mist">(educators, optional)</span>
                </span>
                <input name="school" type="text" placeholder="School or organization" className={inputClass} />
              </label>

              <button
                type="submit"
                className="w-full rounded-owl-btn bg-owl-teal px-5 py-3 font-display font-semibold text-white shadow-sm transition-colors hover:bg-owl-teal-deep"
              >
                Create account
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-xs text-owl-mist">
          Already have an account?{" "}
          <Link href="/login" className="text-owl-teal hover:text-owl-teal-deep">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
