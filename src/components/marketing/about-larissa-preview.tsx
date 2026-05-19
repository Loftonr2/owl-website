import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { headers } from "@/lib/images";

/**
 * About-Larissa preview — emotional trust block.
 * Tone: simple, grounded, no business jargon (DESIGN_STYLE_GUIDE §11).
 */
export function AboutLarissaPreview() {
  return (
    <Section width="wide" pad="lg" bg="white">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-owl-hero md:aspect-[4/5]">
          <Image
            src={headers.about.src}
            alt={headers.about.alt}
            fill
            sizes="(min-width: 768px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-teal">
            Meet Larissa
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-owl-ink sm:text-4xl">
            A modern voice for warm, patient learning.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-owl-ink/80">
            <p>
              OWL Sing Together carries the tradition of Mr. Rogers into a
              digital, multicultural age. Larissa speaks directly to the child,
              moves slowly, names feelings, and makes every kid feel safe.
            </p>
            <p>
              No overstimulation. No defaults. Just consistent, gentle, joyful
              learning that grows with your family.
            </p>
          </div>
          <Button asChild intent="ghost" size="md" className="mt-8 px-0">
            <Link href="/about">Read Larissa&apos;s story →</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
