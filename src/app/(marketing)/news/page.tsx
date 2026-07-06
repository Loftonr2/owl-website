import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { VideoHeroBanner } from "@/components/marketing/video-hero-banner";
import { Section } from "@/components/ui/section";
import { SectionIntro } from "@/components/ui/section-intro";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { BlogCard, estimateReadTime } from "@/components/marketing/blog-card";
import { SectionReveal } from "@/components/marketing/section-reveal";
import { NewsletterSection } from "@/components/marketing/newsletter-section";
import { getPublishedPosts } from "@/lib/content-posts";
import { SEED_NEWS_CATEGORIES } from "@/lib/seed/news";

export const metadata = pageMetadata({
  title: "News ΓÇö OWL Sing Together",
  description:
    "Updates, stories, and resources for families who believe in the power of music, play, and togetherness.",
  path: "/news",
});

export const revalidate = 3600;

const CATEGORY_CHIPS = [
  { value: "all",           label: "All News",       icon: "≡ƒªë", href: "/news" },
  { value: "announcements", label: "Announcements",   icon: "≡ƒôú", href: "/news/announcements" },
  { value: "events",        label: "Events",          icon: "≡ƒùô∩╕Å", href: "/news/events" },
  { value: "resources",     label: "Resources",       icon: "≡ƒôÜ", href: "/news/resources" },
  { value: "community",     label: "Community",       icon: "≡ƒñ¥", href: "/news/community" },
  { value: "press",         label: "Press",           icon: "≡ƒô░", href: "/news/press" },
];

export default async function NewsPage() {
  const allNews = await getPublishedPosts("news", { limit: 10 });
  const featured = allNews[0] ?? null;
  const rest = allNews.slice(1, 7);
  const hasContent = allNews.length > 0;

  return (
    <>
      {/* ΓöÇΓöÇ Hero ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <VideoHeroBanner
        src="/videos/blog-hero.mp4"
        poster="/images/headers/newsletter-hero.png"
        eyebrow="OWL News"
        heading={
          <>
            News That{" "}
            <span className="text-owl-amber-soft">Inspires Learning</span>{" "}
            &amp; Connection
          </>
        }
        subhead="Updates, stories, and resources for families who believe in the power of music, play, and togetherness."
        primaryCta={{ label: "Explore Latest News", href: "#news" }}
      />

      {/* ΓöÇΓöÇ Category Row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <SectionReveal>
        <Section width="wide" pad="sm" bg="cream">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {CATEGORY_CHIPS.map((c) => (
              <CategoryChip
                key={c.value}
                href={c.href}
                label={`${c.icon} ${c.label}`}
                intent="teal"
                active={c.value === "all"}
              />
            ))}
          </div>
        </Section>
      </SectionReveal>

      {/* ΓöÇΓöÇ Featured News ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {hasContent && featured ? (
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <SectionIntro eyebrow="Featured Story" title="Latest from OWL" />
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr,1fr] items-center">
              {/* Thumbnail */}
              <Link
                href={`/news/${featured.slug}`}
                className="group block overflow-hidden rounded-owl-card shadow-owl-2 transition-transform duration-300 hover:-translate-y-1"
              >
                {featured.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.featured_image}
                    alt={featured.title}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-owl-teal/10">
                    <span className="text-7xl" aria-hidden>≡ƒªë</span>
                  </div>
                )}
              </Link>

              {/* Meta */}
              <div className="flex flex-col justify-center">
                {(() => {
                  const cat = SEED_NEWS_CATEGORIES.find((c) => c.slug === featured.category);
                  return (
                    <span className="inline-flex w-fit items-center rounded-full bg-owl-teal/10 px-3 py-0.5 text-xs font-semibold text-owl-teal">
                      {cat ? `${cat.icon} ${cat.name}` : featured.category}
                    </span>
                  );
                })()}
                <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight text-owl-ink sm:text-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 text-sm leading-relaxed text-owl-ink/75 line-clamp-4">
                    {featured.excerpt}
                  </p>
                )}
                <p className="mt-2 text-xs text-owl-mist">
                  {featured.publish_date &&
                    new Date(featured.publish_date).toLocaleDateString("en-US", {
                      dateStyle: "long",
                    })}
                </p>
                <div className="mt-5">
                  <Button intent="primary" size="sm" asChild>
                    <Link href={`/news/${featured.slug}`}>Read Story &rarr;</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </SectionReveal>
      ) : (
        /* ΓöÇΓöÇ Polished Empty State ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
        <SectionReveal>
          <Section width="wide" pad="lg" bg="white">
            <div className="mx-auto max-w-2xl">
              {/* Decorative banner */}
              <div className="relative overflow-hidden rounded-owl-hero bg-gradient-to-br from-owl-teal via-owl-teal/90 to-owl-forest p-10 text-center text-white shadow-owl-2">
                {/* Background pattern */}
                <div className="pointer-events-none absolute inset-0 opacity-5 select-none">
                  <span className="absolute left-4 top-4 text-6xl">≡ƒÄ╡</span>
                  <span className="absolute right-4 bottom-4 text-6xl">≡ƒÄ╢</span>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px]">≡ƒªë</span>
                </div>

                <div className="relative z-10">
                  <span className="text-5xl" aria-hidden>≡ƒªë</span>
                  <h2 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">
                    New OWL updates are coming soon.
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/85">
                    We&apos;re preparing exciting announcements, events, and community stories.
                    Subscribe to the OWL Weekly to be the first to know.
                  </p>
                  <Button intent="secondary" size="md" asChild className="mt-6">
                    <Link href="/newsletter">Get Notified &rarr;</Link>
                  </Button>
                </div>
              </div>

              {/* What to expect */}
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                  { icon: "≡ƒôú", title: "Announcements", desc: "New products, curriculum updates, and OWL milestones." },
                  { icon: "≡ƒùô∩╕Å", title: "Events",        desc: "Live sessions, workshops, and family community gatherings." },
                  { icon: "≡ƒñ¥", title: "Community",     desc: "Spotlight stories from OWL families around the world." },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-owl-card border border-owl-cream-deep bg-owl-cream/60 p-5 text-center"
                  >
                    <span className="text-3xl" aria-hidden>{icon}</span>
                    <p className="mt-2 font-display text-sm font-bold text-owl-ink">{title}</p>
                    <p className="mt-1 text-xs text-owl-mist">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </SectionReveal>
      )}

      {/* ΓöÇΓöÇ More News Grid ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {rest.length > 0 && (
        <SectionReveal>
          <Section id="news" width="wide" pad="lg" bg="cream">
            <SectionIntro eyebrow="More News" title="Stay in the Loop" />
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {rest.map((article) => {
                const cat = SEED_NEWS_CATEGORIES.find((c) => c.slug === article.category);
                return (
                  <li key={article.slug}>
                    <BlogCard
                      slug={article.slug}
                      title={article.title}
                      summary={article.excerpt ?? ""}
                      categoryName={cat ? `${cat.icon} ${cat.name}` : article.category}
                      publishedAt={article.publish_date ?? article.created_at}
                      tone="teal"
                      featuredImage={article.featured_image}
                      readTime={estimateReadTime(article.body)}
                      contentType="news"
                    />
                  </li>
                );
              })}
            </ul>
          </Section>
        </SectionReveal>
      )}

      {/* ΓöÇΓöÇ Newsletter Signup Panel ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <SectionReveal>
        <Section width="wide" pad="lg" bg="cream-deep">
          <div className="rounded-owl-hero bg-owl-teal p-8 text-center sm:p-10 md:flex md:items-center md:justify-between md:text-left">
            <div className="text-white">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-owl-amber-soft">
                Don&apos;t Miss Out!
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
                Be first to hear OWL news
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Weekly updates, events, and community stories ΓÇö always free.
              </p>
            </div>
            <Button intent="secondary" size="lg" asChild className="mt-5 shrink-0 md:mt-0 md:ml-8">
              <Link href="/newsletter">Subscribe Free &rarr;</Link>
            </Button>
          </div>
        </Section>
      </SectionReveal>

      <SectionReveal>
        <NewsletterSection />
      </SectionReveal>
    </>
  );
}
