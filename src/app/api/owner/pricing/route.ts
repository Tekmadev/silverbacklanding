import { revalidatePath, revalidateTag } from "next/cache";
import { SITE } from "@/config/site";
import { REVIEWS_CACHE_TAG } from "@/lib/google-reviews";
import { PRICING_CACHE_TAG } from "@/lib/pricing";
import { normalizeRow } from "@/lib/pricing-utils";
import { getAdminClient } from "@/lib/supabase";
import { checkOwnerKey } from "@/lib/server/owner-auth";
import {
  parseRating,
  parseReviewCount,
  RATING_SETTING_KEY,
  REVIEW_COUNT_SETTING_KEY,
} from "@/lib/review-settings";
import { isPromoKey, type ServicePricing } from "@/lib/types";

const noStore = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" };

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: noStore });
}

async function authorize(request: Request) {
  const auth = await checkOwnerKey(request);
  if (!auth.ok) return { response: json({ error: auth.error }, auth.status) };
  const client = getAdminClient();
  if (!client) {
    return {
      response: json(
        { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        503,
      ),
    };
  }
  return { client };
}

/** Owner editor: load every pricing row (incl. inactive), the active promo and the Google rating. */
export async function GET(request: Request) {
  const { client, response } = await authorize(request);
  if (!client) return response;

  const [pricing, settings] = await Promise.all([
    client.from("service_pricing").select("*").order("sort_order", { ascending: true }),
    client
      .from("site_settings")
      .select("key,value")
      .in("key", ["active_promo", RATING_SETTING_KEY, REVIEW_COUNT_SETTING_KEY]),
  ]);

  if (pricing.error) return json({ error: pricing.error.message }, 502);
  if (settings.error) return json({ error: settings.error.message }, 502);

  const byKey = new Map((settings.data ?? []).map((row) => [row.key as string, row.value as unknown]));
  const promo = byKey.get("active_promo");
  const services = (pricing.data ?? []).map(normalizeRow).filter((r): r is ServicePricing => r !== null);
  return json({
    services,
    promo: isPromoKey(promo) ? promo : "none",
    rating: parseRating(byKey.get(RATING_SETTING_KEY)) ?? SITE.rating.value,
    reviewCount: parseReviewCount(byKey.get(REVIEW_COUNT_SETTING_KEY)) ?? SITE.rating.count,
    /** When true, live Google numbers are shown and these are only a backup. */
    googleLive: Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim()),
  });
}

interface RowUpdate {
  slug: string;
  display_price: string;
  compare_at_price: string | null;
  price_cad: number | null;
  is_active: boolean;
}

function parseRow(raw: unknown): RowUpdate | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.slug !== "string" || !/^[a-z0-9_]{1,64}$/.test(r.slug)) return null;
  if (typeof r.display_price !== "string") return null;

  const display = r.display_price.trim().slice(0, 60);
  if (!display) return null;

  const compare =
    typeof r.compare_at_price === "string" && r.compare_at_price.trim()
      ? r.compare_at_price.trim().slice(0, 40)
      : null;

  let price: number | null = null;
  if (r.price_cad !== null && r.price_cad !== undefined && r.price_cad !== "") {
    price = Number(r.price_cad);
    if (!Number.isFinite(price) || price < 0 || price > 100000) return null;
    price = Math.round(price * 100) / 100;
  }

  return {
    slug: r.slug,
    display_price: display,
    compare_at_price: compare,
    price_cad: price,
    is_active: r.is_active !== false,
  };
}

/** Expire cached prices and rating immediately and re-render every page on next visit. */
function refreshSite() {
  revalidateTag(PRICING_CACHE_TAG, { expire: 0 });
  revalidateTag(REVIEWS_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

/** Owner editor: save prices, promo and Google rating, then refresh every cached page instantly. */
export async function POST(request: Request) {
  const { client, response } = await authorize(request);
  if (!client) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const { services, promo, rating: rawRating, reviewCount: rawCount } = (body ?? {}) as {
    services?: unknown;
    promo?: unknown;
    rating?: unknown;
    reviewCount?: unknown;
  };
  if (!Array.isArray(services) || services.length > 100 || !isPromoKey(promo)) {
    return json({ error: "Expected { services: [...], promo: 'black_friday' | 'winter' | 'none' }." }, 400);
  }

  // Rating and count are optional so older editor tabs can still save prices.
  const hasRating = rawRating !== undefined || rawCount !== undefined;
  const rating = parseRating(rawRating);
  const reviewCount = parseReviewCount(rawCount);
  if (hasRating && rating === null) {
    return json({ error: "Google rating must be a number from 1.0 to 5.0, e.g. 4.9." }, 422);
  }
  if (hasRating && reviewCount === null) {
    return json({ error: "Number of reviews must be a whole number of at least 1, e.g. 45." }, 422);
  }

  const rows: RowUpdate[] = [];
  for (const raw of services) {
    const row = parseRow(raw);
    if (!row) {
      const slug = (raw as { slug?: unknown })?.slug;
      return json({ error: `Check the fields for "${typeof slug === "string" ? slug : "a service"}": display price is required and price must be a number.` }, 422);
    }
    rows.push(row);
  }

  const results = await Promise.all(
    rows.map(({ slug, ...fields }) => client.from("service_pricing").update(fields).eq("slug", slug)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error("[api/owner/pricing] price update failed:", failed.error.message);
    refreshSite(); // other rows may have saved; don't leave the site showing stale prices
    return json({ error: failed.error.message }, 502);
  }

  const settingRows: { key: string; value: string }[] = [{ key: "active_promo", value: promo }];
  if (hasRating && rating !== null && reviewCount !== null) {
    settingRows.push(
      { key: RATING_SETTING_KEY, value: rating.toFixed(1) },
      { key: REVIEW_COUNT_SETTING_KEY, value: String(reviewCount) },
    );
  }
  const settingsRes = await client.from("site_settings").upsert(settingRows, { onConflict: "key" });
  if (settingsRes.error) {
    console.error("[api/owner/pricing] settings update failed:", settingsRes.error.message);
    refreshSite(); // prices already saved above
    return json({ error: settingsRes.error.message }, 502);
  }

  console.info(
    `[api/owner/pricing] saved ${rows.length} prices, promo=${promo}` +
      (hasRating ? `, rating=${rating} (${reviewCount} reviews)` : ""),
  );

  refreshSite();

  return json({ ok: true, savedAt: new Date().toISOString() });
}
