import Script from "next/script";
import { pageMetadata } from "@/lib/seo/metadata";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

import { Hero } from "@/components/marketing/hero";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { FeaturedVideos } from "@/components/marketing/featured-videos";
import { PrintableOfTheWeek } from "@/components/marketing/printable-of-the-week";
import { SeasonalSpotlight } from "@/components/marketing/seasonal-spotlight";
import { FeaturedPlaylists } from "@/components/marketing/featured-playlists";
import { ShopBestsellers } from "@/components/marketing/shop-bestsellers";
import { AboutLarissaPreview } from "@/components/marketing/about-larissa-preview";
import { EducatorBlock } from "@/components/marketing/educator-block";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { AppWaitlistTeaser } from "@/components/marketing/app-waitlist-teaser";
import { SectionReveal } from "@/components/marketing/section-reveal";

export const metadata = pageMetadata({
  title: "OWL Sing Together — Every Child Belongs Here",
  description:
    "Warm, multicultural music, videos, printables, and curriculum for children Birth–14. With Larissa.",
  path: "/",
});

/**
 * Homepage v1 (with motion polish).
 *
 * Composition:
 *   1. <Hero />               ← above the fold, no reveal
 *   2. <TrustStrip />         ← above the fold, no reveal
 *   3. <FeaturedVideos />     ← all below-fold sections wrapped in SectionReveal
 *   4. <PrintableOfTheWeek />
 *   5. <SeasonalSpotlight />
 *   6. <FeaturedPlaylists />
 *   7. <ShopBestsellers />
 *   8. <AboutLarissaPreview />
 *   9. <EducatorBlock />
 *  10. <NewsletterSection />
 *  11. <AppWaitlistTeaser />
 *
 * SectionReveal honors `prefers-reduced-motion` — it renders a plain wrapper
 * for users who've opted out of motion (DESIGN_STYLE_GUIDE §6).
 *
 * Wireframe: ../../../public/images/wireframes-reference/OWL Home Page.png
 * Spec: ../../../../OWL-Obsidian-Brain/03_Website_Build/WEBSITE_REQUIREMENTS.md § Homepage
 */
export default function Home() {
  const orgLd = JSON.stringify(organizationSchema());
  const siteLd = JSON.stringify(websiteSchema());

  return (
    <>
      <Script
        id="ld-organization"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: orgLd }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: siteLd }}
      />

      {/* Above the fold — no reveal */}
      <Hero />
      <TrustStrip />

      {/* Below the fold — gentle fade-in on scroll */}
      <SectionReveal>
        <FeaturedVideos />
      </SectionReveal>
      <SectionReveal>
        <PrintableOfTheWeek />
      </SectionReveal>
      <SectionReveal>
        <SeasonalSpotlight />
      </SectionReveal>
      <SectionReveal>
        <FeaturedPlaylists />
      </SectionReveal>
      <SectionReveal>
        <ShopBestsellers />
      </SectionReveal>
      <SectionReveal>
        <AboutLarissaPreview />
      </SectionReveal>
      <SectionReveal>
        <EducatorBlock />
      </SectionReveal>
      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
      <SectionReveal>
        <AppWaitlistTeaser />
      </SectionReveal>
    </>
  );
}
