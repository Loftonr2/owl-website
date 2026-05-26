import Image from "next/image";
import Link from "next/link";
import { OwlMark } from "@/components/brand/owl-logo";
import { Chip } from "@/components/ui/chip";
import { ComingSoonRibbon } from "@/components/ui/coming-soon-ribbon";
import { resolveProductImage } from "@/lib/images";
import { cn } from "@/lib/cn";

/**
 * ProductCard — v2 (redesign).
 *
 * Layered composition (per redesign brief):
 *   1. Card surface (white)
 *   2. Tonal product image area (with subtle gradient + OwlMark watermark)
 *   3. Coming Soon corner ribbon (when isComingSoon)
 *   4. Text content (category, title, price, age chip)
 *
 * The visual placeholder for the product image is intentionally a clean tonal
 * panel with the OwlMark watermark and the product's initials. **This is the
 * ASSET INTERFACE** — when real product photography exists, swap the inner
 * panel for a <Image src={product.imageUrl} /> (already typed in SeedProduct).
 * Do NOT fabricate product photos.
 */

export type ProductCardProps = {
  slug: string;
  title: string;
  price: string;
  ageRange: string;
  category: string;
  tone: "amber" | "teal" | "rose" | "forest" | "mist" | "cream";
  /** When true, renders a corner ribbon and disables direct add-to-cart calls. */
  isComingSoon?: boolean;
};

const toneStyles: Record<ProductCardProps["tone"], { bg: string; gradient: string }> = {
  amber: {
    bg: "bg-owl-amber-soft/40",
    gradient: "bg-[linear-gradient(135deg,rgba(248,201,117,0.20)_0%,rgba(245,166,35,0.30)_100%)]",
  },
  teal: {
    bg: "bg-owl-teal/15",
    gradient: "bg-[linear-gradient(135deg,rgba(26,153,148,0.10)_0%,rgba(26,153,148,0.25)_100%)]",
  },
  rose: {
    bg: "bg-owl-rose/25",
    gradient: "bg-[linear-gradient(135deg,rgba(232,159,142,0.20)_0%,rgba(232,159,142,0.35)_100%)]",
  },
  forest: {
    bg: "bg-owl-forest/10",
    gradient: "bg-[linear-gradient(135deg,rgba(45,74,58,0.10)_0%,rgba(45,74,58,0.25)_100%)]",
  },
  mist: {
    bg: "bg-owl-mist/20",
    gradient: "bg-[linear-gradient(135deg,rgba(122,135,148,0.15)_0%,rgba(122,135,148,0.30)_100%)]",
  },
  cream: {
    bg: "bg-owl-cream-deep",
    gradient: "bg-[linear-gradient(135deg,rgba(243,235,218,0.5)_0%,rgba(232,159,142,0.30)_100%)]",
  },
};

export function ProductCard({
  slug,
  title,
  price,
  ageRange,
  category,
  tone,
  isComingSoon,
}: ProductCardProps) {
  const t = toneStyles[tone];
  const initials = title
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const productImage = resolveProductImage(slug);

  return (
    <Link
      href={`/shop/${slug}`}
      aria-label={`${title} — ${price}${isComingSoon ? " — coming soon" : ""}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-owl-card",
        "border border-owl-cream-deep bg-owl-white shadow-owl-1",
        "transition-all duration-300 ease-owl",
        "hover:-translate-y-0.5 hover:shadow-owl-2 hover:border-owl-teal/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
      )}
    >
      {/* Layer 2 — product image area
          Tonal panel + initials is the skeleton floor; when products[slug] has
          a primary photo, it stacks above. OwlMark stays on top regardless. */}
      <div
        className={cn(
          "relative isolate flex aspect-square items-center justify-center overflow-hidden rounded-t-owl-card",
          t.bg
        )}
      >
        <div aria-hidden className={cn("absolute inset-0", t.gradient)} />
        {!productImage.src && (
          <span className="relative font-display text-4xl font-extrabold text-owl-ink/30 transition-transform duration-300 ease-owl group-hover:scale-110">
            {initials}
          </span>
        )}
        {productImage.src && (
          <Image
            src={productImage.src}
            alt={productImage.alt || title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="absolute inset-0 object-cover transition-transform duration-300 ease-owl group-hover:scale-105"
            data-product-source={productImage.source}
          />
        )}
        <OwlMark
          decorative
          className="absolute left-3 bottom-3 h-8 w-8 opacity-90 drop-shadow-sm"
        />
      </div>

      {/* Layer 3 — ribbon overlay */}
      {isComingSoon && <ComingSoonRibbon variant="corner" />}

      {/* Layer 4 — text content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-owl-mist">
          {category}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-tight text-owl-ink">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span
            className={cn(
              "font-display text-sm font-bold",
              isComingSoon ? "text-owl-mist line-through" : "text-owl-teal"
            )}
          >
            {price}
          </span>
          <Chip>Ages {ageRange}</Chip>
        </div>
      </div>
    </Link>
  );
}
