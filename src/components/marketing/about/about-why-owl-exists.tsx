"use client";

/**
 * AboutWhyOwlExists
 * ──────────────────
 * "WHY OWL EXISTS" section — 7 reason cards arranged in two columns with
 * the OWL mascot displayed in a large teal circle on the left.
 *
 * Design reference: why-owl-exists.png (approved asset — used as visual spec,
 * not as a background. All text is live semantic HTML).
 * Mascot: /images/brand/mascot.png
 */

import Image from "next/image";
import { Music, Heart, Star, Globe2, Shield, Leaf, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const REASONS = [
  {
    id: "music-builds-connection",
    icon: Music,
    iconColor: "text-owl-rose",
    iconBg: "bg-owl-rose/10",
    title: "Music Builds Connection",
    body: "Song is humanity's oldest shared language. Music brings children, families, and communities together across every barrier.",
  },
  {
    id: "nurtures-confidence",
    icon: Heart,
    iconColor: "text-owl-teal",
    iconBg: "bg-owl-teal/10",
    title: "Nurtures Confidence",
    body: "When children hear their culture reflected in music, they feel seen — and that recognition becomes the foundation of lifelong confidence.",
  },
  {
    id: "makes-learning-joyful",
    icon: Star,
    iconColor: "text-owl-amber",
    iconBg: "bg-owl-amber/10",
    title: "Makes Learning Joyful",
    body: "Children learn best when they are delighted. Our songs are crafted to be irresistible — so learning happens naturally, in the middle of the fun.",
  },
  {
    id: "celebrates-our-world",
    icon: Globe2,
    iconColor: "text-owl-teal",
    iconBg: "bg-owl-teal/10",
    title: "Celebrates Our World",
    body: "We draw from musical traditions across every continent, helping children grow into curious, culturally fluent global citizens.",
  },
  {
    id: "safe-kind-trustworthy",
    icon: Shield,
    iconColor: "text-owl-teal",
    iconBg: "bg-owl-teal/10",
    title: "Safe, Kind, and Trustworthy",
    body: "Parents trust OWL because every video, song, and printable is designed with the whole child in mind — safe for the youngest learners, meaningful for older ones.",
  },
  {
    id: "inspires-creativity",
    icon: Leaf,
    iconColor: "text-owl-forest",
    iconBg: "bg-owl-forest/10",
    title: "Inspires Creativity",
    body: "Exposure to rich musical artistry from an early age ignites a child's imagination and opens the door to their own creative expression.",
  },
  {
    id: "supports-families-educators",
    icon: Users,
    iconColor: "text-owl-rose",
    iconBg: "bg-owl-rose/10",
    title: "Supports Families &amp; Educators",
    body: "We resource the adults who love children — with professional-quality tools, curated playlists, and a warm, supportive community.",
  },
];

// Split into left (3) and right (4) columns to match the design reference
const LEFT_REASONS = REASONS.slice(0, 3);
const RIGHT_REASONS = REASONS.slice(3);

interface ReasonCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
}

function ReasonCard({ icon: Icon, iconColor, iconBg, title, body }: ReasonCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl bg-white p-5 shadow-owl-1",
        "transition-all duration-300 ease-owl",
        "hover:-translate-y-0.5 hover:shadow-owl-2"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconBg
        )}
        aria-hidden
      >
        <Icon className={cn("h-5 w-5", iconColor)} />
      </span>
      <div>
        <h3
          className="font-display text-sm font-extrabold text-owl-ink"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="mt-1 text-sm leading-relaxed text-owl-ink/70">{body}</p>
      </div>
    </div>
  );
}

export function AboutWhyOwlExists() {
  return (
    <section
      aria-labelledby="why-owl-heading"
      className="bg-[#EAF5F5] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Eyebrow + heading — centered */}
        <div className="mb-12 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-owl-teal">
            THE OWL PURPOSE
          </p>
          <div className="mt-2 flex items-center justify-center gap-3" aria-hidden>
            <div className="h-px w-8 bg-owl-teal/50" />
            <svg width="12" height="11" viewBox="0 0 12 11" fill="currentColor" className="text-owl-teal">
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
            Seven reasons music is at the heart of everything we do.
          </p>
        </div>

        {/* Three-column layout: left cards | mascot | right cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,auto,1fr]">
          {/* Left column — 3 cards */}
          <div className="flex flex-col gap-4">
            {LEFT_REASONS.map((r) => (
              <ReasonCard key={r.id} {...r} />
            ))}
          </div>

          {/* Centre mascot circle */}
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

          {/* Right column — 4 cards */}
          <div className="flex flex-col gap-4">
            {RIGHT_REASONS.map((r) => (
              <ReasonCard key={r.id} {...r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
