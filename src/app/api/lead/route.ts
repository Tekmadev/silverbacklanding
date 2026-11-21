import { after, type NextRequest } from "next/server";
import { SITE, whatsappHref } from "@/config/site";
import { getSiteData } from "@/lib/pricing";
import { findService } from "@/lib/pricing-utils";
import { toE164 } from "@/lib/phone";
import { getAdminClient } from "@/lib/supabase";
import { sendMetaLead } from "@/lib/server/meta-capi";
import { attributionColumns, clientIp, isBot, readJson, str } from "@/lib/server/request";
import { FLEET_SLUG } from "@/config/quote";
import { buildQuoteMessage } from "@/lib/whatsapp-message";

/**
 * No-JS / pre-hydration fallback: a native form POST lands here. Record what we
 * can, then 303 straight to WhatsApp. The visitor always reaches the owner.
 */
async function handleFormPost(request: NextRequest) {
  let form: FormData | null = null;
  try {
    form = await request.formData();
  } catch {
    // fall through with an empty form and still send them to WhatsApp
  }
  const get = (key: string, max = 80) => str(form?.get(key), max);

  const serviceSlug = get("service", 64);
  const vehicle = get("vehicle") ?? "";
  const rawPhone = get("phone", 20);
  const phone = rawPhone ? toE164(rawPhone) : null;
  const eventId = crypto.randomUUID();

  const { services } = await getSiteData();
  const service = serviceSlug ? findService(services, serviceSlug) : undefined;
  const serviceName = service?.name ?? (serviceSlug === FLEET_SLUG ? "Fleet / B2B" : "Detailing quote");

  let pagePath: string | null = null;
  try {
    pagePath = new URL(request.headers.get("referer") ?? "").pathname.slice(0, 200);
  } catch {
    pagePath = null;
  }

  const client = getAdminClient();
  if (client && !get("website") && phone && vehicle && !isBot(request)) {
    after(async () => {
      const { error } = await client.from("leads").insert({
        event_id: eventId,
        service_selected: serviceSlug,
        estimated_value_cad: service?.price_cad ?? null,
        vehicle,
        phone,
        page_path: pagePath,
      });
      if (error) console.error("[api/lead] fallback insert failed:", error.message);
    });
  }

  const message = buildQuoteMessage({
    serviceName,
    displayPrice: service?.display_price ?? null,
    vehicle,
    phoneE164: phone,
    eventId,
  });
  return Response.redirect(whatsappHref(message), 303);
}

/**
 * Quote widget submission. The browser has already opened WhatsApp by the time
 * this runs (fail-safe), so this endpoint only records the lead and fires CAPI.
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return handleFormPost(request);
  }

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // Honeypot: bots fill every field. Pretend success, store nothing.
  if (str(body.website)) return Response.json({ ok: true });

  const eventId = str(body.event_id, 64);
  const serviceSlug = str(body.service, 64);
  const vehicle = str(body.vehicle, 80);
  const phone = typeof body.phone === "string" ? toE164(body.phone) : null;

  if (!eventId || !serviceSlug || !vehicle || !phone) {
    return Response.json({ ok: false, error: "Missing or invalid fields." }, { status: 422 });
  }

  // Never trust a client-sent value. Price the lead from our own pricing table.
  const { services } = await getSiteData();
  const service = findService(services, serviceSlug);
  if (!service && serviceSlug !== FLEET_SLUG) {
    return Response.json({ ok: false, error: "Unknown service." }, { status: 422 });
  }
  const valueCad = service?.price_cad ?? null;
  const serviceName = service?.name ?? "Fleet / B2B";

  const attribution = attributionColumns(body);
  const client = getAdminClient();
  let stored = false;

  if (client && !isBot(request)) {
    const { error } = await client.from("leads").insert({
      event_id: eventId,
      service_selected: serviceSlug,
      estimated_value_cad: valueCad,
      vehicle,
      phone,
      ...attribution,
    });
    if (error) console.error("[api/lead] insert failed:", error.message);
    stored = !error;

    after(async () => {
      const { error: eventError } = await client.from("site_events").insert({
        event_type: "form_submit",
        button_location: "quote_widget",
        utm_term: str(body.utm_term, 200),
        referrer: str(body.referrer, 500),
        ...attribution,
      });
      if (eventError) console.error("[api/lead] form_submit event failed:", eventError.message);
    });
  }

  // Server-side Meta Lead, deduplicated with the browser Pixel via event_id.
  const fbclid = str(body.fbclid);
  const fbc =
    request.cookies.get("_fbc")?.value ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : null);
  after(() =>
    sendMetaLead({
      eventId,
      phoneE164: phone,
      valueCad,
      contentName: serviceName,
      eventSourceUrl: `${SITE.url}${attribution.page_path ?? "/"}`,
      fbp: request.cookies.get("_fbp")?.value ?? null,
      fbc,
      clientIp: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    }),
  );

  return Response.json({ ok: true, stored });
}
