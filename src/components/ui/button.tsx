"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMouseMagnet } from "@/lib/motion/mouse";

/**
 * OWL Button — primary UI primitive.
 *
 * v3 (cursor-following hover, Visual-track post-P6):
 *   - All hover/focus/active states declared via Tailwind state utilities
 *     (DESIGN.md §10).
 *   - Adds icon-end + loading states.
 *   - Adds `tertiary` (warm amber) and refines `secondary` (paper card).
 *   - Adds `xl` size for hero CTAs.
 *   - **Magnetic cursor-following hover** via `useMouseMagnet` — the button
 *     translates ~4–6px toward the cursor on hover (fine-pointer devices).
 *     Defaults to ON for `lg`/`xl` sizes (the CTA tier). Opt-in via
 *     `magnetic` prop for `sm`/`md` if you want it. Reduced-motion + touch
 *     skip the effect automatically inside the hook.
 *
 * Variants follow OWL_BUILD_RULES.md §3 (primary | secondary | tertiary | ghost).
 *
 *   <Button intent="primary">Watch free videos</Button>
 *   <Button intent="secondary" asChild><Link href="/printables">…</Link></Button>
 *   <Button intent="primary" loading>Subscribing…</Button>
 *   <Button intent="primary" size="sm" magnetic>Subscribe</Button>
 *
 * NOTE: Existing pages already pass intent="primary"|"secondary"|"tertiary"|"ghost"
 * — those continue to work unchanged. Only the visuals + hover physics are
 * upgraded.
 */

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-owl-btn font-display font-semibold",
    // Transition transform + colors + shadow together; keep on transform/opacity
    // for cheap repaints (DESIGN.md §9).
    "transition-[transform,color,background-color,box-shadow,border-color] duration-200 ease-owl-quick",
    // Pressed state — gentle tactile depress.
    "active:translate-y-px",
    // Focus ring (DESIGN_STYLE_GUIDE §6 + WCAG AA).
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer select-none",
  ].join(" "),
  {
    variants: {
      intent: {
        // Primary: amber CTA — most important action on a screen. Per
        // DESIGN.md §4: "amber for the single most important CTA, ink text,
        // soft golden glow on hover".
        primary: [
          "bg-owl-amber text-owl-ink shadow-owl-1",
          "hover:bg-owl-amber-soft hover:shadow-owl-amber-glow hover:-translate-y-px",
        ].join(" "),
        // Secondary: teal — trust action.
        secondary: [
          "bg-owl-teal text-white shadow-owl-1",
          "hover:bg-owl-teal-deep hover:shadow-owl-2 hover:-translate-y-px",
        ].join(" "),
        // Tertiary: paper card with soft border. For dual-CTA pairs.
        tertiary: [
          "bg-owl-white text-owl-forest border border-owl-cream-deep shadow-owl-1",
          "hover:border-owl-forest/40 hover:shadow-owl-2 hover:-translate-y-px",
        ].join(" "),
        // Ghost: no surface, text only.
        ghost: [
          "bg-transparent text-owl-ink",
          "hover:bg-owl-cream-deep hover:text-owl-teal",
        ].join(" "),
        // Inverted: for use on dark/teal/forest banners.
        inverted: [
          "bg-owl-white/95 text-owl-ink shadow-owl-1",
          "hover:bg-owl-white hover:shadow-owl-2 hover:-translate-y-px",
        ].join(" "),
        // Destructive: reserved for unsubscribe / delete actions.
        destructive: [
          "bg-owl-error text-white shadow-owl-1",
          "hover:bg-owl-error/90 hover:shadow-owl-2",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-13 px-6 text-lg",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: { intent: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Show a spinner + disable while a server action is in flight. */
  loading?: boolean;
  /** Optional icon slot rendered at the end (after children). */
  iconEnd?: React.ReactNode;
  /** Optional icon slot rendered at the start (before children). */
  iconStart?: React.ReactNode;
  /**
   * Cursor-magnet hover behavior. Default ON for `lg`/`xl` sizes (CTA tier),
   * OFF for smaller sizes. Set explicitly to override the default.
   * Reduced-motion + touch skip the effect inside the hook.
   */
  magnetic?: boolean;
}

/** Merge a magnet ref + a forwarded ref into one callback ref. */
function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | React.MutableRefObject<T | null> | undefined>
) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      intent,
      size,
      asChild = false,
      loading,
      iconStart,
      iconEnd,
      children,
      disabled,
      magnetic,
      style,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Default: ON for lg/xl, OFF for sm/md (unless explicitly enabled).
    const defaultMagnetic = size === "lg" || size === "xl";
    const magnetEnabled =
      magnetic !== undefined ? magnetic : defaultMagnetic;

    const { ref: magnetRef, style: magnetStyle } = useMouseMagnet<HTMLButtonElement>({
      strength: size === "xl" ? 6 : size === "lg" ? 5 : 4,
    });

    // Merge magnet ref with the forwarded ref. When magnetEnabled is false,
    // we skip the magnet ref so the hook still runs (Rules of Hooks) but no
    // pointermove listener actually attaches because the hook's internal
    // ref is never assigned to a DOM element.
    const mergedRef = magnetEnabled
      ? mergeRefs<HTMLButtonElement>(ref, magnetRef as React.RefObject<HTMLButtonElement>)
      : ref;

    // When `asChild` is used (e.g. wrapping a <Link>), we can't add icon slots
    // around the inner content — Slot expects a single child. So we render
    // children-as-is in that case and ignore iconStart/iconEnd.
    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          iconStart && <span aria-hidden>{iconStart}</span>
        )}
        <span>{children}</span>
        {iconEnd && !loading && <span aria-hidden>{iconEnd}</span>}
      </>
    );

    return (
      <Comp
        ref={mergedRef}
        className={cn(buttonVariants({ intent, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        style={magnetEnabled ? { ...magnetStyle, ...style } : style}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
