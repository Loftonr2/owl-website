import { NewsHeroBanner } from "./news-hero-banner";

/**
 * Homepage hero — cinematic video overlay, site-wide standard height.
 * Thin wrapper around NewsHeroBanner so the home page import stays unchanged.
 */
export function Hero() {
  return (
    <NewsHeroBanner
      src="/videos/landing-hero.mp4"
      poster="/images/heroes/landing-hero-poster.webp"
      eyebrow="OWL Sing Together — With Larissa"
      title={
        <>
          Every Child <span className="text-owl-teal">Belongs Here.</span>
        </>
      }
      subtitle="Warm, multicultural music, videos, printables, and curriculum for children Birth–14. Slow pacing, big feelings, joyful learning."
      ctaLabel="Watch free videos"
      ctaHref="/watch"
      ctaLabel2="Get free printables"
      ctaHref2="/printables"
      meta={<p className="italic">&ldquo;I&apos;m so glad you&apos;re here today.&rdquo; &mdash; Larissa</p>}
    />
  );
}
