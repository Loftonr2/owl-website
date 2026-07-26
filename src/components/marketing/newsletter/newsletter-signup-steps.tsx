/**
 * NewsletterSignupSteps
 * ─────────────────────
 * "Sign Up in 3 Easy Steps" — three illustrated step cards on cream.
 * Matches Newsletter Sign Up Process approved asset.
 *
 * Cards: white rounded, teal circle number badge (top-centre overlapping),
 * large light-blue circle with SVG illustration, bold title, body text.
 * Desktop: teal dotted connector line between cards (decorative div, not li).
 */

/* ─── Step icons ─────────────────────────────────────────────────────── */

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-11 w-11" aria-hidden="true">
      {/* envelope body */}
      <rect x="6" y="14" width="44" height="30" rx="5" fill="#1A9994" />
      {/* flap V */}
      <path
        d="M6 18l22 15 22-15"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* sparkle top-left */}
      <path d="M2 8l1.2 3.6 1.2-3.6-1.2-3.6z" fill="#FFB21A" />
      {/* sparkle top-right */}
      <path d="M52 6l1.2 3.6 1.2-3.6-1.2-3.6z" fill="#FFB21A" />
    </svg>
  );
}

function HeartsStarIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-11 w-11" aria-hidden="true">
      {/* large red-ish heart */}
      <path
        d="M28 44S13 33 13 22a9 9 0 0 1 15-6.7A9 9 0 0 1 43 22c0 11-15 22-15 22Z"
        fill="#E8756A"
      />
      {/* small teal heart offset */}
      <path
        d="M34 18S29 14 29 11a4 4 0 0 1 7-2.6A4 4 0 0 1 40 11c0 3.5-6 7-6 7Z"
        fill="#1A9994"
        opacity="0.85"
      />
      {/* gold star above */}
      <path
        d="M28 4l1.5 4.6H34l-3.9 2.8 1.5 4.6L28 13.7l-3.6 2.3 1.5-4.6L22 8.6h4.5z"
        fill="#FFB21A"
      />
    </svg>
  );
}

function MailboxIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-11 w-11" aria-hidden="true">
      {/* main box body */}
      <rect x="7" y="24" width="32" height="22" rx="4" fill="#1A9994" />
      {/* dome top */}
      <path d="M7 30 Q7 17 23 17 Q39 17 39 30" fill="#0D7B76" />
      {/* mail slot */}
      <rect x="13" y="29" width="20" height="3" rx="1.5" fill="white" />
      {/* flag pole */}
      <line x1="39" y1="44" x2="39" y2="22" stroke="#E05252" strokeWidth="2.5" strokeLinecap="round" />
      {/* flag */}
      <path d="M39 22l9 4.5-9 4.5z" fill="#E05252" />
      {/* ground line */}
      <line x1="3" y1="47" x2="53" y2="47" stroke="#2D4A3A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────── */

const STEPS = [
  {
    number: 1,
    icon: EnvelopeIcon,
    title: "Enter your email",
    description:
      "Just add your email and tap Sign Me Up — it takes ten seconds and there's nothing else to fill in.",
  },
  {
    number: 2,
    icon: HeartsStarIcon,
    title: "Choose what matters",
    description:
      "Tell us what you care about — parenting tips, health alerts, learning activities — and we'll tailor every issue.",
  },
  {
    number: 3,
    icon: MailboxIcon,
    title: "Check your inbox every Sunday",
    description:
      "Your first OWL Weekly arrives Sunday morning. Look forward to fresh inspiration each week!",
  },
] as const;

/* ─── Decorative burst for heading ──────────────────────────────────── */

function Burst({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3v2M12 19v2M3 12H1M23 12h-2M5.64 5.64 4.22 4.22M19.78 19.78l-1.41-1.41M5.64 18.36l-1.42 1.42M19.78 4.22l-1.41 1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function NewsletterSignupSteps() {
  return (
    <section
      className="relative overflow-hidden bg-[#FBF6EC] py-16 md:py-24"
      aria-labelledby="nl-steps-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">

        {/* ── Heading ───────────────────────────────────────────── */}
        <div className="relative mb-16 text-center">
          {/* Left burst decorations */}
          <Burst className="absolute left-1/2 top-1 -ml-44 h-5 w-5 -translate-y-3 text-[#F5A623]" />
          <Burst className="absolute left-1/2 top-1 -ml-56 h-4 w-4 translate-y-1 text-[#1A9994]/70" />
          {/* Right burst decorations */}
          <Burst className="absolute left-1/2 top-1 ml-36 h-5 w-5 -translate-y-1 text-[#1A9994]" />
          <Burst className="absolute left-1/2 top-1 ml-48 h-4 w-4 translate-y-2 text-[#FF5A43]/60" />

          <h2
            id="nl-steps-heading"
            className="font-display text-3xl font-extrabold text-[#1A2E5A] sm:text-4xl"
          >
            Sign Up in{" "}
            <span className="text-[#1A9994]">3 Easy Steps</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-[#1A2E5A]/55">
            No accounts. No fees. Just good reading every Sunday.
          </p>
        </div>

        {/* ── Cards + connector ─────────────────────────────────── */}
        <div className="relative">

          {/* Desktop dotted teal connector — decorative div, NOT inside the ol */}
          <div
            className="absolute left-[calc(33.33%+0.5rem)] right-[calc(33.33%+0.5rem)] top-[4.5rem] hidden h-px border-t-2 border-dashed border-[#1A9994]/30 md:block"
            aria-hidden
          />

          <ol
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
            role="list"
            aria-label="Three steps to sign up for OWL Weekly"
          >
            {STEPS.map(({ number, icon: Icon, title, description }) => (
              <li key={number} className="flex flex-col items-center text-center">
                <div className="relative flex w-full flex-col items-center rounded-2xl bg-white px-8 pb-8 pt-14 shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">

                  {/* Teal circle number badge — overlaps top edge */}
                  <div
                    className="absolute -top-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#1A9994] font-display text-lg font-extrabold text-white shadow-[0_2px_10px_rgba(26,153,148,0.45)]"
                    aria-label={`Step ${number}`}
                  >
                    {number}
                  </div>

                  {/* Light blue circle with illustrated icon */}
                  <div className="flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-full bg-[#C8E8F4]">
                    <Icon />
                  </div>

                  <h3 className="mt-6 font-display text-lg font-bold text-[#1A2E5A]">
                    {title}
                  </h3>
                  <p className="mt-2.5 font-body text-sm leading-relaxed text-[#6B7280]">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </section>
  );
}
