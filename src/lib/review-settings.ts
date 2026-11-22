/**
 * The Google star rating and review count the owner types into /owner/prices.
 * Stored in `site_settings` (key/value) and shown everywhere the rating appears.
 * Live Places API numbers take priority whenever GOOGLE_PLACES_API_KEY is set.
 */
export const RATING_SETTING_KEY = "google_rating";
export const REVIEW_COUNT_SETTING_KEY = "google_review_count";

/** 1.0 to 5.0, rounded to one decimal. Returns null for anything else. */
export function parseRating(value: unknown): number | null {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n * 10) / 10;
}

/** Whole number from 1 to 1,000,000 (Google rejects a rating with 0 reviews). Returns null otherwise. */
export function parseReviewCount(value: unknown): number | null {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 1_000_000) return null;
  return n;
}
