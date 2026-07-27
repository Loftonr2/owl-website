import Image from "next/image";
import { NewsletterHeroForm } from "./newsletter-hero-form";

/**
 * NewsletterHeroSignup
 * ────────────────────
 * "Join OWL Weekly" — uses the approved Header Image asset as the primary
 * visual. The asset contains the gradient headline, mascot, teal mound,
 * benefit badges, and all decorative elements.
 *
 * A real, accessible email form is rendered immediately below the asset
 * (same cream #FFF9EF section) so it is always interactive and keyboard-
 * navigable, without being embedded inside the image file.
 *
 * Responsive:
 *  mobile  — fixed-height crop (object-cover, object-left-top) to keep
 *             the heading text area legible; full form below
 *  desktop — natural aspect ratio (2142 × 734, w-full h-auto); form below
 */
export function NewsletterHeroSignup() {
  return (
    <section
      id="subscribe"
      className="relative bg-[#FFF9EF]"
      aria-labelledby="nl-hero-heading"
    >
      {/* Hidden heading for screen readers (visual heading lives in the asset) */}
      <h2 id="nl-hero-heading" className="sr-only">
        Join OWL Weekly
      </h2>
      <p className="sr-only">
        Inspiring tips, trusted guidance, and joyful learning for your
        family — delivered every Sunday. Badges: Parenting Tips, Health
        Updates, Learning Inspiration, Store Perks.
      </p>

      {/* ── Approved design asset ───────────────────────────────────── */}
      {/* Mobile: fixed height + cover crop to keep heading area visible */}
      <div
        className="relative h-44 w-full overflow-hidden sm:h-64 md:hidden"
        aria-hidden="true"
      >
        <Image
          src="/images/newsletter/join-owl-newsletter.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-left-top"
          priority
        />
      </div>

      {/* Desktop: ~80% width centered (≈20% size reduction from full-bleed).
          Tablet (sm–md): 90% width. Desktop (md+): 80% width. */}
      <div className="hidden md:flex md:justify-center md:px-[10%]" aria-hidden="true">
        <Image
          src="/images/newsletter/join-owl-newsletter.png"
          alt=""
          width={1774}
          height={887}
          sizes="(min-width: 768px) 80vw, 100vw"
          className="w-full h-auto"
          priority
        />
      </div>

      {/* ── Real interactive signup form ────────────────────────────── */}
      {/*
        Positioned immediately below the approved visual asset in the same
        cream background, visually continuing the form area shown in the design.
        The form is NOT embedded in the image — it is always real HTML,
        keyboard-accessible, and posts to /api/newsletter/subscribe.
      */}
      <div className="bg-[#FFF9EF] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-xl">
          <NewsletterHeroForm instanceId="hero" />

          {/* Trust line */}
          <p className="mt-3 flex items-center gap-2 font-body text-sm text-[#6B7280]">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: "#159A9C" }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                <path
                  d="M3 8l3.5 3.5 6.5-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
