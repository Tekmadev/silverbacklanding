-- =============================================================================
-- Silverback Auto Detailing: book.silverbackdetail.com
-- Tekmadev Proof-of-ROI database
--
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Idempotent: safe to run again; it never overwrites prices the owner has edited.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- updated_at helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. service_pricing: live display prices (public read, service-role write)
-- -----------------------------------------------------------------------------
create table if not exists public.service_pricing (
  slug             text primary key,
  name             text not null,
  category         text not null,
  price_cad        numeric,
  display_price    text not null,
  compare_at_price text,
  badge            text,
  short_desc       text not null default '',
  sort_order       int  not null default 0,
  is_active        boolean not null default true,
  updated_at       timestamptz not null default now()
);

drop trigger if exists service_pricing_set_updated_at on public.service_pricing;
create trigger service_pricing_set_updated_at
  before update on public.service_pricing
  for each row execute function public.set_updated_at();

insert into public.service_pricing
  (slug, name, category, price_cad, display_price, compare_at_price, badge, short_desc, sort_order)
values
  ('ppf_ceramic_bundle', 'Full Front PPF + Ceramic Winter Shield Bundle', 'protection', 2499, 'From $2,499 + HST', '$3,000+', 'Save $500–$600',
   'Full front-end rock-chip PPF paired with ceramic paint protection. Our flagship winter shield.', 10),
  ('ppf_full_front', 'Full Front End PPF', 'protection', 1799, 'From $1,799 + HST', null, null,
   'Full hood, full fenders, front bumper, mirrors & headlights protected against QEW/403 gravel & road salt.', 20),
  ('window_tint', 'All-Around Window Tinting', 'protection', 349, '$349 + HST', null, 'Popular Add-On',
   'Full side & rear windows (excluding windshield), standalone or bundled with PPF/Ceramic.', 30),
  ('ceramic_5yr', '5-Year Ceramic Coating', 'protection', 1099, '$1,099 + HST', null, null,
   'Hydrophobic weather & UV shield. Decontamination, clay bar & panel prep included.', 40),
  ('ceramic_lifetime', 'Lifetime (12-Yr) Ceramic Coating', 'protection', 1299, '$1,299 + HST', null, null,
   'Our thickest 12-year rated professional shield. Multi-stage correction recommended prior.', 50),
  ('paint_correction', 'Paint Correction', 'protection', 400, '$400 / step', null, null,
   'Paint thickness gauge measured, wet sanding, heavy cut & refining polish.', 60),
  ('interior_deep_clean', 'Interior Deep Clean', 'interior', 279, '$279 + HST', null, 'Winter Favorite',
   'Steam shampoo, hot-water stain & salt extraction, leather & fabric care.', 70),
  ('silver_deep_clean', 'Silver Deep Clean', 'packages', 399, '$399 + HST', null, 'Most Complete',
   'Full interior reset, trunk, deep vents & crevices, stain removal, door jambs/sills + 2-bucket hand wash (sedan/crossover).', 80),
  ('gold_correct_protect', 'Gold Correct & Protect', 'packages', 499, '$499 + HST', null, null,
   'Everything in Silver + 1-step machine polish for swirls/haze, ceramic seal & engine bay detail.', 90),
  ('bronze_maintenance', 'Bronze Maintenance', 'packages', 150, '$150 + HST', null, null,
   'Interior vacuum, dash/console wipe, 2-bucket hand wash, wheels/tires & glass.', 100),
  ('ozone_treatment', 'Ozone Odour Treatment', 'addons', 150, '$150 + HST', null, null,
   'Complete interior odour & bacteria elimination.', 110),
  ('clay_bar', 'Clay Bar Decontamination', 'addons', 150, '$150 + HST', null, null,
   '2-bucket hand wash, deep rim/wheel-well clean, iron remover & clay bar.', 120),
  ('interior_refresh', 'Interior Refresh', 'addons', 99, '$99 + HST', null, null,
   'Vacuum, dash/console/door wipe down & interior glass.', 130)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- 2. site_settings: key/value switches (active_promo: black_friday | winter | none)
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (key, value)
values ('active_promo', 'black_friday')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- 3. site_events: page views and high-intent clicks (server-side writes only)
-- -----------------------------------------------------------------------------
create table if not exists public.site_events (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  session_id      text,
  event_type      text not null
                  check (event_type in ('page_view','call_click','whatsapp_direct_click','directions_click','form_submit')),
  page_path       text,
  button_location text,
  device_type     text,
  gclid           text,
  fbclid          text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,
  referrer        text
);

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_event_type_idx on public.site_events (event_type);

-- -----------------------------------------------------------------------------
-- 4. leads: quote widget submissions (server-side writes only)
--    status suggestions: new | contacted | booked | won | lost
-- -----------------------------------------------------------------------------
create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  session_id          text,
  event_id            text,
  service_selected    text,
  estimated_value_cad numeric,
  vehicle             text,
  phone               text,
  page_path           text,
  device_type         text,
  gclid               text,
  fbclid              text,
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  status              text not null default 'new',
  closed_value_cad    numeric
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_event_id_idx on public.leads (event_id);

-- -----------------------------------------------------------------------------
-- 5. agency_roi_summary: daily (America/Toronto) results by traffic source
--    security_invoker = true so the view respects RLS (never readable by anon).
-- -----------------------------------------------------------------------------
create or replace view public.agency_roi_summary
with (security_invoker = true) as
with attributed as (
  select
    (e.created_at at time zone 'America/Toronto')::date as date,
    case
      when nullif(e.gclid, '') is not null then 'Google Ads'
      when nullif(e.fbclid, '') is not null then 'Meta Ads'
      else coalesce(nullif(e.utm_source, ''), 'Organic/Direct')
    end as traffic_source,
    e.event_type,
    0::int      as is_lead,
    null::numeric as estimated_value_cad,
    null::numeric as closed_value_cad
  from public.site_events e
  union all
  select
    (l.created_at at time zone 'America/Toronto')::date,
    case
      when nullif(l.gclid, '') is not null then 'Google Ads'
      when nullif(l.fbclid, '') is not null then 'Meta Ads'
      else coalesce(nullif(l.utm_source, ''), 'Organic/Direct')
    end,
    null,
    1,
    l.estimated_value_cad,
    l.closed_value_cad
  from public.leads l
)
select
  date,
  traffic_source,
  count(*) filter (where event_type = 'page_view')             as page_views,
  count(*) filter (where event_type = 'call_click')            as call_clicks,
  count(*) filter (where event_type = 'whatsapp_direct_click') as whatsapp_clicks,
  count(*) filter (where event_type = 'directions_click')      as directions_clicks,
  coalesce(sum(is_lead), 0)                                    as form_leads,
  coalesce(sum(estimated_value_cad), 0)                        as est_pipeline_value_cad,
  coalesce(sum(closed_value_cad), 0)                           as closed_revenue_cad
from attributed
group by date, traffic_source
order by date desc, traffic_source;

-- -----------------------------------------------------------------------------
-- 6. Row Level Security
--    Public (anon) may only READ service_pricing and site_settings.
--    site_events, leads and the ROI view are locked down; the app writes them
--    server-side with SUPABASE_SERVICE_ROLE_KEY (/api/track, /api/lead).
-- -----------------------------------------------------------------------------
alter table public.service_pricing enable row level security;
alter table public.site_settings   enable row level security;
alter table public.site_events     enable row level security;
alter table public.leads           enable row level security;

drop policy if exists "Public can read service pricing" on public.service_pricing;
create policy "Public can read service pricing"
  on public.service_pricing for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- No policies on site_events / leads = no anon/authenticated access at all.
-- Belt and braces: remove table privileges from the public API roles too.
revoke all on public.site_events        from anon, authenticated;
revoke all on public.leads              from anon, authenticated;
revoke all on public.agency_roi_summary from anon, authenticated;

-- Public roles can read pricing/settings but never write them.
revoke insert, update, delete, truncate on public.service_pricing from anon, authenticated;
revoke insert, update, delete, truncate on public.site_settings   from anon, authenticated;
grant select on public.service_pricing to anon, authenticated;
grant select on public.site_settings   to anon, authenticated;
