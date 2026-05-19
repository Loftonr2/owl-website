import { pageMetadata } from "@/lib/seo/metadata";
import { headers } from "@/lib/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { GalleryCard } from "@/components/marketing/gallery-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { SEED_GALLERY } from "@/lib/seed/gallery";

export const metadata = pageMetadata({
  title: "Image Gallery",
  description: "Character art, mascot poses, behind-the-scenes shots, and seasonal scenes from the OWL world.",
  path: "/gallery",
});

/**
 * /gallery — Image Gallery.
 * Wireframe: OWL Image Gallery.png
 * Spec: WEBSITE_REQUIREMENTS.md § Gallery
 */
export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The OWL world, in pictures"
        subtitle="Character art, mascot poses, video stills, printable previews, and behind-the-scenes shots."
        image={{ src: headers.gallery.src, alt: headers.gallery.alt }}
        ambient="sparkles"
        tone="forest"
      />

      <Section width="wide" pad="lg" bg="cream">
        <SectionHeader eyebrow="Browse" title="Featured collection" />
        <ul
          role="list"
          className="grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-4"
        >
          {SEED_GALLERY.map((item) => (
            <li key={item.slug} className={item.span === "wide" ? "md:col-span-2" : item.span === "tall" ? "md:row-span-2" : undefined}>
              <GalleryCard {...item} />
            </li>
          ))}
        </ul>
      </Section>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
