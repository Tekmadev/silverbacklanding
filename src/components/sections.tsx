import type { ReactNode } from "react";
import { BEFORE_AFTER_SETS, REVIEWS } from "@/config/media";
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

export function ReviewsSection() {
  const rating = SITE.rating.value.toFixed(1);
  return (
    <section aria-labelledby="reviews-heading" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <SectionHeading
        id="reviews-heading"
        eyebrow="Google reviews"
        title={
          <>
            {rating} stars.
            <br className="sm:hidden" /> {SITE.rating.count} reviews.
          </>
        }
        intro="Don't take our word for it. Read every review on our Google Business Profile before you book."
      />

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        <li className="rounded-2xl border border-line bg-onyx p-6">
          <div className="flex gap-1 text-paper" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} width={20} height={20} />
            ))}
          </div>
          <p className="display tabular mt-4 text-6xl text-paper">{rating}</p>
          <p className="mt-1 text-sm text-mist">Average Google rating out of 5</p>
        </li>
        <li className="rounded-2xl border border-line bg-onyx p-6">
          <p className="display tabular text-6xl text-paper">{SITE.rating.count}</p>
          <p className="mt-1 text-sm text-mist">Reviews on our Google Business Profile</p>
          <p className="mt-6 flex items-center gap-2 text-sm text-silver">
            <ShieldIcon width={18} height={18} /> Posted publicly on Google
          </p>
        </li>
        <li className="flex flex-col justify-between rounded-2xl border border-paper bg-paper p-6 text-ink">
          <p className="text-lg leading-snug font-semibold">
            See what clients say about the finish, the pricing and the turnaround.
          </p>
          <a
            href={SITE.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-6 bg-ink text-paper hover:bg-graphite"
          >
            Read all {SITE.rating.count} reviews<span className="sr-only"> on Google (opens Google)</span>
          </a>
        </li>
      </ul>

      {REVIEWS.length > 0 && (
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <li key={`${review.name}-${review.text.slice(0, 12)}`} className="rounded-2xl border border-line bg-onyx p-6">
              <div className="flex gap-0.5 text-paper" aria-label="5 out of 5 stars" role="img">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} width={16} height={16} />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-silver">“{review.text}”</blockquote>
              <p className="mt-4 text-sm font-semibold text-paper">
                {review.name}
                {review.when && <span className="font-normal text-mist"> · {review.when}</span>}
              </p>
            </li>
          ))}
        </ul>
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
