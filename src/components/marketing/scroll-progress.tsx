/**
 * ScrollProgress — thin gradient bar at the top of the viewport.
 *
 * Implementation: native CSS `animation-timeline: scroll()` (zero JS) where
 * supported; on browsers without scroll-driven animation, the bar just stays
 * at 0% — cosmetic, no functional impact.
 *
 * The bar sits at z-overlay so it draws over the sticky header. Decorative
 * (aria-hidden) — does not announce scroll position to assistive tech.
 *
 * Drop into the marketing layout once. Disabled when data-motion="off".
 */
export function ScrollProgress() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-overlay h-1"
    >
      <div className="owl-scroll-progress h-full bg-gradient-to-r from-owl-teal via-owl-amber to-owl-rose" />
    </div>
  );
}
