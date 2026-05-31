import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Globe2,
  BookOpen,
  ClipboardCheck,
  FileText,
  Music2,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

// Shared system primitives
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { MediaRail } from "@/components/marketing/media-rail";
import { PrintableCard } from "@/components/marketing/printable-card";
import { PlaylistCard } from "@/components/marketing/playlist-card";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { SEED_PRINTABLES } from "@/lib/seed/printables";
import { SEED_PLAYLISTS } from "@/lib/seed/playlists";

export const metadata = pageMetadata({
  title: "For Educators",
  description:
    "Standards-aligned, multicultural curriculum for classrooms, daycares, and homeschool families.",
  path: "/educators",
});

/**
 * /educators — v3 (Visual-track Phase 3, structured motion).
 *
 * Page sections:
 *   1. Classroom-focused hero (CinematicHero, sequenceSlug=educators-classroom, slug=educators)
 *   2. Benefits row (StaggerGrid — structured)
 *   3. Featured tools / resources (StaggerGrid — structured)
 *   4. Printable lesson resources (MediaRail — scroll-snap on mobile)
 *   5. Playlists / resources (MediaRail)
 *   6. Trust + pricing teaser
 *   7. Newsletter band
 *
 * Motion vocabulary: more structured than About — `<StaggerGrid>` cascades
 * benefits + tools in tight (60–80ms) waves so the page reads like a sales
 * deck. Sharper timing (350ms duration vs About's 520ms). Reduced-motion
 * mode renders each grid as a plain `<ul>` with no transforms.
 */

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Standards Aligned",
    body: "Explore Head Start ELOF, Common Core standards, and CDC milestones aligned.",
    color: "bg-owl-teal/10 text-owl-teal",
  },
  {
    icon: Globe2,
    title: "Inclusive Content",
    body: "Capture more cantra content, awareness/outcomes, and meaning.",
    color: "bg-owl-rose/10 text-owl-rose",
  },
  {
    icon: Music2,
    title: "Engaging Multimedia",
    body: "Explore launch activities with engaging multimedia.",
    color: "bg-owl-amber/10 text-owl-amber",
  },
] as const;

const FEATURED_TOOLS = [
  {
    icon: FileText,
    title: "Core Lesson Plans",
    badge: "Download",
    href: "/printables",
    imgSrc: "/images/educators/core-lesson-plans.png",
    bar: "bg-owl-teal",
    color: "bg-owl-teal/10 text-owl-teal",
  },
  {
    icon: ClipboardCheck,
    title: "Activity Bundles Calendar",
    badge: "Download",
    href: "/printables",
    imgSrc: "/images/educators/activity-bundles-calendar.png",
    bar: "bg-owl-amber",
    color: "bg-owl-amber/10 text-owl-amber",
  },
  {
    icon: BookOpen,
    title: "Cultural Celebration Copies",
    badge: "Download",
    href: "/holidays",
    imgSrc: "/images/educators/cultural-celebration-copies.png",
    bar: "bg-owl-rose",
    color: "bg-owl-rose/10 text-owl-rose",
  },
  {
    icon: Music2,
    title: "Curated Audio Playlists",
    badge: "Download",
    href: "/music",
    imgSrc: "/images/educators/curated-audio-playlists.png",
    bar: "bg-owl-forest",
    color: "bg-owl-forest/10 text-owl-forest",
  },
];


const LICENSE_TIERS = [
  {
    name: "Individual teacher",
    price: "$199 / year",
    best: "One teacher, one classroom",
    bg: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    border: "border-owl-teal/35 hover:border-owl-teal/70",
    bar: "bg-owl-teal",
    priceColor: "text-owl-teal",
    hoverShadow: "hover:shadow-[0_8px_28px_rgba(13,168,159,0.22)]",
    btnGrad: "from-owl-teal to-[#0da89f]",
    btnShadow: "hover:shadow-[0_6px_24px_rgba(13,168,159,0.50)]",
  },
  {
    name: "School site",
    price: "$4,999 / year",
    best: "Up to 20 teachers, one school",
    bg: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#fff8ec]",
    border: "border-owl-amber/35 hover:border-owl-amber/70",
    bar: "bg-owl-amber",
    priceColor: "text-owl-amber",
    hoverShadow: "hover:shadow-[0_8px_28px_rgba(245,158,11,0.22)]",
    btnGrad: "from-[#f59e0b] to-[#d97706]",
    btnShadow: "hover:shadow-[0_6px_24px_rgba(245,158,11,0.50)]",
  },
  {
    name: "District",
    price: "$24,999 / year",
    best: "Multi-school, custom rollout",
    bg: "bg-gradient-to-br from-[#dff0e6] via-[#eef6f1] to-[#fff8ec]",
    border: "border-owl-forest/30 hover:border-owl-forest/65",
    bar: "bg-owl-forest",
    priceColor: "text-owl-forest",
    hoverShadow: "hover:shadow-[0_8px_28px_rgba(20,107,68,0.22)]",
    btnGrad: "from-[#146b44] to-[#0f5536]",
    btnShadow: "hover:shadow-[0_6px_24px_rgba(20,107,68,0.50)]",
  },
];

export default function EducatorsPage() {
  // The first 4 entries are the real downloadable workbooks — show those on educators page
  const educatorPrintables = SEED_PRINTABLES.slice(0, 4);

  const educatorPlaylists = SEED_PLAYLISTS.slice(0, 4);

  return (
    <>
      {/* 1 — Classroom-focused hero */}
      <VideoHeroBanner
        src="/videos/educators-hero.mp4"
        poster="/images/headers/educators-hero.png"
        eyebrow="For Educators"
        heading={
          <>
            Empower Your Classroom with{" "}
            <span className="text-owl-teal">Culturally Inclusive Learning!</span>
          </>
        }
        subhead="Classroom-ready multicultural learning resources. Standards-aligned, inclusive, and educator-approved."
        primaryCta={{ label: "Explore Tools", href: "#tools" }}
        secondaryCta={{ label: "Request Access", href: "/contact" }}
      />

      {/* 2 — Benefits row (Classroom-Ready Multicultural Learning Resources) */}
      <Section width="wide" pad="lg" bg="cream">
        <SectionIntro
          eyebrow="Why OWL"
          title="Classroom-Ready Multicultural Learning Resources."
          subtitle="Explores and certify curriculums includes educators and classrooms."
        />
        <StaggerGrid
          asList
          ariaLabel="OWL educator benefits"
          className="grid grid-cols-1 gap-5 sm:grid-cols-3"
          stagger={0.06}
          offsetY={14}
        >
          {BENEFITS.map(({ icon: Icon, title, body, color }) => (
            <div
              key={title}
              className="h-full rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2"
            >
              <span
                aria-hidden
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${color}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-semibold text-owl-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-owl-mist">{body}</p>
            </div>
          ))}
        </StaggerGrid>
      </Section>

      {/* 3 — Featured Educator Tools (with Download buttons) */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white" id="tools">
          <SectionIntro
            eyebrow="Tools"
            title="Featured Educator Tools"
            subtitle="Download classroom-ready resources — lesson plans, bundles, and playlists."
          />
          <StaggerGrid
            asList
            ariaLabel="OWL educator tools"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.07}
            offsetY={16}
          >
            {LICENSE_TIERS.map((t) => (
              <div
                key={t.name}
                className={`relative isolate flex h-full flex-col overflow-hidden rounded-owl-card border-2 ${t.border} ${t.bg} p-6 shadow-owl-1 ${t.hoverShadow} transition-all duration-300 ease-owl hover:-translate-y-1.5`}
              >
                {/* Coloured top bar */}
                <span aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 ${t.bar}`} />
                <div className="relative z-text mt-1 flex h-full flex-col">
                  <h3 className="font-display text-lg font-semibold text-owl-ink">{t.name}</h3>
                  <p className={`mt-2 font-display text-2xl font-bold ${t.priceColor}`}>{t.price}</p>
                  <p className="mt-3 text-sm text-owl-mist">Best for: {t.best}</p>
                  {/* Shimmer button */}
                  <Link
                    href="/contact"
                    className={`group relative mt-auto inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r ${t.btnGrad} px-6 py-2.5 font-display text-sm font-bold text-white shadow-owl-1 ${t.btnShadow} transition-all duration-300 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 mt-6`}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover:translate-x-full"
                    />
                    <span className="relative">Request access</span>
                  </Link>
                </div>
              </div>
            ))}
          </StaggerGrid>
          <p className="mt-6 text-xs italic text-owl-mist">
            The educator portal launches Phase 3 of the OWL roadmap (Q3 2026). Early-access list
            opens now.
          </p>
        </Section>
      </SectionReveal>

      {/* 7 — Newsletter band */}
      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
