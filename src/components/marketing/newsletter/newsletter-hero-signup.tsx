import Image from "next/image";
import { NewsletterHeroForm } from "./newsletter-hero-form";

/**
 * NewsletterHeroSignup
 * ────────────────────
 * "Join OWL Weekly" — two-column section immediately below the video hero.
 * Matches the approved Header Image(2) reference.
 *
 * Desktop layout: [LEFT 62% | RIGHT 38%]
 *   Left:  per-letter coloured headline, teal subtitle, 4 benefit items,
 *          coral signup form, trust line.
 *   Right: OWL mascot on teal mound with pale-blue blob and decorative elements.
 *
 * Mobile layout (stacked):
 *   headline → subtitle → benefits → mascot thumbnail → form → trust
 */

/* ─── Benefit icons ─────────────────────────────────────────────────── */

/** Outlined golden-yellow heart */
function HeartOutlineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M12 21S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13Z"
        stroke="#FFB21A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Teal shield with checkmark */
function ShieldCheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M12 3L4 7v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-4Z"
        fill="#159A9C"
        fillOpacity="0.15"
        stroke="#159A9C"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="#159A9C"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Coral music note */
function MusicNoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M9 17V6l12-2v11"
        stroke="#FF5A43"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="17"
        r="3"
        fill="#FF5A43"
        fillOpacity="0.2"
        stroke="#FF5A43"
        strokeWidth="1.8"
      />
      <circle
        cx="18"
        cy="15"
        r="3"
        fill="#FF5A43"
        fillOpacity="0.2"
        stroke="#FF5A43"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/** Teal shopping bag with white star */
function ShoppingBagStarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      {/* bag body */}
      <rect x="3" y="7" width="18" height="14" rx="2" fill="#159A9C" />
      {/* handle */}
      <path
        d="M8 7V5a4 4 0 0 1 8 0v2"
        stroke="#159A9C"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* white star */}
      <path
        d="M12 10.5l.7 2.2h2.3l-1.9 1.4.7 2.1-1.8-1.3-1.8 1.3.7-2.1-1.9-1.4H11.3z"
        fill="white"
      />
    </svg>
  );
}

const BENEFITS = [
  { Icon: HeartOutlineIcon, label: "Parenting Tips" },
  { Icon: ShieldCheckIcon, label: "Health Updates" },
  { Icon: MusicNoteIcon, label: "Learning Inspiration" },
  { Icon: ShoppingBagStarIcon, label: "Store Perks" },
] as const;

/* ─── Decorative SVG elements for the mascot area ───────────────────── */

/** 4-point teal sparkle */
function Sparkle({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l1.5 8.5L22 12l-8.5 1.5L12 22l-1.5-8.5L2 12l8.5-1.5z" />
    </svg>
  );
}

/** 5-point star (filled) */
function StarFive({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

/** 5-point star (outline) */
function StarOutline({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Filled heart */
function HeartFill({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13Z" />
    </svg>
  );
}

/** Music note */
function MusicNoteDecor({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function NewsletterHeroSignup() {
  return (
    <section
      className="relative overflow-hidden bg-[#FFF9EF]"
      aria-labelledby="nl-hero-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-x-14 gap-y-8 md:grid-cols-[62%_38%]">

          {/* ────────────────────────────────────────────────────────
              LEFT COLUMN
              ──────────────────────────────────────────────────────── */}
          <div className="order-1 flex flex-col">

            {/* Headline: "Join OWL Weekly"
                · "Join" = deep navy
                · "O"    = blue→teal gradient
                · "W"    = teal
                · "L"    = golden yellow
                · "Weekly" = italic, navy  */}
            <h2
              id="nl-hero-heading"
              className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight lg:text-[3.75rem]"
            >
              <span style={{ color: "#082B63" }}>Join </span>
              {/* O — blue-to-teal gradient */}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6 0%, #159A9C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                O
              </span>
              {/* W — teal */}
              <span style={{ color: "#159A9C" }}>W</span>
              {/* L — golden yellow */}
              <span style={{ color: "#FFB21A" }}>L</span>
              {/* Weekly — italic navy */}
              <em
                className="ml-2"
                style={{
                  color: "#082B63",
                  fontStyle: "italic",
                  fontWeight: 800,
                }}
              >
                Weekly
              </em>
            </h2>

            {/* Subtitle — teal */}
            <p
              className="mt-5 max-w-lg font-body text-lg leading-relaxed"
              style={{ color: "#159A9C" }}
            >
              Inspiring tips, trusted guidance, and joyful learning for your
              family—delivered every Sunday.
            </p>

            {/* Benefits row */}
            <ul
              className="mt-7 flex flex-wrap gap-x-7 gap-y-3"
              role="list"
              aria-label="What you get in OWL Weekly"
            >
              {BENEFITS.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 font-body text-sm font-semibold"
                  style={{ color: "#082B63" }}
                >
                  <Icon />
                  {label}
                </li>
              ))}
            </ul>

            {/* ── Mobile-only mascot (between benefits and form) ── */}
            <div className="my-8 flex justify-center md:hidden" aria-hidden="true">
              <Image
                src="/images/brand/mascot.png"
                alt=""
                width={240}
                height={240}
                className="drop-shadow-md"
              />
            </div>

            {/* Signup form */}
            <div className="mt-8 w-full max-w-[520px]">
              <NewsletterHeroForm instanceId="hero" />
            </div>

            {/* Trust line */}
            <p
              className="mt-3 flex items-center gap-2 font-body text-sm"
              style={{ color: "#6B7280" }}
            >
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

          {/* ────────────────────────────────────────────────────────
              RIGHT COLUMN — mascot + decorations (desktop only)
              ──────────────────────────────────────────────────────── */}
          <div
            className="relative order-2 hidden pb-10 md:flex md:items-end md:justify-center"
            aria-hidden="true"
          >
            {/* Pale-blue organic blob behind mascot */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%]"
              style={{
                width: "78%",
                height: "70%",
                background:
                  "radial-gradient(ellipse at center, #DEEFFE 0%, #EAF6FF 45%, transparent 72%)",
                borderRadius: "50%",
                filter: "blur(8px)",
              }}
            />

            {/* ── Decorative elements ── */}

            {/* Teal sparkles */}
            <Sparkle className="absolute right-3 top-8 h-7 w-7 text-[#159A9C]" />
            <Sparkle className="absolute left-10 top-14 h-4 w-4 text-[#159A9C]/65" />
            <Sparkle className="absolute right-12 top-[38%] h-5 w-5 text-[#159A9C]/55" />

            {/* Coral music note */}
            <MusicNoteDecor className="absolute right-0 top-[48%] h-8 w-8 text-[#FF5A43]/65" />

            {/* Golden-yellow heart */}
            <HeartFill className="absolute left-6 top-[22%] h-7 w-7 text-[#FFB21A]" />

            {/* Golden-yellow star (filled) */}
            <StarFive className="absolute right-2 top-5 h-8 w-8 text-[#FFB21A]" />

            {/* Coral outlined star */}
            <StarOutline className="absolute left-2 bottom-[28%] h-8 w-8 text-[#FF5A43]" />

            {/* Small coral accent star */}
            <StarFive className="absolute left-12 bottom-[18%] h-4 w-4 text-[#FF5A43]" />

            {/* Mascot image */}
            <div className="relative z-10">
              <Image
                src="/images/brand/mascot.png"
                alt="The OWL mascot waving hello"
                width={380}
                height={380}
                className="drop-shadow-xl"
                priority
              />
            </div>

            {/* Teal curved mound beneath owl's feet */}
            <div className="absolute bottom-0 left-0 right-0 z-0 overflow-hidden">
              <svg
                viewBox="0 0 400 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                preserveAspectRatio="none"
                style={{ display: "block" }}
              >
                <ellipse cx="200" cy="70" rx="230" ry="55" fill="#159A9C" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Hairline teal bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(to right, transparent, #159A9C40, transparent)",
        }}
      />
    </section>
  );
}
