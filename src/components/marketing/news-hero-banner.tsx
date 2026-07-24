"use client";

/**
 * NewsHeroBanner  —  OWL site-wide cinematic hero standard.
 *
 * Design
 * ------
 * Fixed cinematic heights (h-64 → lg:h-[30rem]) matching the approved Blog
 * and News page dimensions.  Text is overlaid bottom-left on a dark gradient.
 *
 * Loading strategy (poster-first)
 * --------------------------------
 * 1. Poster image appears IMMEDIATELY — no blank hero, no flash.
 * 2. Video loads behind the poster with preload="metadata".
 * 3. When video fires `onCanPlay` the video fades in (250 ms) and the
 *    poster fades out simultaneously.
 * 4. If video fails or autoplay is blocked the poster stays visible forever.
 *
 * Crop
 * ----
 * object-position defaults to "center top" so faces, logos, and important
 * upper-frame content are preserved.  Overflow clips at the bottom.
 * Pass objectPosition to override per-page (e.g. "50% 15%").
 *
 * Accessibility
 * -------------
 * • prefers-reduced-motion: video is paused, poster stays.
 * • aria-hidden on video and poster (decorative).
 * • All interactive elements (links, buttons) remain keyboard-reachable.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export interface NewsHeroBannerProps {
  /** Path to the optimised MP4 served from public/videos/ */
  src: string;
  /**
   * Path to a WebP/JPEG poster frame from public/images/heroes/.
   * Shown immediately while the video loads.
   * Falls back to a dark bg-owl-ink if omitted.
   */
  poster?: string;
  /**
   * video object-position CSS value.
   * Default "center top" keeps faces/logos visible; only change per-page
   * after visual testing.
   */
  objectPosition?: string;
  /** Small-caps eyebrow label rendered above the heading */
  eyebrow?: string;
  /**
   * Main heading — accepts ReactNode so call sites can include coloured spans.
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
  poster,
  objectPosition = "center top",
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
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const htmlOff = document.documentElement.dataset.motion === "off";
    const motionOff = prefersReduced || htmlOff;
    setReducedMotion(motionOff);

    const video = videoRef.current;
    if (!video || motionOff) return;

    video.play().catch(() => {
      // Autoplay blocked — poster stays visible, no error state needed
    });
  }, []);

  const showVideo = videoReady && !videoError && !reducedMotion;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-owl-ink",
        "h-64 sm:h-80 md:h-96 lg:h-[30rem]",
        className
      )}
    >
      {/* ── Poster image (visible immediately, fades once video plays) ── */}
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          priority
          aria-hidden
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-300 ease-in-out",
            // Keep visible until video is playing; always visible on error / reduced-motion
            showVideo ? "opacity-0" : "opacity-100"
          )}
          style={{ objectPosition }}
        />
      )}

      {/* ── Video background ── */}
      {!videoError && !reducedMotion && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}        /* native poster = instant bg on first render */
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onError={() => setVideoError(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-in-out",
            showVideo ? "opacity-100" : "opacity-0"
          )}
          style={{ objectPosition }}
        />
      )}

      {/* ── Gradient overlay — darkest at bottom-left for text readability ── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-owl-ink/85 via-owl-ink/45 to-owl-ink/10"
      />

      {/* ── Text content anchored to bottom-left ── */}
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
