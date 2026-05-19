import { pageMetadata } from "@/lib/seo/metadata";
import { Section, SectionHeader } from "@/components/ui/section";
import { ContactForm } from "@/components/marketing/contact-form";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

export const metadata = pageMetadata({
  title: "Contact & Licensing",
  description: "Get in touch with OWL Sing Together. Parent questions, educator licensing, brand partnerships, press, and sponsorships.",
  path: "/contact",
});

const SEGMENT_CARDS = [
  { id: "parent", title: "Parents & caregivers", body: "Questions about a video, song, or printable? Start here." },
  { id: "educator", title: "Educators & schools", body: "Curriculum licensing, classroom packs, and district pilots." },
  { id: "media", title: "Press & media", body: "Interviews, features, and quote requests." },
  { id: "licensing", title: "Content licensing", body: "Use OWL's music, characters, or curriculum in your project." },
  { id: "sponsor", title: "Brand sponsors", body: "Aligned brand partnerships — vetted only." },
] as const;

const FAQ = [
  { q: "How fast do you reply?", a: "Within two business days for most inquiries; same-day for press deadlines." },
  { q: "Can I use OWL music in my classroom?", a: "Yes. Free YouTube content is free to play in any classroom. For licensed use in third-party content or apps, see the licensing card above." },
  { q: "Do you offer scholarships?", a: "Yes — we cover educator portal licenses for Title I schools and educators serving underserved communities. Email us with details." },
  { q: "Can I have Larissa speak at our event?", a: "She does limited speaking each year. Contact us with the date, audience size, and budget." },
  { q: "Where are you based?", a: "Las Vegas, Nevada." },
] as const;

export default function ContactPage() {
  return (
    <>
      <Section width="wide" pad="lg" bg="cream-deep">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-teal">
              Contact & licensing
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold text-owl-ink sm:text-5xl">
              We&apos;d love to hear from you.
            </h1>
            <p className="mt-5 max-w-prose text-base text-owl-mist sm:text-lg">
              OWL is a small team — your message goes straight to a real human (usually Rick).
              Pick the segment that fits and we&apos;ll route you to the right place.
            </p>
          </div>

          <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SEGMENT_CARDS.map((s) => (
              <li key={s.id}>
                <div className="h-full rounded-owl-card border border-owl-cream-deep bg-white p-5 shadow-sm">
                  <h2 className="font-display text-sm font-semibold text-owl-ink">{s.title}</h2>
                  <p className="mt-2 text-xs text-owl-mist">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <SectionReveal>
        <Section width="narrow" pad="lg" bg="cream">
          <SectionHeader eyebrow="Send us a note" title="Inquiry form" />
          <div className="rounded-owl-card border border-owl-cream-deep bg-white p-6 shadow-sm sm:p-8">
            <ContactForm />
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <Section width="narrow" pad="lg" bg="white">
          <SectionHeader eyebrow="FAQ" title="Common questions" />
          <ul role="list" className="divide-y divide-owl-cream-deep">
            {FAQ.map((item) => (
              <li key={item.q} className="py-5">
                <p className="font-display text-base font-semibold text-owl-ink">{item.q}</p>
                <p className="mt-2 text-sm text-owl-mist">{item.a}</p>
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
