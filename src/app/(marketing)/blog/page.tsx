import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { ContentReveal } from "@/components/marketing/content-reveal";
import { SEED_BLOG_ARTICLES, SEED_BLOG_CATEGORIES } from "@/lib/seed/blog";
import { getPublishedPosts } from "@/lib/content-posts";

export const metadata = pageMetadata({
  title: "Blog & Resources - OWL Sing Together",
  description:
    "Inspiration, encouragement, and practical tips for families who believe in the power of music, play, and learning together.",
  path: "/blog",
});

// Dynamic -- fetches from Supabase on every request, falls back to seed data if unavailable.
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
  // Fetch up to 50 published posts -- ContentReveal handles pagination client-side.
  let posts: PostDisplay[] = [];
  try {
    const dbPosts = await getPublishedPosts("blog", { limit: 50 });
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
    // Supabase unavailable -- fall through to seed data.
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

  const categories = SEED_BLOG_CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <>
      {/* Hero -- no poster so no static image flashes before the video */}
      <VideoHeroBanner
        src="/videos/blog-hero.mp4"
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

      {/* Category filter row */}
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

      {/* Content: featured + grid with See More pagination */}
      <ContentReveal
        items={posts}
        contentType="blog"
        categories={categories}
        featuredEyebrow="Featured Post"
        featuredTitle="Start Here"
        gridEyebrow="Latest Articles"
        gridTitle="Keep Reading"
        gridId="articles"
      />

      {/* Newsletter strip */}
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
