"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, LogOut, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Logged-in account dropdown for the site header. Shows the user's initials,
 * a link to their role-appropriate dashboard, account settings, and sign-out.
 */
export function AccountMenu({
  name,
  email,
  roleLabel,
  home,
}: {
  name: string;
  email: string;
  roleLabel: string;
  home: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = (name || email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-owl-cream-deep bg-white py-1 pl-1 pr-2 text-sm text-owl-ink",
          "transition-colors hover:bg-owl-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-owl-teal text-xs font-bold text-white">
          {initials || <User className="h-3.5 w-3.5" aria-hidden />}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-owl-mist" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-owl-card border border-owl-cream-deep bg-white shadow-owl-2"
        >
          <div className="border-b border-owl-cream-deep px-4 py-3">
            <p className="truncate text-sm font-medium text-owl-ink">{name}</p>
            <p className="truncate text-xs text-owl-mist">{email}</p>
            <p className="mt-1 inline-block rounded-full bg-owl-cream px-2 py-0.5 text-[11px] font-medium text-owl-ink/70">
              {roleLabel}
            </p>
          </div>
          <nav className="p-1.5 text-sm">
            <Link
              href={home}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-owl-btn px-3 py-2 text-owl-ink hover:bg-owl-cream"
            >
              <LayoutDashboard className="h-4 w-4 text-owl-mist" aria-hidden />
              My dashboard
            </Link>
            <Link
              href="/portal/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-owl-btn px-3 py-2 text-owl-ink hover:bg-owl-cream"
            >
              <User className="h-4 w-4 text-owl-mist" aria-hidden />
              Account settings
            </Link>
          </nav>
          <form action="/auth/sign-out" method="POST" className="border-t border-owl-cream-deep p-1.5">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-owl-btn px-3 py-2 text-sm text-owl-ink hover:bg-owl-cream"
            >
              <LogOut className="h-4 w-4 text-owl-mist" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
