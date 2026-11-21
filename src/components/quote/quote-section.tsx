import { FLEET_SLUG, QUOTE_CHIPS } from "@/config/quote";
import { findService, formatCad } from "@/lib/pricing-utils";
import type { ServicePricing } from "@/lib/types";
import { QuoteWidget, type QuoteOption } from "./quote-widget";

function toOption(service: ServicePricing, label: string, plus: boolean): QuoteOption {
  return {
    slug: service.slug,
    label,
    name: service.name,
    priceText: service.price_cad !== null ? `${formatCad(service.price_cad)}${plus ? "+" : ""}` : null,
    displayPrice: service.display_price,
    valueCad: service.price_cad,
  };
}

/** Builds live-priced quote options on the server; the client widget stays tiny. */
export function QuoteForm({
  services,
  defaultSlug,
  headingLevel,
}: {
  services: ServicePricing[];
  defaultSlug?: string;
  headingLevel?: "h2" | "h3";
}) {
  const chips: QuoteOption[] = [];
  for (const chip of QUOTE_CHIPS) {
    if (chip.slug === FLEET_SLUG) {
      chips.push({
        slug: FLEET_SLUG,
        label: chip.label,
        name: "Fleet / B2B",
        priceText: null,
        displayPrice: null,
        valueCad: null,
      });
      continue;
    }
    const service = findService(services, chip.slug);
    if (service?.is_active) chips.push(toOption(service, chip.label, Boolean(chip.plus)));
  }

  const chipSlugs = new Set(chips.map((c) => c.slug));
  const extras = services
    .filter((s) => s.is_active && !chipSlugs.has(s.slug))
    .map((s) => toOption(s, s.name, s.display_price.toLowerCase().startsWith("from")));

  const validDefault = defaultSlug && (chipSlugs.has(defaultSlug) || extras.some((e) => e.slug === defaultSlug))
    ? defaultSlug
    : undefined;

  return <QuoteWidget chips={chips} extras={extras} defaultSlug={validDefault} headingLevel={headingLevel} />;
}
