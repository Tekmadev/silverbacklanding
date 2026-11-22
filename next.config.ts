import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Ad & analytics hosts that must never be blocked by the CSP. */
const TRACKING_HOSTS = [
  "https://*.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.googleadservices.com",
  "https://*.doubleclick.net",
  "https://www.google.com",
  "https://www.google.ca",
  "https://connect.facebook.net",
  "https://www.facebook.com",
].join(" ");

/** Elfsight Google Reviews badge: script, its API and the review avatars/assets it loads. */
const ELFSIGHT_HOSTS = "https://elfsightcdn.com https://*.elfsightcdn.com https://*.elfsight.com";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is required for Next.js static/ISR pages and the GTM/Pixel bootstraps.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${TRACKING_HOSTS} ${ELFSIGHT_HOSTS}`,
  `connect-src 'self' ${TRACKING_HOSTS} ${ELFSIGHT_HOSTS} https://*.supabase.co${isDev ? " ws:" : ""}`,
  `img-src 'self' data: blob: ${TRACKING_HOSTS} ${ELFSIGHT_HOSTS} https://*.googleusercontent.com`,
  `style-src 'self' 'unsafe-inline' ${ELFSIGHT_HOSTS}`,
  `font-src 'self' data: ${ELFSIGHT_HOSTS}`,
  `frame-src https://*.googletagmanager.com https://*.doubleclick.net https://www.facebook.com`,
  "object-src 'none'",
  "base-uri 'self'",
  // WhatsApp is allowed because the no-JS quote fallback 303-redirects there after POST.
  "form-action 'self' https://wa.me https://api.whatsapp.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // Paid-ad traffic is almost all first-time visitors: inlining the small Tailwind
    // stylesheet removes the render-blocking CSS request and speeds up FCP/LCP.
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/owner/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
