/** Pseudo-service for fleet / B2B enquiries (no fixed price). */
export const FLEET_SLUG = "fleet_b2b";

export interface QuoteChipConfig {
  slug: string;
  label: string;
  /** Show "+" after the price (sizing/starting-from offers). */
  plus?: boolean;
}

/** Step 1 chips of the 3-tap quote widget, in display order. Prices come live from the DB. */
export const QUOTE_CHIPS: QuoteChipConfig[] = [
  { slug: "ppf_ceramic_bundle", label: "PPF + Ceramic", plus: true },
  { slug: "ppf_full_front", label: "Full Front PPF", plus: true },
  { slug: "window_tint", label: "Window Tint" },
  { slug: "interior_deep_clean", label: "Interior Deep Clean" },
  { slug: "silver_deep_clean", label: "Silver Detail" },
  { slug: "gold_correct_protect", label: "Gold Polish" },
  { slug: "ceramic_5yr", label: "Ceramic Coating", plus: true },
  { slug: FLEET_SLUG, label: "Fleet / B2B" },
];

/** Window event used by "Get this quote" buttons to select a chip. */
export const SELECT_SERVICE_EVENT = "sb:select-service";

/**
 * SELECT_SERVICE_EVENT payload. `add: true` (upsells like "Add tint") always adds to the
 * selection; otherwise the first button tap replaces the page's untouched default.
 */
export interface SelectServiceDetail {
  slug: string;
  add?: boolean;
}
