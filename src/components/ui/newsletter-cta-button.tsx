import * as React from "react";
import { Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * NewsletterCTAButton — purpose-built submit button for the newsletter band.
 *
 * Why a separate component instead of just `<Button intent="primary">`?
 * The newsletter band has specific layout needs:
 *   - Full width on mobile (stacks below the email input).
 *   - Inline + intrinsic width on desktop (sits to the right of the input).
 *   - Mail icon prepended so the affordance reads even before the user
 *     parses the copy.
 *   - Loading state is the default expectation (server action mid-flight).
 *
 * Visually it's the amber CTA from the standard Button system. The shape
 * and the icon are what make it a band button. Use anywhere you have a
 * newsletter-form-shaped CTA: the homepage band, the printable gate, the
 * sticky CTA on long pages.
 */

type ButtonHtmlProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export interface NewsletterCTAButtonProps extends ButtonHtmlProps {
  /** Visible label, e.g. "Subscribe", "Send me the pack". */
  children: React.ReactNode;
  /** Show spinner + disable while a server action runs. */
  loading?: boolean;
  /** Hide the leading mail icon. Default false. */
  noIcon?: boolean;
}

export const NewsletterCTAButton = React.forwardRef<HTMLButtonElement, NewsletterCTAButtonProps>(
  ({ children, className, loading, noIcon, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? "submit"}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          // Layout: full-width on mobile, intrinsic on sm+. Tall band height.
          "inline-flex w-full items-center justify-center gap-2 rounded-owl-btn px-6 sm:w-auto",
          "h-12 sm:h-12",
          // Type
          "font-display text-base font-bold",
          // Color — amber CTA, ink text per DESIGN.md §4
          "bg-owl-amber text-owl-ink shadow-owl-1",
          // Hover + active
          "transition-[transform,color,background-color,box-shadow] duration-200 ease-owl-quick",
          "hover:bg-owl-amber-soft hover:-translate-y-px hover:shadow-owl-amber-glow",
          "active:translate-y-px",
          // Focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream",
          // Disabled
          "disabled:pointer-events-none disabled:opacity-60",
          // Cursor
          "cursor-pointer select-none",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : noIcon ? null : (
          <Mail className="h-4 w-4" aria-hidden />
        )}
        <span>{children}</span>
      </button>
    );
  }
);
NewsletterCTAButton.displayName = "NewsletterCTAButton";
