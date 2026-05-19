import { defineField, defineType } from "sanity";
import { ageBandOptions } from "./objects/taxonomies";

export const educatorResource = defineType({
  name: "educatorResource",
  title: "Educator Resource",
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
      name: "summary",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "audience",
      type: "string",
      options: {
        list: [
          { title: "Classroom teacher", value: "teacher" },
          { title: "Daycare provider", value: "daycare" },
          { title: "Homeschool parent", value: "homeschool" },
          { title: "School administrator", value: "admin" },
          { title: "District buyer", value: "district" },
        ],
      },
    }),
    defineField({
      name: "gradeRange",
      type: "string",
      options: { list: ageBandOptions },
    }),
    defineField({
      name: "standards",
      title: "Standards alignment",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "framework",
              type: "string",
              options: {
                list: [
                  { title: "Head Start ELOF", value: "elof" },
                  { title: "Common Core (ELA)", value: "common-core-ela" },
                  { title: "Common Core (Math)", value: "common-core-math" },
                  { title: "CDC Milestones", value: "cdc" },
                  { title: "State PreK", value: "state-prek" },
                ],
              },
            }),
            defineField({
              name: "indicator",
              type: "string",
              description: "e.g. ELOF P-LIT 1, CCSS.MATH.CONTENT.K.CC.A.1",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "relatedVideo",
      type: "reference",
      to: [{ type: "video" }],
    }),
    defineField({
      name: "downloadPdfPath",
      title: "Download PDF (R2 path)",
      type: "string",
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "seo", type: "owlSeo" }),
  ],
  preview: { select: { title: "title", subtitle: "audience" } },
});
