"use client";

/**
 * GSAP loader — lazy, motion-aware.
 *
 * GSAP + ScrollTrigger weigh ~70KB gzipped. We don't want it on every page.
 * Components that need pinning, scrubbing, or image-sequence control should:
 *
 *   import { loadGsap } from "@/lib/motion/gsap";
 *   useEffect(() => {
 *     let ctx: ReturnType<typeof import("gsap").gsap.context> | undefined;
 *     loadGsap().then(({ gsap, ScrollTrigger }) => {
 *       if (!gsap || !ScrollTrigger) return;  // motion off
 *       ctx = gsap.context(() => {
 *         gsap.to(target, { y: -40, scrollTrigger: { trigger: target, scrub: true } });
 *       }, scope);
 *     });
 *     return () => ctx?.revert();
 *   }, []);
 *
 * When motion is disabled, loadGsap() resolves to { gsap: null, ScrollTrigger: null }.
 * Callers MUST gate on the null check — never assume gsap is present.
 */

export type GsapBundle = {
  gsap: typeof import("gsap").gsap | null;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | null;
};

let cached: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (typeof window === "undefined") return Promise.resolve({ gsap: null, ScrollTrigger: null });

  if (motionDisabled()) return Promise.resolve({ gsap: null, ScrollTrigger: null });

  if (!cached) {
    cached = (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    })();
  }

  return cached;
}

function motionDisabled(): boolean {
  const html = document.documentElement;
  const setting = html.getAttribute("data-motion");
  if (setting === "off") return true;
  if (setting === "on") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
