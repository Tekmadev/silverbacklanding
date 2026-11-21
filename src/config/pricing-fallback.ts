import type { PromoKey, ServicePricing } from "@/lib/types";

/**
 * Mirror of the `service_pricing` seed rows in `supabase/schema.sql`.
 *
 * Used whenever Supabase env vars are missing or the database is unreachable,
 * so `npm run build` and every page render keep working. Keep this file and
 * the SQL seed identical.
 */
export const PRICING_FALLBACK: ServicePricing[] = [
  {
    slug: "ppf_ceramic_bundle",
    name: "Full Front PPF + Ceramic Winter Shield Bundle",
    category: "protection",
    price_cad: 2499,
    display_price: "From $2,499 + HST",
    compare_at_price: "$3,000+",
    badge: "Save $500–$600",
    short_desc:
      "Full front-end rock-chip PPF paired with ceramic paint protection. Our flagship winter shield.",
    sort_order: 10,
    is_active: true,
  },
  {
    slug: "ppf_full_front",
    name: "Full Front End PPF",
    category: "protection",
    price_cad: 1799,
    display_price: "From $1,799 + HST",
    compare_at_price: null,
    badge: null,
    short_desc:
      "Full hood, full fenders, front bumper, mirrors & headlights protected against QEW/403 gravel & road salt.",
    sort_order: 20,
    is_active: true,
  },
  {
    slug: "window_tint",
    name: "All-Around Window Tinting",
    category: "protection",
    price_cad: 349,
    display_price: "$349 + HST",
    compare_at_price: null,
    badge: "Popular Add-On",
    short_desc:
      "Full side & rear windows (excluding windshield), standalone or bundled with PPF/Ceramic.",
    sort_order: 30,
    is_active: true,
  },
  {
    slug: "ceramic_5yr",
    name: "5-Year Ceramic Coating",
    category: "protection",
    price_cad: 1099,
    display_price: "$1,099 + HST",
    compare_at_price: null,
    badge: null,
    short_desc:
      "Hydrophobic weather & UV shield. Decontamination, clay bar & panel prep included.",
    sort_order: 40,
    is_active: true,
  },
  {
    slug: "ceramic_lifetime",
    name: "Lifetime (12-Yr) Ceramic Coating",
    category: "protection",
    price_cad: 1299,
    display_price: "$1,299 + HST",
    compare_at_price: null,
    badge: null,
    short_desc:
      "Our thickest 12-year rated professional shield. Multi-stage correction recommended prior.",
    sort_order: 50,
    is_active: true,
  },
  {
    slug: "paint_correction",
    name: "Paint Correction",
    category: "protection",
    price_cad: 400,
    display_price: "$400 / step",
    compare_at_price: null,
    badge: null,
    short_desc:
      "Paint thickness gauge measured, wet sanding, heavy cut & refining polish.",
    sort_order: 60,
    is_active: true,
  },
  {
    slug: "interior_deep_clean",
    name: "Interior Deep Clean",
    category: "interior",
    price_cad: 279,
    display_price: "$279 + HST",
    compare_at_price: null,
    badge: "Winter Favorite",
    short_desc:
      "Steam shampoo, hot-water stain & salt extraction, leather & fabric care.",
    sort_order: 70,
    is_active: true,
  },
  {
    slug: "silver_deep_clean",
    name: "Silver Deep Clean",
    category: "packages",
    price_cad: 399,
    display_price: "$399 + HST",
    compare_at_price: null,
    badge: "Most Complete",
    short_desc:
      "Full interior reset, trunk, deep vents & crevices, stain removal, door jambs/sills + 2-bucket hand wash (sedan/crossover).",
    sort_order: 80,
    is_active: true,
  },
  {
    slug: "gold_correct_protect",
    name: "Gold Correct & Protect",
    category: "packages",
    price_cad: 499,
    display_price: "$499 + HST",
    compare_at_price: null,
    badge: null,
    short_desc:
      "Everything in Silver + 1-step machine polish for swirls/haze, ceramic seal & engine bay detail.",
    sort_order: 90,
    is_active: true,
  },
  {
    slug: "bronze_maintenance",
    name: "Bronze Maintenance",
    category: "packages",
    price_cad: 150,
    display_price: "$150 + HST",
    compare_at_price: null,
    badge: null,
    short_desc:
      "Interior vacuum, dash/console wipe, 2-bucket hand wash, wheels/tires & glass.",
    sort_order: 100,
    is_active: true,
  },
  {
    slug: "ozone_treatment",
    name: "Ozone Odour Treatment",
    category: "addons",
    price_cad: 150,
    display_price: "$150 + HST",
    compare_at_price: null,
    badge: null,
    short_desc: "Complete interior odour & bacteria elimination.",
    sort_order: 110,
    is_active: true,
  },
  {
    slug: "clay_bar",
    name: "Clay Bar Decontamination",
    category: "addons",
    price_cad: 150,
    display_price: "$150 + HST",
    compare_at_price: null,
    badge: null,
    short_desc:
      "2-bucket hand wash, deep rim/wheel-well clean, iron remover & clay bar.",
    sort_order: 120,
    is_active: true,
  },
  {
    slug: "interior_refresh",
    name: "Interior Refresh",
    category: "addons",
    price_cad: 99,
    display_price: "$99 + HST",
    compare_at_price: null,
    badge: null,
    short_desc: "Vacuum, dash/console/door wipe down & interior glass.",
    sort_order: 130,
    is_active: true,
  },
];

export const PROMO_FALLBACK: PromoKey = "black_friday";
