"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { OwlLockup } from "@/components/brand/owl-logo";
import { MotionToggleCompact } from "@/components/motion/motion-toggle";
import { cn } from "@/lib/cn";

/**
 * Marketing site header.
 *
 * v3 (Phase 2 shared visual system):
 *   - Scroll-state styling. The header starts translucent over the hero and
 *     locks into a denser glass + soft shadow once the user has scrolled past
 *     a small threshold (40px). Pure cosmetics; layout doesn't shift.
 *   - <MotionToggleCompact> icon button in the utility row (next to search +
 *     cart). The full segmented control stays in the footer.
 *   - Accessible hover/focus parity — every utility action has a matching
 *     focus-visible ring + hover bg.
 *   - z-chrome so it always draws over banner and ambient layers.
 *
 * Mobile menu is a simple in-page disclosure (no portal). Still acceptable
 * for the current nav depth.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cn(
        "sticky top-0 z-chrome border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ease-owl-quick",
        // Scroll states — translucent over hero, denser once scrolled.
        scrolled
          ? "border-owl-cream-deep bg-owl-cream/90 shadow-owl-1"
          : "border-owl-cream-deep/40 bg-owl-cream/60 shadow-none"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 sm:px-10">
        {/* Brand */}
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="group inline-flex items-center rounded-owl-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
        >
          <OwlLockup
            size="md"
            title={`${siteConfig.name} home`}
            className="transition-transform duration-200 ease-owl-quick group-hover:-translate-y-px"
          />
        </Link>

        {/* Primary nav (desktop) */}
        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-6 md:flex"
        >
          {siteConfig.nav.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-owl-btn px-2 py-1 text-sm font-medium text-owl-ink/80",
                "transition-colors duration-150 ease-owl-quick",
                "hover:text-owl-teal",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Utility */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className={utilityIconClasses}
          >
            <Search className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/shop"
            aria-label="Cart"
            className={utilityIconClasses}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
          </Link>
          <MotionToggleCompact className="hidden sm:flex" />
          <Link
            href="/newsletter"
            className={cn(
              "ml-1 rounded-owl-btn bg-owl-teal px-4 py-2 text-sm font-semibold text-white shadow-owl-1",
              "transition-[background-color,transform,box-shadow] duration-200 ease-owl-quick",
              "hover:bg-owl-teal-deep hover:-translate-y-px hover:shadow-owl-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
            )}
          >
            Join
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cn(utilityIconClasses, "md:hidden")}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu disclosure */}
      <div
        className={cn(
          "md:hidden",
          open ? "block" : "hidden",
          "border-t border-owl-cream-deep bg-owl-cream"
        )}
      >
        <nav aria-label="Mobile primary" className="mx-auto max-w-7xl px-6 py-4">
          <ul className="space-y-2">
            {siteConfig.nav.primary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-owl-btn px-3 py-2 font-medium text-owl-ink hover:bg-owl-cream-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <hr className="my-3 border-owl-cream-deep" />
          <ul className="space-y-2">
            {siteConfig.nav.utility.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-owl-btn px-3 py-2 text-sm text-owl-ink/80 hover:bg-owl-cream-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 px-3 py-2">
            <span className="text-xs font-medium text-owl-mist">Motion</span>
            <MotionToggleCompact />
          </div>
        </nav>
      </div>
    </header>
  );
}

const utilityIconClasses = cn(
  "flex h-9 w-9 items-center justify-center rounded-full text-owl-ink/70",
  "transition-colors duration-150 ease-owl-quick",
  "hover:bg-owl-cream-deep hover:text-owl-teal",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
);
