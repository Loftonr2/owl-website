import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

/**
 * Sanity client.
 * Source of truth: ../../OWL-Obsidian-Brain/03_Website_Build/WEBSITE_REQUIREMENTS.md § Content Model
 * Stack reference:  ../../OWL-Obsidian-Brain/11_Tech_Requirements/TECH_STACK.md
 *
 * Two clients are exported:
 *  - `sanity`        → read-only, CDN-backed, public content
 *  - `sanityWriter`  → server-only, mutable, authenticated via API token
 *
 * Never import `sanityWriter` from a Client Component.
 */

export const sanityConfig = {
  projectId: process.env.SANITY_PROJECT_ID ?? "",
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: "2024-10-01",
  useCdn: true,
} as const;

let _readClient: SanityClient | null = null;
let _writeClient: SanityClient | null = null;

export function sanity(): SanityClient {
  if (_readClient) return _readClient;
  _readClient = createClient({
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
    useCdn: sanityConfig.useCdn,
    perspective: "published",
  });
  return _readClient;
}

export function sanityWriter(): SanityClient {
  if (_writeClient) return _writeClient;
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error(
      "sanityWriter() requires SANITY_API_TOKEN. Set it in .env.local."
    );
  }
  _writeClient = createClient({
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
    useCdn: false,
    token,
    perspective: "raw",
  });
  return _writeClient;
}

/** Build a CDN URL for a Sanity image reference. */
export const urlFor = (source: Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0]) =>
  imageUrlBuilder({
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
  }).image(source);
