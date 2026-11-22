import { SITE } from "@/config/site";
import { ElfsightLoader } from "./elfsight-loader";

const WIDGET_ID = /^[a-f0-9-]{36}$/.test(SITE.elfsightReviewsWidgetId) ? SITE.elfsightReviewsWidgetId : null;

/**
 * Elfsight floating Google rating badge (bottom-left); tapping it opens the live reviews popup.
 * Placement above the mobile Call / WhatsApp bar is handled in globals.css.
 *
 * The script loads on the visitor's first scroll or tap (see ElfsightLoader), so it never
 * slows the first paint or competes with the hero and quote widget.
 */
export function ElfsightReviewsBadge() {
  if (!WIDGET_ID) return null;
  return (
    <>
      {/* No data-elfsight-app-lazy: ElfsightLoader already waits for the first interaction, and
          Elfsight's own lazy mode would then wait for a second one before showing the badge. */}
      <div className={`elfsight-app-${WIDGET_ID}`} />
      <ElfsightLoader />
    </>
  );
}
