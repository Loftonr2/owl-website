import Image from "next/image";
import { Section } from "@/components/ui/section";
import { OwlMark } from "@/components/brand/owl-logo";
import { NewsletterForm } from "./newsletter-form";
import { AmbientLayer } from "./ambient-layer";
import { headers } from "@/lib/images";

/**
 * Newsletter section — full-width signup band near the footer.
 *
 * v2 (redesign): layered composition with sparkle ambient behind the form,
 * scroll-linked subtle parallax on the right-column banner.
 *
 * Repeats on every public page (the marketing footer also has a slim version).
 */
export function NewsletterSection() {
  return (
    <Section width="wide" pad="lg" bg="cream">
      <div className="relative isolate grid grid-cols-1 items-center gap-10 overflow-hidden rounded-owl-hero bg-owl-white p-6 shadow-owl-1 md:grid-cols-2 md:p-12">
        {/* Soft sparkles ambient behind the headline */}
        <AmbientLayer
          pattern="sparkles"
          density={3}
          seed={101}
          className="inset-0 right-1/2"
        />

        <div className="relative z-text">
          <div className="mb-4 inline-flex items-center gap-2">
            <OwlMark decorative className="h-7 w-7" />
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal">
              The OWL Weekly
            </p>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
            A small letter from Larissa, every Sunday.
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-ink/75">
            One short video, one free printable, one cultural note, one small
            parenting win. Five minutes to read — written like a note to a
            friend.
          </p>
          <div className="mt-8 max-w-md">
            <NewsletterForm
              source="homepage"
              ctaLabel="Subscribe"
              headline=""
              body=""
            />
          </div>
          <p className="mt-3 text-xs italic text-owl-mist">
            Double opt-in via Beehiiv. Unsubscribe anytime.
          </p>
        </div>

        <div className="relative hidden aspect-[5/4] w-full overflow-hidden rounded-owl-hero shadow-owl-1 md:block">
          <div className="absolute inset-0 owl-scroll-banner-parallax">
            <Image
              src={headers.newsletter.src}
              alt={headers.newsletter.alt}
              fill
              sizes="(min-width: 768px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          {/* Soft inner ring */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-owl-hero ring-1 ring-inset ring-owl-cream/50"
          />
        </div>
      </div>
    </Section>
  );
}
