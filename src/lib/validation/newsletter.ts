import { z } from "zod";

/**
 * Newsletter subscribe schema. Used by:
 *  - /api/newsletter/subscribe (route handler)
 *  - <NewsletterForm /> on homepage, footer, printable gate, etc. (Phase 4)
 *
 * Segment values map to the 7-segment taxonomy in
 * ../../OWL-Obsidian-Brain/13_Claude_Source_Of_Truth/CLAUDE_READ_FIRST.md §2
 */
export const newsletterSegment = z.enum([
  "A1", // Parents of Toddlers 1–3
  "A2", // Parents of Preschoolers 3–5
  "A3", // Parents of Elementary 5–8
  "A4", // Parents of Older Kids 8–14
  "A5", // Educators / Teachers
  "A6", // Multicultural Parents
  "A7", // Gift Buyers / Caregivers
]);

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  segments: z.array(newsletterSegment).max(7).optional(),
  source: z
    .enum(["homepage", "footer", "printable-gate", "blog", "video", "shop", "other"])
    .default("other"),
  /** Optional UTM passthrough — captured by the form when present in URL */
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  /** Honeypot — should be empty. Bots fill it. */
  hp: z.string().max(0).optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
