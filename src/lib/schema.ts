import { HERO_INTERIOR, HERO_PAINT } from "@/config/media";
import { SITE } from "@/config/site";
import type { FaqItem } from "@/config/faq";
import type { ServicePricing } from "./types";

/** AutomotiveBusiness + live OfferCatalog (prices straight from the DB). */
export function businessSchema(services: ServicePricing[]) {
  const active = services.filter((s) => s.is_active);
  const prices = active.map((s) => s.price_cad).filter((p): p is number => p !== null);

  return {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "@id": `${SITE.url}/#business`,
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.phoneE164,
    email: SITE.email,
    image: [`${SITE.url}${HERO_PAINT.src}`, `${SITE.url}${HERO_INTERIOR.src}`],
    description:
      "Auto detailing, paint protection film (PPF), ceramic coating, paint correction and window tint in a heated indoor bay in Burlington, Ontario. Mon–Sat by appointment.",
    ...(prices.length
      ? { priceRange: `$${Math.min(...prices)}–$${Math.max(...prices).toLocaleString("en-CA")}+ CAD` }
      : {}),
    currenciesAccepted: "CAD",
    paymentAccepted: SITE.paymentMethods.join(", "),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    hasMap: SITE.directionsUrl,
    areaServed: SITE.serviceArea.map((city) => ({
      "@type": "City",
      name: city,
      containedInPlace: { "@type": "AdministrativeArea", name: "Ontario, Canada" },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE.rating.value.toFixed(1),
      reviewCount: SITE.rating.count,
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: SITE.sameAs,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Detailing, PPF, Ceramic & Window Tint",
      itemListElement: active.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.short_desc,
          provider: { "@id": `${SITE.url}/#business` },
        },
        ...(s.price_cad !== null
          ? {
              price: s.price_cad,
              priceCurrency: "CAD",
              priceSpecification: {
                "@type": "PriceSpecification",
                price: s.price_cad,
                priceCurrency: "CAD",
                valueAddedTaxIncluded: false,
                ...(s.display_price.toLowerCase().startsWith("from") ? { minPrice: s.price_cad } : {}),
              },
            }
          : {}),
        availability: "https://schema.org/InStock",
      })),
    },
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
