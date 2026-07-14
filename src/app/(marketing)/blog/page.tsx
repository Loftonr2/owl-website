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
import { SEED_BLOG_ARTICLES, SEED_BLOG_CATEGORIES } from "@/lib/seed/blog";
import { getPublishedPosts } from "@/lib/content-posts";
import { getCategoryFallbackImage } from "@/lib/content-images";

export const metadata = pageMetadata({
  title: "Blog & Resources - OWL Sing Together",
  description:
    "Inspiration, encouragement, and practical tips for families who believe in the power of music, play, and learning together.",
  path: "/blog",
});

// Dynamic — fetches from Supabase on every request, falls back to seed data if unavailable.
export const dynamic = "force-dynamic";

const CATEGORY_CHIPS = [
  { value: "homeschooling",      label: "Homeschooling" },
  { value: "parenting-tips",     label: "Parenting Tips" },
  { value: "child-development",  label: "Child Development" },
  { value: "music-and-learning", label: "Music & Learning" },
  { value: "activities",         label: "Activities" },
  { value: "safety-wellness",    label: "Safety & Wellness" },
] as const;

type ToneValue = "teal" | "amber" | "forest" | "rose" | "mist" | "cream";

/** Normalized shape used by both Supabase and seed data paths. */
type PostDisplay = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  body: string | null;
  tone: ToneValue;
  featuredImage: string | null;
};

export default async function BlogPage() {
  // Try Supabase first. getPublishedPosts has internal try/catch so it never throws.
  let posts: PostDisplay[] = [];
  try {
    const dbPosts = await getPublishedPosts("blog", { limit: 7 });
    if (dbPosts.length > 0) {
      posts = dbPosts.map((p) => ({
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
  if (posts.length === 0) {
    posts = SEED_BLOG_ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      summary: a.summary,
      publishedAt: a.publishedAt,
      body: a.body,
      tone: a.tone,
      featuredImage: null,
    }));
  }

  const featured = posts[0] ?? null;
  const rest = posts.slice(1, 7);

  return (
    <>
      {/* Hero */}
      <VideoHeroBanner
        src="/videos/blog-hero.mp4"
        poster="/images/headers/blog-hero.png"
        eyebrow="OWL Blog & Resources"
        heading={
          <>
            Inspiration for{" "}
            <span className="text-owl-amber-soft">Learning and Life</span>{" "}
            Together
          </>
        }
        subhead="Ideas, encouragement, and practical tips to help your family thrive."
        primaryCta={{ label: "Explore Our Blog", href: "#articles" }}
      />

      {/* Category Row */}
      <SectionReveal>
        <Section width="wide" pad="sm" bg="cream">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {CATEGORY_CHIPS.map((c) => (
              <CategoryChip
                key={c.value}
                href={`/blog/${c.value}`}
                label={c.label}
                intent="teal"
              />
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* Featured Post */}
      {featured && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionIntro eyebrow="Featured Post" title="Start Here" />
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr,1fr] items-center">
              {/* Thumbnail */}
              <Link
                href={`/blog/${featured.slug}`}
                className="group block overflow-hidden rounded-owl-card shadow-owl-2 transition-transform duration-300 hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    featured.featuredImage ??
                    getCategoryFallbackImage(featured.category, "blog")
                  }
                  alt={featured.title}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </Link>

              {/* Meta + excerpt */}
              <div className="flex flex-col justify-center">
                {(() => {
                  const cat = SEED_BLOG_CATEGORIES.find(
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
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-owl-mist">
                  <span>
                    {new Date(featured.publishedAt).toLocaleDateString(
                      "en-US",
                      { dateStyle: "long" }
                    )}
                  </span>
                  {featured.body && (
                    <>
                      <span aria-hidden>&middot;</span>
                      <span>{estimateReadTime(featured.body)} min read</span>
                    </>
                  )}
                </div>
                <div className="mt-5">
                  <Button intent="primary" size="sm" asChild>
                    <Link href={`/blog/${featured.slug}`}>
                      Read Article &rarr;
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </SectionReveal>
      )}

      {/* Latest Articles Grid */}
      {rest.length > 0 && (
        <SectionReveal>
          <Section id="articles" width="wide" pad="lg" bg="cream">
            <SectionIntro eyebrow="Latest Articles" title="Keep Reading" />
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {rest.map((a) => {
                const cat = SEED_BLOG_CATEGORIES.find(
                  (c) => c.slug === a.category
                );
                return (
                  <li key={a.slug}>
                    <BlogCard
                      slug={a.slug}
                      title={a.title}
                      summary={a.summary}
                      categoryName={cat?.name ?? a.category}
                      category={a.category}
                      publishedAt={a.publishedAt}
                      tone={a.tone}
                      featuredImage={
                        a.featuredImage ??
                        getCategoryFallbackImage(a.category, "blog")
                      }
                      readTime={estimateReadTime(a.body ?? "")}
                    />
                  </li>
                );
              })}
            </ul>
          </Section>
        </SectionReveal>
      )}

      {/* Newsletter Strip */}
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
                The OWL Weekly - free, every Sunday.
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
