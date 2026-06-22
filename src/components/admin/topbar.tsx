"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin/nav";
import type { SessionProfile } from "@/lib/auth/role-utils";

/**
 * Admin topbar — derives the current section title from the route, shows the
 * signed-in user + role, and a sign-out button (POSTs to /auth/sign-out).
 */
export function AdminTopbar({ profile }: { profile: SessionProfile }) {
  const pathname = usePathname();
  const match = [...ADMIN_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
    );
  const title = match?.label ?? "Dashboard";
  const who = profile.full_name || profile.email;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-owl-cream-deep bg-white/90 px-6 backdrop-blur">
      <h1 className="font-display text-lg font-semibold text-owl-ink">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-owl-ink">{who}</p>
          <p className="text-[11px] uppercase tracking-wider text-owl-mist">{profile.role}</p>
        </div>
        <form action="/auth/sign-out" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-owl-btn border border-owl-cream-deep px-3 py-1.5 text-sm text-owl-ink/80 transition-colors hover:bg-owl-cream hover:text-owl-ink"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
