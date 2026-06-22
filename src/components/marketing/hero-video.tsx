"use client";

/**
 * HeroVideo — autoplay/muted/loop video banner for hero sections.
 *
 * Designed to be passed as `bannerSlot` to <CinematicHero> / <BannerHero>.
 * Falls back gracefully if the browser blocks autoplay (just shows the
 * poster image or nothing — the surrounding text composition is unaffected).
 *
 * Motion-safe: honors prefers-reduced-motion AND data-motion="off" on <html>.
 * When motion is off, we still render the video element (it's paused by
 * default without autoplay) so the poster frame shows — no layout shift.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export interface HeroVideoProps {
  /** Path to the MP4 file relative to /public, e.g. "/videos/landing-hero.mp4" */
  src: string;
  /** Optional poster frame to show before/if video can't autoplay */
  poster?: string;
  /** Optional className override for the video element */
  className?: string;
}

export function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Respect site-level motion preference
    const html = document.documentElement;
    const motionOff =
      html.dataset.motion === "off" ||
      (html.dataset.motion !== "on" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (motionOff) {
      video.pause();
      return;
    }

    // Attempt autoplay — browsers may block it, which is fine
    video.play().catch(() => {
      // Silently swallow — poster frame shows instead
    });
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      className={cn(
        "absolute inset-0 h-full w-full object-cover",
        className
      )}
    />
  );
}
