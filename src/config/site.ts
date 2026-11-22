/**
 * Single source of truth for Silverback business facts (NAP, hours, links).
 * Everything public-facing (header, footer, JSON-LD, llms.txt) reads from here.
 */
export const SITE = {
  name: "Silverback Auto Detailing",
  shortName: "Silverback",
  url: "https://book.silverbackdetail.com",
  mainSiteUrl: "https://silverbackdetail.com",

  phoneDisplay: "(905) 519-6290",
  phoneE164: "+19055196290",
  whatsappNumber: "19055196290",
  email: "Silverbackvehicledetailing@gmail.com",

  address: {
    street: "1254 Plains Rd E, Unit 14",
    locality: "Burlington",
    region: "ON",
    postalCode: "L7S 1W6",
    country: "CA",
    full: "1254 Plains Rd E, Unit 14, Burlington, ON L7S 1W6",
    landmark:
      "Heated indoor bay inside Global Auto Center, directly beside Global Tech Collision",
  },
  geo: { latitude: 43.3322136, longitude: -79.8214828 },

  hoursText: "Mon–Sat · By appointment",
  /** schema.org openingHoursSpecification: by appointment, Mon–Sat. */
  openingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  /**
   * Last-resort backup only. Change the rating and count in /owner/prices (no code or
   * redeploy needed). Live Google numbers replace both once GOOGLE_PLACES_API_KEY is set.
   */
  rating: { value: 5.0, count: 45 },

  serviceArea: [
    "Burlington",
    "Hamilton",
    "Oakville",
    "Milton",
    "Waterdown",
    "Dundas",
    "Ancaster",
    "Stoney Creek",
  ],
  serviceRadiusKm: 25,

  paymentMethods: ["Cash", "Credit Card", "Interac e-Transfer"],

  /** "Leave a review" link from Google Business Profile → Ask for reviews. */
  writeReviewUrl: "https://g.page/r/CcvHt6Yg09rgEAE/review",
  /** Elfsight "Google Reviews" floating badge (live rating, managed at elfsight.com). Empty string hides it. */
  elfsightReviewsWidgetId: "a35823f0-1778-4670-a181-7c221482a969",
  /** Fallback "read reviews" link; the live Google Maps URL replaces it once the API key is set. */
  googleReviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=Silverback+Auto+Detailing+1254+Plains+Rd+E+Burlington+ON",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Silverback+Auto+Detailing+1254+Plains+Rd+E+Unit+14+Burlington+ON+L7S+1W6",

  sameAs: [
    "https://silverbackdetail.com",
    "https://www.instagram.com/silverbackautodetailing/",
    "https://www.facebook.com/share/19qoTejiUz/",
  ],
} as const;

export const TEL_HREF = `tel:${SITE.phoneE164}`;

export function whatsappHref(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DIRECT_MESSAGE =
  "Hi Silverback! I'd like a quote for my vehicle.";
