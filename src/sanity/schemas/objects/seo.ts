import { defineField, defineType } from "sanity";

/**
 * Reusable SEO block — embed on any document.
 *   defineField({ name: "seo", type: "owlSeo", title: "SEO" })
 */
export const seo = defineType({
  name: "owlSeo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "SEO title (≤60 chars)",
      type: "string",
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "description",
      title: "Meta description (≤160 chars)",
      type: "text",
      rows: 3,
      validation: (r) => r.max(160),
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL (override)",
      type: "url",
    }),
    defineField({
      name: "ogImage",
      title: "Social share image (OG)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines (noindex)",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
