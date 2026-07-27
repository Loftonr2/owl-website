"use client";

/**
 * AboutWhyOwlExists
 * ──────────────────
 * "WHY OWL EXISTS" section.
 *
 * Displays the approved why-owl-exists.png artwork as the sole visual.
 * Seven minimal pill buttons beneath the artwork open modal dialogs with the
 * full two-paragraph explanation for each reason. No card grid is rendered —
 * the approved image IS the visual design.
 *
 * Image sizing: 65% desktop · 82% tablet · 94% mobile (centred)
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { WhyOwlModal, type WhyOwlItem } from "./why-owl-modal";

// ── Data ──────────────────────────────────────────────────────────────────────

const WHY_OWL_ITEMS: WhyOwlItem[] = [
  {
    id: "music-builds-connection",
    title: "Music Builds Connection",
    paragraphs: [
      "Music creates a shared experience that brings children, families, educators, and communities closer together. Singing, moving, and learning through rhythm encourage participation while helping children express themselves in ways that feel natural, joyful, and welcoming.",
      "These musical experiences also create lasting memories and strengthen emotional bonds. Whether a child is singing with a parent, participating in a classroom activity, or enjoying an OWL program at home, music becomes a bridge that supports communication, trust, and meaningful connection.",
    ],
  },
  {
    id: "nurtures-confidence",
    title: "Nurtures Confidence",
    paragraphs: [
      "OWL encourages every child to recognize that their voice, ideas, personality, and way of learning are valuable. Through positive songs, affirming stories, and supportive activities, children are given opportunities to participate without fear of being judged or compared to others.",
      "As children feel seen and heard, they become more comfortable expressing themselves, asking questions, and trying new things. This growing confidence can support their development at home, in school, and in social settings while helping them build a healthy sense of identity.",
    ],
  },
  {
    id: "makes-learning-joyful",
    title: "Makes Learning Joyful",
    paragraphs: [
      "Children often learn best when education feels engaging, playful, and connected to their interests. OWL combines music, movement, storytelling, creativity, and interactive activities to make important lessons feel exciting rather than overwhelming.",
      "This joyful approach helps children remain curious and motivated. By turning educational concepts into memorable experiences, OWL supports learning that feels natural, meaningful, and easier for children to carry into their everyday lives.",
    ],
  },
  {
    id: "celebrates-our-world",
    title: "Celebrates Our World",
    paragraphs: [
      "OWL introduces children to the beauty of different cultures, languages, traditions, communities, and ways of life. Through thoughtful stories, music, and educational content, children are encouraged to explore the world with openness and respect.",
      "Celebrating diversity helps children understand that differences should be appreciated rather than feared. These experiences can build empathy, cultural awareness, and curiosity while helping every child feel that their own background and identity are worthy of recognition.",
    ],
  },
  {
    id: "safe-kind-trustworthy",
    title: "Safe, Kind, and Trustworthy",
    paragraphs: [
      "Families and educators need content they can trust. OWL is committed to creating age-appropriate experiences that are thoughtful, uplifting, and designed with the emotional and developmental needs of children in mind.",
      "Safety also means promoting kindness, respect, healthy communication, and positive behavior. Every OWL experience should give caregivers confidence that children are engaging with material that supports their growth without exposing them to unnecessary fear, negativity, or harmful messaging.",
    ],
  },
  {
    id: "inspires-creativity",
    title: "Inspires Creativity",
    paragraphs: [
      "Creativity gives children the freedom to imagine, experiment, problem-solve, and communicate their ideas in original ways. OWL encourages creative expression through music, art, movement, stories, play, and activities that invite children to participate rather than simply observe.",
      "By nurturing creativity, OWL helps children become more confident thinkers and expressive learners. These experiences can strengthen curiosity, flexibility, and innovation while reminding children that there is more than one way to explore an idea or solve a problem.",
    ],
  },
  {
    id: "supports-families-educators",
    title: "Supports Families & Educators",
    paragraphs: [
      "OWL is designed not only for children, but also for the adults who guide and care for them. Parents, caregivers, teachers, and educators receive practical resources, ideas, and experiences that can support learning, communication, routines, and connection.",
      "By giving adults useful tools they can apply at home or in educational settings, OWL helps create a stronger support system around each child. The goal is to make meaningful learning easier to access while helping families and educators feel encouraged, informed, and connected.",
    ],
  },
];

// ── Main section ──────────────────────────────────────────────────────────────

export function AboutWhyOwlExists() {
  const [activeItem, setActiveItem] = useState<WhyOwlItem | null>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const getTriggerRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) triggerRefs.current.set(id, el);
    else triggerRefs.current.delete(id);
  };

  const openModal = (item: WhyOwlItem) => setActiveItem(item);
  const closeModal = () => setActiveItem(null);

  const triggerRef = {
    current: activeItem ? (triggerRefs.current.get(activeItem.id) ?? null) : null,
  } as React.RefObject<HTMLElement | null>;

  return (
    <>
      <section
        aria-labelledby="why-owl-heading"
        className="bg-[#EAF5F5] py-10 md:py-14"
      >
        <h2 id="why-owl-heading" className="sr-only">
          Why OWL Exists
        </h2>

        {/* ── Approved section artwork — 65% desktop · 82% tablet · 94% mobile ── */}
        <div className="mx-auto w-[94%] sm:w-[82%] lg:w-[65%]">
          <figure className="overflow-hidden rounded-3xl shadow-owl-2">
            <Image
              src="/images/about/redesign/why-owl-exists.png"
              alt="Why OWL Exists — We believe every child deserves to be seen, heard, and celebrated. Seven illustrated value cards surrounding the OWL mascot."
              width={1672}
              height={941}
              className="w-full h-auto"
            />
          </figure>
        </div>

        {/* ── Seven accessible modal triggers — pill style, no card recreation ── */}
        <div className="mx-auto mt-8 w-[94%] sm:w-[82%] lg:w-[65%]">
          <p className="mb-4 text-center font-display text-xs font-bold uppercase tracking-[0.2em] text-owl-teal/80">
            Click any reason to learn more
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {WHY_OWL_ITEMS.map((item) => (
              <button
                key={item.id}
                ref={getTriggerRef(item.id)}
                type="button"
                onClick={() => openModal(item)}
                aria-label={`Learn more about: ${item.title}`}
                className={cn(
                  "rounded-full border border-owl-teal/50 px-4 py-1.5",
                  "font-display text-xs font-bold text-owl-teal",
                  "transition-all duration-150",
                  "hover:bg-owl-teal hover:text-white hover:border-owl-teal",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Single shared modal */}
      <WhyOwlModal item={activeItem} onClose={closeModal} triggerRef={triggerRef} />
    </>
  );
}
