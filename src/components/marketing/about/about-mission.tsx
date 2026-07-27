"use client";

/**
 * AboutMission
 * ────────────
 * "OUR MISSION" section.
 *
 * Displays the approved OWL Mission artwork (owl-mission.png) as the primary
 * visual of this section. A real "See More" toggle beneath the artwork expands
 * the full mission text as accessible HTML.
 */

import { useState, useId } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

const ALL_PARAGRAPHS = [
  "At OWL Sing Together, our mission is to nurture every child's love of learning through the universal language of music. We believe that joyful, meaningful songs can open hearts, spark curiosity, and build bridges between children, families, and communities around the world.",
  "We are committed to creating inclusive, multicultural musical experiences that celebrate diversity and reflect the beautiful tapestry of human experience. Every song, story, and resource we create is designed to make every child feel seen, valued, and celebrated — no matter where they come from or what language they speak at home.",
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
      className="bg-white py-10 md:py-14"
    >
      {/* Screen-reader heading — visual heading is rendered inside the artwork image */}
      <h2 id="owl-mission-heading" className="sr-only">
        Our Mission — Building Brighter Tomorrows Through Music and Connection
      </h2>

      {/* 65% desktop · 82% tablet · 94% mobile */}
      <div className="mx-auto w-[94%] sm:w-[82%] lg:w-[65%]">

        {/* ── Approved section artwork ─────────────────────────────────────── */}
        <figure className="overflow-hidden rounded-3xl shadow-owl-3">
          <Image
            src="/images/about/owl-mission-mascot.png"
            alt="OWL Mission — Building Brighter Tomorrows Through Music and Connection: our commitment to nurturing every child's love of learning through music, inclusivity, and community."
            width={1672}
            height={941}
            className="w-full h-auto"
            priority
          />
        </figure>

        {/* ── See More toggle ──────────────────────────────────────────────── */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
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
            {/* Animated arrow */}
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-white/25",
                "transition-transform duration-300",
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

        {/* ── Expandable full mission text ─────────────────────────────────── */}
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
              <div className="mt-4 rounded-3xl bg-owl-cream px-8 py-8 sm:px-10">
                <div className="space-y-4 text-base leading-relaxed text-owl-ink/80">
                  {ALL_PARAGRAPHS.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
