/**
 * GlassPanel — alias for <GlassCard>.
 *
 * The component is the same primitive (capped at 12px blur to avoid the
 * DESIGN_STYLE_GUIDE §12 anti-pattern of glass heavy enough to obscure text).
 * The "Panel" name is preferred in component briefs that don't think of
 * frosted surfaces as cards. Both imports point at the same code:
 *
 *   import { GlassPanel } from "@/components/ui/glass-panel";
 *   import { GlassCard }  from "@/components/ui/glass-card";  // legacy
 *
 * New code should prefer `GlassPanel`. The `GlassCard` name stays exported
 * indefinitely — the marketing components ship with it.
 */
export { GlassCard as GlassPanel } from "./glass-card";
export type { GlassCardProps as GlassPanelProps } from "./glass-card";
