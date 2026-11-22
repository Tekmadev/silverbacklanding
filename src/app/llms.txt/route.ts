import { FAQ_CORE, FAQ_INTERIOR, FAQ_PROTECTION } from "@/config/faq";
import { SITE } from "@/config/site";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getSiteData } from "@/lib/pricing";

/**
 * /llms.txt: plain-language business summary for AI answer engines (AEO/GEO).
 * Served from the same cached pricing data as the pages, so prices never drift.
 */
export async function GET() {
  const [{ services }, reviews] = await Promise.all([getSiteData(), getGoogleReviews()]);
  const active = services.filter((s) => s.is_active);

  const priceLines = active.map(
    (s) => `- ${s.name}: ${s.display_price}${s.compare_at_price ? ` (regular value ${s.compare_at_price})` : ""} · ${s.short_desc}`,
  );
  const faqLines = [...FAQ_PROTECTION, ...FAQ_INTERIOR, ...FAQ_CORE].map((f) => `### ${f.q}\n${f.a}`);

  const body = `# ${SITE.name}

> Studio auto detailing, paint protection film (PPF), ceramic coating, paint correction and window tint in a heated indoor bay in Burlington, Ontario, Canada. Rated ${reviews.rating.toFixed(1)}/5 from ${reviews.count} Google reviews. All prices in CAD plus HST, confirmed upfront before work begins.

## Contact
- Address: ${SITE.address.full} (${SITE.address.landmark})
- Phone / WhatsApp: ${SITE.phoneDisplay} (${SITE.phoneE164})
- Email: ${SITE.email}
- Hours: ${SITE.hoursText}
- Payment: ${SITE.paymentMethods.join(", ")}
- Service area (${SITE.serviceRadiusKm} km radius): ${SITE.serviceArea.join(", ")}
- Main website: ${SITE.mainSiteUrl}
- Google reviews: ${reviews.mapsUrl}
- Leave a review: ${SITE.writeReviewUrl}

## Pages
- [Home: choose a service](${SITE.url}/)
- [Winter interior deep clean & full detail packages](${SITE.url}/winter-interior)
- [Full Front PPF, ceramic coating & window tint](${SITE.url}/ppf-ceramic)

## Current prices (CAD + HST)
${priceLines.join("\n")}

Larger SUVs, trucks and 3-row interiors are quoted fairly by size and condition.

## Turnaround
- Interior resets and window tint: same-day, typically 2–5 hours
- PPF and ceramic coating: 1–2 days, cured in a heated indoor bay

## FAQ
${faqLines.join("\n\n")}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
