import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { NewsHeroBanner } from "@/components/marketing/news-hero-banner";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import {
  NewsPageClient,
  type NewsArticleItem,
} from "@/components/marketing/news-page-client";
import { SEED_NEWS_ARTICLES } from "@/lib/seed/news";
import { getPublishedPosts } from "@/lib/content-posts";

export const metadata = pageMetadata({
  title: "News - OWL Sing Together",
  description:
    "Updates, stories, and resources for families who believe in the power of music, play, and togetherness.",
  path: "/news",
});

// Dynamic -- fetches from Supabase on every request, falls back to seed data.
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  // Fetch up to 50 published news articles (NewsPageClient handles pagination).
  let articles: NewsArticleItem[] = [];

  try {
    const dbPosts = await getPublishedPosts("news", { limit: 50 });
    if (dbPosts.length > 0) {
      articles = dbPosts.map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        publishedAt: p.publish_date ?? p.created_at,
        featuredImage: p.featured_image,
      }));
    }
  } catch {
    // Supabase unavailable -- fall through to seed data.
  }

  // Seed fallback when Supabase returns nothing.
  if (articles.length === 0) {
    articles = SEED_NEWS_ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      publishedAt: a.publishedAt,
      featuredImage: null,
    }));
  }

  return (
    <>
      {/* ── Cinematic overlay hero ── */}
      <NewsHeroBanner
        src="/videos/news-hero.mp4"
        poster="/images/heroes/news-hero-poster.webp"
        title="News & Updates"
        subtitle="Updates, stories, and resources for families who believe in the power of music, play, and togetherness."
        ctaLabel="Stay Informed"
        ctaHref="#news"
      />

      {/* ── Latest News grid + Browse Popular Topics (client, paginated) ── */}
      <NewsPageClient articles={articles} />

      {/* ── Newsletter strip ── */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <div className="rounded-owl-hero bg-owl-teal p-8 text-center sm:p-10 md:flex md:items-center md:justify-between md:text-left">
            <div className="text-white">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-owl-amber-soft">
                Don&rsquo;t Miss Out!
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
                Be first to hear OWL news
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Weekly updates, events, and community stories &mdash; always free.
              </p>
            </div>
            <Button
              intent="inverted"
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
