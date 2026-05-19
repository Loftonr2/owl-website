/**
 * Hand-authored shared types. Phase 2 will generate Sanity types from schemas
 * and reference them here.
 */

export type AgeBand = "1-3" | "3-5" | "5-8" | "8-11" | "11-14";

export type CulturalTheme =
  | "black-history-month"
  | "hispanic-heritage"
  | "diwali"
  | "hanukkah"
  | "kwanzaa"
  | "ramadan-eid"
  | "lunar-new-year"
  | "juneteenth"
  | "holi"
  | "native-american-heritage"
  | "global-christmas";

export type NewsletterSegment = "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7";

export type LicenseTier = "individual" | "site" | "district";

export type MembershipTier = "friend" | "family" | "champion";
