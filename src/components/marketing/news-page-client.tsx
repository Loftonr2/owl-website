"use client";

/**
 * NewsPageClient
 * Client shell for the OWL News page.
 *
 * Responsibilities:
 *  1. Render the "Latest News" 5-column article grid (server data passed as props)
 *  2. "See More Articles" pagination (10 items initially, +10 per click)
 *  3. "Browse Popular Topics" section with 10 icon tiles
 *  4. Topic modal open/close state (NewsTopicModal)
 *
 * All article data is fetched server-side and passed in — no Supabase calls here.
 */
import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsCard } from "@/components/marketing/news-card";
import {
  NewsTopicModal,
  type ModalArticle,
} from "@/components/marketing/news-topic-modal";
import {
  UI_NEWS_CATEGORIES,
  getNewsUICategory,
  type UINewsCategory,
} from "@/lib/news-categories";
import { resolveContentCardImage } from "@/lib/content-images";

const PAGE_SIZE = 10;

/** Minimal article shape required by this client component. */
export interface NewsArticleItem {
  slug: string;
  title: string;
  /** CRM category slug (e.g. "resources", "events", "community", "press") */
  category: string;
  publishedAt: string;
  featuredImage: string | null;
}

interface NewsPageClientProps {
  articles: NewsArticleItem[];
}

export function NewsPageClient({ articles }: NewsPageClientProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalCategory, setModalCategory] = useState<UINewsCategory | null>(null);

  const openModal = useCallback((cat: UINewsCategory) => setModalCategory(cat), []);
  const closeModal = useCallback(() => setModalCategory(null), []);

  const visibleArticles = articles.slice(0, visibleCount);
  const allShown = visibleCount >= articles.length;

  // Articles filtered for the open modal category
  const modalArticles: ModalArticle[] = modalCategory
    ? articles
        .filter(
          (a) => getNewsUICategory(a.slug, a.category).slug === modalCategory.slug
        )
        .map((a) => ({
          slug: a.slug,
          title: a.title,
          publishedAt: a.publishedAt,
          featuredImage: a.featuredImage,
          crmCategory: a.category,
        }))
    : [];

  if (articles.length === 0) return null;

  return (
    <>
      {/* ── Latest News grid ── */}
      <SectionReveal>
        <Section id="news" width="wide" pad="lg" bg="white">
          {/* Section heading */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              Latest News
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-owl-teal" aria-hidden />
          </div>

          {/* 5-column article grid */}
          <ul
            role="list"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {visibleArticles.map((article) => {
              const uiCat = getNewsUICategory(article.slug, article.category);
              const image = resolveContentCardImage({
                slug: article.slug,
                featured_image: article.featuredImage,
                category: article.category,
                content_type: "news",
              });
              return (
                <li key={article.slug}>
                  <NewsCard
                    slug={article.slug}
                    title={article.title}
                    publishedAt={article.publishedAt}
                    featuredImage={image}
                    category={uiCat}
                  />
                </li>
              );
            })}
          </ul>

          {/* See More Articles button */}
          {!allShown && (
            <div className="mt-10 flex justify-center">
              <Button
                intent="secondary"
                size="lg"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                iconEnd={<ChevronDown className="h-5 w-5" aria-hidden />}
                aria-label="Load more news articles"
              >
                See More Articles
              </Button>
            </div>
          )}
        </Section>
      </SectionReveal>

      {/* ── Browse Popular Topics ── */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          {/* Section heading */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              Browse Popular Topics
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-owl-teal" aria-hidden />
          </div>

          {/* Topic tile grid — 5 cols on mobile, 10 on lg+ */}
          <div className="grid grid-cols-5 gap-3 sm:gap-4 lg:grid-cols-10">
            {UI_NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => openModal(cat)}
                className={
                  "group flex flex-col items-center gap-2 " +
                  "rounded-2xl focus-visible:outline-none focus-visible:ring-2 " +
                  "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                }
                aria-label={`Browse ${cat.label} articles`}
              >
                {/* Icon tile */}
                <span
                  className={
                    "flex h-14 w-14 items-center justify-center rounded-2xl " +
                    "transition-transform duration-200 group-hover:scale-105 " +
                    "sm:h-18 sm:w-18 lg:h-20 lg:w-20"
                  }
                  style={{ backgroundColor: cat.tileBg }}
                >
                  <cat.Icon
                    className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9"
                    style={{ color: cat.tileIconColor }}
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

      {/* ── Topic modal ── */}
      <NewsTopicModal
        isOpen={modalCategory !== null}
        category={modalCategory}
        articles={modalArticles}
        onClose={closeModal}
      />
    </>
  );
}
