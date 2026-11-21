import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import { HERO_PAINT } from "@/config/media";
import { SITE } from "@/config/site";
import "./globals.css";

const display = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["800"],
  subsets: ["latin"],
  display: "swap",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const metaVerification = process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Silverback Auto Detailing | Burlington Detailing, PPF & Ceramic",
    template: "%s | Silverback Auto Detailing",
  },
  description:
    "Studio detailing, PPF, ceramic coating & window tint in a heated indoor bay in Burlington, ON. 5.0★ from 44 Google reviews. Upfront CAD + HST pricing.",
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: SITE.name,
    images: [{ url: HERO_PAINT.src, width: HERO_PAINT.width, height: HERO_PAINT.height, alt: HERO_PAINT.alt }],
  },
  twitter: { card: "summary_large_image" },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(metaVerification ? { other: { "facebook-domain-verification": metaVerification } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={display.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
