import Link from "next/link";
import { Search, Download, Music2, Play, Share2 } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { GalleryCard } from "@/components/marketing/gallery-card";
import { MediaRail } from "@/components/marketing/media-rail";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { SEED_GALLERY } from "@/lib/seed/gallery";

export const metadata = pageMetadata({
  title: "OWL Image Gallery",
  description:
    "Explore, inspire, and create with our colorful world of OWL-related artwork and photos.",
  path: "/gallery",
});

/**
 * /gallery — v3 (Wireframe-matched redesign).
 *
 * Sections:
 *   1. Modest Hero Banner (Larissa, multi-cultural kids/owls)
 *   2. Search + Filter chips (Fall, Winter, Halloween, Songs, Character Art, Digital Art, Photos)
 *   3. Featured Collection (horizontal row)
 *   4. Image Gallery Grid (masonry/clean grid)
 *   5. Seasonal Highlights Row
 *   6. Behind-the-Scenes Spotlight
 *   7. Share / Download Module
 *   8. Related Content Links (Music, Videos, Shop)
 *   9. Newsletter / Signup CTA
 */

const FILTER_CHIPS = [
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "halloween", label: "Halloween" },
  { value: "songs", label: "Songs" },
  { value: "character", label: "Character A" },
  { value: "digital-art", label: "Digital Art" },
  { value: "photos", label: "Photos" },
];

const RELATED_LINKS = [
  {
    label: "Music",
    href: "/music",
    icon: Music2,
    bg: "bg-owl-teal/10 text-owl-teal",
  },
  {
    label: "Videos",
    href: "/watch",
    icon: Play,
    bg: "bg-owl-amber/10 text-owl-amber",
  },
  {
    label: "Shop",
    href: "/shop",
    icon: Download,
    bg: "bg-owl-rose/10 text-owl-rose",
  },
];

export default function GalleryPage() {
  const featured = SEED_GALLERY.slice(0, 6);
  const seasonal = SEED_GALLERY.filter((g) => g.collectionSlug === "seasonal");
  const bts = SEED_GALLERY.filter((g) => g.collectionSlug === "bts");
  const all = SEED_GALLERY;

  return (
    <>
      {/* 1 — Modest hero banner */}
      <CinematicHero
        tone="cream"
        slug="gallery"
        bannerAspect="wide"
        eyebrow="OWL Image Gallery"
        heading={
          <>
            Explore, Inspire, and{" "}
            <span className="text-owl-teal">Create Together</span>
          </>
        }
        subhead="Explore our colorful world of OWL-related artwork and photos — character art, seasonal scenes, and behind-the-scenes moments."
        primaryCta={
          <Button intent="primary" size="lg" asChild>
            <Link href="#gallery">
              <Download className="h-4 w-4" aria-hidden />
              Download Now
            </Link>
          </Button>
        }
        ambient={<AmbientLayer pattern="sparkles" density={3} seed={73} />}
      />

      {/* 2 — Search + Filter chips */}
      <SectionReveal>
        <Section width="wide" pad="md" bg="white">
          <div className="flex flex-col gap-4">
            {/* Search bar */}
            <label className="relative block max-w-lg mx-auto w-full">
              <span className="sr-only">Search gallery</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-owl-mist"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search your playlists, topics..."
                className="h-11 w-full rounded-owl-btn border border-owl-cream-deep bg-owl-white pl-9 pr-4 text-sm text-owl-ink shadow-owl-1 placeholder:text-owl-mist focus:border-owl-teal focus:outline-none focus:ring-2 focus:ring-owl-teal/40"
              />
            </label>
            {/* Filter chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {FILTER_CHIPS.map((f) => (
                <CategoryChip
                  key={f.value}
                  href={`/gallery?filter=${f.value}`}
                  label={f.label}
                  intent="teal"
                />
              ))}
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 3 — Featured Collection */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream" id="gallery">
          <div className="flex items-center justify-between mb-6">
            <SectionIntro
              eyebrow="Spotlighted"
              title="Featured Collection"
              className="mb-0"
            />
            <span className="rounded-full bg-owl-teal px-3 py-1 text-xs font-bold text-white shadow-owl-1">
              Soon New
            </span>
          </div>
          <MediaRail
            ariaLabel="Featured gallery collection"
            columns={{ md: 3, lg: 6 }}
            stagger={0.06}
          >
            {featured.map((item) => (
              <GalleryCard key={item.slug} {...item} />
            ))}
          </MediaRail>
        </Section>
      </SectionReveal>

      {/* 4 — Full Image Gallery Grid */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="Browse all"
            title="Image Gallery"
            subtitle="Multicultural art, seasonal illustrations, behind-the-scenes, and more."
          />
          <ul
            role="list"
            className="mt-8 grid auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-4"
          >
            {all.map((item) => (
              <li
                key={item.slug}
                className={
                  item.span === "wide"
                    ? "md:col-span-2"
                    : item.span === "tall"
                      ? "md:row-span-2"
                      : undefined
                }
              >
                <GalleryCard {...item} />
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 5 — Seasonal Highlights Row */}
      {seasonal.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="cream-deep">
            <SectionIntro
              eyebrow="Seasonal"
              title="Seasonal Highlights"
              subtitle="Cultural celebrations and seasonal scenes from the OWL world."
            />
            <MediaRail
              ariaLabel="Seasonal gallery highlights"
              columns={{ md: 2, lg: 3 }}
              className="mt-8"
              stagger={0.07}
            >
              {seasonal.map((item) => (
                <GalleryCard key={item.slug} {...item} />
              ))}
            </MediaRail>
          </Section>
        </SectionReveal>
      )}

      {/* 6 — Behind-the-Scenes Spotlight */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="BTS"
            title="Behind-the-Scenes Spotlight"
            subtitle="A peek at the studio, sketches, and the creative process behind OWL."
          />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Artist spotlight card */}
            <div className="flex flex-col overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1">
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                Artist &amp; Artist Photo
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-owl-ink">
                The creative team behind OWL
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-owl-ink/75">
                From initial sketches to finished scenes, every illustration is crafted with
                care to represent diverse children and warm educational settings.
              </p>
              <div className="mt-5">
                <Button intent="secondary" size="sm" asChild>
                  <Link href="/about">Shop Now</Link>
                </Button>
              </div>
            </div>
            {/* Sketches/process previews */}
            <MediaRail
              ariaLabel="Behind the scenes artwork"
              columns={{ md: 1, lg: 2 }}
              stagger={0.05}
            >
              {bts.length > 0
                ? bts.map((item) => <GalleryCard key={item.slug} {...item} />)
                : SEED_GALLERY.slice(0, 2).map((item) => (
                    <GalleryCard key={`bts-${item.slug}`} {...item} />
                  ))}
            </MediaRail>
          </div>
        </Section>
      </SectionReveal>

      {/* 7 — Share / Download Module */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <div className="flex flex-col items-center gap-6 rounded-owl-hero bg-owl-teal/10 p-8 text-center shadow-owl-1 md:flex-row md:text-left">
            <div className="flex-1">
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                Share &amp; Download
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-owl-ink">
                Join the Nest for Free Artwork &amp; More!
              </h2>
              <p className="mt-2 text-sm text-owl-ink/75">
                Get 19% Off Your First Order!
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button intent="primary" size="lg" asChild>
                <Link href="/newsletter">
                  Sign Up
                </Link>
              </Button>
              <Button intent="secondary" size="lg" asChild>
                <Link href="/shop">
                  <Share2 className="h-4 w-4" aria-hidden />
                  Share
                </Link>
              </Button>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 8 — Related Content Links */}
      <SectionReveal>
        <Section width="wide" pad="md" bg="white">
          <SectionIntro
            eyebrow="Keep exploring"
            title="Related Content"
          />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {RELATED_LINKS.map(({ label, href, icon: Icon, bg }) => (
              <Link
                key={label}
                href={href}
                className={`group flex items-center gap-4 rounded-owl-card border border-owl-cream-deep bg-owl-cream p-5 shadow-owl-1 transition-all duration-200 ease-owl-quick hover:-translate-y-0.5 hover:shadow-owl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60`}
              >
                <span
                  aria-hidden
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${bg} transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-base font-semibold text-owl-ink">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* 9 — Newsletter / Signup CTA */}
      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
