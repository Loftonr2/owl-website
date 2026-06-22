import { defineField, defineType } from "sanity";

export const galleryItem = defineType({
  name: "galleryItem",
  title: "Gallery Item",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "collection",
      type: "string",
      options: {
        list: [
          { title: "Character art", value: "character" },
          { title: "Seasonal promo", value: "seasonal" },
          { title: "Video stills", value: "stills" },
          { title: "Printable previews", value: "previews" },
          { title: "Mascot", value: "mascot" },
          { title: "Behind-the-scenes", value: "bts" },
          { title: "Press kit", value: "press" },
        ],
      },
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "relatedContent",
      type: "array",
      of: [
        { type: "reference", to: [{ type: "video" }] },
        { type: "reference", to: [{ type: "playlist" }] },
        { type: "reference", to: [{ type: "product" }] },
      ],
    }),
  ],
  preview: { select: { title: "title", subtitle: "collection", media: "image" } },
});
