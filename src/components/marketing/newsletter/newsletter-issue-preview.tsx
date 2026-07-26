import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type LatestNewsletterPreview = {
  issue_number: number;
  title: string;
  archive_slug: string;
  publication_date: string | null;
};

type Props = {
  latestIssue: LatestNewsletterPreview | null;
};

/**
 * NewsletterIssuePreview
 * ──────────────────────
 * "See What's Inside" — renders the approved Newsletter Preview asset cropped
 * to its upper cream portion (top ≈55%, stopping before the teal wave at
 * y≈480 of 836). The teal wave + final CTA section is handled separately by
 * NewsletterFinalCta so the boundary is seamless.
 *
 * The asset shows the visual design for:
 *   - "See What's Inside" heading and subtitle
 *   - Coral "View Latest Issue" button area (visual reference)
 *   - Curved teal arrow pointing at the newsletter preview card
 *   - Newsletter preview card mockup (decorative — Issue metadata)
 *   - Decorative stars and music notes
 *
 * The real "View Latest Issue" button is rendered BELOW the cropped asset
 * as a genuine interactive element linking to the actual latest issue from
 * the newsletter_campaigns DB. It shows only when a real issue exists.
 *
 * The component always renders (never returns null), so the section is
 * visible regardless of DB state.
 *
 * Crop maths (newsletter-preview.png 1881 × 836):
 *  - Teal wave starts at y ≈ 480 px = 57.4% of image height
 *  - padding-bottom % = (480 / 1881) × 100 = 25.5% shows the top 55%
 *
 * Responsive:
 *  mobile  — fixed-height crop (object-cover, object-top)
 *  desktop — padding-bottom crop (25.5% of container width) with fill image
 */
export function NewsletterIssuePreview({ latestIssue }: Props) {
  const issueHref = latestIssue
    ? `/newsletter/${latestIssue.archive_slug}`
    : null;

  return (
    <section
      className="relative bg-[#FBF6EC]"
      aria-labelledby="nl-preview-heading"
    >
      <h2 id="nl-preview-heading" className="sr-only">
        See What&apos;s Inside
      </h2>
      <p className="sr-only">
        A peek at our latest OWL Weekly issue — see what lands in your inbox
        every Sunday morning.
      </p>

      {/* ── Approved design asset (cropped to cream section) ────────── */}

      {/* Mobile: fixed-height cover crop */}
      <div
        className="relative h-44 w-full overflow-hidden sm:h-60 md:hidden"
        aria-hidden="true"
      >
        <Image
          src="/images/newsletter/redesign/newsletter-preview.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-left-top"
        />
      </div>

      {/* Desktop: ~80% width centered + padding-bottom crop — shows top 55% of the 1881×836 image.
          The wrapper provides the 80% centering (px-[10%]).
          padding-bottom = (480 / 1881) × 100 = 25.5% of the inner container width,
          which at 80vw ≈ 20.4% of viewport height (correct crop). */}
      <div className="hidden md:flex md:justify-center md:px-[10%]" aria-hidden="true">
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: "25.5%" }}
        >
          <Image
            src="/images/newsletter/redesign/newsletter-preview.png"
            alt=""
            fill
            sizes="(min-width: 768px) 80vw, 100vw"
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* ── Real "View Latest Issue" button ─────────────────────────── */}
      {/*
        Renders only when the DB has at least one published/sent campaign.
        Links to the actual latest issue — never hardcodes Issue #1.
        Positioned in the same cream background so it floats below the image.
      */}
      {issueHref && latestIssue && (
        <div className="flex justify-center px-6 py-6 md:py-8">
          <Link
            href={issueHref}
            aria-label={`View OWL Weekly Issue #${latestIssue.issue_number}: ${latestIssue.title}`}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-display text-base font-bold text-white shadow-[0_4px_16px_rgba(255,90,67,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,90,67,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A43] focus-visible:ring-offset-2"
            style={{
              background: "linear-gradient(135deg, #FF5A43 0%, #FF8A4C 100%)",
            }}
          >
            View Latest Issue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
