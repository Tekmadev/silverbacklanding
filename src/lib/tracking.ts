/**
 * Centralized conversion tracking. Every high-intent action fans out to:
 *   1. Supabase (via /api/track or /api/lead): our own proof-of-ROI ledger
 *   2. GTM dataLayer: Google Ads conversions + Enhanced Conversions
 *   3. Meta Pixel: with the same event_id the server uses for CAPI dedupe
 *
 * Every call is fire-and-forget and wrapped so tracking can never block a tap.
 */
import { getAttribution, getDeviceType } from "./attribution";
import type { SiteEventType } from "./types";

type Fbq = (command: "track", event: string, params?: Record<string, unknown>, options?: { eventID?: string }) => void;
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: Fbq;
    gtag?: Gtag;
  }
}

function safe(fn: () => void) {
  try {
    fn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("[tracking]", error);
  }
}

function pushDataLayer(payload: Record<string, unknown>) {
  safe(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  });
}

function fbqTrack(event: string, params: Record<string, unknown>, eventId?: string) {
  safe(() => {
    if (typeof window.fbq === "function") {
      window.fbq("track", event, params, eventId ? { eventID: eventId } : undefined);
    }
  });
}

function postJson(url: string, body: Record<string, unknown>) {
  const payload = JSON.stringify(body);
  safe(() => {
    if (typeof navigator.sendBeacon === "function") {
      const queued = navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      if (queued) return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  });
}

/** Logs an event row to Supabase `site_events` without blocking navigation. */
export function logSiteEvent(eventType: SiteEventType, buttonLocation?: string) {
  safe(() => {
    postJson("/api/track", {
      event_type: eventType,
      page_path: window.location.pathname,
      button_location: buttonLocation ?? null,
      device_type: getDeviceType(),
      ...getAttribution(),
    });
  });
}

export function trackPageView() {
  logSiteEvent("page_view");
}

export function trackCallClick(buttonLocation: string) {
  pushDataLayer({ event: "phone_call_click", button_location: buttonLocation });
  fbqTrack("Contact", { content_name: "phone_call" });
  logSiteEvent("call_click", buttonLocation);
}

export function trackWhatsAppDirectClick(buttonLocation: string) {
  pushDataLayer({ event: "whatsapp_direct_click", button_location: buttonLocation });
  fbqTrack("Contact", { content_name: "whatsapp_direct" });
  logSiteEvent("whatsapp_direct_click", buttonLocation);
}

export function trackDirectionsClick(buttonLocation: string) {
  pushDataLayer({ event: "directions_click", button_location: buttonLocation });
  logSiteEvent("directions_click", buttonLocation);
}

export interface LeadInput {
  eventId: string;
  /** Every service picked in the quote widget (one or more). */
  serviceSlugs: string[];
  /** Human-readable names joined with " + ", used as the ad conversion label. */
  serviceName: string;
  /** Sum of the picked services' prices (null when none has a fixed price). */
  valueCad: number | null;
  vehicle: string;
  /** E.164, e.g. +19055196290 */
  phoneE164: string;
  /** Honeypot field. Must be empty for real visitors. */
  website?: string;
}

/**
 * Fires browser-side conversion tags and posts the lead to /api/lead.
 * Returns immediately; the POST uses keepalive so it survives the WhatsApp redirect.
 */
export function trackLead(lead: LeadInput) {
  const value = lead.valueCad ?? 0;

  safe(() => {
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_data", { phone_number: lead.phoneE164 });
    }
  });

  pushDataLayer({
    event: "whatsapp_lead",
    event_id: lead.eventId,
    service: lead.serviceName,
    value_cad: value,
    currency: "CAD",
    user_data: { phone_number: lead.phoneE164 },
  });

  fbqTrack("Lead", { content_name: lead.serviceName, value, currency: "CAD" }, lead.eventId);

  safe(() => {
    void fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event_id: lead.eventId,
        services: lead.serviceSlugs,
        vehicle: lead.vehicle,
        phone: lead.phoneE164,
        website: lead.website ?? "",
        page_path: window.location.pathname,
        device_type: getDeviceType(),
        ...getAttribution(),
      }),
    }).catch(() => {});
  });
}
