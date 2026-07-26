import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Lightbulb, ArrowRight } from "lucide-react";

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
 * "See What's Inside" — cream background section.
 * Left: headline, subtitle, coral CTA button + curved teal arrow.
 * Right: styled mini-newsletter preview card.
 * Matches Newsletter Preview wireframe (upper half).
 */
export function NewsletterIssuePreview({ latestIssue }: Props) {
  if (!latestIssue) return null;

  const issueHref = `/newsletter/${latestIssue.archive_slug}`;

  const pubDate = latestIssue.publication_date
    ? new Date(latestIssue.publication_date + "T12:00:00Z").toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "America/New_York",
        }
      )
    : "";

  return (
    <section
      className="bg-[#FBF6EC] py-16 md:py-24"
      aria-labelledby="nl-preview-heading"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:items-center">

          {/* ── Left: copy + CTA ─────────────────────────────── */}
          <div className="relative">
            {/* Decorative: gold star top-right */}
            <div className="absolute -right-4 top-0 text-[#FFB21A]" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
            </div>
            {/* Decorative: teal music note */}
            <div className="absolute -right-2 bottom-10 text-[#1A9994]" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 opacity-60">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            {/* Decorative: coral outlined star */}
            <div className="absolute left-0 bottom-0 text-[#FF5A43]" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 opacity-50">
                <path
                  d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="font-display text-xs font-semibold uppercase tracking-widest text-[#1A9994]">
              Latest Issue
            </p>
            <h2
              id="nl-preview-heading"
              className="mt-3 font-display text-3xl font-extrabold leading-tight text-[#1A2E5A] sm:text-4xl"
            >
              See What&apos;s{" "}
              <span className="text-[#1A9994]">Inside</span>
            </h2>
            <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-[#1A2E5A]/65">
              Here&apos;s a peek at our latest issue — get a feel for what
              lands in your inbox every Sunday morning.
            </p>

            {/* Curved teal arrow pointing right toward preview card */}
            <div className="mt-3 flex items-center gap-2">
              <svg
                viewBox="0 0 80 40"
                fill="none"
                className="h-8 w-16 text-[#1A9994]/55"
                aria-hidden="true"
              >
                <path
                  d="M4 30 C20 30, 50 8, 74 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* arrowhead pointing right */}
                <path d="M70 12l8 6-8 4z" fill="currentColor" />
              </svg>
              <span className="font-body text-sm italic text-[#1A9994]/60">
                Take a look →
              </span>
            </div>

            {/* Coral CTA button — bright #FF5A43 matching approved asset */}
            <div className="mt-8">
              <Link
                href={issueHref}
                aria-label={`Read OWL Weekly Issue #${latestIssue.issue_number}: ${latestIssue.title}`}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-display text-base font-bold text-white shadow-[0_4px_16px_rgba(255,90,67,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,90,67,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A43] focus-visible:ring-offset-2"
                style={{
                  background: "linear-gradient(135deg, #FF5A43 0%, #FF8A4C 100%)",
                }}
              >
                View Latest Issue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          {/* ── Right: newsletter preview card ───────────────── */}
          <div className="flex justify-center md:justify-end" aria-hidden>
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#E8D5B0] shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.13)]">

              {/* Header: OWL Weekly brand bar */}
              <div className="flex items-center justify-between bg-[#FBF6EC] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/brand/mascot.png"
                    alt=""
                    width={34}
                    height={34}
                    className="rounded-full ring-2 ring-[#1A9994]/20"
                  />
                  <div>
                    <p className="font-display text-sm font-extrabold text-[#1A2E5A]">
                      OWL{" "}
                      <span className="text-[#1A9994]">Weekly</span>
                    </p>
                    <p className="font-body text-[10px] text-[#6B7280]">
                      Inspire. Educate. Together.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E89F8E] px-2.5 py-0.5 font-display text-[10px] font-bold text-white">
                  Issue #{latestIssue.issue_number}
                </span>
              </div>

              {/* Date strip */}
              {pubDate && (
                <div className="bg-[#1A9994]/8 px-4 py-1.5 text-center font-body text-[10px] text-[#6B7280]">
                  {pubDate}
                </div>
              )}

              {/* Content area */}
              <div className="space-y-2.5 bg-white p-4">

                {/* Note from OWL */}
                <div className="flex items-start gap-2.5 rounded-xl bg-[#FBF6EC] p-3">
                  <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#1A9994]" />
                  <div>
                    <p className="font-display text-[11px] font-bold text-[#1A9994]">
                      A Note from OWL
                    </p>
                    <p className="mt-0.5 line-clamp-2 font-body text-[10px] leading-relaxed text-[#1A2E5A]/70">
                      {latestIssue.title}
                    </p>
                  </div>
                </div>

                {/* Two-col: Store Perk + Parenting Tip */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#1A9994] px-3 py-3">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3 text-[#F5A623]" />
                      <p className="font-display text-[9px] font-bold text-white/80">
                        This Week&apos;s Perk
                      </p>
                    </div>
                    <p className="mt-1 font-display text-xl font-extrabold text-[#F5A623]">
                      15% Off
                    </p>
                    <p className="font-body text-[9px] text-white/60">
                      Use code OWLWEEKLY15
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FEF3D0] px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-[#1A9994]" />
                      <p className="font-display text-[9px] font-bold text-[#1A9994]">
                        Parenting Tip
                      </p>
                    </div>
                    <p className="mt-1 font-body text-[10px] leading-snug text-[#1A2E5A]/70">
                      Create Calm with Daily Routines
                    </p>
                  </div>
                </div>

                {/* Read more hint */}
                <div className="flex items-center justify-between rounded-xl bg-[#FBF6EC]/80 px-3 py-2">
                  <span className="font-body text-[10px] text-[#6B7280]">
                    + Latest News &amp; Blog posts
                  </span>
                  <span className="font-display text-[10px] font-semibold text-[#1A9994]">
                    Read more →
                  </span>
                </div>
              </div>

              {/* Fade-out overlay — implies more content below */}
              <div className="h-10 bg-gradient-to-t from-[#FBF6EC]/90 to-transparent" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
