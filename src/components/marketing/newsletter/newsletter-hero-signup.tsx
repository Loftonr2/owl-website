import Image from "next/image";
import { Heart, Shield, Music, ShoppingBag } from "lucide-react";
import { NewsletterSubscribeForm } from "./newsletter-subscribe-form";

const FEATURES = [
  { icon: Heart,       label: "Parenting Tips" },
  { icon: Shield,      label: "Health Updates" },
  { icon: Music,       label: "Learning Inspiration" },
  { icon: ShoppingBag, label: "Store Perks" },
] as const;

/**
 * NewsletterHeroSignup
 * ────────────────────
 * "Join OWL Weekly" two-column signup section that appears directly below
 * the video hero on /newsletter.
 *
 * Left:  headline, subtitle, feature badges, email form, trust line.
 * Right: OWL mascot (waving).
 */
export function NewsletterHeroSignup() {
  return (
    <section className="relative overflow-hidden bg-owl-cream" aria-labelledby="nl-hero-heading">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:px-10 md:grid-cols-2 md:items-center md:gap-16 md:py-24">

        {/* ── Left column ─────────────────────────────────────────── */}
        <div>
          {/* Headline */}
          <h2
            id="nl-hero-heading"
            className="font-display text-5xl font-extrabold leading-tight tracking-tight text-owl-ink sm:text-6xl"
          >
            Join{" "}
            <span className="text-owl-teal">OWL</span>{" "}
            <em className="font-display not-italic italic text-owl-amber">Weekly</em>
          </h2>

          <p className="mt-4 max-w-lg font-body text-lg leading-relaxed text-owl-ink/80">
            Inspiring tips, trusted guidance, and joyful learning for your
            family—delivered every Sunday.
          </p>

          {/* Feature badge pills */}
          <ul
            className="mt-6 flex flex-wrap gap-3"
            role="list"
            aria-label="What you get"
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-full border border-owl-teal/20 bg-white px-4 py-2 font-body text-sm font-medium text-owl-ink shadow-owl-1"
              >
                <Icon className="h-4 w-4 shrink-0 text-owl-teal" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          {/* Signup form */}
          <div className="mt-8 max-w-md">
            <NewsletterSubscribeForm
              instanceId="hero"
              source="other"
              segment="A2"
              ctaLabel="Sign Me Up!"
              inputPlaceholder="Enter your email address"
            />
            <p className="mt-3 flex items-center gap-2 font-body text-sm text-owl-mist">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-owl-teal/20 text-[10px] font-bold text-owl-teal"
                aria-hidden
              >
                ✓
              </span>
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* ── Right column: mascot ────────────────────────────────── */}
        <div className="flex justify-center md:justify-end" aria-hidden>
          <div className="relative">
            {/* Decorative accent marks */}
            <span className="absolute -right-3 -top-4 font-display text-4xl text-owl-amber select-none">★</span>
            <span className="absolute -left-6 bottom-10 font-display text-2xl text-owl-rose select-none">♥</span>
            <span className="absolute right-8 bottom-0 font-display text-xl text-owl-teal/50 select-none">♪</span>

            <Image
              src="/images/brand/mascot.png"
              alt="The OWL mascot waving hello"
              width={400}
              height={400}
              className="relative z-10 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Subtle teal accent strip at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-owl-teal/30 via-owl-teal/60 to-owl-teal/30" />
    </section>
  );
}
