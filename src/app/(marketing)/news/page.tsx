import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { BlogCard, estimateReadTime } from "@/components/marketing/blog-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import {
  SEED_NEWS_ARTICLES,
  SEED_NEWS_CATEGORIES,
} from "@/lib/seed/news";
import { getPublishedPosts } from "@/lib/content-posts";
import { getCategoryFallbackImage } from "@/lib/content-images";

export const metadata = pageMetadata({
  title: "News - OWL Sing Together",
  description:
    "Updates, stories, and resources for families who believe in the power of music, play, and togetherness.",
  path: "/news",
});

// Dynamic — fetches from Supabase on every request, falls back to seed data if unavailable.
export const dynamic = "force-dynamic";

const CATEGORY_CHIPS = [
  { value: "all",           label: "All News",      href: "/news" },
  { value: "announcements", label: "Announcements",  href: "/news/announcements" },
  { value: "events",        label: "Events",         href: "/news/events" },
  { value: "resources",     label: "Resources",      href: "/news/resources" },
  { value: "community",     label: "Community",      href: "/news/community" },
  { value: "press",         label: "Press",          href: "/news/press" },
] as const;

type ToneValue = "teal" | "amber" | "forest" | "rose" | "mist" | "cream";

/** Normalized shape used by both Supabase and seed data paths. */
type NewsDisplay = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  body: string | null;
  tone: ToneValue;
  featuredImage: string | null;
};

export default async function NewsPage() {
  // Try Supabase first. getPublishedPosts has internal try/catch so it never throws.
  let articles: NewsDisplay[] = [];
  try {
    const dbPosts = await getPublishedPosts("news", { limit: 7 });
    if (dbPosts.length > 0) {
      articles = dbPosts.map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        summary: p.excerpt ?? "",
        publishedAt: p.publish_date ?? p.created_at,
        body: p.body,
        tone: "teal" as ToneValue,
        featuredImage: p.featured_image,
      }));
    }
  } catch {
    // Supabase unavailable — fall through to seed data.
  }

  // Fall back to seed data when Supabase returns nothing.
  if (articles.length === 0) {
    articles = SEED_NEWS_ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      summary: a.excerpt,
      publishedAt: a.publishedAt,
      body: a.body,
      tone: a.tone,
      featuredImage: null,
    }));
  }

  const featured = articles[0] ?? null;
  const rest = articles.slice(1, 7);

  return (
    <>
      {/* Hero */}
      <VideoHeroBanner
        src="/videos/news-hero.mp4"
        poster="/images/headers/newsletter-hero.png"
        eyebrow="OWL News"
        heading={
          <>
            News That{" "}
            <span className="text-owl-amber-soft">Inspires Learning</span>{" "}
            &amp; Connection
          </>
        }
        subhead="Updates, stories, and resources for families who believe in the power of music, play, and togetherness."
        primaryCta={{ label: "Explore Latest News", href: "#news" }}
      />

      {/* Category Row */}
      <SectionReveal>
        <Section width="wide" pad="sm" bg="cream">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {CATEGORY_CHIPS.map((c) => (
              <CategoryChip
                key={c.value}
                href={c.href}
                label={c.label}
                intent="teal"
                active={c.value === "all"}
              />
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* Featured Story */}
      {featured && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionIntro eyebrow="Featured Story" title="Latest from OWL" />
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr,1fr] items-center">
              {/* Thumbnail */}
              <Link
                href={`/news/${featured.slug}`}
                className="group block overflow-hidden rounded-owl-card shadow-owl-2 transition-transform duration-300 hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    featured.featuredImage ??
                    getCategoryFallbackImage(featured.category, "news")
                  }
                  alt={featured.title}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </Link>

              {/* Meta */}
              <div className="flex flex-col justify-center">
                {(() => {
                  const cat = SEED_NEWS_CATEGORIES.find(
                    (c) => c.slug === featured.category
                  );
                  return (
                    <span className="inline-flex w-fit items-center rounded-full bg-owl-teal/10 px-3 py-0.5 text-xs font-semibold text-owl-teal">
                      {cat?.name ?? featured.category}
                    </span>
                  );
                })()}
                <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-owl-ink sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-owl-ink/75 line-clamp-4">
                  {featured.summary}
                </p>
                <p className="mt-2 text-xs text-owl-mist">
                  {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                    dateStyle: "long",
                  })}
                </p>
                <div className="mt-5">
                  <Button intent="primary" size="sm" asChild>
                    <Link href={`/news/${featured.slug}`}>
                      Read Story &rarr;
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </SectionReveal>
      )}

      {/* More News Grid */}
      {rest.length > 0 && (
        <SectionReveal>
          <Section id="news" width="wide" pad="lg" bg="cream">
            <SectionIntro eyebrow="More News" title="Stay in the Loop" />
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {rest.map((article) => {
                const cat = SEED_NEWS_CATEGORIES.find(
                  (c) => c.slug === article.category
                );
                return (
                  <li key={article.slug}>
                    <BlogCard
                      slug={article.slug}
                      title={article.title}
                      summary={article.summary}
                      categoryName={cat?.name ?? article.category}
                      category={article.category}
                      publishedAt={article.publishedAt}
                      tone={article.tone}
                      featuredImage={
                        article.featuredImage ??
                        getCategoryFallbackImage(article.category, "news")
                      }
                      readTime={estimateReadTime(article.body ?? "")}
                      contentType="news"
                    />
                  </li>
                );
              })}
            </ul>
          </Section>
        </SectionReveal>
      )}

      {/* Newsletter Panel */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <div className="rounded-owl-hero bg-owl-teal p-8 text-center sm:p-10 md:flex md:items-center md:justify-between md:text-left">
            <div className="text-white">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-owl-amber-soft">
                Don&apos;t Miss Out!
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
                Be first to hear OWL news
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Weekly updates, events, and community stories - always free.
              </p>
            </div>
            <Button
              intent="secondary"
              size="lg"
              asChild
              className="mt-5 shrink-0 md:mt-0 md:ml-8"
            >
              <Link href="/newsletter">Subscribe Free &rarr;</Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
