import type { Attribution } from "./types";

const STORAGE_KEY = "sb_attribution";
const PARAM_KEYS = ["gclid", "fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_term"] as const;

export function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // RFC4122-ish fallback for very old browsers / insecure contexts.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function read(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function write(value: Attribution) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode / storage disabled. Attribution still flows for this page via memory.
  }
}

function clip(value: string | null, max = 255): string | null {
  return value ? value.slice(0, max) : null;
}

let memory: Attribution | null = null;

/**
 * Called once on landing. Stores click IDs, UTMs, referrer and a session id in
 * sessionStorage. A fresh ad click (new gclid/fbclid/utm) in the same tab updates
 * the stored values; the session id is kept.
 */
export function captureAttribution(): Attribution {
  const existing = read() ?? memory;
  const params = new URLSearchParams(window.location.search);
  const hasNewCampaignData = PARAM_KEYS.some((k) => params.get(k));

  let referrer: string | null = existing?.referrer ?? null;
  if (!existing && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      if (ref.host !== window.location.host) referrer = clip(document.referrer, 500);
    } catch {
      // ignore malformed referrers
    }
  }

  const next: Attribution = {
    session_id: existing?.session_id ?? uuid(),
    gclid: existing?.gclid ?? null,
    fbclid: existing?.fbclid ?? null,
    utm_source: existing?.utm_source ?? null,
    utm_medium: existing?.utm_medium ?? null,
    utm_campaign: existing?.utm_campaign ?? null,
    utm_term: existing?.utm_term ?? null,
    referrer,
  };

  if (hasNewCampaignData) {
    for (const key of PARAM_KEYS) next[key] = clip(params.get(key));
  }

  memory = next;
  write(next);
  return next;
}

export function getAttribution(): Attribution {
  return read() ?? memory ?? captureAttribution();
}

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024 && window.matchMedia("(pointer: coarse)").matches) return "tablet";
  return "desktop";
}
