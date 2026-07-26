import { Mail, Sparkles, MailCheck } from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: Mail,
    iconBg: "bg-owl-teal",
    iconColor: "text-white",
    title: "Enter your email",
    description: "Add your email address to get started.",
  },
  {
    number: 2,
    icon: Sparkles,
    iconBg: "bg-owl-amber",
    iconColor: "text-owl-ink",
    title: "Choose what matters",
    description:
      "Select your child's age range and your interests so we can personalize your newsletter.",
  },
  {
    number: 3,
    icon: MailCheck,
    iconBg: "bg-owl-teal-deep",
    iconColor: "text-white",
    title: "Check your inbox every Sunday",
    description:
      "Enjoy weekly tips, updates, inspiration, and exclusive store perks!",
  },
] as const;

/**
 * NewsletterSignupSteps
 * ─────────────────────
 * "Sign Up in 3 Easy Steps" — three illustrated cards on a cream-deep stripe.
 */
export function NewsletterSignupSteps() {
  return (
    <section
      className="bg-owl-cream-deep py-16 md:py-20"
      aria-labelledby="nl-steps-heading"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">

        {/* Title */}
        <div className="mb-12 text-center">
          <h2
            id="nl-steps-heading"
            className="font-display text-3xl font-bold text-owl-ink sm:text-4xl"
          >
            Sign Up in{" "}
            <span className="text-owl-teal">3 Easy Steps</span>
          </h2>
        </div>

        {/* Steps row */}
        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3" role="list">
          {STEPS.map((step, i) => (
            <li key={step.number} className="relative">
              {/* Dashed connector — only between cards, desktop only */}
              {i < STEPS.length - 1 && (
                <div
                  className="absolute left-[calc(50%+4rem)] right-0 top-10 hidden h-px border-t-2 border-dashed border-owl-teal/25 md:block"
                  aria-hidden
                />
              )}

              <div className="relative flex flex-col items-center rounded-2xl bg-white px-8 pb-8 pt-10 text-center shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-owl-2">
                {/* Step number badge */}
                <div
                  className="absolute -top-4 flex h-8 w-8 items-center justify-center rounded-full bg-owl-teal font-display text-sm font-bold text-white shadow-owl-1"
                  aria-label={`Step ${step.number}`}
                >
                  {step.number}
                </div>

                {/* Icon circle */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${step.iconBg} shadow-owl-1`}
                >
                  <step.icon className={`h-8 w-8 ${step.iconColor}`} aria-hidden />
                </div>

                <h3 className="mt-5 font-display text-lg font-bold text-owl-ink">
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-owl-mist">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
