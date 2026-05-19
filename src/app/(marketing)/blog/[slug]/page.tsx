import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { BlogCard } from "@/components/marketing/blog-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site-config";
import {
  SEED_BLOG_ARTICLES,
  SEED_BLOG_CATEGORIES,
  findArticleBySlug,
  findCategoryBySlug,
  isCategorySlug,
} from "@/lib/seed/blog";

type Params = { slug: string };

/**
 * /blog/[slug] resolves to either:
 *   1. A category pillar hub (if slug matches one of the 6 hubs), or
 *   2. An article detail page (any other slug that exists in SEED_BLOG_ARTICLES)
 *   3. notFound() otherwise
 *
 * This single template avoids a route conflict between `/blog/[category]` and
 * `/blog/[slug]`.
 */
export async function generateStaticParams(): Promise<Params[]> {
  return [
    ...SEED_BLOG_ARTICLES.map((a) => ({ slug: a.slug })),
    ...SEED_BLOG_CATEGORIES.map((c) => ({ slug: c.slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (isCategorySlug(slug)) {
    const c = findCategoryBySlug(slug)!;
    return pageMetadata({
      title: `${c.name} — Blog`,
      description: c.description,
      path: `/blog/${c.slug}`,
    });
  }
  const a = findArticleBySlug(slug);
  if (!a) return pageMetadata({ title: "Not found", noIndex: true });
  return pageMetadata({
    title: a.title,
    description: a.summary,
    path: `/blog/${a.slug}`,
  });
}

export default async function BlogSlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  // ── Category hub ─────────────────────────────────────────────────────────
  if (isCategorySlug(slug)) {
    const category = findCategoryBySlug(slug)!;
    const articles = SEED_BLOG_ARTICLES.filter((a) => a.category === slug);
    return (
      <>
        <Section width="wide" pad="lg" bg="cream-deep">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-teal">
            Pillar hub
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-owl-ink sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-prose text-base text-owl-mist sm:text-lg">
            {category.description}
          </p>
        </Section>
        <Section width="wide" pad="lg" bg="cream">
          <SectionHeader eyebrow="In this hub" title={`Articles tagged ${category.name}`} />
          {articles.length === 0 ? (
            <p className="text-sm text-owl-mist">No articles yet in this hub.</p>
          ) : (
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.slug}>
                  <BlogCard
                    slug={a.slug}
                    title={a.title}
                    summary={a.summary}
                    categoryName={category.name}
                    publishedAt={a.publishedAt}
                    tone={a.tone}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>
        <SectionReveal>
          <NewsletterSection />
        </SectionReveal>
      </>
    );
  }

  // ── Article detail ───────────────────────────────────────────────────────
  const article = findArticleBySlug(slug);
  if (!article) notFound();
  const category = findCategoryBySlug(article.category)!;
  const related = SEED_BLOG_ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  ).slice(0, 3);

  const ld = JSON.stringify(
    articleSchema({
      headline: article.title,
      description: article.summary,
      url: `${siteConfig.url}/blog/${article.slug}`,
      image: `${siteConfig.url}/images/headers/blog-hero.png`,
      datePublished: article.publishedAt,
      authorName: article.author,
    })
  );

  return (
    <>
      <Script
        id={`ld-article-${article.slug}`}
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      <Section width="narrow" pad="lg" bg="cream-deep">
        <Link href={`/blog/${category.slug}`} className="text-xs font-semibold uppercase tracking-[0.2em] text-owl-teal hover:text-owl-teal-deep">
          ← {category.name}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] text-owl-ink sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-owl-mist">{article.summary}</p>
        <p className="mt-6 text-xs text-owl-mist">
          By {article.author} ·{" "}
          {new Date(article.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" })}
        </p>
      </Section>

      <Section width="narrow" pad="lg" bg="cream">
        <article className="prose-owl mx-auto max-w-prose space-y-5 text-base leading-relaxed text-owl-ink/90">
          {article.body.split(". ").map((sentence, i, arr) =>
            i % 3 === 0 ? (
              <p key={i}>{arr.slice(i, i + 3).join(". ") + (arr[i + 2]?.endsWith(".") ? "" : ".")}</p>
            ) : null
          )}
        </article>

        <aside className="mx-auto mt-12 max-w-prose rounded-owl-card border border-owl-cream-deep bg-white p-6 shadow-sm">
          <Chip intent="teal">{category.name}</Chip>
          <p className="mt-3 font-display text-lg font-semibold text-owl-ink">
            Get notes like this in your inbox every Sunday.
          </p>
          <Link
            href="/newsletter"
            className="mt-3 inline-block font-display text-sm font-semibold text-owl-teal hover:text-owl-teal-deep"
          >
            Subscribe to the OWL Weekly →
          </Link>
        </aside>
      </Section>

      {related.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionHeader eyebrow="Keep reading" title={`More in ${category.name}`} />
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <BlogCard
                    slug={a.slug}
                    title={a.title}
                    summary={a.summary}
                    categoryName={category.name}
                    publishedAt={a.publishedAt}
                    tone={a.tone}
                  />
                </li>
              ))}
            </ul>
          </Section>
        </SectionReveal>
      )}

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
