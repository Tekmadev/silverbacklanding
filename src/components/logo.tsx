import Image from "next/image";
import { LOGO } from "@/config/media";
import { SITE } from "@/config/site";

/** Official logo when provided in config/media.ts; otherwise a typeset wordmark. */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  if (LOGO) {
    return (
      <Image
        src={LOGO.src}
        width={LOGO.width}
        height={LOGO.height}
        alt={SITE.name}
        className="h-9 w-auto md:h-10"
        loading="eager"
      />
    );
  }

  const ink = tone === "dark" ? "text-ink" : "text-paper";
  const sub = tone === "dark" ? "text-slate" : "text-mist";
  return (
    <span className="flex flex-col leading-none" aria-label={SITE.name} role="img">
      <span className={`display text-[1.65rem] tracking-[0.04em] md:text-[1.85rem] ${ink}`}>Silverback</span>
      <span className={`mt-0.5 text-[0.6rem] font-semibold tracking-[0.42em] uppercase ${sub}`}>
        Auto Detailing
      </span>
    </span>
  );
}
