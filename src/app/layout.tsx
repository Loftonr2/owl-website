import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { MotionSettingsProvider } from "@/components/motion/motion-settings";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", site: siteConfig.twitterHandle },
};

/**
 * Root layout. Owns <html>, <body>, fonts, skip link, and global CSS.
 * Route-group layouts (marketing, admin) own their own headers/footers/sidebars.
 *
 * MotionSettingsProvider hydrates the user's persisted motion preference into
 * <html data-motion="…"> — this is read by:
 *   - globals.css (kills animations when "off")
 *   - lib/motion/scroll.ts hooks
 *   - lib/motion/gsap.ts loader
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={nunito.variable}
      style={{ ["--font-body" as string]: "var(--font-display)" }}
      // Default to "system" until the MotionSettingsProvider hydrates the user's
      // saved choice. Avoids a flash of forced-on or forced-off animation.
      data-motion="system"
    >
      <body className="min-h-screen bg-owl-cream text-owl-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionSettingsProvider>{children}</MotionSettingsProvider>
      </body>
    </html>
  );
}
