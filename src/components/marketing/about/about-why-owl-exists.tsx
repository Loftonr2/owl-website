"use client";

/**
 * AboutWhyOwlExists
 * ──────────────────
 * "WHY OWL EXISTS" section.
 *
 * Each of the seven cards is a <button type="button"> that opens a WhyOwlModal
 * dialog containing the full two-paragraph explanation for that item.
 *
 * Accessibility per brief:
 *  - Mouse click, Enter, Space all open the modal
 *  - Visible focus ring on every card
 *  - Hover and active/pressed states
 *  - aria-label on each button
 *  - Single WhyOwlModal instance shared across all seven cards
 *  - Focus returned to the card that opened the modal on close
 *
 * Design reference: why-owl-exists.png (visual spec, not used as background)
 * Mascot: /images/brand/mascot.png
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { Music, Heart, Star, Globe2, Shield, Leaf, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { WhyOwlModal, type WhyOwlItem } from "./why-owl-modal";

// ── Data ──────────────────────────────────────────────────────────────────────
// paragraphs contains the exact text from the product brief (Phase 6).

const WHY_OWL_ITEMS: (WhyOwlItem & {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  shortBody: string;
})[] = [
  {
    id: "music-builds-connection",
    icon: Music,
    iconColor: "text-owl-rose",
    iconBg: "bg-owl-rose/10",
    title: "Music Builds Connection",
    shortBody:
      "Song is humanity's oldest shared language — music brings children, families, and communities closer together.",
    paragraphs: [
      "Music creates a shared experience that brings children, families, educators, and communities closer together. Singing, moving, and learning through rhythm encourage participation while helping children express themselves in ways that feel natural, joyful, and welcoming.",
      "These musical experiences also create lasting memories and strengthen emotional bonds. Whether a child is singing with a parent, participating in a classroom activity, or enjoying an OWL program at home, music becomes a bridge that supports communication, trust, and meaningful connection.",
    ],
  },
  {
    id: "nurtures-confidence",
    icon: Heart,
    iconColor: "text-owl-teal",
    iconBg: "bg-owl-teal/10",
    title: "Nurtures Confidence",
    shortBody:
      "When children feel seen and heard, they grow more comfortable expressing themselves and trying new things.",
    paragraphs: [
      "OWL encourages every child to recognize that their voice, ideas, personality, and way of learning are valuable. Through positive songs, affirming stories, and supportive activities, children are given opportunities to participate without fear of being judged or compared to others.",
      "As children feel seen and heard, they become more comfortable expressing themselves, asking questions, and trying new things. This growing confidence can support their development at home, in school, and in social settings while helping them build a healthy sense of identity.",
    ],
  },
  {
    id: "makes-learning-joyful",
    icon: Star,
    iconColor: "text-owl-amber",
    iconBg: "bg-owl-amber/10",
    title: "Makes Learning Joyful",
    shortBody:
      "Children learn best when education feels engaging, playful, and connected to their interests.",
    paragraphs: [
      "Children often learn best when education feels engaging, playful, and connected to their interests. OWL combines music, movement, storytelling, creativity, and interactive activities to make important lessons feel exciting rather than overwhelming.",
      "This joyful approach helps children remain curious and motivated. By turning educational concepts into memorable experiences, OWL supports learning that feels natural, meaningful, and easier for children to carry into their everyday lives.",
    ],
  },
  {
    id: "celebrates-our-world",
    icon: Globe2,
    iconColor: "text-owl-teal",
    iconBg: "bg-owl-teal/10",
    title: "Celebrates Our World",
    shortBody:
      "OWL introduces children to the beauty of different cultures, languages, and traditions from around the world.",
    paragraphs: [
      "OWL introduces children to the beauty of different cultures, languages, traditions, communities, and ways of life. Through thoughtful stories, music, and educational content, children are encouraged to explore the world with openness and respect.",
      "Celebrating diversity helps children understand that differences should be appreciated rather than feared. These experiences can build empathy, cultural awareness, and curiosity while helping every child feel that their own background and identity are worthy of recognition.",
    ],
  },
  {
    id: "safe-kind-trustworthy",
    icon: Shield,
    iconColor: "text-owl-teal",
    iconBg: "bg-owl-teal/10",
    title: "Safe, Kind, and Trustworthy",
    shortBody:
      "Every OWL experience is thoughtful, uplifting, and designed with the emotional needs of children in mind.",
    paragraphs: [
      "Families and educators need content they can trust. OWL is committed to creating age-appropriate experiences that are thoughtful, uplifting, and designed with the emotional and developmental needs of children in mind.",
      "Safety also means promoting kindness, respect, healthy communication, and positive behavior. Every OWL experience should give caregivers confidence that children are engaging with material that supports their growth without exposing them to unnecessary fear, negativity, or harmful messaging.",
    ],
  },
  {
    id: "inspires-creativity",
    icon: Leaf,
    iconColor: "text-owl-forest",
    iconBg: "bg-owl-forest/10",
    title: "Inspires Creativity",
    shortBody:
      "OWL encourages children to imagine, experiment, and communicate ideas through music, art, and play.",
    paragraphs: [
      "Creativity gives children the freedom to imagine, experiment, problem-solve, and communicate their ideas in original ways. OWL encourages creative expression through music, art, movement, stories, play, and activities that invite children to participate rather than simply observe.",
      "By nurturing creativity, OWL helps children become more confident thinkers and expressive learners. These experiences can strengthen curiosity, flexibility, and innovation while reminding children that there is more than one way to explore an idea or solve a problem.",
    ],
  },
  {
    id: "supports-families-educators",
    icon: Users,
    iconColor: "text-owl-rose",
    iconBg: "bg-owl-rose/10",
    title: "Supports Families & Educators",
    shortBody:
      "OWL gives adults the resources, ideas, and support to make learning meaningful at home and in school.",
    paragraphs: [
      "OWL is designed not only for children, but also for the adults who guide and care for them. Parents, caregivers, teachers, and educators receive practical resources, ideas, and experiences that can support learning, communication, routines, and connection.",
      "By giving adults useful tools they can apply at home or in educational settings, OWL helps create a stronger support system around each child. The goal is to make meaningful learning easier to access while helping families and educators feel encouraged, informed, and connected.",
    ],
  },
];

const LEFT_ITEMS = WHY_OWL_ITEMS.slice(0, 3);
const RIGHT_ITEMS = WHY_OWL_ITEMS.slice(3);

// ── Card component ────────────────────────────────────────────────────────────

interface ReasonCardProps {
  item: (typeof WHY_OWL_ITEMS)[0];
  onClick: () => void;
  triggerRef: (el: HTMLButtonElement | null) => void;
}

function ReasonCard({ item, onClick, triggerRef }: ReasonCardProps) {
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-label={`Learn more about: ${item.title}`}
      onClick={onClick}
      className={cn(
        // Layout
        "flex w-full items-start gap-4 rounded-2xl bg-white p-5 text-left shadow-owl-1",
        // Motion
        "transition-all duration-200 ease-owl",
        "hover:-translate-y-0.5 hover:shadow-owl-2 hover:bg-owl-cream",
        // Active / pressed feedback
        "active:scale-[0.985] active:shadow-owl-1",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-owl-teal focus-visible:ring-offset-2",
        // Group for internal hover effects
        "group cursor-pointer"
      )}
    >
      {/* Icon pill */}
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          "transition-transform duration-200 group-hover:scale-110",
          item.iconBg
        )}
        aria-hidden
      >
        <item.icon className={cn("h-5 w-5", item.iconColor)} />
      </span>

      {/* Text */}
      <div className="flex-1">
        <h3 className="font-display text-sm font-extrabold text-owl-ink">
          {item.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-owl-ink/70">
          {item.shortBody}
        </p>
        {/* "Read more" affordance */}
        <span
          className={cn(
            "mt-2 inline-block font-display text-xs font-bold text-owl-teal",
            "transition-colors duration-150 group-hover:text-owl-teal-deep"
          )}
          aria-hidden
        >
          Read more →
        </span>
      </div>
    </button>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export function AboutWhyOwlExists() {
  const [activeItem, setActiveItem] = useState<(typeof WHY_OWL_ITEMS)[0] | null>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const getTriggerRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) triggerRefs.current.set(id, el);
    else triggerRefs.current.delete(id);
  };

  const openModal = (item: (typeof WHY_OWL_ITEMS)[0]) => setActiveItem(item);
  const closeModal = () => setActiveItem(null);

  const triggerRef = {
    current: activeItem ? (triggerRefs.current.get(activeItem.id) ?? null) : null,
  } as React.RefObject<HTMLElement | null>;

  // Build modal item (WhyOwlItem shape, no icon/shortBody)
  const modalItem: WhyOwlItem | null = activeItem
    ? { id: activeItem.id, title: activeItem.title, paragraphs: activeItem.paragraphs }
    : null;

  return (
    <>
      <section
        aria-labelledby="why-owl-heading"
        className="bg-[#EAF5F5]"
      >
        {/* ── Approved section artwork ─────────────────────────────────────── */}
        <figure className="overflow-hidden">
          <Image
            src="/images/about/redesign/why-owl-exists.png"
            alt="Why OWL Exists — We believe every child deserves to be seen, heard, and celebrated. Seven illustrated value cards surrounding the OWL mascot."
            width={1672}
            height={941}
            className="w-full h-auto"
          />
        </figure>

        <div className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          {/* Eyebrow + heading */}
          <div className="mb-12 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-owl-teal">
              THE OWL PURPOSE
            </p>
            <div className="mt-2 flex items-center justify-center gap-3" aria-hidden>
              <div className="h-px w-8 bg-owl-teal/50" />
              <svg
                width="12"
                height="11"
                viewBox="0 0 12 11"
                fill="currentColor"
                className="text-owl-teal"
              >
                <path d="M6 10.2S1 6.8 1 3.9a2.5 2.5 0 015 0 2.5 2.5 0 015 0C11 6.8 6 10.2 6 10.2z" />
              </svg>
              <div className="h-px w-8 bg-owl-teal/50" />
            </div>
            <h2
              id="why-owl-heading"
              className="mt-4 font-display text-3xl font-extrabold text-owl-ink sm:text-4xl"
            >
              Why OWL Exists
            </h2>
            <p className="mt-3 text-base leading-relaxed text-owl-ink/70">
              Seven reasons music is at the heart of everything we do. Click any card to learn more.
            </p>
          </div>

          {/* Three-column: left cards | mascot | right cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,auto,1fr]">
            {/* Left — 3 cards */}
            <div className="flex flex-col gap-4">
              {LEFT_ITEMS.map((item) => (
                <ReasonCard
                  key={item.id}
                  item={item}
                  onClick={() => openModal(item)}
                  triggerRef={getTriggerRef(item.id)}
                />
              ))}
            </div>

            {/* Centre — mascot */}
            <div className="flex items-center justify-center py-6 lg:py-0">
              <div className="relative flex h-52 w-52 shrink-0 items-center justify-center rounded-full bg-owl-teal shadow-owl-2 lg:h-64 lg:w-64">
                <Image
                  src="/images/brand/mascot.png"
                  alt="OWL mascot — the heart of OWL Sing Together"
                  width={200}
                  height={200}
                  className="relative z-10 h-auto w-[75%] object-contain drop-shadow-lg"
                  sizes="200px"
                />
              </div>
            </div>

            {/* Right — 4 cards */}
            <div className="flex flex-col gap-4">
              {RIGHT_ITEMS.map((item) => (
                <ReasonCard
                  key={item.id}
                  item={item}
                  onClick={() => openModal(item)}
                  triggerRef={getTriggerRef(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Single shared modal — rendered outside the section for correct stacking */}
      <WhyOwlModal item={modalItem} onClose={closeModal} triggerRef={triggerRef} />
    </>
  );
}
