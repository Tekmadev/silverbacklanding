import { after } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { attributionColumns, isBot, readJson, str } from "@/lib/server/request";
import { EVENT_TYPES, type SiteEventType } from "@/lib/types";

/**
 * Click/page-view beacon. Answers 204 immediately and writes to Supabase after
 * the response, so Call / WhatsApp taps never wait on the database.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return new Response(null, { status: 400 });

  const eventType = body.event_type as SiteEventType;
  if (!EVENT_TYPES.includes(eventType)) return new Response(null, { status: 400 });

  const client = getAdminClient();
  if (!client || isBot(request)) return new Response(null, { status: 204 });

  const row = {
    event_type: eventType,
    button_location: str(body.button_location, 60),
    utm_term: str(body.utm_term, 200),
    referrer: str(body.referrer, 500),
    ...attributionColumns(body),
  };

  after(async () => {
    const { error } = await client.from("site_events").insert(row);
    if (error) console.error("[api/track] insert failed:", error.message);
  });

  return new Response(null, { status: 204 });
}
