/**
 * NewsletterBenefitsGrid
 * ──────────────────────
 * "What You'll Receive Each Week" — 6 tab-style cards on aqua (#E8F5F4).
 * Matches Newsletter Tabs approved asset.
 *
 * Card anatomy (per approved image):
 *  ┌─[folded-tab at top-left]──────────────────┐
 *  │  [colored icon square]  [TITLE TEXT]       │
 *  │  ── ── ── ── ── ── ── ── ── ── ── ── ──●  │
 *  │  Gray description text…                    │
 *  └────────────────────────────────────────────┘
 *
 * The "folded tab" is an absolute-positioned colored rectangle at top-left;
 * the card's overflow:hidden + rounded-2xl clips it to the card corner shape.
 */

/* ─── Benefit icons ──────────────────────────────────────────────────── */

function HeartIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className="h-5 w-5" aria-hidden="true">
      <path d="M12 21S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13Z" />
    </svg>
  );
}

function LightbulbIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M9 21h6M12 3a6 6 0 0 1 3 11.2V17H9v-2.8A6 6 0 0 1 12 3Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3L4 7v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-4Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NewspaperIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
      <path d="M7 8h10M7 12h7M7 16h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PenIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className="h-5 w-5" aria-hidden="true">
      <path d="M3 17.25V21h3.75l11-11.06-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
    </svg>
  );
}

function BagIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="2" stroke={color} strokeWidth="2" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* star inside bag */}
      <path
        d="M12 11.5l.6 1.8h1.9l-1.6 1.1.6 1.8-1.5-1.1-1.5 1.1.6-1.8-1.6-1.1H11.4z"
        fill={color}
      />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────── */

type BenefitCard = {
  tabColor: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: (p: { color: string }) => any;
  title: string;
  description: string;
};

const BENEFITS: BenefitCard[] = [
  {
    tabColor: "#1A9994",
    iconBg: "#CCF0EE",
    iconColor: "#1A9994",
    titleColor: "#1A9994",
    icon: HeartIcon,
    title: "A Note from OWL",
    description:
      "A warm welcome and words of encouragement from OWL to start your week with heart.",
  },
  {
    tabColor: "#F5A623",
    iconBg: "#FEF3D0",
    iconColor: "#D4871A",
    titleColor: "#B87515",
    icon: LightbulbIcon,
    title: "Parenting Tip of the Week",
    description:
      "Practical, research-backed tips to build confidence and deeper connection with your child.",
  },
  {
    tabColor: "#FF5A43",
    iconBg: "#FDEAE6",
    iconColor: "#D94030",
    titleColor: "#C13830",
    icon: ShieldIcon,
    title: "Children's Health Updates",
    description:
      "Important health news and food recall alerts to keep your family safe every week.",
  },
  {
    tabColor: "#4A90D9",
    iconBg: "#DCEEFF",
    iconColor: "#4A90D9",
    titleColor: "#2465A7",
    icon: NewspaperIcon,
    title: "Latest News",
    description:
      "Helpful stories and trusted resources curated for today's parents and caregivers.",
  },
  {
    tabColor: "#8B5CF6",
    iconBg: "#EDE9FF",
    iconColor: "#8B5CF6",
    titleColor: "#6D3FCF",
    icon: PenIcon,
    title: "Latest from the Blog",
    description:
      "Expert advice, activities, and ideas to keep your family happy and thriving.",
  },
  {
    tabColor: "#0D7B76",
    iconBg: "#B6E8E6",
    iconColor: "#0D7B76",
    titleColor: "#0D7B76",
    icon: BagIcon,
    title: "Weekly Store Perk",
    description:
      "Exclusive discounts and special offers on your favorite OWL products, every Sunday.",
  },
];

/* ─── Heading gold star ──────────────────────────────────────────────── */

function GoldStar() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="#F5A623"
      className="inline-block h-5 w-5"
      aria-hidden="true"
    >
      <path d="M10 1l2.4 7.2H19l-5.9 4.3 2.2 7-5.3-3.9-5.3 3.9 2.2-7L1 8.2h6.6z" />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function NewsletterBenefitsGrid() {
  return (
    <section
      className="bg-[#DCF0EE] py-16 md:py-24"
      aria-labelledby="nl-benefits-heading"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">

        {/* ── Heading ─────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <h2
            id="nl-benefits-heading"
            className="font-display text-3xl font-extrabold text-[#1A2E5A] sm:text-4xl"
          >
            <GoldStar />{" "}
            What You&apos;ll Receive Each Week{" "}
            <GoldStar />
          </h2>
        </div>

        {/* ── 3×2 Grid ────────────────────────────────────────── */}
        <ul
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Newsletter benefit sections"
        >
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
            >
              {/* ── Dog-ear folded tab at top-left corner ── */}
              {/* overflow:hidden + rounded-2xl on parent clips it to card shape */}
              <div
                className="absolute left-0 top-0 h-8 w-[4.5rem]"
                style={{ backgroundColor: b.tabColor }}
                aria-hidden
              />

              {/* ── Card body ── */}
              <div className="px-5 pb-5 pt-5">

                {/* Icon + Title row (horizontal) */}
                <div className="flex items-center gap-3 pt-3">
                  {/* Colored square icon tile */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: b.iconBg }}
                    aria-hidden
                  >
                    <b.icon color={b.iconColor} />
                  </div>

                  {/* Title to the right of icon */}
                  <h3
                    className="font-display text-[0.9rem] font-bold leading-snug"
                    style={{ color: b.titleColor }}
                  >
                    {b.title}
                  </h3>
                </div>

                {/* Dashed line + terminal colored dot */}
                <div className="mt-4 flex items-center gap-1" aria-hidden>
                  <div
                    className="flex-1 border-t-2 border-dashed"
                    style={{ borderColor: `${b.tabColor}45` }}
                  />
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: b.tabColor }}
                  />
                </div>

                {/* Gray description text */}
                <p className="mt-3 font-body text-sm leading-relaxed text-[#6B7280]">
                  {b.description}
                </p>

              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
