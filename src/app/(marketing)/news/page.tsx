import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { ContentReveal } from "@/components/marketing/content-reveal";
import {
  SEED_NEWS_ARTICLES,
  SEED_NEWS_CATEGORIES,
} from "@/lib/seed/news";
import { getPublishedPosts } from "@/lib/content-posts";

export const metadata = pageMetadata({
  title: "News - OWL Sing Together",
  description:
    "Updates, stories, and resources for families who believe in the power of music, play, and togetherness.",
  path: "/news",
});

// Dynamic -- fetches from Supabase on every request, falls back to seed data if unavailable.
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
  // Fetch up to 50 published articles -- ContentReveal handles pagination client-side.
  let articles: NewsDisplay[] = [];
  try {
    const dbPosts = await getPublishedPosts("news", { limit: 50 });
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
    // Supabase unavailable -- fall through to seed data.
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

  const categories = SEED_NEWS_CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <>
      {/* Hero -- no poster so no static image flashes before the video */}
      <VideoHeroBanner
        src="/videos/news-hero.mp4"
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

      {/* Category filter row */}
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

      {/* Content: featured + grid with See More pagination */}
      <ContentReveal
        items={articles}
        contentType="news"
        categories={categories}
        featuredEyebrow="Featured Story"
        featuredTitle="Latest from OWL"
        gridEyebrow="More News"
        gridTitle="Stay in the Loop"
        gridId="news"
      />

      {/* Newsletter panel */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <div className="rounded-owl-hero bg-owl-teal p-8 text-center sm:p-10 md:flex md:items-center md:justify-between md:text-left">
            <div className="text-white">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-owl-amber-soft">
                Don't Miss Out!
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
