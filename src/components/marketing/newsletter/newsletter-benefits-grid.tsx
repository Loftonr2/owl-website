import Image from "next/image";

/**
 * NewsletterBenefitsGrid
 * ──────────────────────
 * "What You'll Receive Each Week" — renders the approved six-card benefits
 * asset as the primary visual. The asset contains the correct teal / amber /
 * coral / blue / purple / dark-teal colour coding and folded-tab card styling.
 *
 * Accessible text is added as sr-only for screen readers.
 *
 * Responsive:
 *  mobile  — fixed-height crop
 *  desktop — full natural-aspect-ratio image (2123 × 741)
 */
export function NewsletterBenefitsGrid() {
  return (
    <section
      className="relative bg-[#DCF0EE]"
      aria-labelledby="nl-benefits-heading"
    >
      <h2 id="nl-benefits-heading" className="sr-only">
        What You&apos;ll Receive Each Week
      </h2>
      <p className="sr-only">
        Every OWL Weekly issue includes six sections: (1) A Note from OWL —
        warm encouragement to start your week. (2) Parenting Tip of the Week
        — practical, research-backed advice. (3) Children&apos;s Health
        Updates — important safety news and recall alerts. (4) Latest News —
        helpful stories for parents and caregivers. (5) Latest from the Blog
        — expert ideas and activities. (6) Weekly Store Perk — exclusive
        discounts on OWL products.
      </p>

      {/* Mobile: fixed height crop */}
      <div
        className="relative h-48 w-full overflow-hidden sm:h-72 md:hidden"
        aria-hidden="true"
      >
        <Image
          src="/images/newsletter/redesign/weekly-benefits.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Desktop: full natural-aspect-ratio (2123 × 741) */}
      <div className="hidden md:block" aria-hidden="true">
        <Image
          src="/images/newsletter/redesign/weekly-benefits.png"
          alt=""
          width={2123}
          height={741}
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
