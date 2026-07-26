import {
  Heart,
  Lightbulb,
  ShieldPlus,
  Newspaper,
  PenLine,
  ShoppingBag,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Heart,
    iconBg: "bg-owl-teal",
    iconColor: "text-white",
    title: "A Note from OWL",
    description:
      "A warm welcome and encouragement from OWL to start your week with heart.",
  },
  {
    icon: Lightbulb,
    iconBg: "bg-owl-amber",
    iconColor: "text-owl-ink",
    title: "Parenting Tip of the Week",
    description:
      "Practical, research-backed tips to help you build confidence and connection.",
  },
  {
    icon: ShieldPlus,
    iconBg: "bg-owl-rose",
    iconColor: "text-white",
    title: "Children's Health Updates",
    description:
      "Important health news and food recall alerts to keep your family safe and informed.",
  },
  {
    icon: Newspaper,
    iconBg: "bg-[#4A90D9]",
    iconColor: "text-white",
    title: "Latest News",
    description:
      "Helpful stories and resources for today's parents and caregivers.",
  },
  {
    icon: PenLine,
    iconBg: "bg-[#8B5CF6]",
    iconColor: "text-white",
    title: "Latest from the Blog",
    description:
      "Expert advice, activities, and ideas for happy, healthy families.",
  },
  {
    icon: ShoppingBag,
    iconBg: "bg-owl-teal-deep",
    iconColor: "text-white",
    title: "Weekly Store Perk",
    description:
      "Exclusive discounts and special offers to save on your favorite OWL items.",
  },
] as const;

/**
 * NewsletterBenefitsGrid
 * ──────────────────────
 * "What You'll Receive Each Week" — 6 icon+text benefit cards on a soft
 * teal-tinted stripe.
 */
export function NewsletterBenefitsGrid() {
  return (
    <section
      className="bg-[#E8F5F4] py-16 md:py-20"
      aria-labelledby="nl-benefits-heading"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">

        {/* Title */}
        <div className="mb-12 text-center">
          <h2
            id="nl-benefits-heading"
            className="font-display text-3xl font-bold text-owl-ink sm:text-4xl"
          >
            <span className="text-owl-amber" aria-hidden>★ </span>
            What You&apos;ll Receive Each Week
            <span className="text-owl-amber" aria-hidden> ★</span>
          </h2>
        </div>

        {/* Grid */}
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className="group flex items-start gap-4 rounded-2xl bg-white p-6 shadow-owl-1 transition-all duration-300 ease-owl hover:-translate-y-1 hover:shadow-owl-2"
            >
              {/* Icon */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${b.iconBg}`}
              >
                <b.icon className={`h-6 w-6 ${b.iconColor}`} aria-hidden />
              </div>

              {/* Text */}
              <div>
                <h3 className="font-display text-base font-bold text-owl-ink">
                  {b.title}
                </h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-owl-mist">
                  {b.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
