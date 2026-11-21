import "server-only";

const MAX_BODY_BYTES = 8 * 1024;
const BOT_UA = /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|bingpreview/i;

/** Parses a small JSON body; returns null for oversized or malformed payloads. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return null;
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Trimmed string clipped to `max`, or null when empty / not a string. */
export function str(value: unknown, max = 255): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export function isBot(request: Request): boolean {
  return BOT_UA.test(request.headers.get("user-agent") ?? "");
}

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim() || null;
  return request.headers.get("x-real-ip");
}

/** Shared attribution columns for `site_events` and `leads`. */
export function attributionColumns(body: Record<string, unknown>) {
  return {
    session_id: str(body.session_id, 64),
    page_path: str(body.page_path, 200),
    device_type: str(body.device_type, 16),
    gclid: str(body.gclid),
    fbclid: str(body.fbclid),
    utm_source: str(body.utm_source, 120),
    utm_medium: str(body.utm_medium, 120),
    utm_campaign: str(body.utm_campaign, 200),
  };
}
