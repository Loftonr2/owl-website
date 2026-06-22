"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { hasMinRole, type AppRole } from "@/lib/auth/role-utils";
import { cn } from "@/lib/cn";

/**
 * Admin sidebar nav. Filters sections by the signed-in user's role and marks
 * the active route. Rendered inside the auth-guarded admin layout.
 */
export function AdminSidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => hasMinRole(role, item.minRole));

  return (
    <aside
      className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-owl-cream-deep bg-white md:flex"
      aria-label="Admin navigation"
    >
      <div className="border-b border-owl-cream-deep px-6 py-5">
        <p className="font-display text-lg font-bold text-owl-ink">OWL Command Center</p>
        <p className="mt-0.5 text-xs text-owl-mist">Operations cockpit</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-owl-btn px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-owl-teal/10 text-owl-teal-deep"
                  : "text-owl-ink/80 hover:bg-owl-cream hover:text-owl-ink"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-owl-teal" : "text-owl-mist group-hover:text-owl-ink"
                )}
                aria-hidden
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-owl-cream-deep px-6 py-3">
        <p className="text-[11px] uppercase tracking-wider text-owl-mist">
          {role} access
        </p>
      </div>
    </aside>
  );
}
