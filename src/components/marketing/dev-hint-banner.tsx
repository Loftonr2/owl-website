import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * DevHintBanner — self-documenting "asset pending" hint, dev-only.
 *
 * Renders nothing in production. In development, renders a subtle but visible
 * amber banner explaining which asset field is missing and where to set it.
 *
 * The banner is intentionally NOT styled like a real production message — it's
 * a developer/QA aid. If you see it on a deployed site, something is wrong
 * with the build setup (NODE_ENV !== "production").
 *
 * Currently used by `/watch/[slug]` when both `youtubeId` and `posterSrc` are
 * absent on a video, which is the most confusing failure mode (player looks
 * "broken" but is actually doing the right thing).
 */

export interface DevHintBannerProps {
  /** Short heading — e.g. "Video player is in 'Coming soon' state". */
  title: string;
  /** Body explaining what to set + where. Markdown-free string. */
  body: string;
  /** Optional code snippet showing the exact field/line to edit. */
  hint?: string;
  /** Optional className for the wrapper. */
  className?: string;
}

export function DevHintBanner({ title, body, hint, className }: DevHintBannerProps) {
  // Render nothing in production. Next.js inlines NODE_ENV at build time so
  // the entire branch tree-shakes out of the prod bundle.
  if (process.env.NODE_ENV === "production") return null;

  return (
    <aside
      role="note"
      aria-label="Developer hint"
      className={cn(
        "rounded-owl-card border border-owl-amber/40 bg-owl-amber/10 p-4 shadow-owl-1",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-owl-amber/25 text-owl-amber"
        >
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-bold text-owl-ink">
            <span className="mr-2 rounded-full bg-owl-ink/85 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-owl-cream">
              Dev only
            </span>
            {title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-owl-ink/80">{body}</p>
          {hint && (
            <pre className="mt-3 overflow-x-auto rounded-owl-btn bg-owl-ink/90 px-3 py-2 text-xs leading-relaxed text-owl-cream">
              <code>{hint}</code>
            </pre>
          )}
        </div>
      </div>
    </aside>
  );
}
