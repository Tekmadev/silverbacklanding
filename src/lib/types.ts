export type ServiceCategory = "protection" | "interior" | "packages" | "addons";

export interface ServicePricing {
  slug: string;
  name: string;
  category: ServiceCategory;
  /** Numeric CAD price used for JSON-LD offers and ad conversion values. */
  price_cad: number | null;
  /** Human-readable price shown on the site, e.g. "From $2,499 + HST". */
  display_price: string;
  /** Optional strikethrough value anchor, e.g. "$3,000+". */
  compare_at_price: string | null;
  badge: string | null;
  short_desc: string;
  sort_order: number;
  is_active: boolean;
}

export const PROMO_KEYS = ["black_friday", "winter", "none"] as const;
export type PromoKey = (typeof PROMO_KEYS)[number];

export function isPromoKey(value: unknown): value is PromoKey {
  return typeof value === "string" && (PROMO_KEYS as readonly string[]).includes(value);
}

export const EVENT_TYPES = [
  "page_view",
  "call_click",
  "whatsapp_direct_click",
  "directions_click",
  "form_submit",
] as const;
export type SiteEventType = (typeof EVENT_TYPES)[number];

/** Attribution captured on landing and stored in sessionStorage. */
export interface Attribution {
  session_id: string;
  gclid: string | null;
  fbclid: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  referrer: string | null;
}
