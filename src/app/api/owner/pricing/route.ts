import { revalidatePath, revalidateTag } from "next/cache";
import { PRICING_CACHE_TAG } from "@/lib/pricing";
import { normalizeRow } from "@/lib/pricing-utils";
import { getAdminClient } from "@/lib/supabase";
import { checkOwnerKey } from "@/lib/server/owner-auth";
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

/** Owner editor: load every pricing row (incl. inactive) + the active promo. */
export async function GET(request: Request) {
  const { client, response } = await authorize(request);
  if (!client) return response;

  const [pricing, promo] = await Promise.all([
    client.from("service_pricing").select("*").order("sort_order", { ascending: true }),
    client.from("site_settings").select("value").eq("key", "active_promo").maybeSingle(),
  ]);

  if (pricing.error) return json({ error: pricing.error.message }, 502);

  const services = (pricing.data ?? []).map(normalizeRow).filter((r): r is ServicePricing => r !== null);
  return json({
    services,
    promo: isPromoKey(promo.data?.value) ? promo.data.value : "none",
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

/** Owner editor: save prices + promo, then refresh every cached page instantly. */
export async function POST(request: Request) {
  const { client, response } = await authorize(request);
  if (!client) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const { services, promo } = (body ?? {}) as { services?: unknown; promo?: unknown };
  if (!Array.isArray(services) || services.length > 100 || !isPromoKey(promo)) {
    return json({ error: "Expected { services: [...], promo: 'black_friday' | 'winter' | 'none' }." }, 400);
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
    return json({ error: failed.error.message }, 502);
  }

  const promoRes = await client
    .from("site_settings")
    .upsert({ key: "active_promo", value: promo }, { onConflict: "key" });
  if (promoRes.error) {
    console.error("[api/owner/pricing] promo update failed:", promoRes.error.message);
    return json({ error: promoRes.error.message }, 502);
  }

  console.info(`[api/owner/pricing] saved ${rows.length} prices, promo=${promo}`);

  // Expire the cached pricing immediately and re-render every page on next visit.
  revalidateTag(PRICING_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");

  return json({ ok: true, savedAt: new Date().toISOString() });
}
