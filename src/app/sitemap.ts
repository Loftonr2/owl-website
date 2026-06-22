import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * /sitemap.xml — Next.js generates this from the array we return.
 *
 * Phase 1 returns just the static top-level routes. Once Sanity is wired
 * (Phase 2) this file will also fetch all published video, printable,
 * product, blog, and holiday-hub slugs and append them here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/watch`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/music`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/printables`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/holidays`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/educators`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  return staticRoutes;
}
