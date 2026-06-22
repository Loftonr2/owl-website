import { defineField, defineType } from "sanity";
import { ageBandOptions, culturalThemeOptions } from "./objects/taxonomies";

export const playlist = defineType({
  name: "playlist",
  title: "Playlist",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "songs",
      type: "array",
      of: [{ type: "reference", to: [{ type: "song" }] }],
    }),
    defineField({
      name: "videos",
      type: "array",
      of: [{ type: "reference", to: [{ type: "video" }] }],
    }),
    defineField({
      name: "ageRange",
      type: "string",
      options: { list: ageBandOptions },
    }),
    defineField({
      name: "theme",
      type: "array",
      of: [{ type: "string" }],
      options: { list: culturalThemeOptions },
    }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
  preview: { select: { title: "title", media: "coverImage" } },
});
