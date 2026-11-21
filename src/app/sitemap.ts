import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/** Public funnel routes only; /owner is intentionally excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/winter-interior`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/ppf-ceramic`, changeFrequency: "weekly", priority: 0.9 },
  ];
}
