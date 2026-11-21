export interface FaqItem {
  q: string;
  a: string;
}

/** Shared answers. Rendered in the accordion and in FAQPage JSON-LD. */
export const FAQ_CORE: FaqItem[] = [
  {
    q: "Is the price I see the price I pay?",
    a: "Yes. Every price is in CAD plus HST and confirmed with you before any work begins, so there are no surprise counter upsells. Larger SUVs, trucks and 3-row interiors are quoted fairly by size and condition, and you get that number before we start.",
  },
  {
    q: "How long will you have my vehicle?",
    a: "Interior resets and window tint are same-day, typically 2–5 hours. Full Front PPF and ceramic coatings need 1–2 days so the film and coating can cure properly indoors.",
  },
  {
    q: "Can you really cure PPF and ceramic in an Ontario winter?",
    a: "Yes. All work happens inside our heated indoor bay at Global Auto Center in Burlington, so coatings and film cure at the right temperature regardless of the weather outside.",
  },
  {
    q: "Which windows does the all-around tint cover?",
    a: "All side and rear windows. The windshield is excluded from the all-around package. Tint can be booked on its own or bundled with PPF or ceramic.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash, all major credit cards and Interac e-Transfer.",
  },
  {
    q: "Where are you and which areas do you serve?",
    a: "We are at 1254 Plains Rd E, Unit 14, Burlington. Our bay is inside Global Auto Center, directly beside Global Tech Collision. Clients come from Burlington, Hamilton, Oakville, Milton, Waterdown, Dundas, Ancaster and Stoney Creek (about a 25 km radius).",
  },
];

export const FAQ_INTERIOR: FaqItem[] = [
  {
    q: "Can you get road salt stains out of carpets and floor mats?",
    a: "Yes. Our Interior Deep Clean uses steam shampoo and hot-water extraction to lift the white salt lines and the grit trapped deep in the carpet fibres and floor mats.",
  },
  {
    q: "Do you remove smoke, pet or food odours?",
    a: "A deep clean removes most odour sources. For stubborn smells we add an Ozone Odour Treatment that eliminates odour-causing bacteria throughout the cabin.",
  },
];

export const FAQ_PROTECTION: FaqItem[] = [
  {
    q: "What does Full Front PPF cover?",
    a: "The full hood, full front fenders, front bumper, mirrors and headlights. These are the areas that take the most rock chips and gravel on the QEW and 403.",
  },
  {
    q: "Do I need paint correction before ceramic coating?",
    a: "Ceramic locks in whatever is underneath, so we measure your paint with a thickness gauge first. New vehicles often only need decontamination and prep; vehicles with swirls or haze benefit from one or more correction steps before coating.",
  },
];
