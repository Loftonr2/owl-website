"use client";

/**
 * AboutMission
 * ────────────
 * "OUR MISSION" section.
 * Collapsible card: 2 visible paragraphs + "See More" toggle reveals the rest.
 * Design reference: OWL Mission.png (supplied asset — not used as background,
 * used as visual spec; all text is live semantic HTML).
 */

import { useState, useId } from "react";
import { Music, Star, Heart, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

const VISIBLE_PARAGRAPHS = [
  "At OWL Sing Together, our mission is to nurture every child's love of learning through the universal language of music. We believe that joyful, meaningful songs can open hearts, spark curiosity, and build bridges between children, families, and communities around the world.",
  "We are committed to creating inclusive, multicultural musical experiences that celebrate diversity and reflect the beautiful tapestry of human experience. Every song, story, and resource we create is designed to make every child feel seen, valued, and celebrated — no matter where they come from or what language they speak at home.",
];

const HIDDEN_PARAGRAPHS = [
  "Our approach is rooted in evidence-based learning and a deep respect for the whole child. We recognize that music is not just entertainment — it is a powerful educational tool that supports language acquisition, emotional regulation, social development, and cognitive growth. When children sing together, they build vocabulary, develop listening skills, and learn to express themselves with confidence.",
  "We partner with educators, therapists, and families to ensure our content meets children where they are. From lullabies for newborns to culturally rich songs for older learners, OWL grows with your child through every stage of development — from birth through age 14.",
  "Our team brings together special education expertise, musical artistry, and family advocacy in everything we create. We collaborate with composers, educators, and artists from around the world who share our commitment to quality, inclusivity, and joy. Every instrument, every lyric, and every visual is chosen with intention.",
  "We are particularly passionate about serving families who have traditionally been underrepresented in children's media. We create content in multiple languages, featuring characters and stories from diverse cultures, because we know that representation matters deeply for a child's sense of self and belonging.",
  "At OWL, we also believe in the power of community. We support caregivers, parents, and educators with resources, inspiration, and connection — because the adults in a child's life are the most important teachers they will ever have. Our newsletter, blog, printables, and community spaces are designed to inspire and empower every member of your family's learning journey.",
  "Ultimately, we measure our success not in views or downloads, but in the moments of connection our music creates. The child who finally finds words for their feelings. The parent who discovers a new song to share at bedtime. The teacher who finds exactly the resource they needed. These are the moments that drive everything we do at OWL Sing Together.",
  "We are grateful for every family who has welcomed OWL into their home. Together, we are building brighter tomorrows — one song at a time.",
];

export function AboutMission() {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section
      aria-labelledby="owl-mission-heading"
      className="relative overflow-hidden bg-white py-16 md:py-24"
    >
      {/* Decorative Lucide icons — aria-hidden, purely visual */}
      <Music
        className="pointer-events-none absolute -left-6 top-10 h-24 w-24 rotate-[-15deg] text-owl-teal/8"
        aria-hidden
      />
      <Star
        className="pointer-events-none absolute right-8 top-6 h-16 w-16 rotate-12 text-owl-amber/10"
        aria-hidden
      />
      <Heart
        className="pointer-events-none absolute bottom-10 left-1/4 h-12 w-12 rotate-[-8deg] text-owl-rose/8"
        aria-hidden
      />
      <Leaf
        className="pointer-events-none absolute bottom-16 right-12 h-14 w-14 rotate-20 text-owl-forest/8"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-6 sm:px-10">
        {/* White card with shadow */}
        <div className="rounded-3xl bg-white px-8 py-12 shadow-owl-3 ring-1 ring-owl-cream-deep sm:px-12">
          {/* Eyebrow */}
          <p className="text-center font-display text-xs font-bold uppercase tracking-[0.25em] text-owl-teal">
            OUR MISSION
          </p>

          {/* Teal heart divider */}
          <div className="mt-3 flex items-center justify-center gap-3" aria-hidden>
            <div className="h-px w-10 bg-owl-teal/40" />
            <svg width="14" height="13" viewBox="0 0 14 13" fill="currentColor" className="text-owl-teal">
              <path d="M7 12S1 8 1 4.5a3 3 0 016 0 3 3 0 016 0C13 8 7 12 7 12z" />
            </svg>
            <div className="h-px w-10 bg-owl-teal/40" />
          </div>

          {/* Heading */}
          <h2
            id="owl-mission-heading"
            className="mt-5 text-center font-display text-2xl font-extrabold leading-snug text-owl-ink sm:text-3xl"
          >
            Building Brighter Tomorrows Through Music &amp; Connection
          </h2>

          {/* Always-visible paragraphs */}
          <div className="mt-6 space-y-4 text-base leading-relaxed text-owl-ink/80">
            {VISIBLE_PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
          </div>

          {/* Collapsible extension */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id={contentId}
                key="mission-extra"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4 text-base leading-relaxed text-owl-ink/80">
                  {HIDDEN_PARAGRAPHS.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* "See More / See Less" toggle */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls={contentId}
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-owl-teal px-7 py-2.5",
                "font-display text-sm font-bold text-white",
                "transition-all duration-150 hover:bg-owl-teal-deep",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
              )}
            >
              {expanded ? "See Less" : "See More"}
              {/* Animated arrow circle */}
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full bg-white/25 transition-transform duration-300",
                  expanded ? "rotate-180" : "rotate-0"
                )}
                aria-hidden
              >
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
