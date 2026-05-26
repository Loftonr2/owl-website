import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * GlassCard — SUBTLE glass surface for layered hero blocks.
 *
 * Important constraint (DESIGN_STYLE_GUIDE §12 anti-pattern):
 *   "Gradient meshes, glassmorphism heavy enough to obscure text."
 *
 * This component intentionally caps blur at 12px and opacity at ~18%.
 * NEVER use it under primary body text. Reserve for hero detail panels,
 * stat tiles, video card overlays, and "next up" floating ribbons.
 *
 * Variants:
 *   - frost  (default): cream-tinted glass for warm backgrounds
 *   - light:            white-tinted glass, for use over photography
 *   - forest:           dark forest-tinted glass, for use on light backgrounds
 *                       (high contrast for white text)
 *
 * The classes resolve via `@layer components` in globals.css.
 */

type GlassVariant = "frost" | "light" | "forest";

const variantClasses: Record<GlassVariant, string> = {
  frost: "owl-glass-cream text-owl-ink",
  light: "owl-glass text-owl-ink",
  forest: "owl-glass-forest text-white",
};

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  /** Apply a soft hover lift. Off by default for non-interactive panels. */
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "frost", interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-owl-card p-5 sm:p-6",
          variantClasses[variant],
          interactive &&
            "transition-all duration-300 ease-owl hover:-translate-y-0.5 hover:shadow-owl-2 focus-within:-translate-y-0.5 focus-within:shadow-owl-2",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
