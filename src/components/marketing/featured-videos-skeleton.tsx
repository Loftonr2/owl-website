import { Section, SectionHeader } from "@/components/ui/section";

/**
 * FeaturedVideosSkeleton — Suspense fallback for <FeaturedVideos />.
 *
 * Mirrors the real section's header + 3-column card grid footprint so there
 * is no layout shift when the live YouTube data resolves and swaps in.
 * Pure markup, no data/JS — renders instantly as part of the initial HTML
 * stream while FeaturedVideos awaits the network call inside its own
 * Suspense boundary.
 */
export function FeaturedVideosSkeleton() {
  return (
    <Section width="wide" pad="lg" bg="cream">
      <SectionHeader
        eyebrow="This week's videos"
        title="Sing-along learning, with Larissa"
        subtitle="Multicultural music videos that grow with your child — from first lullabies to character lessons."
      />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            aria-hidden
            className="overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-white shadow-owl-1"
          >
            <div className="aspect-video w-full animate-pulse bg-owl-cream-deep/60" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-owl-cream-deep/60" />
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-owl-cream-deep/40" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
