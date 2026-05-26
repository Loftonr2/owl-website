import { defineField, defineType } from "sanity";

/**
 * Six SEO pillar hubs per BLOG_NEWSLETTER_SYSTEM.md §1.
 * Seeded as documents so authors can attach articles via reference + edit
 * the hub landing copy.
 */
export const blogCategory = defineType({
  name: "blogCategory",
  title: "Blog Category (Pillar Hub)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
});
