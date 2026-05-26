"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cursor-following hover hooks for OWL.
 *
 * Two primitives:
 *
 *   useMouseMagnet — translates the element toward the cursor on hover.
 *                    Used on buttons, CTAs, big chips. Max ±6 px.
 *
 *   useMouseTilt   — tilts the element along X/Y axes toward the cursor.
 *                    Used on cards. Max ±2deg, subtle.
 *
 * Both:
 *   - Are pointer-fine only (skipped on touch; coarse-pointer never tilts).
 *   - Skip work entirely under `prefers-reduced-motion` or `data-motion="off"`.
 *   - Return a ref + style object so callers can wire them in one line:
 *
 *       const { ref, style } = useMouseMagnet<HTMLButtonElement>();
 *       return <button ref={ref} style={style}>…</button>;
 *
 *   - Use CSS transforms (cheap; composited; no layout thrash).
 *   - rAF-throttle every pointermove so frequency stays at display rate.
 *
 * The hooks set their own listeners on the element's bounding box on first
 * hover and tear them down on leave.
 */

/** Read live whether motion is disabled — checks data-motion attr + OS pref. */
function motionDisabled(): boolean {
  if (typeof window === "undefined") return true;
  const html = document.documentElement;
  const setting = html.getAttribute("data-motion");
  if (setting === "off") return true;
  if (setting === "on") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function isFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: fine)").matches ?? false;
}

/* ──────────────────────────────────────────────────────────────────────────── */

export interface MouseMagnetOptions {
  /** Max translate distance, px. Default 6. */
  strength?: number;
  /** Reset distance when pointer leaves. Default 0 (resets to origin). */
  rest?: number;
}

export function useMouseMagnet<T extends HTMLElement = HTMLElement>(
  opts: MouseMagnetOptions = {}
): { ref: React.RefObject<T | null>; style: React.CSSProperties } {
  const { strength = 6 } = opts;
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isFinePointer()) return;
    if (motionDisabled()) return;

    let rafId = 0;
    let nextX = 0;
    let nextY = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      // Cursor pos within element, normalized to [-1, 1].
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      nextX = nx * 2 * strength;
      nextY = ny * 2 * strength;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setOffset({ x: nextX, y: nextY });
        rafId = 0;
      });
    };
    const onLeave = () => setOffset({ x: 0, y: 0 });

    el.addEventListener("pointermove", onMove as EventListener);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove as EventListener);
      el.removeEventListener("pointerleave", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [strength]);

  return {
    ref,
    style: {
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      // Match OWL's signature curve. Snappy enter, gentle release.
      transition: "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
      willChange: "transform",
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────────── */

export interface MouseTiltOptions {
  /** Max tilt angle in degrees. Default 2. */
  strength?: number;
  /**
   * Optional inverse — by default the tilt looks "toward" the cursor (the
   * far side lifts). Pass `inverse: true` to flip the axis sense.
   */
  inverse?: boolean;
  /** Translate distance (px) layered on top of the tilt. Default 0. */
  translate?: number;
}

export function useMouseTilt<T extends HTMLElement = HTMLElement>(
  opts: MouseTiltOptions = {}
): { ref: React.RefObject<T | null>; style: React.CSSProperties } {
  const { strength = 2, inverse = false, translate = 0 } = opts;
  const ref = useRef<T>(null);
  const [transform, setTransform] = useState<{ rx: number; ry: number; tx: number; ty: number }>({
    rx: 0,
    ry: 0,
    tx: 0,
    ty: 0,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isFinePointer()) return;
    if (motionDisabled()) return;

    let rafId = 0;
    const direction = inverse ? -1 : 1;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      // ry = horizontal tilt (around Y axis), rx = vertical tilt (around X axis).
      const ry = nx * 2 * strength * direction;
      const rx = -ny * 2 * strength * direction;
      const tx = nx * 2 * translate;
      const ty = ny * 2 * translate;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setTransform({ rx, ry, tx, ty });
        rafId = 0;
      });
    };
    const onLeave = () => setTransform({ rx: 0, ry: 0, tx: 0, ty: 0 });

    el.addEventListener("pointermove", onMove as EventListener);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove as EventListener);
      el.removeEventListener("pointerleave", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [strength, inverse, translate]);

  return {
    ref,
    style: {
      transform: `perspective(800px) rotateX(${transform.rx}deg) rotateY(${transform.ry}deg) translate3d(${transform.tx}px, ${transform.ty}px, 0)`,
      transition: "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
      transformStyle: "preserve-3d",
      willChange: "transform",
    },
  };
}
