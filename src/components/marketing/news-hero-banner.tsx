"use client";

/**
 * NewsHeroBanner
 * Cinematic full-width video hero for the OWL News page.
 *
 * Unlike VideoHeroBanner (video above, text band below), this component
 * overlays text directly on top of the video with a dark gradient so the
 * hero reads as a single immersive unit — matching the News page mockup.
 *
 * Text is left-aligned at the bottom of the frame.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export interface NewsHeroBannerProps {
  /** Path to the video file served from public/, e.g. "/videos/news-hero.mp4" */
  src: string;
  /** Main heading — plain string for the news page */
  title: string;
  /** Subtitle paragraph */
  subtitle?: string;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button href — typically "#news" to scroll to the article grid */
  ctaHref?: string;
  className?: string;
}

export function NewsHeroBanner({
  src,
  title,
  subtitle,
  ctaLabel = "Stay Informed",
  ctaHref = "#news",
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
      {/* ── Video background ── */}
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

      {/* ── Gradient overlay: strongest at bottom-left for text readability ── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-owl-ink/85 via-owl-ink/45 to-owl-ink/10"
      />

      {/* ── Text content: anchored to bottom-left ── */}
      <div className="absolute bottom-0 left-0 px-6 pb-8 pt-4 sm:px-10 sm:pb-10 md:px-14 md:pb-14 max-w-xl">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            {subtitle}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <div className="mt-5">
            <Button intent="secondary" size="md" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
