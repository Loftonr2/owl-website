import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { NewsletterSubscribeForm } from "./newsletter-subscribe-form";

const TRUST_ITEMS = ["100% Free", "Always Relevant", "Unsubscribe Anytime"] as const;

/**
 * NewsletterFinalCta
 * ──────────────────
 * "Ready for weekly inspiration?" — real teal form section.
 *
 * This component provides the FUNCTIONAL lower half that continues visually
 * from where NewsletterIssuePreview's cropped image ends (at the cream→teal
 * wave boundary). The Newsletter Preview approved asset shows the design
 * intent for this section; this component delivers the real interactivity.
 *
 * Layout (3-column on desktop, stacked on mobile):
 *   Left  — headline + description + star row
 *   Center — white form card with real NewsletterSubscribeForm + trust badges
 *   Right  — OWL mascot in dark-teal circle
 *
 * The wave at the top transitions from cream (#FBF6EC) → teal (#1A9994),
 * matching the wave visible in the Newsletter Preview asset.
 */
export function NewsletterFinalCta() {
  return (
    <section
      className="relative overflow-hidden bg-[#1A9994]"
      aria-labelledby="nl-cta-heading"
    >
      {/* ── Wave: cream → teal ───────────────────────────────────────── */}
      <div className="pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="w-full"
          style={{ display: "block", marginBottom: "-1px" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Organic single S-curve matching the Newsletter Preview image wave */}
          <path
            d="M0 60 C240 90 480 20 720 55 C960 90 1200 20 1440 50 L1440 0 L0 0 Z"
            fill="#FBF6EC"
          />
        </svg>
      </div>

      {/* Decorative circles in background */}
      <div
        className="pointer-events-none absolute -right-20 -top-10 h-64 w-64 rounded-full bg-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#0D7B76]/40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-4 sm:px-10 md:pt-8 md:pb-20">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3">

          {/* ── Left: headline ─────────────────────────────────────────── */}
          <div className="text-center md:text-left">
            <h2
              id="nl-cta-heading"
              className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl"
            >
              Ready for weekly{" "}
              <span className="text-[#F5A623]">inspiration?</span>
            </h2>
            <p className="mt-4 font-body text-base text-white/70">
              Join thousands of families who start their week with OWL.
            </p>

            {/* Gold star row */}
            <div
              className="mt-6 flex items-center justify-center gap-1.5 md:justify-start"
              aria-hidden="true"
            >
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 20 20"
                  fill="#F5A623"
                  className="h-4 w-4 opacity-80"
                >
                  <path d="M10 1l2.4 7.2H19l-5.9 4.3 2.2 7-5.3-3.9-5.3 3.9 2.2-7L1 8.2h6.6z" />
                </svg>
              ))}
            </div>
          </div>

          {/* ── Center: white form card ────────────────────────────────── */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.15)] md:p-8">
            <p className="mb-5 text-center font-display text-lg font-bold text-[#1A2E5A]">
              Free weekly inspiration for families.
            </p>

            {/* Real email form — posts to /api/newsletter/subscribe */}
            <NewsletterSubscribeForm
              instanceId="cta"
              source="other"
              segment="A2"
              ctaLabel="Sign Me Up!"
              inputPlaceholder="Enter your email address"
              buttonIntent="primary"
              successMessage="You're in! Check your inbox this Sunday for your first OWL Weekly."
            />

            {/* Trust badges */}
            <ul
              className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2"
              role="list"
            >
              {TRUST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 font-body text-sm text-[#6B7280]"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-[#1A9994]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: mascot in teal circle ───────────────────────────── */}
          <div className="flex justify-center" aria-hidden="true">
            <div className="relative">
              {/* Dark-teal circle frame */}
              <div className="flex h-52 w-52 items-end justify-center overflow-hidden rounded-full bg-[#0D7B76] ring-4 ring-white/20 md:h-60 md:w-60">
                <Image
                  src="/images/brand/mascot.png"
                  alt=""
                  width={220}
                  height={220}
                  className="object-contain"
                />
              </div>

              {/* Floating gold star badge */}
              <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A623] shadow-lg">
                <svg
                  viewBox="0 0 20 20"
                  fill="white"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M10 1l2.4 7.2H19l-5.9 4.3 2.2 7-5.3-3.9-5.3 3.9 2.2-7L1 8.2h6.6z" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
