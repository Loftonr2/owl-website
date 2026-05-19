/**
 * SectionIntro — alias for <SectionHeader>.
 *
 * Section-level header block: eyebrow caps, h2 title, optional subtitle.
 * The "Intro" name matches the brief's vocabulary and is clearer in code
 * review where "SectionHeader" can be confused with `<header>` chrome.
 *
 *   import { SectionIntro } from "@/components/ui/section-intro";
 *   import { Section }      from "@/components/ui/section";  // unchanged
 *
 * New code should prefer `SectionIntro`. The original `SectionHeader` named
 * export stays available — it's referenced by many existing call sites.
 */
export { SectionHeader as SectionIntro, Section } from "./section";
