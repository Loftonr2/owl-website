import Link from "next/link";
import { Sparkles, Heart, Globe2, GraduationCap } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

// Shared system primitives
import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

export const metadata = pageMetadata({
  title: "About Larissa — A Warm Voice for Multicultural Learning",
  description:
    "The story behind OWL Sing Together — and the values that anchor every video, song, and printable.",
  path: "/about",
});

/**
 * /about — v3 (Visual-track Phase 3, calmer motion).
 *
 * Page sections:
 *   1. Welcome hero (CinematicHero, sequenceSlug=about-welcome, slug=about)
 *   2. Larissa story block (long-form prose, narrow column)
 *   3. Mission block (companion prose, narrow column)
 *   4. Values row (3 tiles)
 *   5. Community impact (statement + CTA)
 *   6. Newsletter band
 *
 * Motion vocabulary: calmer than the homepage. <SectionReveal> uses larger
 * offsets (16–24px) and longer durations (520–640ms) so the page feels like
 * scrollable prose rather than a marketing reel. Reduced-motion mode renders
 * each section instantly via SectionReveal's existing useReducedMotion guard.
 */

const VALUES = [
  {
    icon: Heart,
    title: "Inclusivity",
    body: "Every child sees themselves in the cast. No defaults, no afterthoughts.",
  },
  {
    icon: Globe2,
    title: "Community",
    body: "Slow content for fast lives. We make things you can use today.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    body: "Multicultural, evidence-based, classroom-ready — not screen-time filler.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      {/* 1 — Welcome hero. CinematicHero falls back to banner image until the
            240-frame "about-welcome" sequence is commissioned + flipped to
            available: true. */}
      <CinematicHero
        tone="cream"
        slug="about"
        sequenceSlug="about-welcome"
        bannerAspect="wide"
        eyebrow="Meet Larissa"
        heading={
          <>
            Welcome to our{" "}
            <span className="text-owl-teal">heartfelt journey.</span>
          </>
        }
        subhead="OWL Sing Together is the work of two people who believe every child deserves to be seen, heard, and sung to — slowly, kindly, every day."
        primaryCta={
          <Button intent="secondary" size="lg" asChild>
            <Link href="/watch">
              <Sparkles className="h-4 w-4" aria-hidden />
              Watch a video
            </Link>
          </Button>
        }
        secondaryCta={
          <Button intent="tertiary" size="lg" asChild>
            <Link href="/newsletter">Subscribe to the OWL Weekly</Link>
          </Button>
        }
        meta={
          <p className="italic">
            &ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa
          </p>
        }
        ambient={<AmbientLayer pattern="leaves" density={3} seed={37} />}
      />

      {/* 2 — Larissa story block (calm prose) */}
      <SectionReveal offset={16}>
        <Section width="narrow" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="The story"
            title="Larissa's personal story"
          />
          <div className="space-y-5 text-base leading-relaxed text-owl-ink/85">
            <p>
              Larissa grew up between languages and music. Her grandmother sang to her in two
              languages and taught her to listen for kindness — in tone, in word, in everything.
              That listening became a career: as a teacher, a performer, and now as the voice of
              OWL.
            </p>
            <p>
              She founded OWL Sing Together to do for today&apos;s children what Mr. Rogers did
              for a previous generation — slow down, name the feeling, make every child feel they
              belong. The difference: every child means <em>every</em> child. The cast around her
              looks like the world.
            </p>
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Mission block */}
      <SectionReveal offset={20}>
        <Section width="narrow" pad="lg" bg="white">
          <SectionIntro eyebrow="The mission" title="Why OWL exists" />
          <div className="space-y-5 text-base leading-relaxed text-owl-ink/85">
            <p>
              Most children&apos;s media is built for the algorithm — fast, loud, default-white.
              OWL is built for the family. We move slowly on purpose. We name feelings. We honor
              confusion. We never shame a child.
            </p>
            <p>
              Every video is paired with a printable. Every song is on every streaming platform.
              Every curriculum tier is aligned with the standards your educators trust. We made
              the thing we wished existed when we were small.
            </p>
          </div>
        </Section>
      </SectionReveal>

      {/* 4 — Values row.
            Calm tone: 3 tiles on cream, individual <SectionReveal> wrappers
            cascade in one-by-one with small delay offsets so they feel like
            reading sentences, not loading a marketing grid. */}
      <SectionReveal offset={16}>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro eyebrow="What we stand for" title="Values" />
          <ul role="list" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }, idx) => (
              <SectionReveal key={title} offset={12} delay={idx * 0.12}>
                <li className="h-full rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2">
                  <span
                    aria-hidden
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-owl-teal/10 text-owl-teal"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-owl-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-owl-mist">{body}</p>
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
