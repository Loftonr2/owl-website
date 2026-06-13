import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { PageFade } from "@/components/motion/page-fade";
import { CartProvider } from "@/contexts/cart-context";
import { CartDrawer } from "@/components/store/cart-drawer";

/**
 * Marketing layout — wraps every public page (home, watch, music, shop, etc.).
 * Admin and Studio routes are in separate route groups and don't get this chrome.
 *
 * v4 (Phase 5 — Cart system):
 *   - <CartProvider> provides cart state to every page via context
 *   - <CartDrawer> mounted once — slide-over panel above all content
 *   - <SiteHeader> reads cart item count and opens the drawer on bag icon click
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ScrollProgress />
      <SiteHeader />
      <CartDrawer />
      <main id="main">
        <PageFade>{children}</PageFade>
      </main>
      <SiteFooter />
    </CartProvider>
  );
}
