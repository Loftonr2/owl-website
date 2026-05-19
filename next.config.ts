import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  // Gate on env so the analyzer never runs in normal CI builds.
  // Enable with `ANALYZE=true npm run build`.
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // YouTube thumbnails (video archive)
      { protocol: "https", hostname: "i.ytimg.com" },
      // YouTube CDN posters (used by resolveVideoPoster fallback)
      { protocol: "https", hostname: "img.youtube.com" },
      // Sanity CDN (CMS images)
      { protocol: "https", hostname: "cdn.sanity.io" },
      // Cloudflare R2 (printable previews + gated PDF thumbnails)
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      // Shopify product images (when commerce is wired)
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  // Disabled — many marketing routes are dynamic (e.g. /shop?category=…,
  // anchor links like /watch#archive). Re-enable when we're ready to type
  // every Link href across the marketing surface.
  typedRoutes: false,
};

export default withBundleAnalyzer(nextConfig);
