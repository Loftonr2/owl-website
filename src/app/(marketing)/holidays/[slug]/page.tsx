import { notFound } from "next/navigation";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { VideoCard } from "@/components/marketing/video-card";
import { PrintableCard } from "@/components/marketing/printable-card";
import { ProductCard } from "@/components/marketing/product-card";
import { HolidayCard } from "@/components/marketing/holiday-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { pageMetadata } from "@/lib/seo/metadata";
import { SEED_HOLIDAYS, findHolidayBySlug } from "@/lib/seed/holidays";
import { findVideoBySlug } from "@/lib/seed/videos";
import { findPrintableBySlug } from "@/lib/seed/printables";
import { findProductBySlug } from "@/lib/seed/products";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return SEED_HOLIDAYS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const h = findHolidayBySlug(slug);
  if (!h) return pageMetadata({ title: "Holiday not found", noIndex: true });
  return pageMetadata({
    title: `${h.name} for Kids — OWL Holiday Hub`,
    description: h.intro,
    path: `/holidays/${h.slug}`,
  });
}

export default async function HolidayDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const h = findHolidayBySlug(slug);
  if (!h) notFound();

  const videos = h.relatedVideoSlugs.map(findVideoBySlug).filter(Boolean);
  const printables = h.relatedPrintableSlugs.map(findPrintableBySlug).filter(Boolean);
  const products = h.relatedProductSlugs.map(findProductBySlug).filter(Boolean);
  const otherHolidays = SEED_HOLIDAYS.filter((x) => x.slug !== h.slug).slice(0, 4);

  return (
    <>
      <Section width="wide" pad="lg" bg="cream-deep">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr,1.2fr]">
          <div className="flex aspect-square items-center justify-center rounded-owl-hero bg-owl-amber-soft/40 text-9xl">
            <span aria-hidden>{h.emoji}</span>
          </div>
          <div>
            <Chip intent="amber" className="mb-3">{h.month}</Chip>
            <h1 className="font-display text-4xl font-extrabold text-owl-ink sm:text-5xl">
              {h.name}
            </h1>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-mist sm:text-lg">
              {h.intro}
            </p>
            <p className="mt-4 text-sm text-owl-mist">
              <strong className="font-semibold text-owl-ink">When:</strong> {h.dateRange}
            </p>
            <p className="mt-1 text-sm text-owl-mist">
              <strong className="font-semibold text-owl-ink">Best ages:</strong> {h.ageRange}
            </p>
          </div>
        </div>
      </Section>

      {videos.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionHeader eyebrow="Watch" title="Videos for this celebration" />
            <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => v && <li key={v.slug}><VideoCard {...v} /></li>)}
            </ul>
          </Section>
        </SectionReveal>
      )}

      {printables.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="cream">
            <SectionHeader eyebrow="Print" title="Activities for this celebration" />
            <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {printables.map((p) => p && <li key={p.slug}><PrintableCard {...p} /></li>)}
            </ul>
          </Section>
        </SectionReveal>
      )}

      {products.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionHeader eyebrow="Shop" title="Products for this celebration" />
            <ul role="list" className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => p && <li key={p.slug}><ProductCard {...p} /></li>)}
            </ul>
          </Section>
        </SectionReveal>
      )}

      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <SectionHeader eyebrow="Explore" title="Other celebrations" />
          <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {otherHolidays.map((o) => (
              <li key={o.slug}>
                <HolidayCard
                  slug={o.slug}
                  name={o.name}
                  month={o.month}
                  intro={o.intro}
                  emoji={o.emoji}
                  tone={o.tone}
                />
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Link href="/holidays" className="font-display text-sm font-semibold text-owl-teal hover:text-owl-teal-deep">
              See all 11 cultural celebrations →
            </Link>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
