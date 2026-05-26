import Link from "next/link";
import {
  Mail,
  Clock,
  Users,
  GraduationCap,
  Newspaper,
  FileText,
  Handshake,
  School,
  Megaphone,
  CalendarDays,
  Puzzle,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";

import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { AmbientLayer } from "@/components/marketing/ambient-layer";
import { ContactForm } from "@/components/marketing/contact-form";
import { NewsletterSection } from "@/components/marketing/newsletter-section";

export const metadata = pageMetadata({
  title: "Contact & Licensing",
  description:
    "Get in touch with OWL Sing Together. Parent questions, educator licensing, brand partnerships, press, and sponsorships.",
  path: "/contact",
});

/**
 * /contact — v3 (Wireframe-matched redesign).
 *
 * Sections:
 *   1. Hero Banner
 *   2. Contact Segment Cards (Parents, Educators, Media, Licensing, Sponsors)
 *   3. Inquiry Form + Email/Response Panel
 *   4. Partnership Categories (School Collaborations, Program Co-branding, Event Partnerships)
 *   5. Licensing Opportunities (Toys & Merchandise, Digital Apps & Games, Book Publishing)
 *   6. FAQ Section
 *   7. Newsletter Band
 */

const SEGMENT_CARDS = [
  {
    id: "parents",
    icon: Users,
    title: "Parents",
    body: "General inquiries, questions about a video, song, or printable.",
    color: "bg-owl-teal/10 text-owl-teal",
  },
  {
    id: "educators",
    icon: GraduationCap,
    title: "Educators",
    body: "School and program questions, curriculum licensing, district pilots.",
    color: "bg-owl-amber/10 text-owl-amber",
  },
  {
    id: "media",
    icon: Newspaper,
    title: "Media",
    body: "Press requests, interviews, features, and quote requests.",
    color: "bg-owl-rose/10 text-owl-rose",
  },
  {
    id: "licensing",
    icon: FileText,
    title: "Licensing",
    body: "Licensing and IP inquiries — use OWL music, characters, or curriculum.",
    color: "bg-owl-forest/10 text-owl-forest",
  },
  {
    id: "sponsors",
    icon: Handshake,
    title: "Sponsors",
    body: "Partnership opportunities — vetted, aligned brand sponsors only.",
    color: "bg-owl-amber/10 text-owl-amber",
  },
] as const;

const PARTNERSHIP_CATEGORIES = [
  {
    icon: School,
    title: "School Collaborations",
    body: "Partner with OWL to bring multicultural, standards-aligned content into your school or district. Pilot programs available.",
    color: "bg-owl-teal/10 text-owl-teal",
  },
  {
    icon: Megaphone,
    title: "Program Co-branding",
    body: "Co-brand the OWL curriculum with your organization's identity for parent engagement programs and family outreach.",
    color: "bg-owl-rose/10 text-owl-rose",
  },
  {
    icon: CalendarDays,
    title: "Event Partnerships",
    body: "Invite Larissa to perform, speak, or co-host your cultural celebration, conference, or family literacy event.",
    color: "bg-owl-amber/10 text-owl-amber",
  },
] as const;

const LICENSING_OPPORTUNITIES = [
  {
    icon: Puzzle,
    title: "Toys & Merchandise",
    body: "License OWL characters and artwork for plush toys, games, puzzles, and educational product lines.",
    color: "bg-owl-teal/10 text-owl-teal",
  },
  {
    icon: Gamepad2,
    title: "Digital Apps & Games",
    body: "Integrate OWL songs, characters, and curriculum into your educational app, platform, or interactive game.",
    color: "bg-owl-amber/10 text-owl-amber",
  },
  {
    icon: BookOpen,
    title: "Book Publishing",
    body: "Partner with OWL to create picture books, activity books, and classroom-ready reading materials.",
    color: "bg-owl-rose/10 text-owl-rose",
  },
] as const;

const FAQ = [
  {
    q: "How fast do you reply?",
    a: "Within two business days for most inquiries; same-day for press deadlines. Mention urgency in your message.",
  },
  {
    q: "Can I use OWL music in my classroom?",
    a: "Yes — free YouTube content is free to play in any classroom. For licensed use in third-party content or apps, use the licensing inquiry form above.",
  },
  {
    q: "Do you offer scholarships or reduced pricing?",
    a: "Yes. We cover educator portal licenses for Title I schools and educators serving underserved communities. Email us with details about your program.",
  },
  {
    q: "Can I have Larissa speak at our event?",
    a: "She does limited speaking engagements each year. Contact us with the date, audience size, and budget so we can see if it's a fit.",
  },
  {
    q: "Where is OWL Sing Together based?",
    a: "Las Vegas, Nevada — but OWL serves classrooms and families across the US and beyond.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      {/* 1 — Hero */}
      <CinematicHero
        tone="cream"
        slug="contact"
        bannerAspect="wide"
        eyebrow="Contact & Licensing"
        heading={
          <>
            We&apos;d Love to{" "}
            <span className="text-owl-teal">Hear from You.</span>
          </>
        }
        subhead="OWL is a small, mission-led team. Your message goes straight to a real human. Pick the segment that fits and we'll route you to the right place."
        ambient={<AmbientLayer pattern="leaves" density={3} seed={77} />}
      />

      {/* 2 — Contact Segment Cards */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Who are you?"
            title="Choose Your Inquiry Type"
            subtitle="Select the segment that best describes you so we can respond with the right information."
          />
          <ul
            role="list"
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {SEGMENT_CARDS.map(({ id, icon: Icon, title, body, color }) => (
              <li key={id}>
                <div className="h-full rounded-owl-card border border-owl-cream-deep bg-owl-white p-5 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2">
                  <span
                    aria-hidden
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-sm font-bold text-owl-ink">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-owl-mist">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 3 — Inquiry Form + Email/Response Panel */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,360px]">
            {/* Inquiry Form */}
            <div>
              <SectionIntro
                eyebrow="Send us a note"
                title="Inquiry Form"
                subtitle="Fill in the details below and we'll be in touch within 2–3 business days."
              />
              <div className="rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1 sm:p-8">
                <ContactForm />
              </div>
            </div>

            {/* Email and Response Panel */}
            <div className="flex flex-col gap-5">
              <div className="rounded-owl-card border border-owl-cream-deep bg-owl-teal p-6 shadow-owl-2 text-white">
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-amber-soft">
                  Reach us directly
                </p>
                <div className="mt-4 flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold">Business Email</p>
                    <a
                      href="mailto:contact@owlsingtogether.com"
                      className="mt-1 block text-sm text-white/90 underline underline-offset-2 hover:text-white"
                    >
                      contact@owlsingtogether.com
                    </a>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold">Response Time</p>
                    <p className="mt-1 text-sm text-white/90">Within 2–3 Business Days</p>
                  </div>
                </div>
              </div>

              <div className="rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1">
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-owl-teal">
                  Good to know
                </p>
                <ul className="mt-3 space-y-2 text-sm text-owl-ink/75">
                  <li>✓ All messages read by a real human</li>
                  <li>✓ Press deadlines — mention urgency in subject</li>
                  <li>✓ Educator scholarships available</li>
                  <li>✓ Based in Las Vegas, NV</li>
                </ul>
              </div>
            </div>
          </div>
        </Section>
      </SectionReveal>

      {/* 4 — Partnership Categories */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream">
          <SectionIntro
            eyebrow="Work with us"
            title="Partnership Categories"
            subtitle="OWL collaborates with schools, programs, and organizations that share our mission of culturally affirming early education."
          />
          <ul
            role="list"
            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {PARTNERSHIP_CATEGORIES.map(({ icon: Icon, title, body, color }) => (
              <li key={title}>
                <div className="h-full rounded-owl-card border border-owl-cream-deep bg-owl-white p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2">
                  <span
                    aria-hidden
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-base font-semibold text-owl-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-owl-mist">{body}</p>
                  <div className="mt-4">
                    <Button intent="secondary" size="sm" asChild>
                      <Link href="/contact#inquiry">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 5 — Licensing Opportunities */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionIntro
            eyebrow="IP licensing"
            title="Licensing Opportunities"
            subtitle="Bring OWL characters, music, and curriculum into new formats — with Larissa's direct involvement."
          />
          <ul
            role="list"
            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {LICENSING_OPPORTUNITIES.map(({ icon: Icon, title, body, color }) => (
              <li key={title}>
                <div className="relative h-full rounded-owl-card border border-owl-cream-deep bg-owl-cream p-6 shadow-owl-1 transition-shadow duration-300 ease-owl hover:shadow-owl-2">
                  <span
                    aria-hidden
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-base font-semibold text-owl-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-owl-mist">{body}</p>
                  <div className="mt-4">
                    <Button intent="primary" size="sm" asChild>
                      <Link href="/contact#inquiry">Inquire Now</Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 6 — FAQ */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <SectionIntro
            eyebrow="FAQ"
            title="Common Questions"
            subtitle="Quick answers to the questions we hear most often."
          />
          <ul role="list" className="mt-8 divide-y divide-owl-cream-deep">
            {FAQ.map((item) => (
              <li key={item.q} className="py-5">
                <p className="font-display text-base font-semibold text-owl-ink">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-owl-mist">{item.a}</p>
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      {/* 7 — Newsletter band */}
      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
