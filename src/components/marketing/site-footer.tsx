import Link from "next/link";
import { Facebook, Instagram, Music, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { OwlLockup } from "@/components/brand/owl-logo";
import { MotionToggle } from "@/components/motion/motion-toggle";
import { NewsletterForm } from "./newsletter-form";

/**
 * Marketing site footer.
 * Layout per OWL Home Page wireframe: slim newsletter band on top, then
 * a 4-column nav block with brand on left.
 */
const SOCIALS = [
  { href: siteConfig.social.youtube, label: "YouTube", Icon: Youtube },
  { href: siteConfig.social.instagram, label: "Instagram", Icon: Instagram },
  { href: siteConfig.social.facebook, label: "Facebook", Icon: Facebook },
  { href: siteConfig.social.tiktok, label: "TikTok", Icon: Music },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-owl-cream-deep">
      {/* Slim newsletter band */}
      <div className="border-b border-owl-cream/60">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 py-8 sm:px-10 md:grid-cols-[1fr,1fr]">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-teal">
              The OWL Weekly
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-owl-ink">
              One short letter from Larissa, every Sunday.
            </p>
          </div>
          <NewsletterForm source="footer" ctaLabel="Subscribe" />
        </div>
      </div>

      {/* Multi-column footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-10 md:grid-cols-[1.4fr,1fr,1fr,1fr]">
        <div>
          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            className="inline-flex items-center rounded-owl-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream-deep"
          >
            <OwlLockup size="md" title={`${siteConfig.name} home`} />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-owl-mist">
            {siteConfig.description}
          </p>
          <ul role="list" className="mt-6 flex gap-3">
            {SOCIALS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-owl-ink/70 shadow-sm transition-colors hover:text-owl-teal"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <FooterColumn
          title="Explore"
          items={siteConfig.nav.primary}
        />
        <FooterColumn
          title="More"
          items={[
            ...siteConfig.nav.utility,
            { label: "Recommended", href: "/recommendations" },
            { label: "Gallery", href: "/gallery" },
            { label: "App waitlist", href: "/app" },
          ]}
        />
        <FooterColumn
          title="Company"
          items={[
            { label: "Educators", href: "/educators" },
            { label: "Licensing", href: "/contact" },
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
          ]}
        />
      </div>

      <div className="border-t border-owl-cream/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-xs text-owl-mist sm:flex-row sm:px-10">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}, LLC · Las Vegas, NV · All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-owl-mist/70">Motion</span>
            <MotionToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-owl-ink">
        {title}
      </h2>
      <ul role="list" className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-owl-ink/80 hover:text-owl-teal">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
