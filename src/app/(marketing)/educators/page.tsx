import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Globe2,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  FileText,
  Music2,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

// Shared system primitives
import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { StaggerGrid } from "@/components/marketing/stagger-grid";
import { MediaRail } from "@/components/marketing/media-rail";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
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
    color: "bg-owl-teal/10 text-owl-teal",
  },
  {
    icon: ClipboardCheck,
    title: "Activity Bundles Calendar",
    badge: "Download",
    href: "/printables",
    color: "bg-owl-amber/10 text-owl-amber",
  },
  {
    icon: BookOpen,
    title: "Cultural Celebration Copies",
    badge: "Download",
    href: "/holidays",
    color: "bg-owl-rose/10 text-owl-rose",
  },
  {
    icon: Music2,
    title: "Curated Audio Playlists",
    badge: "Download",
    href: "/music",
    color: "bg-owl-forest/10 text-owl-forest",
  },
] as const;

const TOOLS = [
  {
    icon: FileText,
    title: "Lesson plan builder",
    body: "Drag activities + printables + videos into a weekly schedule. Export to PDF.",
    badge: "Phase 3",
  },
  {
    icon: BookOpen,
    title: "Standards crosswalk",
    body: "Drop a state + grade band; we map every lesson to your district's framework.",
    badge: "Phase 3",
  },
  {
    icon: Sparkles,
    title: "Multilingual variants",
    body: "EN / ES today. Mandarin + Arabic ship as the curriculum tier expands.",
    badge: "Phase 4",
  },
  {
    icon: Music2,
    title: "Playlist licensing",
    body: "Pre-cleared classroom-use rights for every OWL song, every streaming platform.",
    badge: "Phase 5",
  },
] as const;

const LICENSE_TIERS = [
  { name: "Individual teacher", price: "$199 / year", best: "One teacher, one classroom" },
  { name: "School site", price: "$4,999 / year", best: "Up to 20 teachers, one school" },
  { name: "District", price: "$24,999 / year", best: "Multi-school, custom rollout" },
] as const;

export default function EducatorsPage() {
  const educatorPrintables = SEED_PRINTABLES.filter((p) =>
    ["K-readiness", "Homeschool", "Cultural", "Alphabet", "SEL"].includes(p.skill)
  ).slice(0, 4);

  const educatorPlaylists = SEED_PLAYLISTS.slice(0, 4);

  return (
    <>
      {/* 1 — Classroom-focused hero */}
      <CinematicHero
        tone="cream"
        slug="educators"
        sequenceSlug="educators-classroom"
        bannerAspect="wide"
        eyebrow="For Educators"
        heading={
          <>
            Empower Your Classroom with{" "}
            <span className="text-owl-teal">Culturally Inclusive Learning!</span>
          </>
        }
        subhead="Classroom-ready multicultural learning resources. Explores and certify curriculums including educators and classrooms."
        primaryCta={
          <Button intent="primary" size="lg" asChild>
            <Link href="#tools">
              <GraduationCap className="h-4 w-4" aria-hidden />
              Explore Now
            </Link>
          </Button>
        }
        secondaryCta={
          <Button intent="secondary" size="lg" asChild>
            <Link href="/contact">Request Access</Link>
          </Button>
        }
        ambient={<AmbientLayer pattern="leaves" density={4} seed={61} />}
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
            offsetY={14}
          >
            {FEATURED_TOOLS.map(({ icon: Icon, title, badge, href, color }) => (
              <div
                key={title}
                className="relative h-full flex flex-col rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2"
              >
                <span
                  aria-hidden
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-base font-semibold text-owl-ink flex-1">{title}</h3>
                <div className="mt-4">
                  <Button intent="primary" size="sm" asChild>
                    <Link href={href}>
                      <GraduationCap className="h-3.5 w-3.5 mr-1" aria-hidden />
                      {badge}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </StaggerGrid>
        </Section>
      </SectionReveal>

      {/* 4 — Printable lesson resources */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Sample resources"
            title="Classroom-ready printables"
            subtitle="Every printable maps to a daily lesson plan + a matching OWL video."
          />
          <MediaRail
            ariaLabel="Sample educator printables"
            columns={{ md: 2, lg: 4 }}
            className="mt-8"
          >
            {educatorPrintables.map((p) => (
              <PrintableCard key={p.slug} {...p} />
            ))}
          </MediaRail>
        </Section>
      </SectionReveal>

      {/* 5 — Playlists / resources */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="Listen in the classroom"
            title="Playlists for transitions, focus, and circle time"
            subtitle="Pre-cleared for in-classroom playback. Same songs, every streaming platform."
          />
          <MediaRail
            ariaLabel="Educator playlists"
            columns={{ md: 2, lg: 4 }}
            className="mt-8"
          >
            {educatorPlaylists.map((p) => (
              <PlaylistCard
                key={p.slug}
                slug={p.slug}
                title={p.title}
                description={p.description}
                songCount={p.songCount}
                tone={p.tone}
                icon={p.icon}
              />
            ))}
          </MediaRail>
        </Section>
      </SectionReveal>

      {/* 5b — Trust Signals / Testimonials */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro eyebrow="Trusted by teachers" title="Trust Signals" />
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} aria-hidden className="text-owl-amber text-sm">★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-owl-ink/80 italic">
                &ldquo;You created a amazing teacher, starter ideas for one teacher matters, and students are coming along.&rdquo;
              </p>
              <p className="mt-3 font-display text-xs font-bold text-owl-teal">ELA Standard K.R.7.2</p>
            </div>
            <div className="rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} aria-hidden className="text-owl-amber text-sm">★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-owl-ink/80 italic">
                &ldquo;These materials are learning tools for all, and our students are growing tremendously.&rdquo;
              </p>
              <p className="mt-3 font-display text-xs font-bold text-owl-teal">ELA Standard K.R.1.2</p>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 5c — Educator Inner Circle Signup */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="teal">
          <div className="flex flex-col items-center gap-5 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-amber-soft">
              Join the community
            </p>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Join the Educator Inner Circle
            </h2>
            <p className="text-white/85 max-w-prose">
              Access lesson plans, school-based discounts, and get notified when the full portal launches.
            </p>
            <Button intent="primary" size="lg" asChild>
              <Link href="/newsletter">Sign Up Now</Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      {/* 6 — Trust + pricing teaser */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep" id="pricing">
          {/* Trust strip */}
          <div className="mb-10 rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1 sm:p-8">
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-teal">
              Frameworks covered
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-owl-ink sm:grid-cols-2 md:grid-cols-3">
              <li>✓ Head Start ELOF (Infant–60mo)</li>
              <li>✓ CDC developmental milestones</li>
              <li>✓ Common Core ELA / Math (K–G6)</li>
              <li>✓ Texas TEKS PreK</li>
              <li>✓ Florida VPK Standards</li>
              <li>✓ California TK / CA-ELDS</li>
              <li>✓ 13 other state PreK crosswalks</li>
              <li>✓ Bilingual EN / ES</li>
              <li>✓ Mandarin + Arabic (Phase 4)</li>
            </ul>
          </div>

          <SectionIntro eyebrow="Pricing teaser" title="License tiers" />
          <StaggerGrid
            asList
            ariaLabel="OWL educator pricing tiers"
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
            stagger={0.08}
            offsetY={16}
          >
            {LICENSE_TIERS.map((t) => (
              <div
                key={t.name}
                className="flex h-full flex-col rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2"
              >
                <h3 className="font-display text-lg font-semibold text-owl-ink">{t.name}</h3>
                <p className="mt-2 font-display text-2xl font-bold text-owl-teal">{t.price}</p>
                <p className="mt-3 text-sm text-owl-mist">Best for: {t.best}</p>
                <Button asChild intent="secondary" size="md" className="mt-auto">
                  <Link href="/contact">Request access</Link>
                </Button>
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
