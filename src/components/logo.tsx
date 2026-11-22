import Image from "next/image";
import { LOGO } from "@/config/media";
import { SITE } from "@/config/site";

/**
 * Round emblem (config/media.ts) to the left of the typeset wordmark.
 * `placement="nav"` loads the emblem eagerly (above the fold); the footer copy lazy-loads.
 */
export function Logo({ tone = "dark", placement = "nav" }: { tone?: "dark" | "light"; placement?: "nav" | "footer" }) {
  const ink = tone === "dark" ? "text-ink" : "text-paper";
  const sub = tone === "dark" ? "text-slate" : "text-mist";
  const isNav = placement === "nav";

  return (
    <span className="flex items-center gap-2.5 md:gap-3">
      {LOGO && (
        <Image
          src={LOGO.src}
          width={isNav ? 44 : 56}
          height={isNav ? 44 : 56}
          alt=""
          loading={isNav ? "eager" : "lazy"}
          className={isNav ? "size-10 shrink-0 md:size-11" : "size-14 shrink-0"}
        />
      )}
      <span className="flex flex-col leading-none" aria-label={SITE.name} role="img">
        <span className={`display text-[1.65rem] tracking-[0.04em] md:text-[1.85rem] ${ink}`}>Silverback</span>
        <span className={`mt-0.5 text-[0.6rem] font-semibold tracking-[0.42em] uppercase ${sub}`}>
          Auto Detailing
        </span>
      </span>
    </span>
  );
}
