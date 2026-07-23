
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublishedNewsletterIssues } from "@/lib/newsletter-resolver";
import Link from "next/link";
import { NewsHeroBanner } from "@/components/marketing/news-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { SectionReveal } from "@/components/marketing/section-reveal";

export const metadata = pageMetadata({
  title: "The OWL Weekly Newsletter",
  description: "One short letter from Larissa every Sunday — a video, a printable, a cultural note, a parenting win.",
  path: "/newsletter",
});
export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  let issues: Awaited<ReturnType<typeof getPublishedNewsletterIssues>> = [];
  try {
    issues = await getPublishedNewsletterIssues();
  } catch {
    // DB not configured in this environment; fall through to show signup only
  }

  return (
    <>
      <NewsHeroBanner
        src="/videos/newsletter-hero.mp4"
        eyebrow="The OWL Weekly"
        title={<>A small letter from Larissa, <span className="text-owl-teal">every Sunday.</span></>}
        subtitle="Five minutes to read. One short video, one printable, one cultural note, one small parenting win. Written like a note to a friend."
        ctaLabel="Subscribe"
        ctaHref="#subscribe"
        meta={<p className="italic">&ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa</p>}
      />

      {/* Subscribe section */}
      <SectionReveal>
        <Section width="narrow" pad="lg" bg="cream" id="subscribe">
          <SectionIntro
            eyebrow="Join the OWL family"
            title="Get the OWL Weekly"
            subtitle="Every Sunday morning — a video, a printable, a parenting tip, and a note from Larissa. Free, always."
            align="center"
          />
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm source="other" segment="A2" ctaLabel="Subscribe free" />
          </div>
        </Section>
      </SectionReveal>

      {/* Archive */}
      {issues.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionIntro
              eyebrow="Past issues"
              title="Newsletter Archive"
              subtitle="Browse every OWL Weekly issue. Click any issue to read it in your browser."
            />
            <ul role="list" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          {new Date(issue.publication_date + "T12:00:00Z").toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold text-owl-ink">{issue.title}</h3>
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
