import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { CheckIcon, GaugeIcon, HeatIcon, ShieldIcon, TruckIcon } from "@/components/icons";
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
import { TrackedLink } from "@/components/tracked-link";
import { FAQ_CORE, FAQ_PROTECTION } from "@/config/faq";
import { HERO_PAINT } from "@/config/media";
import { FLEET_SLUG } from "@/config/quote";
import { SITE, TEL_HREF } from "@/config/site";
import { findService, pickServices } from "@/lib/pricing-utils";
import { getSiteData } from "@/lib/pricing";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Full Front PPF + Ceramic from $2,499 | Burlington Paint Protection",
  description:
    "Stop QEW/403 rock chips and Ontario road salt. Full Front PPF + Ceramic Winter Shield from $2,499 + HST (save $500–$600). Window tint $349, ceramic from $1,099. Heated indoor bay, Burlington.",
  alternates: { canonical: "/ppf-ceramic" },
  openGraph: {
    title: "Full Front PPF + Ceramic Winter Shield from $2,499 + HST",
    url: "/ppf-ceramic",
    images: [{ url: HERO_PAINT.src, width: HERO_PAINT.width, height: HERO_PAINT.height, alt: HERO_PAINT.alt }],
  },
};

const GRID_SLUGS = ["ppf_full_front", "window_tint", "ceramic_5yr", "ceramic_lifetime", "paint_correction"] as const;
const FAQ = [...FAQ_PROTECTION, ...FAQ_CORE];

const TURNAROUND: Record<string, string> = {
  ppf_full_front: "1–2 days · heated indoor cure",
  window_tint: "Same-day · 2–5 hrs",
  ceramic_5yr: "1–2 days · heated indoor cure",
  ceramic_lifetime: "1–2 days · heated indoor cure",
  paint_correction: "Measured with a paint gauge first",
};

export default async function PpfCeramicPage() {
  const { services } = await getSiteData();
  const bundle = findService(services, "ppf_ceramic_bundle");
  const flagship = bundle?.is_active ? bundle : undefined;
  const grid = pickServices(services, GRID_SLUGS);

  return (
    <>
      <Hero
        image={HERO_PAINT}
        eyebrow="Full Front PPF + Ceramic · Winter Shield"
        title={
          <>
            Stop QEW rock chips
            <br /> before they start.
          </>
        }
        lead={
          <p>
            Paint protection film on the full front end, sealed under ceramic. Built for new
            vehicles, EVs &amp; Teslas, luxury cars and trucks that face 403 gravel and Ontario road salt
            every winter.
          </p>
        }
        aside={<QuoteForm services={services} defaultSlug={flagship ? flagship.slug : "ppf_full_front"} />}
      >
        {flagship && (
          <div className="mt-7 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-steel bg-obsidian/70 px-5 py-4">
            <span className="tabular text-2xl font-bold text-paper md:text-3xl">{flagship.display_price}</span>
            {flagship.compare_at_price && (
              <span className="tabular text-base text-mist">
                Reg. <s>{flagship.compare_at_price}</s>
              </span>
            )}
            {flagship.badge && (
              <span className="eyebrow rounded-full bg-paper px-2.5 py-1 text-[0.6875rem] text-ink">{flagship.badge}</span>
            )}
          </div>
        )}
        <ul className="mt-6 grid gap-2 text-[0.9375rem] text-silver sm:grid-cols-2">
          {["Full hood, fenders & front bumper", "Mirrors & headlights covered", "Ceramic seal for salt & UV", "Cured 1–2 days in a heated bay"].map(
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

      <section aria-labelledby="protection-heading" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <SectionHeading
          id="protection-heading"
          eyebrow="Protection menu"
          title="Armour, priced upfront"
          intro="Live studio pricing in CAD + HST. Larger SUVs and trucks are quoted by size before any work begins."
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {flagship && (
            <ServiceCard
              service={flagship}
              featured
              turnaround="1–2 days · heated indoor cure"
              points={["Full front-end rock-chip PPF", "Ceramic paint protection", "Best value vs. booking separately"]}
            />
          )}
          {grid.map((service) => (
            <ServiceCard key={service.slug} service={service} turnaround={TURNAROUND[service.slug]} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="method-heading" className="border-y border-line bg-onyx">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-24">
          <SectionHeading
            id="method-heading"
            eyebrow="How we work"
            title="Measured, not guessed"
            intro="Film and coating only last as long as the prep under them."
          />
          <ul className="space-y-6">
            <li className="flex gap-4">
              <GaugeIcon className="mt-1 shrink-0 text-paper" width={26} height={26} />
              <div>
                <h3 className="text-lg font-semibold text-paper">Paint gauge readings first</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-mist">
                  We measure paint thickness panel by panel before any polishing, so correction removes defects,
                  not your clear coat.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <HeatIcon className="mt-1 shrink-0 text-paper" width={26} height={26} />
              <div>
                <h3 className="text-lg font-semibold text-paper">Heated indoor bay curing</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-mist">
                  PPF and ceramic cure for 1–2 days indoors at the right temperature, even in a Hamilton–Halton
                  January.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <ShieldIcon className="mt-1 shrink-0 text-paper" width={26} height={26} />
              <div>
                <h3 className="text-lg font-semibold text-paper">Decontamination included</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-mist">
                  Decontamination wash, clay bar and panel prep are included with ceramic coating.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="fleet-heading" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="grid gap-8 rounded-3xl border border-line bg-graphite p-7 md:grid-cols-[1.4fr_1fr] md:items-center md:p-10">
          <div>
            <p className="eyebrow flex items-center gap-2 text-mist">
              <TruckIcon width={16} height={16} /> B2B · Fleet · Post-collision
            </p>
            <h2 id="fleet-heading" className="display mt-3 text-[2.25rem] text-paper md:text-[2.75rem]">
              Fresh paint? Protect it next door.
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-mist">
              Our bay is inside Global Auto Center, directly beside Global Tech Collision, so fresh post-repair
              paint can go straight into PPF or ceramic. Dealers, fleets and body shops: send your vehicles and we&apos;ll quote them together.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <QuoteButton slug={FLEET_SLUG} className="btn min-h-13 bg-paper text-ink hover:bg-silver">
              Request fleet pricing
            </QuoteButton>
            <TrackedLink kind="call" location="fleet_callout" href={TEL_HREF} className="btn min-h-13 border border-steel text-paper hover:border-paper">
              Call {SITE.phoneDisplay}
            </TrackedLink>
          </div>
        </div>
      </section>

      <BeforeAfterSection />
      <ReviewsSection />
      <FaqSection items={FAQ} />
      <FinalCta
        title="Armour up before the next storm."
        text="Send your vehicle and we'll confirm your exact PPF, ceramic or tint price on WhatsApp."
      />

      <JsonLd data={faqSchema(FAQ)} />
    </>
  );
}
