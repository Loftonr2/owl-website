import Link from "next/link";
import { Smartphone, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";

/**
 * App waitlist teaser — slim section pointing at /app.
 */
export function AppWaitlistTeaser() {
  return (
    <Section width="wide" pad="sm" bg="cream">
      <Link
        href="/app"
        className="flex items-center justify-between gap-4 rounded-owl-hero bg-owl-ink p-6 text-white shadow-sm transition-all hover:bg-owl-ink/90 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-owl-amber text-owl-ink">
            <Smartphone className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-owl-amber-soft">
              Coming soon
            </p>
            <p className="mt-1 font-display text-base font-semibold sm:text-lg">
              The OWL app — ad-free, parent-controlled, interactive learning.
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-2 font-display text-sm font-semibold text-owl-amber-soft sm:flex">
          Join the waitlist <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </Section>
  );
}
