"use client";

/**
 * NewsHeroBanner  —  the OWL site-wide cinematic hero standard.
 *
 * This is the ONLY marketing hero component. It replaces VideoHeroBanner
 * across every marketing page.
 *
 * Design rationale
 * ----------------
 * VideoHeroBanner (old) rendered at full 16:9 (~720 px) plus a cream text
 * band below — total ~900 px. NewsHeroBanner uses fixed cinematic heights
 * (h-64 -> lg:h-[30rem]) with text overlaid on the video, giving every
 * page a consistent 256-480 px hero with zero poster-image flash.
 *
 * Video: autoplay * muted * loop * playsInline * preload="metadata"
 *        object-cover * NO poster — the video itself is the first frame.
 *
 * Props (mirrors VideoHeroBanner for easy migration):
 *   src       — video path from public/
 *   eyebrow   — small-caps label above heading (optional)
 *   title     — main h1; ReactNode so callers can embed coloured spans
 *   subtitle  — paragraph below heading (optional)
 *   ctaLabel  — primary CTA label (optional)
 *   ctaHref   — primary CTA href (optional)
 *   ctaLabel2 — secondary CTA label (optional, outline style)
 *   ctaHref2  — secondary CTA href (optional)
 *   meta      — footnote / quote below CTAs (optional)
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export interface NewsHeroBannerProps {
  /** Path to the video file served from public/, e.g. "/videos/music-hero.mp4" */
  src: string;
  /** Small-caps eyebrow label rendered above the heading */
  eyebrow?: string;
  /**
   * Main heading — accepts ReactNode so call sites can include coloured spans.
   * e.g. <>Hello <span className="text-owl-teal">World</span></>
   */
  title: React.ReactNode;
  /** Subtitle paragraph below the heading */
  subtitle?: string;
  /** Primary CTA button label */
  ctaLabel?: string;
  /** Primary CTA href */
  ctaHref?: string;
  /** Secondary CTA label (renders as ghost/outline link) */
  ctaLabel2?: string;
  /** Secondary CTA href */
  ctaHref2?: string;
  /** Optional trailing meta / trust line / quote below CTAs */
  meta?: React.ReactNode;
  className?: string;
}

export function NewsHeroBanner({
  src,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  ctaLabel2,
  ctaHref2,
  meta,
  className,
}: NewsHeroBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const html = document.documentElement;
    const motionOff =
      html.dataset.motion === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (motionOff) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, []);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-owl-ink",
        "h-64 sm:h-80 md:h-96 lg:h-[30rem]",
        className
      )}
    >
      {/* Video background: no poster — the video IS the first visible frame */}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient overlay: darkest at bottom-left for text readability */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-owl-ink/85 via-owl-ink/45 to-owl-ink/10"
      />

      {/* Text content anchored to bottom-left */}
      <div className="absolute bottom-0 left-0 px-6 pb-8 pt-4 sm:px-10 sm:pb-10 md:px-14 md:pb-14 max-w-2xl">
        {eyebrow && (
          <p className="mb-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal/90">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            {subtitle}
          </p>
        )}
        {(ctaLabel || ctaLabel2) && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {ctaLabel && ctaHref && (
              <Button intent="secondary" size="md" asChild>
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            )}
            {ctaLabel2 && ctaHref2 && (
              <Link
                href={ctaHref2}
                className="inline-flex items-center justify-center rounded-owl-btn px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/40 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0"
              >
                {ctaLabel2}
              </Link>
            )}
          </div>
        )}
        {meta && (
          <div className="mt-4 text-sm italic text-white/60">{meta}</div>
        )}
      </div>
    </div>
  );
}
