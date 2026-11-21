import { formatPhone } from "./phone";

/** Pre-filled WhatsApp quote message, shared by the widget and the no-JS fallback. */
export function buildQuoteMessage(opts: {
  serviceName: string;
  displayPrice: string | null;
  vehicle: string;
  phoneE164: string | null;
  eventId: string;
}): string {
  return [
    "Hi Silverback! I'd like a quote.",
    `Service: ${opts.serviceName}${opts.displayPrice ? ` (${opts.displayPrice})` : ""}`,
    `Vehicle: ${opts.vehicle || "not provided"}`,
    ...(opts.phoneE164 ? [`Phone: ${formatPhone(opts.phoneE164)}`] : []),
    `Ref: ${opts.eventId.slice(0, 8).toUpperCase()}`,
  ].join("\n");
}
