import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { BlogCard, estimateReadTime } from "@/components/marketing/blog-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site-config";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
} from "@/lib/content-posts";
import {
  SEED_BLOG_CATEGORIES,
  findCategoryBySlug,
  isCategorySlug,
} from "@/lib/seed/blog";

// force-dynamic: this route calls Supabase (cookies-based) at render time.
// generateStaticParams must NOT call Supabase — seed categories only.
export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  // No Supabase calls at build time — seed category slugs only.
  // Individual article routes are rendered on demand (force-dynamic).
  return SEED_BLOG_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  if (isCategorySlug(slug)) {
    const c = findCategoryBySlug(slug)!;
    return pageMetadata({
      title: `${c.name} - OWL Blog`,
      description: c.description,
      path: `/blog/${c.slug}`,
    });
  }

  const article = await getPublishedPostBySlug("blog", slug);
  if (!article) return pageMetadata({ title: "Not found", noIndex: true });
  return pageMetadata({
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.excerpt ?? "",
    path: `/blog/${article.slug}`,
  });
}

export default async function BlogSlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  /* Category Hub */
  if (isCategorySlug(slug)) {
    const category = findCategoryBySlug(slug)!;
    const articles = await getPublishedPosts("blog", { category: slug, limit: 12 });

    return (
      <>
        {/* Hub hero */}
        <Section width="wide" pad="lg" bg="cream-deep">
          <Link
            href="/blog"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-owl-teal hover:text-owl-teal-deep"
          >
            &larr; Back to Blog
          </Link>
          <p className="mt-4 font-display text-xs uppercase tracking-[0.2em] text-owl-teal">
            Category
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-owl-ink sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-prose text-base text-owl-mist sm:text-lg">
            {category.description}
          </p>
        </Section>

        {/* Article grid */}
        <Section width="wide" pad="lg" bg="cream">
          {articles.length === 0 ? (
            <div className="rounded-owl-card border border-dashed border-owl-teal/30 bg-white/60 p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-owl-teal/10">
                <BookOpen className="h-6 w-6 text-owl-teal" aria-hidden />
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-owl-ink">
                No articles yet in {category.name}
              </p>
              <p className="mt-1 text-sm text-owl-mist">More coming soon - check back shortly!</p>
            </div>
          ) : (
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.slug}>
                  <BlogCard
                    slug={a.slug}
                    title={a.title}
                    summary={a.excerpt ?? ""}
                    categoryName={category.name}
                    category={a.category}
                    publishedAt={a.publish_date ?? a.created_at}
                    tone="teal"
                    featuredImage={a.featured_image}
                    readTime={estimateReadTime(a.body)}
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

  /* Article Detail */
  const article = await getPublishedPostBySlug("blog", slug);
  if (!article) notFound();

  const category = findCategoryBySlug(article.category) ?? {
    slug: article.category,
    name: article.category,
    description: "",
    hero: "",
  };

  const related = await getPublishedPosts("blog", { category: article.category, limit: 4 });
  const relatedFiltered = related.filter((a) => a.slug !== article.slug).slice(0, 3);
  const readTime = estimateReadTime(article.body);

  const ld = JSON.stringify(
    articleSchema({
      headline: article.title,
      description: article.excerpt ?? article.seo_description ?? "",
      url: `${siteConfig.url}/blog/${article.slug}`,
      image: article.featured_image ?? `${siteConfig.url}/images/headers/blog-hero.png`,
      datePublished: article.publish_date ?? article.created_at,
      authorName: article.author,
    })
  );

  return (
    <>
      <Script
        id={`ld-article-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      {/* Article Header */}
      <Section width="narrow" pad="lg" bg="cream-deep">
        {/* Back link */}
        <Link
          href={`/blog/${category.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-owl-teal hover:text-owl-teal-deep"
        >
          &larr; {category.name}
        </Link>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip intent="teal">{category.name}</Chip>
          {readTime > 0 && (
            <span className="rounded-full bg-owl-cream-deep px-3 py-0.5 text-xs font-medium text-owl-mist">
              {readTime} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] text-owl-ink sm:text-5xl">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-owl-mist">{article.excerpt}</p>
        )}

        {/* Author + date */}
        <p className="mt-5 text-xs text-owl-mist">
          By <span className="font-semibold text-owl-ink">{article.author}</span>
          {article.publish_date && (
            <>
              {" "}
              &middot;{" "}
              {new Date(article.publish_date).toLocaleDateString("en-US", { dateStyle: "long" })}
            </>
          )}
        </p>
      </Section>

      {/* Article Body */}
      <Section width="narrow" pad="lg" bg="cream">
        {/* Featured image */}
        {article.featured_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featured_image}
            alt={article.title}
            className="mb-8 w-full rounded-owl-card object-cover shadow-owl-2"
          />
        )}

        <article className="prose-owl mx-auto max-w-prose space-y-5 text-base leading-relaxed text-owl-ink/90">
          {(article.body ?? "").split("\n\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Inline newsletter nudge */}
        <aside className="mx-auto mt-12 max-w-prose rounded-owl-card border border-owl-cream-deep bg-white p-6 shadow-sm">
          <Chip intent="teal">{category.name}</Chip>
          <p className="mt-3 font-display text-lg font-semibold text-owl-ink">
            Get ideas like this every Sunday &mdash; free.
          </p>
          <Link
            href="/newsletter"
            className="mt-2 inline-block font-display text-sm font-semibold text-owl-teal hover:text-owl-teal-deep"
          >
            Subscribe to the OWL Weekly &rarr;
          </Link>
        </aside>
      </Section>

      {/* Related Articles */}
      {relatedFiltered.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionHeader eyebrow="Keep reading" title={`More in ${category.name}`} />
            <ul role="list" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedFiltered.map((a) => (
                <li key={a.slug}>
                  <BlogCard
                    slug={a.slug}
                    title={a.title}
                    summary={a.excerpt ?? ""}
                    categoryName={category.name}
                    category={a.category}
                    publishedAt={a.publish_date ?? a.created_at}
                    tone="teal"
                    featuredImage={a.featured_image}
                    readTime={estimateReadTime(a.body)}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              <Link
                href="/blog"
                className="text-sm font-semibold text-owl-teal hover:text-owl-teal-deep"
              >
                &larr; Back to Blog
              </Link>
            </div>
          </Section>
        </SectionReveal>
      )}

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
