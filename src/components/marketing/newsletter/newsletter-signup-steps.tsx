import Image from "next/image";

/**
 * NewsletterSignupSteps
 * ─────────────────────
 * "Sign Up in 3 Easy Steps" — renders the approved three-step asset as the
 * primary visual. Accessible text is added as sr-only for screen readers.
 *
 * Responsive:
 *  mobile  — fixed-height crop to show the illustrated cards legibly
 *  desktop — full natural-aspect-ratio image (1928 × 815)
 */
export function NewsletterSignupSteps() {
  return (
    <section
      className="relative bg-[#FBF6EC]"
      aria-labelledby="nl-steps-heading"
    >
      <h2 id="nl-steps-heading" className="sr-only">
        Sign Up in 3 Easy Steps
      </h2>
      <p className="sr-only">
        Step 1: Enter your email — just type your address and tap Sign Me Up.
        Step 2: Choose what matters — tell us what you care about (parenting
        tips, health updates, learning activities) and we tailor every issue.
        Step 3: Check your inbox every Sunday — your first OWL Weekly arrives
        Sunday morning.
      </p>

      {/* Mobile: fixed height crop */}
      <div
        className="relative h-48 w-full overflow-hidden sm:h-72 md:hidden"
        aria-hidden="true"
      >
        <Image
          src="/images/newsletter/redesign/signup-three-steps.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* Desktop: full natural-aspect-ratio (1928 × 815) */}
      <div className="hidden md:block" aria-hidden="true">
        <Image
          src="/images/newsletter/redesign/signup-three-steps.png"
          alt=""
          width={1928}
          height={815}
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
