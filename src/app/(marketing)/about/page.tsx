import { pageMetadata } from "@/lib/seo/metadata";

// Shared system primitives
import { NewsHeroBanner } from "@/components/marketing/news-hero-banner";
import { SectionReveal } from "@/components/marketing/section-reveal";

// About Us redesign sections
import { AboutNewsletterHeader } from "@/components/marketing/about/about-newsletter-header";
import { AboutMission } from "@/components/marketing/about/about-mission";
import { AboutWhyOwlExists } from "@/components/marketing/about/about-why-owl-exists";
import { AboutTeam } from "@/components/marketing/about/about-team";
import { AboutLowerNewsletter } from "@/components/marketing/about/about-lower-newsletter";

export const metadata = pageMetadata({
  title: "About OWL Sing Together — Our Mission, Team, and Story",
  description:
    "Meet the heart behind OWL Sing Together — our mission, our team, and why we believe music builds brighter tomorrows for every child.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* 1 — Existing video hero — DO NOT ALTER */}
      <NewsHeroBanner
        src="/videos/about-hero.mp4"
        poster="/images/heroes/about-hero-poster.webp"
        eyebrow="Meet the Team"
        title={
          <>
            Welcome to Our{" "}
            <span className="text-owl-teal">Heartfelt Journey.</span>
          </>
        }
        subtitle="OWL Sing Together carries the tradition of Mr. Rogers into a digital, multicultural age — where every child feels seen, heard, and sung to."
        ctaLabel="Watch Our Videos"
        ctaHref="/watch"
        ctaLabel2="Subscribe to the OWL Weekly"
        ctaHref2="/newsletter"
        meta={
          <p className="italic">&ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa</p>
        }
      />

      {/* 2 — "Join OWL Weekly" newsletter header + form, directly beneath hero */}
      <AboutNewsletterHeader />

      {/* 3 — Our Mission (collapsible card) */}
      <SectionReveal offset={16}>
        <AboutMission />
      </SectionReveal>

      {/* 4 — Why OWL Exists (7 reason cards + mascot) */}
      <SectionReveal offset={20}>
        <AboutWhyOwlExists />
      </SectionReveal>

      {/* 5 — The OWL Team (clickable cards + biography modals) */}
      <SectionReveal offset={16}>
        <AboutTeam />
      </SectionReveal>

      {/* 6 — "Let's Keep Singing Together" lower newsletter CTA */}
      <SectionReveal offset={16}>
        <AboutLowerNewsletter />
      </SectionReveal>
    </>
  );
}
