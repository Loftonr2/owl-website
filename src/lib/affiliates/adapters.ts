import "server-only";
import { PARTNERS, PARTNERS_BY_SLUG, type PartnerConfig } from "./partners";

/**
 * Affiliate integration adapter pattern.
 *
 * Every affiliate network/merchant has a config (see partners.ts) and a
 * config-driven adapter that knows its credential requirements, tracking-link
 * format, and how to fetch coupons + performance. Until a program's real API
 * client is implemented, fetch methods return [] and `hasCredentials()` reports
 * whether keys exist — so the cron jobs run cleanly and simply skip programs
 * that aren't configured yet. Unknown slugs fall back to a bare Placeholder.
 */

export type CouponDraft = {
  code: string;
  title?: string | null;
  description?: string | null;
  discount_type?: "percent" | "fixed" | "bogo" | "free_shipping" | "other" | null;
  discount_value?: number | null;
  affiliate_url?: string | null;
  landing_url?: string | null;
  starts_at?: string | null;
  expires_at?: string | null;
};

export type PerformanceDraft = {
  external_order_id?: string | null;
  clicks?: number;
  conversions?: number;
  sale_amount_cents?: number;
  commission_cents?: number;
  currency?: string;
  status?: "pending" | "confirmed" | "paid" | "reversed";
  period_start?: string | null;
  period_end?: string | null;
  raw?: Record<string, unknown>;
};

export type AdapterCredential = {
  secret_ref: string | null;
  secret_value: string | null;
  meta: Record<string, unknown>;
};

export interface AffiliateAdapter {
  readonly slug: string;
  readonly name: string;
  readonly network: string;
  /** Env-var names this program needs (documentation + readiness checks). */
  readonly credentialEnvVars: string[];
  /** True when usable credentials exist (env vars OR an inline DB secret). */
  hasCredentials(): boolean;
  /** Apply the program's tracking-link template to a destination URL. */
  buildTrackingLink(targetUrl: string): string;
  fetchCoupons(): Promise<CouponDraft[]>;
  fetchPerformance(periodStart: string, periodEnd: string): Promise<PerformanceDraft[]>;
}

function hasUsableCredentials(config: PartnerConfig | null, creds: AdapterCredential[]): boolean {
  const envOk =
    Boolean(config) &&
    config!.credentialEnvVars.length > 0 &&
    config!.credentialEnvVars.every((v) => Boolean(process.env[v]));
  const inlineOk = creds.some((c) =>
    Boolean(c.secret_ref ? process.env[c.secret_ref] : c.secret_value)
  );
  return envOk || inlineOk;
}

function applyTemplate(template: string, targetUrl: string): string {
  return template
    .replace("{url}", targetUrl)
    .replace(/\{([A-Z0-9_]+)\}/g, (_, key: string) => process.env[key] ?? "");
}

/**
 * Config-driven adapter. Real API logic per program is added by overriding
 * fetchCoupons / fetchPerformance (subclass or extend the registry); the base
 * behavior is a safe, credential-gated no-op.
 */
export class PartnerAdapter implements AffiliateAdapter {
  readonly slug: string;
  readonly name: string;
  readonly network: string;
  readonly credentialEnvVars: string[];

  constructor(
    protected readonly config: PartnerConfig,
    protected readonly creds: AdapterCredential[]
  ) {
    this.slug = config.slug;
    this.name = config.name;
    this.network = config.network;
    this.credentialEnvVars = config.credentialEnvVars;
  }

  hasCredentials(): boolean {
    return hasUsableCredentials(this.config, this.creds);
  }

  buildTrackingLink(targetUrl: string): string {
    return applyTemplate(this.config.trackingLinkFormat, targetUrl);
  }

  async fetchCoupons(): Promise<CouponDraft[]> {
    if (!this.hasCredentials()) return [];
    // TODO: call the program's coupon feed. Placeholder until live.
    return [];
  }

  async fetchPerformance(): Promise<PerformanceDraft[]> {
    if (!this.hasCredentials()) return [];
    // TODO: call the program's performance/commission API. Placeholder until live.
    return [];
  }
}

/** Fallback for slugs that have no partner config yet. */
class PlaceholderAdapter implements AffiliateAdapter {
  readonly name: string;
  readonly network = "unconfigured";
  readonly credentialEnvVars: string[] = [];

  constructor(
    readonly slug: string,
    private readonly creds: AdapterCredential[]
  ) {
    this.name = slug;
  }

  hasCredentials(): boolean {
    return hasUsableCredentials(null, this.creds);
  }
  buildTrackingLink(targetUrl: string): string {
    return targetUrl;
  }
  async fetchCoupons(): Promise<CouponDraft[]> {
    return [];
  }
  async fetchPerformance(): Promise<PerformanceDraft[]> {
    return [];
  }
}

/**
 * Registry of adapter factories by network slug, built from PARTNERS. To wire a
 * live integration, register a subclass here, e.g.:
 *   REGISTRY["shareasale"] = (creds) => new ShareASaleAdapter(PARTNERS_BY_SLUG["shareasale"], creds);
 */
const REGISTRY: Record<string, (creds: AdapterCredential[]) => AffiliateAdapter> =
  Object.fromEntries(
    PARTNERS.map((p) => [p.slug, (creds: AdapterCredential[]) => new PartnerAdapter(p, creds)])
  );

export function getAffiliateAdapter(slug: string, creds: AdapterCredential[]): AffiliateAdapter {
  const factory = REGISTRY[slug];
  if (factory) return factory(creds);
  const config = PARTNERS_BY_SLUG[slug];
  return config ? new PartnerAdapter(config, creds) : new PlaceholderAdapter(slug, creds);
}

/** Adapters for every configured partner (used by the admin readiness view). */
export function listPartnerAdapters(): AffiliateAdapter[] {
  return PARTNERS.map((p) => new PartnerAdapter(p, []));
}
