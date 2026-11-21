import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Hard cap on every Supabase request so a slow DB can never hang a build or a page. */
const REQUEST_TIMEOUT_MS = 4000;

const timeoutFetch: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
};

function build(url: string | undefined, key: string | undefined): SupabaseClient | null {
  if (!url || !key) return null;
  try {
    // Throws on malformed URLs (e.g. placeholder values left in .env).
    new URL(url);
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: timeoutFetch },
    });
  } catch {
    return null;
  }
}

/** Anon client: read-only access to `service_pricing` and `site_settings` via RLS. */
export function getPublicClient(): SupabaseClient | null {
  return build(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Service-role client: server-side writes only (leads, events, owner edits). */
export function getAdminClient(): SupabaseClient | null {
  return build(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
