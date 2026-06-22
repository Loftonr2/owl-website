import { defineField, defineType } from "sanity";
import {
  ageBandOptions,
  culturalThemeOptions,
  formatOptions,
  subjectOptions,
} from "./objects/taxonomies";

export const video = defineType({
  name: "video",
  title: "Video",
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
      name: "youtubeId",
      title: "YouTube video ID",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "thumbnail",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      description: "100–150 word summary for SEO + video detail page",
      validation: (r) => r.max(800),
    }),
    defineField({
      name: "learningGoals",
      type: "array",
      of: [{ type: "string" }],
      description: "3–5 bullets for the video detail page",
      validation: (r) => r.max(8),
    }),
    defineField({
      name: "ageRange",
      type: "string",
      options: { list: ageBandOptions },
    }),
    defineField({
      name: "subject",
      type: "array",
      of: [{ type: "string" }],
      options: { list: subjectOptions },
    }),
    defineField({
      name: "theme",
      title: "Cultural theme",
      type: "array",
      of: [{ type: "string" }],
      options: { list: culturalThemeOptions },
    }),
    defineField({
      name: "holiday",
      type: "array",
      of: [{ type: "string" }],
      options: { list: culturalThemeOptions },
    }),
    defineField({
      name: "format",
      type: "string",
      options: { list: formatOptions },
    }),
    defineField({
      name: "duration",
      title: "Duration (ISO 8601, e.g. PT8M)",
      type: "string",
    }),
    defineField({
      name: "relatedPrintable",
      type: "reference",
      to: [{ type: "printable" }],
    }),
    defineField({
      name: "relatedProduct",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({
      name: "relatedPlaylist",
      type: "reference",
      to: [{ type: "playlist" }],
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "seo", type: "owlSeo", title: "SEO" }),
  ],
  preview: {
    select: { title: "title", subtitle: "ageRange", media: "thumbnail" },
  },
});
