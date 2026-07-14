"use client";

/**
 * NewsTopicModal
 * Slide-up panel that shows articles for a chosen topic category.
 *
 * Accessibility:
 *  - role="dialog" + aria-modal + aria-label
 *  - ESC key closes
 *  - Backdrop click closes
 *  - Focus moves to close button on open
 *  - Body scroll locked while open
 *
 * Animation: framer-motion AnimatePresence (fade + slide) — consistent
 * with browse-videos-section.tsx modal pattern used elsewhere in the codebase.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { UINewsCategory } from "@/lib/news-categories";
import { getCategoryFallbackImage } from "@/lib/content-images";

export interface ModalArticle {
  slug: string;
  title: string;
  publishedAt: string;
  featuredImage: string | null;
  crmCategory: string;
}

export interface NewsTopicModalProps {
  isOpen: boolean;
  category: UINewsCategory | null;
  articles: ModalArticle[];
  onClose: () => void;
}

export function NewsTopicModal({
  isOpen,
  category,
  articles,
  onClose,
}: NewsTopicModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll + focus close button when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const id = setTimeout(() => closeRef.current?.focus(), 60);
      return () => clearTimeout(id);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && category && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="news-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-owl-ink/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* ── Modal panel ── */}
          <motion.div
            key="news-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${category.modalTitle} articles`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              // Mobile: full-width sheet anchored to bottom
              "fixed inset-x-0 bottom-0 z-[61] rounded-t-3xl",
              // Desktop: centred dialog
              "md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2",
              "md:-translate-x-1/2 md:-translate-y-1/2",
              "md:w-full md:max-w-4xl md:rounded-3xl",
              // Shared
              "bg-owl-cream shadow-owl-3 max-h-[85vh] overflow-y-auto"
            )}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-3xl bg-owl-cream px-6 pb-4 pt-6 border-b border-neutral-200 md:rounded-t-3xl">
              <div className="flex items-center gap-3">
                {/* Category icon tile */}
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: category.tileBg }}
                >
                  <category.Icon
                    className="h-5 w-5"
                    style={{ color: category.tileIconColor }}
                    aria-hidden
                  />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-owl-mist">
                    Browse by topic
                  </p>
                  <h2 className="font-display text-xl font-extrabold text-owl-ink">
                    {category.modalTitle}
                  </h2>
                </div>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  "bg-owl-ink/5 text-owl-ink transition-colors duration-150",
                  "hover:bg-owl-ink/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                )}
                aria-label="Close topic panel"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Article list */}
            <div className="p-6">
              {articles.length === 0 ? (
                <p className="py-10 text-center text-sm text-owl-mist">
                  No articles in this topic yet — check back soon!
                </p>
              ) : (
                <ul
                  role="list"
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {articles.map((article) => {
                    const image =
                      article.featuredImage ??
                      getCategoryFallbackImage(article.crmCategory, "news");
                    const dateStr = new Date(article.publishedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    );
                    return (
                      <li key={article.slug}>
                        <Link
                          href={`/news/${article.slug}`}
                          onClick={onClose}
                          className={cn(
                            "group flex gap-3 rounded-2xl bg-white p-3",
                            "border border-neutral-100",
                            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt=""
                            aria-hidden
                            className="h-16 w-24 shrink-0 rounded-xl object-cover"
                          />
                          <div className="flex min-w-0 flex-col justify-between">
                            <p className="font-display text-sm font-bold leading-snug text-owl-ink line-clamp-2">
                              {article.title}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] text-owl-mist">
                              <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                              <time dateTime={article.publishedAt}>{dateStr}</time>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
