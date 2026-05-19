import { pageMetadata } from "@/lib/seo/metadata";
import { headers } from "@/lib/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { BlogCard } from "@/components/marketing/blog-card";
import { PrintableCard } from "@/components/marketing/printable-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SEED_BLOG_ARTICLES, SEED_BLOG_CATEGORIES } from "@/lib/seed/blog";
import { SEED_PRINTABLES } from "@/lib/seed/printables";

export const metadata = pageMetadata({
  title: "Teacher Resources",
  description: "Classroom-ready OWL printables, lesson tools, and standards-aligned guides for K–3 educators.",
  path: "/teacher-resources",
});

export default function TeacherResourcesPage() {
  const articles = SEED_BLOG_ARTICLES.filter((a) => a.category === "educator-resources" || a.category === "cultural-holidays").slice(0, 6);
  const classroomPrintables = SEED_PRINTABLES.filter((p) =>
    ["Homeschool", "K-readiness", "Cultural"].includes(p.skill)
  );

  return (
    <>
      <PageHero
        eyebrow="For teachers"
        title="Classroom-ready, standards-aligned"
        subtitle="The OWL teacher toolbox — printables, lesson tools, and resources mapped to ELOF and Common Core."
        image={{ src: headers.teacherResources.src, alt: headers.teacherResources.alt }}
        ambient="leaves"
        tone="forest"
      />

      <Section width="wide" pad="lg" bg="cream">
        <SectionHeader eyebrow="Read" title="Articles for educators" />
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => {
            const cat = SEED_BLOG_CATEGORIES.find((c) => c.slug === a.category);
            return (
              <li key={a.slug}>
                <BlogCard
                  slug={a.slug}
                  title={a.title}
                  summary={a.summary}
                  categoryName={cat?.name ?? a.category}
                  publishedAt={a.publishedAt}
                  tone={a.tone}
                />
              </li>
            );
          })}
        </ul>
      </Section>

      <SectionReveal>
        <Section width="wide" pad="lg" bg="white">
          <SectionHeader eyebrow="Print" title="Classroom printables" />
          <ul role="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {classroomPrintables.map((p) => (
              <li key={p.slug}>
                <PrintableCard {...p} />
              </li>
            ))}
          </ul>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <Section width="wide" pad="lg" bg="forest">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.4fr,1fr]">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-amber-soft">
                Educator portal — coming soon
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Full curriculum library + standards crosswalks
              </h2>
              <p className="mt-4 max-w-prose text-base text-white/85">
                216 lesson plans across Birth–5, classroom playlists, and printable libraries
                — bundled with state-specific standards crosswalks.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild intent="primary" size="lg" className="bg-owl-amber text-owl-ink hover:bg-owl-amber-soft">
                <Link href="/educators">View pricing</Link>
              </Button>
              <Button asChild intent="ghost" size="lg" className="border border-white/30 text-white hover:bg-white/10">
                <Link href="/contact">Request a pilot</Link>
              </Button>
            </div>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
