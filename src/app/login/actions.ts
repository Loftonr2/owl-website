"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { siteConfig } from "@/lib/site-config";

const schema = z.object({
  email: z.string().email(),
  next: z.string().startsWith("/").default("/admin"),
});

/**
 * Server Action — POSTed by the /login form.
 * Sends a Supabase magic-link with our domain's callback.
 */
export async function signInWithMagicLink(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? "/admin",
  });
  if (!parsed.success) {
    redirect(`/login?error=invalid`);
  }

  const supabase = await supabaseServer();
  const redirectTo = `${siteConfig.url.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(parsed.data.next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: false, // OWL is invite-only
    },
  });

  if (error) {
    if (error.status === 429) redirect(`/login?error=rate_limit`);
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=1&next=${encodeURIComponent(parsed.data.next)}`);
}
