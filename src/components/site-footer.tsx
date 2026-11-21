import { SITE, TEL_HREF } from "@/config/site";
import { MapPinIcon, PhoneIcon } from "./icons";
import { Logo } from "./logo";
import { TrackedLink } from "./tracked-link";

export function SiteFooterContent() {
  return (
    <div className="border-t border-line bg-obsidian">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            Studio-grade detailing, paint protection film, ceramic coating and window tint in a
            heated indoor bay. Prices in CAD + HST, confirmed before work begins.
          </p>
        </div>

        <div>
          <h2 className="eyebrow text-mist">Visit the studio</h2>
          <address className="mt-4 space-y-3 text-sm leading-relaxed not-italic text-silver">
            <TrackedLink
              kind="directions"
              location="footer"
              href={SITE.directionsUrl}
              className="flex gap-2.5 hover:text-paper"
            >
              <MapPinIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>
                {SITE.address.street}
                <br />
                {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
                <span className="mt-1 block text-mist">{SITE.address.landmark}.</span>
                <span className="mt-1 block font-semibold text-paper underline underline-offset-4">
                  Get directions<span className="sr-only"> (opens Google Maps)</span>
                </span>
              </span>
            </TrackedLink>
            <TrackedLink
              kind="call"
              location="footer"
              href={TEL_HREF}
              className="flex items-center gap-2.5 hover:text-paper"
            >
              <PhoneIcon className="shrink-0" width={18} height={18} />
              {SITE.phoneDisplay}
            </TrackedLink>
            <a href={`mailto:${SITE.email}`} className="block break-all hover:text-paper">
              {SITE.email}
            </a>
          </address>
        </div>

        <div>
          <h2 className="eyebrow text-mist">Hours &amp; area</h2>
          <ul className="mt-4 space-y-2 text-sm text-silver">
            <li>{SITE.hoursText}</li>
            <li>Cash · Credit · Interac e-Transfer</li>
            <li className="leading-relaxed text-mist">
              Serving {SITE.serviceArea.slice(0, -1).join(", ")} &amp; {SITE.serviceArea.at(-1)}.
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line px-4 py-6 text-center text-xs text-mist">
        © {SITE.name}. All prices in CAD, plus HST.
      </p>
    </div>
  );
}
