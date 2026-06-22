/**
 * Sanity Studio mount point.
 * Renders at /studio (and any sub-path: /studio/desk, /studio/vision, etc).
 *
 * Marked fully dynamic + client-only — Sanity Studio bundles use React
 * Context at module load and cannot be evaluated during Next's
 * page-data-collection step.
 */
"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
