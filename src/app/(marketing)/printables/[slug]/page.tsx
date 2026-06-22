import { notFound } from "next/navigation";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { PrintableCard } from "@/components/marketing/printable-card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  SEED_PRINTABLES,
  findPrintableBySlug,
} from "@/lib/seed/printables";
import { findVideoBySlug } from "@/lib/seed/videos";
import { findProductBySlug } from "@/lib/seed/products";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return SEED_PRINTABLES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = findPrintableBySlug(slug);
  if (!item) return pageMetadata({ title: "Printable not found", noIndex: true });
  return pageMetadata({
    title: `${item.title} — Free OWL Printable`,
    description: item.description,
    path: `/printables/${item.slug}`,
  });
}

export default async function PrintableDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = findPrintableBySlug(slug);
  if (!item) notFound();

  const relatedVideo = item.relatedVideoSlug ? findVideoBySlug(item.relatedVideoSlug) : null;
  const relatedProduct = item.relatedProductSlug ? findProductBySlug(item.relatedProductSlug) : null;
  const related = SEED_PRINTABLES.filter((p) => p.slug !== item.slug).slice(0, 3);

  return (
    <>
      <Section width="wide" pad="lg" bg="cream-deep">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr,1.2fr]">
          {/* Preview */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-owl-hero bg-owl-amber-soft/40">
            <div className="flex h-full items-center justify-center text-3xl text-owl-ink/30">
              {item.title.charAt(0)}
            </div>
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
              item.freeOrPaid === "free" ? "bg-owl-amber text-white" : "bg-owl-teal text-white"
            }`}>
              {item.freeOrPaid === "free" ? "Free" : item.price}
            </span>
          </div>

          {/* Copy + gated download */}
          <div>
            <Chip intent="teal" className="mb-3">Ages {item.ageRange}</Chip>
            <h1 className="font-display text-3xl font-extrabold text-owl-ink sm:text-4xl">
              {item.title}
            </h1>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-owl-mist">
              {item.description}
            </p>

            <div className="mt-6">
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-owl-teal">
                Learning outcomes
              </p>
              <ul className="mt-2 space-y-1 text-sm text-owl-ink">
                {item.learningOutcomes.map((o) => (
                  <li key={o}>✓ {o}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-owl-card border border-owl-cream-deep bg-white p-5">
              {item.freeOrPaid === "free" ? (
                <NewsletterForm
                  source="printable-gate"
                  segment="A2"
                  headline="Send me this printable"
                  body="Enter your email — we'll deliver the PDF + add you to the OWL Weekly."
                  ctaLabel="Send me the PDF"
                />
              ) : (
                <Button asChild intent="primary" size="lg" className="w-full">
                  <Link href="/shop">Buy now — {item.price}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Section>

      {(relatedVideo || relatedProduct) && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionHeader eyebrow="Pairs well with" title="Use this with…" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {relatedVideo && (
                <Link
                  href={`/watch/${relatedVideo.slug}`}
                  className="block rounded-owl-card border border-owl-cream-deep bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-owl-teal">Video</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-owl-ink">
                    {relatedVideo.title}
                  </h3>
                  <p className="mt-1 text-sm text-owl-mist">Ages {relatedVideo.ageRange} · {relatedVideo.duration}</p>
                </Link>
              )}
              {relatedProduct && (
                <Link
                  href={`/shop/${relatedProduct.slug}`}
                  className="block rounded-owl-card border border-owl-cream-deep bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-owl-teal">Product</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-owl-ink">
                    {relatedProduct.title}
                  </h3>
                  <p className="mt-1 text-sm text-owl-mist">{relatedProduct.price} · Ages {relatedProduct.ageRange}</p>
                </Link>
              )}
            </div>
          </Section>
        </SectionReveal>
      )}

      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionHeader eyebrow="More printables" title="You might also like" />
          <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PrintableCard {...p} />
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>
    </>
  );
}
