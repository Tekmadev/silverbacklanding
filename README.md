# Silverback Auto Detailing: Paid-Ad Funnel

`book.silverbackdetail.com` · Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind v4 · Supabase · Vercel

| Route | Purpose |
| --- | --- |
| `/` | Funnel selector: Winter Interior vs. PPF/Ceramic/Tint, plus the 3-tap quote widget |
| `/winter-interior` | Mid-ticket ad landing page ($279–$499) |
| `/ppf-ceramic` | High-ticket ad landing page ($349–$2,499+) |
| `/owner/prices?key=…` | Private price & promo editor (noindex, key-checked server-side) |
| `/api/lead` · `/api/track` · `/api/owner/pricing` | Lead capture, click beacons, owner saves |
| `/llms.txt` · `/sitemap.xml` · `/robots.txt` | AEO/SEO (llms.txt is generated from live prices) |

## 1. Database (once)

Supabase → SQL Editor → paste **`supabase/schema.sql`** → Run.
It is idempotent: re-running never overwrites prices the owner has edited.

## 2. Environment

```bash
cp .env.example .env.local
```

Fill the same 10 keys in Vercel → Project → Settings → Environment Variables.
Every key is optional for `npm run build`: without Supabase the site serves
`src/config/pricing-fallback.ts`, and any tracking tag without an ID is skipped.

Generate the owner key with `openssl rand -hex 24`, then bookmark
`https://book.silverbackdetail.com/owner/prices?key=<OWNER_PRICE_KEY>` on the owner's phone.

## 3. Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Domain

Vercel → Domains → add `book.silverbackdetail.com`, then add the CNAME it shows
(`cname.vercel-dns.com`) at the DNS host of silverbackdetail.com. The WordPress site is untouched.

## GTM triggers (Custom Event names)

| dataLayer `event` | Fired on | Extra keys |
| --- | --- | --- |
| `whatsapp_lead` | Quote widget submit | `event_id`, `service`, `value_cad`, `currency`, `user_data.phone_number` (E.164, for Enhanced Conversions) |
| `phone_call_click` | Any Call button | `button_location` |
| `whatsapp_direct_click` | Sticky bar / floating / CTA WhatsApp | `button_location` |
| `directions_click` | Footer address | `button_location` |

Meta Pixel fires `Lead` (with `eventID` = `event_id`) and `Contact`. When `META_CAPI_ACCESS_TOKEN`
is set, `/api/lead` also sends a server-side `Lead` with the same `event_id`, so Meta deduplicates it.

## Owner content (no code changes needed beyond these files)

- **Logo:** put the file in `public/images/` and set `LOGO` in `src/config/media.ts`.
- **Before/after slider:** add real same-angle photo pairs to `BEFORE_AFTER_SETS`. The section stays hidden until then.
- **Review quotes:** paste verbatim Google reviews into `REVIEWS`. Until then the 5.0★ / 44 aggregate cards show.
- **Google review link:** replace `googleReviewsUrl` in `src/config/site.ts` with the exact GBP share link.

## Implementation notes

- **ISR:** with Cache Components enabled, `export const revalidate` is not allowed, so pricing uses
  `'use cache'` + `cacheLife('hours')` (1 h) + `cacheTag('pricing')`. Saving in the owner editor calls
  `revalidateTag('pricing', { expire: 0 })` and `revalidatePath('/', 'layout')`.
- **Quote fail-safe:** WhatsApp opens immediately on submit and never waits for `/api/lead`. If the visitor
  taps before JavaScript loads, the form POSTs to `/api/lead`, which saves the lead and 303-redirects to WhatsApp.
- **Hero images** are AI-generated abstract macro shots (water beading, leather), not customer vehicles.
  They load on desktop only; phones get a solid obsidian hero so the headline is the LCP element.
- **Fonts:** Barlow Condensed 800 for display; native system UI stack for body copy (zero font download).
