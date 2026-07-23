import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Link2,
  ShoppingBag,
  Download,
  BarChart3,
  CalendarDays,
  Workflow,
  Settings,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/role-utils";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Minimum role required to see + open this section. */
  minRole: AppRole;
  description: string;
};

/**
 * The Command Center sections:
 * Dashboard · CRM · Newsletter · Blog · Editorial · Topics · Affiliate Center
 * · Sales · Downloads · Analytics · Calendar · Automations · Settings
 */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard",        href: "/admin",              icon: LayoutDashboard, minRole: "support", description: "KPIs + this-week activity" },
  { label: "CRM",              href: "/admin/crm",          icon: Users,           minRole: "support", description: "Contacts, tags, segments, engagement" },
  { label: "Newsletter",       href: "/admin/newsletter",   icon: Mail,            minRole: "editor",  description: "Campaigns, weekly assets, tracking" },
  { label: "Content",          href: "/admin/content",      icon: FileText,        minRole: "editor",  description: "Articles + blog posts: draft, schedule, publish" },
  { label: "Editorial",        href: "/admin/editorial",    icon: CalendarDays,    minRole: "editor",  description: "30-day publishing calendar + alert queue" },
  { label: "Topics",           href: "/admin/topics",       icon: Lightbulb,       minRole: "editor",  description: "Topic intelligence + SEO recommendations" },
  { label: "Affiliate Center", href: "/admin/affiliate",    icon: Link2,           minRole: "editor",  description: "Partners, products, coupons, revenue" },
  { label: "Sales",            href: "/admin/sales",        icon: ShoppingBag,     minRole: "support", description: "Store + affiliate + combined revenue" },
  { label: "Downloads",        href: "/admin/downloads",    icon: Download,        minRole: "support", description: "Curriculum + lead-magnet downloads" },
  { label: "Analytics",        href: "/admin/analytics",    icon: BarChart3,       minRole: "support", description: "Traffic, subscribers, top content" },
  { label: "Automations",      href: "/admin/automations",  icon: Workflow,        minRole: "admin",   description: "Scheduled jobs + run history" },
  { label: "Settings",         href: "/admin/settings",     icon: Settings,        minRole: "admin",   description: "Roles, integrations, feature flags" },
];
