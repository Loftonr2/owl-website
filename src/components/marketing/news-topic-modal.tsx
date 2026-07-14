"use client";

/**
 * NewsTopicModal (shared for Blog and News)
 * Slide-up/centered panel showing articles for a chosen topic category.
 *
 * Centering fix (Phase 9 / Phase 10):
 *   Uses a fixed flex wrapper (inset-0, flex, items-center, justify-content)
 *   rather than left-1/2 + -translate-x-1/2 on the panel.
 *   The flex wrapper is pointer-events-none so backdrop click-through works;
 *   the modal panel restores pointer-events-auto.
 *   This guarantees centering regardless of scroll position, parent transforms,
 *   or Tailwind breakpoint specificity.
 *
 * Accessibility:
 *  - role="dialog" + aria-modal + aria-label
 *  - ESC key closes
 *  - Backdrop click closes
 *  - Focus moves to close button on open
 *  - Body scroll locked while open
 *
 * Used by: News page (basePath="/news") and Blog page (basePath="/blog").
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
  excerpt?: string;
}

export interface NewsTopicModalProps {
  isOpen: boolean;
  category: UINewsCategory | null;
  articles: ModalArticle[];
  onClose: () => void;
  /**
   * URL prefix for article links.
   * @default "/news"
   */
  basePath?: string;
  /**
   * Content type for fallback image lookup.
   * @default "news"
   */
  contentType?: "blog" | "news";
}

export function NewsTopicModal({
  isOpen,
  category,
  articles,
  onClose,
  basePath = "/news",
  contentType = "news",
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
            key="topic-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-owl-ink/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* ── Centering flex wrapper ──
              pointer-events-none so the backdrop above still fires onClick;
              the dialog panel inside re-enables pointer-events.
              Centering is done with flex on inset-0, not with left-1/2
              + -translate-x-1/2, which can be offset by parent transforms
              or Tailwind specificity conflicts.
          ── */}
          <div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
            aria-hidden
          >
            <motion.div
              key="topic-modal-panel"
              role="dialog"
              aria-modal="true"
              aria-label={`${category.modalTitle} articles`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 28 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto",
                "w-full max-w-4xl max-h-[85vh] overflow-y-auto",
                "bg-owl-cream rounded-3xl shadow-owl-3"
              )}
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-3xl bg-owl-cream px-6 pb-4 pt-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  {/* Category icon */}
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
                    No published posts are available in this topic yet — check back soon!
                  </p>
                ) : (
                  <ul role="list" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => {
                      const image =
                        article.featuredImage ??
                        getCategoryFallbackImage(article.crmCategory, contentType);
                      const dateStr = new Date(article.publishedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      );
                      return (
                        <li key={article.slug}>
                          <Link
                            href={`${basePath}/${article.slug}`}
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
                              {article.excerpt && (
                                <p className="mt-1 text-[11px] leading-relaxed text-owl-mist line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-1 text-[11px] text-owl-mist mt-1">
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
