"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/clients/supabase-server";

const schema = z.object({ password: z.string().min(8, "Password must be at least 8 characters.") });

/**
 * Server Action — set a new password. Requires the recovery session created
 * when the user arrives via the reset link (/auth/callback exchanges the code).
 */
export async function updatePassword(formData: FormData) {
  const parsed = schema.safeParse({ password: formData.get("password") });
  if (!parsed.success) redirect(`/reset-password?error=weak`);

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?error=${encodeURIComponent("Reset link expired. Try again.")}`);

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);

  redirect(`/account`);
}
