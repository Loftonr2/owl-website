"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/clients/supabase-server";

const profileSchema = z.object({ full_name: z.string().trim().max(120).optional() });

/** Update the signed-in user's display name. */
export async function updateProfile(formData: FormData) {
  const parsed = profileSchema.safeParse({ full_name: formData.get("full_name") || undefined });
  if (!parsed.success) redirect("/portal/settings?error=invalid");

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/settings");

  await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name ?? null })
    .eq("id", user.id);

  revalidatePath("/portal/settings");
  redirect("/portal/settings?saved=1");
}

const educatorSchema = z.object({
  school: z.string().trim().optional(),
  role_title: z.string().trim().optional(),
  message: z.string().trim().max(1000).optional(),
});

/** Request educator access — opens a pending teacher_application for review. */
export async function requestEducatorAccess(formData: FormData) {
  const parsed = educatorSchema.safeParse({
    school: formData.get("school") || undefined,
    role_title: formData.get("role_title") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) redirect("/portal/settings?error=invalid");

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/settings");

  await supabase.from("teacher_applications").insert({
    profile_id: user.id,
    school: parsed.data.school ?? null,
    role_title: parsed.data.role_title ?? null,
    message: parsed.data.message ?? null,
  });

  revalidatePath("/portal/settings");
  redirect("/portal/settings?requested=1");
}
