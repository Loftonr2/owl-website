import { pageMetadata } from "@/lib/seo/metadata";
import { headers } from "@/lib/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { Smartphone, ShieldCheck, BookOpen, Sparkles } from "lucide-react";

export const metadata = pageMetadata({
  title: "OWL App — Join the Waitlist",
  description: "Ad-free, parent-controlled OWL learning on iOS and Android. Join the waitlist for early access.",
  path: "/app",
});

const FEATURES = [
  { icon: Smartphone, title: "Ad-free", body: "No interruptions, ever. No data sold." },
  { icon: ShieldCheck, title: "Parent-controlled", body: "Daily limits, age locks, and a kids-mode PIN." },
  { icon: BookOpen, title: "Interactive learning", body: "Watch, sing, color, and trace — all in one app." },
  { icon: Sparkles, title: "Offline-friendly", body: "Download a week of content for road trips." },
] as const;

export default function AppWaitlistPage() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        title="Be the first to OWL on the go"
        subtitle="An ad-free, parent-controlled OWL app for iOS and Android. Join the waitlist for early access + a launch discount."
        image={{ src: headers.app.src, alt: headers.app.alt }}
        ambient="stars"
        tone="forest"
      />

      <Section width="wide" pad="lg" bg="cream">
        <SectionHeader eyebrow="What's inside" title="App features" />
        <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-owl-card border border-owl-cream-deep bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-owl-teal/10">
                <Icon className="h-5 w-5 text-owl-teal" aria-hidden />
              </div>
              <h3 className="font-display text-base font-semibold text-owl-ink">{title}</h3>
              <p className="mt-2 text-sm text-owl-mist">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <SectionReveal>
        <Section width="narrow" pad="lg" bg="white">
          <SectionHeader
            eyebrow="Waitlist"
            title="Get early access"
            subtitle="We'll email you when the app is available + send a launch-day discount code."
          />
          <div className="rounded-owl-card border border-owl-cream-deep bg-owl-cream-deep p-6 sm:p-8">
            <NewsletterForm
              source="other"
              ctaLabel="Join the waitlist"
              headline=""
              body=""
            />
          </div>
        </Section>
      </SectionReveal>
    </>
  );
}
