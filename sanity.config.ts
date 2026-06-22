/**
 * OWL Sing Together — Sanity Studio config.
 *
 * The Studio is embedded inside the Next.js app at /studio. Editors use the
 * same domain and SSO as the rest of the OWL admin.
 *
 * Source of truth: ../OWL-Obsidian-Brain/03_Website_Build/WEBSITE_REQUIREMENTS.md § Content Model
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";

export default defineConfig({
  basePath: "/studio",
  name: "owl-sing-together",
  title: "OWL Sing Together — CMS",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
