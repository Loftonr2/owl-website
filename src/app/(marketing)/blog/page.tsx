import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { headers } from "@/lib/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { BlogCard } from "@/components/marketing/blog-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { SEED_BLOG_ARTICLES, SEED_BLOG_CATEGORIES } from "@/lib/seed/blog";

export const metadata = pageMetadata({
  title: "Blog & Resources",
  description: "Multicultural early-learning articles, gift guides, and SEL tools — written by Larissa.",
  path: "/blog",
});

export default function BlogPage() {
  const featured = SEED_BLOG_ARTICLES[0];
  const rest = SEED_BLOG_ARTICLES.slice(1);

  return (
    <>
      <PageHero
        eyebrow="Blog & resources"
        title="Notes from the OWL nest"
        subtitle="Multicultural early-learning articles, holiday explainers, gift guides, and SEL tools — written by Larissa."
        image={{ src: headers.blog.src, alt: headers.blog.alt }}
        ambient="paper"
      />

      {/* Pillar hub navigation */}
      <Section width="wide" pad="md" bg="cream">
        <SectionHeader eyebrow="By topic" title="Six pillar hubs" />
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SEED_BLOG_CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/blog/${c.slug}`}
                className="block rounded-owl-card border border-owl-cream-deep bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-display text-sm font-semibold text-owl-ink">{c.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Featured article */}
      {featured && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionHeader eyebrow="Latest" title="Featured this week" />
            <Link
              href={`/blog/${featured.slug}`}
              className="grid grid-cols-1 gap-8 overflow-hidden rounded-owl-hero border border-owl-cream-deep bg-white p-6 shadow-sm transition-all hover:shadow-md md:grid-cols-[1.2fr,1fr] md:p-10"
            >
              <div className="flex aspect-[16/10] items-center justify-center rounded-owl-card bg-owl-amber-soft/40 text-4xl text-owl-ink/30">
                {featured.title.charAt(0)}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">
                  {SEED_BLOG_CATEGORIES.find((c) => c.slug === featured.category)?.name}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-owl-ink sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-4 text-base text-owl-mist">{featured.summary}</p>
                <p className="mt-4 text-sm font-semibold text-owl-teal">Read article →</p>
              </div>
            </Link>
          </Section>
        </SectionReveal>
      )}

      {/* Article grid */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionHeader eyebrow="More from the blog" title="Recent articles" />
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => {
              const cat = SEED_BLOG_CATEGORIES.find((c) => c.slug === a.category);
              return (
                <li key={a.slug}>
                  <BlogCard
                    slug={a.slug}
                    title={a.title}
                    summary={a.summary}
                    categoryName={cat?.name ?? a.category}
                    publishedAt={a.publishedAt}
                    tone={a.tone}
                  />
                </li>
              );
            })}
          </ul>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
