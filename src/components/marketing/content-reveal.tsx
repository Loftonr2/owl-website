"use client";

/**
 * ContentReveal
 * Shared client component for Blog and News listing pages.
 *
 * Displays a featured item (large layout) + a responsive grid of cards.
 * Initially shows PAGE_SIZE items total (1 featured + PAGE_SIZE-1 in the grid).
 * "See More" button reveals the next PAGE_SIZE items per click.
 * The button disappears once all items are visible.
 *
 * All data is passed as props from the server page -- no Supabase calls here.
 */

import { useState } from "react";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { BlogCard, estimateReadTime } from "@/components/marketing/blog-card";
import { getCategoryFallbackImage } from "@/lib/content-images";

const PAGE_SIZE = 10;

export type ContentItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  body: string | null;
  tone: "teal" | "amber" | "forest" | "rose" | "mist" | "cream";
  featuredImage: string | null;
};

export type CategoryEntry = { slug: string; name: string };

export interface ContentRevealProps {
  /** All published items, newest-first. Passed from the server page. */
  items: ContentItem[];
  contentType: "blog" | "news";
  categories: CategoryEntry[];
  featuredEyebrow: string;
  featuredTitle: string;
  gridEyebrow: string;
  gridTitle: string;
  /** HTML id applied to the grid section -- used by the hero CTA anchor. */
  gridId: string;
}

export function ContentReveal({
  items,
  contentType,
  categories,
  featuredEyebrow,
  featuredTitle,
  gridEyebrow,
  gridTitle,
  gridId,
}: ContentRevealProps) {
  // visibleCount = max number of items visible (featured counts as 1).
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (items.length === 0) return null;

  const featured = items[0];
  // Grid = items after the featured slot, up to visibleCount total.
  const gridItems = items.slice(1, visibleCount);
  const totalShown = 1 + gridItems.length;
  const allShown = totalShown >= items.length;

  const basePath = contentType === "blog" ? "/blog" : "/news";
  const readLabel = contentType === "blog" ? "Read Article" : "Read Story";

  function catName(slug: string): string {
    return categories.find((c) => c.slug === slug)?.name ?? slug;
  }

  function resolveImage(item: ContentItem): string {
    return (
      item.featuredImage ??
      getCategoryFallbackImage(item.category, contentType)
    );
  }

  return (
    <>
      {/* Featured item -- large 2-col layout */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro eyebrow={featuredEyebrow} title={featuredTitle} />
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr,1fr] items-center">
            <Link
              href={`${basePath}/${featured.slug}`}
              className="group block overflow-hidden rounded-owl-card shadow-owl-2 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImage(featured)}
                alt={featured.title}
                className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>

            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center rounded-full bg-owl-teal/10 px-3 py-0.5 text-xs font-semibold text-owl-teal">
                {catName(featured.category)}
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-owl-ink sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-owl-ink/75 line-clamp-4">
                {featured.summary}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-owl-mist">
                <span>
                  {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                    dateStyle: "long",
                  })}
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
                  <Link href={`${basePath}/${featured.slug}`}>{readLabel} &rarr;</Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* Grid */}
      {gridItems.length > 0 && (
        <SectionReveal>
          <Section id={gridId} width="wide" pad="lg" bg="cream">
            <SectionIntro eyebrow={gridEyebrow} title={gridTitle} />
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {gridItems.map((item) => (
                <li key={item.slug}>
                  <BlogCard
                    slug={item.slug}
                    title={item.title}
                    summary={item.summary}
                    categoryName={catName(item.category)}
                    category={item.category}
                    publishedAt={item.publishedAt}
                    tone={item.tone}
                    featuredImage={resolveImage(item)}
                    readTime={estimateReadTime(item.body ?? "")}
                    contentType={contentType}
                  />
                </li>
              ))}
            </ul>

            {/* See More -- only shown when there are hidden items */}
            {!allShown && (
              <div className="mt-10 flex justify-center">
                <Button
                  intent="secondary"
                  size="lg"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  aria-label={`Load more ${contentType === "blog" ? "blog posts" : "news articles"}`}
                >
                  See More
                </Button>
              </div>
            )}
          </Section>
        </SectionReveal>
      )}
    </>
  );
}
