"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { siteConfig } from "@/lib/site-config";

const schema = z.object({
  email: z.string().email(),
  next: z.string().startsWith("/").default("/account"),
});

const passwordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  next: z.string().startsWith("/").default("/account"),
});

/**
 * Server Action — email + password sign-in (primary admin auth method).
 * OWL admin accounts are provisioned by an owner/admin; signup is disabled.
 */
export async function signInWithPassword(formData: FormData) {
  const parsed = passwordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? "/admin",
  });
  if (!parsed.success) {
    redirect(`/login?error=invalid`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.status === 429) redirect(`/login?error=rate_limit`);
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
  }

  redirect(parsed.data.next);
}

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
