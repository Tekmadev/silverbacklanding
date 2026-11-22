import Image from "next/image";
import type { ReactNode } from "react";
import { BEFORE_AFTER_SETS } from "@/config/media";
import { getGoogleReviews } from "@/lib/google-reviews";
import { SITE, TEL_HREF, WHATSAPP_DIRECT_MESSAGE, whatsappHref } from "@/config/site";
import type { FaqItem } from "@/config/faq";
import {
  CardIcon,
  ChevronDownIcon,
  ClockIcon,
  HeatIcon,
  PhoneIcon,
  ShieldIcon,
  StarIcon,
  TagIcon,
  WhatsAppIcon,
} from "./icons";
import { BeforeAfterGrid } from "./proof/before-after";
import { QuoteButton } from "./quote/quote-button";
import { TrackedLink } from "./tracked-link";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow text-mist">{eyebrow}</p>}
      <h2 id={id} className="display mt-3 text-[2.5rem] text-paper md:text-[3.5rem]">
        {title}
      </h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-mist md:text-lg">{intro}</p>}
    </div>
  );
}

/** Turnaround, payment and pricing clarity: the objections every lead has. */
export function ProcessStrip() {
  const items = [
    { icon: ClockIcon, title: "Interior resets & tint", text: "Same-day · 2–5 hrs" },
    { icon: HeatIcon, title: "PPF & ceramic", text: "1–2 days, heated indoor cure" },
    { icon: TagIcon, title: "CAD + HST, upfront", text: "Confirmed before we start" },
    { icon: CardIcon, title: "Easy payment", text: "Cash · Credit · Interac e-Transfer" },
  ];
  return (
    <section aria-labelledby="process-heading" className="border-y border-line bg-onyx">
      <h2 id="process-heading" className="sr-only">
        Turnaround, pricing and payment
      </h2>
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-line md:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex flex-col gap-2 bg-onyx px-4 py-6 md:px-6 md:py-8">
            <Icon className="text-paper" width={22} height={22} />
            <p className="text-sm font-semibold text-paper md:text-base">{title}</p>
            <p className="text-sm text-mist">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} width={size} height={size} className={i < filled ? "text-paper" : "text-steel"} />
      ))}
    </span>
  );
}

/** Live Google rating + up to 5 reviews (Places API), with the attribution Google requires. */
export async function ReviewsSection() {
  const { rating, count, reviews, mapsUrl } = await getGoogleReviews();
  const ratingText = rating.toFixed(1);

  return (
    <section aria-labelledby="reviews-heading" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <SectionHeading
        id="reviews-heading"
        eyebrow="Google reviews"
        title={
          <>
            {ratingText} stars.
            <br className="sm:hidden" /> {count} reviews.
          </>
        }
        intro="Don't take our word for it. Read every review on our Google Business Profile before you book."
      />

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        <li className="rounded-2xl border border-line bg-onyx p-6">
          <Stars value={rating} size={20} />
          <p className="display tabular mt-4 text-6xl text-paper">{ratingText}</p>
          <p className="mt-1 text-sm text-mist">Average Google rating out of 5</p>
        </li>
        <li className="rounded-2xl border border-line bg-onyx p-6">
          <p className="display tabular text-6xl text-paper">{count}</p>
          <p className="mt-1 text-sm text-mist">Reviews on our Google Business Profile</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-paper underline decoration-steel underline-offset-4 hover:decoration-paper"
          >
            <ShieldIcon width={18} height={18} /> Read all {count} on Google<span className="sr-only"> (opens Google Maps)</span>
          </a>
        </li>
        <li className="on-light flex flex-col justify-between rounded-2xl border border-paper bg-paper p-6 text-ink">
          <p className="text-lg leading-snug font-semibold">
            Had your vehicle done at Silverback? A quick review helps other drivers find us.
          </p>
          <a
            href={SITE.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-6 bg-ink text-paper hover:bg-graphite"
          >
            <StarIcon width={16} height={16} /> Leave a Google review<span className="sr-only"> (opens Google)</span>
          </a>
        </li>
      </ul>

      {reviews.length > 0 && (
        <>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li key={`${review.authorName}-${review.when}`} className="flex flex-col rounded-2xl border border-line bg-onyx p-6">
                <div className="flex items-center gap-3">
                  {review.authorPhoto ? (
                    <Image
                      src={review.authorPhoto}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      // Anonymous CORS: no cookies sent or set by Google's avatar host.
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="size-10 shrink-0 rounded-full bg-graphite"
                    />
                  ) : (
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-graphite text-sm font-semibold text-paper">
                      {review.authorName.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0">
                    {review.authorUrl ? (
                      <a
                        href={review.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="block truncate text-sm font-semibold text-paper hover:underline"
                      >
                        {review.authorName}
                      </a>
                    ) : (
                      <p className="truncate text-sm font-semibold text-paper">{review.authorName}</p>
                    )}
                    <div className="mt-0.5 flex items-center gap-2">
                      <Stars value={review.rating} size={13} />
                      {review.when && <span className="text-xs text-mist">{review.when}</span>}
                    </div>
                  </div>
                </div>
                <blockquote className="mt-4 line-clamp-6 text-sm leading-relaxed text-silver">{review.text}</blockquote>
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-xs text-mist">
                  {review.translated && <span>Translated by Google</span>}
                  {review.url && (
                    <a
                      href={review.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center font-semibold text-silver underline underline-offset-4 hover:text-paper"
                    >
                      Read on Google<span className="sr-only"> (review by {review.authorName}, opens Google Maps)</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-mist">
            Showing Google&apos;s most relevant reviews, unedited. Source:{" "}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline underline-offset-4" translate="no">
              Google Maps
            </a>
          </p>
        </>
      )}
    </section>
  );
}

export function BeforeAfterSection() {
  if (BEFORE_AFTER_SETS.length === 0) return null;
  return (
    <section aria-labelledby="results-heading" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <SectionHeading
        id="results-heading"
        eyebrow="Real results"
        title="Drag to see the difference"
        intro="Real photos from our Burlington bay."
      />
      <div className="mt-10">
        <BeforeAfterGrid sets={BEFORE_AFTER_SETS} />
      </div>
    </section>
  );
}

export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-heading" className="border-t border-line bg-onyx">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1fr_1.6fr] md:px-6 md:py-28">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="Straight answers"
          intro={
            <>
              Still unsure? Call{" "}
              <TrackedLink kind="call" location="faq" href={TEL_HREF} className="font-semibold text-paper underline underline-offset-4">
                {SITE.phoneDisplay}
              </TrackedLink>
              .
            </>
          }
        />
        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-paper [&::-webkit-details-marker]:hidden">
                <h3>{item.q}</h3>
                <ChevronDownIcon className="shrink-0 text-mist transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="pb-5 text-[0.9375rem] leading-relaxed text-mist">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing CTA band: repeats the two highest-intent actions. */
export function FinalCta({ title, text }: { title: string; text: string }) {
  return (
    <section aria-labelledby="final-cta-heading" className="on-light bg-paper text-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-20">
        <div className="max-w-xl">
          <h2 id="final-cta-heading" className="display text-[2.75rem] md:text-[4rem]">
            {title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate md:text-lg">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <QuoteButton className="btn min-h-14 bg-ink px-7 text-paper hover:bg-graphite">Get my price</QuoteButton>
          <TrackedLink
            kind="whatsapp"
            location="final_cta"
            href={whatsappHref(WHATSAPP_DIRECT_MESSAGE)}
            className="btn min-h-14 bg-whatsapp px-7 text-ink hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon /> WhatsApp us<span className="sr-only"> (opens WhatsApp)</span>
          </TrackedLink>
          <TrackedLink
            kind="call"
            location="final_cta"
            href={TEL_HREF}
            className="btn min-h-14 border border-ink px-7 text-ink hover:bg-fog"
          >
            <PhoneIcon /> {SITE.phoneDisplay}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
