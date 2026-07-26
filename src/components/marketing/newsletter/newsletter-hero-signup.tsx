import Image from "next/image";
import { NewsletterSubscribeForm } from "./newsletter-subscribe-form";

/**
 * NewsletterHeroSignup
 * ────────────────────
 * "Join OWL Weekly" two-column section — first content area below the video hero.
 * Matches the approved Header Image wireframe.
 *
 * Left:  large headline, subtitle, 4 benefit badges, real email form, trust line
 * Right: OWL mascot on teal mound with decorative stars/hearts/notes
 */

// Coloured benefit badges matching the wireframe
const BADGES = [
  {
    icon: (
      <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path
          d="M9 15.5S2 11.5 2 6.5A4 4 0 0 1 9 4.17 4 4 0 0 1 16 6.5C16 11.5 9 15.5 9 15.5Z"
          fill="#F5A623"
          stroke="#F5A623"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "Parenting Tips",
    accent: "border-owl-amber/30",
    text: "text-owl-amber",
  },
  {
    icon: (
      <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path
          d="M9 2a5 5 0 0 0-2 9.58V13h4v-1.42A5 5 0 0 0 9 2ZM7 15h4v1H7v-1Z"
          fill="#1A9994"
          stroke="#1A9994"
          strokeWidth="1"
        />
      </svg>
    ),
    label: "Health Updates",
    accent: "border-owl-teal/30",
    text: "text-owl-teal",
  },
  {
    icon: (
      <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
        <ellipse cx="9" cy="9" rx="4" ry="2" fill="#E89F8E" />
        <path d="M13 9c0 3-1.8 6-4 6S5 12 5 9" stroke="#E89F8E" strokeWidth="1.5" fill="none" />
        <line x1="9" y1="3" x2="9" y2="7" stroke="#E89F8E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    label: "Learning Inspiration",
    accent: "border-owl-rose/30",
    text: "text-owl-rose",
  },
  {
    icon: (
      <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
        <rect x="3" y="5" width="12" height="10" rx="1.5" fill="#2D4A3A" />
        <path d="M3 8h12" stroke="white" strokeWidth="1" />
        <path d="M7 5V3.5a2 2 0 0 1 4 0V5" stroke="#2D4A3A" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    label: "Store Perks",
    accent: "border-owl-forest/30",
    text: "text-owl-forest",
  },
] as const;

// Decorative SVG elements for the mascot area
function DecorStar({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}
function DecorHeart({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13Z" />
    </svg>
  );
}
function DecorNote({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function NewsletterHeroSignup() {
  return (
    <section
      className="relative overflow-hidden bg-[#FBF6EC]"
      aria-labelledby="nl-hero-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 sm:px-10 md:grid-cols-2 md:gap-8 md:py-20 lg:py-24">

        {/* ── Left column ────────────────────────────────────────────── */}
        <div className="relative z-10 order-2 md:order-1">

          {/* Headline: "Join OWL Weekly" */}
          <h2
            id="nl-hero-heading"
            className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight lg:text-6xl"
          >
            <span className="text-[#1A2E5A]">Join </span>
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #1A9994 0%, #0D7B76 40%, #F5A623 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              OWL
            </span>{" "}
            <em className="font-display not-italic text-[#F5A623]">Weekly</em>
            {/* Sparkle decoration beside heading */}
            <span className="ml-2 inline-block align-middle">
              <DecorStar className="h-5 w-5 text-[#1A9994]" />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 max-w-lg font-body text-lg leading-relaxed text-[#1A2E5A]/75">
            Inspiring tips, trusted guidance, and joyful learning for your
            family—delivered every Sunday.
          </p>

          {/* Feature badges */}
          <ul
            className="mt-6 flex flex-wrap gap-3"
            role="list"
            aria-label="What you get in OWL Weekly"
          >
            {BADGES.map(({ icon, label, accent, text }) => (
              <li
                key={label}
                className={`flex items-center gap-2 rounded-full border ${accent} bg-white px-4 py-2 font-body text-sm font-semibold ${text} shadow-sm`}
              >
                {icon}
                {label}
              </li>
            ))}
          </ul>

          {/* Signup form */}
          <div className="mt-8 max-w-[480px]">
            <NewsletterSubscribeForm
              instanceId="hero"
              source="other"
              segment="A2"
              ctaLabel="Sign Me Up!"
              inputPlaceholder="Enter your email address"
            />

            {/* Trust line */}
            <p className="mt-3 flex items-center gap-2 font-body text-sm text-[#6B7280]">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A9994] text-white"
                aria-hidden
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                  <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* ── Right column: mascot ────────────────────────────────────── */}
        <div className="relative order-1 flex justify-center md:order-2 md:justify-end" aria-hidden="true">

          {/* Aqua background shape */}
          <div className="absolute bottom-0 left-1/2 h-[65%] w-[90%] -translate-x-1/2 rounded-full bg-[#B6E8E6] opacity-30" />

          {/* Decorative stars */}
          <DecorStar className="absolute -right-2 top-4 h-8 w-8 text-[#F5A623]" />
          <DecorStar className="absolute left-4 top-10 h-5 w-5 text-[#F5A623]" />
          <DecorStar className="absolute bottom-16 left-2 h-6 w-6 text-[#F5A623] opacity-70" />

          {/* Decorative hearts */}
          <DecorHeart className="absolute -left-4 top-1/3 h-6 w-6 text-[#E89F8E]" />
          <DecorHeart className="absolute bottom-8 right-4 h-5 w-5 text-[#E89F8E] opacity-60" />

          {/* Decorative music notes */}
          <DecorNote className="absolute right-0 top-1/2 h-7 w-7 text-[#1A9994]/50" />
          <DecorNote className="absolute bottom-4 left-8 h-5 w-5 text-[#1A9994]/40" />

          {/* Teal mound / platform */}
          <div className="absolute bottom-0 left-0 right-0 h-[80px] overflow-hidden">
            <div
              className="mx-auto h-[160px] w-[120%] -translate-x-[10%] rounded-[50%] bg-[#1A9994]"
              style={{ transform: "translateY(50%)" }}
            />
          </div>

          {/* Mascot image */}
          <div className="relative z-10 pb-8">
            <Image
              src="/images/brand/mascot.png"
              alt="The OWL mascot waving hello"
              width={420}
              height={420}
              className="drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Thin teal bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#1A9994]/50 to-transparent" />
    </section>
  );
}
