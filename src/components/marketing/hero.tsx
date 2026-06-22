import { VideoHeroBanner } from "./video-hero-banner";

/**
 * Homepage hero — full-width 16:9 video + text band below.
 */
export function Hero() {
  return (
    <VideoHeroBanner
      src="/videos/landing-hero.mp4"
      poster="/images/headers/home-hero.png"
      eyebrow="OWL Sing Together — With Larissa"
      heading={
        <>
          Every Child <span className="text-owl-teal">Belongs Here.</span>
        </>
      }
      subhead="Warm, multicultural music, videos, printables, and curriculum for children Birth–14. Slow pacing, big feelings, joyful learning."
      primaryCta={{ label: "Watch free videos", href: "/watch" }}
      secondaryCta={{ label: "Get free printables", href: "/printables" }}
      meta={<p className="italic">&ldquo;I&apos;m so glad you&apos;re here today.&rdquo; — Larissa</p>}
    />
  );
}
