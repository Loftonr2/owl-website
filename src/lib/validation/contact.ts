import { z } from "zod";

/**
 * Contact form schema. Used by /contact and /api/contact.
 * Mirrors the contact_messages table in supabase/migrations/0001_initial.sql.
 */
export const contactSegment = z.enum([
  "parent",
  "educator",
  "media",
  "licensing",
  "sponsor",
]);

export const contactSubmitSchema = z.object({
  segment: contactSegment,
  name: z.string().min(1, "Please enter your name.").max(120),
  email: z.string().email("Please enter a valid email address."),
  organization: z.string().max(160).optional(),
  message: z.string().min(20, "A few more words please — at least 20 characters.").max(4000),
  /** Honeypot — must be empty */
  hp: z.string().max(0).optional(),
});

export type ContactSubmitInput = z.infer<typeof contactSubmitSchema>;
