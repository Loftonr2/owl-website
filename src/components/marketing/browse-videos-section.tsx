"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Play } from "lucide-react";
import { VideoCard } from "@/components/marketing/video-card";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { MediaRail } from "@/components/marketing/media-rail";
import type { SeedVideo } from "@/lib/seed/videos";

const YT_CHANNEL = "https://www.youtube.com/@Owlsingtogetherchannel";

interface BrowseVideosSectionProps {
  videos: SeedVideo[];
}

export function BrowseVideosSection({ videos }: BrowseVideosSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const preview = videos.slice(0, 6);

  /* ── Trap focus + lock scroll when modal is open ── */
  useEffect(() => {
    if (!modalOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  /* ── Escape key closes modal ── */
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen]);

  return (
    <>
      <Section width="wide" pad="lg" bg="white" id="archive">
        <SectionIntro
          eyebrow="The library"
          title="Browse Videos"
          subtitle="More is added every Monday, Wednesday, and Friday."
        />

        <MediaRail
          ariaLabel="OWL video library"
          columns={{ md: 2, lg: 3 }}
          className="mt-8"
          stagger={0.05}
        >
          {preview.map((v) => (
            <VideoCard
              key={v.slug}
              slug={v.slug}
              title={v.title}
              ageRange={v.ageRange}
              theme={v.theme}
              duration={v.duration}
              tone={v.tone}
              posterSrc={v.posterSrc}
              youtubeId={v.youtubeId}
            />
          ))}
        </MediaRail>

        {/* More Videos button — bottom right */}
        <div className="mt-8 flex justify-end">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setModalOpen(true)}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-owl-teal via-[#1dbdb5] to-owl-amber px-7 py-3 font-display text-sm font-bold text-white shadow-owl-2 transition-all duration-300 hover:scale-105 hover:shadow-owl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2"
            aria-haspopup="dialog"
          >
            {/* Shine sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"
            />
            <span className="relative flex items-center gap-2">
              <Play className="h-3.5 w-3.5 fill-white" aria-hidden />
              More Videos
            </span>
          </button>
        </div>
      </Section>

      {/* ── Modal overlay ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
              aria-hidden
            />

            {/* Panel */}
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="All OWL videos"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 bottom-0 top-[5vh] z-50 mx-auto flex max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-owl-white shadow-2xl md:inset-x-6 md:top-[6vh] md:rounded-3xl"
            >
              {/* Modal header */}
              <div className="flex shrink-0 items-center justify-between border-b border-owl-cream-deep px-6 py-4">
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                    OWL Video Library
                  </p>
                  <h2 className="font-display text-xl font-extrabold text-owl-ink">
                    All Videos ({videos.length})
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-owl-cream-deep bg-owl-cream text-owl-mist transition-colors hover:border-owl-rose/40 hover:text-owl-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-rose/40"
                  aria-label="Close video library"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable video grid */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((v, i) => (
                    <motion.div
                      key={v.slug}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <VideoCard
                        slug={v.slug}
                        title={v.title}
                        ageRange={v.ageRange}
                        theme={v.theme}
                        duration={v.duration}
                        tone={v.tone}
                        posterSrc={v.posterSrc}
                        youtubeId={v.youtubeId}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Modal footer — YouTube CTA */}
              <div className="shrink-0 border-t border-owl-cream-deep bg-gradient-to-r from-[#fef3d8] via-owl-cream to-[#e5f8f4] px-6 py-5">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                  <p className="text-sm text-owl-ink/70">
                    New videos every Monday, Wednesday &amp; Friday.
                  </p>
                  <Link
                    href={YT_CHANNEL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setModalOpen(false)}
                    className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff0000] to-[#cc0000] px-5 py-2.5 font-display text-sm font-bold text-white shadow-owl-1 transition-all duration-200 hover:scale-105 hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                  >
                    {/* YouTube icon */}
                    <svg aria-hidden className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch on YouTube
                    <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
