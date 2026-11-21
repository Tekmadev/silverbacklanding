import { getImageProps } from "next/image";
import type { ReactNode } from "react";
import type { SiteImage } from "@/config/media";
import { SITE, TEL_HREF } from "@/config/site";
import { PhoneIcon, StarIcon } from "./icons";
import { TrackedLink } from "./tracked-link";

/** 1×1 transparent GIF: what phones/tablets get instead of the hero photo. */
const BLANK_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function Hero({
  image,
  eyebrow,
  title,
  lead,
  children,
  aside,
  asideId = "quote",
}: {
  image: SiteImage;
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  /** Extra content under the lead (price block, CTAs). */
  children?: ReactNode;
  /** Right column on desktop (quote widget / split cards). */
  aside: ReactNode;
  /** Anchor id for the right column ("quote" when it holds the quote widget). */
  asideId?: string;
}) {
  // Art direction: the studio backdrop loads on desktop only. On phones the hero is
  // pure obsidian, so the headline is the LCP element and paints instantly on 4G.
  const {
    props: { srcSet: desktopSrcSet, ...imgProps },
  } = getImageProps({
    src: image.src,
    alt: "",
    width: image.width,
    height: image.height,
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  });

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-obsidian">
      <picture className="absolute inset-0 -z-20 hidden lg:block">
        <source media="(min-width: 1024px)" srcSet={desktopSrcSet} sizes="100vw" />
        <source media="(max-width: 1023.98px)" srcSet={BLANK_PIXEL} />
        <img
          {...imgProps}
          alt=""
          className="h-full w-full object-cover object-[72%_center]"
        />
      </picture>
      {/* Readability scrim: guarantees AA contrast for hero text over the photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block lg:bg-[linear-gradient(90deg,rgba(10,10,11,0.96)_0%,rgba(10,10,11,0.88)_40%,rgba(10,10,11,0.35)_100%)]"
      />

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 pt-12 pb-16 md:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-20 lg:pb-24">
        <div className="lg:pt-6">
          <p className="eyebrow text-silver">{eyebrow}</p>
          <h1 id="hero-heading" className="display mt-4 text-[3rem] text-paper sm:text-[3.75rem] lg:text-[4.6rem]">
            {title}
          </h1>
          <div className="mt-5 max-w-xl text-base leading-relaxed text-silver md:text-lg">{lead}</div>

          {children}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-silver">
            <a
              href={SITE.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2 hover:text-paper"
            >
              <span className="flex text-paper">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} width={15} height={15} />
                ))}
              </span>
              <span className="font-semibold text-paper">{SITE.rating.value.toFixed(1)}</span>
              <span className="underline decoration-steel underline-offset-4">
                {SITE.rating.count} Google Reviews<span className="sr-only"> (opens Google)</span>
              </span>
            </a>
            <TrackedLink
              kind="call"
              location="hero"
              href={TEL_HREF}
              className="flex min-h-11 items-center gap-2 font-semibold text-paper hover:underline"
            >
              <PhoneIcon width={17} height={17} />
              Call {SITE.phoneDisplay}
            </TrackedLink>
          </div>
        </div>

        <div id={asideId} className="scroll-mt-24">
          {aside}
        </div>
      </div>
    </section>
  );
}
