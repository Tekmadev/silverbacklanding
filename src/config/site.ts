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

  rating: { value: 5.0, count: 44 },

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

  /**
   * TODO(owner): replace with the exact Google Business Profile review link
   * (Google Business → "Ask for reviews" → copy link) for a direct hit.
   */
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
