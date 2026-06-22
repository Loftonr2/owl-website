import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Page-level metadata helper. Use as:
 *
 *   export const metadata = pageMetadata({ title: "Watch", description: "..." });
 *
 * Falls back to brand defaults from siteConfig. Always emits OG + Twitter cards.
 */
type PageMetaInput = {
  title: string;
  description?: string;
  path?: string; // e.g. "/watch/abc-song"
  image?: string;
  noIndex?: boolean;
};

export function pageMetadata(input: PageMetaInput): Metadata {
  const description = input.description ?? siteConfig.description;
  const path = input.path ?? "";
  const url = `${siteConfig.url.replace(/\/$/, "")}${path}`;
  const image = input.image ?? siteConfig.ogImage;

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image }],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [image],
      site: siteConfig.twitterHandle,
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
