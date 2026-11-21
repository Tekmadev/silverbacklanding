import type { ServicePricing } from "@/lib/types";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "./icons";
import { QuoteButton } from "./quote/quote-button";

export function ServiceCard({
  service,
  turnaround,
  featured = false,
  points,
}: {
  service: ServicePricing;
  turnaround?: string;
  featured?: boolean;
  points?: string[];
}) {
  return (
    <li
      className={`flex flex-col rounded-3xl border p-6 md:p-7 ${
        featured ? "border-paper bg-graphite" : "border-line bg-onyx"
      }`}
    >
      <div className="flex min-h-7 flex-wrap items-center gap-2">
        {service.badge && (
          <span className="eyebrow rounded-full bg-paper px-2.5 py-1 text-[0.6875rem] text-ink">{service.badge}</span>
        )}
      </div>
      <h3 className="display mt-4 text-[1.9rem] text-paper md:text-[2.2rem]">{service.name}</h3>
      <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="tabular text-2xl font-bold text-paper md:text-[1.7rem]">{service.display_price}</span>
        {service.compare_at_price && (
          <span className="tabular text-base text-mist">
            <span className="sr-only">Regular value </span>
            <s>{service.compare_at_price}</s>
          </span>
        )}
      </p>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-mist">{service.short_desc}</p>
      {points && points.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-silver">
          {points.map((point) => (
            <li key={point} className="flex gap-2">
              <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-paper" />
              {point}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-6">
        {turnaround && (
          <p className="mb-4 flex items-center gap-2 text-sm text-silver">
            <ClockIcon width={16} height={16} className="text-paper" />
            {turnaround}
          </p>
        )}
        <QuoteButton
          slug={service.slug}
          className={`btn w-full ${featured ? "bg-paper text-ink hover:bg-silver" : "border border-steel text-paper hover:border-paper"}`}
        >
          Get this price
          <span className="sr-only"> for {service.name}</span>
          <ArrowRightIcon width={18} height={18} />
        </QuoteButton>
      </div>
    </li>
  );
}
