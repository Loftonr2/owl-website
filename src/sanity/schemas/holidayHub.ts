import { defineField, defineType } from "sanity";
import { culturalThemeOptions } from "./objects/taxonomies";

export const holidayHub = defineType({
  name: "holidayHub",
  title: "Holiday Hub",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "celebration",
      title: "Which celebration",
      type: "string",
      options: { list: culturalThemeOptions },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro for parents and teachers",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "dateRange",
      title: "Annual date range",
      type: "object",
      fields: [
        defineField({ name: "start", type: "date" }),
        defineField({ name: "end", type: "date" }),
        defineField({
          name: "isVariable",
          title: "Date varies each year (e.g. Ramadan)",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: "featuredVideos",
      type: "array",
      of: [{ type: "reference", to: [{ type: "video" }] }],
    }),
    defineField({
      name: "featuredSongs",
      type: "array",
      of: [{ type: "reference", to: [{ type: "song" }] }],
    }),
    defineField({
      name: "featuredPrintables",
      type: "array",
      of: [{ type: "reference", to: [{ type: "printable" }] }],
    }),
    defineField({
      name: "featuredProducts",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "relatedArticles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "blogArticle" }] }],
    }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "celebration", media: "heroImage" },
  },
});
