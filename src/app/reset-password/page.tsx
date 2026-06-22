import { pageMetadata } from "@/lib/seo/metadata";
import { updatePassword } from "./actions";

export const metadata = pageMetadata({ title: "Set new password", path: "/reset-password", noIndex: true });

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-owl-cream px-6">
      <div className="w-full max-w-md rounded-owl-card border border-owl-cream-deep bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-owl-ink">Set a new password</h1>
          <p className="mt-2 text-sm text-owl-mist">Choose a strong password you don&apos;t use elsewhere.</p>
        </div>

        {sp.error && (
          <p className="mt-6 rounded-owl-btn bg-owl-error/10 px-4 py-2 text-sm text-owl-error">
            {sp.error === "weak" ? "Password must be at least 8 characters." : sp.error}
          </p>
        )}

        <form action={updatePassword} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-owl-ink">New password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              autoFocus
              placeholder="At least 8 characters"
              className="mt-2 block w-full rounded-owl-btn border border-owl-mist/30 bg-white px-4 py-3 text-owl-ink placeholder:text-owl-mist/60 focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/30"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-owl-btn bg-owl-teal px-5 py-3 font-display font-semibold text-white shadow-sm transition-colors hover:bg-owl-teal-deep"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
