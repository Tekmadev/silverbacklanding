import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { ArrowRightIcon, CheckIcon, ShieldIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { QuoteButton } from "@/components/quote/quote-button";
import { QuoteForm } from "@/components/quote/quote-section";
import {
  BeforeAfterSection,
  FaqSection,
  FinalCta,
  ProcessStrip,
  ReviewsSection,
  SectionHeading,
} from "@/components/sections";
import { ServiceCard } from "@/components/service-card";
import { FAQ_CORE, FAQ_INTERIOR } from "@/config/faq";
import { HERO_INTERIOR } from "@/config/media";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getSiteData } from "@/lib/pricing";
import { findService, formatCad, minPrice, pickServices } from "@/lib/pricing-utils";
import { faqSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const { rating, count } = await getGoogleReviews();
  return {
  title: "Winter Interior Deep Clean & Salt Removal in Burlington from $279",
  description:
    `Salt-crusted carpets, coffee & kid stains, stale odours, lease returns. Steam shampoo + hot-water extraction in a heated indoor bay. Same-day, from $279 + HST. ${rating.toFixed(1)}★ (${count} Google reviews).`,
  alternates: { canonical: "/winter-interior" },
  openGraph: {
    title: "Winter Interior Reset from $279 + HST | Silverback Auto Detailing",
    url: "/winter-interior",
    images: [{ url: HERO_INTERIOR.src, width: HERO_INTERIOR.width, height: HERO_INTERIOR.height, alt: HERO_INTERIOR.alt }],
  },
};
}

const PACKAGE_SLUGS = ["interior_deep_clean", "silver_deep_clean", "gold_correct_protect"] as const;
const FAQ = [...FAQ_INTERIOR, ...FAQ_CORE];

const PACKAGE_POINTS: Record<string, string[]> = {
  interior_deep_clean: ["Salt lines lifted from carpets & mats", "Coffee, food & kid stains treated", "Leather & fabric cleaned and conditioned"],
  silver_deep_clean: ["Interior + trunk fully reset", "Vents, crevices, jambs & sills", "2-bucket hand wash outside"],
  gold_correct_protect: ["Everything in Silver", "1-step polish removes swirls & haze", "Ceramic seal + engine bay detail"],
};

export default async function WinterInteriorPage() {
  const { services } = await getSiteData();
  const packages = pickServices(services, PACKAGE_SLUGS);
  const from = minPrice(services, PACKAGE_SLUGS);
  const tint = findService(services, "window_tint");
  const bundle = findService(services, "ppf_ceramic_bundle");
  const ozone = findService(services, "ozone_treatment");

  return (
    <>
      <Hero
        image={HERO_INTERIOR}
        eyebrow="Winter interior reset · Burlington · Hamilton · Oakville · Milton"
        title={
          <>
            Salt-crusted carpets?
            <br /> Reset in one day.
          </>
        }
        lead={
          <p>
            Steam shampoo and hot-water extraction pull out road salt, coffee and kid stains, and stale
            odours. Perfect before a lease return. Done in our heated indoor studio, same-day in 3–5 hours
            {from !== null ? <>, from <strong className="text-paper">{formatCad(from)} + HST</strong></> : null}.
          </p>
        }
        aside={<QuoteForm services={services} defaultSlug="interior_deep_clean" />}
      >
        <ul className="mt-6 grid gap-2 text-[0.9375rem] text-silver sm:grid-cols-2">
          {["Heated indoor bay, no frozen hoses", "Same-day turnaround: 3–5 hours", "Price confirmed before we start", "Leases, family SUVs & work trucks"].map(
            (item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 shrink-0 text-paper" width={18} height={18} />
                {item}
              </li>
            ),
          )}
        </ul>
      </Hero>

      <ProcessStrip />

      <section aria-labelledby="packages-heading" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <SectionHeading
          id="packages-heading"
          eyebrow="Interior packages"
          title="Pick your reset"
          intro="Live studio pricing. Larger SUVs, trucks and 3-row interiors are quoted fairly by size and condition, always before we start."
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {packages.map((service) => (
            <ServiceCard
              key={service.slug}
              service={service}
              featured={service.slug === "silver_deep_clean"}
              points={PACKAGE_POINTS[service.slug]}
              turnaround="Same-day · 3–5 hrs, heated studio"
            />
          ))}
        </ul>
        {ozone?.is_active && (
          <p className="mt-6 text-sm text-mist">
            Stubborn smoke or pet odour? Add an <strong className="text-silver">Ozone Odour Treatment</strong> ({ozone.display_price}).
          </p>
        )}
      </section>

      {(tint?.is_active || bundle?.is_active) && (
        <section aria-labelledby="upsell-heading" className="border-y border-line bg-onyx">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
            <h2 id="upsell-heading" className="eyebrow flex items-center gap-2 text-mist">
              <ShieldIcon width={16} height={16} /> While it&apos;s in the bay
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {tint?.is_active && (
                <li className="flex flex-col justify-between gap-4 rounded-2xl border border-line p-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-paper">{tint.name}</h3>
                    <p className="tabular mt-1 text-sm text-mist">
                      {tint.display_price} · side & rear windows, same-day
                    </p>
                  </div>
                  <QuoteButton slug={tint.slug} className="btn shrink-0 border border-steel text-paper hover:border-paper">
                    Add tint <ArrowRightIcon width={16} height={16} />
                  </QuoteButton>
                </li>
              )}
              {bundle?.is_active && (
                <li className="flex flex-col justify-between gap-4 rounded-2xl border border-line p-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-paper">Full Front PPF + Ceramic</h3>
                    <p className="tabular mt-1 text-sm text-mist">
                      {bundle.display_price}
                      {bundle.badge ? ` (${bundle.badge})` : ""} · rock-chip & salt armour
                    </p>
                  </div>
                  <QuoteButton slug={bundle.slug} className="btn shrink-0 border border-steel text-paper hover:border-paper">
                    See bundle <ArrowRightIcon width={16} height={16} />
                  </QuoteButton>
                </li>
              )}
            </ul>
          </div>
        </section>
      )}

      <BeforeAfterSection />
      <ReviewsSection />
      <FaqSection items={FAQ} />
      <FinalCta
        title="Salt out. Showroom in."
        text="Tell us your vehicle and we'll send your exact price on WhatsApp: CAD + HST, confirmed before we start."
      />

      <JsonLd data={faqSchema(FAQ)} />
    </>
  );
}
