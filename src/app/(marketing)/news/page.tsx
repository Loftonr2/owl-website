import Link from "next/link";
import {
  Newspaper,
  Megaphone,
  CalendarDays,
  BookOpen,
  Users,
  FileText,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { BlogCard, estimateReadTime } from "@/components/marketing/blog-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { getPublishedPosts } from "@/lib/content-posts";
import {
  SEED_NEWS_CATEGORIES,
  SEED_NEWS_ARTICLES,
} from "@/lib/seed/news";
import { getCategoryFallbackImage } from "@/lib/content-images";

export const metadata = pageMetadata({
  title: "News - OWL Sing Together",
  description:
    "Updates, stories, and resources for families who believe in the power of music, play, and togetherness.",
  path: "/news",
});

export const revalidate = 3600;

const CATEGORY_CHIPS = [
  { value: "all",           label: "All News",      Icon: Newspaper,    href: "/news" },
  { value: "announcements", label: "Announcements",  Icon: Megaphone,    href: "/news/announcements" },
  { value: "events",        label: "Events",         Icon: CalendarDays, href: "/news/events" },
  { value: "resources",     label: "Resources",      Icon: BookOpen,     href: "/news/resources" },
  { value: "community",     label: "Community",      Icon: Users,        href: "/news/community" },
  { value: "press",         label: "Press",          Icon: FileText,     href: "/news/press" },
] as const;

// Minimal shape that satisfies the BlogCard props sourced from seed data.
type SeedPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  featured_image: string | null;
  publish_date: string | null;
  created_at: string;
  body: string | null;
};

function seedArticlesToPosts(): SeedPost[] {
  return SEED_NEWS_ARTICLES.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    featured_image: null,
    publish_date: a.publishedAt,
    created_at: a.publishedAt,
    body: a.body,
  }));
}

export default async function NewsPage() {
  const dbNews = await getPublishedPosts("news", { limit: 10 });

  // Fall back to seed articles when Supabase returns no published news.
  const allNews = dbNews.length > 0 ? dbNews : seedArticlesToPosts();

  const featured = allNews[0] ?? null;
  const rest = allNews.slice(1, 7);

  return (
    <>
      {/* Hero */}
      <VideoHeroBanner
        src="/videos/blog-hero.mp4"
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
                icon={c.Icon}
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
                  src={featured.featured_image ?? getCategoryFallbackImage(featured.category, "news")}
                  alt={featured.title}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </Link>

              {/* Meta */}
              <div className="flex flex-col justify-center">
                {(() => {
                  const cat = SEED_NEWS_CATEGORIES.find((c) => c.slug === featured.category);
                  return (
                    <span className="inline-flex w-fit items-center rounded-full bg-owl-teal/10 px-3 py-0.5 text-xs font-semibold text-owl-teal">
                      {cat?.name ?? featured.category}
                    </span>
                  );
                })()}
                <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-owl-ink sm:text-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 text-sm leading-relaxed text-owl-ink/75 line-clamp-4">
                    {featured.excerpt}
                  </p>
                )}
                <p className="mt-2 text-xs text-owl-mist">
                  {featured.publish_date &&
                    new Date(featured.publish_date).toLocaleDateString("en-US", {
                      dateStyle: "long",
                    })}
                </p>
                <div className="mt-5">
                  <Button intent="primary" size="sm" asChild>
                    <Link href={`/news/${featured.slug}`}>Read Story &rarr;</Link>
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
                const cat = SEED_NEWS_CATEGORIES.find((c) => c.slug === article.category);
                return (
                  <li key={article.slug}>
                    <BlogCard
                      slug={article.slug}
                      title={article.title}
                      summary={article.excerpt ?? ""}
                      categoryName={cat?.name ?? article.category}
                      category={article.category}
                      publishedAt={article.publish_date ?? article.created_at}
                      tone="teal"
                      featuredImage={article.featured_image}
                      readTime={estimateReadTime(article.body)}
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
            <Button intent="secondary" size="lg" asChild className="mt-5 shrink-0 md:mt-0 md:ml-8">
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
