"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { siteConfig } from "@/lib/site-config";

const schema = z.object({ email: z.string().email() });

/**
 * Server Action — send a password-reset email. The link routes through
 * /auth/callback (which establishes a recovery session) to /reset-password.
 * Always reports success to avoid leaking which emails exist.
 */
export async function requestPasswordReset(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) redirect(`/forgot-password?error=invalid`);

  const supabase = await supabaseServer();
  const redirectTo = `${siteConfig.url.replace(/\/$/, "")}/auth/callback?next=/reset-password`;

  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });

  redirect(`/forgot-password?sent=1`);
}
