"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { trackPageView } from "@/lib/tracking";

/** Stores gclid/fbclid/UTMs on landing and logs a `page_view` for every funnel route. */
export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    trackPageView();
  }, [pathname]);

  return null;
}
