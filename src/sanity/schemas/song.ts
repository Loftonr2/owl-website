import { defineField, defineType } from "sanity";
import { ageBandOptions, culturalThemeOptions } from "./objects/taxonomies";

export const song = defineType({
  name: "song",
  title: "Song",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "album", type: "string" }),
    defineField({
      name: "coverArt",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "releaseDate",
      type: "date",
    }),
    defineField({
      name: "isrc",
      title: "ISRC",
      type: "string",
    }),
    defineField({
      name: "platformLinks",
      title: "Streaming platforms",
      type: "object",
      fields: [
        defineField({ name: "spotify", type: "url" }),
        defineField({ name: "appleMusic", type: "url" }),
        defineField({ name: "youtubeMusic", type: "url" }),
        defineField({ name: "amazonMusic", type: "url" }),
        defineField({ name: "tidal", type: "url" }),
      ],
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
    defineField({
      name: "relatedVideo",
      type: "reference",
      to: [{ type: "video" }],
    }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
  preview: { select: { title: "title", subtitle: "album", media: "coverArt" } },
});
