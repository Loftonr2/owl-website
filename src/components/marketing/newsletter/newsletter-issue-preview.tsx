import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

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
 * "See What's Inside" — split layout with a styled mini-newsletter card on
 * the right and a CTA on the left.
 *
 * Receives the latest issue metadata from the parent server component.
 * Returns null if no issue data is available.
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
      className="bg-white py-16 md:py-20"
      aria-labelledby="nl-preview-heading"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">

          {/* ── Left: CTA ───────────────────────────────────────── */}
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-owl-teal">
              Latest Issue
            </p>
            <h2
              id="nl-preview-heading"
              className="mt-3 font-display text-3xl font-bold text-owl-ink sm:text-4xl"
            >
              See What&apos;s Inside
            </h2>
            <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-owl-mist">
              Here&apos;s a peek at our latest issue — get a feel for what lands
              in your inbox every Sunday morning.
            </p>

            {/* Arrow doodle */}
            <div className="mt-2 flex items-center gap-1 font-body text-sm text-owl-teal/60">
              <span aria-hidden>↘</span>
              <span>Take a look</span>
            </div>

            <div className="mt-8">
              <Button intent="secondary" size="lg" asChild>
                <Link
                  href={issueHref}
                  aria-label={`Read OWL Weekly Issue #${latestIssue.issue_number}: ${latestIssue.title}`}
                >
                  View Latest Issue
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Right: mini newsletter preview card ─────────────── */}
          <div className="flex justify-center">
            <div
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-owl-cream-deep shadow-owl-3 transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)]"
              aria-hidden
            >
              {/* Mini header */}
              <div className="flex items-center justify-between bg-owl-cream px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/brand/mascot.png"
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-display text-xs font-bold text-owl-ink">
                      OWL <span className="text-owl-teal">Weekly</span>
                    </p>
                    <p className="font-body text-[10px] text-owl-mist">
                      Inspire. Educate. Together.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-owl-rose px-2 py-0.5 font-display text-[10px] font-bold text-white">
                  Issue #{latestIssue.issue_number}
                </span>
              </div>

              {/* Date strip */}
              {pubDate && (
                <div className="bg-owl-teal/5 px-4 py-1.5 text-center font-body text-[10px] text-owl-mist">
                  📅 {pubDate}
                </div>
              )}

              {/* Mini content */}
              <div className="space-y-2 bg-white p-4">
                {/* Note from OWL */}
                <div className="flex items-start gap-2 rounded-xl bg-owl-cream p-3">
                  <Heart className="mt-0.5 h-4 w-4 shrink-0 text-owl-teal" />
                  <div>
                    <p className="font-display text-[11px] font-bold text-owl-teal">
                      A Note from OWL
                    </p>
                    <p className="mt-0.5 font-body text-[10px] leading-relaxed text-owl-ink/70 line-clamp-2">
                      {latestIssue.title}
                    </p>
                  </div>
                </div>

                {/* Two-col row: store perk + parenting tip */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-owl-teal px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3 text-owl-amber" />
                      <p className="font-display text-[9px] font-bold text-white/80">
                        This Week&apos;s Perk
                      </p>
                    </div>
                    <p className="mt-0.5 font-display text-base font-extrabold text-owl-amber">
                      15% Off
                    </p>
                    <p className="font-body text-[9px] text-white/60">
                      Use code OWLWEEKLY15
                    </p>
                  </div>
                  <div className="rounded-xl bg-owl-amber/15 px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-owl-teal" />
                      <p className="font-display text-[9px] font-bold text-owl-teal">
                        Parenting Tip
                      </p>
                    </div>
                    <p className="mt-0.5 font-body text-[10px] leading-snug text-owl-ink/70">
                      Create Calm with Daily Routines
                    </p>
                  </div>
                </div>

                {/* Read more row */}
                <div className="flex items-center justify-between rounded-xl bg-owl-cream/60 px-3 py-2">
                  <span className="font-body text-[10px] text-owl-mist">
                    + Latest News &amp; Blog posts
                  </span>
                  <span className="font-display text-[10px] font-semibold text-owl-teal">
                    Read more →
                  </span>
                </div>
              </div>

              {/* Fade-out gradient — implies more content below */}
              <div className="h-10 bg-gradient-to-t from-owl-cream/90 to-transparent" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
