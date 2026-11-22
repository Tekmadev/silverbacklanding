/**
 * Image registry. Drop real shop photos into /public/images and reference them here.
 *
 * Hero backdrops are AI-generated abstract macro shots (water beading on paint,
 * leather seat). No customer vehicles. Swap in real bay photos whenever ready.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const HERO_PAINT: SiteImage = {
  src: "/images/hero-paint-beading.jpg",
  width: 1344,
  height: 752,
  alt: "Water beading on ceramic-coated black paint under studio lighting",
};

export const HERO_INTERIOR: SiteImage = {
  src: "/images/hero-interior-leather.jpg",
  width: 1344,
  height: 752,
  alt: "Freshly deep-cleaned black leather car seat in a dark detailing studio",
};

export interface BeforeAfterSet {
  id: string;
  title: string;
  before: SiteImage;
  after: SiteImage;
}

/**
 * Real before/after photos ONLY. Never AI images. The slider section stays
 * hidden until at least one set is added. Use same-size, same-angle pairs, e.g.:
 *
 * {
 *   id: "salt-carpet",
 *   title: "Winter salt & stains",
 *   before: { src: "/images/before-after/salt-before.jpg", width: 1200, height: 900, alt: "Salt-stained carpet before" },
 *   after:  { src: "/images/before-after/salt-after.jpg",  width: 1200, height: 900, alt: "Same carpet after extraction" },
 * },
 */
export const BEFORE_AFTER_SETS: BeforeAfterSet[] = [];

/**
 * Round emblem shown to the left of the "Silverback / Auto Detailing" wordmark in the nav
 * and footer. Set to null to show the wordmark alone. next/image serves small resized copies,
 * so the large source file is never sent to visitors.
 */
export const LOGO: { src: string; width: number; height: number } | null = {
  src: "/images/silverbacklogo.png",
  width: 895,
  height: 895,
};
