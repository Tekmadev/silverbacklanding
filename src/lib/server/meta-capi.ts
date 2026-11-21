import "server-only";
import { createHash } from "node:crypto";

const GRAPH_API_VERSION = "v24.0";

export interface CapiLead {
  eventId: string;
  phoneE164: string;
  valueCad: number | null;
  contentName: string;
  eventSourceUrl: string;
  fbp: string | null;
  fbc: string | null;
  clientIp: string | null;
  userAgent: string | null;
}

/**
 * Sends a server-side `Lead` to the Meta Conversions API, deduplicated against
 * the browser Pixel via the shared event_id. No-ops when env vars are missing.
 */
export async function sendMetaLead(lead: CapiLead): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return;

  // Meta expects phone as digits incl. country code, no "+", then SHA-256 (lowercase hex).
  const hashedPhone = createHash("sha256").update(lead.phoneE164.replace(/\D/g, "")).digest("hex");

  const userData: Record<string, unknown> = { ph: [hashedPhone] };
  if (lead.fbp) userData.fbp = lead.fbp;
  if (lead.fbc) userData.fbc = lead.fbc;
  if (lead.clientIp) userData.client_ip_address = lead.clientIp;
  if (lead.userAgent) userData.client_user_agent = lead.userAgent;

  const body = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: lead.eventId,
        action_source: "website",
        event_source_url: lead.eventSourceUrl,
        user_data: userData,
        custom_data: {
          currency: "CAD",
          value: lead.valueCad ?? 0,
          content_name: lead.contentName,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) console.error("[meta-capi] Lead not accepted:", res.status, await res.text());
  } catch (error) {
    console.error("[meta-capi] request failed:", (error as Error).message);
  }
}
