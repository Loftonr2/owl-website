import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

/**
 * Seasonal Spotlight — rotates with the cultural calendar.
 * Editable from CMS in Phase 4.5 (Sanity `seasonalCampaign` field, TBD).
 *
 * Phase 4 ships with a static spotlight tied to the current month.
 * Today (May 11) → "Asian American & Pacific Islander Heritage Month"
 * adjacent placeholders ready for swap by Larissa.
 */
export function SeasonalSpotlight() {
  return (
    <Section width="wide" pad="lg" bg="white">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div className="relative order-2 aspect-[5/4] w-full overflow-hidden rounded-owl-hero md:order-1">
          <video
            src="/videos/multicultural-spotlight.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="order-1 md:order-2">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-amber">
            Now celebrating
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-owl-ink sm:text-4xl">
            Cultural celebrations, all year long
          </h2>
          <p className="mt-4 text-base leading-relaxed text-owl-mist">
            Each month, OWL spotlights a different cultural tradition. Songs,
            videos, printables, and family-friendly stories that help children
            see themselves — and each other — clearly.
          </p>
          <Button asChild intent="tertiary" size="lg" className="mt-8">
            <Link href="/holidays">
              Visit the holiday hub <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
