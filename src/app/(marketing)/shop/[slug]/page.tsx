import Script from "next/script";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Bell, ShoppingBag } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { ComingSoonRibbon } from "@/components/ui/coming-soon-ribbon";
import { OwlMark } from "@/components/brand/owl-logo";
import { ProductCard } from "@/components/marketing/product-card";
import { MediaRail } from "@/components/marketing/media-rail";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { pageMetadata } from "@/lib/seo/metadata";
import { productSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site-config";
import { SEED_PRODUCTS, findProductBySlug } from "@/lib/seed/products";
import { resolveProductImage, resolveProductGallery } from "@/lib/images";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return SEED_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = findProductBySlug(slug);
  if (!p) return pageMetadata({ title: "Product not found", noIndex: true });
  return pageMetadata({
    title: `${p.title} — OWL Shop`,
    description: p.story,
    path: `/shop/${p.slug}`,
  });
}

const toneStyles = {
  amber: "bg-owl-amber-soft/40",
  teal: "bg-owl-teal/15",
  rose: "bg-owl-rose/25",
  forest: "bg-owl-forest/10",
  mist: "bg-owl-mist/20",
  cream: "bg-owl-cream-deep",
} as const;

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = findProductBySlug(slug);
  if (!p) notFound();

  const related = SEED_PRODUCTS.filter((r) => r.slug !== p.slug).slice(0, 4);
  const isComingSoon = p.isComingSoon ?? false;

  // Phase 4 — product photo resolver.
  // Primary tier: products[slug].primary. Gallery tier: products[slug].gallery.
  // Both empty until commissioned. When primary is present, real image stacks
  // over the tonal floor. When gallery has entries, a stacked thumbnail rail
  // renders under the hero shot. No imagery is fabricated.
  const primaryImage = resolveProductImage(p.slug);
  const galleryImages = resolveProductGallery(p.slug);

  const ld = JSON.stringify(
    productSchema({
      name: p.title,
      description: p.story,
      image: `${siteConfig.url}/images/headers/shop-hero.png`,
      sku: p.slug,
      offers: {
        price: parseFloat(p.price.replace("$", "")),
        priceCurrency: "USD",
        // PreOrder maps the truthful state for coming-soon products.
        availability: isComingSoon ? "PreOrder" : "InStock",
        url: `${siteConfig.url}/shop/${p.slug}`,
      },
    })
  );

  return (
    <>
      <Script
        id={`ld-product-${p.slug}`}
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      <Section width="wide" pad="lg" bg="cream-deep">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Gallery — tonal panel + (resolved primary image) + (gallery rail) */}
          <div className="space-y-4">
            {/* Primary tile: tonal floor + optional <Image> on top + OwlMark + ribbon */}
            <div
              className={`relative aspect-square overflow-hidden rounded-owl-hero shadow-owl-2 ${toneStyles[p.tone]}`}
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(135deg,rgba(28,43,74,0.04)_0%,rgba(28,43,74,0.10)_100%)]"
              />
              {!primaryImage.src && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-7xl font-extrabold text-owl-ink/20">
                    {p.title.charAt(0)}
                  </span>
                </div>
              )}
              {primaryImage.src && (
                <Image
                  src={primaryImage.src}
                  alt={primaryImage.alt || p.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="absolute inset-0 object-cover"
                  data-product-source={primaryImage.source}
                />
              )}
              <OwlMark
                decorative
                className="absolute left-6 bottom-6 h-14 w-14 opacity-90 drop-shadow-sm"
              />
              {isComingSoon && <ComingSoonRibbon variant="corner" />}
            </div>

            {/* Gallery thumbnails — only render when at least one shot exists.
                Truthful asset interface: empty array → no rail. */}
            {galleryImages.length > 0 && (
              <ul
                role="list"
                aria-label={`More photos of ${p.title}`}
                className="grid grid-cols-4 gap-3"
              >
                {galleryImages.map((g, idx) => (
                  <li key={g.src}>
                    <div className="relative aspect-square overflow-hidden rounded-owl-card border border-owl-cream-deep bg-owl-cream-deep shadow-owl-1">
                      <Image
                        src={g.src}
                        alt={g.alt || `${p.title} — view ${idx + 2}`}
                        fill
                        sizes="(min-width: 1024px) 12vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Content */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">
              {p.category}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              {p.title}
            </h1>
            <p
              className={`mt-4 font-display text-2xl font-bold ${
                isComingSoon ? "text-owl-mist" : "text-owl-teal"
              }`}
            >
              <span className={isComingSoon ? "line-through" : ""}>{p.price}</span>
              {isComingSoon && (
                <span className="ml-3 text-sm font-semibold uppercase tracking-wide text-owl-amber">
                  · Coming soon
                </span>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip intent="teal">Ages {p.ageRange}</Chip>
              <Chip intent="amber">{p.channel}</Chip>
            </div>

            <p className="mt-6 max-w-prose text-base leading-relaxed text-owl-ink/80">
              {p.story}
            </p>

            <div className="mt-6">
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-owl-teal">
                Supports learning in
              </p>
              <ul className="mt-2 space-y-1 text-sm text-owl-ink">
                {p.supportsLearningIn.map((s) => (
                  <li key={s}>✓ {s}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isComingSoon ? (
                <>
                  <Button intent="primary" size="lg" asChild>
                    <Link href="/newsletter">
                      <Bell className="h-4 w-4" aria-hidden />
                      Notify me when it drops
                    </Link>
                  </Button>
                  <Button intent="tertiary" size="lg" asChild>
                    <Link href="/shop">Keep browsing</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button intent="primary" size="lg">
                    <ShoppingBag className="h-4 w-4" aria-hidden />
                    Add to cart — {p.price}
                  </Button>
                  <Button intent="secondary" size="lg" asChild>
                    <Link href="/shop">Keep shopping</Link>
                  </Button>
                </>
              )}
            </div>
            {isComingSoon && (
              <p className="mt-3 text-xs italic text-owl-mist">
                Cart wakes up alongside Stripe + Shopify in Phase 3 of the build plan.
              </p>
            )}
          </div>
        </div>
      </Section>

      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionHeader eyebrow="Pairs with" title="Bundle suggestions" />
          <MediaRail
            ariaLabel="Related OWL products"
            columns={{ md: 3, lg: 4 }}
            className="mt-8"
          >
            {related.map((r) => (
              <ProductCard
                key={r.slug}
                slug={r.slug}
                title={r.title}
                price={r.price}
                ageRange={r.ageRange}
                category={r.category}
                tone={r.tone}
                isComingSoon={r.isComingSoon}
              />
            ))}
          </MediaRail>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
