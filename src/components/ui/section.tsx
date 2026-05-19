import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Section wrapper — consistent vertical rhythm and max-width across the site.
 * Per OWL_BUILD_RULES §4 / DESIGN_STYLE_GUIDE §4:
 *  - `py-16` on desktop, `py-10` on mobile
 *  - `max-w-7xl` for hubs/archives, `max-w-3xl` for long-form
 */
type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article" | "aside";
  width?: "narrow" | "wide" | "full";
  pad?: "none" | "sm" | "md" | "lg";
  bg?: "cream" | "cream-deep" | "white" | "forest" | "teal";
};

const widths: Record<NonNullable<SectionProps["width"]>, string> = {
  narrow: "max-w-3xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

const pads: Record<NonNullable<SectionProps["pad"]>, string> = {
  none: "py-0",
  sm: "py-8 md:py-10",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
};

const bgs: Record<NonNullable<SectionProps["bg"]>, string> = {
  cream: "bg-owl-cream",
  "cream-deep": "bg-owl-cream-deep",
  white: "bg-white",
  forest: "bg-owl-forest text-white",
  teal: "bg-owl-teal text-white",
};

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, as = "section", width = "wide", pad = "md", bg, children, ...props }, ref) => {
    const El = as as React.ElementType;
    return (
      <El
        ref={ref}
        className={cn(bg && bgs[bg], pads[pad], className)}
        {...props}
      >
        <div className={cn("mx-auto px-6 sm:px-10", widths[width])}>{children}</div>
      </El>
    );
  }
);
Section.displayName = "Section";

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) => (
  <header className={cn("mb-10", align === "center" && "text-center")}>
    {eyebrow && (
      <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-teal">
        {eyebrow}
      </p>
    )}
    <h2 className="mt-2 font-display text-3xl font-bold text-owl-ink sm:text-4xl">
      {title}
    </h2>
    {subtitle && (
      <p className={cn("mt-3 max-w-prose text-base text-owl-mist", align === "center" && "mx-auto")}>
        {subtitle}
      </p>
    )}
  </header>
);
