import { SITE, TEL_HREF } from "@/config/site";
import { getGoogleReviews } from "@/lib/google-reviews";
import { PhoneIcon, StarIcon } from "./icons";
import { Logo } from "./logo";
import { TrackedLink } from "./tracked-link";

/**
 * Crisp white top bar: logo, review badge, call button. Deliberately no nav
 * links: paid traffic should only be able to call, WhatsApp, or quote.
 */
export async function SiteHeader() {
  const { rating, count, mapsUrl } = await getGoogleReviews();
  return (
    <div className="on-light bg-paper text-ink shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:h-[4.5rem] md:px-6">
        <Logo />
        <nav aria-label="Contact" className="flex items-center gap-2 md:gap-4">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-ink hover:bg-fog"
          >
            <StarIcon width={14} height={14} />
            <span className="tabular">{rating.toFixed(1)}</span>
            <span className="sr-only"> out of 5 stars from</span>
            <span className="text-slate" aria-hidden="true">·</span>
            <span className="tabular text-slate">
              {count}
              <span className="hidden sm:inline"> Google Reviews</span>
              <span className="sr-only sm:hidden"> Google reviews</span>
            </span>
            <span className="sr-only"> (opens Google)</span>
          </a>
          <TrackedLink
            kind="call"
            location="header"
            href={TEL_HREF}
            className="btn min-h-11 bg-ink px-4 text-paper hover:bg-graphite md:px-5"
            aria-label={`Call ${SITE.phoneDisplay}`}
          >
            <PhoneIcon width={18} height={18} />
            <span className="hidden sm:inline">Call {SITE.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </TrackedLink>
        </nav>
      </div>
    </div>
  );
}
