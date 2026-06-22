"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { supabaseBrowser } from "@/lib/clients/supabase-browser";
import { ROLE_LABEL, roleHome, type AppRole } from "@/lib/auth/role-utils";
import { cn } from "@/lib/cn";
import { AccountMenu } from "./account-menu";

/**
 * Header account control. Reads the Supabase session in the browser so the
 * marketing pages stay statically renderable. Shows a "Log in" button when
 * anonymous, or the role-aware account dropdown when signed in.
 */
type NavState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "auth"; name: string; email: string; role: AppRole };

const loginClasses = cn(
  "inline-flex items-center gap-1.5 rounded-owl-btn border border-owl-cream-deep bg-white px-3 py-1.5 text-sm font-medium text-owl-ink",
  "transition-colors hover:bg-owl-cream hover:text-owl-teal",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-owl-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-owl-cream"
);

export function AccountNav() {
  const [state, setState] = useState<NavState>({ status: "loading" });

  useEffect(() => {
    const supabase = supabaseBrowser();
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setState({ status: "anon" });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("email, role, full_name")
        .eq("id", user.id)
        .single();
      if (!active) return;
      setState({
        status: "auth",
        email: data?.email ?? user.email ?? "",
        role: (data?.role ?? "customer") as AppRole,
        name: data?.full_name ?? data?.email ?? user.email ?? "Account",
      });
    }

    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void load());

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (state.status === "loading") {
    return <div className="h-9 w-16 animate-pulse rounded-owl-btn bg-owl-cream-deep/40" aria-hidden />;
  }

  if (state.status === "anon") {
    return (
      <Link href="/login" className={loginClasses}>
        <User className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Log in</span>
      </Link>
    );
  }

  return (
    <AccountMenu
      name={state.name}
      email={state.email}
      roleLabel={ROLE_LABEL[state.role] ?? state.role}
      home={roleHome(state.role)}
    />
  );
}
