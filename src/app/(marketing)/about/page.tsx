import Image from "next/image";
import Link from "next/link";
import { Sparkles, Heart, Globe2, GraduationCap, BookOpen, Music2, Users } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

// Shared system primitives
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

export const metadata = pageMetadata({
  title: "About Larissa — A Warm Voice for Multicultural Learning",
  description:
    "The story behind OWL Sing Together — and the values that anchor every video, song, and printable.",
  path: "/about",
});

const VALUES = [
  {
    icon: Heart,
    title: "Inclusivity",
    body: "Every child sees themselves in the cast — no defaults, no afterthoughts. We make every child feel they belong.",
    iconColor: "bg-owl-rose/20 text-owl-rose",
    bg: "bg-gradient-to-br from-[#fce8e4] via-[#fdf3f1] to-[#fff8ec]",
    border: "border-owl-rose/30",
    bar: "bg-owl-rose",
    cta: "text-owl-rose",
    href: "/watch",
    ctaLabel: "Watch our videos →",
  },
  {
    icon: Globe2,
    title: "Community",
    body: "We build slow content for fast lives. Songs, printables, and stories that connect families and caregivers.",
    iconColor: "bg-owl-teal/15 text-owl-teal",
    bg: "bg-gradient-to-br from-[#e5f8f4] via-[#f0faf7] to-[#fff8ec]",
    border: "border-owl-teal/30",
    bar: "bg-owl-teal",
    cta: "text-owl-teal",
    href: "/newsletter",
    ctaLabel: "Join the community →",
  },
  {
    icon: GraduationCap,
    title: "Education",
    body: "Multicultural, evidence-based, classroom-ready — real learning that grows with your child from birth to 14.",
    iconColor: "bg-owl-amber/20 text-owl-amber",
    bg: "bg-gradient-to-br from-[#fef3d8] via-[#fdf7eb] to-[#fff8ec]",
    border: "border-owl-amber/30",
    bar: "bg-owl-amber",
    cta: "text-owl-amber",
    href: "/educators",
    ctaLabel: "Explore resources →",
  },
];

const MISSION_POINTS = [
  {
    icon: BookOpen,
    text: "Our learners deserve options to resources and educational mission.",
  },
  {
    icon: Music2,
    text: "Our music creates operator-led multicultural and educational opportunities.",
  },
  {
    icon: Users,
    text: "Our mediums are rooted in advocacy to actively create awareness, entertainment, and emotional inclusion.",
  },
];

const INSPIRATION_CARDS = [
  {
    label: "Larissa",
    bg: "bg-owl-amber-soft/60",
    imgSrc: "/images/headers/about-hero.png",
  },
  {
    label: "Children Learning",
    bg: "bg-owl-teal/20",
    imgSrc: "/images/headers/educators-hero.png",
  },
  {
    label: "Reading Books",
    bg: "bg-owl-rose/20",
    imgSrc: "/images/headers/blog-hero.png",
  },
  {
    label: "Active Memory",
    bg: "bg-owl-forest/10",
    imgSrc: "/images/headers/holidays-hero.png",
  },
  {
    label: "Creative Memory",
    bg: "bg-owl-amber/15",
    imgSrc: "/images/headers/music-hero.png",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <VideoHeroBanner
        src="/videos/about-hero.mp4"
        poster="/images/headers/about-hero.png"
        eyebrow="Meet Larissa"
        heading={
          <>Welcome to Our{" "}<span className="text-owl-teal">Heartfelt Journey.</span></>
        }
        subhead="OWL Sing Together carries the tradition of Mr. Rogers into a digital, multicultural age — where every child feels seen, heard, and sung to."
        primaryCta={{ label: "Explore Now", href: "/watch" }}
        secondaryCta={{ label: "Subscribe to the OWL Weekly", href: "/newsletter" }}
        meta={<p className="italic">&ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa</p>}
      />

      {/* 2 — Personal Story + Brand Mission (side-by-side) */}
      <SectionReveal offset={16}>
        <Section width="wide" pad="lg" bg="cream">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Personal Story card */}
            <div className="relative flex flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-white p-7 shadow-owl-2">
              <div className="mb-5 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-owl-teal/20 shadow-owl-1">
                  <Image
                    src="/images/headers/about-hero.png"
                    alt="Larissa, founder of OWL Sing Together"
                    fill
                    className="object-cover object-top"
                    sizes="80px"
                  />
                </div>
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                    Personal Story
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold text-owl-ink">
                    Larissa
                  </h2>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-owl-ink/80">
                <p>
                  Most children&apos;s media is built for the algorithm — fast, loud, and one-size-fits-all. OWL is built for families. We move slowly on purpose. We name feelings. We honor confusion. We never shame a child.
                </p>
                <p>
                  In school race is front and center. When I was growing up we were color-blind. I don&apos;t want to bring up race. I just want to include.
                </p>
                <p>
                  At the end of the day I&apos;d love to go back to colorblindness. That is my hope.
                </p>
              </div>
              <div className="mt-5">
                <Button intent="primary" size="sm" asChild>
                  <Link href="/watch">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Brand Mission card */}
            <div className="relative flex flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-white p-7 shadow-owl-2">
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                Brand Mission
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-owl-ink">
                Why OWL Exists
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-owl-ink/80">
                Our goal has three hidden cornerstones: no resources and educational mission.
              </p>
              <ul className="mt-4 space-y-4">
                {MISSION_POINTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-owl-teal/10 text-owl-teal">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <p className="text-sm leading-relaxed text-owl-ink/75">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Educational & Creative Inspiration (polaroid-style row) */}
      <SectionReveal offset={20}>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="Inspiration"
            title="Larissa’s Educational and Creative Inspiration"
            subtitle="The people, memories, and moments that shaped everything OWL stands for."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-5 sm:flex-nowrap">
            {INSPIRATION_CARDS.map((card) => (
              <div
                key={card.label}
                className={`group relative flex w-40 shrink-0 flex-col items-center overflow-hidden rounded-[0.75rem] ${card.bg} p-2 shadow-owl-2 ring-1 ring-owl-cream-deep transition-all duration-300 ease-owl hover:-rotate-1 hover:scale-105 hover:shadow-owl-3`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[0.5rem] bg-owl-cream-deep">
                  <Image
                    src={card.imgSrc}
                    alt={card.label}
                    fill
                    className="object-cover transition-transform duration-500 ease-owl group-hover:scale-105"
                    sizes="160px"
                  />
                </div>
                <p className="mt-2.5 mb-1 text-center font-display text-xs font-semibold text-owl-ink/80">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* 4 — Values Row */}
      <SectionReveal offset={16}>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro eyebrow="What we stand for" title="Values Row" />
          <ul role="list" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body, iconColor, bg, border, bar, cta, href, ctaLabel }, idx) => (
              <SectionReveal key={title} offset={12} delay={idx * 0.12}>
                <li className="h-full">
                  <Link
                    href={href}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-owl-card border-2 ${border} ${bg} p-6 shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-1.5 hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2`}
                  >
                    <span aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 ${bar}`} />
                    <span
                      aria-hidden
                      className={`mb-4 mt-2 inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 ease-owl group-hover:scale-110 ${iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-semibold text-owl-ink">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-owl-mist">{body}</p>
                    <p className={`mt-auto pt-4 font-display text-sm font-semibold transition-colors duration-200 ${cta}`}>
                      {ctaLabel}
                    </p>
                  </Link>
                </li>
              </SectionReveal>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 5 — Community impact + CTA module (warm forest band). */}
      <SectionReveal offset={20}>
        <Section width="wide" pad="lg" bg="forest">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.3fr,1fr]">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-owl-amber-soft">
                Community impact
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-owl-cream sm:text-4xl">
                Measured in small things.
              </h2>
              <p className="mt-5 max-w-prose text-base leading-relaxed text-owl-cream/85">
                A child who finds their first feeling word. A parent who reaches for a song
                instead of a screen. A teacher who feels seen. We partner with Title I schools,
                Head Start grantees, and family foundations to bring OWL into homes that need it
                most.
              </p>
            </div>

            <GlassPanel variant="forest" className="space-y-3 text-owl-cream">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-owl-amber-soft">
                Partner stats
              </p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-owl-cream/70">Title I schools</dt>
                  <dd className="font-display text-xl font-bold">12</dd>
                </div>
                <div>
                  <dt className="text-owl-cream/70">Head Start sites</dt>
                  <dd className="font-display text-xl font-bold">4</dd>
                </div>
                <div>
                  <dt className="text-owl-cream/70">Free printables/wk</dt>
                  <dd className="font-display text-xl font-bold">1.2k</dd>
                </div>
                <div>
                  <dt className="text-owl-cream/70">Newsletter</dt>
                  <dd className="font-display text-xl font-bold">8.5k</dd>
                </div>
              </dl>
              <p className="text-xs italic text-owl-cream/70">
                Targets for May 2026 launch — updated quarterly.
              </p>
            </GlassPanel>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button intent="primary" size="lg" asChild>
              <Link href="/watch">
                <Sparkles className="h-4 w-4" aria-hidden />
                Watch a video
              </Link>
            </Button>
            <Button intent="inverted" size="lg" asChild>
              <Link href="/newsletter">Subscribe to the OWL Weekly</Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      {/* 6 — Newsletter band */}
      <SectionReveal offset={16}>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
