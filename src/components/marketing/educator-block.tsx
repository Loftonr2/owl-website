import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

/**
 * Educator-aimed block — surfaces classroom + homeschool credibility on the
 * homepage. Phase 4 ships static; Phase 7 unlocks the gated portal preview.
 */
export function EducatorBlock() {
  return (
    <Section width="wide" pad="lg" bg="forest">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.5fr,1fr]">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-amber-soft">
            For educators
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Built for classrooms, daycares, and homeschool families.
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-white/80">
            Birth–5 curriculum tiers aligned with Head Start ELOF + CDC
            milestones. Multicultural-first design. Printable PDFs that match
            every video. Site licenses for classrooms and districts.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-2 text-sm text-white/90 sm:grid-cols-2">
            <li>✓ 6 tiers (Birth–5) · 216 lessons</li>
            <li>✓ Common Core + State PreK alignment</li>
            <li>✓ Bilingual EN/ES variants</li>
            <li>✓ Standards crosswalk per state</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild intent="primary" size="lg" className="bg-owl-amber text-owl-ink hover:bg-owl-amber-soft">
            <Link href="/educators">For educators</Link>
          </Button>
          <Button
            asChild
            intent="ghost"
            size="lg"
            className="border border-white/30 text-white hover:bg-white/10"
          >
            <Link href="/curriculum">Browse curriculum</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
