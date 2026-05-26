import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { PageFade } from "@/components/motion/page-fade";

/**
 * Marketing layout — wraps every public page (home, watch, music, shop, etc.).
 * Admin and Studio routes are in separate route groups and don't get this chrome.
 *
 * v3 (Phase 2 shared visual system):
 *   - <PageFade> wraps <main> so route changes fade through instead of cut.
 *     Respects reduced-motion (cuts instantly for assistive users).
 *   - <ScrollProgress> + <SiteHeader> + <SiteFooter> unchanged from earlier phases.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main id="main">
        <PageFade>{children}</PageFade>
      </main>
      <SiteFooter />
    </>
  );
}
