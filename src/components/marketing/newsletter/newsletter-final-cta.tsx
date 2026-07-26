import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { NewsletterSubscribeForm } from "./newsletter-subscribe-form";

const TRUST_ITEMS = ["100% Free", "Always Relevant", "Unsubscribe Anytime"] as const;

/**
 * NewsletterFinalCta
 * ──────────────────
 * Closing CTA band with forest/teal dark background.
 *
 * Left:  "Ready for weekly inspiration?" + tagline.
 * Right: frosted form card with trust badges.
 * Bottom-right: faded mascot watermark.
 */
export function NewsletterFinalCta() {
  return (
    <section
      className="relative overflow-hidden bg-owl-forest py-16 md:py-20"
      aria-labelledby="nl-cta-heading"
    >
      {/* Decorative background circles */}
      <div
        className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-owl-teal/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-64 h-56 w-56 rounded-full bg-owl-teal/10"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">

          {/* ── Left: headline ─────────────────────────────────── */}
          <div>
            <h2
              id="nl-cta-heading"
              className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl"
            >
              Ready for weekly inspiration?
            </h2>
            <p className="mt-4 max-w-sm font-body text-base text-white/65">
              Join thousands of parents who start their week with OWL.
            </p>
          </div>

          {/* ── Right: frosted form card ──────────────────────── */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm md:p-8">
            <p className="mb-4 font-display text-lg font-bold text-white">
              Free weekly inspiration for families.
            </p>

            <NewsletterSubscribeForm
              instanceId="cta"
              source="other"
              segment="A2"
              ctaLabel="Sign Me Up!"
              inputPlaceholder="Enter your email address"
              buttonIntent="primary"
              inputClassName="bg-white/95"
              successMessage="You're in! Check your inbox this Sunday for your first OWL Weekly."
            />

            {/* Trust badges */}
            <ul
              className="mt-5 flex flex-wrap gap-x-6 gap-y-2"
              role="list"
            >
              {TRUST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 font-body text-sm text-white/65"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-owl-teal" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Faded mascot watermark — bottom-right decoration */}
      <div
        className="pointer-events-none absolute bottom-0 right-4 h-40 w-40 opacity-10 md:h-52 md:w-52 md:opacity-20"
        aria-hidden
      >
        <Image
          src="/images/brand/mascot.png"
          alt=""
          width={208}
          height={208}
        />
      </div>
    </section>
  );
}
