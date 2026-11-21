import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { PRICING_FALLBACK, PROMO_FALLBACK } from "@/config/pricing-fallback";
import { getPublicClient } from "./supabase";
import { normalizeRow } from "./pricing-utils";
import { isPromoKey, type PromoKey, type ServicePricing } from "./types";

export const PRICING_CACHE_TAG = "pricing";

export interface SiteData {
  /** Every row, active or not, sorted by `sort_order`. Filter `is_active` before rendering. */
  services: ServicePricing[];
  promo: PromoKey;
  source: "database" | "fallback";
}

/**
 * Live prices + active promo, cached for an hour (ISR) and refreshed instantly
 * when the owner saves (`revalidateTag` + `revalidatePath` in /api/owner/pricing).
 * Never throws: falls back to `pricing-fallback.ts` if Supabase is unset or down.
 */
export async function getSiteData(): Promise<SiteData> {
  "use cache";
  cacheTag(PRICING_CACHE_TAG);

  const client = getPublicClient();
  if (!client) {
    cacheLife("hours");
    return { services: PRICING_FALLBACK, promo: PROMO_FALLBACK, source: "fallback" };
  }

  try {
    const [pricingRes, promoRes] = await Promise.all([
      client.from("service_pricing").select("*").order("sort_order", { ascending: true }),
      client.from("site_settings").select("value").eq("key", "active_promo").maybeSingle(),
    ]);

    const rows = (pricingRes.data ?? [])
      .map(normalizeRow)
      .filter((r): r is ServicePricing => r !== null);

    if (pricingRes.error || rows.length === 0) throw pricingRes.error ?? new Error("No pricing rows");

    const promoValue = promoRes.data?.value;
    cacheLife("hours");
    return {
      services: rows,
      promo: isPromoKey(promoValue) ? promoValue : PROMO_FALLBACK,
      source: "database",
    };
  } catch (error) {
    console.warn("[pricing] Supabase unavailable, using fallback pricing:", (error as Error)?.message);
    // Retry the database again soon rather than pinning fallback prices for an hour.
    cacheLife("minutes");
    return { services: PRICING_FALLBACK, promo: PROMO_FALLBACK, source: "fallback" };
  }
}
