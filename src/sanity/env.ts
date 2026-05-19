/**
 * Sanity environment constants. Used by both the studio (when embedded) and
 * the read client.
 */
export const apiVersion = "2024-10-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.SANITY_DATASET,
  "Missing env: NEXT_PUBLIC_SANITY_DATASET or SANITY_DATASET (Phase 2)"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID,
  "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_PROJECT_ID (Phase 2)"
);

/**
 * In Phase 1, env vars may be missing. We return an empty string and let the
 * Sanity client fail loudly at first network call, rather than crashing the
 * whole build. Switch to a hard throw when Phase 2 wires Sanity.
 */
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === "") {
    if (process.env.NODE_ENV === "production") {
      // Soft-fail Phase 1 only.
      console.warn(`[sanity/env] ${errorMessage}`);
    }
    return "" as T;
  }
  return v;
}
