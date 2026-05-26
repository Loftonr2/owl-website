import Link from "next/link";
import { Download } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { BlogCard } from "@/components/marketing/blog-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { SEED_BLOG_ARTICLES, SEED_BLOG_CATEGORIES } from "@/lib/seed/blog";

export const metadata = pageMetadata({
  title: "Blog & Resources — OWL Sing Together",
  description:
    "Multicultural early-learning articles, gift guides, and SEL tools — written by Larissa.",
  path: "/blog",
});

/**
 * /blog — v3 (Wireframe-matched redesign).
 *
 * Sections:
 *   1. Blog Search Bar + Larissa & Owl Hero Banner (library setting)
 *   2. Topic Filter Chips (Holidays, Feelings, Alphabet, Numbers, Classroom, Music, Printables)
 *   3. Featured Article Section
 *   4. Article Card Grid
 *   5. Free Printable CTA Module
 *   6. Featured Educator Resource
 *   7. Seasonal Highlights
 *   8. Newsletter Signup Band
 */

const TOPIC_CHIPS = [
  { value: "cultural-holidays", label: "Holidays" },
  { value: "sel-for-kids", label: "Feelings" },
  { value: "early-learning", label: "Alphabet" },
  { value: "early-learning-numbers", label: "Numbers" },
  { value: "educator-resources", label: "Classroom" },
  { value: "music-child-development", label: "Music" },
  { value: "educational-gifts", label: "Printables" },
];

const SEASONAL_HIGHLIGHTS = [
  { label: "Planting Songs", tone: "teal" as const },
  { label: "Easter Crafts", tone: "rose" as const },
  { label: "Easter Crofts", tone: "amber" as const },
];

export default function BlogPage() {
  const featured = SEED_BLOG_ARTICLES[0];
  const rest = SEED_BLOG_ARTICLES.slice(1, 7);
  const featuredEdResource = SEED_BLOG_ARTICLES.find((a) => a.category === "educator-resources");
  const seasonal = SEED_BLOG_ARTICLES.filter((a) => a.category === "cultural-holidays").slice(0, 3);

  return (
    <>
      {/* Hero */}
      <VideoHeroBanner
        src="/videos/blog-hero.mp4"
        poster="/images/headers/blog-hero.png"
        eyebrow="Blog & Resources"
        heading={
          <>Resources for{" "}<span className="text-owl-teal">Learning Together</span></>
        }
        subhead="Articles, guides, and seasonal content for parents, educators, and curious families."
        primaryCta={{ label: "Browse Articles", href: "#articles" }}
        secondaryCta={{ label: "Free Printables", href: "/printables" }}
      />

      {/* 2 — Topic Filter Chips */}
      <SectionReveal>
        <Section width="wide" pad="sm" bg="cream">
          <div className="flex flex-wrap justify-center gap-2">
            {TOPIC_CHIPS.map((t) => (
              <CategoryChip
                key={t.value}
                href={`/blog?topic=${t.value}`}
                label={t.label}
                intent="teal"
              />
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Featured Article */}
      {featured && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.3fr,1fr]">
              {/* Feature image placeholder */}
              <Link
                href={`/blog/${featured.slug}`}
                className="group block overflow-hidden rounded-owl-card shadow-owl-2 transition-transform duration-300 ease-owl hover:-translate-y-0.5"
              >
                <div className="flex aspect-[16/10] items-center justify-center bg-owl-amber-soft/50 text-owl-ink/30">
                  <span className="font-display text-7xl font-extrabold opacity-30">
                    {featured.title.charAt(0)}
                  </span>
                </div>
              </Link>
              {/* Featured article text */}
              <div className="flex flex-col justify-center">
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                  Featured Article with Foxing
                </p>
                <p className="mt-1 text-xs text-owl-mist">
                  Jan 1, 2035 · by Author
                </p>
                <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-owl-ink sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-owl-ink/75">
                  {featured.summary}
                </p>
                <div className="mt-5 flex gap-3">
                  <Button intent="primary" size="sm" asChild>
                    <Link href="/printables">
                      <Download className="h-3.5 w-3.5 mr-1" aria-hidden />
                      Download Now
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Free resource side card */}
              <div className="hidden md:flex flex-col justify-center items-start rounded-owl-card bg-owl-teal p-5 shadow-owl-2 col-start-2 row-start-2 row-span-1">
                <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-amber-soft">
                  Get Your Free Resource
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-white">
                  Seasonal Printable Worksheets
                </h3>
                <Button intent="primary" size="sm" asChild className="mt-3">
                  <Link href="/printables">Download free</Link>
                </Button>
              </div>
            </div>
          </Section>
        </SectionReveal>
      )}

      {/* 4 — Article Card Grid */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="More from the blog"
            title="Recent Articles"
          />
          <ul
            role="list"
            className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {rest.map((a) => {
              const cat = SEED_BLOG_CATEGORIES.find((c) => c.slug === a.category);
              return (
                <li key={a.slug}>
                  <BlogCard
                    slug={a.slug}
                    title={a.title}
                    summary={a.summary}
                    categoryName={cat?.name ?? a.category}
                    publishedAt={a.publishedAt}
                    tone={a.tone}
                  />
                </li>
              );
            })}
          </ul>
        </Section>
      </SectionReveal>

      {/* 5 — Free Printable CTA Module */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <div className="flex flex-col items-center gap-4 rounded-owl-hero bg-owl-teal p-8 text-center md:flex-row md:gap-8 md:text-left">
            <div className="flex-1 text-white">
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-amber-soft">
                Free resource
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold">
                Got Your Free Resource
              </h2>
              <p className="mt-1 text-white/85 text-sm">Download free</p>
            </div>
            <Button intent="secondary" size="lg" asChild>
              <Link href="/printables">
                <Download className="h-4 w-4 mr-1.5" aria-hidden />
                Download Now
              </Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      {/* 6 — Featured Educator Resource */}
      {featuredEdResource && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="cream-deep">
            <SectionIntro
              eyebrow="For educators"
              title="Featured Educator Resource"
              subtitle="Lesson Plan of the Month — classroom-ready, standards-aligned."
            />
            <div className="mt-8 max-w-xl">
              <BlogCard
                slug={featuredEdResource.slug}
                title={featuredEdResource.title}
                summary={featuredEdResource.summary}
                categoryName="Educator Resource"
                publishedAt={featuredEdResource.publishedAt}
                tone={featuredEdResource.tone}
              />
            </div>
          </Section>
        </SectionReveal>
      )}

      {/* 7 — Seasonal Highlights */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Seasonal"
            title="Seasonal Highlights"
            subtitle="Spring favorites, cultural crafts, and holiday resources — updated monthly."
          />
          <div className="mt-6 flex flex-wrap gap-4">
            {SEASONAL_HIGHLIGHTS.map(({ label, tone }) => (
              <div
                key={label}
                className={`rounded-owl-card px-5 py-3 font-display text-sm font-semibold shadow-owl-1 ${
                  tone === "teal"
                    ? "bg-owl-teal/10 text-owl-teal"
                    : tone === "rose"
                      ? "bg-owl-rose/15 text-owl-rose"
                      : "bg-owl-amber-soft/50 text-owl-amber"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          {seasonal.length > 0 && (
            <ul role="list" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {seasonal.map((a) => (
                <li key={a.slug}>
                  <BlogCard
                    slug={a.slug}
                    title={a.title}
                    summary={a.summary}
                    categoryName="Cultural Holidays"
                    publishedAt={a.publishedAt}
                    tone={a.tone}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </SectionReveal>

      {/* 8 — Newsletter Signup Band */}
      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
