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
 * Verbatim Google reviews (copy text and first name exactly as posted).
 * Leave empty to show the aggregate 5.0 ★ card only. Never write reviews.
 */
export interface Review {
  name: string;
  text: string;
  /** e.g. "2 weeks ago" or "Oct 2026" (as shown on Google). */
  when?: string;
}

export const REVIEWS: Review[] = [];

/**
 * Official logo. Set to e.g. { src: "/images/logo.webp", width: 220, height: 64 }
 * once the file is in /public/images. Until then a typeset wordmark is shown.
 */
export const LOGO: { src: string; width: number; height: number } | null = null;
