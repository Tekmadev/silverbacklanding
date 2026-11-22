import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SITE } from "@/config/site";
import {
  parseRating,
  parseReviewCount,
  RATING_SETTING_KEY,
  REVIEW_COUNT_SETTING_KEY,
} from "./review-settings";
import { getPublicClient } from "./supabase";

export const REVIEWS_CACHE_TAG = "google-reviews";

const PLACES_API = "https://places.googleapis.com/v1";
const TIMEOUT_MS = 5000;

export interface GoogleReview {
  authorName: string;
  authorUrl: string | null;
  authorPhoto: string | null;
  rating: number;
  text: string;
  /** e.g. "2 weeks ago", as worded by Google. */
  when: string;
  /** Link to this review on Google Maps. */
  url: string | null;
  /** True when Google machine-translated the review (must be disclosed). */
  translated: boolean;
}

export interface ReviewData {
  rating: number;
  count: number;
  /** Up to 5 reviews, in Google's "most relevant" order. */
  reviews: GoogleReview[];
  /** The business's Google Maps page (where every review can be read). */
  mapsUrl: string;
  source: "google" | "fallback";
}

/** Last resort when neither Google nor the database answers. */
const CONFIG_FALLBACK = { rating: SITE.rating.value, count: SITE.rating.count };

/**
 * The rating and count the owner saved in /owner/prices (site_settings).
 * `fresh` is false when the database could not be read, so the caller caches briefly.
 */
async function getOwnerRating(): Promise<{ rating: number; count: number; fresh: boolean }> {
  const client = getPublicClient();
  if (!client) return { ...CONFIG_FALLBACK, fresh: true };
  try {
    const { data, error } = await client
      .from("site_settings")
      .select("key,value")
      .in("key", [RATING_SETTING_KEY, REVIEW_COUNT_SETTING_KEY]);
    if (error) throw error;
    const byKey = new Map((data ?? []).map((row) => [row.key as string, row.value as unknown]));
    return {
      rating: parseRating(byKey.get(RATING_SETTING_KEY)) ?? CONFIG_FALLBACK.rating,
      count: parseReviewCount(byKey.get(REVIEW_COUNT_SETTING_KEY)) ?? CONFIG_FALLBACK.count,
      fresh: true,
    };
  } catch (error) {
    console.warn("[google-reviews] could not read the owner rating:", (error as Error)?.message);
    return { ...CONFIG_FALLBACK, fresh: false };
  }
}

async function ownerFallback(): Promise<{ data: ReviewData; fresh: boolean }> {
  const { rating, count, fresh } = await getOwnerRating();
  return {
    data: { rating, count, reviews: [], mapsUrl: SITE.googleReviewsUrl, source: "fallback" },
    fresh,
  };
}

async function placesFetch(url: string, init: RequestInit, fieldMask: string, key: string) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": fieldMask,
      ...init.headers,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Places API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** Uses GOOGLE_PLACE_ID when set, otherwise finds the place by name + address (free ID-only search). */
async function resolvePlaceId(key: string): Promise<string> {
  const fromEnv = process.env.GOOGLE_PLACE_ID?.trim();
  if (fromEnv) return fromEnv;
  const data = await placesFetch(
    `${PLACES_API}/places:searchText`,
    { method: "POST", body: JSON.stringify({ textQuery: `${SITE.name}, ${SITE.address.full}` }) },
    "places.id",
    key,
  );
  const id = data?.places?.[0]?.id;
  if (typeof id !== "string") throw new Error("Place not found by text search");
  return id;
}

type RawReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

function normalizeReview(r: RawReview): GoogleReview | null {
  const text = r.text?.text?.trim();
  const name = r.authorAttribution?.displayName?.trim();
  if (!text || !name || typeof r.rating !== "number") return null;
  const translated = Boolean(
    r.originalText?.languageCode && r.text?.languageCode && r.originalText.languageCode !== r.text.languageCode,
  );
  return {
    authorName: name,
    authorUrl: r.authorAttribution?.uri ?? null,
    authorPhoto: r.authorAttribution?.photoUri ?? null,
    rating: r.rating,
    text,
    when: r.relativePublishTimeDescription ?? "",
    url: r.googleMapsUri ?? null,
    translated,
  };
}

/**
 * The one source for the star rating, review count and review cards on every page.
 *
 * With GOOGLE_PLACES_API_KEY set: live numbers and top 5 reviews from Places API (New),
 * cached for at most one hour (about 720 calls a month, inside Google's 1,000 free
 * monthly calls). Google's terms don't allow storing reviews, so none are saved.
 *
 * Without the key, or if Google is unreachable: the rating and count the owner saved
 * in /owner/prices, then config/site.ts as a last resort. Saving there expires this
 * cache instantly. Never throws.
 */
export async function getGoogleReviews(): Promise<ReviewData> {
  "use cache";
  cacheTag(REVIEWS_CACHE_TAG);

  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) {
    const { data, fresh } = await ownerFallback();
    if (fresh) cacheLife("hours");
    else cacheLife("minutes");
    return data;
  }

  try {
    const placeId = await resolvePlaceId(key);
    const data = await placesFetch(
      `${PLACES_API}/places/${encodeURIComponent(placeId)}?languageCode=en`,
      { method: "GET" },
      "rating,userRatingCount,reviews,googleMapsUri",
      key,
    );

    const rating = Number(data?.rating);
    const count = Number(data?.userRatingCount);
    if (!Number.isFinite(rating) || !Number.isFinite(count)) throw new Error("Place has no rating yet");

    cacheLife("hours");
    return {
      rating,
      count,
      reviews: ((data.reviews ?? []) as RawReview[])
        .map(normalizeReview)
        .filter((r): r is GoogleReview => r !== null)
        .slice(0, 5),
      mapsUrl: typeof data.googleMapsUri === "string" ? data.googleMapsUri : SITE.googleReviewsUrl,
      source: "google",
    };
  } catch (error) {
    console.warn("[google-reviews] using the owner rating instead:", (error as Error).message);
    cacheLife("minutes");
    return (await ownerFallback()).data;
  }
}
