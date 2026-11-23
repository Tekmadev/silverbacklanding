import { formatPhone } from "./phone";

export interface QuoteMessageService {
  name: string;
  displayPrice: string | null;
}

const line = (s: QuoteMessageService) => `${s.name}${s.displayPrice ? ` (${s.displayPrice})` : ""}`;

/** Pre-filled WhatsApp quote message, shared by the widget and the no-JS fallback. */
export function buildQuoteMessage(opts: {
  services: QuoteMessageService[];
  vehicle: string;
  phoneE164: string | null;
  eventId: string;
}): string {
  const services =
    opts.services.length === 0
      ? ["Service: Detailing quote"]
      : opts.services.length === 1
        ? [`Service: ${line(opts.services[0])}`]
        : ["Services:", ...opts.services.map((s) => `- ${line(s)}`)];

  return [
    "Hi Silverback! I'd like a quote.",
    ...services,
    `Vehicle: ${opts.vehicle || "not provided"}`,
    ...(opts.phoneE164 ? [`Phone: ${formatPhone(opts.phoneE164)}`] : []),
    `Ref: ${opts.eventId.slice(0, 8).toUpperCase()}`,
  ].join("\n");
}
