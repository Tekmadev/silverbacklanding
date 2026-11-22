import { Suspense } from "react";
import { AnalyticsScripts, GtmNoScript } from "@/components/analytics";
import { AttributionCapture } from "@/components/attribution-capture";
import { ElfsightReviewsBadge } from "@/components/elfsight-reviews-badge";
import { FloatingWhatsApp, MobileStickyBar } from "@/components/contact-bars";
import { JsonLd } from "@/components/json-ld";
import { PromoBanner } from "@/components/promo-banner";
import { SiteFooterContent } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getSiteData } from "@/lib/pricing";
import { businessSchema } from "@/lib/schema";

/** Shared shell for the three public paid-ad routes. */
export default async function FunnelLayout({ children }: LayoutProps<"/">) {
  const [{ services, promo }, reviews] = await Promise.all([getSiteData(), getGoogleReviews()]);

  return (
    <>
      <GtmNoScript />
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-paper px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {promo !== "none" && (
        <aside aria-label="Current offer">
          <PromoBanner promo={promo} services={services} />
        </aside>
      )}
      <header className="md:sticky md:top-0 md:z-40">
        <SiteHeader />
      </header>

      <main id="main">
        {children}
      </main>

      <footer className="pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">
        <SiteFooterContent />
        <MobileStickyBar />
        <FloatingWhatsApp />
        <ElfsightReviewsBadge />
      </footer>

      <JsonLd data={businessSchema(services, reviews)} />
      <AnalyticsScripts />
      <Suspense fallback={null}>
        <AttributionCapture />
      </Suspense>
    </>
  );
}
