import { findService } from "@/lib/pricing-utils";
import type { PromoKey, ServicePricing } from "@/lib/types";

/** Slim urgency bar driven by `site_settings.active_promo`. Renders nothing for "none". */
export function PromoBanner({ promo, services }: { promo: PromoKey; services: ServicePricing[] }) {
  if (promo === "none") return null;

  let message: string;
  if (promo === "black_friday") {
    const bundle = findService(services, "ppf_ceramic_bundle");
    const ozone = findService(services, "ozone_treatment");
    const bundlePrice = bundle?.display_price ?? "From $2,499 + HST";
    const saving = bundle?.badge ? ` (${bundle.badge})` : "";
    const ozoneValue = ozone?.price_cad ? `$${ozone.price_cad}` : "$150";
    message = `Black Friday Week (First 10 Bookings): Full Front PPF + Ceramic ${bundlePrice}${saving}, or Free ${ozoneValue} Ozone Treatment with Winter Interior Reset.`;
  } else {
    message =
      "Winter Shield Season: beat Ontario road salt & QEW/403 rock chips. Detailed, coated and cured in our heated indoor bay.";
  }

  return (
    <div className="border-b border-line bg-obsidian text-paper">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-[0.8125rem] leading-snug font-medium md:text-sm">
        <span>{message}</span>
        <a
          href="#quote"
          className="inline-flex min-h-6 items-center font-semibold text-paper underline decoration-mist underline-offset-4 hover:decoration-paper"
        >
          Claim it&nbsp;→
        </a>
      </p>
    </div>
  );
}
