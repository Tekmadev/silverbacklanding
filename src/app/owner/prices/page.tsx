import type { Metadata } from "next";
import { Suspense } from "react";
import { OwnerEditor } from "./owner-editor";

export const metadata: Metadata = {
  title: { absolute: "Owner Editor" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** Private owner page. Never linked publicly; every read/write is key-checked server-side. */
export default function OwnerPricesPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-10 md:py-14">
      <p className="eyebrow text-mist">Silverback · Owner only</p>
      <h1 className="display mt-2 text-[2.75rem] text-paper md:text-[3.25rem]">Prices, promo &amp; reviews</h1>
      <Suspense fallback={<p className="mt-8 text-mist">Loading…</p>}>
        <OwnerEditor />
      </Suspense>
    </main>
  );
}
