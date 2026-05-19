import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/clients/supabase-server";

/**
 * Admin layout — auth-guarded. Renders the cockpit shell (sidebar + topbar)
 * and bounces anonymous users to /login.
 *
 * Phase 1 status: auth guard is wired but Supabase isn't connected yet, so
 * we soft-fail (allow through) if env vars are missing. Phase 2 will enable
 * the hard guard and add the sidebar nav from ADMIN_CRM_REQUIREMENTS.md §1.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      redirect("/login");
    }
    // TODO Phase 2: verify the user has an admin role via Supabase RLS
  }

  return (
    <div className="min-h-screen bg-owl-cream">
      <aside
        className="fixed inset-y-0 left-0 hidden w-64 border-r border-owl-cream-deep bg-white p-6 md:block"
        aria-label="Admin navigation"
      >
        <p className="font-display text-lg font-bold text-owl-ink">OWL Admin</p>
        <p className="mt-1 text-xs text-owl-mist">Phase 1 — shell only</p>
        {/* Phase 2: real sidebar (Dashboard · Blog · Products · Newsletter · Curriculum · Media · Customers · Educators · Orders · Analytics · Settings) */}
      </aside>
      <div className="md:ml-64">
        <header className="flex h-16 items-center border-b border-owl-cream-deep bg-white px-6">
          <h1 className="font-display text-lg font-semibold text-owl-ink">
            Admin
          </h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
