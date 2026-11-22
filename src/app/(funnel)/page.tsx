import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { ArrowRightIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { QuoteForm } from "@/components/quote/quote-section";
import { FaqSection, ProcessStrip, ReviewsSection, SectionHeading } from "@/components/sections";
import { FAQ_CORE } from "@/config/faq";
import { HERO_PAINT } from "@/config/media";
import { SITE } from "@/config/site";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getSiteData } from "@/lib/pricing";
import { formatCad, minPrice } from "@/lib/pricing-utils";
import { faqSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const { rating, count } = await getGoogleReviews();
  return {
    title: { absolute: "Silverback Auto Detailing | Burlington Detailing, PPF, Ceramic & Tint" },
    description: `Burlington's heated indoor detailing studio. Winter interior resets from $279, window tint $349, Full Front PPF + Ceramic from $2,499 + HST. ${rating.toFixed(1)}★ from ${count} Google reviews.`,
    alternates: { canonical: "/" },
    openGraph: { url: "/" },
  };
}

const INTERIOR_SLUGS = ["interior_deep_clean", "silver_deep_clean", "gold_correct_protect"] as const;
const PROTECTION_SLUGS = ["window_tint", "ppf_ceramic_bundle", "ppf_full_front", "ceramic_5yr", "ceramic_lifetime"] as const;

function PathCard({
  href,
  eyebrow,
  title,
  from,
  text,
}: {
  href: string;
  eyebrow: string;
  title: string;
  from: number | null;
  text: string;
}) {
  return (
    <li>
      <Link
        href={href}
        prefetch
        className="group flex h-full flex-col rounded-3xl border border-line bg-onyx p-6 transition-colors duration-200 hover:border-paper md:p-7"
      >
        <span className="eyebrow text-mist">{eyebrow}</span>
        <span className="display mt-3 text-[2rem] text-paper md:text-[2.35rem]">{title}</span>
        {from !== null && (
          <span className="tabular mt-3 text-lg font-semibold text-paper">From {formatCad(from)} + HST</span>
        )}
        <span className="mt-2 text-[0.9375rem] leading-relaxed text-mist">{text}</span>
        <span className="mt-6 inline-flex items-center gap-2 font-semibold text-paper">
          See prices
          <ArrowRightIcon width={18} height={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </Link>
    </li>
  );
}

export default async function HomePage() {
  const { services } = await getSiteData();
  const interiorFrom = minPrice(services, INTERIOR_SLUGS);
  const protectionFrom = minPrice(services, PROTECTION_SLUGS);

  return (
    <>
      <Hero
        image={HERO_PAINT}
        asideId="choose"
        eyebrow={`Heated indoor studio · ${SITE.address.locality}, ON`}
        title={
          <>
            Showroom finish.
            <br /> Built to stay that way.
          </>
        }
        lead={
          <p>
            Pick your path for live, upfront CAD pricing, or get a quote in three taps. Serving Burlington,
            Hamilton, Oakville, Milton and the surrounding 25 km.
          </p>
        }
        aside={
          <nav aria-label="Choose a service">
            <ul className="grid gap-4">
              <PathCard
                href="/winter-interior"
                eyebrow="Same-day · 3–5 hrs"
                title="Winter Interior & Full Detail"
                from={interiorFrom}
                text="Salt, stains & odours out. Steam shampoo, extraction and full resets."
              />
              <PathCard
                href="/ppf-ceramic"
                eyebrow="Tint same-day · PPF & ceramic 1–2 days"
                title="PPF, Ceramic & Window Tint"
                from={protectionFrom}
                text="Rock-chip film, ceramic coating and all-around tint for QEW/403 winters."
              />
            </ul>
          </nav>
        }
      />

      <ProcessStrip />

      <section aria-labelledby="quote-section-heading" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <SectionHeading
            id="quote-section-heading"
            eyebrow="Fastest way to a price"
            title="Know your number before you drive over"
            intro="Tap a service, add your vehicle and number, and your quote request opens in WhatsApp with everything filled in."
          />
          <div id="quote" className="scroll-mt-24">
            <QuoteForm services={services} headingLevel="h3" />
          </div>
        </div>
      </section>

      <ReviewsSection />
      <FaqSection items={FAQ_CORE} />
      <JsonLd data={faqSchema(FAQ_CORE)} />
    </>
  );
}
