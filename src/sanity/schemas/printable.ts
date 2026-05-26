import { defineField, defineType } from "sanity";
import { ageBandOptions, culturalThemeOptions } from "./objects/taxonomies";

export const printable = defineType({
  name: "printable",
  title: "Printable",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "previewImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "learningOutcomes",
      title: "Learning outcomes",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "freeOrPaid",
      type: "string",
      options: { list: ["free", "paid"] },
      initialValue: "free",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "price",
      type: "number",
      hidden: ({ document }) => document?.freeOrPaid !== "paid",
    }),
    defineField({
      name: "ageRange",
      type: "string",
      options: { list: ageBandOptions },
    }),
    defineField({
      name: "skillTags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Alphabet", value: "alphabet" },
          { title: "Counting", value: "counting" },
          { title: "Shapes", value: "shapes" },
          { title: "Feelings (SEL)", value: "feelings" },
          { title: "Cultural", value: "cultural" },
          { title: "K-readiness", value: "k-readiness" },
          { title: "Reading", value: "reading" },
          { title: "Writing", value: "writing" },
          { title: "STEM", value: "stem" },
        ],
      },
    }),
    defineField({
      name: "theme",
      type: "array",
      of: [{ type: "string" }],
      options: { list: culturalThemeOptions },
    }),
    defineField({
      name: "pdfPath",
      title: "PDF storage path (Cloudflare R2 key)",
      type: "string",
      description: "e.g. printables-free/welcome-pack.pdf or printables-paid/xxx.pdf",
    }),
    defineField({
      name: "relatedVideo",
      type: "reference",
      to: [{ type: "video" }],
    }),
    defineField({
      name: "relatedProduct",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "freeOrPaid", media: "previewImage" },
  },
});
