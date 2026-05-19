import { defineField, defineType } from "sanity";
import { ageBandOptions } from "./objects/taxonomies";

export const product = defineType({
  name: "product",
  title: "Product",
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
      name: "story",
      title: "Product story (1–2 paragraphs)",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "supportsLearningIn",
      title: "Supports learning in… (bullet list)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "price",
      type: "number",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "currency",
      type: "string",
      initialValue: "USD",
    }),
    defineField({
      name: "images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "ageRange",
      type: "string",
      options: { list: ageBandOptions },
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: [
          { title: "Plush & character", value: "plush" },
          { title: "Apparel", value: "apparel" },
          { title: "Flashcards", value: "flashcards" },
          { title: "Coloring books", value: "coloring-books" },
          { title: "Activity books", value: "activity-books" },
          { title: "Sticker sheets", value: "stickers" },
          { title: "Digital downloads", value: "digital" },
          { title: "Curriculum bundle", value: "curriculum" },
          { title: "Gift set", value: "gift-set" },
          { title: "Educator license", value: "educator-license" },
        ],
      },
    }),
    defineField({
      name: "channel",
      title: "Fulfillment channel",
      type: "string",
      options: {
        list: [
          { title: "Shopify (physical)", value: "shopify" },
          { title: "Printify (POD)", value: "printify" },
          { title: "Gumroad (digital)", value: "gumroad" },
          { title: "Etsy", value: "etsy" },
          { title: "Amazon KDP", value: "kdp" },
          { title: "Teachers Pay Teachers", value: "tpt" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "shopifyProductId", type: "string" }),
    defineField({ name: "gumroadId", type: "string" }),
    defineField({ name: "printifyId", type: "string" }),
    defineField({
      name: "relatedVideo",
      type: "reference",
      to: [{ type: "video" }],
    }),
    defineField({
      name: "relatedPrintable",
      type: "reference",
      to: [{ type: "printable" }],
    }),
    defineField({
      name: "bundleSuggestions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({ name: "shippingCopy", type: "text", rows: 2 }),
    defineField({
      name: "status",
      type: "string",
      options: { list: ["draft", "active", "archived"] },
      initialValue: "draft",
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "price", media: "images.0" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `$${subtitle}` : "—",
      media,
    }),
  },
});
