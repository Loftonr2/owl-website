import { defineField, defineType } from "sanity";

export const blogArticle = defineType({
  name: "blogArticle",
  title: "Blog Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "blogCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary (≈100 words)",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(600),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Body (800–1,200 words)",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
        {
          type: "object",
          name: "videoEmbed",
          title: "Video embed",
          fields: [
            { name: "video", type: "reference", to: [{ type: "video" }] },
          ],
        },
        {
          type: "object",
          name: "printableCta",
          title: "Printable CTA block",
          fields: [
            { name: "printable", type: "reference", to: [{ type: "printable" }] },
            { name: "headline", type: "string" },
          ],
        },
        {
          type: "object",
          name: "productCta",
          title: "Product / Bundle CTA",
          fields: [
            { name: "product", type: "reference", to: [{ type: "product" }] },
            { name: "headline", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "relatedContent",
      title: "Related content (3–5 items, mandatory for internal linking)",
      type: "array",
      of: [
        { type: "reference", to: [{ type: "video" }] },
        { type: "reference", to: [{ type: "printable" }] },
        { type: "reference", to: [{ type: "product" }] },
        { type: "reference", to: [{ type: "holidayHub" }] },
        { type: "reference", to: [{ type: "blogArticle" }] },
      ],
      validation: (r) => r.min(3).max(8),
    }),
    defineField({
      name: "author",
      type: "string",
      initialValue: "Larissa",
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({
      name: "status",
      type: "string",
      options: { list: ["draft", "scheduled", "published", "archived"] },
      initialValue: "draft",
    }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "coverImage" },
  },
});
