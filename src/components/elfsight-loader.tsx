"use client";

import { useEffect } from "react";

const PLATFORM_SRC = "https://elfsightcdn.com/platform.js";
const TRIGGERS = ["scroll", "pointerdown", "keydown", "touchstart"] as const;

/**
 * Loads Elfsight (about 480 KB of script) on the visitor's first scroll, tap or key press
 * instead of on page load. Measured on mobile: loading it on page load dropped Lighthouse
 * Performance from 100 to 69, because the badge painted late and became the LCP element.
 */
export function ElfsightLoader() {
  useEffect(() => {
    const load = () => {
      TRIGGERS.forEach((event) => window.removeEventListener(event, load));
      if (document.querySelector(`script[src="${PLATFORM_SRC}"]`)) return;
      const script = document.createElement("script");
      script.src = PLATFORM_SRC;
      script.async = true;
      document.body.appendChild(script);
    };
    TRIGGERS.forEach((event) => window.addEventListener(event, load, { once: true, passive: true }));
    return () => TRIGGERS.forEach((event) => window.removeEventListener(event, load));
  }, []);
  return null;
}
