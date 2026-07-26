/**
 * NewsletterSignupSteps
 * ─────────────────────
 * "Sign Up in 3 Easy Steps" — three illustrated step cards on cream.
 * Matches Newsletter Sign Up Process wireframe.
 *
 * Cards: white rounded, teal circle number badge (top-centre),
 * large aqua circle with SVG icon, dotted teal connector on desktop.
 */

// SVG icons matching the wireframe illustrations
function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-10 w-10" aria-hidden="true">
      {/* envelope body */}
      <rect x="6" y="14" width="44" height="30" rx="4" fill="#1A9994" />
      {/* flap */}
      <path d="M6 18l22 16 22-16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* stars around */}
      <path d="M3 10l1 3 1-3-1-3z" fill="#F5A623" />
      <path d="M50 8l1 3 1-3-1-3z" fill="#F5A623" />
    </svg>
  );
}

function HeartsStarIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-10 w-10" aria-hidden="true">
      {/* big heart */}
      <path d="M28 44S14 34 14 24a8 8 0 0 1 14-5.2A8 8 0 0 1 42 24c0 10-14 20-14 20Z" fill="#E89F8E" />
      {/* star on top */}
      <path d="M28 12l1.4 4.3H34l-3.7 2.7 1.4 4.3L28 21l-3.7 2.3 1.4-4.3L22 16.3h4.6z" fill="#F5A623" />
      {/* small heart left */}
      <path d="M13 15S10 12 10 10a2.5 2.5 0 0 1 3-2.4A2.5 2.5 0 0 1 16 10c0 2-3 5-3 5Z" fill="#E89F8E" opacity="0.7" />
    </svg>
  );
}

function MailboxIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="h-10 w-10" aria-hidden="true">
      {/* post box body */}
      <rect x="8" y="24" width="32" height="22" rx="4" fill="#1A9994" />
      {/* half-circle flap top */}
      <path d="M8 30 Q8 18 24 18 Q40 18 40 30" fill="#0D7B76" />
      {/* slot */}
      <rect x="14" y="30" width="20" height="2.5" rx="1.25" fill="white" />
      {/* red flag */}
      <line x1="40" y1="44" x2="40" y2="24" stroke="#E05252" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 24l8 4-8 4z" fill="#E05252" />
      {/* ground */}
      <line x1="4" y1="46" x2="52" y2="46" stroke="#2D4A3A" strokeWidth="2.5" strokeLinecap="round" />
      {/* post */}
      <line x1="18" y1="46" x2="18" y2="50" stroke="#2D4A3A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="46" x2="30" y2="50" stroke="#2D4A3A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  {
    number: 1,
    icon: EnvelopeIcon,
    title: "Enter Your Email",
    description: "Just add your email and click Sign Me Up — it takes ten seconds.",
  },
  {
    number: 2,
    icon: HeartsStarIcon,
    title: "We Curate With Love",
    description:
      "Every Sunday we hand-pick the best tips, news, and perks for OWL families.",
  },
  {
    number: 3,
    icon: MailboxIcon,
    title: "Check Your Inbox",
    description:
      "Your first OWL Weekly lands Sunday morning. Enjoy inspiring reads all week!",
  },
] as const;

// Burst / sparkle decoration around the heading
function Burst({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v2M12 19v2M3 12H1M23 12h-2M5.64 5.64 4.22 4.22M19.78 19.78l-1.41-1.41M5.64 18.36l-1.42 1.42M19.78 4.22l-1.41 1.42"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function NewsletterSignupSteps() {
  return (
    <section
      className="relative overflow-hidden bg-[#FBF6EC] py-16 md:py-24"
      aria-labelledby="nl-steps-heading"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">

        {/* ── Heading ──────────────────────────────────────────── */}
        <div className="relative mb-14 text-center">
          <Burst className="absolute left-1/2 top-0 -ml-40 h-6 w-6 -translate-y-3 text-[#F5A623]" />
          <Burst className="absolute left-1/2 top-0 ml-32 h-5 w-5 -translate-y-1 text-[#1A9994]" />

          <h2
            id="nl-steps-heading"
            className="font-display text-3xl font-extrabold text-[#1A2E5A] sm:text-4xl"
          >
            Sign Up in{" "}
            <span className="text-[#1A9994]">3 Easy Steps</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-[#1A2E5A]/60">
            No accounts. No fees. Just good reading every Sunday.
          </p>
        </div>

        {/* ── Steps row ────────────────────────────────────────── */}
        <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-3" role="list">

          {/* Desktop dotted connector between cards */}
          <li className="absolute left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] top-[3.5rem] hidden h-px border-t-2 border-dashed border-[#1A9994]/30 md:block" aria-hidden />

          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <li key={number} className="flex flex-col items-center text-center">

              {/* White card */}
              <div className="relative flex w-full flex-col items-center rounded-2xl bg-white px-8 pb-8 pt-14 shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">

                {/* Teal circle number badge */}
                <div
                  className="absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1A9994] font-display text-lg font-extrabold text-white shadow-[0_2px_8px_rgba(26,153,148,0.4)]"
                  aria-label={`Step ${number}`}
                >
                  {number}
                </div>

                {/* Aqua circle with icon */}
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#B6E8E6]">
                  <Icon />
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-[#1A2E5A]">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-[#6B7280]">
                  {description}
                </p>
              </div>

            </li>
          ))}
        </ol>

      </div>
    </section>
  );
}
