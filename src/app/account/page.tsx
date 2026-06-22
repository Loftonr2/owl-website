import { redirect } from "next/navigation";
import { getSessionProfile, roleHome } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

/**
 * /account — post-login router. Sends each user to the right home based on
 * role: staff → Command Center, teacher → educator portal, everyone else →
 * customer portal.
 */
export default async function AccountRouter() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/account");
  redirect(roleHome(profile.role));
}
