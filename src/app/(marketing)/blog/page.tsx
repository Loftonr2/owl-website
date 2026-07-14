import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { NewsHeroBanner } from "@/components/marketing/news-hero-banner";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import {
  BlogPageClient,
  type BlogArticleItem,
} from "@/components/marketing/blog-page-client";
import { SEED_BLOG_ARTICLES } from "@/lib/seed/blog";
import { getPublishedPosts } from "@/lib/content-posts";

export const metadata = pageMetadata({
  title: "Blog & Resources - OWL Sing Together",
  description:
    "Parenting tips, inspiration, and real-life support for families who believe in the power of music, play, and learning together.",
  path: "/blog",
});

// Dynamic -- fetches from Supabase on every request, falls back to seed data.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  // Fetch up to 50 published blog posts -- BlogPageClient handles pagination.
  let articles: BlogArticleItem[] = [];

  try {
    const dbPosts = await getPublishedPosts("blog", { limit: 50 });
    if (dbPosts.length > 0) {
      articles = dbPosts.map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        publishedAt: p.publish_date ?? p.created_at,
        featuredImage: p.featured_image,
        excerpt: p.excerpt ?? undefined,
      }));
    }
  } catch {
    // Supabase unavailable -- fall through to seed data.
  }

  // Seed fallback when Supabase returns nothing.
  if (articles.length === 0) {
    articles = SEED_BLOG_ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      publishedAt: a.publishedAt,
      featuredImage: null,
      excerpt: a.summary,
    }));
  }

  return (
    <>
      {/* ── Cinematic overlay hero (blog variant) ── */}
      <NewsHeroBanner
        src="/videos/blog-hero.mp4"
        title="Parenting Tips, Inspiration & Real-Life Support"
        subtitle="Encouraging your journey, every step of the way."
        ctaLabel="Explore Articles"
        ctaHref="#blog"
      />

      {/* ── Blog article grid + Browse Topics (client, paginated) ── */}
      <BlogPageClient articles={articles} />

      {/* ── Newsletter strip ── */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <div className="rounded-owl-hero bg-owl-teal p-8 text-center sm:p-10 md:flex md:items-center md:justify-between md:text-left">
            <div className="text-white">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-owl-amber-soft">
                Stay Inspired
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
                Get weekly encouragement and ideas!
              </h2>
              <p className="mt-1 text-sm text-white/80">
                The OWL Weekly &mdash; free, every Sunday.
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
