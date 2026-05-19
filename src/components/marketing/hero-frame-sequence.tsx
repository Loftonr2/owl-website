"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import {
  heroFrames,
  type HeroFrameKey,
  type HeroFrameSequence as Sequence,
  type HeroFrameVariant,
} from "@/lib/images";
import { loadGsap } from "@/lib/motion/gsap";
import { cn } from "@/lib/cn";

/**
 * HeroFrameSequence — cinematic scroll-scrubbed image sequence.
 *
 * v2 (Visual-track Phase 6): variant-aware + chunked loading + posterFallback.
 *
 * Resolution order (one decision tree on mount):
 *   1. Sequence not registered                → render null + dev warn.
 *   2. `available !== true`                   → render null + dev warn.
 *   3. Reduced motion                         → render static `<Image>` of
 *                                                  `posterFallback` if set,
 *                                                  else frame-001 of the
 *                                                  resolved variant.
 *   4. Active path                            → mount canvas + GSAP scrub
 *                                                with **chunked frame loading**.
 *
 * Chunked loading (the perf win):
 *   The previous runtime preloaded all 240 frames eagerly. For a hero that
 *   the user might never scroll past, that wastes ~12 MB of bandwidth.
 *   v2 loads frames in INITIAL_CHUNK_SIZE batches as scroll progress crosses
 *   thresholds. The first chunk (30 frames) is fetched immediately so playback
 *   is smooth from frame 1; subsequent chunks queue when progress crosses a
 *   threshold the chunk's last frame falls before.
 *
 * Variant selection:
 *   - matchMedia("(max-width: 767px)") matches → `variants.mobile` if present.
 *   - Otherwise → `variants.desktop` if present, else top-level basePath.
 *   - Selection happens once on mount; resize-across-the-breakpoint requires
 *     a reload (rare for hero sequences; the cost of live-switching is high).
 *
 * SSR-safe: every browser API access is guarded behind useEffect.
 */

const INITIAL_CHUNK_SIZE = 30;
const CHUNK_LOAD_AHEAD = 30;

export interface HeroFrameSequenceProps {
  /** Slug into `src/lib/images.ts → heroFrames`. */
  slug: HeroFrameKey;
  /** Class for the wrapper. */
  className?: string;
  /**
   * Scroll range as a CSS length, e.g. "200vh", "100%". Controls how much
   * scroll distance the sequence consumes. Default: "150vh".
   */
  scrollDistance?: string;
}

type ResolvedVariant = {
  basePath: string;
  width: number;
  height: number;
  frameCount: number;
};

function resolveVariant(sequence: Sequence): ResolvedVariant {
  if (typeof window === "undefined") {
    return {
      basePath: sequence.basePath,
      width: sequence.width,
      height: sequence.height,
      frameCount: sequence.frameCount,
    };
  }
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const variant: HeroFrameVariant | undefined = isMobile
    ? sequence.variants?.mobile
    : sequence.variants?.desktop;
  if (variant) {
    return {
      basePath: variant.basePath,
      width: variant.width,
      height: variant.height,
      frameCount: variant.frameCount ?? sequence.frameCount,
    };
  }
  return {
    basePath: sequence.basePath,
    width: sequence.width,
    height: sequence.height,
    frameCount: sequence.frameCount,
  };
}

export function HeroFrameSequence({
  slug,
  className,
  scrollDistance = "150vh",
}: HeroFrameSequenceProps) {
  const sequence: Sequence | undefined = (heroFrames as Record<string, Sequence>)[slug as string];
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const loadedCountRef = useRef(0);
  const [variant, setVariant] = useState<ResolvedVariant | null>(null);
  const [initialReady, setInitialReady] = useState(false);

  /** Padding length for zero-padded frame filenames (e.g. 001..240 → 3). */
  const padLength = useMemo(
    () => (variant ? String(variant.frameCount).length : 0),
    [variant]
  );

  const frameUrl = useMemo(
    () =>
      variant
        ? (i: number) =>
            `${variant.basePath}/frame-${String(i + 1).padStart(padLength, "0")}.${sequence!.ext}`
        : null,
    [variant, padLength, sequence]
  );

  // ---------------------------------------------------------------------------
  // Effect 1: Resolve which variant to load (desktop / mobile / fallback).
  //           Happens once per slug on mount.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!sequence) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[HeroFrameSequence] No manifest entry for slug "${slug}". ` +
            `Add it to src/lib/images.ts → heroFrames.`
        );
      }
      return;
    }
    if (!sequence.available) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[HeroFrameSequence] heroFrames["${slug}"] is registered but ` +
            `available !== true. Set \`available: true\` after dropping ` +
            `${sequence.frameCount} frames into ${sequence.basePath}/.`
        );
      }
      return;
    }
    if (prefersReduced) return;
    setVariant(resolveVariant(sequence));
  }, [slug, sequence, prefersReduced]);

  // ---------------------------------------------------------------------------
  // Effect 2: Preload the INITIAL chunk (frames 0 ... INITIAL_CHUNK_SIZE - 1).
  //           Subsequent chunks load on-demand via ScrollTrigger's onUpdate.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!variant || !frameUrl) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    framesRef.current = new Array(variant.frameCount);
    loadedCountRef.current = 0;
    setInitialReady(false);

    const initialCount = Math.min(INITIAL_CHUNK_SIZE, variant.frameCount);

    function loadFrame(index: number) {
      if (cancelled) return;
      if (framesRef.current[index]) return; // already loading/loaded
      const img = new window.Image();
      img.src = frameUrl!(index);
      img.onload = () => {
        if (cancelled) return;
        loadedCountRef.current += 1;
        if (
          !initialReady &&
          loadedCountRef.current >= initialCount &&
          variant
        ) {
          setInitialReady(true);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn(`[HeroFrameSequence] Frame failed to load: ${img.src}`);
        }
        loadedCountRef.current += 1;
        if (
          !initialReady &&
          loadedCountRef.current >= initialCount &&
          variant
        ) {
          setInitialReady(true);
        }
      };
      framesRef.current[index] = img;
    }

    for (let i = 0; i < initialCount; i++) loadFrame(i);

    return () => {
      cancelled = true;
    };
  }, [variant, frameUrl, initialReady]);

  // ---------------------------------------------------------------------------
  // Effect 3: GSAP ScrollTrigger — drives both the draw loop AND lazy chunk
  //           loading. As scroll progress advances, we ensure the next chunk
  //           is queued before we ever need it.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!variant || !frameUrl) return;
    if (!initialReady) return;
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = variant.width;
    canvas.height = variant.height;

    // Draw frame 0 immediately so the first paint isn't blank.
    const first = framesRef.current[0];
    if (first) {
      try {
        ctx.drawImage(first, 0, 0, canvas.width, canvas.height);
      } catch {
        /* not decoded yet — ScrollTrigger will redraw */
      }
    }

    let ctxGsap: ReturnType<typeof import("gsap").gsap.context> | undefined;
    let trigger: ReturnType<typeof import("gsap/ScrollTrigger").ScrollTrigger.create> | undefined;
    const stateRef = { frame: 0 };

    function ensureChunkLoaded(throughIndex: number) {
      const target = Math.min(throughIndex + CHUNK_LOAD_AHEAD, variant!.frameCount - 1);
      for (let i = 0; i <= target; i++) {
        if (framesRef.current[i]) continue;
        const img = new window.Image();
        img.src = frameUrl!(i);
        framesRef.current[i] = img;
      }
    }

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!gsap || !ScrollTrigger) return; // motion disabled — leave frame 0
      ctxGsap = gsap.context(() => {
        trigger = ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${parseScrollDistance(scrollDistance, variant.height)}`,
          scrub: 0.4,
          onUpdate: (self) => {
            const idx = Math.min(
              variant.frameCount - 1,
              Math.max(0, Math.round(self.progress * (variant.frameCount - 1)))
            );
            // Lazy-load ahead of the play head so chunks are ready before scrub.
            ensureChunkLoaded(idx);
            if (idx === stateRef.frame) return;
            stateRef.frame = idx;
            const img = framesRef.current[idx];
            if (!img || !img.complete || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          },
        });
      }, container);
    });

    return () => {
      trigger?.kill();
      ctxGsap?.revert();
    };
  }, [variant, frameUrl, initialReady, scrollDistance]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (!sequence) return null;
  if (!sequence.available) return null;

  // Compute the right poster path for the reduced-motion / not-ready fallback.
  // Prefer `posterFallback` if set; otherwise frame-001 of the resolved variant
  // (or top-level basePath if variant resolution hasn't happened yet — SSR pass).
  const ssrFallback = sequence.posterFallback
    ? sequence.posterFallback
    : `${sequence.basePath}/frame-${"1".padStart(String(sequence.frameCount).length, "0")}.${sequence.ext}`;
  const resolvedFallback = variant
    ? sequence.posterFallback
      ? sequence.posterFallback
      : `${variant.basePath}/frame-${"1".padStart(padLength, "0")}.${sequence.ext}`
    : ssrFallback;

  if (prefersReduced) {
    return (
      <div
        ref={containerRef}
        className={cn("relative w-full overflow-hidden rounded-owl-banner shadow-owl-2", className)}
        style={{
          aspectRatio: `${variant?.width ?? sequence.width} / ${variant?.height ?? sequence.height}`,
        }}
      >
        <Image
          src={resolvedFallback}
          alt={sequence.alt}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>
    );
  }

  // Active path — canvas-driven scrub.
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-owl-banner shadow-owl-2",
        className
      )}
      style={{
        aspectRatio: `${variant?.width ?? sequence.width} / ${variant?.height ?? sequence.height}`,
      }}
      aria-label={sequence.alt}
      role="img"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Skeleton — show a static poster underlay until the initial chunk
          decodes. Avoids a blank canvas flash. */}
      {!initialReady && (
        <Image
          src={resolvedFallback}
          alt={sequence.alt}
          fill
          sizes="100vw"
          priority
          className="absolute inset-0 object-cover"
        />
      )}
    </div>
  );
}

/**
 * Convert a CSS length ("200vh" / "100%" / "1200px") into a pixel value
 * usable by ScrollTrigger's `end: "+=N"` syntax.
 */
function parseScrollDistance(distance: string, sequenceHeight: number): number {
  if (typeof window === "undefined") return sequenceHeight;
  const trimmed = distance.trim();
  if (trimmed.endsWith("vh")) {
    const v = parseFloat(trimmed);
    return (window.innerHeight * v) / 100;
  }
  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed);
  }
  if (trimmed.endsWith("%")) {
    const v = parseFloat(trimmed);
    return (sequenceHeight * v) / 100;
  }
  const v = parseFloat(trimmed);
  return Number.isFinite(v) ? v : sequenceHeight;
}
