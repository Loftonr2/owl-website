
import { pageMetadata } from "@/lib/seo/metadata";
import {
  getPublishedNewsletterIssues,
  getLatestNewsletterPreview,
} from "@/lib/newsletter-resolver";
import Link from "next/link";
import { NewsHeroBanner } from "@/components/marketing/news-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterHeroSignup } from "@/components/marketing/newsletter/newsletter-hero-signup";
import { NewsletterSignupSteps } from "@/components/marketing/newsletter/newsletter-signup-steps";
import { NewsletterBenefitsGrid } from "@/components/marketing/newsletter/newsletter-benefits-grid";
import { NewsletterIssuePreview } from "@/components/marketing/newsletter/newsletter-issue-preview";
import { NewsletterFinalCta } from "@/components/marketing/newsletter/newsletter-final-cta";

export const metadata = pageMetadata({
  title: "The OWL Weekly Newsletter",
  description:
    "One short letter from Larissa every Sunday — a video, a printable, a cultural note, a parenting win.",
  path: "/newsletter",
});
export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  // Published archive issues (shown only when at least one is published/sent)
  let issues: Awaited<ReturnType<typeof getPublishedNewsletterIssues>> = [];
  // Latest campaign metadata — used for the "See What's Inside" preview card
  let latestPreview: Awaited<ReturnType<typeof getLatestNewsletterPreview>> =
    null;

  try {
    [issues, latestPreview] = await Promise.all([
      getPublishedNewsletterIssues(),
      getLatestNewsletterPreview(),
    ]);
  } catch {
    // DB not configured in this environment — fall through gracefully
  }

  return (
    <>
      {/* ── Video hero ──────────────────────────────────────────────── */}
      <NewsHeroBanner
        src="/videos/newsletter-hero.mp4"
        poster="/images/heroes/newsletter-hero-poster.webp"
        eyebrow="The OWL Weekly"
        title={
          <>
            A small letter from Larissa,{" "}
            <span className="text-owl-teal">every Sunday.</span>
          </>
        }
        subtitle="Five minutes to read. One short video, one printable, one cultural note, one small parenting win. Written like a note to a friend."
        ctaLabel="Subscribe"
        ctaHref="#subscribe"
        meta={
          <p className="italic">
            &ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa
          </p>
        }
      />

      {/* ── "Join OWL Weekly" signup hero ───────────────────────────── */}
      <SectionReveal>
        <div id="subscribe">
          <NewsletterHeroSignup />
        </div>
      </SectionReveal>

      {/* ── Sign Up in 3 Easy Steps ─────────────────────────────────── */}
      <SectionReveal delay={0.05}>
        <NewsletterSignupSteps />
      </SectionReveal>

      {/* ── What You'll Receive Each Week ───────────────────────────── */}
      <SectionReveal delay={0.05}>
        <NewsletterBenefitsGrid />
      </SectionReveal>

      {/* ── See What's Inside (latest issue preview) ────────────────── */}
      {latestPreview && (
        <SectionReveal delay={0.05}>
          <NewsletterIssuePreview latestIssue={latestPreview} />
        </SectionReveal>
      )}

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <SectionReveal delay={0.05}>
        <NewsletterFinalCta />
      </SectionReveal>

      {/* ── Archive (shown only once issues are published) ──────────── */}
      {issues.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionIntro
              eyebrow="Past issues"
              title="Newsletter Archive"
              subtitle="Browse every OWL Weekly issue. Click any issue to read it in your browser."
            />
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {issues.map((issue) => (
                <li key={issue.id}>
                  <Link
                    href={`/newsletter/${issue.archive_slug}`}
                    className="group flex h-full flex-col rounded-owl-card border border-owl-cream-deep bg-white p-5 shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-owl-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-owl-teal/10 px-3 py-1 font-display text-xs font-bold text-owl-teal">
                        Issue #{issue.issue_number}
                      </span>
                      {issue.publication_date && (
                        <span className="text-xs text-owl-mist">
                          {new Date(
                            issue.publication_date + "T12:00:00Z"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold text-owl-ink">
                      {issue.title}
                    </h3>
                    <div className="mt-auto pt-4">
                      <span className="text-sm font-semibold text-owl-teal group-hover:underline">
                        Read this issue →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </SectionReveal>
      )}
    </>
  );
}
