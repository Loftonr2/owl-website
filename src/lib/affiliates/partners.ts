import "server-only";

/**
 * Affiliate partner configuration.
 *
 * One entry per program OWL promotes. Each declares the env-var NAMES its API
 * needs (never the values), the network it runs on, and the tracking-link
 * template. The slugs match the `affiliate_networks.slug` rows seeded in
 * migration 0005, so the cron jobs resolve an adapter per network by slug.
 *
 * Tracking-link templates use `{url}` for the destination plus `{ENV_VAR}`
 * tokens that are substituted from process.env at runtime. These are sensible
 * placeholders — refine them when each program's real deep-link format is known.
 */
export type PartnerConfig = {
  slug: string;
  name: string;
  /** Network/platform the program runs on (Amazon, ShareASale, CJ, Impact, direct…). */
  network: string;
  /** Required env-var NAMES (values live in Vercel / .env.local, never here). */
  credentialEnvVars: string[];
  /** Deep-link template: `{url}` + `{ENV_VAR}` tokens. */
  trackingLinkFormat: string;
  notes?: string;
};

export const PARTNERS: PartnerConfig[] = [
  // ── Networks (own API for coupons + performance) ──────────────────────────
  {
    slug: "amazon-associates",
    name: "Amazon Associates",
    network: "Amazon Associates (PA-API 5.0)",
    credentialEnvVars: [
      "AMAZON_ASSOCIATES_ACCESS_KEY",
      "AMAZON_ASSOCIATES_SECRET_KEY",
      "AMAZON_ASSOCIATES_PARTNER_TAG",
    ],
    trackingLinkFormat: "{url}?tag={AMAZON_ASSOCIATES_PARTNER_TAG}",
    notes: "Amazon does not expose a coupon feed; performance via PA-API / reports.",
  },
  {
    slug: "shareasale",
    name: "ShareASale",
    network: "ShareASale (Awin) API",
    credentialEnvVars: ["SHAREASALE_API_TOKEN", "SHAREASALE_API_SECRET", "SHAREASALE_AFFILIATE_ID"],
    trackingLinkFormat: "https://www.shareasale.com/r.cfm?u={SHAREASALE_AFFILIATE_ID}&urllink={url}",
    notes: "Coupon + activity feeds available via the ShareASale API.",
  },
  {
    slug: "cj-affiliate",
    name: "CJ Affiliate",
    network: "CJ (Commission Junction) API",
    credentialEnvVars: ["CJ_API_KEY", "CJ_WEBSITE_ID", "CJ_COMPANY_ID"],
    trackingLinkFormat: "{url}?cjevent={CJ_WEBSITE_ID}",
    notes: "Link + commission detail GraphQL APIs.",
  },
  {
    slug: "rakuten",
    name: "Rakuten Advertising",
    network: "Rakuten Advertising API",
    credentialEnvVars: ["RAKUTEN_CLIENT_ID", "RAKUTEN_CLIENT_SECRET", "RAKUTEN_SITE_ID"],
    trackingLinkFormat: "https://click.linksynergy.com/deeplink?id={RAKUTEN_SITE_ID}&murl={url}",
    notes: "OAuth2 token then Coupons + Events APIs.",
  },

  // ── Merchant programs (run via a network; placeholder until confirmed) ─────
  {
    slug: "bookshop",
    name: "Bookshop.org",
    network: "Bookshop.org affiliate",
    credentialEnvVars: ["BOOKSHOP_AFFILIATE_ID"],
    trackingLinkFormat: "https://bookshop.org/a/{BOOKSHOP_AFFILIATE_ID}/{url}",
  },
  {
    slug: "lovevery",
    name: "Lovevery",
    network: "Impact / ShareASale",
    credentialEnvVars: ["LOVEVERY_AFFILIATE_ID"],
    trackingLinkFormat: "{url}?utm_source=owl&irclickid={LOVEVERY_AFFILIATE_ID}",
  },
  {
    slug: "learning-resources",
    name: "Learning Resources",
    network: "CJ / direct",
    credentialEnvVars: ["LEARNING_RESOURCES_AFFILIATE_ID"],
    trackingLinkFormat: "{url}?aff={LEARNING_RESOURCES_AFFILIATE_ID}",
  },
  {
    slug: "lakeshore-learning",
    name: "Lakeshore Learning",
    network: "CJ / direct",
    credentialEnvVars: ["LAKESHORE_AFFILIATE_ID"],
    trackingLinkFormat: "{url}?aff={LAKESHORE_AFFILIATE_ID}",
  },
  {
    slug: "kiwico",
    name: "KiwiCo",
    network: "Impact / CJ",
    credentialEnvVars: ["KIWICO_AFFILIATE_ID"],
    trackingLinkFormat: "{url}?utm_source=owl&aff={KIWICO_AFFILIATE_ID}",
  },
  {
    slug: "little-passports",
    name: "Little Passports",
    network: "Impact / ShareASale",
    credentialEnvVars: ["LITTLE_PASSPORTS_AFFILIATE_ID"],
    trackingLinkFormat: "{url}?aff={LITTLE_PASSPORTS_AFFILIATE_ID}",
  },
  {
    slug: "green-kid-crafts",
    name: "Green Kid Crafts",
    network: "ShareASale / direct",
    credentialEnvVars: ["GREEN_KID_CRAFTS_AFFILIATE_ID"],
    trackingLinkFormat: "{url}?aff={GREEN_KID_CRAFTS_AFFILIATE_ID}",
  },
  {
    slug: "highlights",
    name: "Highlights",
    network: "CJ / direct",
    credentialEnvVars: ["HIGHLIGHTS_AFFILIATE_ID"],
    trackingLinkFormat: "{url}?aff={HIGHLIGHTS_AFFILIATE_ID}",
  },
];

export const PARTNERS_BY_SLUG: Record<string, PartnerConfig> = Object.fromEntries(
  PARTNERS.map((p) => [p.slug, p])
);
