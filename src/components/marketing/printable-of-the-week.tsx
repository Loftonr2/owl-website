import { Sparkles } from "lucide-react";
import { Section } from "@/components/ui/section";
import { GlassCard } from "@/components/ui/glass-card";
import { OwlMark } from "@/components/brand/owl-logo";
import { NewsletterForm } from "./newsletter-form";

/**
 * Free Printable of the Week — homepage's primary email-capture surface.
 * Email-gated download per CLAUDE_READ_FIRST §13 (non-negotiable).
 *
 * v3: left column is a looping autoplay-muted video (no ambient layer).
 */
export function PrintableOfTheWeek() {
  return (
    <Section width="wide" pad="lg" bg="cream-deep">
      <div className="relative isolate grid grid-cols-1 items-center gap-10 overflow-hidden rounded-owl-hero bg-owl-white p-6 shadow-owl-1 md:grid-cols-2 md:p-10">

        {/* Video preview */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-owl-card bg-owl-amber-soft/20 md:aspect-[4/5]">
          <video
            src="/videos/printable-of-week-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Glass badge */}
          <GlassCard
            variant="frost"
            className="absolute left-4 top-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-owl-ink"
          >
            <Sparkles className="h-3.5 w-3.5 text-owl-amber" aria-hidden />
            Free this week
          </GlassCard>
          {/* OwlMark watermark */}
          <OwlMark
            decorative
            className="absolute bottom-4 right-4 h-10 w-10 opacity-90 drop-shadow-sm"
          />
        </div>

        <div className="relative z-10">
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal">
            Free printable of the week
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
            OWL ABC Pack — Around the World
          </h2>
          <p className="mt-4 text-base leading-relaxed text-owl-ink/75">
            A three-page printable with multicultural alphabet illustrations.
            Print on regular paper. Lay it on the kitchen table. Sing it
            together. A gentle place to start.
          </p>

          <ul className="mt-6 space-y-2 text-sm text-owl-ink">
            <li>✓ Ages 2–5, 3 pages</li>
            <li>✓ Tracing letters + multicultural character art</li>
            <li>✓ Comes with the matching video link</li>
          </ul>

          <div className="mt-8">
            <NewsletterForm
              source="printable-gate"
              segment="A2"
              ctaLabel="Send me the pack"
              layout="inline"
            />
          </div>

          <p className="mt-3 text-xs italic text-owl-mist">
            We email the PDF to you — no payment, no tricks.
          </p>
        </div>
      </div>
    </Section>
  );
}
