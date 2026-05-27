import { pageMetadata } from "@/lib/seo/metadata";
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section, SectionHeader } from "@/components/ui/section";
import { PrintableCard } from "@/components/marketing/printable-card";
import { PrintableOfTheWeek } from "@/components/marketing/printable-of-the-week";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { SEED_PRINTABLES } from "@/lib/seed/printables";

export const metadata = pageMetadata({
  title: "Printables — Free Activity Sheets",
  description: "Free + premium printables for the OWL classroom and home. Multicultural illustrations, every age band.",
  path: "/printables",
});

/**
 * /printables — Printables Hub.
 * No wireframe (build to spec). Spec: WEBSITE_REQUIREMENTS.md § Printables Hub.
 */
export default function PrintablesPage() {
  const free = SEED_PRINTABLES.filter((p) => p.freeOrPaid === "free");
  const paid = SEED_PRINTABLES.filter((p) => p.freeOrPaid === "paid");

  return (
    <>
      <VideoHeroBanner
        src="/videos/printables-hero.mp4"
        poster="/images/headers/printables-hero.png"
        eyebrow="Printables"
        heading={
          <>Free + Premium Printables for{" "}<span className="text-owl-teal">Home & Classroom</span></>
        }
        subhead="Multicultural illustrations, age-banded, classroom-ready. Most are free; bundles unlock more."
        primaryCta={{ label: "Browse Free Printables", href: "#free" }}
        secondaryCta={{ label: "View Bundles", href: "#bundles" }}
      />

      <Section width="wide" pad="lg" bg="cream" id="free">
        <SectionHeader
          eyebrow="Free"
          title="Free this week"
          subtitle="Email-gated downloads. We send the PDF + add you to the weekly OWL letter."
        />
        <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {free.map((p) => (
            <li key={p.slug}>
              <PrintableCard {...p} />
            </li>
          ))}
        </ul>
      </Section>

      <SectionReveal>
        <PrintableOfTheWeek />
      </SectionReveal>

      {paid.length > 0 && (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white" id="bundles">
            <SectionHeader
              eyebrow="Premium"
              title="Bundle Packs"
              subtitle="One-time purchase. PDFs delivered instantly via Gumroad. Use any time, any device."
            />
            <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {paid.map((p) => (
                <li key={p.slug}>
                  <PrintableCard {...p} />
                </li>
              ))}
            </ul>
          </Section>
        </SectionReveal>
      )}

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
