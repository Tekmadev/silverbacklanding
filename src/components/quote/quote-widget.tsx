"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { SELECT_SERVICE_EVENT, type SelectServiceDetail } from "@/config/quote";
import { SITE, TEL_HREF, whatsappHref } from "@/config/site";
import { uuid } from "@/lib/attribution";
import { toE164 } from "@/lib/phone";
import { trackLead } from "@/lib/tracking";
import { buildQuoteMessage } from "@/lib/whatsapp-message";
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from "../icons";
import { TrackedLink } from "../tracked-link";

export interface QuoteOption {
  slug: string;
  /** Short chip label, e.g. "PPF + Ceramic" */
  label: string;
  /** Full service name for WhatsApp + tracking */
  name: string;
  /** Chip price suffix, e.g. "$2,499+" (null for Fleet/B2B) */
  priceText: string | null;
  /** Full display price for the WhatsApp message, e.g. "From $2,499 + HST" */
  displayPrice: string | null;
  valueCad: number | null;
}

interface QuoteWidgetProps {
  /** Default chip list (step 1). */
  chips: QuoteOption[];
  /** Every other active service, so "Get this quote" buttons can preselect anything. */
  extras: QuoteOption[];
  defaultSlug?: string;
  headingLevel?: "h2" | "h3";
}

type Errors = Partial<Record<"service" | "vehicle" | "phone", string>>;

/** Sum of the known prices, or null when none of the picked services has a fixed price. */
function totalValue(options: QuoteOption[]): number | null {
  const prices = options.map((o) => o.valueCad).filter((v): v is number => v !== null);
  return prices.length ? prices.reduce((a, b) => a + b, 0) : null;
}

export function QuoteWidget({ chips, extras, defaultSlug, headingLevel = "h2" }: QuoteWidgetProps) {
  const Heading = headingLevel;
  const formId = useId();
  const vehicleRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const chipGroupRef = useRef<HTMLFieldSetElement>(null);

  const [selected, setSelected] = useState<string[]>(defaultSlug ? [defaultSlug] : []);
  // False until the visitor changes the selection themselves. Until then the page's
  // pre-ticked default is only a suggestion, and a "Get this price" tap replaces it.
  const touchedRef = useRef(false);
  // Non-chip services stay visible once shown, so unticking one never removes its checkbox.
  const [revealed, setRevealed] = useState<string[]>(defaultSlug ? [defaultSlug] : []);
  const [vehicle, setVehicle] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const allOptions = [...chips, ...extras];
  // Keep the order they appear on screen so the WhatsApp message reads naturally.
  const selectedOptions = allOptions.filter((o) => selected.includes(o.slug));
  // Services shown via a "Get this quote" button that aren't default chips show up first.
  const shownExtras = extras.filter((o) => revealed.includes(o.slug));
  const visibleChips = [...shownExtras, ...chips];

  function toggle(slug: string) {
    touchedRef.current = true;
    setSelected((current) => (current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]));
    setErrors((e) => ({ ...e, service: undefined }));
  }

  useEffect(() => {
    function onSelect(event: Event) {
      const detail = (event as CustomEvent<SelectServiceDetail | string>).detail;
      const { slug, add } = typeof detail === "string" ? { slug: detail, add: false } : detail;
      if (!slug || !allOptionsHas(slug)) return;
      const replaceDefault = !touchedRef.current && !add;
      touchedRef.current = true;
      // First tap replaces the untouched default; later taps (and upsells) add to it.
      setSelected((current) => (replaceDefault ? [slug] : current.includes(slug) ? current : [...current, slug]));
      setRevealed((current) => (current.includes(slug) ? current : [...current, slug]));
      setSentUrl(null);
      setErrors((e) => ({ ...e, service: undefined }));
      window.setTimeout(() => vehicleRef.current?.focus({ preventScroll: true }), 450);
    }
    function allOptionsHas(slug: string) {
      return chips.some((c) => c.slug === slug) || extras.some((c) => c.slug === slug);
    }
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, [chips, extras]);

  function validate(): { errors: Errors; phoneE164: string | null } {
    const next: Errors = {};
    if (!selectedOptions.length) next.service = "Tap at least one service you want priced.";
    if (vehicle.trim().length < 2) next.vehicle = "Add your vehicle, e.g. 2024 BMW X5.";
    const phoneE164 = toE164(phone);
    if (!phoneE164) next.phone = "Enter a 10-digit phone number, e.g. 905-555-0123.";
    return { errors: next, phoneE164 };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { errors: found, phoneE164 } = validate();
    setErrors(found);

    if (!selectedOptions.length || !phoneE164 || Object.keys(found).length) {
      if (found.service) chipGroupRef.current?.querySelector<HTMLInputElement>("input")?.focus();
      else if (found.vehicle) vehicleRef.current?.focus();
      else if (found.phone) phoneRef.current?.focus();
      return;
    }

    const honeypot = (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value;
    const eventId = uuid();
    const cleanVehicle = vehicle.trim().slice(0, 80);
    const url = whatsappHref(
      buildQuoteMessage({
        services: selectedOptions.map((o) => ({ name: o.name, displayPrice: o.displayPrice })),
        vehicle: cleanVehicle,
        phoneE164,
        eventId,
      }),
    );

    // 1–2. Tag + log the lead (fire-and-forget, keepalive).
    trackLead({
      eventId,
      serviceSlugs: selectedOptions.map((o) => o.slug),
      serviceName: selectedOptions.map((o) => o.name).join(" + "),
      valueCad: totalValue(selectedOptions),
      vehicle: cleanVehicle,
      phoneE164,
      website: honeypot,
    });

    // 3–4. Open WhatsApp immediately. It never waits on /api/lead, so no lead is lost.
    setSentUrl(url);
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch) {
      window.location.assign(url);
    } else {
      const popup = window.open(url, "_blank");
      if (!popup) window.location.assign(url);
    }
  }

  const err = (field: keyof Errors) => (errors[field] ? `${formId}-${field}-error` : undefined);

  return (
    <div className="rounded-3xl border border-line bg-onyx p-5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-7">
      <Heading className="display text-[2rem] text-paper md:text-[2.4rem]">Your price in 3 taps</Heading>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        Upfront CAD + HST pricing. Your quote opens in WhatsApp. No forms to wait on.
      </p>

      {sentUrl ? (
        <div className="mt-6 space-y-4" role="status" aria-live="polite">
          <p className="flex items-start gap-2.5 text-base font-semibold text-paper">
            <CheckIcon className="mt-0.5 shrink-0 text-whatsapp" />
            Opening WhatsApp with your details…
          </p>
          <p className="text-sm text-mist">
            Didn&apos;t open? Tap below, or call us directly.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="btn bg-whatsapp text-ink hover:bg-whatsapp-dark">
              <WhatsAppIcon /> Open WhatsApp
            </a>
            <TrackedLink kind="call" location="quote_success" href={TEL_HREF} className="btn border border-steel text-paper hover:border-paper">
              Call {SITE.phoneDisplay}
            </TrackedLink>
          </div>
          <button
            type="button"
            onClick={() => setSentUrl(null)}
            className="min-h-11 text-sm font-medium text-mist underline underline-offset-4 hover:text-paper"
          >
            Change my services
          </button>
        </div>
      ) : (
        // method/action = no-JS & pre-hydration fallback: /api/lead saves the lead and
        // 303-redirects to WhatsApp, so a tap before React loads still converts.
        <form
          noValidate
          method="post"
          action="/api/lead"
          onSubmit={handleSubmit}
          className="mt-6 space-y-6"
          aria-label="Quick quote"
        >
          <fieldset
            ref={chipGroupRef}
            aria-describedby={err("service")}
            aria-invalid={errors.service ? true : undefined}
          >
            <legend className="eyebrow mb-3 flex items-center gap-2 text-silver">
              <span className="flex size-6 items-center justify-center rounded-full bg-paper text-[0.7rem] text-ink">1</span>
              Pick your services
            </legend>
            <p className="-mt-1 mb-3 text-sm text-mist" aria-live="polite">
              {selected.length > 1 ? `${selected.length} selected. Add as many as you like.` : "Choose one or more."}
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleChips.map((option) => {
                const checked = selected.includes(option.slug);
                return (
                  <label
                    key={option.slug}
                    className={`relative inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-paper ${
                      checked
                        ? "border-paper bg-paper text-ink"
                        : "border-steel bg-transparent text-silver hover:border-mist hover:text-paper"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="service"
                      value={option.slug}
                      checked={checked}
                      onChange={() => toggle(option.slug)}
                      className="sr-only"
                    />
                    {checked && <CheckIcon width={14} height={14} className="mr-1.5 shrink-0" aria-hidden="true" />}
                    {option.label}
                    {option.priceText && (
                      <span className={`tabular ml-1.5 ${checked ? "text-slate" : "text-mist"}`}>({option.priceText})</span>
                    )}
                  </label>
                );
              })}
            </div>
            {errors.service && (
              <p id={err("service")} className="mt-2 text-sm text-danger" role="alert">
                {errors.service}
              </p>
            )}
          </fieldset>

          <div>
            <p className="eyebrow mb-3 flex items-center gap-2 text-silver" aria-hidden="true">
              <span className="flex size-6 items-center justify-center rounded-full bg-paper text-[0.7rem] text-ink">2</span>
              Your vehicle &amp; number
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${formId}-vehicle`} className="mb-1.5 block text-sm font-medium text-silver">
                  Vehicle
                </label>
                <input
                  ref={vehicleRef}
                  id={`${formId}-vehicle`}
                  name="vehicle"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="e.g. 2024 BMW X5"
                  maxLength={80}
                  required
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  aria-invalid={errors.vehicle ? true : undefined}
                  aria-describedby={err("vehicle")}
                  className="h-12 w-full rounded-xl border border-steel bg-obsidian px-4 text-base text-paper placeholder:text-mist focus:border-paper focus:outline-none"
                />
                {errors.vehicle && (
                  <p id={err("vehicle")} className="mt-1.5 text-sm text-danger" role="alert">
                    {errors.vehicle}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={`${formId}-phone`} className="mb-1.5 block text-sm font-medium text-silver">
                  Phone number
                </label>
                <input
                  ref={phoneRef}
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="(905) 555-0123"
                  maxLength={20}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={err("phone")}
                  className="tabular h-12 w-full rounded-xl border border-steel bg-obsidian px-4 text-base text-paper placeholder:text-mist focus:border-paper focus:outline-none"
                />
                {errors.phone && (
                  <p id={err("phone")} className="mt-1.5 text-sm text-danger" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Honeypot: humans never see or fill this. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

          <div>
            <button type="submit" className="btn min-h-14 w-full bg-whatsapp text-base text-ink hover:bg-whatsapp-dark">
              <span className="flex size-6 items-center justify-center rounded-full bg-ink text-[0.7rem] text-paper" aria-hidden="true">
                3
              </span>
              Get my price on WhatsApp
              <ArrowRightIcon width={18} height={18} />
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-mist">
              We only use your number to send your quote. No spam, ever.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
