"use client";

import { OwlMark, OwlWordmark } from "./owl-logo";
import { useMouseMagnet } from "@/lib/motion/mouse";
import { cn } from "@/lib/cn";

/**
 * OwlLockup — Mark + Wordmark, horizontal, with cursor-magnet hover.
 *
 * Split out from `owl-logo.tsx` so the magnet hook (a client-only hook)
 * doesn't force the whole brand module into a client bundle. Re-exported
 * from `owl-logo.tsx` for call-site compatibility — every existing
 * `import { OwlLockup } from "@/components/brand/owl-logo"` keeps working.
 *
 * Behavior:
 *   - Subtle cursor-magnet (~2–3 px pull) on fine-pointer devices.
 *   - Skipped on touch + when reduced-motion is on.
 *   - Magnet attaches to the wrapping `<span>` (the link parent is the
 *     real `<a>` — the magnet is purely visual feedback).
 *
 * Use this in the site-header brand link and footer.
 */

type LockupSize = "sm" | "md" | "lg";

const sizes: Record<LockupSize, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-12",
};

export interface OwlLockupProps {
  size?: LockupSize;
  className?: string;
  /** Screen-reader label. Defaults to the brand name. */
  title?: string;
  /** When true, the logo is purely decorative (hidden from assistive tech). */
  decorative?: boolean;
  /** When false, hides the wordmark and renders just the mark. */
  showWordmark?: boolean;
}

export function OwlLockup({
  size = "md",
  className,
  title = "OWL Sing Together",
  decorative,
  showWordmark = true,
}: OwlLockupProps) {
  const { ref: magnetRef, style: magnetStyle } = useMouseMagnet<HTMLSpanElement>({
    strength: 3,
  });

  return (
    <span
      ref={magnetRef}
      style={magnetStyle}
      className={cn("inline-flex items-center gap-2.5", sizes[size], className)}
    >
      <OwlMark size={size} title={title} decorative={decorative} />
      {showWordmark && (
        <OwlWordmark
          size={size}
          title={title}
          decorative={decorative}
          className="hidden sm:block"
        />
      )}
    </span>
  );
}
