import type { ServiceCategory, ServicePricing } from "./types";

const CATEGORIES: readonly ServiceCategory[] = ["protection", "interior", "packages", "addons"];

/** Coerces a raw DB row into a safe `ServicePricing`, or null if unusable. */
export function normalizeRow(raw: unknown): ServicePricing | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.slug !== "string" || typeof r.display_price !== "string" || !r.display_price.trim()) {
    return null;
  }
  const price = r.price_cad === null || r.price_cad === undefined ? null : Number(r.price_cad);
  const category = CATEGORIES.includes(r.category as ServiceCategory)
    ? (r.category as ServiceCategory)
    : "addons";
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
  return {
    slug: r.slug,
    name: typeof r.name === "string" ? r.name : r.slug,
    category,
    price_cad: price !== null && Number.isFinite(price) ? price : null,
    display_price: r.display_price,
    compare_at_price: str(r.compare_at_price),
    badge: str(r.badge),
    short_desc: typeof r.short_desc === "string" ? r.short_desc : "",
    sort_order: Number.isFinite(Number(r.sort_order)) ? Number(r.sort_order) : 999,
    is_active: r.is_active !== false,
  };
}

export function findService(services: ServicePricing[], slug: string): ServicePricing | undefined {
  return services.find((s) => s.slug === slug);
}

/** Active services matching the given slugs, in the order the slugs were given. */
export function pickServices(services: ServicePricing[], slugs: readonly string[]): ServicePricing[] {
  return slugs
    .map((slug) => findService(services, slug))
    .filter((s): s is ServicePricing => Boolean(s?.is_active));
}

export function formatCad(value: number): string {
  return `$${value.toLocaleString("en-CA", { maximumFractionDigits: 0 })}`;
}

/** Lowest active numeric price among the given slugs (used for "From $X" copy). */
export function minPrice(services: ServicePricing[], slugs: readonly string[]): number | null {
  const prices = pickServices(services, slugs)
    .map((s) => s.price_cad)
    .filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}
