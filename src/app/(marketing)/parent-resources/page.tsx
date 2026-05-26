import { pageMetadata } from "@/lib/seo/metadata";
import { headers } from "@/lib/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { BlogCard } from "@/components/marketing/blog-card";
import { PrintableCard } from "@/components/marketing/printable-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { SEED_BLOG_ARTICLES, SEED_BLOG_CATEGORIES } from "@/lib/seed/blog";
import { SEED_PRINTABLES } from "@/lib/seed/printables";

export const metadata = pageMetadata({
  title: "Parent Resources",
  description: "Curated articles, printables, and tools for parents and caregivers — sorted by age.",
  path: "/parent-resources",
});

export default function ParentResourcesPage() {
  const articlesForParents = SEED_BLOG_ARTICLES.filter(
    (a) => a.category === "early-learning" || a.category === "sel-for-kids" || a.category === "music-child-development"
  ).slice(0, 6);
  const homePrintables = SEED_PRINTABLES.filter((p) =>
    ["Alphabet", "SEL", "Numbers", "Bilingual"].includes(p.skill)
  ).slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow="For parents"
        title="Tools for the home library shelf"
        subtitle="The OWL bookshelf for parents — articles, printables, and routines that hold up when the day doesn't."
        image={{ src: headers.blog.src, alt: headers.blog.alt }}
        ambient="leaves"
      />

      <Section width="wide" pad="lg" bg="cream">
        <SectionHeader eyebrow="Read" title="Articles for parents" />
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articlesForParents.map((a) => {
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

      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionHeader eyebrow="Print" title="At-home printables" />
          <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {homePrintables.map((p) => (
              <li key={p.slug}>
                <PrintableCard {...p} />
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
