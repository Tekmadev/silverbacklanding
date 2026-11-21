Build a fast, zero-bug, conversion-obsessed **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase** paid-ad landing funnel for **Silverback Auto Detailing**, to be hosted on **Vercel** at `book.silverbackdetail.com` alongside their existing WordPress site (`silverbackdetail.com`).

### 0. Design Direction & Scope Rules (Ship Fast, Zero Bloat)
- **Use the `UI/UX Pro Max` skill** to match and elevate Silverback's existing luxury monochrome studio brand:
  - Crisp white top bar (desktop) with the Silverback crest logo and minimal header actions.
  - Deep obsidian/charcoal dark studio sections, tight-tracked ultra-bold condensed uppercase display headlines (matching their existing `SHOWROOM FINISH. BUILT TO STAY THAT WAY.` tone), high-contrast white/silver body text, and crisp pill-shaped CTA buttons.
- **NO AI Slop & NO Scope Creep:** No generic SaaS gradients, floating blobs, bloated JS scroll animations, blog, user login/auth, or frontend analytics dashboard. Build ONLY:
  1. The ultra-fast 3-route paid-ad conversion funnel (`/`, `/winter-interior`, `/ppf-ceramic`).
  2. One ultra-simple, private **Owner Price & Promo Editor** (`/owner/prices`) accessible only via a secret link/key so the owner can update display prices and promos anytime.
- **Assets & Higgsfield MCP:** Inspect `/public/images` first and prioritize real shop/detailing photos (dark BMW coupe hero, Cybertruck/bay shots, paint gauge, engine bay, and before/after sets). Only use the installed **Higgsfield MCP** if a sharp dark studio hero backdrop is missing (e.g., moody dark paint water beading under studio lighting)—never fabricate fake customer vehicles.
- **Database Workflow:** Output **one complete, idempotent, copy-paste-ready `supabase/schema.sql` file** containing ALL `CREATE TABLE`, `CREATE VIEW`, RLS policies, and `INSERT` seed queries so I can run it manually once in the Supabase SQL Editor.

---

### 1. Business Facts & Confirmed Pricing Seed Data (CAD + HST)
- **Brand:** Silverback Auto Detailing
- **Real Social Proof:** **5.0 ★ (44 Google Reviews)** — display prominently above the fold, in the reviews section, and in JSON-LD `AggregateRating`.
- **Address:** `1254 Plains Rd E, Unit 14, Burlington, ON L7S 1W6` (Heated indoor bay inside Global Auto Center, directly beside Global Tech Collision).
- **Service Area (25 km Radius):** Burlington, Hamilton, Oakville, Milton, Waterdown, Dundas, Ancaster, and Stoney Creek.
- **Phone / WhatsApp:** `(905) 519-6290` (`19055196290`) | **Email:** `Silverbackvehicledetailing@gmail.com` | **Hours:** Mon–Sat (By Appointment).
- **Pricing, Tax & Sizing Policy:** All prices are in CAD (+ HST) and confirmed upfront before work begins (zero surprise counter upsells). Larger SUVs, trucks, and 3-row interiors are quoted fairly by size & condition. Accepts Cash, Credit Cards, and Interac e-Transfer.
- **Confirmed Seed Data for `service_pricing` Table (13 Services)** — mirror identically in `src/config/pricing-fallback.ts` so `npm run build` and page renders NEVER break if env vars are missing or Supabase is unreachable:
  1. `ppf_ceramic_bundle` — **Full Front PPF + Ceramic Winter Shield Bundle**: `price_cad: 2499`, `display_price: "From $2,499 + HST"`, `compare_at_price: "$3,000+"`, `badge: "Save $500–$600"`, `category: "protection"` *(Full front-end rock-chip PPF paired with ceramic paint protection — flagship high-ticket offer)*
  2. `ppf_full_front` — **Full Front End PPF**: `price_cad: 1799`, `display_price: "From $1,799 + HST"`, `compare_at_price: null`, `badge: null`, `category: "protection"` *(Full hood, full fenders, front bumper, mirrors & headlights protection against QEW/403 gravel & road salt)*
  3. `window_tint` — **All-Around Window Tinting**: `price_cad: 349`, `display_price: "$349 + HST"`, `compare_at_price: null`, `badge: "Popular Add-On"`, `category: "protection"` *(Full side & rear windows, excluding windshield — standalone or bundled with PPF/Ceramic)*
  4. `ceramic_5yr` — **5-Year Ceramic Coating**: `price_cad: 1099`, `display_price: "$1,099 + HST"`, `compare_at_price: null`, `badge: null`, `category: "protection"` *(Hydrophobic weather/UV shield; decontamination, clay bar & panel prep included)*
  5. `ceramic_lifetime` — **Lifetime (12-Yr) Ceramic Coating**: `price_cad: 1299`, `display_price: "$1,299 + HST"`, `compare_at_price: null`, `badge: null`, `category: "protection"` *(Thickest 12-year rated professional shield; multi-stage correction recommended prior)*
  6. `paint_correction` — **Paint Correction**: `price_cad: 400`, `display_price: "$400 / step"`, `compare_at_price: null`, `badge: null`, `category: "protection"` *(Paint thickness gauge measured, wet sanding, heavy cut & refining polish)*
  7. `interior_deep_clean` — **Interior Deep Clean**: `price_cad: 279`, `display_price: "$279 + HST"`, `compare_at_price: null`, `badge: "Winter Favorite"`, `category: "interior"` *(Steam shampoo, hot-water stain & salt extraction, leather & fabric care — Winter Lead Driver)*
  8. `silver_deep_clean` — **Silver Deep Clean**: `price_cad: 399`, `display_price: "$399 + HST"`, `compare_at_price: null`, `badge: "Most Complete"`, `category: "packages"` *(Full interior reset, trunk, deep vents/crevices, stain removal, door jambs/sills + 2-bucket hand wash — sedan/crossover)*
  9. `gold_correct_protect` — **Gold Correct & Protect**: `price_cad: 499`, `display_price: "$499 + HST"`, `compare_at_price: null`, `badge: null`, `category: "packages"` *(Everything in Silver + 1-step machine polish for swirls/haze, ceramic seal & engine bay detail)*
  10. `bronze_maintenance` — **Bronze Maintenance**: `price_cad: 150`, `display_price: "$150 + HST"`, `compare_at_price: null`, `badge: null`, `category: "packages"` *(Interior vacuum, dash/console wipe, 2-bucket hand wash, wheels/tires, glass — price anchor only)*
  11. `ozone_treatment` — **Ozone Odour Treatment**: `price_cad: 150`, `display_price: "$150 + HST"`, `compare_at_price: null`, `badge: null`, `category: "addons"` *(Complete interior odour & bacteria elimination)*
  12. `clay_bar` — **Clay Bar Decontamination**: `price_cad: 150`, `display_price: "$150 + HST"`, `compare_at_price: null`, `badge: null`, `category: "addons"` *(2-bucket hand wash, deep rim/wheel-well clean, iron remover & clay bar)*
  13. `interior_refresh` — **Interior Refresh**: `price_cad: 99`, `display_price: "$99 + HST"`, `compare_at_price: null`, `badge: null`, `category: "addons"` *(Vacuum, dash/console/door wipe down, interior glass)*

---

### 2. Private Owner Price & Promo Editor (`/owner/prices`)
Build one dead-simple, mobile-friendly page strictly for the owner (Yasin) to edit display prices and switch seasonal promos:
- **Access & Privacy:**
  - Never link `/owner/prices` anywhere on the public site.
  - Set `robots: { index: false, follow: false }` in metadata and `Disallow: /owner` in `robots.txt` (and exclude from `sitemap.xml`).
  - Protect via `OWNER_PRICE_KEY` in `.env` — accept a bookmarkable query param (`/owner/prices?key=SECRET`) OR a clean PIN/key prompt on the page, always validated server-side before allowing updates.
- **Functionality:**
  - Lists every row in `service_pricing` with editable fields for `display_price` (e.g., `From $2,499 + HST`), optional `compare_at_price` (e.g., `$3,000+`), optional `price_cad` number (used for JSON-LD schema and ad conversion values), and an `is_active` toggle.
  - Includes a clean 3-option switch for `site_settings.active_promo`: `black_friday` | `winter` | `none`.
  - **Vercel Instant Cache Refresh:** Saving calls `POST /api/owner/pricing` (authenticated with `OWNER_PRICE_KEY`, writing via `SUPABASE_SERVICE_ROLE_KEY`) and immediately triggers **`revalidatePath('/', 'layout')`** so static/ISR landing pages update globally across Vercel in under a second with zero speed penalty.

---

### 3. Funnel Routes (3 Public Routes + Dynamic Promo Banner)
- **Dynamic Promo Banner (driven by `site_settings.active_promo`):**
  - `black_friday` *(seeded active)*: Slim, high-contrast urgency bar: *"Black Friday Week (First 10 Bookings): Full Front PPF + Ceramic From $2,499 + HST (Save $500–$600) — or Free $150 Ozone Treatment with Winter Interior Reset."*
  - `winter`: Focus on Ontario road salt protection, QEW/403 gravel rock-chip defense, and heated indoor bay detailing.
  - `none`: Hidden cleanly.
1. **`/winter-interior` (Mid-Ticket Paid-Ad Landing Page — $279 to $499):**
   - Zero distracting nav links (Logo + `5.0 ★ · 44 Reviews` badge + `Call (905) 519-6290` button only).
   - Above-the-fold hero targeting winter salt-crusted carpets, coffee/kid stains, stale odours, and lease returns across Burlington, Hamilton, Oakville & Milton.
   - Live DB-driven cards for **Interior Deep Clean ($279 + HST)**, **Silver Deep Clean ($399 + HST)**, and **Gold Correct & Protect ($499 + HST)** with same-day turnaround clarity (3–5 hrs in a heated indoor studio).
   - Subtle in-page upsell strip highlighting **All-Around Window Tint ($349 + HST)** and **Full Front PPF + Ceramic (From $2,499 + HST — Save $500–$600)**.
2. **`/ppf-ceramic` (High-Ticket Paid-Ad Landing Page — $349 to $2,499+):**
   - Zero distracting nav links.
   - Above-the-fold hero anchored around the flagship **Full Front PPF + Ceramic Winter Shield Bundle (From $2,499 + HST — Reg. $3,000+, Save $500–$600)** for new vehicles, EVs/Teslas, luxury cars, and trucks facing QEW/403 rock chips and Ontario road salt.
   - Live DB-driven cards for **Full Front PPF + Ceramic Bundle (From $2,499 + HST)** with strikethrough `$3,000+` value anchor, **Full Front End PPF (From $1,799 + HST)**, **All-Around Window Tinting ($349 + HST)**, **5-Year Ceramic ($1,099 + HST)**, **Lifetime 12-Yr Ceramic ($1,299 + HST)**, and **Paint Correction ($400/step)**, highlighting paint-thickness gauge readings and 1–2 day heated bay curing.
   - Short **B2B / Fleet & Post-Collision Fresh-Paint** callout (noting Silverback's bay inside Global Auto Center directly beside Global Tech Collision).
3. **`/` (Clean Funnel Selector):**
   - Ultra-fast split entry letting visitors choose **"Winter Interior & Full Detail (From $279)"** or **"PPF, Ceramic & Window Tint (From $349)"** directly, plus the 3-tap quote widget.

---

### 4. Conversion UX (Shared Across All Public Routes)
- **Mobile-Only Sticky Bottom Bar (`md:hidden`):**
  - Fixed dual-action bar at the bottom of mobile viewports: **`Call Now`** (`tel:+19055196290`) on the left + **`WhatsApp Quote`** on the right. Hidden on desktop (`hidden md:flex`), where the clean top sticky bar + floating WhatsApp CTA take over.
- **Ultra-Fast 3-Tap Quote Widget (Capture First → Open WhatsApp Immediately):**
  - **Step 1 (Tap service chip — preselected based on current route, pulling live DB prices):** `PPF + Ceramic ($2,499+)` | `Full Front PPF ($1,799+)` | `Window Tint ($349)` | `Interior Deep Clean ($279)` | `Silver Detail ($399)` | `Gold Polish ($499)` | `Ceramic Coating ($1,099+)` | `Fleet / B2B`
  - **Step 2 (2 quick inputs):** `Vehicle (e.g., 2024 BMW X5)` + `Phone Number`
  - **Step 3 (Submit):**
    1. Generates a unique `event_id` (UUID).
    2. Fires client tracking (`src/lib/tracking.ts`) + posts to `/api/lead` (saves to Supabase `leads`, logs `form_submit` in `site_events`, and optionally sends server-side Meta CAPI).
    3. Immediately opens `https://wa.me/19055196290?text=...` with a clean pre-filled message containing the selected service, vehicle, and phone.
    4. **Fail-Safe Rule:** Even if `/api/lead` fails or times out, WhatsApp MUST still open immediately so zero leads are ever lost.
- **High-Trust Proof Modules:**
  - Interactive **Before/After Comparison Slider** (Interior salt/stains, Swirl removal, Ceramic gloss).
  - **5.0 ★ (44 Google Reviews)** showcase cards linking directly to Silverback's Google Business Profile.
  - **Turnaround & Process Clarity Strip** (*Interior Resets & Tint: Same-day 2–5 hrs | PPF & Ceramic: 1–2 days indoor cure*, Cash/Credit/Interac e-Transfer, CAD + HST confirmed upfront).
  - Clean **FAQ Accordion** answering sizing, turnaround, heated bay winter curing, tint coverage (excl. windshield), and payment questions.

---

### 5. Tekmadev Proof-of-ROI Database (`supabase/schema.sql`)
Provide **one clean, idempotent `supabase/schema.sql`** ready to paste into the Supabase SQL Editor containing:
1. **`service_pricing` table:** `slug` (text PK), `name` (text), `category` (text), `price_cad` (numeric nullable), `display_price` (text not null), `compare_at_price` (text nullable), `badge` (text nullable), `short_desc` (text), `sort_order` (int), `is_active` (boolean default true), `updated_at` (timestamptz default now()) + `INSERT ... ON CONFLICT (slug) DO NOTHING` seed rows for all 13 services above.
2. **`site_settings` table:** `key` (text PK), `value` (text not null), `updated_at` (timestamptz default now()) + seed row `('active_promo', 'black_friday')` using `ON CONFLICT DO NOTHING`.
3. **`site_events` table:** `id` (uuid PK default `gen_random_uuid()`), `created_at` (timestamptz default now()), `session_id` (text), `event_type` (text check in `('page_view','call_click','whatsapp_direct_click','directions_click','form_submit')`), `page_path` (text), `button_location` (text), `device_type` (text), `gclid` (text), `fbclid` (text), `utm_source` (text), `utm_medium` (text), `utm_campaign` (text), `utm_term` (text), `referrer` (text).
4. **`leads` table:** `id` (uuid PK default `gen_random_uuid()`), `created_at` (timestamptz default now()), `session_id` (text), `event_id` (text), `service_selected` (text), `estimated_value_cad` (numeric nullable), `vehicle` (text), `phone` (text), `page_path` (text), `device_type` (text), `gclid` (text), `fbclid` (text), `utm_source` (text), `utm_medium` (text), `utm_campaign` (text), `status` (text default `'new'`), `closed_value_cad` (numeric nullable).
5. **`agency_roi_summary` SQL View:** Groups by `date` (America/Toronto timezone) and derived `traffic_source` (`Google Ads` if `gclid` is not null, `Meta Ads` if `fbclid` is not null, else `COALESCE(NULLIF(utm_source, ''), 'Organic/Direct')`), outputting `page_views`, `call_clicks`, `whatsapp_clicks`, `directions_clicks`, and `form_leads`.
6. **Strict RLS Policies:** Enable RLS on all 4 tables. Allow public `SELECT` ONLY on `service_pricing` and `site_settings`. Keep `site_events` and `leads` completely locked down from anonymous access (all writes handled server-side via `SUPABASE_SERVICE_ROLE_KEY` in `/api/track` and `/api/lead`).
7. **Attribution & Non-Blocking Tracking:** On landing, store `gclid`, `fbclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `referrer`, and a generated `session_id` in `sessionStorage`. Send click events via `navigator.sendBeacon('/api/track', ...)` with a `fetch(..., { keepalive: true })` fallback so Call/WhatsApp taps are instantaneous.

---

### 6. Airtight Google Ads & Meta Ads Tracking Architecture
- **Centralized Helper (`src/lib/tracking.ts`):** Every high-intent action fires across **Supabase + GTM `dataLayer` + Meta Pixel** simultaneously:
  1. **Quote Form Submit:** Push `{ event: 'whatsapp_lead', event_id, service, value_cad, currency: 'CAD', user_data: { phone_number: '+1...' } }` (E.164 formatted for **Google Ads Enhanced Conversions**) + `fbq('track', 'Lead', { content_name: service, value: value_cad, currency: 'CAD' }, { eventID: event_id })`.
  2. **Call Button Clicks (Header, Hero, Mobile Sticky Bar):** Push `{ event: 'phone_call_click', button_location }` to `dataLayer` + `fbq('track', 'Contact', { content_name: 'phone_call' })` + log `call_click` to `/api/track`.
  3. **Direct WhatsApp Clicks (Mobile Sticky Bar / Floating Button):** Push `{ event: 'whatsapp_direct_click', button_location }` to `dataLayer` + `fbq('track', 'Contact', { content_name: 'whatsapp_direct' })` + log `whatsapp_direct_click` to `/api/track`.
  4. **Directions / Map Clicks:** Push `{ event: 'directions_click' }` to `dataLayer` + log `directions_click` to `/api/track`.
- **Optional Server-Side Meta Conversions API (CAPI) inside `/api/lead`:**
  - If `META_CAPI_ACCESS_TOKEN` and `NEXT_PUBLIC_META_PIXEL_ID` are set in env, send a non-blocking server-side `Lead` event to the Meta Graph API using the exact same `event_id` (automatic Meta deduplication), SHA-256 hashed E.164 phone number, `_fbc` and `_fbp` cookies (if present), client IP, and User-Agent. Skip cleanly with zero errors if the token is omitted.
- **GTM + Optional Direct `gtag` + Meta Pixel Scripts:**
  - Load GTM (`NEXT_PUBLIC_GTM_ID`), optional direct Google Ads `gtag` (`NEXT_PUBLIC_GOOGLE_ADS_ID`), and Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`) cleanly via `next/script` (`afterInteractive`) only when their respective env vars are provided.
- **Zero-Code Domain Verification (`app/layout.tsx`):**
  - Wire optional `NEXT_PUBLIC_META_DOMAIN_VERIFICATION` (`facebook-domain-verification` meta tag) and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` into Next.js `metadata.verification`.

---

### 7. Lighthouse 98+/100, Security Headers & SEO/AEO/GEO
- **Lighthouse Targets:** Performance **98+**, Accessibility **100**, Best Practices **100**, SEO **100**, Agentic Browsing **3/3**.
- **Performance & Accessibility Engineering:**
  - ISR (`export const revalidate = 3600`) paired with on-demand `revalidatePath('/', 'layout')`.
  - `next/image` everywhere with explicit `width`/`height`, WebP/AVIF, and `priority` + `fetchPriority="high"` strictly on the hero LCP image.
  - `next/font/google` with `display: 'swap'`.
  - Well-formed Accessibility Tree: single `<main>` landmark, `<header>`, `<nav>`, `<footer>`, strictly sequential headings (`h1` → `h2` → `h3`), valid `<ul>`/`<li>`, explicit `aria-label` on all icon buttons/links, zero focusable elements inside `aria-hidden="true"`, WCAG AA+ contrast (dark scrim behind hero text), zero console errors or deprecated APIs.
- **Ad-Safe Security Headers (`next.config.ts`):**
  - Configure `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a `Content-Security-Policy` that explicitly allows `script-src`, `connect-src`, and `img-src` for `*.googletagmanager.com`, `*.google-analytics.com`, `*.googleadservices.com`, `*.doubleclick.net`, `www.google.com`, `www.google.ca`, `connect.facebook.net`, `www.facebook.com`, and `*.supabase.co` so security headers NEVER block Google Ads or Meta Pixel pings.
- **SEO, AEO & GEO (25 km Radius):**
  - Unique `<title>` and `<meta name="description">` on every public route.
  - Inject JSON-LD Schema: `AutomotiveBusiness` (1254 Plains Rd E, Unit 14, Burlington, ON L7S 1W6, geo-coordinates, `AggregateRating` = `5.0` / `44` reviews, `areaServed` explicitly listing **Burlington, Hamilton, Oakville, Milton, Waterdown, Dundas, Ancaster, and Stoney Creek**), live DB-fed `OfferCatalog`, and `FAQPage`.
  - Generate `/public/llms.txt`, `/sitemap.xml` (excluding `/owner`), and `/robots.txt` (`Disallow: /owner`).

---

### 8. Final Verification & Deliverables
1. Run `npm run build` and verify zero TypeScript, ESLint, or Next.js build errors (must succeed cleanly even with empty env vars via `pricing-fallback.ts`).
2. Deliver `supabase/schema.sql` ready to execute manually in the Supabase SQL Editor.
3. Deliver `.env.example` containing all 10 variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OWNER_PRICE_KEY`
   - `NEXT_PUBLIC_GTM_ID`
   - `NEXT_PUBLIC_GOOGLE_ADS_ID`
   - `NEXT_PUBLIC_META_PIXEL_ID`
   - `META_CAPI_ACCESS_TOKEN`
   - `NEXT_PUBLIC_META_DOMAIN_VERIFICATION`
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`