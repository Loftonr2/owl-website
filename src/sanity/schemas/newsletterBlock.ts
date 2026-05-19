import { defineField, defineType } from "sanity";

/**
 * Reusable newsletter signup block. Editors compose these into product pages,
 * blog articles, holiday hubs, and homepage modules. Lets us A/B test offers
 * without touching code.
 */
export const newsletterBlock = defineType({
  name: "newsletterBlock",
  title: "Newsletter Block",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Internal title (admin only)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "offerType",
      type: "string",
      options: {
        list: [
          { title: "Welcome printable pack", value: "welcome-pack" },
          { title: "Free printable of the week", value: "weekly-printable" },
          { title: "Discount on first order", value: "discount" },
          { title: "Educator portal early access", value: "educator-portal" },
          { title: "App waitlist", value: "app-waitlist" },
          { title: "Seasonal bundle", value: "seasonal" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headline",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "copy",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "ctaText",
      type: "string",
      initialValue: "Get the free printable",
    }),
    defineField({
      name: "listDestination",
      title: "Subscribe to (Beehiiv segment)",
      type: "string",
      options: {
        list: [
          { title: "A1 — Parents of Toddlers 1–3", value: "A1" },
          { title: "A2 — Parents of Preschoolers 3–5", value: "A2" },
          { title: "A3 — Parents of Elementary 5–8", value: "A3" },
          { title: "A4 — Parents of Older Kids 8–14", value: "A4" },
          { title: "A5 — Educators", value: "A5" },
          { title: "A6 — Multicultural Parents", value: "A6" },
          { title: "A7 — Gift Buyers", value: "A7" },
          { title: "General (no segment)", value: "" },
        ],
      },
    }),
    defineField({
      name: "featuredImage",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: { select: { title: "title", subtitle: "offerType", media: "featuredImage" } },
});
