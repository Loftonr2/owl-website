import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { requireAuth, ROLE_LABEL, type AppRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

/**
 * Portal layout — wraps the Customer + Teacher account areas. Auth-guarded for
 * any signed-in user; staff are free to view their portal too (they reach the
 * Command Center via /admin).
 */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const profile = await requireAuth("/portal");
  const who = profile.full_name || profile.email;

  return (
    <div className="min-h-screen bg-owl-cream">
      <header className="border-b border-owl-cream-deep bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="font-display text-lg font-bold text-owl-ink">
            OWL Sing Together
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-owl-ink">{who}</p>
              <p className="text-[11px] uppercase tracking-wider text-owl-mist">
                {ROLE_LABEL[profile.role as AppRole] ?? profile.role}
              </p>
            </div>
            <Link
              href="/portal/settings"
              aria-label="Account settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-owl-ink/70 transition-colors hover:bg-owl-cream hover:text-owl-teal"
            >
              <Settings className="h-4 w-4" aria-hidden />
            </Link>
            <form action="/auth/sign-out" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-owl-btn border border-owl-cream-deep px-3 py-1.5 text-sm text-owl-ink/80 transition-colors hover:bg-owl-cream hover:text-owl-ink"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
