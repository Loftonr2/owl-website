/**
 * Single source of truth for site-wide constants.
 * Anything imported from process.env should funnel through here so we can
 * change one file when domains, public URLs, or default OG images move.
 */

export const siteConfig = {
  name: "OWL Sing Together",
  shortName: "OWL",
  tagline: "Every Child Belongs Here.",
  description:
    "Warm, multicultural educational music, videos, printables, and curriculum for children Birth–14. With Larissa.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://owlsingtogether.com"
      : "http://localhost:3000"),
  ogImage: "/og/owl-default.png",
  twitterHandle: "@OWLSingTogether",
  contactEmail: "hello@owlsingtogether.com",
  social: {
    youtube: "https://www.youtube.com/@LearningTheABCs",
    instagram: "https://www.instagram.com/owlsingtogether",
    tiktok: "https://www.tiktok.com/@owlsingtogether",
    pinterest: "https://www.pinterest.com/owlsingtogether",
    facebook: "https://www.facebook.com/owlsingtogether",
  },
  /** Canonical primary navigation per WEBSITE_REQUIREMENTS.md § Site Map */
  nav: {
    primary: [
      { label: "Home", href: "/" },
      { label: "Watch", href: "/watch" },
      { label: "Music", href: "/music" },
      { label: "Shop", href: "/shop" },
      { label: "Printables", href: "/printables" },
      { label: "Holidays", href: "/holidays" },
      { label: "Educators", href: "/educators" },
      { label: "About", href: "/about" },
    ],
    utility: [
      { label: "Newsletter", href: "/newsletter" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
