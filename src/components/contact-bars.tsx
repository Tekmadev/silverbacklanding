import { SITE, TEL_HREF, WHATSAPP_DIRECT_MESSAGE, whatsappHref } from "@/config/site";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import { TrackedLink } from "./tracked-link";

const WA_HREF = whatsappHref(WHATSAPP_DIRECT_MESSAGE);

/** Mobile-only fixed dual-action bar: Call Now + WhatsApp Quote. */
export function MobileStickyBar() {
  return (
    <nav
      aria-label="Quick contact"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-line bg-obsidian/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] md:hidden"
    >
      <TrackedLink
        kind="call"
        location="mobile_sticky"
        href={TEL_HREF}
        className="btn min-h-12 bg-paper text-ink"
        aria-label={`Call now: ${SITE.phoneDisplay}`}
      >
        <PhoneIcon width={18} height={18} />
        Call Now
      </TrackedLink>
      <TrackedLink
        kind="whatsapp"
        location="mobile_sticky"
        href={WA_HREF}
        className="btn min-h-12 bg-whatsapp text-ink"
        aria-label="WhatsApp Quote (opens WhatsApp)"
      >
        <WhatsAppIcon width={19} height={19} />
        WhatsApp Quote
      </TrackedLink>
    </nav>
  );
}

/** Desktop floating WhatsApp button (the mobile bar covers small screens). */
export function FloatingWhatsApp() {
  return (
    <TrackedLink
      kind="whatsapp"
      location="floating_button"
      href={WA_HREF}
      aria-label="WhatsApp Quote (opens WhatsApp)"
      className="btn fixed right-6 bottom-6 z-40 hidden min-h-14 bg-whatsapp px-5 text-ink shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:bg-whatsapp-dark md:inline-flex"
    >
      <WhatsAppIcon width={22} height={22} />
      WhatsApp Quote
    </TrackedLink>
  );
}
