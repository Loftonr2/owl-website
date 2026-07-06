import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
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
  SEED_NEWS_CATEGORIES,
  findNewsCategoryBySlug,
  isNewsCategorySlug,
  findNewsArticleBySlug,
} from "@/lib/seed/news";
import { getCategoryFallbackImage } from "@/lib/content-images";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return SEED_NEWS_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  if (isNewsCategorySlug(slug)) {
    const c = findNewsCategoryBySlug(slug)!;
    return pageMetadata({
      title: `${c.name} - OWL News`,
      description: c.description,
      path: `/news/${c.slug}`,
    });
  }

  const article = await getPublishedPostBySlug("news", slug);
  if (!article) {
    const seed = findNewsArticleBySlug(slug);
    if (seed) {
      return pageMetadata({
        title: seed.title,
        description: seed.excerpt,
        path: `/news/${seed.slug}`,
      });
    }
    return pageMetadata({ title: "Not found", noIndex: true });
  }
  return pageMetadata({
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.excerpt ?? "",
    path: `/news/${article.slug}`,
  });
}

export default async function NewsSlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  /* Category Hub */
  if (isNewsCategorySlug(slug)) {
    const category = findNewsCategoryBySlug(slug)!;
    const articles = await getPublishedPosts("news", { category: slug, limit: 12 });

    return (
      <>
        <Section width="wide" pad="lg" bg="cream-deep">
          <Link
            href="/news"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-owl-teal hover:text-owl-teal-deep"
          >
            &larr; Back to News
          </Link>
          <p className="mt-4 font-display text-xs uppercase tracking-[0.2em] text-owl-teal">
            News Category
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-owl-ink sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-prose text-base text-owl-mist sm:text-lg">
            {category.description}
          </p>
        </Section>

        <Section width="wide" pad="lg" bg="cream">
          {articles.length === 0 ? (
            <div className="rounded-owl-card border border-dashed border-owl-teal/30 bg-white/60 p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-owl-teal/10">
                <Newspaper className="h-6 w-6 text-owl-teal" aria-hidden />
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-owl-ink">
                No {category.name} stories yet
              </p>
              <p className="mt-1 text-sm text-owl-mist">
                New OWL updates are coming soon. Subscribe to be the first to know.
              </p>
              <Link
                href="/newsletter"
                className="mt-4 inline-block text-sm font-semibold text-owl-teal hover:text-owl-teal-deep"
              >
                Subscribe to OWL Weekly &rarr;
              </Link>
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
                    contentType="news"
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
  const dbArticle = await getPublishedPostBySlug("news", slug);
  const seedArticle = dbArticle ? null : findNewsArticleBySlug(slug);

  if (!dbArticle && !seedArticle) notFound();

  const article = dbArticle ?? {
    slug: seedArticle!.slug,
    title: seedArticle!.title,
    excerpt: seedArticle!.excerpt,
    body: seedArticle!.body,
    author: seedArticle!.author,
    category: seedArticle!.category,
    featured_image: null as string | null,
    seo_title: null as string | null,
    seo_description: null as string | null,
    publish_date: seedArticle!.publishedAt,
    created_at: seedArticle!.publishedAt,
  };

  const category = findNewsCategoryBySlug(article.category) ?? {
    slug: article.category,
    name: article.category,
    description: "",
  };

  const related = await getPublishedPosts("news", { category: article.category, limit: 4 });
  const relatedFiltered = related.filter((a) => a.slug !== article.slug).slice(0, 3);
  const readTime = estimateReadTime(article.body);

  const heroImage =
    article.featured_image ??
    getCategoryFallbackImage(article.category, "news");

  const ld = JSON.stringify(
    articleSchema({
      headline: article.title,
      description: article.excerpt ?? "",
      url: `${siteConfig.url}/news/${article.slug}`,
      image: heroImage,
      datePublished: article.publish_date ?? article.created_at,
      authorName: article.author,
    })
  );

  return (
    <>
      <Script
        id={`ld-news-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      <Section width="narrow" pad="lg" bg="cream-deep">
        <Link
          href="/news"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-owl-teal hover:text-owl-teal-deep"
        >
          &larr; Back to News
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip intent="teal">{category.name}</Chip>
          {readTime > 0 && (
            <span className="rounded-full bg-owl-cream-deep px-3 py-0.5 text-xs font-medium text-owl-mist">
              {readTime} min read
            </span>
          )}
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] text-owl-ink sm:text-5xl">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-owl-mist">{article.excerpt}</p>
        )}

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

      <Section width="narrow" pad="lg" bg="cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={article.title}
          className="mb-8 w-full rounded-owl-card object-cover shadow-owl-2"
        />

        <article className="prose-owl mx-auto max-w-prose space-y-5 text-base leading-relaxed text-owl-ink/90">
          {(article.body ?? "").split("\n\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        <aside className="mx-auto mt-12 max-w-prose rounded-owl-card border border-owl-cream-deep bg-white p-6 shadow-sm">
          <Chip intent="teal">{category.name}</Chip>
          <p className="mt-3 font-display text-lg font-semibold text-owl-ink">
            Don&apos;t miss OWL updates - subscribe to the weekly newsletter.
          </p>
          <Link
            href="/newsletter"
            className="mt-2 inline-block font-display text-sm font-semibold text-owl-teal hover:text-owl-teal-deep"
          >
            Subscribe to the OWL Weekly &rarr;
          </Link>
        </aside>
      </Section>

      {relatedFiltered.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionHeader eyebrow="More stories" title={`More ${category.name}`} />
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
                    contentType="news"
                  />
                </li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              <Link
                href="/news"
                className="text-sm font-semibold text-owl-teal hover:text-owl-teal-deep"
              >
                &larr; Back to News
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
