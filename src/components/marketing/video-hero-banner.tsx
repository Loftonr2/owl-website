"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

/**
 * VideoHeroBanner — full-width 16:9 video at the top of a page,
 * followed by a cream text band with eyebrow, heading, subhead, and CTAs.
 *
 * The video shows the ENTIRE frame (no cropping) by matching the container
 * to the video's native 16:9 aspect ratio. On mobile the video still spans
 * full width; the text band stacks naturally below.
 *
 * Motion: video autoplays muted/loop. If the user or OS has
 * `prefers-reduced-motion: reduce` OR the <html> element has
 * `data-motion="off"`, the video is paused and shows the poster frame.
 */

export interface VideoHeroBannerProps {
  /** Path to the video file, e.g. "/videos/music-hero.mp4" */
  src: string;
  /** Optional static poster image shown while video loads */
  poster?: string;
  /** Small caps label above the heading */
  eyebrow?: string;
  /** Main page heading (can be a ReactNode for coloured spans) */
  heading: React.ReactNode;
  /** Subheading paragraph */
  subhead?: string;
  /** Primary CTA button */
  primaryCta?: { label: string; href: string };
  /** Secondary CTA button */
  secondaryCta?: { label: string; href: string };
  /** Extra content below buttons (e.g. disclaimer) */
  meta?: React.ReactNode;
  className?: string;
}

export function VideoHeroBanner({
  src,
  poster,
  eyebrow,
  heading,
  subhead,
  primaryCta,
  secondaryCta,
  meta,
  className,
}: VideoHeroBannerProps) {
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
    <div className={cn("w-full", className)}>
      {/* ── Full-width 16:9 video ── */}
      <div className="w-full overflow-hidden bg-owl-ink">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          className="w-full aspect-video object-cover block"
        />
      </div>

      {/* ── Text band ── */}
      <div className="bg-owl-cream px-6 py-10 sm:py-14 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          {eyebrow && (
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              "mt-3 font-display text-3xl font-extrabold leading-tight text-owl-ink sm:text-4xl md:text-5xl",
              eyebrow && "mt-2"
            )}
          >
            {heading}
          </h1>
          {subhead && (
            <p className="mt-4 mx-auto max-w-2xl text-base leading-relaxed text-owl-ink/70 sm:text-lg">
              {subhead}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {primaryCta && (
                <Button intent="primary" size="lg" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              )}
              {secondaryCta && (
                <Button intent="secondary" size="lg" asChild>
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          )}
          {meta && (
            <div className="mt-4 text-sm text-owl-mist">{meta}</div>
          )}
        </div>
      </div>
    </div>
  );
}
