"use client";

/**
 * BlogPageClient
 * Client shell for the OWL Blog page.
 *
 * Responsibilities:
 *  1. "Latest from the Blog" — 5-column article grid with compact cards
 *  2. "See More Articles" pagination (10 initially, +10 per click) — purple button
 *  3. "Browse Blog Topics" — 10 circular icon tiles (rounded-full, matches mockup)
 *  4. Category topic modal (shared NewsTopicModal with basePath="/blog")
 *
 * All article data is fetched server-side and passed as props — no Supabase here.
 * Category normalization uses getBlogUICategory() from @/lib/blog-categories.
 */
import { useState, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsCard } from "@/components/marketing/news-card";
import {
  NewsTopicModal,
  type ModalArticle,
} from "@/components/marketing/news-topic-modal";
import {
  UI_NEWS_CATEGORIES,
  getBlogUICategory,
  type UINewsCategory,
} from "@/lib/blog-categories";
import { resolveContentCardImage } from "@/lib/content-images";

const PAGE_SIZE = 10;

/** Minimal article shape required by this client component. */
export interface BlogArticleItem {
  slug: string;
  title: string;
  /** CRM category slug (homeschooling | parenting-tips | child-development | ...) */
  category: string;
  publishedAt: string;
  featuredImage: string | null;
  excerpt?: string;
}

interface BlogPageClientProps {
  articles: BlogArticleItem[];
}

export function BlogPageClient({ articles }: BlogPageClientProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalCategory, setModalCategory] = useState<UINewsCategory | null>(null);
  // Track which tile button triggered the modal so we can restore focus on close
  const activeTileRef = useRef<HTMLButtonElement | null>(null);

  const openModal = useCallback((cat: UINewsCategory, btn: HTMLButtonElement) => {
    activeTileRef.current = btn;
    setModalCategory(cat);
  }, []);

  const closeModal = useCallback(() => {
    setModalCategory(null);
    // Restore focus to the tile that opened the modal
    setTimeout(() => activeTileRef.current?.focus(), 50);
  }, []);

  const visibleArticles = articles.slice(0, visibleCount);
  const allShown = visibleCount >= articles.length;

  // Articles shown in the modal for the active topic
  const modalArticles: ModalArticle[] = modalCategory
    ? articles
        .filter(
          (a) => getBlogUICategory(a.slug, a.category).slug === modalCategory.slug
        )
        .map((a) => ({
          slug: a.slug,
          title: a.title,
          publishedAt: a.publishedAt,
          featuredImage: a.featuredImage,
          crmCategory: a.category,
          excerpt: a.excerpt,
        }))
    : [];

  if (articles.length === 0) return null;

  return (
    <>
      {/* ── Latest from the Blog ── */}
      <SectionReveal>
        <Section id="blog" width="wide" pad="lg" bg="white">
          {/* Section heading with purple underline (matches mockup) */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              Latest from the Blog
            </h2>
            <div
              className="mx-auto mt-2 h-1 w-16 rounded-full"
              style={{ backgroundColor: "#7C3AED" }}
              aria-hidden
            />
          </div>

          {/* 5-column article grid — 1 col mobile, 2 sm, 3 md, 4 lg, 5 xl */}
          <ul
            role="list"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {visibleArticles.map((article) => {
              const uiCat = getBlogUICategory(article.slug, article.category);
              const image = resolveContentCardImage({
                slug: article.slug,
                featured_image: article.featuredImage,
                category: article.category,
                content_type: "blog",
              });
              return (
                <li key={article.slug}>
                  <NewsCard
                    slug={article.slug}
                    title={article.title}
                    publishedAt={article.publishedAt}
                    featuredImage={image}
                    category={uiCat}
                    href={`/blog/${article.slug}`}
                  />
                </li>
              );
            })}
          </ul>

          {/* See More Articles — purple to match blog mockup */}
          {!allShown && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                aria-label="Load more blog posts"
                className={
                  "inline-flex items-center gap-2 rounded-full px-6 py-3 " +
                  "font-display font-semibold text-base text-white shadow-sm " +
                  "transition-all duration-200 hover:-translate-y-px hover:shadow-md " +
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                }
                style={{ backgroundColor: "#7C3AED" }}
              >
                See More Articles
                <ChevronDown className="h-5 w-5" aria-hidden />
              </button>
            </div>
          )}
        </Section>
      </SectionReveal>

      {/* ── Browse Blog Topics ── */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          {/* Section heading with purple underline */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              Browse Blog Topics
            </h2>
            <div
              className="mx-auto mt-2 h-1 w-16 rounded-full"
              style={{ backgroundColor: "#7C3AED" }}
              aria-hidden
            />
          </div>

          {/* Topic tile row — circular tiles (rounded-full), matching blog mockup.
              5 cols mobile (2 rows of 5), 10 cols on lg+ (1 row).          */}
          <div className="grid grid-cols-5 gap-3 sm:gap-5 lg:grid-cols-10">
            {UI_NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={(e) =>
                  openModal(cat, e.currentTarget as HTMLButtonElement)
                }
                className={
                  "group flex flex-col items-center gap-2 " +
                  "focus-visible:outline-none focus-visible:ring-2 " +
                  "focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-full"
                }
                aria-label={`Browse ${cat.label} posts`}
              >
                {/* Circular icon tile */}
                <span
                  className={
                    "flex h-14 w-14 items-center justify-center rounded-full " +
                    "transition-transform duration-200 group-hover:scale-110 " +
                    "sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px]"
                  }
                  style={{ backgroundColor: cat.tileBg }}
                >
                  <cat.Icon
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                    style={{ color: cat.tileIconColor }}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
                {/* Label */}
                <span className="text-center text-[9px] font-semibold leading-tight text-owl-ink sm:text-[11px]">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* ── Shared topic modal ── */}
      <NewsTopicModal
        isOpen={modalCategory !== null}
        category={modalCategory}
        articles={modalArticles}
        onClose={closeModal}
        basePath="/blog"
        contentType="blog"
      />
    </>
  );
}
