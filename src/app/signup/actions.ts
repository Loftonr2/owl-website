"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/clients/supabase-server";
import { siteConfig } from "@/lib/site-config";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  full_name: z.string().trim().min(1).optional(),
  account_type: z.enum(["customer", "teacher"]).default("customer"),
  school: z.string().trim().optional(),
});

/**
 * Server Action — public self-service signup.
 *
 * Everyone is created as a Customer. If they request educator access, the
 * `requested_teacher` flag rides along in auth metadata; the handle_new_user
 * trigger opens a teacher_application (pending) for an admin to approve.
 */
export async function signUp(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name") || undefined,
    account_type: formData.get("account_type") || "customer",
    school: formData.get("school") || undefined,
  });
  if (!parsed.success) {
    redirect(`/signup?error=invalid`);
  }

  const supabase = await supabaseServer();
  const emailRedirectTo = `${siteConfig.url.replace(/\/$/, "")}/auth/callback?next=/account`;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
      data: {
        full_name: parsed.data.full_name ?? null,
        requested_teacher: parsed.data.account_type === "teacher",
        school: parsed.data.school ?? null,
      },
    },
  });

  if (error) {
    if (error.status === 429) redirect(`/signup?error=rate_limit`);
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/signup?check=1`);
}
